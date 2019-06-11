var delUrl = ECS.api.bcUrl + '/user'; //删除（批量删除）
var searchUrl = ECS.api.bcUrl + '/user'; //数据的处理（查询）
var inUseUrl = ECS.api.commonUrl + "/getInUse"; //是否启用
var exportUrl = ECS.api.bcUrl + '/user/ExportToExcel'; //导出
var porg_url = ECS.api.rttUrl + '/videoSurveullance/getTreeRoot?userName=emergency'; //总部树
var org_url = ECS.api.bcUrl + '/org/porgNameOne'; //企业树
var postNames_url = ECS.api.bcUrl + "/user/getAllPost"; //岗位
var userSex_url = ECS.api.rttUrl + "/expert/getExpertSexEnumList"; //性别
var userLvl_url = ECS.api.bcUrl + "/user/getAllUserLvl"; //行政级别（员工级别）
var userNature_url = ECS.api.bcUrl + "/user/getAllUserNature"; //员工性质
window.pageLoadMode = PageLoadMode.None;
pageflag = true;
pageflag = true;
redisKey = '';
var grid = null;
var getNode = "-1";
var isHiden = true;
var flag = false;
var passageway;
$(function () {
    var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            //初始化查询是否启用
            // page.logic.initInUse();
            page.logic.initTable();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //关闭弹窗
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //保存；
            $("#btnSave").on("click", function () {
                page.logic.save();
            });
            //搜索栏中input不允许输入空格
            // $('input').blur(function () {
            //     $(this).val($.trim($(this).val()));
            // });
            // // 新增
            // $('#btnAdd').click(function () {
            //     page.logic.add('新增', "", PageModelEnum.NewAdd);
            // });
            // //批量删除
            // $('#btnDel').click(function () {
            //     page.logic.delAll();
            // });
            // //查询
            // $('#btnQuery').click(function () {
            //     page.logic.search();
            // });
            // // 导入
            // $('#btnImp').click(function () {
            //     page.logic.imp();
            // });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {}; //空对象
                page.data.param = ECS.form.getData("searchForm");

                //是否启用的数据进行处理，inUse是否为空？
                if (page.data.param.inUse == "-1") {
                    page.data.param.inUse = "";
                }
                //左侧的树菜单是否有选中的数据；
                //获取树选中的节点id和code;
                if (mini.get("tree1").getSelectedNode()) {
                    page.data.param["orgId"] = mini.get("tree1").getSelectedNode().orgId; //上层名称节点id
                } else {
                    page.data.param["orgId"] = mini.get("tree1").data[0].orgId;
                }
                if (page.data.param["orgId"] == -1) {
                    page.data.param["orgId"] = "";
                }
                var urlParam = page.logic.setUrlK(page.data.param);

                window.open(exportUrl + "?" + urlParam);

            });
            //搜索组件展示收缩
            $('#btnToggle').click(function () {
                if (flag) {
                    flag = !flag;
                    $(this).html('<i class="icon-showMore"></i>');
                    $(".search-unfixed").hide();
                } else {
                    flag = !flag;
                    $(this).html('<i class="icon-hideMore"></i>');
                    $(".search-unfixed").show();
                }
            });
            // 侧边栏菜单添加点击事件；
            mini.get("tree1").on("nodeclick", function (e, ev) {
                // if (e.node) page.logic.showFiles(e.node.id);
                //  var tree = e.sender; //树控件
                //  var node = e.node; //当前节点
                //  var params = e.params; //参数对象

                //  console.log(params);
                console.log(e);
                // var id = mini.get("tree1").getSelectedNode().id;
                //可以传递自定义的属性
                //  params.id = id; //后台：request对象获取"myField"
                // console.log(e.node)

                // getNode = mini.get("tree1").getValue(e.node);
                // // page.logic.search(1);
                var params = e.params; //参数对象
                var levelnode = mini.get("#tree1").getAncestors(e.node); //获取该节点所有父节点
                var nodepath = "";
                if (levelnode.length == 0) {
                    nodepath = e.node.text
                } else { //对路径进行拼接 ，用来为后台判断节点位置
                    for (i = 0; i < levelnode.length; i++) {
                        nodepath = nodepath + levelnode[i].text + "/";
                    }
                    nodepath = nodepath + e.node.text;
                }
                //可以传递自定义的属性
                var id = null;
                if (levelnode.length > 0) {
                    id = levelnode[0].id;
                } else {
                    id = "0";
                }
                $.ajax({
                    url: ECS.api.rttUrl + '/videoSurveullance/getTreeOrgAndChannel?userName=emergency&type=1' + '&id=' + mini.get("tree1").getSelectedNode().id,
                    type: "GET",
                    success: function (res) {
                        console.log(res);
                        if (res.length == 0) {
                            $('#filesView').html('');
                            $.ajax({
                                async: false,
                                url: ECS.api.rttUrl + '/videoSurveullance/getVideoByChannels?userName=emergency&id=' + mini.get("tree1").getSelectedNode().id,
                                type: "GET",
                                dataType: "text",
                                success: function (res) {
                                    var nsRes = JSON.parse(res);
                                    console.log(nsRes);
                                    if (nsRes.length != 0) {
                                        $('#filesDataView').show();
                                        for (var i = 0; i < nsRes.length; i++) {
                                            var item;
                                            if (nsRes[i].address != '') {
                                                item = '<div class="position"><input type="radio" name="bizType" class="itemInput" key="' + nsRes[i].channel + '" checed="true" /><span class="nsSpan">' + nsRes[i].name + '</span></br>' + '<span>' + nsRes[i].address + '</span></div>';
                                            } else {
                                                item = '<div class="position"><input type="radio" name="bizType" class="itemInput" key="' + nsRes[i].channel + '" checed="false"/><span class="nsSpan">' + nsRes[i].name + '</span></br>' + '<span>' + nsRes[i].address + '</span></div>';
                                            }

                                            $('#filesView').append(item);
                                        }
                                        $(':radio[name=bizType]').each(function () {
                                            $(this).click(function () {
                                                if ($(this).attr('checked')) {
                                                    $(':radio[name=bizType]').removeAttr('checked');
                                                    $(this).attr('checked', 'checked');
                                                    //赋值给隐藏域
                                                    console.log(passageway = $(this).attr('key'))
                                                    passageway = $(this).attr('key');
                                                    // $("#bizType").val($(this).val());
                                                }
                                            });
                                        });
                                    }

                                },
                                error: function (error) {
                                    alert(error)
                                }
                            });

                        } else {
                            $('#filesDataView').hide();
                        }
                        var tree = mini.get("tree1");
                        var node = tree.getSelectedNode();
                        for (var i = 0; i < res.length; i++) {
                            tree.addNode(res[i], "add", node);
                        }
                    },
                    error: function () {
                        // page.logic.rightmenu("left_tree", "treeMenu2");
                    }
                });
                //   params.id = id; //后台获取数据源id
                //   params.nodepath = nodepath; //后台获取nodepath
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
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            save: function () {
                parent.passDetail = passageway;
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            onBeforeTreeLoad: function (e) {
                console.log(e)
                var tree = e.sender; //树控件
                var node = e.node; //当前节点
                var params = e.params; //参数对象

                //可以传递自定义的属性
                params.myField = "123"; //后台：request对象获取"myField"

            },
            showFiles: function (folderId) {
                //var messageid = mini.loading("Loading, Please wait ...", "Loading");
                //  $.ajax({
                //      url: ECS.api.rttUrl + '/videoSurveullance/getTreeOrgAndChannel?userName=emergency&type=0' + '&id=' +folderId,
                //      success: function (res) {
                //          var files = mini.decode(res);
                //          refreshFiles(files);
                //      }
                //  });
                console.log(ECS.api.rttUrl + '/videoSurveullance/getTreeOrgAndChannel?userName=emergency&type=0' + '&id=' + mini.get("tree1"))
                $.ajax({
                    url: ECS.api.rttUrl + '/videoSurveullance/getTreeOrgAndChannel?userName=emergency&type=0' + '&id=' + mini.get("tree1").getSelectedNode().id,
                    type: "GET",
                    success: function (res) {
                        console.log(res)
                        var files = mini.decode(res);
                        refreshFiles(files);
                    },
                    error: function () {
                        // page.logic.rightmenu("left_tree", "treeMenu2");
                    }
                });
            },
            setUrlK: function (ojson) {

                var s = '',
                    name, key;

                for (var p in ojson) {

                    // if(!ojson[p]) {return null;} 

                    if (ojson.hasOwnProperty(p)) {
                        name = p
                    };

                    key = ojson[p];

                    s += "&" + name + "=" + encodeURIComponent(key);

                };

                return s.substring(1, s.length);

            },
            /**
             * 初始化表格
             */
            initTable: function () {
                // grid = mini.get("datagrid");
                // grid.set({
                //     url: searchUrl,
                //     ajaxType: "get",
                //     dataField: "pageList"
                // });
                //侧边栏菜单的添加
                page.logic.load_sidebar();
                //所有查询条件的添加；
                // page.logic.select_option(postNames_url, $("#postID")); //岗位
                // page.logic.select_option(userSex_url, $("#userSex")); //性别
                // page.logic.select_option(userLvl_url, $("#userLvlID")); //行政级别（员工级别）
                // page.logic.select_option(userNature_url, $("#userNatureID")); //员工性质
            },
            //显示编辑操作图标列
            show_edit: function (e) {
                return ECS.util.editRender(e.row.userID);
            },
            //出生日期处理
            birthdate: function (e) {
                return ECS.util.timestampToTime(e.row.userBirthday);
            },
            //工作时间处理
            workdate: function (e) {
                return ECS.util.timestampToTime(e.row.userJoinDatetime);
            },
            //侧边栏菜单添加
            load_sidebar: function () {
                // var _url;
                // if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
                //     _url = porg_url;
                // } else {
                //     _url = org_url + "?orgCode=" + ECS.sys.Context.SYS_ENTERPRISE_CODE;
                // }
                $.ajax({
                    url: porg_url,
                    type: "GET",
                    success: function (Data) {
                        if (Data.length > 0) {
                            mini.get("tree1").loadList(Data, "id", "pId");
                            mini.get("tree1").setValue(ECS.sys.Context.SYS_ENTERPRISE_CODE);
                            // grid.load({
                            //     // "orgId": mini.get("tree1").data[0].orgId
                            // });
                        } else {
                            	layer.msg("暂无数据！");
                            // page.logic.rightmenu("left_tree", "treeMenu2");
                        }
                    },
                    error: function () {
                        // page.logic.rightmenu("left_tree", "treeMenu2");
                    }
                });
            },
            //下拉框
            select_option: function (menu_url, oPar) {
                $.ajax({
                    url: menu_url,
                    type: "GET",
                    success: function (Data) {
                        //清空下拉框
                        $(oPar).html("");
                        //添加全部一项
                        var $oPtion = $('<option value="">全部</option>');
                        $(oPar).append($oPtion);
                        //下拉框数据填充
                        for (var i = 0; i < Data.length; i++) {
                            (function (cur_key) {
                                //岗位
                                if (cur_key.postID) {
                                    var $oPtion = $('<option value="' + cur_key.postID + '">' + cur_key.postName + '</option>');
                                }
                                //性别
                                if (cur_key.key || cur_key.key == 0) {
                                    var $oPtion = $('<option value="' + cur_key.key + '">' + cur_key.value + '</option>');
                                }
                                //员工属性
                                if (cur_key.UserAttributeID) {
                                    var $oPtion = $('<option value="' + cur_key.UserAttributeID + '">' + cur_key.userAttribute + '</option>');
                                }
                                //行政级别（员工级别）
                                if (cur_key.userLvlID) {
                                    var $oPtion = $('<option value="' + cur_key.userLvlID + '">' + cur_key.userLvl + '</option>');
                                }
                                //员工性质
                                if (cur_key.userNatureID) {
                                    var $oPtion = $('<option value="' + cur_key.userNatureID + '">' + cur_key.userNature + '</option>');
                                }
                                $(oPar).append($oPtion);
                            })(Data[i]);
                        }
                    }
                })
            },
            /**
             * 批量删除
             * */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.userID);
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: false,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        beforeSend: function () {
                            layer.closeAll();
                            ECS.showLoading();
                        },
                        success: function (result) {
                            ECS.hideLoading();
                            if (result.indexOf('collection') < 0) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    page.logic.search();
                                });
                            } else {
                                result = JSON.parse(result)
                                layer.msg(result.collection.error.message)
                            }
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "应急联系人新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param userID
             */
            edit: function (userID) {
                var pageMode = PageModelEnum.Edit;
                var title = "应急联系人编辑";
                page.logic.detail(title, userID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, userID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['980px', '410px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'UserAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "userID": userID,
                            "title": title,
                            "getNode": getNode
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 搜索
             */
            search: function (sort) {
                page.data.param = {}; //空对象
                page.data.param = ECS.form.getData("searchForm");
                //排序（倒序）
                if (sort) {
                    page.data.param.sortType = "1";
                }
                //是否启用的数据进行处理，inUse是否为空？
                if (page.data.param.inUse == "-1") {
                    page.data.param.inUse = "";
                }
                //左侧的树菜单是否有选中的数据；
                //获取树选中的节点id和code;
                if (mini.get("tree1").getSelectedNode()) {
                    page.data.param["id"] = mini.get("tree1").getSelectedNode().id; //上层名称节点id
                } else {
                    page.data.param["id"] = mini.get("tree1").data[0].id;
                }
                if (page.data.param["id"] == -1) {
                    page.data.param["id"] = "";
                }

            },
            /**
             * 初始化查询inUse
             */
            // initInUse: function () {
            //     ECS.ui.getCombobox("inUse", inUseUrl, {
            //         selectValue: -1,
            //         data: {
            //             'isAll': true
            //         }
            //     }, null);
            // },
            imp: function () {
                var impUrl = ECS.api.bcUrl + '/user/importExcel';
                var exportUrl = ECS.api.bcUrl + '/user/ExportExcel';
                var confirmUrl = ECS.api.bcUrl + '/user/importAddAll';
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl, exportUrl, confirmUrl, pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});