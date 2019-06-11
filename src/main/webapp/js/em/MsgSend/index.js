var tempPersonUrl = ECS.api.emUrl + '/msg/getTemporaryStaff';
var delTempPersonUrl = ECS.api.emUrl + '/msg/deleteTemporaryStaff';
var weatherUrl = ECS.api.emUrl + '/msg/getWeatherForecast';
var dataSource = null;

$(function () {
    var page = {
        orgUrl: ECS.api.bcUrl + '/org/porgName', //企业
        commGroupsTypeUrl: ECS.api.emUrl + '/CommGroupsType', //树形结构
        personGroupsUrl: ECS.api.emUrl + '/CommonGroupOwer',
        searchUrl: ECS.api.emUrl + '/PersonInCommGroup', //点击左侧树形菜单,查询表格数据
        emEventUrl: ECS.api.emUrl + '/msg/event',
        groupPerson: ECS.api.emUrl + '/PersonInCommGroup/search',
        sendMsg: ECS.api.emUrl + '/msg',
        feedbackTypeUrl: ECS.api.emUrl + '/msg/feedbackTypeList',
        //页面初始化
        init: function () {
            mini.parse();
            $('[tabindex="2"],[tabindex="3"],[tabindex="4"]').hide();
            ECS.sys.RefreshContextFromSYS();
            page.logic.get_list(page.orgUrl, $("#enterpriseCode"));
            page.logic.initData();
            this.bindUI();
            page.logic.initPage();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnNewMsg').click(function () {
                window.location.reload();
            });
            $('#btnMsgTrack').click(function () {
                window.location = '../MsgTrack/index.html' + location.search;
            });
            $('#voice').change(function () {
                var feedbackType = mini.get('feedbackType');
                if ($(this).is(':checked')) {
                    feedbackType.setEnabled(true);
                } else {
                    feedbackType.select(0);
                    feedbackType.setEnabled(false);
                }
            });
            $('#btnDel').click(function () {
                var grid = mini.get('datagrid');
                var rows = grid.getSelecteds();
                if (rows.length == 0) {
                    layer.msg('请选择要删除的数据');
                }
                grid.removeRows(rows);
            });
            $('#btnQuery').click(function () {
                page.logic.searchPerson();
            });
            $('#btnTempQuery').click(function () {
                page.logic.searchTempPerson();
            });
            $('#btnSave').click(function () {
                page.logic.savePersonGroup();
            });
            $('#btnAdd').click(function () {
                page.logic.addPerson();
            });
            $('#btnSend').click(function () {
                page.logic.sendMsg();
            });
            $('#btnTempAdd').click(function () {
                page.logic.tempAdd();
            });
            //下拉框
            mini.get("enterpriseCode").on("nodeclick", function (e) {
                page.logic.load_sidebar(page.commGroupsTypeUrl, "commGroupsType", e.node.orgCode); //树形菜单
            });
            //公共组
            mini.get("commGroupsType").on("nodedblclick", function (e) {
                page.logic.addPersonToTable(e.row[this.idField]); //表格
            });
            //个人组
            mini.get("userGroups").on("nodedblclick", function (e) {
                page.logic.initTable(e.row[this.idField]); //表格
            });
            $('[tabindex="1"]').click(function () {
                $.ajax({
                    url: weatherUrl,
                    type: 'GET',
                    dataType: 'text',
                    success: function (data) {
                        $('#autoMsg').val($('#autoMsg').val() + data);
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            initPage: function () {
                //0、日常调度；1、应急事件；
                var model = page.logic.getQueryString('PageModel');
                if (model == 1) {
                    $('#em').attr('checked', 'checked');
                    $('[tabindex="2"],[tabindex="3"],[tabindex="4"]').show();
                    $.ajax({
                        url: page.emEventUrl + '?eventId=' + page.logic.getQueryString('eventId'),
                        type: "get",
                        success: function (data) {
                            $('#event').text(data.eventSummary);
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    })
                } else {
                    $('#day').attr('checked', 'checked');
                }

                page.logic.initTempTable();
            },
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
                                // page.logic.get_list(riskorg_url, $("#drtDeptCode"), mini.get("#enterpriseCode").data[0].orgId);
                            } else {
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("enterpriseCode").disable();
                                for (var w = 0; w < Data.length; w++) {
                                    (function (cur_key) {
                                        if (cur_key.orgCode == enterpriseCode) {
                                            mini.get("enterpriseCode").setValue(cur_key.orgCode);
                                            // page.logic.get_list(riskorg_url, $("#drtDeptCode"), cur_key.orgId);
                                        }
                                    })(Data[w]);
                                }
                            }
                            page.logic.load_sidebar(page.commGroupsTypeUrl, "commGroupsType", enterpriseCode); //树形菜单
                            cb && cb();
                        }
                    }
                });
            },
            //公共组
            load_sidebar: function (treeUrl, oPar, pid) {
                $.ajax({
                    url: treeUrl + "?enterpriseCode=" + pid,
                    type: "get",
                    success: function (data) {
                        mini.get(oPar).loadData(data);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            //个人组
            initData: function () {
                $.ajax({
                    url: page.personGroupsUrl,
                    type: "get",
                    success: function (data) {
                        if (data == null || data == undefined || data.length == 0) {
                            return;
                        }
                        mini.get('userGroups').loadData(data);
                        mini.get('userGroups').select(0);
                        page.logic.initTable(mini.get('userGroups').getValue()); //表格
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
                ECS.util.bindCmb({
                    ctrId: 'feedbackType',
                    url: page.feedbackTypeUrl
                }, function () {
                    mini.get('feedbackType').select(0);
                });
            },
            searchPerson: function () {
                var userName = $.trim($('#userName').val());
                var grid = mini.get("datagrid");
                if (dataSource == null) {
                    dataSource = grid.data;
                }
                var result = [];
                for (var i = 0, len = dataSource.length; i < len; i++) {
                    if (dataSource[i].userName.indexOf(userName) > -1) {
                        result.push(dataSource[i]);
                    }
                }
                grid.setData(result);
            },
            searchTempPerson: function () {
                var userName = $.trim($('#tempUserName').val());
                $.ajax({
                    url: tempPersonUrl,
                    type: 'GET',
                    success: function (result) {
                        var grid = mini.get("tempDatagrid");
                        var data = [];
                        for (var i = 0, len = result.length; i < len; i++) {
                            if (result[i].privatePersonName.indexOf(userName) > -1) {
                                data.push(result[i]);
                            }
                        }
                        grid.setData(data);
                    }
                });
            },
            savePersonGroup: function () {
                var gridData = mini.get('datagrid').getSelecteds();
                if (gridData.length == 0) {
                    layer.msg('请先选择人员');
                    return;
                }
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['400px;', '300px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'addPersonGroup.html?r=' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var selecteds = mini.get('datagrid').getSelecteds();
                        var ids = '';
                        for (var i = 0, len = selecteds.length; i < len; i++) {
                            ids += selecteds[i].userID + ',';
                        }
                        ids = ids.substring(0, ids.length - 1);
                        personGroupArr = mini.get('userGroups').data;
                        var data = {
                            title: '添加个人通讯组',
                            personIds: ids,
                            personGroupArr: personGroupArr
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {

                    }
                })
            },
            addPerson: function () {
                var selectedNode = mini.get('userGroups').getSelectedNode();
                if (!selectedNode) {
                    layer.confirm('请先选择个人通讯组', {
                        btn: ['关闭']
                    }, function (index) {
                        layer.close(index)
                    })
                    return;
                }
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../../bc/RiskAnalysisPoint/SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            title: '选择人员',
                            userName: '',
                            orgCode: mini.get('enterpriseCode').getValue()
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        var data = [];
                        for (var i in window.ownDetail) {
                            var obj = {
                                userId: i,
                                commGroupId: selectedNode.commGroupid
                            };
                            data.push(obj);
                        }
                        if (data.length == 0) {
                            return;
                        }
                        $.ajax({
                            url: page.searchUrl,
                            async: false,
                            type: 'POST',
                            data: JSON.stringify(data),
                            dataType: "text",
                            contentType: "application/json;charset=utf-8",
                            beforeSend: function () {
                                ECS.showLoading();
                            },
                            success: function (result) {
                                ECS.hideLoading();
                                result = $.parseJSON(result);
                                if (result.isSuccess) {
                                    layer.msg(result.message, { time: 1000 }, function () {
                                        page.logic.initTable(selectedNode.commGroupid);
                                    });
                                } else {
                                    layer.msg(result.message);
                                }
                            },
                            error: function (result) {
                                ECS.hideLoading();
                                layer.msg(result.message);
                            }
                        })
                    }
                })
            },
            tempAdd: function () {
                ECS.util.detail({
                    url: 'addTempPerson.html',
                    width: 500,
                    height: 300,
                    data: {
                        title: '新增临时人员'
                    }
                });
            },
            //人员列表
            initTable: function (id) {
                mini.mask({
                    cls: 'mini-mask-loading',
                    html: '努力加载中...'
                });
                $.ajax({
                    async: true,
                    url: page.searchUrl + '?commGroupId=' + id,
                    type: 'GET',
                    success: function (result) {
                        var grid = mini.get("datagrid");
                        grid.setData(result.pageList);
                        mini.unmask();
                        $('.mini-grid-checkbox').removeClass('mini-grid-checkbox-checked');
                    },
                    error: function (e) {
                        mini.unmask();
                        console.log(e);
                    }
                });
            },
            initTempTable: function () {
                $.ajax({
                    url: tempPersonUrl,
                    type: 'GET',
                    success: function (result) {
                        var grid = mini.get("tempDatagrid");
                        grid.setData(result);
                    }
                });
            },
            addPersonToTable: function (id) {
                mini.mask({
                    cls: 'mini-mask-loading',
                    html: '努力加载中...'
                });
                var grid = mini.get("datagrid");
                var dataSource = grid.getData();
                $.ajax({
                    url: page.searchUrl + '?commGroupId=' + id,
                    type: 'GET',
                    success: function (result) {
                        var len = result.pageList.length;
                        while (len > 0) {
                            var user = result.pageList[len - 1];
                            var userId = user.userID;
                            var dlen = dataSource.length;
                            var flag = true;
                            while (dlen > 0) {
                                if (userId == dataSource[dlen - 1].userID) {
                                    flag = false;
                                }
                                dlen--;
                            }
                            if (flag) {
                                grid.addRow(user);
                            }
                            len--;
                        }
                        mini.unmask();
                    },
                    error: function (result) {
                        mini.unmask();
                        console.log(result);
                    }
                });
            },
            getQueryString: function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null)
                    return decodeURI(r[2]);
                return null;
            },
            onBeforeOpen: function (e) {
                var menu = e.sender;
                var tree = mini.get("userGroups");
                var node = tree.getSelectedNode();
                if (!node) {
                    e.cancel = true;
                    return;
                }
                if (node && node.text == "Base") {
                    e.cancel = true;
                    e.htmlEvent.preventDefault();
                    return;
                }
                var Event = e || window.event;
                if (Event.stopPropagation) { //W3C阻止冒泡方法
                    Event.stopPropagation();
                } else {
                    Event.cancelBubble = true; //IE阻止冒泡方法
                }
            },
            onRemoveNode: function (e) {
                var id = mini.get("userGroups").getSelectedNode().personGroupId;
                layer.confirm('确定删除选中的通讯组？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: page.personGroupsUrl,
                        async: false,
                        data: JSON.stringify({ personGroupId: id }),
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        success: function (result) {
                            if (result.isSuccess) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    page.logic.initData();
                                })
                            } else {
                                layer.msg(result.message);
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            sendMsg: function () {
                if ($('[name=sendType]:checked').length == 0) {
                    alert('请选择发送类型');
                    return;
                }
                var gridData = mini.get('datagrid').data;
                var tempGridData = mini.get('tempDatagrid').getSelecteds();
                var recevieCount = gridData.length + tempGridData.length;
                if (recevieCount == 0) {
                    alert('请添加接收人');
                    return;
                }
                if ($.trim($('#autoMsg').val()) == '') {
                    alert('请填写发送内容');
                    return;
                }
                var sendType = -1;
                if ($('[name=sendType]:checked').length == 2) {
                    sendType = 3;
                }
                else if ($('#msg').is(':checked')) {
                    sendType = 1;
                }
                else if ($('#voice').is(':checked')) {
                    sendType = 2;
                }
                var data = {
                    businessID: page.logic.getQueryString('eventId'),
                    commuType: sendType,
                    feedbackTypeId: mini.get('feedbackType').getValue(),
                    infoRecordEntity: []
                }
                var phoneNums = [];
                for (var i = 0, len = gridData.length; i < len; i++) {
                    var obj = {
                        answerName: gridData[i].userName,
                        answerPhoneNumber: gridData[i].userMobile,
                        remarks: $.trim($('#autoMsg').val())
                    }
                    data.infoRecordEntity.push(obj);
                    if (gridData[i].mark == 1) {
                        phoneNums.push(gridData[i].userPhone);
                    }
                    else {
                        phoneNums.push(gridData[i].userMobile);
                    }
                }
                var tempPersonData = mini.get('tempDatagrid').getSelecteds();
                for (var i = 0, len = tempPersonData.length; i < len; i++) {
                    var obj = {
                        answerName: tempPersonData[i].privatePersonName,
                        answerPhoneNumber: tempPersonData[i].privatePersonMobile,
                        remarks: $.trim($('#autoMsg').val())
                    }
                    data.infoRecordEntity.push(obj);
                    if (tempPersonData[i].mark == 1) {
                        phoneNums.push(tempPersonData[i].privatePersonPhone);
                    }
                    else {
                        phoneNums.push(tempPersonData[i].privatePersonMobile);
                    }
                }
                if (sendType == 2 || sendType == 3) {
                    if (page.logic.isExists(phoneNums)) {
                        return;
                    }
                }
                $.ajax({
                    url: page.sendMsg,
                    async: false,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSend').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        layer.msg(result, { time: 1000 }, function () {
                            location.reload();
                        });
                        if (sendType == 2 || sendType == 3) {
                            var res = parent.sendvox(phoneNums, $.trim($('#autoMsg').val()));
                            //alert(res);
                        }
                    },
                    error: function (result) {
                        $('#btnSend').attr('disabled', false);
                        ECS.hideLoading();
                        layer.msg(result);
                    }
                })
            },
            rendererOperate: function (e) {
                var id = e.record.privatePersonId;
                return '<a href="javascript:page.logic.del(' + id + ')">删除</a>';
            },
            del: function (id) {
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delTempPersonUrl,
                        data: JSON.stringify(id),
                        dataType: "text",
                        timeout: 1000,
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (result) {
                            result = $.parseJSON(result);
                            if (result.isSuccess) {
                                layer.msg('删除成功', {
                                    time: 1000
                                }, function () {
                                    page.logic.initTempTable();
                                });
                            }
                            else {
                                layer.msg(result.message, {
                                    time: 1000
                                });
                            }
                            ECS.hideLoading();
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            onDrawcell: function (e) {
                if (e.field == 'mark' && e.record.userPhone == '') {
                    e.cellHtml = '';
                } else if (e.field == 'mark' && e.record.privatePersonPhone == '') {
                    e.cellHtml = '';
                }
            },
            isExists: function (arr) {
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