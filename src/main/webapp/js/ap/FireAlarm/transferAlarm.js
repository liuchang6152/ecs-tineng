var fireUnitUrl = ECS.api.apUrl + '/fileAlarmChild/getFileUnit';
var transferAlarmUrl = ECS.api.apUrl + '/fileAlarmChild/transferPolice/';
var status;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            page.logic.initPage();
            page.logic.search();
            this.bindUI();
        },
        bindUI: function () {
            $('.btnClose').click(function () {
                page.logic.closeLayer(false);
            });
            $('#btnSave').click(function () {
                page.logic.save();
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
                page.data.param.eventId = data.eventId;
            },
            initPage: function () {
                var grid = mini.get('datagrid');
                grid.set({
                    url: fireUnitUrl,
                    ajaxType: 'get',
                    dataField: 'pageList'
                });
            },
            search: function () {
                var grid = mini.get('datagrid');
                var form = new mini.Form('searchForm');
                var data = form.getData();
                grid.load(data);
            },
            renderer_Operate: function (e) {
                return '<a href="javascript:window.page.logic.transferAlarm(\'' + e.record.tel + '\')" class="btn btn-primary" style="width:48px;height:18px;">转接</a>';
            },
            transferAlarm: function (destNumber) {
                eventId = page.data.param.eventId;
                ECS.util.addOrEdit({
                    url: transferAlarmUrl + eventId
                }, function (data) {
                    data = $.parseJSON(data);
                    if (data.isSuccess) {
                        status = true;
                        parent.parent.transfer(destNumber);
                        page.logic.closeLayer();
                    }
                    else {
                        layer.msg('操作失败');
                    }
                });
            },
            closeLayer: function (isRefresh) {
                if (status) {
                    window.parent.pageLoadMode = PageLoadMode.Refresh;
                }
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
});