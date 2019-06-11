var alarmUrl = ECS.api.apUrl + '/fileAlarmChild/getTransferPoliceInfo';
var mergeAlarmUrl = ECS.api.apUrl + '/fileAlarmChild/policeMerger';
var status ;
$(function () {
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            page.logic.initPage();
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer();
            });
        },
        data: {
            param: {}
        },
        logic: {
            setData: function (data) {
                page.data.param.eventId = data.eventId;
                var grid = mini.get('datagrid');
                grid.load({
                    seatIp: '',
                    eventId: data.eventId
                });
            },
            initPage: function () {
                var grid = mini.get('datagrid');
                grid.set({
                    url: alarmUrl,
                    ajaxType: 'GET',
                    dataField: 'pageList'
                });
            },
            renderer_operate: function (e) {
                var eventId = e.record.eventId;
                return '<a href="javascript:window.page.logic.mergeAlarm(' + eventId + ')" class="btn btn-primary" style="width:48px;height:18px;">合并</a>';
            },
            mergeAlarm: function (eventId) {
                ECS.util.addOrEdit({
                    url: mergeAlarmUrl + '?eventId=' + eventId + '&eventIdm=' + page.data.param.eventId,
                    pageMode: PageModelEnum.Edit
                }, function (data) {
                    data = $.parseJSON(data);
                    if (data.isSuccess) {
                        status = true;
                        layer.msg('操作成功');
                        page.logic.closeLayer();
                    }
                    else {
                        layer.msg('操作失败');
                    }
                });
            },
            closeLayer: function () {
                if(status){
                    window.parent.pageLoadMode = PageLoadMode.Refresh;
                }
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});