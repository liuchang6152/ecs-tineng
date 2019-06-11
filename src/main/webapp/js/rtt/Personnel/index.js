var delUrl = ECS.api.rttUrl + '/personnel';
var searchUrl = ECS.api.rttUrl + '/personnel';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var teamIDUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamName'; //所属应急队伍
var userLvlIDUrl = ECS.api.bcUrl + '/user/getAllUserLvl'; //行政级别
var exportUrl = ECS.api.rttUrl + '/personnel/ExportToExcel';  //导出
var inUseUrl = ECS.api.commonUrl + "/getInUse";//是否启用
var pid="";
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;
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
            page.logic.initTeamID("");//所属救援队伍
            page.logic.initUserLvlID();//行政级别
            page.logic.initInUse();//是否启用
            page.logic.search();
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
                page.data.param = ECS.form.getData("searchForm");
              
                page.data.param["orgID"]=pid;
                delete page.data.param["orgName"];
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
                return ECS.util.editRender(e.row.personnelID);
            },
            //职务循环展示
            show_job:function(e){
                var jobs="";
                for(var i=0;i<e.row.personnelJobList.length;i++){
                    if(i==0){
                        jobs+= e.row.personnelJobList[i];
                    }else{
                        jobs+=","+ e.row.personnelJobList[i];
                    }
                }
                return jobs;
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
                    },null,page.logic.initTeamID);
                }else{
                    $("#orgName").attr("disabled",true);
                    ECS.ui.getCombobox("orgName", riskAreaTypeNameUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname",
                        valueSField:"orgSname",
                        async:false
                    },null,page.logic.initTeamID);
                }
            },
            /**
             * 所属救援队伍
             */
            initTeamID:function(){
                pid=$("#orgName").find("option:selected").attr("code");//获取的是id
                if(pid=="-1"){
                    pid="";
                }
                ECS.ui.getComboSelects(teamIDUrl+"&oid="+pid,"teamName","NAME","NAME",false);
            },
            /**
             * 行政级别
             */
            initUserLvlID:function(){
                ECS.ui.getComboSelects(userLvlIDUrl,"userLvlID","userLvlID","userLvl",false);
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.personnelID);
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
                var title = "应急处置人员新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param personnelID
             */
            edit: function (personnelID) {
                var pageMode = PageModelEnum.Edit;
                var title = "应急处置人员编辑";
                page.logic.detail(title, personnelID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, personnelID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['1000px', '490px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'PersonnelAddOrEdit.html?' + Math.random(),
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "personnelID": personnelID,
                            'title': title
                        };
                        iframeWin.page.logic.setData(data);
                        ECS.hideLoading();
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
             * 初始化查询inUse
             */
            initInUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: "-1",
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                page.data.param["orgID"]=pid;
                delete page.data.param["orgName"];
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/personnel/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/personnel/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/personnel/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
				
            }
        }
    };
    page.init();
    window.page = page;
});