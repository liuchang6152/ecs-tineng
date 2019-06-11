var delUrl = ECS.api.rttUrl + '/constitutionType';                            //删除
var searchUrl = ECS.api.rttUrl + '/constitutionType';                        //查询 搜索
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';           //企业
var tyelistUrl = ECS.api.rttUrl +  "/constitutionType/constitutionType";   //建制类型
window.pageLoadMode = PageLoadMode.None;

var exportFileUrl = ECS.api.rttUrl + "/constitutionType/ExportToExcel";  //导出
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            page.logic.initTable();     //初始化表格参数
            page.logic.cbxDrtDept();    //企业
            page.logic.type_list(tyelistUrl,function(){
                page.logic.search();   //查询搜索
            });   //建制类型

        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
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
                page.data.param = ECS.form.getData("searchForm");     //其它查询条件
                page.data.param["orgID"] = $("#orgID option:selected").attr("code");  //企业条件；
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportFileUrl + "?" + urlParam);
              
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
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.constitutionTypeID,e.row.orgID);
            },
            //企业名称
            cbxDrtDept:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgID").attr("disabled",false);
                    ECS.ui.getCombobox("orgID", enterpriseCodeUrl, {
                        selectFirstRecord:true,
                        keyField: "orgId",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname",
                        async:false
                    },null,page.logic.initConstitution);
                }else{
                    $("#orgID").attr("disabled",true);
                    ECS.ui.getCombobox("orgID", enterpriseCodeUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname",
                        async:false
                    },null,page.logic.initConstitution);
                }
            },
            //建制类型
            type_list:function(menu_url,cb){
                $.ajax({
                    url:menu_url,
                    async:false,
                    type:"get",
                    success:function(data){
                        $("#typeId").html("");    //清空建制类型；
                        //添加“全部”一项
                        var One_option = '<option value="">全部</option>';
                        $("#typeId").append(One_option);
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var oPtion = '<option value="'+cur_dt.constitutionTypeID+'">'+cur_dt.constitutionType+'</option>';
                                $("#typeId").append(oPtion);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                })
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");     //其它查询条件
                page.data.param["orgID"] = $("#orgID option:selected").attr("code");  //企业条件；
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                grid.load(page.data.param);
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push({constitutionTypeID:el.constitutionTypeID,orgID:el.orgID});
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
                var title = "建制新增";
                page.logic.detail(title, "", "",pageMode);
            },
            /**
             * 编辑
             * @param constitutionTypeID
             */
            edit: function (constitutionTypeID,orgID) {
                var pageMode = PageModelEnum.Edit;
                var title = "建制编辑";
                page.logic.detail(title, constitutionTypeID,orgID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, constitutionTypeID,orgID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['400px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'ConstitutionConfigAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "constitutionTypeID": constitutionTypeID,
                            "orgID":orgID,
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
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/constitutionType/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/constitutionType/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/constitutionType/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
				
            },
           
           
        }
    };
    page.init();
    window.page = page;
});