var tempPersonUrl = ECS.api.emUrl + '/msg/addTemporaryStaff';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $('input').blur(function () {
                var val = $.trim($(this).val())
                $(this).val(val);
                mini.get(this.name).setValue(val);
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $('#btnSave').click(function () {
                page.logic.saveTempPerson();
            });
        },
        data: { param: {} },
        logic: {
            setData: function (data) {
                $('#title-main').text(data.title);
            },
            saveTempPerson: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var formData = ECS.form.getData('AddOrEditModal');
                if (formData.privatePersonMobile == '' && formData.privatePersonPhone == '') {
                    layer.msg('手机和座机不能都为空！');
                    return;
                }
                ECS.util.addOrEdit({
                    url: tempPersonUrl,
                    data: formData
                }, function (result) {
                    result = $.parseJSON(result);
                    if (result.isSuccess) {
                        layer.msg('添加成功', {
                            time: 1000
                        }, function () {
                            parent.page.logic.initTempTable();
                            page.logic.closeLayer(true);
                        });
                    }
                    else {
                        layer.msg(result.message, {
                            time: 1000
                        });
                    }
                });
            },
            closeLayer: function () {
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal', {
                    rules: {
                        privatePersonName: {
                            required: true
                        },
                        privatePersonPhone: {
                            simplePhone: true
                        },
                        privatePersonMobile: {
                            mobile: true
                        }
                    }
                })
            }
        }
    }
    page.init();
    window.page = page;
})