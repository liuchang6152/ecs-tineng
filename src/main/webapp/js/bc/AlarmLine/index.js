var delUrl = ECS.api.bcUrl + '/alarmLine';
var searchUrl = ECS.api.bcUrl + '/alarmLine';
var exportUrl = ECS.api.bcUrl +'/alarmLine/ExportToExcel';
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var typeIndex=1;
    var page = {
        //页面初始化
        init: function () {
            this.bindUI();
            page.logic.initTable();
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add($(".active").text());
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $(".navContent li").click(function () {
                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                typeIndex=$(this).index()+1;
                page.logic.search();
            });
            //导出
            $('#btnExport').click(function () {
                window.open(exportUrl);
            });
            //点击左侧展开收缩
            var isHiden = true;
            $('.btn-toggle').click(function(){
                if(isHiden){
                    $(".leftNav-body").hide();
                    $('.box-body').css("margin-left","0");
                    $(this).css({"left":"0","transform":"rotate(180deg)"});
                }else{
                    $(".leftNav-body").show();
                    $('.box-body').css("margin-left","202px");
                    $(this).css({"left":"185px","transform":"rotate(0deg)"});
                }
                isHiden = !isHiden;
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化表格
             */
            initTable: function () {
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.alarmLineID);
            },
            show_riskName:function(e){
                return '<div title="'+e.row.riskAreaNames+'">'+e.row.alarmLineRiskArea.length+'</div>';
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.alarmLineID);
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
                        async: true,
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
                                    grid.reload();
                                });
                            } else {
                                result = JSON.parse(result);
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
                    layer.close(index);
                });
            },
            /**
             * 新增
             */
            add: function (typeName) {
                var pageMode = PageModelEnum.NewAdd;
                var title = "企业接警专线新增";
                page.logic.detail(title, "", pageMode,typeName);
            },
            /**
             * 编辑
             * @param alarmLineID
             */
            edit: function (alarmLineID) {
                var pageMode = PageModelEnum.Edit;
                var title = "企业接警专线编辑";
                page.logic.detail(title, alarmLineID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, alarmLineID, pageMode,typeName) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '440px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AlarmLineAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "alarmLineID": alarmLineID,
                            'title': title,
                            'typeName':typeName
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.Refresh;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.Reload;
                        }
                    }
                })
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = {alarmLineType:typeIndex};
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                grid.load(page.data.param);
            }
        }
    };
    page.init();
    window.page = page;
});