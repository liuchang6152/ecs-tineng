var addUrl=ECS.api.apUrl+"/RuleConfig";var getSingleUrl=ECS.api.apUrl+"/RuleConfig/";var riskAreaTypeNameUrl=ECS.api.bcUrl+"/org/porgName?orgLvl=2";var pageMode=PageModelEnum.NewAdd;window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){mini.parse();this.bindUI()},bindUI:function(){$("#btnSave").click(function(){b.logic.save()});$(".btnClose").click(function(){window.pageLoadMode=PageLoadMode.None;b.logic.closeLayer(false)})},logic:{setData:function(c){ECS.sys.RefreshContextFromSYS();$("#title-main").text(c.title);pageMode=c.pageMode;if(pageMode==PageModelEnum.NewAdd){$("#equalLvl").find("option[value='2']").attr("selected",true);$("#pushType").find("option[value='1']").attr("selected",true);b.logic.cbxenterpriseID(ECS.sys.Context.SYS_ENTERPRISE_CODE);return}$("#equalLvl").attr("disabled",true);$.ajax({url:getSingleUrl+c.ruleConfigID+"?now="+Math.random(),type:"get",dataType:"json",beforeSend:function(){ECS.showLoading()},success:function(d){b.logic.cbxenterpriseID(d.enterpriseCode);$("#enterpriseID").attr("disabled","disabled");$("#equalLvl").find("option[value="+d.equalLvl+"]").attr("selected",true);$("#pushType").find("option[value="+d.pushType+"]").attr("selected",true);$("#ruleConfigID").val(d.ruleConfigID);ECS.hideLoading()},error:function(d){ECS.hideLoading();var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})},cbxenterpriseID:function(c){if(ECS.sys.isHQ(c)){ECS.ui.getCombobox("enterpriseID",riskAreaTypeNameUrl,{selectFirstRecord:true,keyField:"orgCode",codeField:"orgId",valueField:"orgSname",async:false})}else{ECS.ui.getCombobox("enterpriseID",riskAreaTypeNameUrl,{selectValue:c,keyField:"orgCode",codeField:"orgId",valueField:"orgSname",async:false});$("#enterpriseID").attr("disabled",true)}},save:function(){b.logic.formValidate();if(!$("#AddOrEditModal").valid()){return}var c=ECS.form.getData("AddOrEditModal");c.enterpriseID=$("#enterpriseID option:selected").attr("code");var d="POST";if(pageMode==PageModelEnum.NewAdd){window.pageLoadMode=PageLoadMode.Reload}else{if(pageMode==PageModelEnum.Edit){d="PUT";window.pageLoadMode=PageLoadMode.Refresh}}$.ajax({url:addUrl,async:false,type:d,data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){$("#btnSave").attr("disabled","disabled");ECS.showLoading()},success:function(e){ECS.hideLoading();if(e.indexOf("collection")<0){layer.msg("保存成功！",{time:1000},function(){b.logic.closeLayer(true)})}else{layer.msg(e.collection.error.message)}},error:function(e){$("#btnSave").attr("disabled",false);ECS.hideLoading();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},closeLayer:function(c){window.parent.pageLoadMode=window.pageLoadMode;parent.layer.close(a)},formValidate:function(){ECS.form.formValidate("AddOrEditModal",{rules:{enterpriseID:{required:true},equalLvl:{required:true},pushType:{required:true}}})}}};b.init();window.page=b});