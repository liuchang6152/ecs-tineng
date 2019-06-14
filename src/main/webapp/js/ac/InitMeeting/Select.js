var searchUrl = ECS.api.emUrl + '/meetingUser/getUnconnectedUser';
var deleteUrl = ECS.api.emUrl + '/meetingUser';
var saveUrl = ECS.api.emUrl + '/meetingRecord';
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var oid = "";
var meetingRecordId = '';
//var userList = null;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();

            ECS.sys.RefreshContextFromSYS();//获取当前用户

            var height = document.body.clientHeight - 150 + 'px';

            $("#datagrid").css("height", height);
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });


            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择", PageModelEnum.Details)
            });

            $("#btnDel").click(function () {
                page.logic.delAll()
            });
        },
        logic: {
            setData: function (recordId, users) {
                meetingRecordId = recordId;
                //userList = users;
                //page.logic.search();
            },

            setWay: function (e) {

                if (!e.row.mobile) {
                    return "<label>座机</label>";
                }
                var flag = e.value != 1 ? "checked='checked'" : "";

                var input = '<label><input type="checkbox" ' + flag + '/> 手机</label>';

                return input;
            },
            setStatus: function () {
                return "未接通";
            },

            // search: function () {
            //     var grid = mini.get("datagrid");
            //     grid.set({
            //         url: searchUrl + "?meetingRecordId=" + meetingRecordId,
            //         ajaxType: "get",
            //         dataField: "pageList"
            //     });

            //     grid.load();
            // },
            /**
			 * 批量删除
			 */
            delAll: function () {
                var grid = mini.get("datagrid");
                var rows = grid.getSelecteds();
                if (rows.length > 0) {
                    grid.removeRows(rows, true);
                }
                return false;

                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    if (!el.meetingUserId) {
                        return;
                    }

                    idsArray.push({
                        meetingUserId: el.meetingUserId
                    });
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: deleteUrl,
                        async: true,
                        data: JSON.stringify(idsArray),
                        dataType: "json",
                        timeout: 1000,
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        success: function (result) {
                            if (result.isSuccess) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    grid.reload();
                                });
                            } else {

                                layer.msg(result.message)
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg("系统繁忙");
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            //人员选择
            selectOwner: function (title, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '100%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../../em/CommGroup/SelectPersons.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title + "(单选)",
                            'multiSelect': false,
                            orgCode: ECS.sys.Context.SYS_ENTERPRISE_CODE
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        var oldList = mini.get("datagrid").getData();
                        var returnlist = window.ownDetail;
                        //var userList = [];
                        for (var index = 0; index < returnlist.length; index++) {
                            var element = returnlist[index];
                            // if (!page.logic.isExists(oldList, window.ownDetail[index].userId)) {
                            var user = {
                                name: 'New Row',
                                userId: element.userId,
                                nameCode: element.userName + '(' + element.userId + ')',
                                mobile: element.userMobile,
                                phone: element.userPhone,
                                isHandSet: 0
                            };
                            //userList.push(user);
                            var grid = mini.get("datagrid");
                            grid.addRow(user);
                            // } else {
                            //     layer.msg(window.ownDetail[index].userName + "已存在");
                            // }
                        }


                    }
                })
            },
            // isExists: function (data, id) {
            //     if (!data) {
            //         return false;
            //     }
            //     var len = data.length;
            //     while (len-- > 0) {
            //         if (data[len].userId == id) {
            //             return true;
            //         }
            //     }
            //     var len2 = userList.length;
            //     while (len2-- > 0) {
            //         if (userList[len2].userId == id) {
            //             return true;
            //         }
            //     }
            //     return false;
            // },
            /**
             * 保存 
             */
            save: function () {
                var submitData = {
                    meetingRecordId: meetingRecordId,
                    meetingUserEntityList: []
                }
                var list = mini.get("datagrid").getData();
                if (list.length > 20) {
                    layer.msg('参会人员最多为20人');
                    return;
                }

                var phoneNums = [];
                $(list).each(function (e) {
                    var user = {
                        meetingUserId: list[e].meetingUserId,
                        userId: list[e].userId,
                        isHandset: list[e].isHandSet,
                        connectionNumber: list[e].isHandSet == 0 ? list[e].phone : list[e].mobile
                    }
                    submitData.meetingUserEntityList.push(user);
                    phoneNums.push(list[e].isHandSet == 0 ? list[e].phone : list[e].mobile);
                });
                window.pageLoadMode = PageLoadMode.Reload;

                if(parent.page.logic.isExistsArr(phoneNums)){
                    return;
                }

                $.ajax({
                    url: saveUrl,
                    async: false,
                    type: "POST",
                    data: JSON.stringify(submitData),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.isSuccess) {
                            parent.parent.meetAdd(phoneNums);
                            layer.msg('呼叫成功', {
                                time: 1000
                            }, function () {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg('呼叫失败');
                        }
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        layer.msg('系统繁忙');
                    }
                })
            },
            onCellbeginedit: function (e) {
                if (e.field == 'isHandSet' && (e.record.phone == '' || e.record.mobile == '')) {
                    e.cancel = true;
                }
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }

        }
    }
    page.init();
    window.page = page;
})