$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        addPersonGroup: ECS.api.emUrl + '/CommonGroupOwer',
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $('#btnSave').click(function () {
                page.logic.savePersonGroup();
            });
        },
        data: {
            param: {

            }
        },
        logic: {
            setData: function (data) {
                page.data.param.personIds = data.personIds;
                page.data.param.personGroupArr = mini.clone(data.personGroupArr);
                $('#title-main').text(data.title);
            },
            saveGroup: function () {
                var data = {
                    personIds: page.data.param.personIds,
                    commonGroupName: $.trim($('#personGroup').val())
                };
                $.ajax({
                    url: page.addPersonGroup,
                    async: false,
                    type: 'post',
                    data: JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！", { time: 1000 }, function () {
                                window.parent.page.logic.initData();
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            savePersonGroup: function () {
                page.logic.formValidate();
                if (!$('#form').valid()) {
                    return;
                }
                var flag = false;
                for (var i = 0, len = page.data.param.personGroupArr.length; i < len; i++) {
                    if ($.trim($('#personGroup').val()) == page.data.param.personGroupArr[i].groupName.replace(/\(.+\)/,'')) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    layer.msg('个人通讯组名称已存在，仍然要添加吗？', {
                        time: 0,
                        btn: ['确定', '取消'],
                        yes: function (index) {
                            layer.close(index);
                            page.logic.saveGroup();
                        }
                    });
                }else{
                    page.logic.saveGroup();
                }
            },
            closeLayer: function (isRefresh) {
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('form', {
                    rules: {
                        personGroup: {
                            required: true
                        }
                    }
                })
            }
        }
    }
    page.init();
    window.page = page;
})