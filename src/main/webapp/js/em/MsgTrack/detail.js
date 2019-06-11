$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        searchUrl: ECS.api.emUrl + '/msg/msgfeedback',
        init: function () {
            mini.parse();
            this.bindUI();
            page.logic.initTable();
        },
        bindUI: function () {
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $("#btnQuery").click(function () {
                page.logic.search();
            });
        },
        data: {
            param: {

            }
        },
        logic: {
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({
                    url: page.searchUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
            },
            search: function () {
                var startTime = mini.formatDate(mini.get('startTime').getValue(), 'yyyy-MM-dd HH:mm:ss');
                var endTime = mini.formatDate(mini.get('endTime').getValue(), 'yyyy-MM-dd HH:mm:ss');
                if (startTime > endTime) {
                    layer.msg('开始时间不能大于结束时间');
                    return;
                }
                $.extend(page.data.param, {
                    sendType: $("#sendType").val(),
                    receiverName: $.trim($('#receiverName').val()),
                    feedBackContent: $.trim($('#feedBackContent').val()),
                    startTime: startTime,
                    endTime: endTime
                });
                grid.load(page.data.param);
            },
            show_sendType: function (e) {
                // <!-- 发送类型（-1空 0全部、1短信2、群呼3、短信、群呼） -->
                if (e.value == 1) {
                    return '短信';
                } else if (e.value == 2) {
                    return '群呼';
                } else if (e.value == 3) {
                    return '短信、群呼';
                }
            },
            show_receiverCode: function (e) {
                return '<a href="javascript:page.logic.callReceiver(' + e.value + ')">' + e.value + '</a>';
            },
            callReceiver: function (phoneNum) {
                parent.parent.call(phoneNum, function () {
                    layer.open({
                        type: 1
                        , offset: 'auto'
                        , id: 'layerDemo' + 'auto'
                        , area: ['420px', '240px']
                        , content: '<div style="text-align:center;padding-top:60px;">' + "正在呼叫电话" + phoneNum + '</div>'
                        , btn: '取消'
                        , btnAlign: 'c'
                        , shade: 0
                        , closeBtn: 0
                        , yes: function () {
                            parent.parent.hangup();
                            layer.closeAll();
                        }, title: '拨打电话'
                    });
                });
            },
            setData: function (data) {
                $('#title-main').text(data.title);
                $('#msgContent').val(data.msgContent);
                page.data.param.msgID = data.msgID;
                page.data.param.feedbackStatus = data.feedbackStatus;
                if(data.businessModelId){
                    page.data.param.businessModelId = data.businessModelId;
                    page.data.param.systemId = data.systemId;
                }
                this.search();
            },
            closeLayer: function (isRefresh) {
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});