var delUrl = ECS.api.apUrl + '/AcceptWarningConfig';        //删除
var searchUrl = ECS.api.apUrl + '/AcceptWarningConfig';     //查询
var roleListOrg = ECS.api.bcUrl + '/org/gettorgName?orgLvl=3&isAll=true';//配置机构 二级单位
var roleListArea = ECS.api.bcUrl + '/riskArea/zmyRiskArea';//配置机构 安全风险区
var equalLvl = null;//合并级别
var initOrgID="";//进入页面时的企业id
var initOrgName="";//进入页面时的企业name
var baseDataID=null;//配置机构id
var baseModelCategory=null;//配置类型
var isAllTrue=true;
var orgCode="";
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //配置机构安全风险区
            mini.get("roleAreaName").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    isAllTrue=true;
                    baseModelCategory = "";
                    baseDataID = "";
                }else{
                    isAllTrue=false;
                }
            });
            mini.get("roleAreaName").on("nodeclick",function(e){
                if(e.node.orgId==null){
                    isAllTrue=true;
                }else{
                    if(e.node._level=="0"){
                        baseModelCategory = "2";
                        baseDataID = e.node.orgId;
                    }else if(e.node._level=="1"){
                        baseModelCategory = "3";
                        baseDataID = e.node.orgId;
                    }else if(e.node._level=="2"){
                        baseModelCategory = "4";
                        baseDataID = e.node.riskAreaID;
                    }
                    isAllTrue=false;
                }
            });
            //配置机构二级单位
            mini.get("roleOrgName").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    isAllTrue=true;
                    baseModelCategory = "";
                    baseDataID = "";
                }else{
                    isAllTrue=false;
                }
            });
            mini.get("roleOrgName").on("nodeclick",function(e){
                if(e.node.orgId=="-1"){
                    isAllTrue=true;
                }else{
                    if(e.node._level=="0"){
                        baseModelCategory = "2";
                        baseDataID = e.node.orgId;
                    }else if(e.node._level=="1"){
                        baseModelCategory = "3";
                        baseDataID = e.node.orgId;
                    }else if(e.node._level=="2"){
                        baseModelCategory = "4";
                        baseDataID = e.node.riskAreaID;
                    }
                    isAllTrue=false;
                }
            });
            //关闭
            $(".btnClose").click(function () {
                page.logic.closeLayer();
            });
            // 新增
            $('#btnAdd').click(function () {
                if(baseDataID){
                    page.logic.add();
                }else{
                    layer.msg("请选择配置机构！");
                }
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
             * 初始化编辑数据
             */
            setData: function (data) {
                pageMode = data.pageMode;
                orgCode=data.orgCode;
                initOrgID=data.orgID;
                equalLvl = data.equalLvl;
                initOrgName=data.orgName;
                page.logic.cbxroleOrgName(data.orgID,data.equalLvl);
                page.logic.initTable();
            },
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                grid.load({"orgId":initOrgID });
            },
            //显示编辑图标
            show_edit:function(e){
                return '<a title="编辑" href="javascript:window.page.logic.edit(\'' + e.row.baseDataName+'\','+e.row.baseModelCategory+','+e.row.baseDataID+')">编辑</a>';
            },
            //显示电话与ip
            show_ip:function(e){
                return "总数[ "+e.row.ipCount+" ]";
            },
            //显示人员
            show_user:function(e){
                return "接警[ "+e.row.jjCount+" ]  查看[ "+e.row.ckCount+" ]";
            },
            /**
             * 角色配置机构
             */
            cbxroleOrgName:function(pid,levId){
                switch(levId){
                    case 2:
                        baseModelCategory = "2";
                        baseDataID = initOrgID;
                        $("#orgId").attr("disabled",true);
                        $("#orgId").append('<option value="'+initOrgID+'" selected>'+initOrgName+'</option>');
                        $("#orgName").hide();
                        $("#areaName").hide();
                        break;
                    case 3:
                        $("#enterpriseId").hide();
                        $("#orgName").show();
                        $("#areaName").hide();
                        $.ajax({
                            url:roleListOrg+"&orgPID="+pid+"&isAll=true",
                            type:"get",
                            async:false,
                            success:function (data) {
                                mini.get("roleOrgName").loadList(data, "orgId", "orgPID");
                            }
                        });
                        break;
                    case 4:
                        $("#enterpriseId").hide();
                        $("#orgName").hide();
                        $("#areaName").show();
                        $.ajax({
                            url:roleListArea+"?orgID="+pid+"&isAll=true",
                            type:"get",
                            async:false,
                            success:function (data) {
                                mini.get("roleAreaName").loadList(data, "zid", "orgPID");
                            }
                        });
                        break;
                }
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var eceivShowList = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    eceivShowList.push({"baseModelCategory":el.baseModelCategory,"baseDataID":el.baseDataID });
                });
                if (eceivShowList.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: true,
                        data: JSON.stringify(eceivShowList),
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
                if(equalLvl==2){
                    page.logic.detail(pageMode,initOrgName,baseModelCategory,baseDataID);
                }else if(equalLvl==3){
                    page.logic.detail(pageMode,mini.get("roleOrgName").getSelectedNode().orgSname,baseModelCategory,baseDataID);
                }else{
                    page.logic.detail(pageMode,mini.get("roleAreaName").getSelectedNode().showStr,baseModelCategory,baseDataID);
                }
            },
            /**
             * 编辑
             * @param baseDataID
             */
            edit: function (initName,initModelCategory,initbaseDataID) {
                var pageMode = PageModelEnum.Edit;
                page.logic.detail(pageMode,initName,initModelCategory,initbaseDataID);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (pageMode,initName,initModelCategory,initbaseDataID) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['900px', '530px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AcceptWarningConfigEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "name": initName,
                            "baseModelCategory": initModelCategory,
                            "baseDataID": initbaseDataID,
                            "enterpriseID":initOrgID,
                            "orgCode":orgCode
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        page.logic.search();
                    }
                })
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function () {
                window.parent.pageLoadMode = PageLoadMode.Reload;
                parent.layer.close(index);
            },
            /**
             * 搜索
             */
            search: function () {
                if(isAllTrue){
                    grid.load({"orgId":initOrgID });
                    return;
                }
                grid.load({"baseDataID":baseDataID,"baseModelCategory":baseModelCategory});
            }
        }
    };
    page.init();
    window.page = page;
});