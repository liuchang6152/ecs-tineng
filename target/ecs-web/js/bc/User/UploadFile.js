var importUrl=ECS.api.bcUrl+"/user/importExcel";var exportUrl=ECS.api.bcUrl+"/user/ExportExcel";var pageMode=PageModelEnum.Details;window.pageLoadMode=PageLoadMode.None;var mini;var uploader;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){mini.parse();this.bindUI();ECS.sys.RefreshContextFromSYS();b.logic.upload()},table:{},data:{param:{}},bindUI:function(){$("#btnSave").click(function(){if(uploader.files.length>0){uploader.start()}});$(".btnClose").click(function(){window.pageLoadMode=PageLoadMode.None;b.logic.closeLayer(false)})},logic:{setData:function(c){$("#title-main").text(c.title)},start:function(){},upload:function(){uploader=new plupload.Uploader({browse_button:"upload_btn",drop_element:"upload_box",url:importUrl,multipart_params:{},filters:{mime_types:[{title:"EXcel",extensions:"xls,xlsx"}],max_file_size:"40000kb",prevent_duplicates:true}});uploader.init();uploader.bind("FilesAdded",function(d,c){if(c[0].name.length>50){d.removeFile(c[0]);layer.msg("文件名称不能超过50个字符！");return}if(c[0].size>10485760){d.removeFile(c[0]);layer.msg("文件大小不能超过10MB！");return}$("#fileName").text("文件名："+c[0].name)});uploader.bind("UploadProgress",function(e,c){var d=c.percent;ECS.util.show_percent(d);if(d==100){ECS.util.hide_percent()}});uploader.bind("FileUploaded",function(g,e,d){var c=JSON.parse(d.response);var f="";ECS.util.hide_percent();if(c.isSuccess){layer.msg("上传成功！",{time:1000},function(){b.logic.closeLayer(false)})}else{layer.msg(c.message);b.logic.closeLayer(true)}})},closeLayer:function(c){window.parent.pageLoadMode=window.pageLoadMode;window.parent.pageflag=c;parent.layer.close(a)},ExportExcel:function(){var d=exportUrl;var e=$("<form>");e.attr("style","display:none");e.attr("target","");e.attr("method","get");e.attr("action",d);var c=$("<input>");c.attr("type","hidden");c.attr("name","exportData");c.attr("value",(new Date()).getMilliseconds());$("body").append(e);e.append(c);e.submit();var f=setInterval(function(){if(window.document.readyState!="loading"){try{clearTimeout(f)}catch(g){}}},3000)}}};b.init();window.page=b});