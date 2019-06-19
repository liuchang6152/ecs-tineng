var delUrl = ECS.api.bcUrl + '/user';                                     //删除（批量删除）
var searchUrl = ECS.api.bcUrl + '/user';                                  //数据的处理（查询）
var inUseUrl = ECS.api.commonUrl + "/getInUse";                          //是否启用
var exportUrl = ECS.api.bcUrl + '/user/ExportToExcel';                   //导出
var porg_url = ECS.api.bcUrl + '/org/porgName?isAll=true'; //总部树
var org_url = ECS.api.bcUrl + '/org/porgNameOne';         //企业树
var postNames_url = ECS.api.bcUrl + "/user/getAllPost";                 //岗位
var userSex_url = ECS.api.rttUrl + "/expert/getExpertSexEnumList";     //性别
var userLvl_url = ECS.api.bcUrl + "/user/getAllUserLvl";                //行政级别（员工级别）
var userNature_url = ECS.api.bcUrl + "/user/getAllUserNature";         //员工性质
var orgUrl = ECS.api.bcUrl + '/org/porgName'; //企业
window.pageLoadMode = PageLoadMode.None;
pageflag = true;
pageflag = true;
redisKey = '';
var grid = null;
var getNode = "-1";
var isHiden = true;
var flag = false;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            page.logic.get_list(orgUrl, $("#enterpriseCode"));
            $("#searchForm").find('input').val("");
            //初始化查询是否启用
            page.logic.initInUse();
            page.logic.initTable();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //下拉框
            mini.get("enterpriseCode").on("nodeclick", function (e) {
                page.logic.load_sidebar();
            });
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            // 导入
            $('#btnImp').click(function () {
                page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};                               //空对象
                page.data.param = ECS.form.getData("searchForm");

                //是否启用的数据进行处理，inUse是否为空？
                if (page.data.param.inUse == "-1") {
                    page.data.param.inUse = "";
                }
                //左侧的树菜单是否有选中的数据；
                //获取树选中的节点id和code;
                if (mini.get("tree1").getSelectedNode()) {
                    page.data.param["orgId"] = mini.get("tree1").getSelectedNode().orgId;    //上层名称节点id
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
            //侧边栏菜单添加点击事件；
            mini.get("tree1").on("nodeselect", function (e) {
                getNode = mini.get("tree1").getValue(e.node);
                page.logic.search(1);
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
                    $(this).css({ "left": "0", "transform": "rotate(180deg)" });
                } else {
                    $(".leftNav-body").show();
                    $('.box-body').css("margin-left", "280px");
                    $(this).css({ "left": "263px", "transform": "rotate(0deg)" });
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
                            page.logic.load_sidebar();
                            cb && cb();
                        }
                    }
                });
            },
            setUrlK: function (ojson) {

                var s = '', name, key;

                for (var p in ojson) {

                    // if(!ojson[p]) {return null;} 

                    if (ojson.hasOwnProperty(p)) { name = p };

                    key = ojson[p];

                    s += "&" + name + "=" + encodeURIComponent(key);

                };

                return s.substring(1, s.length);

            },
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({
                    url: searchUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                //侧边栏菜单的添加
                //page.logic.load_sidebar();
                //所有查询条件的添加；
                page.logic.select_option(postNames_url, $("#postID"));                 //岗位
                page.logic.select_option(userSex_url, $("#userSex"));                  //性别
                page.logic.select_option(userLvl_url, $("#userLvlID"));                //行政级别（员工级别）
                page.logic.select_option(userNature_url, $("#userNatureID"));         //员工性质
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
                var _url = org_url + "?orgCode=" + mini.get('enterpriseCode').getValue();
                $.ajax({
                    url: _url,
                    type: "GET",
                    success: function (Data) {
                        if (Data.length > 0) {
                            mini.get("tree1").loadList(Data, "orgId", "orgPID");
                            mini.get("tree1").setValue(ECS.sys.Context.SYS_ENTERPRISE_CODE);
                            grid.load({ "orgId": mini.get("tree1").data[0].orgId });
                        } else {
                            page.logic.rightmenu("left_tree", "treeMenu2");
                        }
                    },
                    error: function () {
                        page.logic.rightmenu("left_tree", "treeMenu2");
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
                            "getNode": getNode,
                            "topNode":mini.get("tree1").data[0].orgId
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
                page.data.param = {};                               //空对象
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
                    page.data.param["orgId"] = mini.get("tree1").getSelectedNode().orgId;    //上层名称节点id
                } else {
                    page.data.param["orgId"] = mini.get("tree1").data[0].orgId;
                }
                if (page.data.param["orgId"] == -1) {
                    // page.data.param["orgId"]="";
                }
                grid.load(page.data.param);
            },
            /**
             * 初始化查询inUse
             */
            initInUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: -1,
                    data: {
                        'isAll': true
                    }
                }, null);
            },
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