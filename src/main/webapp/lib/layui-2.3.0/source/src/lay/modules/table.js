/**

 @Name：layui.table 表格操作
 @Author：贤心
 @License：MIT

 */

layui.define(['laytpl', 'laypage', 'layer', 'form'], function (exports) {
    "use strict";

    var $ = layui.$
        , laytpl = layui.laytpl
        , laypage = layui.laypage
        , layer = layui.layer
        , form = layui.form
        , hint = layui.hint()
        , device = layui.device()

        //外部接口
        , table = {
            config: {
                checkName: 'LAY_CHECKED' //是否选中状态的字段名
                , indexName: 'LAY_TABLE_INDEX' //下标索引名
            } //全局配置项
            , cache: {} //数据缓存
            , index: layui.table ? (layui.table.index + 10000) : 0

            //设置全局项
            , set: function (options) {
                var that = this;
                that.config = $.extend({}, that.config, options);
                return that;
            }

            //事件监听
            , on: function (events, callback) {
                return layui.onevent.call(this, MOD_NAME, events, callback);
            }
        }

        //操作当前实例
        , thisTable = function () {
            var that = this
                , options = that.config
                , id = options.id;

            id && (thisTable.config[id] = options);

            return {
                reload: function (options) {
                    that.reload.call(that, options);
                },
                //modify by xuelei.wang 2018-06-20
                getData: function () {
                    that.getData.call(that);
                },
                //modify by xuelei.wang 2018-06-20
                getChangedData: function () {
                    that.getChangedData.call(that);
                }
                , config: options
            }
        }

        //字符常量
        , MOD_NAME = 'table', ELEM = '.layui-table', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide',
        DISABLED = 'layui-disabled', NONE = 'layui-none'

        //modify xuelei.wang 2018-7-3
        , ELEM_VIEW = 'layui-table-view', ELEM_HEADER = '.layui-table-header', ELEM_BODY = '.layui-table-body',
        ELEM_MAIN = '.layui-table-main', ELEM_FIXED = '.layui-table-fixed', ELEM_FIXL = '.layui-table-fixed-l',
        ELEM_FIXR = '.layui-table-fixed-r', ELEM_TOOL = '.layui-table-tool', ELEM_PAGE = '.layui-table-page',
        ELEM_SORT = '.layui-table-sort', ELEM_EDIT = 'layui-table-edit', ELEM_CONTROL = 'layui-table-control',
        ELEM_HOVER = 'layui-table-hover', TABLE_DATA_UUID_NAME = '_$$UUID$$_', TABLE_STATUS_DELETE = 'DELETE',
        TABLE_STATUS_UPDATE = 'UPDATE',TABLE_ROWSPAN='__$$ROWSPAN$$__',
        TABLE_STATUS_NEW = 'NEW', TABLE_ROW_STATUS = '$$_TABLE_ROW_STATUS_$$'

        //thead区域模板
        , TPL_HEADER = function (options) {
            var rowCols = '{{#if(item2.colspan){}} colspan="{{item2.colspan}}"{{#} if(item2.rowspan){}} rowspan="{{item2.rowspan}}"{{#}}}';

            options = options || {};
            return ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
                , '{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
                , '<thead>'
                , '{{# layui.each(d.data.cols, function(i1, item1){ }}'
                , '<tr>'
                , '{{# layui.each(item1, function(i2, item2){ }}'
                , '{{# if(item2.fixed && item2.fixed !== "right"){ left = true; } }}'
                , '{{# if(item2.fixed === "right"){ right = true; } }}'
                , function () {
                    if (options.fixed && options.fixed !== 'right') {
                        return '{{# if(item2.fixed && item2.fixed !== "right"){ }}';
                    }
                    if (options.fixed === 'right') {
                        return '{{# if(item2.fixed === "right"){ }}';
                    }
                    return '';
                }()
                //modify by xuelei.wang 2018-6-19,表头信息默认居中
                , '<th data-field="{{ item2.field||i2 }}" {{# if(item2.minWidth){ }}data-minwidth="{{item2.minWidth}}"{{# } }} ' + rowCols + ' {{# if(item2.unresize){ }}data-unresize="true"{{# } }}>'
                , '<div class="layui-table-cell laytable-cell-'
                , '{{# if(item2.colspan > 1){ }}'
                , 'group'
                , '{{# } else { }}'
                , '{{d.index}}-{{item2.field || i2}}'
                , '{{# if(item2.type !== "normal"){ }}'
                , ' laytable-cell-{{ item2.type }}'
                , '{{# } }}'
                , '{{# } }}'
                , '" align="center">'
                , '{{# if(item2.type === "checkbox"){ }}' //复选框
                , '<input type="checkbox" name="layTableCheckbox" lay-skin="primary" lay-filter="layTableAllChoose" {{# if(item2[d.data.checkName]){ }}checked{{# }; }}>'
                , '{{# } else { }}'
                , '<span>{{item2.title||""}}</span>'
                , '{{# if(!(item2.colspan > 1) && item2.sort){ }}'
                , '<span class="layui-table-sort layui-inline"><i class="layui-edge layui-table-sort-asc"></i><i class="layui-edge layui-table-sort-desc"></i></span>'
                , '{{# } }}'
                , '{{# } }}'
                , '</div>'
                , '</th>'
                , (options.fixed ? '{{# }; }}' : '')
                , '{{# }); }}'
                , '</tr>'
                , '{{# }); }}'
                , '</thead>'
                , '</table>'].join('');
        }

        //tbody区域模板
        , TPL_BODY = ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
            , '{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
            , '<tbody></tbody>'
            , '</table>'].join('')

        //主模板
        ,
        TPL_MAIN = ['<div class="layui-form layui-border-box {{d.VIEW_CLASS}}" lay-filter="LAY-table-{{d.index}}" style="{{# if(d.data.width){ }}width:{{d.data.width}}px;{{# } }} {{# if(d.data.height){ }}height:{{d.data.height}}px;{{# } }}">'

            , '{{# if(d.data.toolbar){ }}'
            , '<div class="layui-table-tool"></div>'
            , '{{# } }}'

            , '<div class="layui-table-box">'
            , '{{# var left, right; }}'
            , '<div class="layui-table-header">'
            , TPL_HEADER()
            , '</div>'
            , '<div class="layui-table-body layui-table-main">'
            , TPL_BODY
            , '</div>'

            , '{{# if(left){ }}'
            , '<div class="layui-table-fixed layui-table-fixed-l">'
            , '<div class="layui-table-header">'
            , TPL_HEADER({fixed: true})
            , '</div>'
            , '<div class="layui-table-body">'
            , TPL_BODY
            , '</div>'
            , '</div>'
            , '{{# }; }}'

            , '{{# if(right){ }}'
            , '<div class="layui-table-fixed layui-table-fixed-r">'
            , '<div class="layui-table-header">'
            , TPL_HEADER({fixed: 'right'})
            , '<div class="layui-table-mend"></div>'
            , '</div>'
            , '<div class="layui-table-body">'
            , TPL_BODY
            , '</div>'
            , '</div>'
            , '{{# }; }}'
            , '</div>'

            , '{{# if(d.data.page){ }}'
            , '<div class="layui-table-page">'
            , '<div id="layui-table-page{{d.index}}"></div>'
            , '</div>'
            , '{{# } }}'

            , '<style>'
            , '{{# layui.each(d.data.cols, function(i1, item1){'
            , 'layui.each(item1, function(i2, item2){ }}'
            , '.laytable-cell-{{d.index}}-{{item2.field||i2}}{ '
            , '{{# if(item2.width){ }}'
            , 'width: {{item2.width}}px;'
            , '{{# } }}'
            , ' }'
            , '{{# });'
            , '}); }}'
            , '</style>'
            , '</div>'].join('')

        , _WIN = $(window)
        , _DOC = $(document)

        //构造器
        , Class = function (options) {
            var that = this;
            that.index = ++table.index;
            that.config = $.extend({}, that.config, table.config, options);
            that.render();
        };

    //默认配置
    Class.prototype.config = {
        limit: 10 //每页显示的数量
        , loading: true //请求数据时，是否显示loading
        , cellMinWidth: 60 //所有单元格默认最小宽度
        , text: {
            none: '无数据'
        }
    };

    //表格渲染
    Class.prototype.render = function () {
        var that = this
            , options = that.config;

        options.elem = $(options.elem);
        options.where = options.where || {};
        options.id = options.id || options.elem.attr('id');

        //请求参数的自定义格式
        options.request = $.extend({
            pageName: 'page'
            , limitName: 'limit'
        }, options.request)


        //modify by xuelei.wang 2018-7-10 增加是否分页参数,处理表格不分页问题;
        if (options.pageable == undefined || options.pageable == null) {
            options.pageable = true;
        }

        //响应数据的自定义格式
        options.response = $.extend({
            statusName: 'code'
            , statusCode: 0
            , msgName: 'msg'
            , dataName: 'data'
            , countName: 'count'
        }, options.response);

        //如果 page 传入 laypage 对象
        if (typeof options.page === 'object') {
            options.limit = options.page.limit || options.limit;
            options.limits = options.page.limits || options.limits;
            that.page = options.page.curr = options.page.curr || 1;
            delete options.page.elem;
            delete options.page.jump;
        }

        if (!options.elem[0]) return that;

        that.setArea(); //动态分配列宽高

        //开始插入替代元素
        var othis = options.elem
            , hasRender = othis.next('.' + ELEM_VIEW)

            //主容器
            , reElem = that.elem = $(laytpl(TPL_MAIN).render({
                VIEW_CLASS: ELEM_VIEW
                , data: options
                , index: that.index //索引
            }));

        options.index = that.index;

        //生成替代元素
        hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
        othis.after(reElem);

        //各级容器
        that.layHeader = reElem.find(ELEM_HEADER);
        that.layMain = reElem.find(ELEM_MAIN);
        that.layBody = reElem.find(ELEM_BODY);
        that.layFixed = reElem.find(ELEM_FIXED);
        that.layFixLeft = reElem.find(ELEM_FIXL);
        that.layFixRight = reElem.find(ELEM_FIXR);
        that.layTool = reElem.find(ELEM_TOOL);
        that.layPage = reElem.find(ELEM_PAGE);

        that.layTool.html(
            laytpl($(options.toolbar).html() || '').render(options)
        );

        if (options.height) that.fullSize(); //设置body区域高度

        //如果多级表头，则填补表头高度
        if (options.cols.length > 1) {
            var th = that.layFixed.find(ELEM_HEADER).find('th');
            th.height(that.layHeader.height() - 1 - parseFloat(th.css('padding-top')) - parseFloat(th.css('padding-bottom')));
        }

        //请求数据
        that.pullData(that.page);
        that.events();
    };

    //根据列类型，定制化参数
    Class.prototype.initOpts = function (item) {
        var that = this,
            options = that.config
            , initWidth = {
                checkbox: 48
                , space: 15
                , numbers: 40
            };

        //让 type 参数兼容旧版本
        if (item.checkbox) item.type = "checkbox";
        if (item.space) item.type = "space";
        if (!item.type) item.type = "normal";

        if (item.type !== "normal") {
            item.unresize = true;
            item.width = item.width || initWidth[item.type];
        }
    };

    //动态分配列宽高
    Class.prototype.setArea = function () {
        var that = this,
            options = that.config
            , colNums = 0 //列个数
            , autoColNums = 0 //自动列宽的列个数
            , autoWidth = 0 //自动列分配的宽度
            , countWidth = 0 //所有列总宽度和
            , cntrWidth = options.width || function () { //获取容器宽度
                //如果父元素宽度为0（一般为隐藏元素），则继续查找上层元素，直到找到真实宽度为止
                var getWidth = function (parent) {
                    var width, isNone;
                    parent = parent || options.elem.parent()
                    width = parent.width();
                    try {
                        isNone = parent.css('display') === 'none';
                    } catch (e) {
                    }
                    if (parent[0] && (!width || isNone)) return getWidth(parent.parent());
                    return width;
                };
                return getWidth();
            }();

        //统计列个数
        that.eachCols(function () {
            colNums++;
        });

        //减去边框差
        cntrWidth = cntrWidth - function () {
            return (options.skin === 'line' || options.skin === 'nob') ? 2 : colNums + 1;
        }();

        //遍历所有列
        layui.each(options.cols, function (i1, item1) {
            layui.each(item1, function (i2, item2) {
                var width;

                if (!item2) {
                    item1.splice(i2, 1);
                    return;
                }

                that.initOpts(item2);
                width = item2.width || 0;

                if (item2.colspan > 1) return;

                if (/\d+%$/.test(width)) {
                    item2.width = width = Math.floor((parseFloat(width) / 100) * cntrWidth);
                } else if (!width) { //列宽未填写
                    item2.width = width = 0;
                    autoColNums++;
                }

                countWidth = countWidth + width;
            });
        });

        that.autoColNums = autoColNums; //记录自动列数

        //如果未填充满，则将剩余宽度平分。否则，给未设定宽度的列赋值一个默认宽
        (cntrWidth > countWidth && autoColNums) && (
            autoWidth = (cntrWidth - countWidth) / autoColNums
        );

        layui.each(options.cols, function (i1, item1) {
            layui.each(item1, function (i2, item2) {
                var minWidth = item2.minWidth || options.cellMinWidth;
                if (item2.colspan > 1) return;
                if (item2.width === 0) {
                    item2.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth); //不能低于设定的最小宽度
                }
            });
        });

        //高度铺满：full-差距值
        if (options.height && /^full-\d+$/.test(options.height)) {
            that.fullHeightGap = options.height.split('-')[1];
            options.height = _WIN.height() - that.fullHeightGap;
        }
    };

    //表格重载
    Class.prototype.reload = function (options) {
        var that = this;
        if (that.config.data && that.config.data.constructor === Array) delete that.config.data;
        that.config = $.extend({}, that.config, options);
        that.render();
    };

    //页码
    Class.prototype.page = 1;

    //获得数据
    Class.prototype.pullData = function (curr, loadIndex) {
        var that = this
            , options = that.config
            , request = options.request
            , response = options.response
            , sort = function () {
            if (typeof options.initSort === 'object') {
                that.sort(options.initSort.field, options.initSort.type);
            }
        };

        that.startTime = new Date().getTime(); //渲染开始时间

        if (options.url) { //Ajax请求
            var params = {};
            if (options.pageable) {
                params[request.pageName] = curr;
                params[request.limitName] = options.limit;
            }

            //参数
            var data = $.extend(params, options.where);
            if (options.contentType && options.contentType.indexOf("application/json") == 0) { //提交 json 格式
                data = JSON.stringify(data);
            }

            $.ajax({
                type: options.method || 'get'
                , url: options.url
                , contentType: options.contentType
                , data: data
                , dataType: 'json'
                , headers: options.headers || {}
                , success: function (res) {
                    if (options.pageable) {
                        if (res[response.statusName] != response.statusCode) {
                            that.renderForm();
                            that.layMain.html('<div class="' + NONE + '">' + (res[response.msgName] || '返回的数据状态异常') + '</div>');
                        } else {
                            that.renderData(res, curr, res[response.countName]), sort();
                            options.time = (new Date().getTime() - that.startTime) + ' ms'; //耗时（接口请求+视图渲染）
                        }
                    } else {
                        var res1 = {}
                            , startLimit = 0;

                        res1[response.dataName] = res.concat().splice(startLimit, options.limit);
                        res1[response.countName] = res.length;

                        that.renderData(res1, curr, res1.length), sort();
                        typeof options.done === 'function' && options.done(res1, curr, res1[response.countName]);
                    }
                    loadIndex && layer.close(loadIndex);
                    typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
                }
                , error: function (e, m) {
                    that.layMain.html('<div class="' + NONE + '">数据接口请求异常</div>');
                    that.renderForm();
                    loadIndex && layer.close(loadIndex);
                }
            });
        } else if (options.data && options.data.constructor === Array) { //已知数据
            var res = {}
                , startLimit = curr * options.limit - options.limit

            res[response.dataName] = options.data.concat().splice(startLimit, options.limit);
            res[response.countName] = options.data.length;

            that.renderData(res, curr, options.data.length), sort();
            typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
        }
    };
    //modify xuelei.wang 2018-7-13 增加UUID生成方法;
    Class.prototype.genUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    //遍历表头
    Class.prototype.eachCols = function (callback) {
        var cols = $.extend(true, [], this.config.cols)
            , arrs = [], index = 0;

        //重新整理表头结构
        layui.each(cols, function (i1, item1) {
            layui.each(item1, function (i2, item2) {
                //如果是组合列，则捕获对应的子列
                if (item2.colspan > 1) {
                    var childIndex = 0;
                    index++
                    item2.CHILD_COLS = [];
                    layui.each(cols[i1 + 1], function (i22, item22) {
                        if (item22.PARENT_COL || childIndex == item2.colspan) return;
                        item22.PARENT_COL = index;
                        item2.CHILD_COLS.push(item22);
                        childIndex = childIndex + (item22.colspan > 1 ? item22.colspan : 1);
                    });
                }
                if (item2.PARENT_COL) return; //如果是子列，则不进行追加，因为已经存储在父列中
                arrs.push(item2)
            });
        });

        //重新遍历列，如果有子列，则进入递归
        var eachArrs = function (obj) {
            layui.each(obj || arrs, function (i, item) {
                if (item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
                callback(i, item);
            });
        };

        eachArrs();
    };
    //modify by xuelei.wang 2018-7-13 查找组长度
    Class.prototype.getGroupLength=function(col,dataArray){
        var len=0;
        if(dataArray==undefined||dataArray.length==0)return len;
        var referCol=undefined;
        if(col.merge instanceof Object&&col.merge.referField){
            referCol =dataArray[0][col.merge.referField];
        }
        var first=dataArray[0][col.field];
        if(first==undefined)return len;

        for(var i=0;i<dataArray.length;i++){
            if(referCol!=undefined){
                if(dataArray[i][col.field]==first&&dataArray[i][col.merge.referField]==referCol){

                }else{
                    break;
                }
            }else{
                if(dataArray[i][col.field]!=first){
                    break;
                }
            }
            len++;
        }
        return len;
    };
    //数据渲染
    Class.prototype.renderData = function (res, curr, count, sort) {
        var that = this
            , options = that.config
            , data = res[options.response.dataName] || []
            , trs = []
            , trs_fixed = []
            , trs_fixed_r = []

            //渲染视图
            , render = function () { //后续性能提升的重点
                if (!sort && that.sortKey) {
                    return that.sort(that.sortKey.field, that.sortKey.sort, true);
                }
                layui.each(data, function (i1, item1) {
                        if (item1 && item1[TABLE_ROW_STATUS] && item1[TABLE_ROW_STATUS] == TABLE_STATUS_DELETE) {

                        } else {

                            var tds = [], tds_fixed = [], tds_fixed_r = []
                                , numbers = i1 + options.limit * (curr - 1) + 1; //序号

                            if (item1.length === 0) return;
                            if (!sort) {
                                item1[table.config.indexName] = i1;
                            }

                            that.eachCols(function (i3, item3) {
                                if(item3.field==undefined&&item3.type=='normal') return;
                                var field = item3.field || i3, content = item1[field]
                                    , cell = that.getColElem(that.layHeader, field);

                                if (content === undefined || content === null) content = '';
                                //modify xuelei.wang 2018-7-16解决复杂表头数据渲染bug;
                                if (item3.colspan > 1) return;
                                var rowSpan=1;
                                //td内容
                                if(item3.merge&&item3.field&&item1[item3.field+TABLE_ROWSPAN]&&item1[item3.field+TABLE_ROWSPAN]!=1){
                                    rowSpan=item1[item3.field+TABLE_ROWSPAN];
                                }
                                var td = ['<td data-field="' + field + '" ' + function () {
                                    var attr = [];
                                    if (item3.edit) attr.push('data-edit="' + item3.edit + '"'); //是否允许单元格编辑
                                    if (item3.align) attr.push('align="' + item3.align + '"'); //对齐方式
                                    if (item3.templet) attr.push('data-content="' + content + '"'); //自定义模板
                                    if (item3.toolbar) attr.push('data-off="true"'); //自定义模板
                                    if (item3.event) attr.push('lay-event="' + item3.event + '"'); //自定义事件
                                    if (item3.style) attr.push('style="' + item3.style + '"'); //自定义样式
                                    if (item3.minWidth) attr.push('data-minwidth="' + item3.minWidth + '"'); //单元格最小宽度
                                    //新增数据类型;modify by xuelei.wang 2018-6-21
                                    if (item3.dataType) attr.push('data-datatype="' + item3.dataType + '"'); //数据类型
                                    if(rowSpan!=1){
                                        attr.push('rowspan="' + rowSpan+ '"');
                                    }
                                    return attr.join(' ');
                                }() + '>'
                                    , '<div class="layui-table-cell laytable-cell-' + function () { //返回对应的CSS类标识
                                        var str = (options.index + '-' + field);
                                        return item3.type === 'normal' ? str
                                            : (str + ' laytable-cell-' + item3.type);
                                    }() + '">' + function () {
                                        var tplData = $.extend(true, {
                                            LAY_INDEX: numbers
                                        }, item1);

                                        //渲染复选框列视图
                                        if (item3.type === 'checkbox') {
                                            return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary" ' + function () {
                                                var checkName = table.config.checkName;
                                                //如果是全选
                                                if (item3[checkName]) {
                                                    item1[checkName] = item3[checkName];
                                                    return item3[checkName] ? 'checked' : '';
                                                }
                                                return tplData[checkName] ? 'checked' : '';
                                            }() + '>';
                                        } else if (item3.type === 'numbers') { //渲染序号
                                            return numbers;
                                        }
                                        //modify xuelei.wang 2018-7-3
                                        else if (item3.type === 'checkbox_control') {
                                            return '<input type="checkbox" name="layTableCheckbox_Control"  lay-skin="primary" lay-filter="layTableCheckbox_Control"' + function () {
                                                return tplData[item3.field] == '1' ? 'checked' : '';
                                            }() + '>';
                                        }
                                        else if (item3.type === 'number_control') {
                                            return '<input type="number" name="layTableNumber_Control" class="layui-input ' + ELEM_CONTROL + '" lay-ignore  value="' + function () {
                                                return tplData[item3.field]||'';
                                            }() + '">';
                                        }
                                        else if (item3.type === 'dropdown_control') {
                                            if (!item3.config || !item3.config.data) {
                                                lay.hint("未配置表格下拉数据源选项!");
                                                return;
                                            }
                                            var option = new Array();
                                            var name = item3.config['name'] || 'name';
                                            var value = item3.config['value'] || 'value';
                                            for (var i = 0; i < item3.config.data.length; i++) {
                                                if (tplData[item3.field] == item3.config.data[i][value]) {
                                                    option.push('<option value="' + item3.config.data[i][value] + '" selected>' + item3.config.data[i][name] + '</option>');
                                                }
                                                else {
                                                    option.push('<option value="' + item3.config.data[i][value] + '">' + item3.config.data[i][name] + '</option>');
                                                }
                                            }
                                            return '<select  class="' + ELEM_CONTROL + '" lay-ignore >' + option.join('') + '</select>';
                                        } else if (item3.type === 'textbox_control') {
                                            return '<input type="text" name="layTableNumber_Control" maxlength="100" class="layui-input ' + ELEM_CONTROL + '" lay-ignore  value="' + function () {
                                                return tplData[item3.field]||'';
                                            }() + '">';
                                        }

                                        //解析工具列模板
                                        if (item3.toolbar) {
                                            return laytpl($(item3.toolbar).html() || '').render(tplData);
                                        }
                                        return item3.templet ? function () {
                                            return typeof item3.templet === 'function'
                                                ? item3.templet(tplData)
                                                : laytpl($(item3.templet).html() || String(content)).render(tplData)
                                        }() : content;
                                    }()
                                    , '</div></td>'].join('');
                                //modify xuelei.wang 2018-7-13
                                if(item3.merge==undefined){
                                    tds.push(td);
                                    if (item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
                                    if (item3.fixed === 'right') tds_fixed_r.push(td);
                                }
                                else if(item3.merge&&item3.field&&item1[item3.field+TABLE_ROWSPAN]==undefined){
                                    tds.push(td);
                                    if (item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
                                    if (item3.fixed === 'right') tds_fixed_r.push(td);
                                }
                                else if(item3.merge&&item3.field&&item1[item3.field+TABLE_ROWSPAN]&&item1[item3.field+TABLE_ROWSPAN]!=1){
                                    tds.push(td);
                                    if (item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
                                    if (item3.fixed === 'right') tds_fixed_r.push(td);
                                }
                            });

                            trs.push('<tr data-index="' + i1 + '">' + tds.join('') + '</tr>');
                            trs_fixed.push('<tr data-index="' + i1 + '">' + tds_fixed.join('') + '</tr>');
                            trs_fixed_r.push('<tr data-index="' + i1 + '">' + tds_fixed_r.join('') + '</tr>');
                        }
                    }
                );

                //if(data.length === 0) return;

                that.layBody.scrollTop(0);
                that.layMain.find('.' + NONE).remove();
                that.layMain.find('tbody').html(trs.join(''));
                that.layFixLeft.find('tbody').html(trs_fixed.join(''));
                that.layFixRight.find('tbody').html(trs_fixed_r.join(''));

                that.renderForm();
                that.syncCheckAll();
                that.haveInit ? that.scrollPatch() : setTimeout(function () {
                    that.scrollPatch();
                }, 50);
                that.haveInit = true;
                layer.close(that.tipsIndex);

            };

        that.key = options.id || options.index;
        table.cache[that.key] = data; //记录数据
        //modify by xuelei.wang 表格数据生成UUID,以便记录改变状态
        if (table.cache[that.key] && table.cache[that.key].length > 0) {
            for (var i = 0; i < table.cache[that.key].length; i++) {
                table.cache[that.key][i][TABLE_DATA_UUID_NAME] = that.genUUID();
            }
        }
        //modify by xuelei.wang 表格数据列合并数据预处理
        if (table.cache[that.key] && table.cache[that.key].length > 0) {
            that.eachCols(function (i, item) {
                //处理表格内容项合并
                if (item.merge) {
                    var dataIndex = 0;
                    var groupLength = 0;
                    //处理没有参照列
                    for (var i = 0; i < table.cache[that.key].length; i++) {
                        //如果是第一列信息,则计算出该组数据的长度;
                        if (dataIndex == 0) {
                            groupLength = that.getGroupLength(item, table.cache[that.key].slice(i));
                            if(groupLength!=1) {
                                table.cache[that.key][i][item.field + TABLE_ROWSPAN] = groupLength;
                            }
                        } else {
                            //如果不是第一列信息,则标记rowspan=1;方便后续处理;
                            table.cache[that.key][i][item.field + TABLE_ROWSPAN] = 1;
                        }
                        dataIndex++;
                        if (dataIndex == groupLength) {
                            dataIndex = 0;
                            groupLength = 0;
                        }
                    }
                }
            });
        }
        //显示隐藏分页栏
        that.layPage[data.length === 0 && curr == 1 ? 'addClass' : 'removeClass'](HIDE);

        //排序
        if (sort) {
            return render();
        }

        if (data.length === 0) {
            that.renderForm();
            that.layFixed.remove();
            that.layMain.find('tbody').html('');
            that.layMain.find('.' + NONE).remove();
            return that.layMain.append('<div class="' + NONE + '">' + options.text.none + '</div>');
        }

        render();

        //同步分页状态
        if (options.page) {
            options.page = $.extend({
                elem: 'layui-table-page' + options.index
                , count: count
                , limit: options.limit
                , limits: options.limits || [10, 20, 30, 40, 50, 60, 70, 80, 90]
                , groups: 3
                , layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
                , prev: '<i class="layui-icon">&#xe603;</i>'
                , next: '<i class="layui-icon">&#xe602;</i>'
                , jump: function (obj, first) {
                    if (!first) {
                        //分页本身并非需要做以下更新，下面参数的同步，主要是因为其它处理统一用到了它们
                        //而并非用的是 options.page 中的参数（以确保分页未开启的情况仍能正常使用）
                        that.page = obj.curr; //更新页码
                        options.limit = obj.limit; //更新每页条数

                        that.pullData(obj.curr, that.loading());
                    }
                }
            }, options.page);
            options.page.count = count; //更新总条数
            laypage.render(options.page);
        }
    };

    //找到对应的列元素
    Class.prototype.getColElem = function (parent, field) {
        var that = this
            , options = that.config;
        return parent.eq(0).find('.laytable-cell-' + (options.index + '-' + field) + ':eq(0)');
    };

    //渲染表单
    Class.prototype.renderForm = function (type) {
        form.render(type, 'LAY-table-' + this.index);
    }

    //数据排序
    Class.prototype.sort = function (th, type, pull, formEvent) {
        var that = this
            , field
            , res = {}
            , options = that.config
            , filter = options.elem.attr('lay-filter')
            , data = table.cache[that.key], thisData;

        //字段匹配
        if (typeof th === 'string') {
            that.layHeader.find('th').each(function (i, item) {
                var othis = $(this)
                    , _field = othis.data('field');
                if (_field === th) {
                    th = othis;
                    field = _field;
                    return false;
                }
            });
        }

        try {
            var field = field || th.data('field');

            //如果欲执行的排序已在状态中，则不执行渲染
            if (that.sortKey && !pull) {
                if (field === that.sortKey.field && type === that.sortKey.sort) {
                    return;
                }
            }

            var elemSort = that.layHeader.find('th .laytable-cell-' + options.index + '-' + field).find(ELEM_SORT);
            that.layHeader.find('th').find(ELEM_SORT).removeAttr('lay-sort'); //清除其它标题排序状态
            elemSort.attr('lay-sort', type || null);
            that.layFixed.find('th')
        } catch (e) {
            return hint.error('Table modules: Did not match to field');
        }

        //记录排序索引和类型
        that.sortKey = {
            field: field
            , sort: type
        };

        if (type === 'asc') { //升序
            thisData = layui.sort(data, field);
        } else if (type === 'desc') { //降序
            thisData = layui.sort(data, field, true);
        } else { //清除排序
            thisData = layui.sort(data, table.config.indexName);
            delete that.sortKey;
        }

        res[options.response.dataName] = thisData;
        that.renderData(res, that.page, that.count, true);

        if (formEvent) {
            layui.event.call(th, MOD_NAME, 'sort(' + filter + ')', {
                field: field
                , type: type
            });
        }
    };

    //请求loading
    Class.prototype.loading = function () {
        var that = this
            , options = that.config;
        if (options.loading && options.url) {
            return layer.msg('数据请求中', {
                icon: 16
                , offset: [
                    that.elem.offset().top + that.elem.height() / 2 - 35 - _WIN.scrollTop() + 'px'
                    , that.elem.offset().left + that.elem.width() / 2 - 90 - _WIN.scrollLeft() + 'px'
                ]
                , time: -1
                , anim: -1
                , fixed: false
            });
        }
    };

    //同步选中值状态
    Class.prototype.setCheckData = function (index, checked) {
        var that = this
            , options = that.config
            , thisData = table.cache[that.key];
        if (!thisData[index]) return;
        if (thisData[index].constructor === Array) return;
        thisData[index][options.checkName] = checked;
    };

    //同步全选按钮状态
    Class.prototype.syncCheckAll = function () {
        var that = this
            , options = that.config
            , checkAllElem = that.layHeader.find('input[name="layTableCheckbox"]')
            , syncColsCheck = function (checked) {
            that.eachCols(function (i, item) {
                if (item.type === 'checkbox') {
                    item[options.checkName] = checked;
                }
            });
            return checked;
        };

        if (!checkAllElem[0]) return;

        if (table.checkStatus(that.key).isAll) {
            if (!checkAllElem[0].checked) {
                checkAllElem.prop('checked', true);
                that.renderForm('checkbox');
            }
            syncColsCheck(true);
        } else {
            if (checkAllElem[0].checked) {
                checkAllElem.prop('checked', false);
                that.renderForm('checkbox');
            }
            syncColsCheck(false);
        }
    };

    //获取cssRule
    Class.prototype.getCssRule = function (field, callback) {
        var that = this
            , style = that.elem.find('style')[0]
            , sheet = style.sheet || style.styleSheet || {}
            , rules = sheet.cssRules || sheet.rules;
        layui.each(rules, function (i, item) {
            if (item.selectorText === ('.laytable-cell-' + that.index + '-' + field)) {
                return callback(item), true;
            }
        });
    };

    //铺满表格主体高度
    Class.prototype.fullSize = function () {
        var that = this
            , options = that.config
            , height = options.height, bodyHeight;

        if (that.fullHeightGap) {
            height = _WIN.height() - that.fullHeightGap;
            if (height < 135) height = 135;
            that.elem.css('height', height);
        }

        //tbody区域高度
        bodyHeight = parseFloat(height) - parseFloat(that.layHeader.height()) - 1;
        if (options.toolbar) {
            bodyHeight = bodyHeight - that.layTool.outerHeight();
        }
        if (options.page) {
            bodyHeight = bodyHeight - that.layPage.outerHeight() - 1;
        }
        that.layMain.css('height', bodyHeight);
    };

    //获取滚动条宽度
    Class.prototype.getScrollWidth = function (elem) {
        var width = 0;
        if (elem) {
            width = elem.offsetWidth - elem.clientWidth;
        } else {
            elem = document.createElement('div');
            elem.style.width = '100px';
            elem.style.height = '100px';
            elem.style.overflowY = 'scroll';

            document.body.appendChild(elem);
            width = elem.offsetWidth - elem.clientWidth;
            document.body.removeChild(elem);
        }
        return width;
    };

    //滚动条补丁
    Class.prototype.scrollPatch = function () {
        var that = this
            , layMainTable = that.layMain.children('table')
            , scollWidth = that.layMain.width() - that.layMain.prop('clientWidth') //纵向滚动条宽度
            , scollHeight = that.layMain.height() - that.layMain.prop('clientHeight') //横向滚动条高度
            , getScrollWidth = that.getScrollWidth(that.layMain[0]) //获取主容器滚动条宽度，如果有的话
            , outWidth = layMainTable.outerWidth() - that.layMain.width(); //表格内容器的超出宽度

        //如果存在自动列宽，则要保证绝对填充满，并且不能出现横向滚动条
        if (that.autoColNums && outWidth < 5 && !that.scrollPatchWStatus) {
            var th = that.layHeader.eq(0).find('thead th:last-child')
                , field = th.data('field');
            that.getCssRule(field, function (item) {
                var width = item.style.width || th.outerWidth();
                item.style.width = (parseFloat(width) - getScrollWidth - outWidth) + 'px';

                //二次校验，如果仍然出现横向滚动条
                if (that.layMain.height() - that.layMain.prop('clientHeight') > 0) {
                    item.style.width = parseFloat(item.style.width) - 1 + 'px';
                }

                that.scrollPatchWStatus = true;
            });
        }

        if (scollWidth && scollHeight) {
            if (!that.elem.find('.layui-table-patch')[0]) {
                var patchElem = $('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>'); //补丁元素
                patchElem.find('div').css({
                    width: scollWidth
                });
                that.layHeader.eq(0).find('thead tr').append(patchElem)
            }
        } else {
            that.layHeader.eq(0).find('.layui-table-patch').remove();
        }

        //固定列区域高度
        var mainHeight = that.layMain.height()
            , fixHeight = mainHeight - scollHeight;
        that.layFixed.find(ELEM_BODY).css('height', layMainTable.height() > fixHeight ? fixHeight : 'auto');

        //表格宽度小于容器宽度时，隐藏固定列
        that.layFixRight[outWidth > 0 ? 'removeClass' : 'addClass'](HIDE);

        //操作栏
        that.layFixRight.css('right', scollWidth - 1);
    };

    //事件处理
    Class.prototype.events = function () {
        var that = this
            , options = that.config
            , _BODY = $('body')
            , dict = {}
            , th = that.layHeader.find('th')
            , resizing
            , ELEM_CELL = '.layui-table-cell'
            , filter = options.elem.attr('lay-filter');

        //拖拽调整宽度
        th.on('mousemove', function (e) {
            var othis = $(this)
                , oLeft = othis.offset().left
                , pLeft = e.clientX - oLeft;
            if (othis.attr('colspan') > 1 || othis.data('unresize') || dict.resizeStart) {
                return;
            }
            dict.allowResize = othis.width() - pLeft <= 10; //是否处于拖拽允许区域
            _BODY.css('cursor', (dict.allowResize ? 'col-resize' : ''));
        }).on('mouseleave', function () {
            var othis = $(this);
            if (dict.resizeStart) return;
            _BODY.css('cursor', '');
        }).on('mousedown', function (e) {
            var othis = $(this);
            if (dict.allowResize) {
                var field = othis.data('field');
                e.preventDefault();
                dict.resizeStart = true; //开始拖拽
                dict.offset = [e.clientX, e.clientY]; //记录初始坐标

                that.getCssRule(field, function (item) {
                    var width = item.style.width || othis.outerWidth();
                    dict.rule = item;
                    dict.ruleWidth = parseFloat(width);
                    dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
                });
            }
        });
        //拖拽中
        _DOC.on('mousemove', function (e) {
            if (dict.resizeStart) {
                e.preventDefault();
                if (dict.rule) {
                    var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
                    if (setWidth < dict.minWidth) setWidth = dict.minWidth;
                    dict.rule.style.width = setWidth + 'px';
                    layer.close(that.tipsIndex);
                }
                resizing = 1
            }
        }).on('mouseup', function (e) {
            if (dict.resizeStart) {
                dict = {};
                _BODY.css('cursor', '');
                that.scrollPatch();
            }
            if (resizing === 2) {
                resizing = null;
            }
        });

        //排序
        th.on('click', function () {
            var othis = $(this)
                , elemSort = othis.find(ELEM_SORT)
                , nowType = elemSort.attr('lay-sort')
                , type;

            if (!elemSort[0] || resizing === 1) return resizing = 2;

            if (nowType === 'asc') {
                type = 'desc';
            } else if (nowType === 'desc') {
                type = null;
            } else {
                type = 'asc';
            }
            that.sort(othis, type, null, true);
        }).find(ELEM_SORT + ' .layui-edge ').on('click', function (e) {
            var othis = $(this)
                , index = othis.index()
                , field = othis.parents('th').eq(0).data('field')
            layui.stope(e);
            if (index === 0) {
                that.sort(field, 'asc', null, true);
            } else {
                that.sort(field, 'desc', null, true);
            }
        });

        //复选框选择
        that.elem.on('click', 'input[name="layTableCheckbox"]+', function () {
            var checkbox = $(this).prev()
                , childs = that.layBody.find('input[name="layTableCheckbox"]')
                , index = checkbox.parents('tr').eq(0).data('index')
                , checked = checkbox[0].checked
                , isAll = checkbox.attr('lay-filter') === 'layTableAllChoose';

            //全选
            if (isAll) {
                childs.each(function (i, item) {
                    item.checked = checked;
                    that.setCheckData(i, checked);
                });
                that.syncCheckAll();
                that.renderForm('checkbox');
            } else {
                that.setCheckData(index, checked);
                that.syncCheckAll();
            }
            layui.event.call(this, MOD_NAME, 'checkbox(' + filter + ')', {
                checked: checked
                , data: table.cache[that.key] ? (table.cache[that.key][index] || {}) : {}
                , type: isAll ? 'all' : 'one'
            });
        });

        //行事件
        that.layBody.on('mouseenter', 'tr', function () {
            var othis = $(this)
                , index = othis.index();
            that.layBody.find('tr:eq(' + index + ')').addClass(ELEM_HOVER)
        }).on('mouseleave', 'tr', function () {
            var othis = $(this)
                , index = othis.index();
            that.layBody.find('tr:eq(' + index + ')').removeClass(ELEM_HOVER)
        });

        //单元格编辑
        that.layBody.on('change', '.' + ELEM_EDIT, function () {
            var othis = $(this)
                , value = this.value
                , field = othis.parent().data('field')
                , index = othis.parents('tr').eq(0).data('index')
                , dataType = othis.parent().data("datatype")
                , data = table.cache[that.key][index];

            //处理下拉选择的值更新,modify by xuelei.wang 2018-6-21
            if (this.tagName && this.tagName.toUpperCase() == "SELECT") {
                //更新缓存中对应的键值 modify by xuelei.wang 2018-06-21
                data[field] = $(this).val();
                data[field + "_SHOWNAME"] = $(this).children(":selected").text();
            } else {
                if (dataType) {
                    //modify xuelei.wang 2018-6-21校验表格数据
                    if (dataType == "date") {
                        if (moment == undefined || moment == null) {
                            lay.hint("表格时间日期校验需要依赖moment.js,请添加相关引用!");
                            return;
                        }
                        if (!moment(this.value, "YYYY-MM-DD", true).isValid()) {
                            return;
                        }
                    }
                    else if (dataType == "datetime" && !moment(this.value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                        return;
                    } else if (dataType == "number" && !$.isNumeric(this.value)) {
                        return;
                    }
                }
                data[field] = value;//更新缓存中的值
            }
            //modify by xuelei.wang 2018-6-20
            if (that.config.changedData == undefined) {
                that.config.changedData = new Array();
            }
            if (that.config.changedData[index] == undefined) {
                that.config.changedData[index] = {};
            }
            $.extend(true, that.config.changedData[index], data);

            layui.event.call(this, MOD_NAME, 'edit(' + filter + ')', {
                value: value
                , data: data
                , field: field
            });
        }).on('blur', '.' + ELEM_EDIT, function () {
            var templet
                , othis = $(this)
                , field = othis.parent().data('field')
                , index = othis.parents('tr').eq(0).data('index')
                , dataType = othis.parent().data("datatype")
                , data = table.cache[that.key][index];
            that.eachCols(function (i, item) {
                if (item.field == field && item.templet) {
                    templet = item.templet;
                }
            });
            //modify by xuelei.wang 2018-6-20,兼容单元格编辑下拉控件
            if (this.tagName.toUpperCase() == "SELECT") {
                //1.设置显示的名称
                var text = $(this).children(":selected").text();
                othis.siblings(ELEM_CELL).html(text);
            }
            else {
                if (dataType) {
                    //modify xuelei.wang 2018-6-21校验表格数据
                    if (dataType == "date") {
                        if (moment == undefined || moment == null) {
                            lay.hint("表格时间日期校验需要依赖moment.js,请添加相关引用!");
                            othis.remove();
                            return;
                        }
                        if (!moment(this.value, "YYYY-MM-DD", true).isValid()) {
                            othis.remove();
                            return;
                        }
                    }
                    else if (dataType == "datetime" && !moment(this.value, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                        othis.remove();
                        return;
                    } else if (dataType == "number" && !$.isNumeric(this.value)) {
                        othis.remove();
                        return;
                    }
                }
                othis.siblings(ELEM_CELL).html(
                    templet ? laytpl($(templet).html() || this.value).render(data) : this.value
                );
                othis.parent().data('content', this.value);
            }
            othis.remove();
        });

        //单元格控件编辑 modify by xuelei.wang 2018-7-3
        that.layBody.on('change', '.' + ELEM_CONTROL, function () {
            var othis = $(this)
                , value = this.value
                , field = othis.parent().data('field') || othis.parent().parent().data('field')
                , index = othis.parents('tr').eq(0).data('index')
                , dataType = othis.parent().data("datatype")
                , data = table.cache[that.key][index];

            //处理下拉选择的值更新,modify by xuelei.wang 2018-6-21
            if (this.tagName && this.tagName.toUpperCase() == "SELECT") {
                //modify by xuelei.wang 2018-7-13 处理合并row后数据更新
                if(data[field+TABLE_ROWSPAN]!=undefined&&data[field+TABLE_ROWSPAN]!=1){
                    for(var i=index;i<index+data[field+TABLE_ROWSPAN];i++){
                        table.cache[that.key][i][field] = othis.val();
                        table.cache[that.key][i][TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                        layui.event.call(this, MOD_NAME, 'edit(' + filter + ')', {
                            value: othis.val()
                            , data: table.cache[that.key][i]
                            , field: field
                        });
                    }
                }
                else{
                    data[TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                    data[field]=othis.val();
                    layui.event.call(this, MOD_NAME, 'edit(' + filter + ')', {
                        value: othis.val()
                        , data: data
                        , field: field
                    });
                }
            } else {
                //modify by xuelei.wang 2018-7-13 处理合并row后数据更新
                if(data[field+TABLE_ROWSPAN]!=undefined&&data[field+TABLE_ROWSPAN]!=1){
                    for(var i=index;i<index+data[field+TABLE_ROWSPAN];i++){
                        table.cache[that.key][i][field] = value;
                        table.cache[that.key][i][TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                        layui.event.call(this, MOD_NAME, 'edit(' + filter + ')', {
                            value:value
                            , data: table.cache[that.key][i]
                            , field: field
                        });
                    }
                }
                else{
                    data[field]=value;
                    data[TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                    layui.event.call(this, MOD_NAME, 'edit(' + filter + ')', {
                        value:value
                        , data: data
                        , field: field
                    });
                }
            }

            layui.event.call(this, MOD_NAME, 'refresh(' + filter + ')', {
                value:value
                , data: data
                , field: field
            });
        }).on('blur', '.' + ELEM_CONTROL, function () {
            var templet
                , othis = $(this)
                , field = othis.parent().data('field')
                , index = othis.parents('tr').eq(0).data('index')
                , dataType = othis.parent().data("datatype")
                , data = table.cache[that.key][index];
            that.eachCols(function (i, item) {
                if (item.field == field && item.templet) {
                    templet = item.templet;
                }
            });
        });

        //modify by xuelei.wang 2018-7-4,控制表格checkbox值改变事件
        layui.form.on('checkbox(layTableCheckbox_Control)', function () {
            var othis = $(this)
                , value = this.value == "on" ? 1 : 0
                , field = othis.parent().data('field') || othis.parent().parent().data('field')
                , index = othis.parents('tr').eq(0).data('index')
                , dataType = othis.parent().data("datatype")
                , data = table.cache[that.key][index];

            //处理下拉选择的值更新,modify by xuelei.wang 2018-6-21
            //更新缓存中的值
            //TODO:input checkbox值改变事件
            if (data[field] != undefined) {
                if (data[field] == 0) {
                    data[field] = 1;
                    data[TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                }
                else {
                    data[field] = 0;
                    data[TABLE_ROW_STATUS]=TABLE_STATUS_UPDATE;
                }
            }
        });


        //单元格事件
        that.layBody.on('click', 'td', function () {
            var othis = $(this)
                , field = othis.data('field')
                , editType = othis.data('edit')
                , index = othis.parents('tr').eq(0).data('index')
                , elemCell = othis.children(ELEM_CELL)

            layer.close(that.tipsIndex);
            if (othis.data('off')) return;

            //显示编辑表单
            if (editType) {
                //选择框
                if (editType === 'select') {
                    if (that.config.originalData != undefined) {
                        var columnData = that.config.originalData;
                        var options = new Array();
                        var optionsData = {};
                        var showNameArray = new Array();
                        var showName = field + '_SHOWNAME';
                        var value = this.textContent;

                        for (var i = 0; i < columnData.length; i++) {
                            if (columnData[i][field] == undefined || columnData[i][showName] == undefined) continue;
                            //1.去除重复的项
                            if (showNameArray.indexOf(columnData[i][showName]) == -1) {
                                showNameArray.push(columnData[i][showName]);
                                var obj = {};
                                obj[field] = columnData[i][field];
                                obj[showName] = columnData[i][showName];
                                optionsData[columnData[i][showName]] = obj;
                            }
                        }
                        //2.名称排序;
                        showNameArray.sort(function (a, b) {
                            return a.localeCompare(b)
                        });
                        //3.下拉项拼接组装;

                        options.push("<option></option>");
                        for (var i = 0; i < showNameArray.length; i++) {
                            if (optionsData[showNameArray[i]][field] == undefined || optionsData[showNameArray[i]][showName] == undefined) continue;
                            var option = "<option value='" + optionsData[showNameArray[i]][field] + "'>" + optionsData[showNameArray[i]][showName] + "</option>";
                            if (value == optionsData[showNameArray[i]][showName]) {
                                option = "<option selected value='" + optionsData[showNameArray[i]][field] + "'>" + optionsData[showNameArray[i]][showName] + "</option>";
                            }
                            if (options.indexOf(option) == -1) {
                                options.push(option);
                            }
                        }

                        var select = $('<select class="' + ELEM_EDIT + '" lay-ignore>' + options.join(" ") + '</select>');
                        othis.find('.' + ELEM_EDIT)[0] || othis.append(select);
                        select.focus();
                    }
                    else {
                        hint.error('表格下拉选项未配置数据源!');
                    }
                }
                else { //输入框
                    var input = $('<input class="layui-input ' + ELEM_EDIT + '">');
                    input[0].value = othis.data('content') || elemCell.text();
                    othis.find('.' + ELEM_EDIT)[0] || othis.append(input);
                    input.focus();
                }
                return;
            }

            //如果出现省略，则可查看更多
            if (elemCell.find('.layui-form-switch,.layui-form-checkbox')[0]) return; //限制不出现更多（暂时）

            if (Math.round(elemCell.prop('scrollWidth')) > Math.round(elemCell.outerWidth())) {
                that.tipsIndex = layer.tips([
                    '<div class="layui-table-tips-main" style="margin-top: -' + (elemCell.height() + 16) + 'px;' + function () {
                        if (options && options.size === 'sm') {
                            return 'padding: 4px 15px; font-size: 12px;';
                        }
                        if (options && options.size === 'lg') {
                            return 'padding: 14px 15px;';
                        }
                        return '';
                    }() + '">'
                    , elemCell.html()
                    , '</div>'
                    , '<i class="layui-icon layui-table-tips-c">&#x1006;</i>'
                ].join(''), elemCell[0], {
                    tips: [3, '']
                    , time: -1
                    , anim: -1
                    , maxWidth: (device.ios || device.android) ? 300 : 600
                    , isOutAnim: false
                    , skin: 'layui-table-tips'
                    , success: function (layero, index) {
                        layero.find('.layui-table-tips-c').on('click', function () {
                            layer.close(index);
                        });
                    }
                });
            }
        });

        //工具条操作事件
        that.layBody.on('click', '*[lay-event]', function () {
            var othis = $(this)
                , index = othis.parents('tr').eq(0).data('index')
                , tr = that.layBody.find('tr[data-index="' + index + '"]')
                , ELEM_CLICK = 'layui-table-click'
                , data = table.cache[that.key][index];

            layui.event.call(this, MOD_NAME, 'tool(' + filter + ')', {
                data: table.clearCacheKey(data)
                , event: othis.attr('lay-event')
                , tr: tr
                , del: function () {
                    table.cache[that.key][index] = [];
                    tr.remove();
                    that.scrollPatch();
                }
                , update: function (fields) {
                    fields = fields || {};
                    layui.each(fields, function (key, value) {
                        if (key in data) {
                            var templet, td = tr.children('td[data-field="' + key + '"]');
                            data[key] = value;
                            that.eachCols(function (i, item2) {
                                if (item2.field == key && item2.templet) {
                                    templet = item2.templet;
                                }
                            });
                            td.children(ELEM_CELL).html(
                                templet ? laytpl($(templet).html() || value).render(data) : value
                            );
                            td.data('content', value);
                        }
                    });
                }
            });
            tr.addClass(ELEM_CLICK).siblings('tr').removeClass(ELEM_CLICK);
        });

        //同步滚动条
        that.layMain.on('scroll', function () {
            var othis = $(this)
                , scrollLeft = othis.scrollLeft()
                , scrollTop = othis.scrollTop();

            that.layHeader.scrollLeft(scrollLeft);
            that.layFixed.find(ELEM_BODY).scrollTop(scrollTop);

            layer.close(that.tipsIndex);
        });

        _WIN.on('resize', function () { //自适应
            that.fullSize();
            that.scrollPatch();
        });
    };

    //初始化
    table.init = function (filter, settings) {
        settings = settings || {};
        var that = this
            , elemTable = filter ? $('table[lay-filter="' + filter + '"]') : $(ELEM + '[lay-data]')
            , errorTips = 'Table element property lay-data configuration item has a syntax error: ';

        //遍历数据表格
        elemTable.each(function () {
            var othis = $(this), tableData = othis.attr('lay-data');

            try {
                tableData = new Function('return ' + tableData)();
            } catch (e) {
                hint.error(errorTips + tableData)
            }

            var cols = [], options = $.extend({
                elem: this
                , cols: []
                , data: []
                , skin: othis.attr('lay-skin') //风格
                , size: othis.attr('lay-size') //尺寸
                , even: typeof othis.attr('lay-even') === 'string' //偶数行背景
            }, table.config, settings, tableData);

            filter && othis.hide();

            //获取表头数据
            othis.find('thead>tr').each(function (i) {
                options.cols[i] = [];
                $(this).children().each(function (ii) {
                    var th = $(this), itemData = th.attr('lay-data');

                    try {
                        itemData = new Function('return ' + itemData)();
                    } catch (e) {
                        return hint.error(errorTips + itemData)
                    }

                    var row = $.extend({
                        title: th.text()
                        , colspan: th.attr('colspan') || 0 //列单元格
                        , rowspan: th.attr('rowspan') || 0 //行单元格
                    }, itemData);

                    if (row.colspan < 2) cols.push(row);
                    options.cols[i].push(row);
                });
            });

            //获取表体数据
            othis.find('tbody>tr').each(function (i1) {
                var tr = $(this), row = {};
                //如果定义了字段名
                tr.children('td').each(function (i2, item2) {
                    var td = $(this)
                        , field = td.data('field');
                    if (field) {
                        return row[field] = td.html();
                    }
                });
                //如果未定义字段名
                layui.each(cols, function (i3, item3) {
                    var td = tr.children('td').eq(i3);
                    row[item3.field] = td.html();
                });
                options.data[i1] = row;
            });
            table.render(options);
        });
        return that;
    };

    //表格选中状态
    table.checkStatus = function (id) {
        var nums = 0
            , invalidNum = 0
            , arr = []
            , data = table.cache[id] || [];
        //计算全选个数
        layui.each(data, function (i, item) {
            if (item.constructor === Array) {
                invalidNum++; //无效数据，或已删除的
                return;
            }
            if (item[table.config.checkName]) {
                nums++;
                arr.push(table.clearCacheKey(item));
            }
        });
        return {
            data: arr //选中的数据
            , isAll: data.length ? (nums === (data.length - invalidNum)) : false //是否全选
        };
    };

    //表格重载
    thisTable.config = {};
    table.reload = function (id, options) {
        var config = thisTable.config[id];
        //modify by xuelei.wang 2018-7-13解决表格不分页时加载10条数据的bug
        if(config!=undefined&&config.pageable==false){
            config.limit=100000000;
        }
        options = options || {};
        if (!config) return hint.error('The ID option was not found in the table instance');
        if (options.data && options.data.constructor === Array) delete config.data;
        return table.render($.extend(true, {}, config, options));
    };
    //modify by xuelei.wang 2018-06-20
    //获取表格数据
    table.getData = function (id) {
        return table.cache[id] || new Array();
    };
    //modify by xuelei.wang 2018-06-20
    //获取表格改变的数据TODO
    table.getChangedData = function (id) {
        var result=new Array();
        if (table.cache[id] == undefined)return result;
        for(var i=0;i<table.cache[id].length;i++){
            if(table.cache[id][i][TABLE_ROW_STATUS]!=undefined){
                result.push(table.cache[id][i]);
            }
        }
        return result;
    };
    //modify xuelei.wang 2018-06-22
    //新增行
    table.addRow = function (id, row) {
        if (table.cache[id] == undefined) table.cache[id] = new Array();
        if (row == undefined) row = {};
        row[TABLE_ROW_STATUS] = TABLE_STATUS_NEW;
        table.cache[id].push(row);
        table.reload(id, {data: table.cache[id], url: ''});
    };
    //modify xuelei.wang 2018-07-12
    //批量删除行
    table.deleteRows=function(id,rowIds){
        if(rowIds instanceof Array){
            for(var j=0;j<rowIds.length;j++){
                for(var i=0;i<table.cache[id].length;i++){
                    if(table.cache[id][i][TABLE_DATA_UUID_NAME]!=undefined&&table.cache[id][i][TABLE_DATA_UUID_NAME]==rowIds[j]){
                        table.cache[id][i][TABLE_ROW_STATUS] = TABLE_STATUS_DELETE;
                        if(table.cache[id][i]['LAY_CHECKED']!=undefined){
                            table.cache[id][i]['LAY_CHECKED']=false;
                        }
                        break;
                    }
                }
            }
            table.reload(id, {data:table.cache[id], url: ''});
        }
    };
    //modify xuelei.wang 2018-07-12
    //删除行
    table.deleteRow = function (id, rowId) {
        if (id == undefined || rowId==undefined|| table.cache[id] == undefined) return;
        for(var i=0;i<table.cache[id].length;i++){
            if(table.cache[id][i][TABLE_DATA_UUID_NAME]!=undefined&&table.cache[id][i][TABLE_DATA_UUID_NAME]==rowId){
                table.cache[id][i][TABLE_ROW_STATUS] = TABLE_STATUS_DELETE;
                if(table.cache[id][i]['LAY_CHECKED']!=undefined){
                    table.cache[id][i]['LAY_CHECKED']=false;
                }
                break;
            }
        }
        table.reload(id, {data:table.cache[id], url: ''});
    };
    //核心入口
    table.render = function (options) {
        var inst = new Class(options);
        return thisTable.call(inst);
    };

    //清除临时Key
    table.clearCacheKey = function (data) {
        data = $.extend({}, data);
        delete data[table.config.checkName];
        delete data[table.config.indexName];
        return data;
    };

    //自动完成渲染
    table.init();

    exports(MOD_NAME, table);
});
