var importUrl ;        //附件上传
var exportUrl ;        //附件导出
var confirmUrl;     //确认导入

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
            ECS.sys.RefreshContextFromSYS();
        
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
                page.logic.closeLayer(true);    
            });
        },
        //定义业务逻辑方法
        logic: {
            //导入列表数据；
            setData: function (data) {
                $('#title-main').text(data.title);
                importUrl = data.url ;
                exportUrl = data.exportUrl;
                confirmUrl = data.confirmUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE;
                page.logic.upload();
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
                      },
                      init : {
                        BeforeUpload: function(up, file) {
                            console.log('[BeforeUpload]', 'File: ', file);
                
                            //设置参数
                            uploader.setOption("multipart_params", {
                                "orgCode"    : ECS.sys.Context.SYS_ENTERPRISE_CODE
                              
                            });
                
                            uploader.settings.multipart_params.test_id = 2;
                            uploader.settings.multipart_params.test_author = "Wang";
                        }
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

                    if(result.resourceCode=="false"){
                        layer.msg(result.message);
                        $("#errorInfo").text("错误信息："+result.message);
                        return;
                    }
                    if (result.isSuccess) {
                        layer.confirm('数据效验成功，是否继续导入？', {
                            btn: ['确定', '取消']
                        }, function () {

                          
                            $.ajax({
                                url: confirmUrl+"&redisKey="+result.result+"&status=true",
                                async: false,
                                data: {},
                                dataType: "json",
                                contentType: "application/json;charset=utf-8",
                                type: 'GET',
                            
                                success: function (result) {
                                    layer.msg(result.message);
                                    page.logic.closeLayer(true);
                                },
                                error: function (result) {
                                    layer.msg("系统繁忙");
                                }
                            })
                        }, function (index) {
                            $.ajax({
                                url: confirmUrl+"&redisKey="+result.result+"&status=false",
                                async: false,
                                data: {},
                                dataType: "json",
                                contentType: "application/json;charset=utf-8",
                                type: 'GET',
                            
                                success: function (result) {
                                    page.logic.closeLayer(true);
                                },
                                error: function (result) {
                                 layer.msg("系统繁忙");
                                }
                            })
                        });
                    } else {
                        layer.msg(result.message);
                        window.parent.redisKey = result.result;
                        
                        page.logic.closeLayer(false);
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
            ExportExcel:function(key){
                var url =exportUrl+"?redisKey="+key;
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