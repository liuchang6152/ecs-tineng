var delUrl = ECS.api.bcUrl + '/systemRegistersisPoint';
var searchUrl = ECS.api.bcUrl + '/systemRegistersisPoint';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var inUseUrl = ECS.api.commonUrl + "/getInUse";
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();//初始化miniui框架
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();                     //绑定事件
            $("#searchForm").find('input').val("");
            page.logic.initInUse();            //初始化查询是否启用
            page.logic.initTable();            //初始化表格
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
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
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                //企业
                page.logic.initOrgCode(enterpriseCodeUrl,$("#enterpriseCode"));
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.systemID);
            },
            /**
             * 企业
             */
            initOrgCode:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        mini.get("enterpriseCode").loadList(data, "orgId", "orgPID");
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            grid.load({"enterpriseCode":mini.get("enterpriseCode").data[0].orgCode});
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                        }else{
                            mini.get("enterpriseCode").disable();
                            grid.load({"enterpriseCode":ECS.sys.Context.SYS_ENTERPRISE_CODE});
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                    }
                                })(data[w]);
                            }
                        }
                        cb && cb();
                    }
                })
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.systemID);
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
                                layer.msg(result.collection.error.message)
                            }
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "外部系统注册新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param systemID
             */
            edit: function (systemID) {
                var pageMode = PageModelEnum.Edit;
                var title = "外部系统注册编辑";
                page.logic.detail(title, systemID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, systemID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '360px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SystemRegisterAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "systemID": systemID,
                            'title': title
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                ECS.sys.RefreshContextFromSYS();
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                //企业
                if(mini.get("enterpriseCode").getSelectedNode()){
                    page.data.param["enterpriseCode"] = mini.get("enterpriseCode").getSelectedNode().orgCode;
                }else{
                    //取默认存储的值；
                    page.data.param["enterpriseCode"] = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                }
                grid.load(page.data.param);
            },
            /**
             * 初始化查询inUse
             */
            initInUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: "-1",
                    data: {
                        'isAll': true
                    }
                }, null);
            }
        }
    };
    page.init();
    window.page = page;
});