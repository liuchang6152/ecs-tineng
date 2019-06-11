var delUrl = ECS.api.bcUrl + '/riskRank';//删除（批量）
var searchUrl = ECS.api.bcUrl + '/riskRank';//查询、列表初始化
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var exportUrl = ECS.api.bcUrl +'/riskRank/ExportToExcel';                //导出
window.pageLoadMode = PageLoadMode.None;
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        //页面初始化
        init: function () {
            ECS.sys.RefreshContextFromSYS();
            mini.parse();
            this.bindUI();
            $("#searchForm").find('input').val("");
            page.logic.cbxOrgID();//企业
            page.logic.initTable();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });

             // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = ECS.form.getData("searchForm");
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
              
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
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
                //列表渲染
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                page.logic.search();
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.riskRankID);
            },
            isPickup:function(e){
                if(e.row.isPickup==1){
                    return e.row.isPickupName;
                }else{
                    return '<span style="color:#9fc747">'+e.row.isPickupName+'</span>';
                }
            },
            /**
             * 企业
             */
            cbxOrgID:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("enterpriseCode", enterpriseCodeUrl, {
                        selectFirstRecord: true,
                        async:false,
                        keyField: "orgCode",
                        valueField: "orgSname"
                    }, null);
                }else{
                    ECS.ui.getCombobox("enterpriseCode", enterpriseCodeUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async:false,
                        keyField: "orgCode",
                        valueField: "orgSname"
                    }, null);
                    $("#enterpriseCode").attr("disabled",true);
                }
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.riskRankID);
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
                                    page.logic.search();      //进行查询
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
                var title = "新增风险等级";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param riskRankID
             */
            edit: function (riskRankID) {
                var pageMode = PageModelEnum.Edit;
                var title = "编辑风险等级";
                page.logic.detail(title, riskRankID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, riskRankID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['580px', '460px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'RiskRankAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "riskRankID": riskRankID,
                            'title': title
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
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                if(page.data.param["enterpriseCode"]=="-1"){
                    page.data.param["enterpriseCode"]="";
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/riskRank/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/riskRank/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/riskRank/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
            },
           
         
        }
    };
    page.init();
    window.page = page;
});