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
                        url: getGisUrl+"/surface/type/"+value+"/alarm/"+id,
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
                              
                           var iframe_map = document.getElementById('iframe_map');
                               var ie_chrome = iframe_map.document;
                               if(ie_chrome == undefined){//firefox, chrome;
                                   iframe_map.contentWindow.postMessage(data, "*");
                               }else{//ie;
                                   iframe_map.postMessage(data, "*");
                               }
                          
                            },3000);
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
                    url: getGisUrl+"/surface/type/"+type+"/id/"+event.data[0].id,
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
                        var res = '';
						if (result.enterpriseName) {
							res += result.enterpriseName;
						}
						if (result.unitName) {
							res += '-' + result.unitName;
						}
						if (result.riskAreaName) {
							res += '-' + result.riskAreaName;
						}
						if (result.optlRiskZoneName) {
							res += '-' + result.optlRiskZoneName;
                        }
                        parent.page.data.param.enterpriseId =null;
						parent.page.data.param.unitId = null;
						parent.page.data.param.riskAreaId = null;
                        parent.page.data.param.optlRiskZoneId = null;
                        parent.page.data.param.res = null;
                        parent.page.data.param.type = null;
                        parent.page.data.param.gisid = null;

						parent.page.data.param.enterpriseId = result.enterpriseId;
						parent.page.data.param.unitId = result.unitId;
						parent.page.data.param.riskAreaId = result.riskAreaId;
                        parent.page.data.param.optlRiskZoneId = result.optlRiskZoneId;
                        parent.page.data.param.res = res;
                        parent.page.data.param.type = type;
                        parent.page.data.param.gisid = event.data[0].id;
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
                $("#iframe_map").attr("src",ECS.api.gisserver_url+"/GISQuery/index_ptquery.html?iframe=true&show_info=false&search=true&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));
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