var initMeetingUrl = ECS.api.emUrl + '/initiateMeeting';
var eventUrl = ECS.api.apUrl + '/fileAlarmChild/getTransferPoliceInfoNoPage';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.bindUI();
            page.logic.initMeetingType();

            //page.logic.testData();

            //获取用户的相关数据
            ECS.sys.RefreshContextFromSYS();
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnAdd').click(function () {
                page.logic.add();
            });
            $('#btnDel').click(function () {
                page.logic.del();
            });
            $('#btnInit').click(function () {
                page.logic.initMeeting();
            });
            mini.get('meetingType').on('valuechanged', function (e) {
                page.logic.getEvents(e);
            })
        },
        data: {
            param: {
            }
        },
        logic: {
            // testData: function () {
            //     var data = [{ userId: "1196", userName: "李虹瑶(1196)", userMobile: "18574848307", userPhone: "", mark: 1 },
            //     { userId: "1195", userName: "没有手机号(1195)", userMobile: "", userPhone: "13212121212", mark: 0 },
            //     { userId: "1186", userName: "张三(1186)", userMobile: "13688888888", userPhone: "010-12345678", mark: 1 }];
            //     mini.get('datagrid').setData(data);
            // },
            initMeetingType: function () {
                var data = [
                    { id: 0, text: '普通会议' },
                    { id: 1, text: '接警事件' },
                ];
                mini.get('meetingType').setData(data);
                mini.get('meetingType').select(0);
            },
            getEvents: function (e) {
                if (e.value == 1) {
                    mini.get('eventId').setEnabled(true);
                    ECS.util.bindCmb({
                        url: eventUrl,
                        ctrId: 'eventId',
                        idField: 'eventId',
                        textField: 'eventAddressr'
                    }, function (result) {
                        mini.get('eventId').setData(result.result);
                        mini.get('eventId').select(0);
                    });
                } else {
                    mini.get('eventId').setEnabled(false);
                    mini.get('eventId').setData([]);
                }
            },
            add: function () {
                ECS.util.detail({
                    height: 480,
                    url: '../../em/CommGroup/SelectPersons.html',
                    data: {
                        title: '人员选择',
                        pageMode: PageModelEnum.NewAdd,
                        orgCode: ECS.sys.Context.SYS_ENTERPRISE_CODE
                    }
                }, function () {
                    var data = mini.get('datagrid').data;
                    for (var i = 0, len = window.ownDetail.length; i < len; i++) {
                        if (!page.logic.isExists(data, window.ownDetail[i].userId)) {
                            var obj = {
                                userId: window.ownDetail[i].userId,
                                userName: window.ownDetail[i].userName + '(' + window.ownDetail[i].userId + ')',
                                userMobile: window.ownDetail[i].userMobile,
                                userPhone: window.ownDetail[i].userPhone,
                                mark: window.ownDetail[i].userMobile == '' ? 0 : 1
                            };
                            data.push(obj);
                        }
                    }
                    mini.get('datagrid').setData(data);
                });
            },
            isExists: function (data, id) {
                if (!data) {
                    return false;
                }
                var len = data.length;
                while (len-- > 0) {
                    if (data[len].userId == id) {
                        return true;
                    }
                }
                return false;
            },
            del: function () {
                var grid = mini.get('datagrid');
                var data = grid.getSelecteds();
                if (data.length == 0) {
                    layer.msg('请选择要删除的数据');
                    return;
                }
                grid.removeRows(data);
            },
            initMeeting: function () {
                var data = ECS.form.getData('AddOrEditModal');

                if (data.meetingTheme == '') {
                    layer.msg('请输入会议主题');
                    return;
                }

                data.person = [];
                var users = mini.get('datagrid').getSelecteds();
                if (users.length == 0) {
                    users = mini.get('datagrid').getData();
                }
                if (users.length == 0) {
                    layer.msg('请选择参会人员');
                    return;
                }
                if (users.length > 20) {
                    layer.msg('参会人员最多为20人');
                    return;
                }
                var phoneNums = [];
                for (var i = 0, len = users.length; i < len; i++) {
                    if (users[i].mark == 1 && users[i].userMobile == '') {
                        layer.msg(users[i].userName + '手机号为空，请选择座机或是删除该人员');
                        return;
                    }
                    var obj = {
                        personId: users[i].userId,
                        mark: users[i].mark,
                        phone: users[i].mark == 1 ? users[i].userMobile : users[i].userPhone
                    };
                    data.person.push(obj);
                    phoneNums.push(users[i].mark == 1 ? users[i].userMobile : users[i].userPhone);
                }
                
                if(page.logic.isExistsArr(phoneNums)){
                    return;
                }

                ECS.util.addOrEdit({
                    url: initMeetingUrl,
                    data: data,
                    pageMode: PageModelEnum.NewAdd
                }, function (result) {
                    var data = result = $.parseJSON(result);
                    var openUrl = '../../html/ac/InitMeeting/MeetingDetail.html?' + Math.random();
                    window.parent.open(openUrl, data.result, function () {
                        parent.closeMeeting();
                    }, { height: '95%', width: '95%', closeBtn: 0 }, function () {
                        parent.meeting(phoneNums);


                    });
                });
            },
            onCellbeginedit: function (e) {
                if (e.field == 'mark' && (e.record.userPhone == '' || e.record.userMobile == '')) {
                    e.cancel = true;
                }
            },
            isExistsArr: function (arr) {
                var hash = {};
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (hash[arr[i]]) {
                        layer.msg(arr[i] + '存在重复');
                        return true;
                    }
                    hash[arr[i]] = true;
                }
                return false;
            }
        }
    };
    page.init();
    window.page = page;
});