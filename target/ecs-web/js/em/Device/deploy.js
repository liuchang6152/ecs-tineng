var addUrl=ECS.api.emUrl+"/Device/statusCfg";var getSingleUrl=ECS.api.emUrl+"/Device/getDevicestatusCfg/";var leng=1;var deviceID;var pageMode=PageModelEnum.NewAdd;window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){this.bindUI()},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#addNewStatus").click(function(){b.logic.formValidate();if(!$("#AddOrEditModal").valid()){return}if($("#firstValue").val()!=""){$(".statusList").append('<div class="row"><div class="col-xs-5"><div class="form-group"><div class="col-xs-12"><input type="text" name="value'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value=""/></div><span class="span-required">*</span></div></div><div class="col-xs-5"><div class="form-group"><div class="col-xs-12"><input type="text" name="dec'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="" /></div><span class="span-required">*</span></div></div><div class="col-xs-2"><button class="btn btn-danger delStatus" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');leng++}});$("#btnSave").click(function(){b.logic.save()});$("#btnClose,.btnClose").click(function(){window.pageLoadMode=PageLoadMode.None;b.logic.closeLayer(false)});$(".statusList").on("click",".delStatus",function(){leng--;$(this).closest(".row").remove()})},logic:{setData:function(c){pageMode=c.pageMode;$("#deviceName").val(c.deviceName);deviceID=c.deviceId;$.ajax({url:getSingleUrl+c.deviceId+"?now="+Math.random(),type:"get",async:true,dataType:"json",success:function(d){if(d.length>0){$("#firstValue").val(d[0].statusCfgValue);$("#statusValueDes").val(d[0].statusCfgValueDescription);for(var e=1;e<d.length;e++){$(".statusList").append('<div class="row"><div class="col-xs-5"><div class="form-group"><div class="col-xs-12"><input type="text" name="value'+e+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="'+d[e].statusCfgValue+'"/></div><span class="span-required">*</span></div></div><div class="col-xs-5"><div class="form-group"><div class="col-xs-12"><input type="text" name="dec'+e+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="'+d[e].statusCfgValueDescription+'" /></div><span class="span-required">*</span></div></div><div class="col-xs-2"><button class="btn btn-danger delStatus" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>')}leng=d.length}},error:function(d){var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})},save:function(){b.logic.formValidate();if(!$("#AddOrEditModal").valid()){return}var c=[];$(".statusList").find(".row").each(function(){if($(this).find("input").eq(0).val()){c.push({deviceID:deviceID,statusCfgValue:$(this).find("input").eq(0).val(),statusCfgValueDescription:$(this).find("input").eq(1).val()})}});$.ajax({url:addUrl,async:false,type:"PUT",data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){$("#btnSave").attr("disabled","disabled");ECS.showLoading()},success:function(d){ECS.hideLoading();if(d.indexOf("collection")<0){layer.msg("保存成功！",{time:1000},function(){b.logic.closeLayer(true)})}else{layer.msg(d.collection.error.message)}},error:function(d){$("#btnSave").attr("disabled",false);ECS.hideLoading();var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})},closeLayer:function(c){window.parent.pageLoadMode=window.pageLoadMode;parent.layer.close(a)},formValidate:function(){ECS.form.formValidate("AddOrEditModal",{rules:{deviceName:{required:true},firstValue:{required:true},statusValueDes:{required:true}}})}}};b.init();window.page=b});