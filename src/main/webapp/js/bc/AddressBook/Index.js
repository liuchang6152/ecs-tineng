
var searchUrl = ECS.api.bcUrl + '/addressBook/getOrgUserByOrgId';                               //数据的处理（查询）

var porg_url = ECS.api.bcUrl + '/org/porgNames?isAll=true';                      //上层名称
var porg_urls = ECS.api.bcUrl + '/org/porgNameOne'; //企业树
var riskorg_url = ECS.api.bcUrl + '/org/porgName';
var reutnName = '';
var grid = null; //全局变量
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
            page.logic.load_sidebar(); //左侧菜单
            page.logic.enterprise(riskorg_url, "enterpriseCode");

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
                    $(this).css({
                        "left": "0",
                        "transform": "rotate(180deg)"
                    });
                } else {
                    $(".leftNav-body").show();
                    $('.box-body').css("margin-left", "280px");
                    $(this).css({
                        "left": "263px",
                        "transform": "rotate(0deg)"
                    });
                }
                isHiden = !isHiden;
                page.logic.search();
            });
            //左侧空白处，点击右键菜单
            $("#treeMenu2 li").click(function () {
                page.logic.onAddNode2();
            });
            //企业修改
            $("#enterpriseCode").change(function () {
                page.logic.enterprisechanged();
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
             rightmenu: function (elementID, menuID) {
                 var menu = document.getElementById(menuID); //获取菜单对象
                 var element = document.getElementById(elementID); //获取点击拥有自定义右键的 元素
                 element.onmousedown = function (aevent) { //设置该元素的 按下鼠标右键右键的 处理函数
                     if (window.event) aevent = window.event; //解决兼容性
                     if (aevent.button == 2) { //当事件属性button的值为2时，表用户按下了右键
                         document.oncontextmenu = function (aevent) {
                             if (window.event) {
                                 aevent = window.event;
                                 aevent.returnValue = false; //对IE 中断 默认点击右键事件处理函数
                             } else {
                                 aevent.preventDefault(); //对标准DOM 中断 默认点击右键事件处理函数
                             };
                         };
                         menu.style.cssText = 'display:block;top:' + (aevent.pageY - 50) + 'px;' + 'left:' + aevent.pageX + 'px;'
                         //将菜单相对 鼠标定位
                     }
                 };
                 menu.onmouseout = function () { //设置 鼠标移出菜单时 隐藏菜单
                     setTimeout(function () {
                         menu.style.display = "none";
                     }, 400);
                 }
             },
            // 企业改变事件
            enterprisechanged: function () {
                page.logic.load_sidebar(porg_urls); //侧边栏菜单的刷新

            },
             //侧边栏菜单添加
             load_sidebar: function () {
                 var enterprise = $("#enterpriseCode").val();
                console.log(enterprise)
                 var _url = porg_url + "?orgCode=" + enterprise;
                 // if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                 //     _url=org_url;
                 // }else{
                 //     _url=porg_url+"?orgCode="+enterprise;
                 // }
                 $.ajax({
                     url: _url,
                     type: "GET",
                     success: function (Data) {
                         if (Data.length > 0) {
                             mini.get("tree1").loadList(Data, "orgId", "orgPID");
                             page.logic.search();
                         } else {
                             page.logic.rightmenu("left_tree", "treeMenu2");
                         }
                     },
                     error: function () {
                         page.logic.rightmenu("left_tree", "treeMenu2");
                     }
                 });
             },
             //企业名称
             enterprise: function (menu_url, oPar) {
                 $.ajax({
                     url: menu_url + "?orgLvl=1",
                     type: "get",
                     success: function (data) {
                        console.log(data)
                         var datalist = [];
                         // //若是企业用户，设置为不可用状态；
                         if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
                             $.each(data, function (i, el) {
                                 datalist.push({
                                     id: el["orgCode"],
                                     text: el["orgSname"],
                                     orgId: el["orgId"]
                                 });
                             });
                         } else {
                             var newList = JSLINQ(data).Where(function (x) {
                                 return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE;
                             }).ToArray();
                             $.each(newList, function (i, el) {
                                 datalist.push({
                                     id: el["orgCode"],
                                     text: el["orgSname"],
                                     orgId: el["orgId"]
                                 });
                             });
                             $('#' + oPar).attr('disabled', 'disabled');
                         }
                         orgList = datalist;
                         $('#' + oPar).select2({
                             tags: false,
                             data: datalist,
                             language: {
                                 noResults: function (params) {
                                     return "没有匹配项";
                                 }
                             },
                         });
                         page.logic.enterprisechanged();
                     },
                     error: function (e) {
                         layer.msg("系统繁忙");
                     }
                 })
             },
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
               * 搜索
               */
              search: function (sort) {
                  page.data.param = {};
                  page.data.param = ECS.form.getData("searchForm");
                  //倒序
                  if (sort) {
                      page.data.param["sortType"] = 1;
                  }
                  //上层名称节点id
                  if (mini.get("tree1").getSelectedNode()) {
                      page.data.param.orgId = mini.get("tree1").getSelectedNode().orgId;
                  } else {
                      page.data.param.orgId = mini.get("tree1").data[0].orgId;
                  }
                //   grid.load(page.data.param);
              },
            /**
             * 初始化表格
             */
            initTable: function () {
                //侧边栏菜单的添加
                // page.logic.load_sidebar(porg_url);
                 page.logic.enterprise(riskorg_url, "enterpriseCode");

                //  //所有查询条件的添加；
                //  //机构类型
                //  page.logic.select_option(orgType_url, $("#orgTypeID"));
                //  //机构级别
                //  page.logic.select_option(orgLvl_url, $("#orgLvlID"));
                //  //机构性质
                //  page.logic.select_option(orgNature_url, $("#orgNatureID"));
            },
            //侧边栏菜单添加
            load_sidebar: function (menu_url, cb) {
                var enterprise = $("#enterpriseCode").val();
                console.log(enterprise)
                var _url = porg_urls + "?orgCode=" + ECS.sys.Context.SYS_ENTERPRISE_CODE;
                // if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                //     _url=org_url;
                // }else{
                //     _url=porg_url+"?orgCode="+enterprise;
                // }
                $.ajax({
                    url: _url,
                    type: "GET",
                    success: function (Data) {
                        if (Data.length > 0) {
                            mini.get("tree1").loadList(Data, "orgId", "orgPID");
                            page.logic.search();
                        } else {
                            page.logic.rightmenu("left_tree", "treeMenu2");
                        }
                    },
                    error: function () {
                        page.logic.rightmenu("left_tree", "treeMenu2");
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