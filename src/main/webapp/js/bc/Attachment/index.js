var importUrl = ECS.api.bcUrl + '/attachment/uploadFile';        //附件上传
var Load_list_url = ECS.api.bcUrl + '/attachment';                //加载列表
var delUrl = ECS.api.bcUrl + '/attachment';                       //删除单条
var pageMode = PageModelEnum.Details;
window.pageLoadMode = PageLoadMode.None;
var mini;
var uploader;
var enterpriseCode = "";   //企业编码
var srcType = "";           //附件来源类型
var srcRef = "";            //当前数据的id
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            //ping server, 2019/4/2 junyi.zhang 添加
            setTimeout(page.logic.loopServer, 5000);
            //-end of- 2019/4/2 junyi.zhang 添加

        },
        table: {},
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            loopServer: function(){
                ECS.util.pingServer();
                setTimeout(window.page.logic.loopServer, 1000);
            },
            //导入列表数据；
            setData: function (data) {
                //拼接接口
                if(data){
                    $('#title-main').text(data.title);
                    var searchUrl = Load_list_url+"?enterpriseCode="+data.enterpriseCode+"&srcType="+data.srcType+"&srcRef="
                        +data.srcRef;
                    enterpriseCode = data.enterpriseCode;    //企业编码
                    srcType = data.srcType;                    //附件来源类型
                    srcRef = data.srcRef;                      //当前数据的id;
                    //设置面包屑导航的数据
                    $("#title-first").html(ECS.util.ReturnTypeName(data.srcType));   //一级面包屑
                    $("#title-second").html(data.name);                               //二级面包屑
                }else{
                    if(enterpriseCode && srcType && srcRef){
                        var searchUrl = Load_list_url+"?enterpriseCode="+enterpriseCode+"&srcType="+srcType+"&srcRef="+srcRef;
                    }
                }
                //渲染列表
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                grid.load();
                //上传文件功能
                page.logic.upload();
            },
            //展示文件名+格式，并添加下载路径；
            show_file: function(e){
                return  '<a href="'+ECS.api.bcUrl+'/attachment/downloadFile?atchPath='+e.row.atchPath+'&atchName='+e.row.atchName+'">'+e.row.atchName+'</a>';
            },
            //展示上传事件+上传人；
            show_PersonAndTime: function(e){
                return ECS.util.DateRender(e.row.crtDate)+" by "+e.row.crtUserName;
            },
            //展示删除图标
            show_delbtn: function(e){
                return '<a href="javasript:;" class="btn btn-danger btn-sm" style="line-height:15px;height:15px;" title="删除" onclick="page.logic.delSingle('+e.row.atchID+')"><i class="icon-delete mr__5"></i> 删除</a>';
            },
            //删除单条；
            delSingle:function(atchID){
                var idsArray = new Array();
                idsArray.push(atchID);
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: false,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        success: function (result) {
                            if (result.indexOf('collection') < 0) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                     grid.reload();
                                    //销毁uploader的实例对象；
                                    if(uploader){
                                        uploader.destroy();
                                    }
                                });
                            } else {
                                result = JSON.parse(result)
                                layer.msg(result.collection.error.message)
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            /**
             * 导入数据
             */
            upload: function() {
                // console.log("test1");
                uploader = new plupload.Uploader({
                    browse_button : 'upload_btn',      //上传按钮
                    drop_element:'upload_box',         //拖拽的区域
                    url : importUrl,
                    multipart_params:{
                        enterpriseCode:enterpriseCode,
                        srcType:srcType,
                        srcRef:srcRef,
                        crtUserId:ECS.sys.Context.SYS_USER_CODE,
                        crtUserName:ECS.sys.Context.SYS_USER_NAME
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
                    if (uploader.files.length >0) {
                        uploader.start();
                    }
                });
                uploader.bind('UploadProgress',function(uploader,file){
                    var percent = file.percent;
                    ECS.util.show_percent(percent);     //展示进度条
                    if(percent==100){
                        ECS.util.hide_percent();    //隐藏进度条
                    }
                });
                uploader.bind('FileUploaded', function(uploader, file, responseObject) {
                    var responseList=JSON.parse(responseObject.response);
                    var errorMsg="";
                    ECS.util.hide_percent();    //隐藏进度条
                    if(responseList.isSuccess){
                         grid.reload();      //列表重新加载；
                    } else{
                        for(var i=0;i<responseList.length;i++){
                            errorMsg+="<p>" + (parseInt(i)+1) + "、"+responseList[i].message+"</p>";
                        }
                        page.logic.importDetail("上传数据错误", errorMsg, PageModelEnum.Details)
                    }
                });
            },
            /**
             * 导入数据错误页面
             */
            importDetail: function (title ,errorTip,pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '400px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AttachmentDataError.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            'errorTip':errorTip
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        grid.reload();      //列表重新加载；
                        window.pageLoadMode = PageLoadMode.Refresh;
                    }
                })
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});