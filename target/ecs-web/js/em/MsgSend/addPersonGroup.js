$(function(){var a=parent.layer.getFrameIndex(window.name);var b={addPersonGroup:ECS.api.emUrl+"/CommonGroupOwer",init:function(){mini.parse();this.bindUI()},bindUI:function(){$(".btnClose").click(function(){b.logic.closeLayer(false)});$("#btnSave").click(function(){b.logic.savePersonGroup()})},data:{param:{}},logic:{setData:function(c){b.data.param.personIds=c.personIds;b.data.param.personGroupArr=mini.clone(c.personGroupArr);$("#title-main").text(c.title)},saveGroup:function(){var c={personIds:b.data.param.personIds,commonGroupName:$.trim($("#personGroup").val())};$.ajax({url:b.addPersonGroup,async:false,type:"post",data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",beforeSend:function(){$("#btnSave").attr("disabled","disabled");ECS.showLoading()},success:function(d){ECS.hideLoading();if(d.indexOf("collection")<0){layer.msg("保存成功！",{time:1000},function(){window.parent.page.logic.initData();b.logic.closeLayer(true)})}else{layer.msg(d.collection.error.message)}},error:function(d){$("#btnSave").attr("disabled",false);ECS.hideLoading();var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})},savePersonGroup:function(){b.logic.formValidate();if(!$("#form").valid()){return}var d=false;for(var e=0,c=b.data.param.personGroupArr.length;e<c;e++){if($.trim($("#personGroup").val())==b.data.param.personGroupArr[e].groupName.replace(/\(.+\)/,"")){d=true;break}}if(d){layer.msg("个人通讯组名称已存在，仍然要添加吗？",{time:0,btn:["确定","取消"],yes:function(f){layer.close(f);b.logic.saveGroup()}})}else{b.logic.saveGroup()}},closeLayer:function(c){parent.layer.close(a)},formValidate:function(){ECS.form.formValidate("form",{rules:{personGroup:{required:true}}})}}};b.init();window.page=b});