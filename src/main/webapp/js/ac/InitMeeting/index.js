var initMeetingUrl = ECS.api.emUrl + '/initiateMeeting';
var eventUrl = ECS.api.apUrl + '/fileAlarmChild/getPoliceEventList';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.bindUI();
            page.logic.initMeetingType();
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
            initMeetingType: function () {
                var data = [
                    { id: 0, text: '普通会议' },
                    { id: 1, text: '接警事件' }
                ];
                mini.get('meetingType').setData(data);
                $.ajax({
                    url: eventUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if(data.length > 0){
                            mini.get('eventId').setEnabled(true);
                            mini.get('meetingType').select(1);
                            mini.get('eventId').setData(data);
                            mini.get('eventId').select(0);
                        }else{
                            mini.get('meetingType').select(0);
                            mini.get('meetingType').setEnabled(false);
                        }
                    },
                    error: function () {
                        layer.msg('获取事件失败');
                    }
                });
            },
            getEvents: function (e) {
                if (e.value == 1) {
                    mini.get('eventId').setEnabled(true);
                    ECS.util.bindCmb({
                        url: eventUrl,
                        ctrId: 'eventId',
                        idField: 'eventId',
                        textField: 'eventAddress'
                    }, function (result) {
                        mini.get('eventId').setData(result);
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
                var users = mini.get('datagrid').getData();
                if (users.length == 0) {
                    layer.msg('请选择参会人员');
                    return;
                }
                if (users.length > parent.meetingCount) {
                    layer.msg('参会人员最多为' + parent.meetingCount + '人');
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

                if (page.logic.isExistsArr(phoneNums)) {
                    return;
                }

                ECS.util.addOrEdit({
                    url: initMeetingUrl,
                    data: data,
                    pageMode: PageModelEnum.NewAdd
                }, function (result) {
                    var data = $.parseJSON(result);
                    data.meetingCount = parent.meetingCount;
                    data.station = parent.station;
                    var openUrl = '../../html/ac/InitMeeting/MeetingDetail.html?' + Math.random();
                    window.parent.open(
                        openUrl,
                        data,
                        function () {
                            parent.closeMeeting();
                        },
                        { height: '95%', width: '95%', closeBtn: 0 },
                        function () {
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