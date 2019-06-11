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
        }
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
                        vm.records = parent.getRecordsForP(eventId);
                        for (var i = 0, len = vm.records.length; i < len; i++) {
                            vm.recordsFileName = vm.records[i].filename + '.wav' + '</br>';
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
                item.teamEntities.forEach(function (entity) {
                    if (entity.printingTime) {
                        entity.printingTime = moment(entity.printingTime).format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (entity.handleTime) {
                        entity.handleTime = moment(entity.handleTime).format('YYYY-MM-DD HH:mm:ss');
                    }
                });
                return item;
            },
            closeLayer: function (isRefresh) {
                parent.resetAnswerStatus();
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});