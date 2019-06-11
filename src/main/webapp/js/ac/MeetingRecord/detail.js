var meetingRecordUrl = ECS.api.emUrl + '/meetingRecord/details';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.bindUI();
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });
        },
        data: {
            param: {
            }
        },
        logic: {
            setData: function (data) {
                $('#title-main').text(data.title);
                page.data.param.meetingRecordId = data.meetingRecordId;
                this.search();
            },
            search: function () {
                $.ajax({
                    async: true,
                    url: meetingRecordUrl,
                    data: { meetingRecordId: page.data.param.meetingRecordId },
                    type: 'GET',
                    success: function (result) {
                        var grid = mini.get("datagrid");
                        grid.setData(result.meetingUser);
                        mini.get('meetingAbstract').setValue(result.meetingAbstract);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            rendererOperate: function (e) {
                var id = e.record.meetingRecordId;
                var operate = '<a href="javascript:window.page.logic.attachment(' + id + ')"><i class="icon-details edit mr__5"></i></a>'
                    + '<a href="javascript:window.page.logic.detail(' + id + ')"><i class="icon-edit edit"></i></a>';
                return operate;
            },
            detail: function (id) {
                ECS.util.detail({
                    url: 'detail.html',
                    data: {
                        title: '会议详情',
                        pageMode: PageModelEnum.Details
                    }
                });
            },
            attachment: function () {
                alert('TODO 上传附件公共控件用法待确定');
                // ECS.util.detail({
                //     url: 'detail.html',
                //     data: {
                //         title: '会议详情',
                //         pageMode: PageModelEnum.Details
                //     }
                // });
            },
            closeLayer: function () {
                var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
                parent.layer.close(index);
            },
        }
    };
    page.init();
    window.page = page;
});