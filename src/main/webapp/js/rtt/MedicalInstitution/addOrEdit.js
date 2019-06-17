var madicalUrl = ECS.api.rttUrl + '/medicalInstitutio';
var madicalTypeUrl = ECS.api.rttUrl + '/medicalInstitutio/getAllMediInstitutionType';
var madicalLvUrl = ECS.api.rttUrl + '/medicalInstitutio/getAllLvl';

$(function () {
    var page = {
        init: function () {
            mini.parse();
            this.logic.initPage();
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
        data: { param: {} },
        logic: {
            initPage: function () {
                ECS.util.bindCmb({
                    ctrId: 'typeID',
                    url: madicalTypeUrl,
                    idField: 'typeID',
                    textField: 'typeName'
                });

                ECS.util.bindCmb({
                    ctrId: 'institutionLvl',
                    url: madicalLvUrl,
                    idField: 'institutionLvl',
                    textField: 'name'
                });

            },
            setData: function (data) {
                $('#title-main').text(data.title);
                page.data.param.pageMode = data.pageMode;
                page.data.param.id = data.id;
                if (data.pageMode != PageModelEnum.NewAdd) {
                    $.ajax({
                        url: madicalUrl + '/' + data.id,
                        type: "get",
                        dataType: "json",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            if (data.isSuccess) {
                                var form = new mini.Form('AddOrEditModal');
                                form.setData(data.result);
                                $('#serviceSpecial').val(data.result.serviceSpecial);
                                $('#remarks').val(data.result.remarks);
                            }
                            else {
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
            },
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }

                var data = ECS.form.getData('AddOrEditModal');
                ECS.util.addOrEdit({
                    url: madicalUrl,
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
                }, function (result) {
                    var errorResult = $.parseJSON(result.responseText);
                    layer.msg(errorResult.message);
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
                        institutionName: {
                            required: true
                        },
                        institutionLvl: {
                            required: true
                        },
                        typeID: {
                            required: true
                        },
                        contactPhone: {
                            simplePhone: true
                        },
                        galleryful: {
                            required: true,
                            number: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});