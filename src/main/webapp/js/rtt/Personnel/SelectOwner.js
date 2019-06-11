var orgNameUrl = ECS.api.bcUrl + '/user/orgName'; //人员
var pageMode = PageModelEnum.Details;
var items;
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
                $(this).val($.trim($(this).val()));
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
            //员工姓名
            select_option:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success:function (data) {
                        ECS.hideLoading();
                        mini.get(oPar).loadList(data, "zid", "orgPID");
                    },
                    error: function (result) {
                        ECS.hideLoading();
                    }
                })
            },
            //选中
            moveAdd:function(){
                items = mini.get("tree1").getSelectedNode();
                $("#grid2 p").text(items.showStr);
                $("#grid2 p").attr("id",items.userID);
                $("#grid2 p").click(function() {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
            },
            //移除
            moveRemove:function(){
                $(".selected").html('');
                selectUser={};
            },
            //判断是组织机构还是人员
            onDrawNode:function(e){
                var tree = e.sender;
                var node = e.node.userID;
                if(node==null){
                    e.iconCls = "mini-tree-folder";
                }else{
                    e.iconCls = "mini-tree-user";
                }
            },
            //禁止选中组织机构
            beforenodeselect:function(e){
                var node = e.node.userID;
                if (e.node.userID == null) e.cancel = true;
            },
            //过滤
            search:function(){
                mini.parse();
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
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if(data.userInfo){
                    $("#grid2 p").text(data.userInfo.userName);
                    $("#grid2 p").attr("id",data.userInfo.userID);
                    $("#grid2 p").click(function() {
                        $(this).siblings('p').removeClass('selected');
                        $(this).addClass('selected');
                    });
                }
                page.logic.select_option(orgNameUrl+"?orgCode="+data.orgCode,"#tree1");//员工姓名
            },
            /**
             * 保存
             */
            save: function () {
                if(items){
                    parent.ownDetail=items.userID;
                }
                page.logic.closeLayer(true);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);

            }
        }
    };
    page.init();
    window.page = page;
});