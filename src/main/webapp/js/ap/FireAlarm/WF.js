var detailUrl = ECS.api.apUrl + '/fileAlarmChild/singlePoliceRecord';  //案件详情
var vm = new Vue({
    el: '#main',
    data: {
        items: [],
        selectedItem: [],
        eventId: '',
        detail: {},
        records: {},
        recordsFileName: ''
    },
    methods: {
        returnJson: function (d) {
            return JSON.stringify(d);
        },
        rendererTime:function(time){
            return time.substring(0, 4) + '-' + time.substring(4, 6) + '-' + time.substring(6, 8)
            + ' ' + time.substring(9, 11) + ':' + time.substring(11, 13) + ':' + time.substring(13, 15);
        },
        calltime: function (starttime,endtime) {
            var strStartTime = starttime.substring(0, 4) + '-' + starttime.substring(4, 6) + '-' + starttime.substring(6, 8)
                + ' ' + starttime.substring(9, 11) + ':' + starttime.substring(11, 13) + ':' + starttime.substring(13, 15);
            var strEndTime = endtime.substring(0, 4) + '-' + endtime.substring(4, 6) + '-' + endtime.substring(6, 8)
                + ' ' + endtime.substring(9, 11) + ':' + endtime.substring(11, 13) + ':' + endtime.substring(13, 15);
            var res = mini.parseDate(strEndTime) - mini.parseDate(strStartTime);
            return res / 1000;
        },
    }
});

$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            page.logic.initPage();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            setData: function (eventId) {
                vm.eventId = eventId;
                page.logic.initPage(eventId);
            },
            initPage: function (eventId) {
                $.ajax({
                    url: detailUrl + "?eventId=" + eventId,
                    type: "get",
                    success: function (data) {
                        vm.detail = page.logic.Convert(data);
                        var arr = parent.getRecordsForP(eventId);
                        vm.records = arr.reverse();
                        if (vm.records.length > 0) {
                            vm.starttime = vm.records[0].starttime;
                            vm.endtime = vm.records[0].endtime;
                            vm.filename = vm.records[0].filename;
                            vm.vruid = vm.records[0].vruid;
                            vm.streamid = vm.records[0].streamid;
                            vm.recordsFileName = vm.records[0].filename + '.wav';
                        }
                    },
                    error: function (e) {

                    }
                });
            },
            WFDetail: function () {
                var type = 'auto';
                var msg = vm.detail.eventSummary;
                layer.open({
                    type: 1
                    , area: ['40%', '30%']
                    , title: '案件详情'
                    , offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                    , id: 'layerDemo' + type //防止重复弹出
                    , content: '<div style="padding: 20px 100px;">' + msg + '</div>'
                    , btn: '关闭'
                    , btnAlign: 'c' //按钮居中
                    , shade: 0 //不显示遮罩
                    , yes: function () {
                        layer.closeAll();
                    }
                });
            },
            Detail: function (item) {
                layer.open({
                    type: 2,
                    closeBtn: 1,
                    area: ['80%', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: '详情',
                    content: '../FiremanGo/task.html?eventId=' + item.eventID + '&teamId=' + item.teamID + '&batchId=' + item.firemanGoBatch + '&readonly=true' + '&r=' + Math.random(),
                    success: function (layero, index) {

                    },
                    end: function () {

                    }
                })
            },
            Convert: function (item) {
                if (item.alarmTime) {
                    item.alarmTime = moment(item.alarmTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.initTime) {
                    item.initTime = moment(item.initTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.commandTime) {
                    item.commandTime = moment(item.commandTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.registerTime) {
                    item.registerTime = moment(item.registerTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.completeTime) {
                    item.completeTime = moment(item.completeTime).format('YYYY-MM-DD HH:mm:ss');
                }
                return item;
            },
            closeLayer: function (isRefresh) {
                parent.resetAnswerStatus();
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            },
            playRecord: function (record) {
                if (record) {
                    parent.recordDownload(record.starttime, record.endtime, record.filename, record.vruid, record.streamid);
                }
                else {
                    parent.recordDownload(vm.starttime, vm.endtime, vm.filename, vm.vruid, vm.streamid);
                }
            }
        }
    };
    page.init();
    window.page = page;
});