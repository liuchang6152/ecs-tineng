
var searchUrl = ECS.api.bcUrl + '/addressBook/getOrgUserByOrgId';                               //数据的处理（查询）

var porg_url = ECS.api.bcUrl + '/org/porgNames?isAll=true';                      //上层名称
var reutnName = '';
var vm = new Vue({
    el: '#main',
    data: {
        items: []

    }, methods: {
        isShow: function (e) {
            if (e && e.length > 0) {
                return true;
            }
            return false;
        }
    }

});
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            page.logic.initTable();

        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });

            //侧边栏菜单添加点击,进行查询
            mini.get("tree1").on("nodeselect", function () {
                page.logic.typelist_dt();
            });
            //左侧树级菜单_查询（筛选树菜单）
            $('#btnQuery2').click(function () {
                var key = $.trim($("#tree_val").find("input").val());
                if (key == "" || key == "全部") {
                    mini.get("tree1").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("tree1").filter(function (node) {
                        var text = node.orgSname ? node.orgSname.toLowerCase() : "";
                        if (text.indexOf(key) != -1) {
                            return true;
                        }
                    });
                }
            });
            //点击左侧展开收缩
            var isHiden = true;
            $('.btn-toggle').click(function () {
                if (isHiden) {
                    $(".leftNav-body").hide();
                    $('.box-body').css("margin-left", "0");
                    $(this).css({ "left": "0", "transform": "rotate(180deg)" });
                } else {
                    $(".leftNav-body").show();
                    $('.box-body').css("margin-left", "280px");
                    $(this).css({ "left": "263px", "transform": "rotate(0deg)" });
                }
                isHiden = !isHiden;

            });
            //左侧空白处，点击右键菜单
            $("#treeMenu2 li").click(function () {
                page.logic.onAddNode2();
            });
        },
        data: {
            param: {}
        },
        template: function (info, flag) {
            var node = mini.get("tree1").getSelectedNode();
            var phoneNum = flag == 1 ? info.userMobile : info.userPhone;
            parent.call(phoneNum);
        },
        logic: {
            callMobile: function (e) {
                page.template(e, 1);
            },
            callPhone: function (e) {
                page.template(e, 2);
            },
            sendMsg: function (obj) {
                var type = 'auto';
                layer.open({
                    type: 2
                    , area: ['30%', '45%']
                    , offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                    , id: 'layerDemo' + type //防止重复弹出
                    , content: 'SenderMsg.html?' + Math.random()
                    , btnAlign: 'c' //按钮居中
                    , shade: 0 //不显示遮罩
                    , yes: function () {
                        layer.closeAll();
                    }, title: "短信编辑",
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "phone": obj.userMobile
                        };

                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {

                    }
                });
            },
            /**
             * 初始化表格
             */
            initTable: function () {
                //侧边栏菜单的添加
                page.logic.load_sidebar(porg_url);
            },
            //侧边栏菜单添加
            load_sidebar: function (menu_url, cb) {
                $.ajax({
                    url: menu_url,
                    type: "GET",
                    success: function (Data) {
                        if (Data.length > 0) {
                            mini.get("tree1").loadList(Data, "orgId", "orgPID");
                            mini.get("tree1").setValue("-1");
                        } else {

                        }
                        cb && cb();
                    },
                    error: function () {

                    }
                });
            },
            getLevenName: function (node, name) {
                var pNode = mini.get("tree1").getParentNode(node);
                if (pNode._level > -1) {
                    name += "$$" + pNode.orgSname;
                    page.logic.getLevenName(pNode, name);
                } else {
                    reutnName = name
                }
                return reutnName;
            },
            /*侧边栏菜单搜索列表数据*/
            typelist_dt: function () {
                page.data.param = {}
                //获取树选中的节点id和code;
                if (mini.get("tree1").getSelectedNode()) {
                    var node = mini.get("tree1").getSelectedNode();
                    var name = node.orgSname;
                    var position = page.logic.getLevenName(node, name);
                    var strArr = position.split('$$');
                    var title = '';
                    for (var index = strArr.length; index > 0; index--) {
                        title += strArr[index - 1] + (index == 1 ? "" : "  >  ");

                    }
                    $("#sp_position").text("" + title);
                    page.data.param["orgId"] = mini.get("tree1").getSelectedNode().orgId;    //上层名称节点id
                }
                $.ajax({
                    url: searchUrl + "/" + mini.get("tree1").getSelectedNode().orgId,
                    type: "get",
                    success: function (data) {
                        vm.items = data;
                    },
                    error: function (e) {
                        //	alert(e);
                    }
                })
            }
        }
    };
    page.init();
    window.page = page;
});