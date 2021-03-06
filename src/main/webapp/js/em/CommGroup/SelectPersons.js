var orgNameUrl = ECS.api.bcUrl + '/user/orgName'; //人员
var pageMode = PageModelEnum.Details;
var nsCode= "";
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
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
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                nsCode = data.orgCode;
                // if(data.userName.length>0){
                //     var editUserId=data.userId.split(",");
                //     for(var i=0;i<data.userName.length;i++){
                //         $("#grid2").append("<p name='"+data.userName[i]+"' id='"+editUserId[i]+"'>"+data.userName[i]+"</p>");
                //     }
                // }
                $("#grid2 p").click(function () {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
                 page.logic.initOrgName(orgNameUrl, "#tree1"); //人员
            },
            //员工姓名
            initOrgName: function (menu_url, oPar) {
                $.ajax({
                    url: menu_url + '?orgCode=' + nsCode,
                    type: "get",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        mini.get(oPar).loadList(data, "zid", "orgPID");
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
                var hasitem = false;
                var this_id = $("#grid2 p");
                for (var i = 0; i < $("#grid2 p").length; i++) {
                    if (items.userID == this_id[i].id) {
                        hasitem = true;
                    }
                }
                if (!hasitem) {
                    $("#grid2").append("<p data-mobile='" + items.userMobile + "' data-phone='" + items.userPhone + "' name='" + items.userName + "' id='" + items.userID + "'>" + items.userName + "</p>");
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
                var node = e.node.userID;
                if (node == null) {
                    e.iconCls = "mini-tree-folder";
                } else {
                    e.iconCls = "mini-tree-user";
                }
            },
            //禁止选中组织机构
            beforenodeselect: function (e) {
                var node = e.node.userID;
                if (e.node.userID == null) e.cancel = true;
            },
            //过滤
            search: function () {
                var key = mini.get("key").getValue();
                if (key == "") {
                    mini.get("tree1").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("tree1").filter(function (node) {
                        var text = node.userName ? node.userName : "";
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
                var users = [];
                if ($("#grid2 p").length > 0) {
                    for (var i = 0; i < $("#grid2 p").length; i++) {
                        var obj = {};
                        obj.userId = $("#grid2 p").eq(i).attr("id");
                        obj.userName = $("#grid2 p").eq(i).attr("name");
                        obj.userMobile = $("#grid2 p").eq(i).attr("data-mobile");
                        obj.userPhone = $("#grid2 p").eq(i).attr("data-phone");
                        users.push(obj);
                    }
                }
                parent.ownDetail = users;
                page.logic.closeLayer(true);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                if (!isRefresh) {
                    parent.ownDetail = [];

                }
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);

            },
        }
    }
    page.init();
    window.page = page;
})