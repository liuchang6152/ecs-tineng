$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        presentJeevesUrl: ECS.api.eddUrl + '/EDDPresentJeeves',
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $("#btnSave").click(function () {
                page.logic.save();
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
                var type = mini.get('mtrlType');
                type.setData(data.typeData);
                type.select(0);

                if (data.pageMode != PageModelEnum.NewAdd) {
                    var form = new mini.Form('AddOrEditModal');
                    $.ajax({
                        url: page.presentJeevesUrl + '/' + data.id,
                        type: "get",
                        async: true,
                        dataType: "json",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            data.noticeDate = ECS.util.strToDate(data.noticeDate);
                            data.startDate = ECS.util.strToDate(data.startDate);
                            data.endDate = ECS.util.strToDate(data.endDate);
                            data.mtrlType = data.mtrlType === '' || data.mtrlType === null ? -1 : data.mtrlType;
                            form.setData(data);
                            $('#address').val(data.address);
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
                data.mtrlType = data.mtrlType == -1 ? '' : data.mtrlType;
                ECS.util.addOrEdit({
                    url: page.presentJeevesUrl,
                    data: data,
                    pageMode: page.data.param.pageMode
                }, function (result) {
                    layer.msg(result, {
                        time: 1000
                    }, function () {
                        parent.page.logic.search();
                        page.logic.closeLayer(true);
                    });
                });
            },
            closeLayer: function (isRefresh) {
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal', {
                    ignore: "",
                    rules: {
                        startDate: {
                            required: true
                        },
                        endDate: {
                            required: true
                        },
                        noticeDate: {
                            required: true
                        },
                        address: {
                            required: true
                        }
                    }
                });
            }
        }
    }
    page.init();
    window.page = page;
});