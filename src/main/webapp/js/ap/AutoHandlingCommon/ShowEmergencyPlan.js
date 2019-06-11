var getSingleUrl = ECS.api.rttUrl + '/emergencyPlan/oneEmergencyPlan';//查看预案
var leftMenuUrl = ECS.api.rttUrl + "/structuredplancategory";  //左侧树接口
var searchUrl= ECS.api.rttUrl + "/emergencyduties";  //表格数据查询
var FileDownLoadUrl = ECS.api.rttUrl + "/structuredplanfile/downloadFile";   //下载接口
var isToggle = true;            //若为true,表示当前页面隐藏tab切换，启动按钮，隐藏应急职责部分；若为false, 则显示这些隐藏的东西；
var emergencyPlanID;
var structuredPlanCategoryId;
var Trigger_btn = true;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $("#btnSave").click(function () {
                if(Trigger_btn){
                    page.logic.closeLayer(PageLoadMode.Refresh);
                    $(this).addClass("btn-close");
                    $(this).removeClass("btn-delete");
                }else{
                    $(this).addClass("btn-close");
                    $(this).removeClass("btn-delete");
                }
            });
            //关闭
            $("#btnClose").click(function () {
                page.logic.closeLayer(PageLoadMode.None);
            });
            //当tab切换时，加载内容；
            $('#nav_tabs li').click(function () {
                var tab_index = $(this).index();    //tab标题的索引值
                $(".tab-content").find(".tab-pane").hide();
                $(".tab-content").find(".tab-pane").eq(tab_index).show();
                $(this).addClass("active").siblings().removeClass("active");
            });
            //侧边栏菜单添加点击,进行查询某一项相关联的数据
            mini.get("tree1").on("nodeselect", function (e){
                structuredPlanCategoryId=e.node.structuredPlanCategoryId;
                page.logic.initTable();
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                //是否显示启动按钮
                if(data.checkMode){
                    $("#btnSave").show();
                }else{
                    $("#btnSave").hide();
                    $(".check-zz").hide();
                }
                emergencyPlanID=data.emergencyPlanID;
                isToggle = data.isToggle?data.isToggle:false;   //页面模式设置；
                //若为只展示预案详情部分，那么如下操作：
                if(isToggle){
                    $("#nav_tabs").hide();    //隐藏tab切换；
                }else{
                    $("#nav_tabs").show();    //展示tab切换；
                }
                $.ajax({
                    url: getSingleUrl + "?emergencyPlanID=" + emergencyPlanID + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        $("#emergencyPlanName").text(data.emergencyPlanName);
                        $("#orgSname").text(data.orgSname);
                        $("#planDefinitionName").text(data.planDefinitionName);
                        $("#planLevelName").text(data.planLevelName);
                        $("#accidentCategoryName").text(data.accidentCategoryName);
                        $("#remark").text(data.remark);
                        $("#crtUserName").text(data.crtUserName);
                        //预案类型
                        if(data.accidentTypeEntity){
                            var accidentName=data.accidentTypeEntity[0].accidentTypeName;
                            if(data.accidentTypeEntity.length>0){
                                for(var w=1;w<data.accidentTypeEntity.length;w++){
                                    accidentName+=","+data.accidentTypeEntity[w].accidentTypeName;
                                }
                            }
                            $("#accidentTypeName").text(accidentName);
                        }
                        //附件的数据处理
                        if(data.attachmentEntities){
                            for(var n=0;n<data.attachmentEntities.length;n++){
                                $("#fileList").append(
                                    '<a class="col-xs-6" title="'+data.attachmentEntities[n].atchName+'" href="'+FileDownLoadUrl+'?atchPath='+data.attachmentEntities[n].atchPath+'&atchName='+data.attachmentEntities[n].atchName+'">'+data.attachmentEntities[n].atchName+'</a>'
                                )
                            }
                        }
                        $("#crtDate").text(ECS.util.timestampToTime(data.crtDate));
                        page.logic.load_sidebar();//左侧tree组件的数据加载
                        ECS.hideLoading();
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //侧边栏菜单添加
            load_sidebar:function(){
                $.ajax({
                    url: leftMenuUrl + "?emergencyPlanId="+emergencyPlanID,
                    type: "GET",
                    async:false,
                    timeout:5000,
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (Data) {
                        ECS.hideLoading();
                        if(Data.length>0){
                            //左侧菜单的数据填充
                            mini.get("tree1").loadList(Data, "structuredPlanCategoryId", "structuredPlanCategoryPid");
                            structuredPlanCategoryId=mini.get("tree1").data[0].structuredPlanCategoryId;
                            page.logic.initTable();//表格
                        }
                    },
                    error:function(err){
                        ECS.hideLoading();
                        if(err){
                            layer.msg(err,{
                                time: 1000
                            });
                        }
                    }
                });
            },
            //初始化表格
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({url:searchUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                grid.load();
            },
            //应急职责--责任人换行渲染；
            duty_list:function(e){
                if(e.row.dutyNames){
                    return e.row.dutyNames.replace(/\)\,/g,")<br/>");
                }else{
                    return "";
                }
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (pageLoadMode) {
                Trigger_btn = false;    //开关关闭
                window.parent.pageLoadMode = pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});