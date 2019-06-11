var addUrl=ECS.api.apUrl+"/DirectAlarm";var getSinglesUrl=ECS.api.apUrl+"/AutomaticMonitoring";var accptUrl=ECS.api.apUrl+"/DirectAlarm/mobileEvent";var riskRankUrl=ECS.api.bcUrl+"/riskRank/getListRiskRank?inUse=1";var eventLvlIdUrl=ECS.api.apUrl+"/DirectAlarm/eventLvl";var accCategoryUrl=ECS.api.bcUrl+"/accidentCategory/list";var accTypeUrl=ECS.api.bcUrl+"/accidentCategory/accidentType";var keyWordUrl=ECS.api.apUrl+"/AutomaticMonitoring/getKeywordReList?keyWordreCode=AP_AC_FAE_R";var getGisUrl=ECS.api.gisSurfaceUrl;var gisenterpriseId="";var gisdrtDeptId="";var gisoptlRiskZoneId="";var initeventId="";var gisriskAreaId="";var gisriskAnlsObjId="";var gispointId="";var cancelReason="";var curIP="";var addSum="";var alarmNum="";var answerNum="";window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){this.bindUI();mini.parse();b.logic.cbxRiskRank();b.logic.cbxAccidentCategory();b.logic.cbxKeyWord();b.logic.getGisValue()},table:{},bindUI:function(){$("#btnAccept").click(function(){window.parent.page.logic.answer();$("#mobileOrPhone").val(alarmNum);var c={};c.mobileOrPhone=alarmNum;c.seatIp=curIP;$.ajax({url:accptUrl+"?now="+Math.random(),async:false,type:"POST",data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){ECS.showLoading()},success:function(d){d=JSON.parse(d);initeventId=d.result.eventId;$("#btnAccept").attr("disabled",true);$("#btnCancle").attr("disabled",false);$("#btnAlarm").attr("disabled",false);ECS.hideLoading()},error:function(d){ECS.hideLoading();var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})});$("#infoList").hover(function(){$("#nav_submenu").css("display","table").stop()},function(){$("#nav_submenu").stop().hide()});$("#nav_submenu").on("click","li",function(){var c=$("#information").val();$("#information").val(c+$(this).attr("title")+"  ")});$(document).on("change","#eventLvlId",function(){var c=$("#eventLvlId").find("option:selected").attr("code");layer.confirm("你确认事故等级是"+c+"吗？",{btn:["确定","取消"]},function(d){layer.close(d);b.logic.cbxInfo()},function(){$("#eventLvlId").val("7")})});$("#casualtyCount").blur(function(){this.value=this.value.replace(/\D/g,"");if(this.value){layer.confirm("你确认人员受伤是"+this.value+"人吗？",{btn:["确定","取消"]},function(c){layer.close(c)},function(){$("#casualtyCount").val("")})}});$("#dieCount").blur(function(){this.value=this.value.replace(/\D/g,"");if(this.value){layer.confirm("你确认人员死亡是"+this.value+"人吗？",{btn:["确定","取消"]},function(c){layer.close(c)},function(){$("#dieCount").val("")})}});$("#propertyLossCount").blur(function(){this.value=this.value.replace(/\D/g,"");if(this.value){layer.confirm("您确定财产损失是"+this.value+"万元吗？",{btn:["确定","取消"]},function(c){layer.close(c)},function(){$("#propertyLossCount").val("")})}});$("#btnAlarm").click(function(){b.logic.save("")});$("#btnCancle").click(function(){layer.open({type:2,closeBtn:0,area:["500px","300px"],skin:"new-class",title:false,shadeClose:false,content:"../AutomaticMonitoring/ReasonCancellation.html?"+Math.random(),success:function(d,e){var c=layer.getChildFrame("body",e);var g=window[d.find("iframe")[0]["name"]];var f={title:"取消原因"};g.page.logic.setData(f)},end:function(){if(cancelReason){b.logic.save("1")}}})});$("#eventAddress").blur(function(){addSum=$("#eventAddress").val();b.logic.cbxInfo()})},data:{param:{}},logic:{setData:function(c){ECS.sys.RefreshContextFromSYS();$("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_zjdxgis/index_ptquery.html?iframe=true&show_info=false&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));curIP=c.curIP;alarmNum=c.alarmNum;answerNum=c.answerNum;b.logic.cbxEventLvl();if(c.mode){$("#btnAccept").attr("disabled",true);$("#btnCancle").attr("disabled",false);$("#btnAlarm").attr("disabled",false);initeventId=c.eventId;$("#mobileOrPhone").val(alarmNum);$.ajax({url:getSinglesUrl+"?eventId="+initeventId,type:"get",async:true,dataType:"json",success:function(d){gisenterpriseId=d.enterpriseId;gisdrtDeptId=d.drtDeptId;gisriskAreaId=d.riskAreaId;gisoptlRiskZoneId=d.optlRiskSoneId;gisriskAnlsObjId=d.riskAnlsObjId;gispointId=d.pointId;addSum=d.eventAddress;if(d.eventAddress){$("#eventAddress").attr("readonly",false)}else{$("#eventAddress").attr("readonly",true)}ECS.form.setData("AddOrEditModal",d);if(gisoptlRiskZoneId){b.logic.getList("4",gisoptlRiskZoneId,"作业风险区")}else{if(gisriskAreaId){b.logic.getList("3",gisriskAreaId,"安全风险区")}else{if(gisdrtDeptId){b.logic.getList("2",gisdrtDeptId,"二级单位")}else{if(gisenterpriseId){b.logic.getList("1",gisenterpriseId,"企业")}}}}},error:function(d){var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})}},cbxRiskRank:function(){ECS.ui.getCombobox("riskRankId",riskRankUrl+"&enterpriseCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,{selectValue:"-1",keyField:"riskRankID",valueField:"rankDisplay",async:false},null)},cbxEventLvl:function(){ECS.ui.getCombobox("eventLvlId",eventLvlIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,{selectValue:"7",keyField:"eventLvlId",valueField:"eventLvlName",codeField:"eventLvlName",async:false},null)},cbxInfo:function(){var i=new Date;var j=i.getFullYear();var e=i.getMonth()+1;var f=i.getDate()<10?"0"+i.getDate():i.getDate();var k=i.getHours()<10?"0"+i.getHours():i.getHours();var g=i.getMinutes()<10?"0"+i.getMinutes():i.getMinutes();var d=i.getSeconds()<10?"0"+i.getSeconds():i.getSeconds();if(e<10){e="0"+e}var c="";var h="";var l=$("#eventLvlId option:selected").text();if($("#accidentCategoryId").val()=="-1"){c=""}else{c=$("#accidentCategoryId option:selected").text()}if($("#accidentTypeId").val()=="-1"){h=""}else{h=$("#accidentTypeId option:selected").text()}if(addSum==null){addSum=""}$("#eventSummary").val("接警信息："+j+"年"+e+"月"+f+"日 "+k+":"+g+":"+d+"  "+addSum+l+c+h)},cbxKeyWord:function(){$.ajax({url:keyWordUrl,type:"get",dataType:"json",success:function(c){if(c.length>0){for(var d=0;d<c.length;d++){$("#nav_submenu").append("<li title='"+c[d].keyWordreExplain+"'>"+c[d].keyWord+"</li>")}}},error:function(c){var d=$.parseJSON(c.responseText);layer.msg(d.collection.error.message)}})},cbxAccidentCategory:function(){ECS.ui.getCombobox("accidentCategoryId",accCategoryUrl,{selectValue:"-1",keyField:"accidentCategoryID",valueField:"accidentCategoryName",async:false},null,b.logic.cbxAccidentType)},cbxAccidentType:function(c){ECS.ui.getCombobox("accidentTypeId",accTypeUrl,{selectValue:"-1",keyField:"accidentTypeID",valueField:"accidentTypeName",async:false,data:{accidentCategoryID:c}},null,b.logic.cbxInfo);b.logic.cbxInfo()},getList:function(d,e,c){if(e){$.ajax({url:getGisUrl+"/surface/type/"+d+"/alarm/"+e+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE,async:false,type:"get",dataType:"json",success:function(f){if(f.length>0){var g={layerName:c,id:f[0].gisSurfaceId}}else{var g={layerName:"",id:""}}setTimeout(function(){var i=document.getElementById("iframe_map");var h=i.document;if(h==undefined){i.contentWindow.postMessage(g,"*")}else{i.postMessage(g,"*")}},5000)},error:function(f){ECS.hideLoading();var g=$.parseJSON(f.responseText);layer.msg(g.collection.error.message)}})}},getGisValue:function(){if(window.addEventListener){window.addEventListener("message",b.logic.handleMessage,false)}else{window.attachEvent("onmessage",b.logic.handleMessage)}},handleMessage:function(d){d=d||window.event;var c="";switch(d.data[0].layerName){case"企业":c=2;break;case"二级单位":c=3;break;case"安全风险区":c=4;break;case"作业风险区":c=5;break;default:c=""}$.ajax({url:getGisUrl+"/type/"+c+"/id/"+d.data[0].id+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE,async:true,type:"get",dataType:"json",beforeSend:function(){ECS.showLoading()},success:function(f){var e="";addSum="";if(f.enterpriseName){e+=f.enterpriseName}if(f.unitName){e+=f.unitName;addSum+=f.unitName}if(f.riskAreaName){e+=f.riskAreaName;addSum+=f.riskAreaName}if(f.optlRiskZoneName){e+=f.optlRiskZoneName;addSum+=f.optlRiskZoneName}gisenterpriseId=f.enterpriseId;gisdrtDeptId=f.unitId;gisriskAreaId=f.riskAreaId;gisoptlRiskZoneId=f.optlRiskZoneId;gisriskAnlsObjId="";gispointId="";$("#eventAddress").val(e);if(e){$("#eventAddress").attr("readonly",false)}else{$("#eventAddress").attr("readonly",true)}b.logic.cbxInfo();ECS.hideLoading()},error:function(e){ECS.hideLoading();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},save:function(c){if($("#riskRankId").val()=="-1"){$("#riskRankId").val("")}if($("#accidentCategoryId").val()=="-1"){$("#accidentCategoryId").val("")}if($("#accidentTypeId").val()=="-1"){$("#accidentTypeId").val("")}if(c!=1){b.logic.formValidate();if(!$("#AddOrEditModal").valid()){return}}var e=ECS.form.getData("AddOrEditModal");e.eventId=initeventId;e.enterpriseId=gisenterpriseId;e.drtDeptId=gisdrtDeptId;e.riskAreaId=gisriskAreaId;e.optlRiskSoneId=gisoptlRiskZoneId;e.riskAnlsObjId=gisriskAnlsObjId;e.pointId=gispointId;e.alarmTelStatus="2";e.eventType="0";e.eventSource="1";e.isDelete="0";e.sortNum="1";e.pushStatus="1";e.seatIp=curIP;e.eventSummary+=e.information;var f=[];var d=[];if($("#casualtyCount").val()){f.push({eventId:initeventId,casualtyTypeCode:"AP_AC_WOUNDED",casualtyCount:$("#casualtyCount").val(),sortNum:"1",casualtyDiscription:"受伤",isDelete:"0"})}if($("#dieCount").val()){f.push({eventId:initeventId,casualtyTypeCode:"AP_AC_DEATH",casualtyCount:$("#dieCount").val(),sortNum:"1",casualtyDiscription:"死亡",isDelete:"0"})}e.casualtyEntityList=f;if($("#propertyLossCount").val()){d.push({eventId:initeventId,propertyLossTypeCode:"AP_AC_OTHER",propertyLossMoney:$("#propertyLossCount").val(),sortNum:"1",propertyLossDiscription:"财产损失",isDelete:"0"})}e.propertyLossEntityList=d;delete e.casualtyCount;delete e.dieCount;delete e.propertyLossCount;delete e.information;if(c=="1"){e.alarmTelStatus="1";e.eventSummary+=cancelReason;e.cancelReason=cancelReason;$.ajax({url:addUrl,async:false,type:"PUT",data:JSON.stringify(e),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){ECS.showLoading()},success:function(g){parent.hasArlamId={eventId:initeventId,ip:curIP,isAlram:false};parent.layer.close(a);ECS.hideLoading()},error:function(g){ECS.hideLoading();var h=$.parseJSON(g.responseText);layer.msg(h.collection.error.message)}});return}$.ajax({url:addUrl,async:false,type:"PUT",data:JSON.stringify(e),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){ECS.showLoading()},success:function(g){g=JSON.parse(g);parent.hasArlamId={eventId:initeventId,ip:curIP,isAlram:true};parent.layer.close(a);ECS.hideLoading()},error:function(g){ECS.hideLoading();var h=$.parseJSON(g.responseText);layer.msg(h.collection.error.message)}})},formValidate:function(){ECS.form.formValidate("AddOrEditModal",{ignore:"",rules:{riskRankId:{required:true},mobileOrPhone:{required:true},accidentCategoryId:{required:true},accidentTypeId:{required:true},eventAddress:{required:true},alertsPersonInfo:{required:true}}})}}};b.init();window.page=b});