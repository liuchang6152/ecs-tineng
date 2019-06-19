var getGisUrl = ECS.api.gisSurfaceUrl;                  //gis交互接口
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            this.bindUI();                   //绑定事件
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.getGisValue();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //点击关闭按钮，关闭弹框；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        data:{},
        logic: {
            //初始化定位gis
            getList:function(value,id,name){
                if(id){
                    $.ajax({
                        url: getGisUrl + "/surface/type/" + value + "/alarm/" + id,
                        async: true,
                        type: "get",
                        dataType: "json",
                        success: function (result) {
                            if(result.length>0){
                                var aId_list = [];
                                for(var w=0;w<result.length;w++){
                                    aId_list.push(result[w].gisSurfaceId);
                                }
                                var data = {"layerName":name,"id":aId_list.join(",")};
                            }else{
                                var data = {"layerName":"","id":""};
                            }
                           setTimeout(function(){
                                // var ie_chrome = iframe_map.document;
                                // if(ie_chrome == undefined){
                                //     iframe_map.contentWindow.postMessage(data, "*");
                                // }else{
                                //     iframe_map.postMessage(data, "*");
                                // }
                               var ie_chrome = document.getElementById('iframe_map').document;
                               if(ie_chrome == undefined){//firefox, chrome;
                                   document.getElementById('iframe_map').contentWindow.postMessage(data, "*");
                               }else{//ie;
                                   document.getElementById('iframe_map').postMessage(data, "*");
                               }
                            },2000);
                        }, error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }
            },
            //点击gis传值出来
            getGisValue:function(){
                if(window.addEventListener){
                    window.addEventListener("message", page.logic.handleMessage, false);
                }else{
                    window.attachEvent("onmessage", page.logic.handleMessage);
                }
            },
            handleMessage:function(event){
                event = event || window.event;
                var type="";
                if(event.data.length>0){
                    switch(event.data[0].layerName){
                        case "企业":
                            type=2;
                            break;
                        case "二级单位":
                            type=3;
                            break;
                        case "安全风险区":
                            type=4;
                            break;
                        case "作业风险区":
                            type=5;
                            break;
                        default:
                            type="";
                    }
                }else{
                    return false;
                }
                $.ajax({
                    url: getGisUrl + "/surface/type/" + type + "/id/" + event.data[0].id,
                    async: true,
                    type: "get",
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if(!result.enterpriseId){
                            layer.msg("您当前选择的地址不合法，请重新选择");
                            return false;
                        }
                        var addInfo="";
                        if(result.enterpriseName){
                            addInfo+=result.enterpriseName?result.enterpriseName:"";
                        }
                        if(result.unitName){
                            addInfo+=result.unitName?result.unitName:"";
                        }
                        if(result.riskAreaName){
                            addInfo+=result.riskAreaName?result.riskAreaName:"";
                        }
                        if(result.optlRiskZoneName){
                            addInfo+=result.optlRiskZoneName?result.optlRiskZoneName:"";
                        }
                        //初始化设置变量1
                        parent.enterpriseId=null;                    /*企业ID*/
                        parent.drtDeptId=null;                       /*二级单位ID*/
                        parent.riskAreaId=null;                      /*安全风险区ID*/
                        parent.optlRiskSoneId=null;                 /*作业风险区ID*/
                        parent.riskAnlsObjId=null;                  /*风险分析对象ID*/
                        parent.pointId=null;                         /*风险分析点ID*/

                        parent.enterpriseId=result.enterpriseId;                    /*企业ID*/
                        parent.drtDeptId=result.unitId;                               /*二级单位ID*/
                        parent.riskAreaId=result.riskAreaId;                         /*安全风险区ID*/
                        parent.optlRiskSoneId=result.optlRiskZoneId;                 /*作业风险区ID*/
                        parent.riskAnlsObjId="";                                     /*风险分析对象ID*/
                        parent.pointId="";                                            /*风险分析点ID*/
                        parent.gisSurfaceId=result.gisSurfaceId;
                        parent.gisType=result.type;
                        parent.map_posi = addInfo;
                        page.logic.closeLayer(true);

                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                //若是新增模式下
                if (pageMode == PageModelEnum.NewAdd) {
                    return;
                }
                ECS.sys.RefreshContextFromSYS();        //用户登录
                //地图链接设置
                $("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_zjdxgis/index_ptquery.html?iframe=true&show_info=false&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));
                //初始化选定gis
                if(data.optlRiskSoneId){
                    page.logic.getList("5",data.optlRiskSoneId,"作业风险区");
                }else if(data.riskAreaId){
                    page.logic.getList("4",data.riskAreaId,"安全风险区");
                }else if(data.drtDeptId){
                    page.logic.getList("3",data.drtDeptId,"二级单位");
                }else if(data.enterpriseId){
                    page.logic.getList("2",data.enterpriseId,"企业");
                }
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})