var addUrl = ECS.api.emUrl + '/Device/statusCfg';
var getSingleUrl = ECS.api.emUrl + '/Device/getDevicestatusCfg/';//查询某一条数据
var leng = 1;
var deviceID;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            this.bindUI();
        },
        bindUI: function () {
            $("input").blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //新增状态
            $("#addNewStatus").click(function(){
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#firstValue").val()!=""){
                    $(".statusList").append('<div class="row">'+
                        '<div class="col-xs-5"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="value'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value=""/></div><span class="span-required">*</span></div></div>'+
                        '<div class="col-xs-5"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="dec'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="" /></div><span class="span-required">*</span></div></div>'+
                        '<div class="col-xs-2">'+
                        '<button class="btn btn-danger delStatus" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                    leng++;
                }
            });
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $("#btnClose,.btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //删除角色ip
            $('.statusList').on('click','.delStatus',function(){
                leng--;
                $(this).closest('.row').remove();
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                pageMode = data.pageMode;
                //设备名称
                $("#deviceName").val(data.deviceName);
                //设备id
                deviceID=data.deviceId;
                $.ajax({
                    url: getSingleUrl + data.deviceId + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (result) {
                        if(result.length>0){
                            //状态循环
                            $("#firstValue").val(result[0].statusCfgValue);
                            $("#statusValueDes").val(result[0].statusCfgValueDescription);
                            for(var i=1;i<result.length;i++){
                                $(".statusList").append('<div class="row">'+
                                    '<div class="col-xs-5"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="value'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="'+result[i].statusCfgValue+'"/></div><span class="span-required">*</span></div></div>'+
                                    '<div class="col-xs-5"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="dec'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" value="'+result[i].statusCfgValueDescription+'" /></div><span class="span-required">*</span></div></div>'+
                                    '<div class="col-xs-2">'+
                                    '<button class="btn btn-danger delStatus" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                            }
                            leng=result.length;
                        }
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                //状态列表
                var statusList=[];
                $(".statusList").find(".row").each(function(){
                    if($(this).find("input").eq(0).val()){
                        statusList.push({
                            "deviceID":deviceID,
                            "statusCfgValue":$(this).find("input").eq(0).val(),
                            "statusCfgValueDescription":$(this).find("input").eq(1).val()
                        });
                    }
                });
                //处理提交类型
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: "PUT",
                    data:JSON.stringify(statusList),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message);
                        }
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    rules: {
                        deviceName: {
                            required: true
                        },
                        firstValue: {
                            required: true
                        },
                        statusValueDes: {
                            required: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});