var TypeUrl = ECS.api.rttUrl + '/emrgMtrl/getBusinessInfo';       //事故小类
var searchUrl = ECS.api.bcUrl + '/busiBgCateg/getTreeByModelID'; //查询、列表初始化
var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";    //企业节点编码；
var drtDeptCode = "";       //二级单位节点编码；
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                      //初始化miniui框架
            this.bindUI();                     //绑定事件
            page.logic.loadType();
            page.logic.initTable();            //初始化表格
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $(".btnClose").click(function() {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //搜索栏中input不允许输入空格
            $('input').blur(function() {
                $(this).val($.trim($(this).val()))
            });
            // 确认
            $('#btnOK').click(function() {
                page.logic.select();
            });
            //查询
            $('#btnQuery').click(function() {
                page.logic.search();
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            getComboSelects : function (url, ctrlId, key, value, tags) {
                console.log(url);

                $.ajax({
                    url: url,
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        console.log(data.length);
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
                        $('#teamId').attr('disabled', 'disabled');

                    },
                })
            },


            loadType: function (enterpriseCode) {
                page.logic.getComboSelects(TypeUrl,"teamId","businessId","businessName",false);


            },
            /**
             * 初始化表格
             */
            initTable: function () {
                page.logic.init();
            },

            onBeforeTreeLoad :function (e) {
                var tree = e.sender;    //树控件
                var node = e.node;      //当前节点
                var params = e.params;  //参数对象

                //可以传递自定义的属性
                params.myField = "123"; //后台：request对象获取"myField"
            },


            select :function(){
                var  treeGrid = mini.get("datagrid");
                var selected = treeGrid.getSelected();
                parent.ownDetail = selected;
                page.logic.closeLayer(true);
            },

            /**
             * 搜索
             */
            init: function (showSort) {
               grid = mini.get("datagrid");
                $.ajax({
                    url: searchUrl+"?businessModelId=31",
                    type: "get",
                    success: function (data) {
                        grid.loadList(data,"code","pCode");
                    },
                    error: function (e) {
                        //	alert(e);
                    }
                });


            },

            //过滤
            search: function () {
                var key =$("#key").val();
                if (key == "") {
                    mini.get("datagrid").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("datagrid").filter(function (node) {
                        var text = node.categName ? node.categName : "";
                        if (text.indexOf(key) != -1) {
                            return true;
                        }
                    });
                }
            },



            /**
             * 关闭弹出层
             */
            closeLayer: function(isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },


        }
    };
    page.init();
    window.page = page;
});