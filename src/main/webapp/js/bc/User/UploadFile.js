var importUrl = ECS.api.bcUrl + '/user/importExcel';        //附件上传
var exportUrl = ECS.api.bcUrl + '/user/ExportExcel';        //附件导出

var pageMode = PageModelEnum.Details;
window.pageLoadMode = PageLoadMode.None;
var mini;
var uploader;

$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引


    
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.upload();
        },
        table: {},
        data: {
            param: {}
        },

        bindUI: function () {
            $('#btnSave').click(function () {
                if (uploader.files.length >0) {
                    uploader.start();
                }
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);    
            });
        },
        //定义业务逻辑方法
        logic: {
            //导入列表数据；
            setData: function (data) {
                $('#title-main').text(data.title);
               
            },
            

            start :function(){
                
            },
            /**
             * 导入数据
             */
            upload: function() {
                 uploader = new plupload.Uploader({
                    browse_button : 'upload_btn',      //上传按钮
                    drop_element:'upload_box',         //拖拽的区域
                    url : importUrl,
                    multipart_params:{
                    
                    },filters: {
                        mime_types : [ //只允许上传图片和zip文件

                          { title : "EXcel", extensions : "xls,xlsx" }
                        ],
                        max_file_size : '40000kb', //最大只能上传400kb的文件
                        prevent_duplicates : true //不允许选取重复文件
                      }
                });
                uploader.init();
                uploader.bind('FilesAdded',function(uploader,files){
                    if(files[0].name.length > 50) {
                        uploader.removeFile(files[0]);
                        layer.msg("文件名称不能超过50个字符！");
                        return;
                    }
                    if (files[0].size >10485760) {
                        uploader.removeFile(files[0]);
                        layer.msg("文件大小不能超过10MB！");
                        return;
                    }
                    $("#fileName").text("文件名："+files[0].name);
                   
                });
                uploader.bind('UploadProgress',function(uploader,file){
                    var percent = file.percent;
                    ECS.util.show_percent(percent);     //展示进度条
                    if(percent==100){
                        ECS.util.hide_percent();    //隐藏进度条
                    }
                });
                uploader.bind('FileUploaded', function(uploader, file, responseObject) {
                    var result=JSON.parse(responseObject.response);
                    var errorMsg="";
                    ECS.util.hide_percent();    //隐藏进度条
                    if (result.isSuccess) {
                        layer.msg("上传成功！", {
                            time: 1000
                        }, function() {
                            page.logic.closeLayer(false);
                        });
                    } else {
                        layer.msg(result.message);
                        page.logic.closeLayer(true);
                    }
                });
            },
           
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                window.parent.pageflag = isRefresh;
                parent.layer.close(index);
            },
            ExportExcel:function(){
                var url =exportUrl;
                var form = $("<form>"); //定义一个form表单
                form.attr("style", "display:none");
                form.attr("target", "");
                form.attr("method", "get");
                form.attr("action", url);
                var input1 = $("<input>");
                input1.attr("type", "hidden");
                input1.attr("name", "exportData");
                input1.attr("value", (new Date()).getMilliseconds());
                $("body").append(form); //将表单放置在web中
                form.append(input1);
    
                form.submit(); //表单提交
    
                var timeoutID = setInterval(function() {
                    if (window.document.readyState != "loading") {
                        try {
                            clearTimeout(timeoutID);
                       
                        } catch(e) {
    
                        }
                    }
                }, 3000);
            }
        }
    };
    page.init();
    window.page = page;
});