var delUrl = ECS.api.apUrl + '/RuleConfig';        //删除
var searchUrl = ECS.api.apUrl + '/RuleConfig';     //查询
var orgNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';  //企业名称
var grid = null;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            //获取用户的相关数据
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();
            page.logic.initTable();//初始化表格
            page.logic.cbxOrgName();//企业名称
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });

        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            //显示编辑图标
            show_edit:function(e){
                return '<a title="编辑" href="javascript:window.page.logic.edit(' + e.row.ruleConfigID+')">编辑</a> | '+
                    '<a title="配置接警单元" href="javascript:window.page.logic.deploy('+e.row.enterpriseID +","+e.row.equalLvl+',\'' + e.row.enterpriseName+'\')">配置接警单元</a>';
            },
            //接警单元
            baseName:function(e){
                return "总数[ "+e.row.jjCount+" ]";
            },
            //企业名称
            cbxOrgName:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("orgId", orgNameUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname",
                        async:false,
                    }, null);
                    $("#orgId").attr("disabled",false);
                }else{
                    ECS.ui.getCombobox("orgId", orgNameUrl, {
                        selectValue:ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async:false,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname"
                    }, null);
                    $("#orgId").attr("disabled",true);
                }
            },

            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.ruleConfigID);
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: true,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        beforeSend: function () {
                            layer.closeAll();
                            ECS.showLoading();
                        },
                        success: function (result) {
                            ECS.hideLoading();
                            if (result.indexOf('collection') < 0) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    grid.reload({pageIndex:0});
                                });
                            } else {
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message);
                            }
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index);
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "基础配置新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param ruleConfigID
             */
            edit: function (ruleConfigID) {
                var pageMode = PageModelEnum.Edit;
                var title = "基础配置编辑";
                page.logic.detail(title, ruleConfigID,pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, ruleConfigID,pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['400px', '300px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AcceptWarningConfigAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "ruleConfigID": ruleConfigID,
                            'title': title
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search();
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            //配置接警单元
            deploy:function(enterpriseID,equalLvl,enterpriseName) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['900px', '580px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'deployIndex.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "orgID": enterpriseID,
                            "equalLvl":equalLvl,
                            "orgName":enterpriseName,
                            "orgCode":$("#orgId").val()
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search();
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 搜索
             */
            search: function () {
                //加载列表
                grid.load({"orgId":$("#orgId").find("option:selected").attr("code")});
            }
        }
    };
    page.init();
    window.page = page;
});