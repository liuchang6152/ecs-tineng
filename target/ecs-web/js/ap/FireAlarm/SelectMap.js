var getGisUrl=ECS.api.gisSurfaceUrl;var pageMode=PageModelEnum.NewAdd;window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){this.bindUI();ECS.sys.RefreshContextFromSYS();b.logic.getGisValue()},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$(".btnClose").click(function(){window.pageLoadMode=PageLoadMode.None;b.logic.closeLayer(false)})},data:{},logic:{getList:function(d,e,c){if(e){$.ajax({url:getGisUrl+"/surface/type/"+d+"/alarm/"+e,async:true,type:"get",dataType:"json",success:function(g){if(g.length>0){var f=[];for(var h=0;h<g.length;h++){f.push(g[h].gisSurfaceId)}var i={layerName:c,id:f.join(",")}}else{var i={layerName:"",id:""}}setTimeout(function(){var k=document.getElementById("iframe_map");var j=k.document;if(j==undefined){k.contentWindow.postMessage(i,"*")}else{k.postMessage(i,"*")}},3000)},error:function(f){ECS.hideLoading();var g=$.parseJSON(f.responseText);layer.msg(g.collection.error.message)}})}},getGisValue:function(){if(window.addEventListener){window.addEventListener("message",b.logic.handleMessage,false)}else{window.attachEvent("onmessage",b.logic.handleMessage)}},handleMessage:function(d){d=d||window.event;var c="";if(d.data.length>0){switch(d.data[0].layerName){case"企业":c=2;break;case"二级单位":c=3;break;case"安全风险区":c=4;break;case"作业风险区":c=5;break;default:c=""}}else{return false}$.ajax({url:getGisUrl+"/surface/type/"+c+"/id/"+d.data[0].id,async:true,type:"get",dataType:"json",beforeSend:function(){ECS.showLoading()},success:function(e){ECS.hideLoading();if(!e.enterpriseId){layer.msg("您当前选择的地址不合法，请重新选择");return false}var f="";if(e.enterpriseName){f+=e.enterpriseName}if(e.unitName){f+="-"+e.unitName}if(e.riskAreaName){f+="-"+e.riskAreaName}if(e.optlRiskZoneName){f+="-"+e.optlRiskZoneName}parent.page.data.param.enterpriseId=null;parent.page.data.param.unitId=null;parent.page.data.param.riskAreaId=null;parent.page.data.param.optlRiskZoneId=null;parent.page.data.param.res=null;parent.page.data.param.enterpriseId=e.enterpriseId;parent.page.data.param.unitId=e.unitId;parent.page.data.param.riskAreaId=e.riskAreaId;parent.page.data.param.optlRiskZoneId=e.optlRiskZoneId;parent.page.data.param.res=f;b.logic.closeLayer(true)},error:function(e){ECS.hideLoading();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},setData:function(c){$("#title-main").text(c.title);pageMode=c.pageMode;if(pageMode==PageModelEnum.NewAdd){return}ECS.sys.RefreshContextFromSYS();$("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_ZJDXGIS/index_ptquery.html?iframe=true&show_info=false&search=true&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));if(c.optlRiskSoneId){b.logic.getList("5",c.optlRiskSoneId,"作业风险区")}else{if(c.riskAreaId){b.logic.getList("4",c.riskAreaId,"安全风险区")}else{if(c.drtDeptId){b.logic.getList("3",c.drtDeptId,"二级单位")}else{if(c.enterpriseId){b.logic.getList("2",c.enterpriseId,"企业")}}}}},closeLayer:function(c){window.parent.pageLoadMode=window.pageLoadMode;parent.layer.close(a)}}};b.init();window.page=b});