var fireUnitsUrl = ECS.api.rttUrl + '/relatedFireUnits';

$(function () {
    var page = {
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
        },
        data: {
            param: {

            }
        },
        logic: {
            setData: function (data) {
                $('#title-main').text(data.title);
                page.data.param.pageMode = data.pageMode;
                page.data.param.id = data.id;
                if (data.pageMode != PageModelEnum.NewAdd) {
                    mini.get('mntUserDept').setValue(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    mini.get('mntUserName').setValue(ECS.sys.Context.SYS_USER_NAME);
                    mini.get('mntDateStr').setValue(mini.formatDate(new Date(), 'yyyyMMdd'));

                    var form = new mini.Form('AddOrEditModal');

                    $.ajax({
                        url: fireUnitsUrl + '/' + data.id,
                        type: "get",
                        dataType: "json",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            if (data.isSuccess) {
                                form.setData(data.result);
                            } else {
                                layer.msg(data.message);
                            }
                            ECS.hideLoading();
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }
                else {
                    mini.get('crtUserDept').setValue(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    mini.get('crtUserName').setValue(ECS.sys.Context.SYS_USER_NAME);
                    mini.get('crtDateStr').setValue(mini.formatDate(new Date(), 'yyyyMMdd'));

                    mini.get('mntUserDept').setValue(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    mini.get('mntUserName').setValue(ECS.sys.Context.SYS_USER_NAME);
                    mini.get('mntDateStr').setValue(mini.formatDate(new Date(), 'yyyyMMdd'));
                }
            },
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }

                var data = ECS.form.getData('AddOrEditModal');

                ECS.util.addOrEdit({
                    url: fireUnitsUrl,
                    data: data,
                    pageMode: page.data.param.pageMode
                }, function (result) {
                    var result = $.parseJSON(result);
                    if (result.isSuccess)
                        layer.msg('操作成功', {
                            time: 1000
                        }, function () {
                            parent.page.logic.search();
                            page.logic.closeLayer(true);
                        });
                    else {
                        layer.msg(result.message);
                    }
                });
            },
            closeLayer: function (isRefresh) {
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal', {
                    ignore: "",
                    rules: {
                        name: {
                            required: true
                        },
                        tel: {
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