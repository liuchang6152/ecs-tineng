var addUrl = ECS.api.bcUrl + '/accidentCategory';
var getSingleUrl = ECS.api.bcUrl + '/accidentCategory';
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            this.bindUI();
        },
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $("input").blur(function () {
                $(this).val($.trim($(this).val()));
            });
            $('body').on('blur','.input',function(){
                $(this).closest('.form-groups').remove();
            });
            $('#btnSave').click(function () {
                if($("#firstName").val().length>0){
                    layer.msg('您的“子类名称”输入区的最下边输入框存在内容，如需增加请点击加号，否则请清空后保存！！', {
                        time: 4000
                    });
                    return;
                }
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#addNewName").click(function () {
                if($("#firstName").val()!=""){
                    $("#nameList").append('<div class="form-groups">'+
                        '<div class="col-xs-9">'+
                        '<input type="text" class="form-control required" maxlength="200" onblur="$(this).val($.trim($(this).val()))" value="'+$("#firstName").val()+'"/></div>'+
                        '<span class="span-required">*</span>'+
                        '<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
                    $("#firstName").val("");
                }else{
                    layer.msg("新增的子类名称不能为空！");
                }
            });
            $('#nameList').on('click','.delName',function(){
                $(this).closest('.form-groups').remove();
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.accidentCategoryID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal', data);
                        for(var i=0;i<data.accidentTypeEntityList.length;i++){
                            $("#nameList").append('<div class="form-groups">'+
                                '<div class="col-xs-9">'+
                                '<input type="text" class="form-control required" onblur="$(this).val($.trim($(this).val()))" id="'+data.accidentTypeEntityList[i].accidentTypeID+'" maxlength="200" value="'+data.accidentTypeEntityList[i].accidentTypeName+'" /></div>'+
                                '<span class="span-required">*</span>'+
                                '<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
                        }
                    },
                    error: function (result) {
                        ECS.hideLoading();
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
                $("#AddOrEditModal").find("input[class=form-control]").each(function () {
                    $(this).val($.trim($(this).val()));
                });
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#nameList").html()==""){
                    layer.msg("请填写子类名称并点击增加按钮！");
                    return;
                }
                var numArr=[];
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    $("#nameList").find(".form-control").each(function(i){
                        numArr.push({accidentTypeName:$(this).val(),inUse:"1",sortNum:i});
                    });
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    $("#nameList").find(".form-control").each(function(i){
                        numArr.push({accidentTypeID:$(this).attr("id"),accidentTypeName:$(this).val(),inUse:"1",sortNum:i,accidentCategoryID:$("#accidentCategoryID").val()});
                    });
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                $("#accidentTypeEntityList").val(JSON.stringify(numArr));
                var data = ECS.form.getData('AddOrEditModal');
                var ob=JSON.parse(data.accidentTypeEntityList);//去掉数组中对象属性的双引号
                data.accidentTypeEntityList=ob;
                delete data["firstName"];
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:JSON.stringify(data),
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
                        accidentCategoryName: {
                            required: true,
                            maxlength:200
                        },
                        firstName: {
                            maxlength:200
                        }
                    }
                });

            }
        }
    };
    page.init();
    window.page = page;
});