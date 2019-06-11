var delUrl = ECS.api.rttUrl + '/expert';
var searchUrl = ECS.api.rttUrl + '/expert';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var industryNameUrl = ECS.api.rttUrl + '/expert/expertIndustry'; //行业领域
var professionNameUrl = ECS.api.rttUrl + '/expert/expertProfession'; //专家分类
var expertTypeUrl = ECS.api.rttUrl + '/expert/getExpertTypeEnumList?isAll=true';  //专家类别
var exportUrl = ECS.api.rttUrl + '/expert/ExportToExcel';  //导出
window.pageLoadMode = PageLoadMode.None;
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            page.logic.initTable();
            page.logic.cbxDrtDept(); //企业名称
            page.logic.initIndustryName();//行业领域
            page.logic.initProfessionName();//专家分类
            page.logic.initExpertType();//专家类别
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
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
            //重置
            $("#btnReset").click(function () {
                var oldvalue=$("#orgName").val();
                $("#searchForm")[0].reset();
                if(!ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgName").val(oldvalue);
                }
                $(".select2-selection__rendered").html("可输入").attr("title","可输入");
            });

                // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};   //空对象
                //拼接所有的查询条件
                page.data.param = ECS.form.getData("searchForm");
               
                //企业名称
                page.data.param["orgName"]=$("#orgName").find("option:selected").attr("values");
                if(page.data.param.orgName=="全部"){
                    page.data.param["orgName"] = "";
                }
                delete page.data.param["orgID"];
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
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
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.expertID);
            },
            //企业名称
            cbxDrtDept:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgName").attr("disabled",false);
                    ECS.ui.getCombobox("orgName", riskAreaTypeNameUrl, {
                        selectFirstRecord:true,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname",
                        valueSField:"orgSname",
                        async:false
                    });
                }else{
                    $("#orgName").attr("disabled",true);
                    ECS.ui.getCombobox("orgName", riskAreaTypeNameUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname",
                        valueSField:"orgSname",
                        async:false
                    });
                    $("#orgName").append("<option values='-1' selected></option>");
                    $("#orgName option").each(function(){
                        if(this.value==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                            this.selected=true;
                        }
                    });
                }
            },
            /**
             * 行业领域
             */
            initIndustryName:function(){
                ECS.ui.getComboSelect(industryNameUrl,"expertIndustryID","key","value",false);
            },
            /**
             * 专家分类
             */
            initProfessionName:function(){
                ECS.ui.getComboSelect(professionNameUrl,"expertProfessionID","key","value",false);
            },

            /**
             * 专家类别
             */
            initExpertType: function () {
                ECS.ui.getCombobox("expertType", expertTypeUrl, {
                    selectValue: "",
                }, null);
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.expertID);
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
                                    grid.reload({pageIndex:0});
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
                var title = "专家新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param expertID
             */
            edit: function (expertID) {
                var pageMode = PageModelEnum.Edit;
                var title = "专家编辑";
                page.logic.detail(title, expertID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, expertID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['1000px', '440px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'UserAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "expertID": expertID,
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
                page.data.param = {};   //空对象
                //拼接所有的查询条件
                page.data.param = ECS.form.getData("searchForm");
                //是否倒序
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                //企业名称
                page.data.param["orgName"]=$("#orgName").find("option:selected").attr("values");
                if(page.data.param.orgName=="全部"){
                    page.data.param["orgName"] = "";
                }
                delete page.data.param["orgID"];
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
                //加载列表
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/expert/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/expert/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/expert/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});