var ECS = {};
/**
 * 后端API路径相关
 */
ECS.api = {};
ECS.ui = {};
ECS.form = {};
ECS.util = {};
ECS.util.Base64 = {};
ECS.sys = {};
ECS.sys.LoginNameCookieName = 'LoginName';
ECS.sys.TokenCookieName = 'SYS_CONTEXT_TOKEN';
ECS.sys.BearerStartName = "Bearer ";
ECS.sys.ContextCipherText = '';
ECS.sys.Context = {};
$(':input','#searchForm').val('');
jQuery(document).bind("ajaxStart", function () {
    jQuery.support.cors = true;
    $.ajaxSetup({beforeSend:function(xhr){
        // console.log(this);
        // console.log(xhr);
        if(this.type == "GET"&&this.dataType=="text"){
            for(var i in this.params){
                var str = this.params[i];
                if(str!=undefined&&str!=null&&str.length>99){
                    alert("\""+str.substring(90,99)+"\"及其后面的字词均被忽略，因为查询条件单个输入框限制在99个汉字以内。")
                    var k = this.url.indexOf(i);
                    var url1 = this.url.substring(0,k);
                    var url2 = this.url.substring(k+i.length+encodeURI(str).length+1);
                    this.url = url1+i+"="+encodeURI(str.substring(0,100))+url2;
                }
            }
        }
    }});
});
/**
 * loading加载动画
 */
ECS.showLoading = function () {
    var loadhtml;
    loadhtml = '<div class="loading">' +
        '<div class="loadingTip">' +
        '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>' +
        '</div></div>';
    $("body").append(loadhtml);
};
ECS.hideLoading = function () {
    $(".loading").remove();
};
// 百分比进度条展示；
ECS.util.show_percent = function (n) {
    var iPercent = n + "%";
    var $loadFileBox = $(".loadFile_box");
    if ($loadFileBox.length === 0) {
        //若没盒子，那么创建盒子
        var loadFile_box = $('<div class="loadFile_box"></div>');
        var $oPar_box = $('<div class="loaderfile_percent_box"></div>');
        var sContent = '<div class="percent_text">' + iPercent + '</div>' +
            '<div class="progress_total"><div class="progress_cur" style="width:' + iPercent + ';"></div></div>';
        $oPar_box.html(sContent);
        $(loadFile_box).append($oPar_box);
        $("body").append(loadFile_box);
    } else {
        //若有盒子，那么只需要设置值
        $loadFileBox.find(".percent_text").html(iPercent);
        $loadFileBox.find(".progress_cur").css("width", iPercent);
    }
    $loadFileBox.show();
};
//百分比进度条隐藏；
ECS.util.hide_percent = function () {
    $(".loadFile_box").hide();
};

/**
 * 初始化表格数据
 *
 * @author pcitc 2017-10-18
 * @param tableID  table表格的id
 * @param config      相关配置信息
 * @param queryParams 请求服务器数据时的传参配置
 */
ECS.ui.initBootstrapTable = function (tableID, config, queryParams) {
    var _config = {
        method: 'get',
        url: '',
        cache: false,
        pagination: true,
        pageSize: 10,
        pageNumber: 1,
        pageList: [10, 20, 50, 100],
        paginationPreText: '<',
        paginationNextText: '>',
        sidePagination: "server",
        queryParamsType: "undefined",
        queryParams: queryParams,
        undefinedText: '',
        contentType: 'application/x-www-form-urlencoded',
        formatNoMatches: function () {
            return "";
        },
        responseHandler: function (res) {
            var item = {
                "pageNumber": res["pageNumber"],
                "pageSize": res["pageSize"],
                "total": res["total"],
                "rows": res["pageList"]
            };
            return item;
        },
        onLoadSuccess: function () {
            var tds = $('#' + tableID).find('tbody tr td');
            $.each(tds, function (i, el) {
                $(this).attr("title", $(this).text())
            })
        }
    };
    $.extend(true, _config, config);
    $('#' + tableID).bootstrapTable(_config);
};
/**
 * 初始化Table表格
 *
 * @author xuelei.wang 2016-06-14
 * @param config
 */
ECS.ui.initTable = function (config) {
    layui.use(['table', 'util'], function () {
        var util = layui.util;
        var _config = {
            even: true,
            page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'skip'],
                theme: '#45c8dc'
            },
            request: {
                pageName: 'pageNumber',
                limitName: 'pageSize'
            },
            response: {
                statusName: 'status',
                statusCode: 0,
                countName: 'total',
                dataName: 'pageList'
            }
        };
        $.extend(_config, config, true);
        layui.table.render(_config);
    });
};
/**
 * 可编辑并自动匹配的下拉列表Select
 *
 * @author weiwan 2018-08-23
 * @param url   数据请求地址
 * @param ctrlId   select控件id
 * @param key   列表项目中的key值
 * @param value   列表项目中的value值
 */
ECS.ui.getComboSelect = function (url, ctrlId, key, value, tags,name) {
    $.ajax({
        url: url,
        async: false,
        dataType: "json",
        success: function (data) {
            var datalist = [];
            if(name){
                datalist = [{ id: name, text: name }];
            }
            $.each(data, function (i, el) {
                if(name!=el[key]){
                    datalist.push({ id: el[key], text: el[value] });
                }
            });
            $('#' + ctrlId).select2({
                tags: tags,
                data: datalist,
                language: {
                    noResults: function (params) {
                        return "没有匹配项";
                    }
                }
            });
        }
    })
};

ECS.ui.getComboSelects = function (url, ctrlId, key, value, tags) {
    $("#" + ctrlId).html('<option value="" selected="selected">可输入</option>');
    $.ajax({
        url: url,
        async: true,
        dataType: "json",
        success: function (data) {
            var datalist = [];
            $.each(data, function (i, el) {
                datalist.push({ id: el[key], text: el[value] });
            });
            $('#' + ctrlId).select2({
                tags: tags,
                data: datalist,
                language: {
                    noResults: function (params) {
                        return "没有匹配项";
                    }
                },
            });
        },
    })
};

/**
 * 获取Combobox控件，统一调用
 *
 * @author pcitc 2017-09-29
 * @param ctrlId      Combobox 外层所在select控件ID
 * @param url         数据请求地址
 * @param config      相关配置信息
 * @param callback    回调函数
 * @param onChange    值改变函数
 */
ECS.ui.getCombobox = function (ctrlId, url, config, callback, onChange) {
    $("#" + ctrlId).find("option:selected").text("");
    $("#" + ctrlId).empty();
    var _config = {
        url: url,
        type: "get",
        async: true,
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        keyField: "key",
        valueField: "value",
        codeField: "code",
        valueSField: "valueSName",
        selectValue: 1,
        selectFirstRecord: false,
        showAll: false,
        limit: 20,
        data: {}
    };
    $.extend(true, _config, config);
    $.ajax({
        url: _config.url,
        type: _config.type,
        async: _config.async || false,
        data: _config.data,
        dataType: _config.dataType,
        contentType: _config.contentType,
        timeout: 10000,
        retryLimit: 2,
        tryCount: 0,
        success: function (dataArr) {
            var str = '';
            var newText;
            $.each(dataArr, function (i, el) {
                if (_config.selectFirstRecord === true && i === 0) {
                    _config.selectValue = el[_config.keyField];
                }
                if (_config.selectFirstRecord === true && i === 1 && (_config.selectValue === "" || _config.selectValue === undefined)) {
                    _config.selectValue = el[_config.keyField];
                }
                if (el[_config.valueField].length >= _config.limit) {
                    newText = el[_config.valueField].substring(0, _config.limit);
                } else {
                    newText = el[_config.valueField];
                }
                str += '<option title="' + el[_config.valueField] + '" valueS="' + el[_config.valueSField] + '"code="' + el[_config.codeField] + '"value="' + el[_config.keyField] + '">' + newText + '</option>';
            });
            $('#' + ctrlId).html(str);
            $("#" + ctrlId).val(_config.selectValue);
            if (callback) {
                callback($('#' + ctrlId).val());
            }
            $("#" + ctrlId).unbind("change");
            $("#" + ctrlId).change(function () {
                if (onChange != null) {
                    onChange($(this).children('option:selected').val());
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    $.ajax(this);
                    return;
                }
                return;
            } else {
                alert("加载Combobox出现了异常:" + errorThrown);
            }
        }
    });
};

/**
 * 初始化Form表单元素数据
 *
 * @author pcitc 2017-09-29
 * @param formId     表单ID
 * @param dataArray  数据对象
 */
ECS.form.setData = function (formId, dataArray) {
    if (dataArray == undefined || dataArray == null) return;
    $("*", document.forms[formId]).each(function (i, e) {
        //判断是否属于mini树形菜单数据，若不属于，那么对该表单进行数据处理
        if (e.id.indexOf("$") == -1) {
            var element = $("#" + e.id);
        }
        if (element != undefined && element != null) {
            if (e.type == "radio") {
                if (dataArray[e.id] != undefined) {
                    $("#" + formId + "[value=" + dataArray[e.id] + "]").attr('checked', 'checked');
                }
                element.trigger('change');
            } else if (e.type == "checkbox") {
                if (dataArray[e.id] == InUseEnum.Yes) {
                    element.attr('checked', 'checked');
                } else {
                    element.removeAttr('checked');
                }
                element.trigger('change');
            } else {
                if (e.tagName == "SELECT") {
                    element.val(dataArray[e.id]);
                    element.trigger('change');
                }
                //特殊处理bootstrap-treeview
                else if (e.tagName == "INPUT" && e['className'] != '' && e['className'] != undefined && e['className'].indexOf('bootstrap-treeview') != -1) {
                    var enabledNodesArray = $("#dropdown_" + e.id).treeview("getEnabled");
                    for (x in enabledNodesArray) {
                        if (dataArray[e.id] == enabledNodesArray[x].id) {
                            $("#dropdown_" + e.id).treeview("selectNode", [enabledNodesArray[x].nodeId, { silent: true }]);
                            break;
                        }
                    }
                    if ($("#dropdown_" + e.id).treeview("getSelected").length != 0) {
                        $("#" + e.id).val($("#dropdown_" + e.id).treeview("getSelected")[0].text);
                    }
                } else {
                    element.val(dataArray[e.id]);
                }
            }
        }

    });
};

/**
 * 获取表单要提交的值
 * @author pcitc 2018-02-01
 * @param formId  表单ID
 * @returns {{}}
 */
ECS.form.getData = function (formId) {
    var result = {};
    var form = $("#" + formId);
    if (form == undefined || form == null) {
        return result;
    }
    $('input', form).each(function () {
        if (this.name != undefined && this.name != '') {
            result[this.name] = $(this).val();
        }
    });
    $('textarea', form).each(function () {
        if (this.name != undefined && this.name != '') {
            result[this.name] = $(this).val();
        }
    });
    $('select', form).each(function () {
        if (this.name != undefined && this.name != '') {
            result[this.name] = $(this).val();
        }
    });

    //特殊处理CheckBox
    var ckList = form.find("[type='checkbox']");
    if (ckList != undefined && ckList != null && ckList.length != 0) {
        for (var i = 0; i < ckList.length; i++) {
            if ($(ckList[i]).is(':checked')) {
                result[$(ckList[i]).attr('name')] = 1;
            } else {
                result[$(ckList[i]).attr('name')] = 0;
            }
        }
    }

    //特殊处理treeview
    $("div[id^=dropdown_]", form).each(function () {
        var selectNodes = $(this).treeview("getSelected");
        var tree = $(this).treeview(true);
        if (tree.options.multiSelect == false) {
            if (selectNodes != undefined && selectNodes != null && selectNodes.length != 0) {
                result[$(this).attr('name')] = selectNodes[0].id;
            } else {
                result[$(this).attr('name')] = '';
            }
        } else { //多选
            var idsArr = new Array();
            if (selectNodes != undefined && selectNodes != null && selectNodes.length != 0) {
                if (tree.options.showParentNodes) {
                    for (x in selectNodes) {
                        idsArr.push(selectNodes[x].id);
                    }
                } else if (!tree.options.showParentNodes) {
                    for (x in selectNodes) {
                        if (!selectNodes[x].nodes) {
                            idsArr.push(selectNodes[x].id);
                        }
                    }
                }
                result[$(this).attr('name')] = idsArr;
            }
        }
    });

    //处理随机时间
    // result['now'] = Math.random();
    return result;
};

/**
 * 表单校验
 *
 * @author pcitc 2017-10-18
 * @param formId  form表单的id
 * @param config  相关配置信息
 */
ECS.form.formValidate = function (formId, config) {
    $("#" + formId).validate(config);
};

/**
 * 初始化下拉树控件
 * @author zheng.yang 2017-06-13
 * @param ctrId  控件的id
 * @param url  数据接口
 *  @param options  配置
 */
ECS.ui.initTreeView = function (ctrId, url, id, parentId, nodeName, options, callback) {
    var ctrIdWidth = $("#" + ctrId).outerWidth();
    var crtIdHeight = $("#" + ctrId).outerHeight();
    var ctrIdMarginRight = parseInt($("#" + ctrId).css("marginRight"));
    var ctrIdTop = $("#" + ctrId).position().top;
    var ctrIdLeft = $("#" + ctrId).position().left;
    $("#" + ctrId).wrap(document.createElement("div"));
    var displayStyle = $("#" + ctrId).css("display");
    if (displayStyle == 'inline') displayStyle = 'inline-block';
    $("#" + ctrId).parent().css("position", "relative").css("display", displayStyle);
    var left = displayStyle == "block" ? ctrIdLeft : 0;
    var downIconLeft = $("#" + ctrId).parent().css("display") == "block" ? (ctrIdWidth - ctrIdMarginRight - 22) : -ctrIdMarginRight - 22;
    var downIconTop = $("#" + ctrId).parent().css("display") == "block" ? -(crtIdHeight - 6) : 0;
    var dropdownPosition = " style='top:" + crtIdHeight + "px;left:" + 0 + "px;width:" + ctrIdWidth + "px;text-align:left;'";

    var _config = {
        async: true,
        url: url,
        type: "get",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded",
        data: {},
        multiSelect: true,  //是否多选
        showCheckbox: true, //是否显示checkbox
        onlyLeafCheck: false, //只能选择叶子节点
        showParentNodes: false, //是否显示选中的非叶子节点
        disabled: false, //是否完全禁用此控件
        selectFirstRecord: false,
        echo: true,
        levels: 1,
        color: "#000000",
        backColor: "#FFFFFF",
    };
    $.extend(true, _config, options);
    if (_config.echo) {
        $("#" + ctrId).attr("readonly", "readonly").css("background-color", "white").css("position", "relative")
            .parent().append("<i id='down_icon' class='fa fa-chevron-down' style='position:relative;left: " + downIconLeft + "px;top:" + downIconTop + "px;z-index:9999999'></i><div id='dropdown_" + ctrId + "' name='" + ctrId + "' " + dropdownPosition + " class='treeview-dropdown'></div>");
        $("#" + ctrId).parent().height(crtIdHeight);
    }
    if (!_config.echo) {
        $("#" + ctrId).append("<div id='dropdown_" + ctrId + "' name='" + ctrId + "' ></div>");
    }
    $.ajax({
        url: _config.url,
        async: _config.async,
        data: _config.data,
        dataType: _config.dataType,
        success: function (result) {
            //var originalData = $.ET.toObjectArr(data);
            if (_config.echo) {
                var data = ECS.util.toTreeData(result, id, parentId, nodeName, _config.onlyLeafCheck);
            }
            if (!_config.echo) {
                var data = ECS.util.toMenuTreeData(result, id, parentId, nodeName, _config.onlyLeafCheck);
            }
            var inputName = new Array(); //叶子节点名称
            var parentNodeInputName = new Array(); //非叶子节点名称
            var lastNode; //缓存上次选中节点
            var Tree = $('#dropdown_' + ctrId).treeview({
                data: data,
                showCheckbox: _config.showCheckbox, //是否显示复选框
                highlightSelected: false, //是否高亮选中
                multiSelect: _config.multiSelect, //多选
                showBorder: true,
                backColor: _config.backColor,
                color: _config.color,
                onhoverColor: "white",
                levels: _config.levels,
                onlyLeafCheck: _config.onlyLeafCheck,
                showParentNodes: _config.showParentNodes,
                onNodeSelected: function (event, data) { //选中事件
                    //单选
                    if (!_config.multiSelect && !_config.showCheckbox) {
                        $(this).treeview(true).options.highlightSelected = true;
                        if (lastNode != undefined && lastNode.id != data.id) {
                            Tree.treeview('unselectNode', [lastNode.nodeId, { silent: true }]);
                        }
                        lastNode = data;
                        if (_config.echo) {
                            $("#" + ctrId).val(data.text);
                            $("#dropdown_" + ctrId).hide();
                        }
                    }
                    //多选
                    else if (_config.multiSelect && _config.showCheckbox) {
                        //选中节点同时勾选此节点
                        Tree.treeview('checkNode', [data.nodeId, { silent: true }]);
                        if (data.nodes) {//设置子节点选中
                            var selectNodes = Tree.treeview('getChildNodeIdArr', data);//获取所有该节点的子节点 并选中 勾选
                            for (var i = 0; i < selectNodes.length; i++) {
                                Tree.treeview('selectNode', [selectNodes[i].nodeId, { silent: true }]);
                                Tree.treeview('checkNode', [selectNodes[i].nodeId, { silent: true }]);
                            }
                        }

                        //设置该节点的父节点选中
                        Tree.treeview("setParentNodeCheck", data);
                        //节点名称回显
                        var selectNodes = Tree.treeview("getSelected");
                        for (x in selectNodes) {
                            if (_config.showParentNodes && selectNodes[x].nodes && parentNodeInputName.indexOf(selectNodes[x].text) == -1) {
                                parentNodeInputName.push(selectNodes[x].text);
                            }
                            if (inputName.indexOf(selectNodes[x].text) == -1 && selectNodes[x].nodes == undefined) {
                                inputName.push(selectNodes[x].text);
                                inputName.sort(function (a, b) {
                                    return a.localeCompare(b)
                                });
                            }
                        }
                        $("#" + ctrId).val(parentNodeInputName.concat(inputName));
                    }
                    if (callback) {
                        var nodeIds = ECS.ui.initTreeView.getValues(ctrId);
                        callback(nodeIds, Tree);
                    }
                },
                onNodeUnselected: function (event, data) {//取消选中
                    if (_config.multiSelect == false && _config.onlyLeafCheck) {
                        if (lastNode.id == data.id) {
                            $("#" + ctrId).attr("value", data.text);
                            Tree.treeview('selectNode', [data.nodeId, { silent: true }]);
                        } else {
                            Tree.treeview('unselectNode', [lastNode.nodeId, { silent: true }]);
                            $("#" + ctrId).val('');
                        }
                        if (_config.echo)
                            $("#dropdown_" + ctrId).hide();
                        return;
                    }
                    if (_config.multiSelect && _config.showCheckbox) {
                        Tree.treeview('uncheckNode', [data.nodeId, { silent: true }]);
                    }

                    if (data.nodes) { //该节点下存在子节点
                        if (_config.showParentNodes) {
                            if (parentNodeInputName.indexOf(data.text) !== -1) {
                                parentNodeInputName.splice(parentNodeInputName.indexOf(data.text), 1);
                            }
                        }
                        var selectNodes = Tree.treeview('getChildNodeIdArr', data);
                        for (var i = 0; i < selectNodes.length; i++) {
                            Tree.treeview('unselectNode', [selectNodes[i].nodeId, { silent: true }]);
                            Tree.treeview('uncheckNode', [selectNodes[i].nodeId, { silent: true }]);

                            if (parentNodeInputName.indexOf(selectNodes[i].text) !== -1) {
                                parentNodeInputName.splice(parentNodeInputName.indexOf(selectNodes[i].text), 1);
                            }
                            if (inputName.indexOf(selectNodes[i].text) !== -1) {
                                inputName.splice(inputName.indexOf(selectNodes[i].text), 1);
                            }
                        }
                        $("#" + ctrId).val(parentNodeInputName.concat(inputName));
                    }
                    else if (data.nodes === undefined) { //该节点为叶子节点
                        if (inputName.indexOf(data.text) !== -1) {
                            inputName.splice(inputName.indexOf(data.text), 1);
                            $("#" + ctrId).val(parentNodeInputName.concat(inputName));
                        }
                    }
                    Tree.treeview("setParentNodeUnCheck", data);
                    if (callback) {
                        var nodeIds = ECS.ui.initTreeView.getValues(ctrId);
                        callback(nodeIds);
                    }
                },
                onNodeChecked: function (event, data) {//勾选
                    Tree.treeview('selectNode', [data.nodeId, { silent: true }]);

                    if (data.nodes) {
                        var selectNodes = Tree.treeview('getChildNodeIdArr', data);
                        for (var i = 0; i < selectNodes.length; i++) {
                            Tree.treeview('selectNode', [selectNodes[i].nodeId, { silent: true }]);
                            Tree.treeview('checkNode', [selectNodes[i].nodeId, { silent: true }]);
                        }
                    }
                    //设置父节点选中
                    Tree.treeview("setParentNodeCheck", data);
                    //节点名称回显
                    var selectNodes = Tree.treeview("getSelected");
                    for (x in selectNodes) {
                        if (_config.showParentNodes && selectNodes[x].nodes && parentNodeInputName.indexOf(selectNodes[x].text) == -1) {
                            parentNodeInputName.push(selectNodes[x].text);
                        }
                        if (inputName.indexOf(selectNodes[x].text) == -1 && selectNodes[x].nodes == undefined) {
                            inputName.push(selectNodes[x].text);
                            inputName.sort(function (a, b) {
                                return a.localeCompare(b)
                            });
                        }
                    }
                    $("#" + ctrId).val(parentNodeInputName.concat(inputName));
                    if (callback) {
                        var nodeIds = ECS.ui.initTreeView.getValues(ctrId);
                        callback(nodeIds);
                    }
                },
                onNodeUnchecked: function (event, data) {//取消勾选
                    if (_config.multiSelect) {
                        Tree.treeview('unselectNode', [data.nodeId, { silent: true }]);
                    }
                    if (data.nodes) {
                        if (_config.showParentNodes) {
                            if (parentNodeInputName.indexOf(data.text) != -1) {
                                parentNodeInputName.splice(parentNodeInputName.indexOf(data.text), 1);
                            }
                        }
                        var selectNodes = Tree.treeview('getChildNodeIdArr', data);
                        for (var i = 0; i < selectNodes.length; i++) {
                            Tree.treeview('unselectNode', [selectNodes[i].nodeId, { silent: true }]);
                            Tree.treeview('uncheckNode', [selectNodes[i].nodeId, { silent: true }]);

                            if (parentNodeInputName.indexOf(selectNodes[i].text) != -1) {
                                parentNodeInputName.splice(parentNodeInputName.indexOf(selectNodes[i].text), 1);
                            }
                            if (inputName.indexOf(selectNodes[i].text) != -1) {
                                inputName.splice(inputName.indexOf(selectNodes[i].text), 1);
                            }
                        }
                    }
                    else if (data.nodes == undefined) {
                        if (inputName.indexOf(data.text) != -1) {
                            inputName.splice(inputName.indexOf(data.text), 1);
                        }
                    }

                    $("#" + ctrId).val(parentNodeInputName.concat(inputName));
                    Tree.treeview("setParentNodeUnCheck", data);
                    if (callback) {
                        var nodeIds = ECS.ui.initTreeView.getValues(ctrId);
                        callback(nodeIds);
                    }
                }
            });
            if (_config.selectFirstRecord) {
                Tree.treeview("selectFirstRecord");
            }
            if (_config.echo) {
                //下拉框弹出与关闭
                $(window).bind("click", function (e) {
                    //鼠标指向输入框时 如果下拉框显示则隐藏 否则显示
                    if (e.target.id == ctrId || e.target.id == 'down_icon') {
                        if ($(Tree).css("display") == 'block') {
                            $(Tree).hide();
                            var selectNodes = Tree.treeview('getSelected');
                            var unitIdsArr = new Array();
                            for (var i = 0; i < selectNodes.length; i++) {
                                var childArr = Tree.treeview("getChildNodeIdArr", selectNodes[i]);
                                if (childArr.length > 1) {
                                    selectNodes.splice(i, 1);
                                    i--;
                                } else {
                                    unitIdsArr.push(selectNodes[i].id);
                                }
                            }
                            // console.log(unitIdsArr);
                        } else {
                            $(Tree).show();
                        }
                    } else if (
                        (e.target.className.indexOf("list-group-item") == -1) &&
                        (e.target.className.indexOf("check-icon") == -1) &&
                        (e.target.className.indexOf("expand-icon") == -1) &&
                        (e.target.className.indexOf("list-group") == -1)) { //如果鼠标指向输入框和下拉框以外区域
                        $(Tree).hide();
                        var selectNodes = Tree.treeview('getSelected');
                        var unitIdsArr = new Array();
                        for (var i = 0; i < selectNodes.length; i++) {
                            var childArr = Tree.treeview("getChildNodeIdArr", selectNodes[i]);
                            if (childArr.length > 1) {
                                selectNodes.splice(i, 1);
                                i--;
                            } else {
                                unitIdsArr.push(selectNodes[i].id);
                            }
                        }
                        // console.log(unitIdsArr);
                    }
                    //title
                    $("#" + ctrId).attr("title", $("#" + ctrId).val());
                    if (_config.disabled) {
                        $("#" + ctrId).attr("disabled", "disabled").css("background-color", "white");
                        return;
                    }
                })
            }
            if (!_config.selectFirstRecord)
                Tree.treeview("echo");
            if (!_config.echo) {
                var height = $(window).height() - parseInt($("#" + ctrId).css("top"));
                $(".list-group").css("height", height - 30).css("margin", "15px");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
};
/**
 * 获取下拉树选中值
 * @author zheng.yang 2017-06-13
 * @param ctrId  控件的id
 */
ECS.ui.initTreeView.getValues = function (ctrId) {
    var treeObj = $("#dropdown_" + ctrId).treeview(true);
    var selectNodes = $("#dropdown_" + ctrId).treeview("getSelected");
    var idsArr = new Array();
    if (treeObj.options.multiSelect == false) {
        if (selectNodes != undefined && selectNodes != null && selectNodes.length != 0) {
            idsArr.push(selectNodes[0].id);
        }
        return idsArr;
    } else { //多选
        if (selectNodes != undefined && selectNodes != null && selectNodes.length != 0) {
            if (treeObj.options.showParentNodes) {
                for (x in selectNodes) {
                    idsArr.push(selectNodes[x].id);
                }
            } else if (!treeObj.options.showParentNodes) {
                for (x in selectNodes) {
                    if (!selectNodes[x].nodes) {
                        idsArr.push(selectNodes[x].id);
                    }
                }
            }
            return idsArr;
        }
    }
};
/**
 * 源数据转换成treeview所需格式数据
 * @author zheng.yang 2018-06-13
 * @param dataArr  元数据
 * @param id 节点主键
 * @param parentId  父节点id
 * @param text  节点名称
 * @returns {Array} bootstrap-treeview 格式数据
 */
ECS.util.toTreeData = function (dataArray, id, parentId, text, onlyLeafCheck) {
    var result = new Array();
    for (var i = 0; i < dataArray.length; i++) {
        //查找所有顶级节点
        if (dataArray[i][parentId] == undefined || dataArray[i][parentId] == null || dataArray[i][parentId] == 0) {
            var node = {};
            node["text"] = dataArray[i][text];
            node["id"] = dataArray[i][id];
            var childNodes = ECS.util.findTreeChildNodes(dataArray, dataArray[i][id], id, parentId, text, onlyLeafCheck);
            if (childNodes != null && childNodes.length != 0) {
                node["nodes"] = childNodes;
            }
            if (onlyLeafCheck && childNodes != null && childNodes.length != 0) {
                node["selectable"] = false;
            }
            result.push(node);
        }
    }
    return result;
};
/**
 * 源数据转换成treeview所需格式数据(树形菜单)
 * @author zheng.yang 2018-07-01
 * @param dataArr  元数据
 * @param id 节点主键
 * @param parentId  父节点id
 * @param text  节点名称
 * @returns {Array} bootstrap-treeview 格式数据
 */
ECS.util.toMenuTreeData = function (dataArray, id, parentId, text, onlyLeafCheck) {
    var result = new Array();
    for (var i = 0; i < dataArray.length; i++) {
        //查找所有顶级节点
        if (dataArray[i][parentId] == undefined || dataArray[i][parentId] == null || dataArray[i][parentId] == 0) {
            var node = {};
            node["text"] = dataArray[i][text];
            node["id"] = dataArray[i][id];
            node["originalCode"] = dataArray[i]["originalCode"];
            node["type"] = dataArray[i]["type"];
            var childNodes = ECS.util.findMenuTreeChildNodes(dataArray, dataArray[i][id], id, parentId, text, onlyLeafCheck);
            if (childNodes != null && childNodes.length != 0) {
                node["nodes"] = childNodes;
            }
            if (onlyLeafCheck && childNodes != null && childNodes.length != 0) {
                node["selectable"] = false;
            }
            result.push(node);
        }
    }
    return result;
};
/**
 * 获取子节点
 * @author xuelei.wang 2017-09-29
 * @param dataArray  数据
 * @param idValue    id值
 * @param id         id名称
 * @param parentId   父节点id
 * @param text       名称字段
 * @returns {Array}
 */
ECS.util.findTreeChildNodes = function (dataArray, idValue, id, parentId, text, onlyLeafCheck) {
    var childNodes = new Array();
    for (var k = 0; k < dataArray.length; k++) {
        //1.查找所有子节点
        if (dataArray[k][parentId] == idValue) {
            var node = {};
            node["text"] = dataArray[k][text];
            node["id"] = dataArray[k][id];
            var cNodes = ECS.util.findTreeChildNodes(dataArray, dataArray[k][id], id, parentId, text, onlyLeafCheck);
            if (cNodes != null && cNodes.length != 0) {
                node["nodes"] = cNodes;
                if (onlyLeafCheck) {
                    node["selectable"] = false;
                }
            }
            childNodes.push(node);
        }
    }
    return childNodes;
};
/**
 * 获取子节点(树形菜单)
 * @author zheng.yang 2018-07-01
 * @param dataArray  数据
 * @param idValue    id值
 * @param id         id名称
 * @param parentId   父节点id
 * @param text       名称字段
 * @returns {Array}
 */
ECS.util.findMenuTreeChildNodes = function (dataArray, idValue, id, parentId, text, onlyLeafCheck) {
    var childNodes = new Array();
    for (var k = 0; k < dataArray.length; k++) {
        //1.查找所有子节点
        if (dataArray[k][parentId] == idValue) {
            var node = {};
            node["text"] = dataArray[k][text];
            node["id"] = dataArray[k][id];
            node["originalCode"] = dataArray[k]["originalCode"];
            node["type"] = dataArray[k]["type"];
            var cNodes = ECS.util.findMenuTreeChildNodes(dataArray, dataArray[k][id], id, parentId, text, onlyLeafCheck);
            if (cNodes != null && cNodes.length != 0) {
                node["nodes"] = cNodes;
                if (onlyLeafCheck) {
                    node["selectable"] = false;
                }
            }
            childNodes.push(node);
        }
    }
    return childNodes;
};
/**
 * 数字验证,默认最多保留5位小数(正负数)默认最长20位
 *
 * @author xuelei.wang 2017-10-10
 * @param value
 * @param config
 * @returns {boolean}
 */
ECS.util.checkDecimalIsValid = function (value, config) {
    var _config = {
        //长度
        length: 20,
        //小数位数
        precision: 5
    }
    $.extend(true, _config, config);
    var numStr = value;
    if (numStr == "" || numStr == null) {
        return false;
    } else if (isNaN(numStr)) {
        return false;
    } else {
        numStr += "";
        if ((numStr + "").length > 20) {
            return false;
        }
        var floatStr = numStr.split(".");
        if (floatStr.length > 1) {
            if (floatStr[0].length < 1) {
                return false;
            }
            if (floatStr[1].length > 5) {
                return false;
            }
            if (floatStr[1].length < 1) {
                return false;
            }
        }
    }
    return true;
};

/**
 * 根据树形结构数据获取表格的复杂表头列信息
 *
 * @author xuelei.wang 2018-06-15
 * 计算规则:
 * 1.如果没有子节点,则寻找其平级节点最深子节点层级数为其rowSpan数;
 * 2.如果有子节点,则寻找最低级节点为其colSpan数;
 * 3.一个级别的数据形成一个对象组;
 */
ECS.util.getTableColumns = function (data) {
    var result = new Array();
    if (data == null || data == undefined || data['reportColumnList'] == undefined) return result;
    var entityList = data['reportColumnList'];
    var columns = new Array();
    var childNodes = new Array();
    for (var i = 0; i < entityList.length; i++) {
        var col = {};
        col.title = entityList[i]["header"] == undefined ? entityList[i]["field"] : entityList[i]["header"];
        if (entityList[i]["field"] != undefined)
            col.field = entityList[i]["field"];
        if (entityList[i]["reportEntityList"] != null && entityList[i]["reportEntityList"] != undefined && entityList[i]["reportEntityList"].length > 0) {
            //.如果有子节点,则寻找最底级节点为其colSpan;
            var colSpan = getColSpan(entityList[i]["reportEntityList"]);
            if (colSpan != 1)
                col.colspan = colSpan;
            for (var j = 0; j < entityList[i]["reportEntityList"].length; j++) {
                childNodes.push(entityList[i]["reportEntityList"][j]);
            }
        } else {
            //.处理隐藏列信息
            if (entityList[i].isHide == InHideEnum.YES) continue;
            //.如果没有子节点,则寻找其平级节点最深子节点层级数为其rowSpan;
            var rowSpan = getRowSpan(entityList);
            if (rowSpan != 1)
                col.rowspan = rowSpan;
            processColumnInfo(entityList[i], col);
        }
        columns.push(col);
    }
    result.push(columns);
    if (childNodes.length > 0) {
        getTableColumns(childNodes, result);
    }
    return result;
};
/**
 * @author xuelei.wang 2017-10-23
 * 字符串转日期对象
 * @param dateStr  日期时间字符串
 * @returns {Date} 日期对象
 */
ECS.util.strToDate = function (dateStr) {
    if (dateStr == undefined) return dateStr;
    if ($.isNumeric(dateStr)) {
        return new Date(dateStr);
    }
    if (dateStr instanceof Date) return dateStr;
    if (dateStr instanceof Object) return dateStr;
    return new Date(dateStr.replace(/-/g, "/"));
};
/**
 * @author xuelei.wang 2017-10-21
 * 将日期对象转换成指定的字符串格式
 *
 * 举例:
 * new Date().pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * new Date().pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * new Date().pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * new Date().pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * new Date().pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 * @param date 日期对象
 * @param fmt
 * @returns {*}
 */
ECS.util.dateFormat = function (date, fmt) {
    if (!date instanceof Date) {
        return "参数需为日期对象!";
    }
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

/**
 * 日期计算（原型扩展或重载）
 * @author pcitc 2017-10-24
 * @param {strInterval} 日期类型：'y、m、d、h、n、s、w'
 * @param {Number} 数量
 * @type Date
 * @returns 计算后的日期
 */
ECS.util.extendDate = function () {
    Date.prototype.dateAdd = function (strInterval, Number) {
        var dtTmp = this;
        switch (strInterval) {
            case 's':
                return new Date(Date.parse(dtTmp) + (1000 * Number));
            case 'n':
                return new Date(Date.parse(dtTmp) + (60000 * Number));
            case 'h':
                return new Date(Date.parse(dtTmp) + (3600000 * Number));
            case 'd':
                return new Date(Date.parse(dtTmp) + (86400000 * Number));
            case 'w':
                return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
            case 'q':
                return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case 'm':
                return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case 'y':
                return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        }
    }
};
/**
 * 时间戳转换为日期
 *
 * @author wan.wei 2018-09-17
 * @param data
 */
ECS.util.timestampToTime = function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    return Y + M + D;
};
ECS.util.timestampToTimes = function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate();
    return Y + M + D;
};

ECS.util.timestampToHour = function (timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
};

/**
 * 递归获取多级表格列信息
 *
 * @author xuelei.wang 2018-06-15
 * @param entityList
 * @param result
 */
function getTableColumns(entityList, result) {
    var columns = new Array();
    var childNodes = new Array();
    for (var i = 0; i < entityList.length; i++) {
        var col = {};
        col.title = entityList[i]["header"] == undefined ? entityList[i]["field"] : entityList[i]["header"];
        if (entityList[i]["field"] != undefined)
            col.field = entityList[i]["field"];
        if (entityList[i]["reportEntityList"] != null && entityList[i]["reportEntityList"] != undefined && entityList[i]["reportEntityList"].length > 0) {
            //.如果有子节点,则寻找最底级节点为其colSpan;
            var colSpan = getColSpan(entityList[i]["reportEntityList"]);
            if (colSpan != 1)
                col.colspan = colSpan;
            for (var j = 0; j < entityList[i]["reportEntityList"].length; j++) {
                childNodes.push(entityList[i]["reportEntityList"][j]);
            }
        } else {
            //.处理隐藏列信息
            if (entityList[i].isHide == InHideEnum.YES) continue;
            //.如果没有子节点,则寻找其平级节点最深子节点层级数为其rowSpan;
            var rowSpan = getRowSpan(entityList);
            if (rowSpan != 1)
                col.rowspan = rowSpan;
            processColumnInfo(entityList[i], col);
        }
        columns.push(col);
    }
    result.push(columns);
    if (childNodes.length > 0) {
        getTableColumns(childNodes, result);
    }
};

/**
 * 计算表格标头的RowSpan
 *
 * @author xuelei.wang
 * @param data
 * @returns {number}
 */
function getRowSpan(data) {
    var levelArray = new Array();
    for (var i = 0; i < data.length; i++) {
        window.GROUP_TABLE_ROW_LEVEL = 1;
        if (data[i]["reportEntityList"] != null && data[i]["reportEntityList"] != undefined && data[i]["reportEntityList"].length > 0) {
            getLevelCount(data[i]["reportEntityList"]);
        }
        levelArray.push(window.GROUP_TABLE_ROW_LEVEL);
    }
    return Math.max.apply(Math, levelArray);
};

/**
 * 递归计算当前树形节点的层级数
 *
 * @author xuelei.wang 2018-06-15
 * @param data
 */
function getLevelCount(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i]["reportEntityList"] != null && data[i]["reportEntityList"] != undefined && data[i]["reportEntityList"].length > 0) {
            ++window.GROUP_TABLE_ROW_LEVEL;
            getLevelCount(data[i]["reportEntityList"]);
        }
    }
};

/**
 * 计算表格表头的ColSpan
 *
 * @author xuelei.wang 2018-06-15
 * @param data
 * @returns {number}
 */
function getColSpan(data) {
    window.GROUP_TABLE_COLSPAN_COUNT = 0;
    var childNodes = new Array();
    for (var i = 0; i < data.length; i++) {
        if (data[i]["reportEntityList"] != null && data[i]["reportEntityList"] != undefined && data[i]["reportEntityList"].length > 0) {
            for (var j = 0; j < data[i]["reportEntityList"].length; j++) {
                childNodes.push(data[i]["reportEntityList"][j]);
            }
        } else {
            ++window.GROUP_TABLE_COLSPAN_COUNT;
        }
    }
    if (childNodes.length > 0) {
        getColSpanCount(childNodes);
    }
    return window.GROUP_TABLE_COLSPAN_COUNT;
};

/**
 * 递归计算表格表头的ColSpan
 *
 * @author xuelei.wang 2018-06-15
 * @param data
 */
function getColSpanCount(data) {
    var childNodes = new Array();
    for (var i = 0; i < data.length; i++) {
        if (data[i]["reportEntityList"] != null && data[i]["reportEntityList"] != undefined && data[i]["reportEntityList"].length > 0) {
            for (var j = 0; j < data[i]["reportEntityList"].length; j++) {
                childNodes.push(data[i]["reportEntityList"][j]);
            }
        } else {
            ++window.GROUP_TABLE_COLSPAN_COUNT;
        }
    }
    if (childNodes.length > 0) {
        getColSpanCount(childNodes);
    }
};

/**
 * 处理表格列信息
 * @author xuelei.wang 2018-06-21
 * @param data
 * @param col
 */
function processColumnInfo(data, col) {
    //.处理可编辑combox
    //添加一个装置列，此列可编辑点击有下拉框，
    //后台实现方式：需要配置两列，一列为ID、一列为显示名称，显示名称列的“Field”= “ID列的Field”_SHOWNAME
    //例如ID列的Field是“COL_UNIT_ID”，则名称列的Field是“COL_UNIT_ID_SHOWNAME”
    if (data.isEdit == IsEditEnum.TRUE) {
        if (data.controlType == ControlTypeEnum.ComboBox) {
            col.edit = "select";
            col.templet = function (rowData) {
                var name = this.field + "_SHOWNAME";
                return rowData[name] || '';
            }
        }
        else if (data.controlType == ControlTypeEnum.Date) {
            col.edit = "date";
        }
        else if (data.controlType == ControlTypeEnum.DateTime) {
            col.edit = "datetime";
        } else {
            col.edit = "text";
        }

        //处理数据类型
        if (data.dataType == DataTypeEnum.Date) {
            col.dataType = "date";
        }
        else if (data.dataType == DataTypeEnum.DateTime) {
            col.dataType = "datetime";
        }
        else if (data.dataType == DataTypeEnum.Number) {
            col.dataType = "number";
        }
        else {
            col.dataType = "text";
        }
    }
    //处理align位置信息
    if (data.align == AlignEnum.Left) {
        col.align = "left";
    }
    else if (data.align == AlignEnum.Right) {
        col.align = "right";
    } else {
        col.align = "center";
    }
};


ECS.util.Base64.base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
ECS.util.Base64.base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
/**

 * utf16转utf8

 * @param {Object} str

 */

ECS.util.Base64.utf16to8 = function (str) {

    var out, i, len, c;

    out = "";

    len = str.length;

    for (i = 0; i < len; i++) {

        c = str.charCodeAt(i);

        if ((c >= 0x0001) && (c <= 0x007F)) {

            out += str.charAt(i);

        }

        else if (c > 0x07FF) {

            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));

            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));

            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));

        }

        else {

            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));

            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));

        }

    }

    return out;

};


/**

 * utf8转utf16

 * @param {Object} str

 */

ECS.util.Base64.utf8to16 = function (str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx10xx xxxx10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
};


/**
 * base64编码
 * @param {Object} str
 */
ECS.util.Base64.base64encode = function (str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += ECS.util.Base64.base64EncodeChars.charAt(c1 >> 2);
            out += ECS.util.Base64.base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += ECS.util.Base64.base64EncodeChars.charAt(c1 >> 2);
            out += ECS.util.Base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += ECS.util.Base64.base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += ECS.util.Base64.base64EncodeChars.charAt(c1 >> 2);
        out += ECS.util.Base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += ECS.util.Base64.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += ECS.util.Base64.base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

/**

 * base64解码

 * @param {Object} str

 */

ECS.util.Base64.base64decode = function (str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = ECS.util.Base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c1 === -1);
        if (c1 === -1)
            break;
        /* c2 */
        do {
            c2 = ECS.util.Base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c2 === -1);
        if (c2 === -1)
            break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 === 61)
                return out;
            c3 = ECS.util.Base64.base64DecodeChars[c3];
        }
        while (i < len && c3 === -1);
        if (c3 === -1)
            break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 === 61)
                return out;
            c4 = ECS.util.Base64.base64DecodeChars[c4];
        }
        while (i < len && c4 === -1);
        if (c4 === -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }

    return out;

};


/**
 * 获取指定的Cookie值
 * @param cookieName
 * @returns {*}
 */
ECS.util.getCookie = function (cookieName) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(cookieName + "=");
        if (c_start !== -1) {
            c_start = c_start + cookieName.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end === -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
};


ECS.util.setCookie = function (cookieName, cookieValue, msCount) {
    var Days = 30; //此 cookie 将被保存 30 天
    var msCount2 = Days * 24 * 60 * 60 * 1000;
    if (msCount && parseInt(msCount)) {
        msCount2 = msCount;
    }
    var exp = new Date(); //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + msCount2);
    document.cookie = cookieName + "=" + encodeURI(cookieValue) + ";expires=" + exp.toGMTString();
};


ECS.util.DateRender = function (e) {
    if (e.value) {
        var value = new Date(e.value);
    } else {
        var value = new Date(e);
    }
    if (value) {
        return mini.formatDate(value, 'yyyy-MM-dd');
    }
    return value;

};

ECS.util.DateTimeRender = function (e) {
    if (e.value) {
        var value = new Date(e.value);
    } else {
        var value = new Date(e);
    }
    if (value) {
        return mini.formatDate(value, 'yyyy-MM-dd HH:mm:ss');
    }
    return value;
};

ECS.util.DateTimeRendesr = function (e) {
    if (e.value) {
        var value = new Date(e.value);
    } else {
        var value = new Date(e);
    }
    if (value) {
        return mini.formatDate(value, 'yyyy-MM-dd'+'\n'+'HH:mm:ss');
    }
    return value;
};

//返回编辑按钮
ECS.util.editRender = function (orgId, orgPID) {
    switch (arguments.length) {
        case 2:
            return '<a title="编辑" href="javascript:window.page.logic.edit(\'' + orgId + '\',\'' + orgPID + '\')"><i class="icon-edit edit"></i></a>';
            break;
        case 1:
            return '<a title="编辑" href="javascript:window.page.logic.edit(' + orgId + ')"><i class="icon-edit edit"></i></a>';
            break;
    }
};

//返回编辑按钮
ECS.util.editRenderer = function (e) {
    var uid = e.record._uid;
    return '<a title="编辑" href="javascript:window.page.logic.edit(' + uid + ')"><i class="icon-edit edit"></i></a>';
};

//渲染数据
ECS.util.renderer = function (e, dataSource, idField, textField) {
    idField = idField === undefined ? 'key' : idField;
    textField = textField === undefined ? 'value' : textField;
    for (var i = 0, len = dataSource.length; i < len; i++) {
        if (dataSource[i][idField] === e.value) {
            return dataSource[i][textField];
        }
    }
    return '';
};

//附件资源类型；
ECS.util.ReturnTypeName = function (n) {
    var type_list = {
        "1": "静态业务点", "2": "应急队伍点", "3": "应急物资存放点", "4": "视频点", "5": "实时监测点", "6": "静态线",
        "8": "静态面", "11": "企业", "12": "二级单位", "13": "安全风险区", "14": "作业风险区", "15": "风险分析对象"
    };
    return type_list[n];
};
//渲染附件上传页面
//参数说明：这些参数都必须传
/*
* code表示企业编码；
* id表示来源类型对应的id;
* name表示来源类型名称
* srcType表示来源类型type值
* title表示弹框标题；
* */
ECS.util.renderUploader_Page = function (code, id, name, srcType, title) {
    layer.open({
        type: 2,
        closeBtn: 0,
        area: ['800px', '450px'],
        skin: 'new-class',
        shadeClose: false,
        title: false,
        content: '../../bc/Attachment/index.html?' + Math.random(),
        success: function (layero, index) {
            var body = layer.getChildFrame('body', index);
            var iframeWin = window[layero.find('iframe')[0]['name']];
            var data = {
                "enterpriseCode": code,                     //企业编码
                "name": name,                                 //作业风险区名称
                "srcType": srcType,                           //类型对应值
                "srcRef": id,                                //来源类型对应ID
                'title': title                              //标题
            };
            iframeWin.page.logic.setData(data);
        },
        end: function () {
            page.logic.search(true);
        }
    })
};

//弹出框，用于新增，编辑
/*
    参数说明：params
    {
        width:800,      //宽
        height:500,     //高
        url:'',         //url
        data:{          //给弹出框的数据

        }
    }
* */
ECS.util.detail = function (params, callback) {
    params = $.extend({
        width: 860,
        height: 500,
        unit: 'px'
    }, params);
    layer.open({
        type: 2,
        closeBtn: 0,
        area: [params.width + params.unit, params.height + params.unit],
        skin: 'new-class',
        shadeClose: false,
        title: false,
        content: params.url + '?r=' + Math.random(),
        success: function (layero, index) {
            var iframeWin = window[layero.find('iframe')[0]['name']];
            if (iframeWin.page.logic.setData) {
                iframeWin.page.logic.setData(params.data);
            }
        },
        end: function () {
            if (callback) {
                callback();
            }
        }
    })
};

//弹出框新增，编辑 ajax 方法
/*
    参数说明：params
    {
        async:true,                         //异步，默认值
        pageMode:PageModelEnum.NewAdd,      //页面模式，默认值
        url:'',                             //url
        data:{                              //数据

        }
    }
* */
ECS.util.addOrEdit = function (params, successCallback, errorCallback) {
    params = $.extend({
        async: true,
        pageMode: PageModelEnum.NewAdd
    }, params);
    $.ajax({
        url: params.url,
        async: params.async,
        type: params.pageMode == PageModelEnum.NewAdd ? 'POST' : 'PUT',
        data: JSON.stringify(params.data),
        dataType: "text",
        contentType: "application/json;charset=utf-8",
        beforeSend: function () {
            ECS.showLoading();
        },
        success: function (result) {
            ECS.hideLoading();
            if (successCallback) {
                successCallback(result);
            }
            else {
                if (result.indexOf('collection') < 0) {
                    layer.msg(result, {
                        time: 1000
                    }, function () {
                        page.logic.closeLayer(true);
                    });
                } else {
                    layer.msg(result.collection.error.message);
                }
            }
        },
        error: function (result) {
            ECS.hideLoading();
            if (errorCallback) {
                errorCallback(result);
            }
            else {
                var errorResult = $.parseJSON(result.responseText);
                layer.msg(errorResult.collection.error.message);
            }
        }
    })
};

//删除 ajax 方法
/**
    参数说明：params
    {
        async:true,                         //异步，默认值
        url:'',                             //url
        grid:列表
        idField：列表主键字段名称
    }
* */
ECS.util.del = function (params, successCallback, errorCallback) {
    params = $.extend({
        async: true
    }, params);

    var delArr;

    var ids = [];
    var rows = params.grid.getSelecteds();
    for (var i = 0, len = rows.length; i < len; i++) {
        ids.push(rows[i][params.idField]);
    }

    if (ids.length === 0) {
        layer.msg("请选择要删除的数据!");
        return;
    }

    if (params.delArrKey != null) {
        delArr = {};
        delArr[params.delArrKey] = ids
    }

    layer.confirm('确定删除吗？', {
        btn: ['确定', '取消']
    }, function () {
        $.ajax({
            url: params.url,
            async: params.async,
            data: params.data != null ? params.data : params.delArrKey != null ? JSON.stringify(delArr) : JSON.stringify(ids),
            dataType: "text",
            timeout: 1000,
            contentType: "application/json;charset=utf-8",
            type: 'DELETE',
            beforeSend: function () {
                ECS.showLoading();
            },
            success: function (result) {
                ECS.hideLoading();
                if (successCallback) {
                    successCallback(result);
                }
                else {
                    if (result.indexOf('collection') < 0) {
                        layer.msg("删除成功！", {
                            time: 1000
                        }, function () {
                            params.grid.reload();
                        });
                    } else {
                        result = JSON.parse(result);
                        layer.msg(result.collection.error.message);
                    }
                }
            },
            error: function (result) {
                ECS.hideLoading();
                if (errorCallback) {
                    errorCallback();
                }
                else {
                    var errorResult = $.parseJSON(result.responseText);
                    layer.msg(errorResult.collection.error.message);
                }
            }
        })
    }, function (index) {
        layer.close(index)
    });
};

//绑定下拉框，树
/**
    参数说明：params
    {
        async:true,                         //异步，默认值 true
        url:'',                             //url
        idField:'',                         // id，默认值 key  
        textField:''                        // text，默认值 value
    }
* */
ECS.util.bindCmb = function (params, callback, changeCallback) {
    params = $.extend({
        async: true,
        idField: 'key',
        textField: 'value',
        isTree: false,
        pIdField: 'pid'
    }, params);
    var cmb = mini.get(params.ctrId);
    $.ajax({
        async: params.async,
        url: params.url,
        type: 'GET',
        data: params.data,
        success: function (data) {
            cmb.setValueField(params.idField);
            cmb.setTextField(params.textField);
            if (params.isTree) {
                cmb.loadList(data, params.idField, params.pIdField);
            }
            else {
                cmb.setData(data);
            }
            if (callback) {
                callback(data);
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
    if (changeCallback) {
        cmb.on('valuechanged', function (e) {
            changeCallback(e);
        });
    }
};
/**
 * 发起一个前端http请求文件操作
 * 2019/4/2 junyi.zhang 添加
 */
ECS.util.pingServer = function(){
    $.ajax({
        async: true,
        url: '../../../js/common/p.js',
        type: 'GET',
        success: function (data) {
            console.log(data);
        },
        error: function (e) {
            console.log(e);
        }
    });
};
jQuery(document).bind("ajaxSend", function (event, request, settings) {

    if (settings.global === false) {
        return;
    }
    var token = ECS.sys.getTokenFromSYS();
    if (token) {
        var headers = settings.headers || {};
        headers["Authorization"] = ECS.sys.BearerStartName + token;
        request.setRequestHeader("Authorization", ECS.sys.BearerStartName + token);
        settings.headers = headers;

        var headers2 = settings.headers || {};
        headers2["SYS_CONTEXT_CIPHERTEXT"] = ECS.sys.ContextCipherText;
        request.setRequestHeader("SYS_CONTEXT_CIPHERTEXT", ECS.sys.ContextCipherText);
        settings.headers = headers2;
    }
});
// jQuery(document).bind("ajaxSend", function (event, request, settings) {//ns登录测试

//     if (settings.global === false) {
//         return;
//     }
//     var localarr = settings.url.split('?')[0].split('&');
//     if (localarr == 'http://localhost:8090/api/bc/login' || localarr == ECS.api.loginUrl + '/api/bc/login') {
//         return;
//     }
//     var res = JSON.parse(localStorage.getItem('result'));
//     console.log(res)
//     if (res != null) {
//         var headers = settings.headers || {};
//         headers["Authorization"] = res.result;
//         request.setRequestHeader("Authorization", res.result);
//         settings.headers = headers;

//         var headers2 = settings.headers || {};
//         headers2["SYS_CONTEXT_CIPHERTEXT"] = res.result;
//         request.setRequestHeader("SYS_CONTEXT_CIPHERTEXT", res.result);
//         settings.headers = headers2;
//     }else{
//         window.location.href = ECS.api.loginUrl + '/src/main/webapp/home/home.html';
//     }
// });
jQuery(document).bind("error", function (event, request, settings, data) { //ns请求处理
    // console.log(data)
    //  var res = JSON.parse(localStorage.getItem('result'));
    //  // console.log(res.result);
    //  if (res) {
    //      var id = res.result || '';
    //      var headers = settings.headers || {};
    //      // headers["name"] = username;
    //      request.setRequestHeader(id);
    //      settings.headers = headers;
    //  }
    // var EwdFlag =request.getResponseHeader("EwdFlag")
    var username = localStorage.getItem('userName') || '';
    if (settings.global === false) {
        return;
    }
    var headers = settings.headers || {};
    headers["ns"] = username;
    request.setRequestHeader("ns", username);
    settings.headers = headers;

});
ECS.sys.isHQ = function(code){
    return code === ECS.sys.hq_code;
};
ECS.sys.getTokenFromSYS = function () {
    return ECS.util.getCookie(ECS.sys.TokenCookieName);
};

// 从cookie中的
ECS.sys.getLoginNameFromSYS = function () {
    //由于所有主页面都有此问题，无法进行批处理，此方法所有页面都有调用，因此在这里中间加杂一段关于页面高度的设置，与此函数的获取账号毫无关系；---- by shuang yuan
    //页面高度设置------start  2019.4.30
    if($(".box-header")){
        //获取页面的高度；
        var iClient_h = $(document.body).outerHeight();
        //获取标题行的高度；（32为box-body的上下padding之和)
        var iTtile_h = $(".box-header").outerHeight()+32+15;
        //动态计算主体内容块的高度；
        $(".box-main > .box-body").css("min-height",(iClient_h-iTtile_h)+"px");
        //释放变量；
        iClient_h=null;
        iTtile_h=null;
    }
    //页面高度设置------end
    var loginName = ECS.util.getCookie(ECS.sys.LoginNameCookieName);
    if (loginName === undefined || loginName === '') {
        //loginName = 'ecs002'; //没有获得用户信息
        loginName = 'ecs002';   //总部账户为ecs101，其它为普通账户，例如ecs007;
    }
    return loginName;
};

ECS.sys.RefreshContextFromSYS = function () {
    var loginname = ECS.sys.getLoginNameFromSYS();
    //var u16='{"SYS_ID":"ECS","SYS_ORG_UNIT_PATH":"","SYS_VERSION":"DEV","SYS_ORG_UNIT_NAME":"","SYS_IS_HQ":false,"SYS_ORG_NAME":"","SYS_ENTERPRISE_CODE":"","SYS_ENTERPRISE_NAME":"","SYS_ORG_UNIT_CODE":"","SYS_SESSION_ID":"","SYS_USER_NAME":"ecs管理员","SYS_CLIENT_IP":"0:0:0:0:0:0:0:1","SYS_ORG_CODE":"","SYS_OTHER_INFO":"","SYS_USER_CODE":"ecsadmin"}';
    //ECS.sys.Context=JSON.parse(u16);
    var url0 = ECS.api.commonUrl + '/getSysContext';
    $.ajax({
        url: url0,
        async: false,
        data: { loginName: loginname },
        dataType: "text",
        contentType: "application/json;charset=utf-8",
        type: 'GET',
        success: function (result) {
            if (result) {
                ECS.sys.ContextCipherText = result;
                var u8 = ECS.util.Base64.base64decode(result);
                var u16 = ECS.util.Base64.utf8to16(u8);
                ECS.sys.Context = JSON.parse(u16);
                localStorage.setItem("gisOrgCode", ECS.sys.Context.SYS_ENTERPRISE_CODE);
            } else {

            }
        },
        error: function (result) {

        }
    })
};

/**
 * impUrl 导入接口
 * exportUrl 导出错误信息接口
 *  confirmUrl 数据格式正确确认导入接口
 *  pageUrl 导入页面地址
 *  pageflag 数据检测标识
 */
ECS.util.importExcel = function(impUrl,exportUrl,confirmUrl,pageUrl,callback){
              
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '60%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: pageUrl ,
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": PageModelEnum.NewAdd,
							'title': '导入',
                             url :impUrl,
                             exportUrl :exportUrl,
                             confirmUrl :confirmUrl
						};

						iframeWin.page.logic.setData(data);
					},
					end: function () {
                        page.logic.search();
                        if(!pageflag){
                            ECS.util.ExportExcel(exportUrl,redisKey);
                        }else{
                            if(callback){
                                callback();
                            }
                        }
                     
					}
				})
};

/*
    导出错误信息
*/
ECS.util.ExportExcel = function(exportUrl,redisKey){
    layer.confirm('数据错误，是否导出？', {
        btn: ['确定', '取消']
    }, function (index) {
        layer.close(index);
        var url =exportUrl+"?redisKey="+redisKey;
        var form = $("<form>"); //定义一个form表单
        form.attr("style", "display:none");
        form.attr("target", "");
        form.attr("method", "get");
        form.attr("action", url);
        var input1 = $("<input>");
        input1.attr("type", "hidden");
        input1.attr("name", "redisKey");
        input1.attr("value", redisKey);
        $("body").append(form); //将表单放置在web中
        form.append(input1);

        form.submit(); //表单提交

        var timeoutID = setInterval(function() {
            if (window.document.readyState != "loading") {
                try {
                    clearTimeout(timeoutID);
               
                } catch(e) {

                }
            }
        }, 3000);
    }, function (index) {
        layer.close(index)
    });
};

