$(function () {
    var page = {
        searchUrl: ECS.api.emUrl + '/msg/record',
        orgUrl: ECS.api.bcUrl + '/org/porgName',
        emEventUrl: ECS.api.emUrl + '/msg/event',
        //页面初始化
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            page.logic.get_list(page.orgUrl, $("#enterpriseCode"));
            page.logic.initTable();
            //0、日常调度；1、应急事件；
            if (page.logic.getQueryString('PageModel') == 1) {
                page.logic.initEventTable();
            }
            this.bindUI();
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            $('#btnNewMsg').click(function () {
                window.location = '../MsgSend/index.html' + location.search;
            });
            $('#btnMsgTrack').click(function () {
                window.location.reload();
            });
        },
        data: {
            param: {
            }
        },
        //定义业务逻辑方法
        logic: {
            get_list: function (url, oPar, Pid, cb) {
                if (Pid) {
                    //二级单位
                    var cur_url = url + "?isAll=true&orgPID=" + Pid + "&orgLvl=3";
                } else {
                    //企业
                    var cur_url = url + "?orgLvl=2";
                }
                $.ajax({
                    url: cur_url,
                    type: "GET",
                    success: function (Data) {
                        if (Pid) {
                            //二级单位
                            mini.get("drtDeptCode").loadList(Data, "orgId", "orgPID");
                            mini.get("drtDeptCode").setValue("全部");
                            page.logic.load_risk_menu();
                            cb && cb();
                        } else {
                            //企业
                            mini.get("enterpriseCode").loadList(Data, "orgId", "orgPID");
                            if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
                                enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
                                mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode);
                            } else {
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("enterpriseCode").disable();
                                for (var w = 0; w < Data.length; w++) {
                                    (function (cur_key) {
                                        if (cur_key.orgCode == enterpriseCode) {
                                            mini.get("enterpriseCode").setValue(cur_key.orgCode);
                                        }
                                    })(Data[w]);
                                }
                            }
                            page.logic.search();
                            cb && cb();
                        }
                    }
                });
            },
            initTable: function () {
                grid = mini.get("datagrid");
                var eventId = page.logic.getQueryString('eventId');
                var url = eventId == null ? page.searchUrl : page.searchUrl + '?eventId=' + page.logic.getQueryString('eventId');
                grid.set({
                    url: url,
                    ajaxType: "get",
                    dataField: "pageList"
                });
            },
            initEventTable: function () {
                $('#event').show();
                $.ajax({
                    url: page.emEventUrl + '?eventId=' + page.logic.getQueryString('eventId'),
                    type: "get",
                    success: function (data) {
                        $('#eventSummary').text(data.eventSummary);
                        $('#enentType').text(page.logic.show_eventType(data.enentType));
                        $('#sendTime').text(ECS.util.DateTimeRender(data.sendTime));
                        $('#msgNumber').text(data.msgNumber);
                        $('#groupCalls').text(data.groupCalls);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
            },
            show_content: function (e) {
                return '<a href="javascript:page.logic.detail(' + e.record._uid + ')">' + e.value + '</a>';
            },
            show_notFBack: function (e) {
                return '<a href="javascript:page.logic.detail(' + e.record._uid + ',true)">' + e.value + '</a>';
            },
            show_eventType: function (e) {
                //接警类型（0：普通；1：消防）
                if (e == 0) {
                    return '普通';
                } else if (e == 1) {
                    return '消防';
                }
                return '未定义';
            },
            search: function () {
                var startTime = mini.formatDate(mini.get('startTime').getValue(), 'yyyy-MM-dd');
                var endTime = mini.formatDate(mini.get('endTime').getValue(), 'yyyy-MM-dd');
                if (startTime > endTime) {
                    layer.msg('开始时间不能大于结束时间');
                    return;
                }
                page.data.param = {
                    orgCode: mini.get('enterpriseCode').getValue(),
                    userName: $.trim($('#userName').val()),
                    startTime: startTime,
                    endTime: endTime,
                    msgType: $('#msgType').val()
                }
                grid.load(page.data.param);
            },
            detail: function (uid, notFBack) {
                var row = grid.getRowByUid(uid);
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '500px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'detail.html?r=' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            msgID: row.msgID,
                            msgContent: row.content,
                            title: '通知反馈记录'
                        };
                        if (notFBack) {
                            //反馈状态(0待发送，1已发送，2待反馈，3已反馈）
                            data.feedbackStatus = 2;
                        }
                        iframeWin.page.logic.setData(data);
                    },
                    end: function (r) {
                        if (r) {
                            grid.record();
                        }
                    }
                })
            },
            getQueryString: function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null)
                    return decodeURI(r[2]);
                return null;
            }
        }
    };
    page.init();
    window.page = page;
});