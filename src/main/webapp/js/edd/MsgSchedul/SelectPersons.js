var orgNameUrl = ECS.api.eddUrl + '/eddSchedul/tree'; //人员
var enterpriseCodeUrl = ECS.api.emUrl + '/CommGroups/porgName?orgLvl=1'; //企业
var pageMode = PageModelEnum.Details;
window.pageLoadMode = PageLoadMode.None;
var multiSelect = false;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            //获取用户的相关数据
			ECS.sys.RefreshContextFromSYS();
            mini.parse();
            page.logic.initOrgName(orgNameUrl, "#tree1");//人员
            page.logic.select_option();
            this.bindUI();
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
            $("#add").click(function () {
                page.logic.moveAdd();
            });
            $("#remove").click(function () {
                page.logic.moveRemove();
            });
        },
        logic: {
            select_option: function () {
				$.ajax({
					url: enterpriseCodeUrl,
					type: "get",
					success: function (data) {
						mini.get("enterpriseCode").loadList(data, "orgCode", "porgCode");
					
						//若是企业用户，设置为不可用状态；
						if (ECS.sys.Context.SYS_IS_HQ) {
							mini.get("enterpriseCode").setValue(data[0].orgCode);
						} else {
							enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
							mini.get("enterpriseCode").disable();

							for (var w = 0; w < data.length; w++) {
								(function (cur_key) {
									if (cur_key.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE) {
										mini.get("enterpriseCode").setValue(cur_key.orgCode);

										
									}
								})(data[w]);
							}
						}
					
					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                multiSelect = data.multiSelect;
                // if (data.userName.length > 0) {
                //     var editUserId = data.userId.split(",");
                //     for (var i = 0; i < data.userName.length; i++) {
                //         $("#grid2").append("<p name='" + data.userName[i] + "' id='" + editUserId[i] + "'>" + data.userName[i] + "</p>");
                //     }
                // }
                $("#grid2 p").click(function () {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
            },
            //员工姓名
            initOrgName: function (menu_url, oPar) {
                $.ajax({
                    url: menu_url+'?orgCode='+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type: "get",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        mini.get(oPar).loadList(data, "selfId", "pid");
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //选中
            moveAdd: function () {
                var items = mini.get("tree1").getSelectedNode();
                var userMobile = items.userMobile;
                var userPhone = items.userPhone;
                var dutyType = items.dutyType;
                var teamName = items.teamName;
                var userName = items.name;
                var userId = items.userId;

                var jsonData = JSON.stringify(items);
                var hasitem = false;

                var this_id = $("#grid2 p");
                for (var i = 0; i < $("#grid2 p").length; i++) {
                    if (items.userID == this_id[i].id) {
                        hasitem = true;
                    }
                }
                if (!hasitem) {
                    if (!multiSelect) {
                        $("#grid2").empty();
                    }
                     $("#grid2").append("<p data='"+jsonData+"' name='"+userName+"' id='"+userId+"'>"+userName+"</p>");
                  //  $("#grid2").append(`<p name="${userName}" id="${userId}" data='${jsonData}' >${userName}</p>`);
                }


                $("#grid2 p").click(function () {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
            },
            //移除
            moveRemove: function () {
                $(".selected").remove();
            },
            //判断是组织机构还是人员
            onDrawNode: function (e) {
                var tree = e.sender;
                var node = e.node.userId;
                if (node == null) {
                    e.iconCls = "mini-tree-folder";
                } else {
                    e.iconCls = "mini-tree-user";
                }
            },
            //禁止选中组织机构
            beforenodeselect: function (e) {
                var node = e.node.userId;
                if (e.node.userId == null) e.cancel = true;
            },
            //过滤
            search: function () {
                var key = mini.get("key").getValue();
                if (key == "") {
                    mini.get("tree1").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("tree1").filter(function (node) {
                        var text = node.name ? node.name : "";
                        if (text.indexOf(key) != -1) {
                            return true;
                        }
                    });
                }
            },

            /**
             * 保存
             */
            save: function () {
                var personArr = [];
                if ($("#grid2 p").length > 0) {
                    for (var i = 0; i < $("#grid2 p").length; i++) {
                        var ownDetail = {};
                        ownDetail.userId = $("#grid2 p").eq(i).attr("id");
                        ownDetail.userName = $("#grid2 p").eq(i).attr("name");
                        ownDetail.data = $("#grid2 p").eq(i).attr("data");
                        personArr.push(ownDetail);
                    }
                }
                parent.ownDetail = personArr;
                page.logic.closeLayer(true);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);

            },
        }
    }
    page.init();
    window.page = page;
})