var delUrl = ECS.api.rttUrl + '/team';
var searchUrl = ECS.api.rttUrl + '/team';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var teamTypeUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamType'; //队伍类型
var constitutionUrl = ECS.api.rttUrl + '/team/getListByParam?param=constitutionName'; //建制
var teamLvlUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamLvl';  //队伍级别
var teamSpecialityUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamSpeciality';  //救援专业
var teamPIDNameUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamPIDName';  //所属应急队伍
var inUseUrl = ECS.api.commonUrl + "/getInUse";//是否班组
var exportUrl = ECS.api.rttUrl + '/team/ExportToExcel';  //导出
// var importDateUrl = ECS.api.rttUrl + '/expert/importExcelDate';  //导入
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
            page.logic.initTable();
            $("#searchForm").find('input').val("");
            page.logic.cbxDrtDept(); //企业名称
            page.logic.initTeamType();//队伍类型
            page.logic.initConstitution();//建制
            page.logic.initTeamLvl();//队伍级别
            page.logic.initTeamSpeciality();//救援专业
            page.logic.initInUse();//是否启用
            page.logic.teamBaseLvl();//是否班组
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
            //建制联动加载所属应急队伍
            $("#constitutionName").on("select2:select",function(e){
                page.logic.initteamPIDName(e.params.data.id);
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
                var oldvalue=$("#orgID").val();
                $("#searchForm")[0].reset();
                if(!ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgID").val(oldvalue);
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
                if(page.data.param.orgID=="-1"){
                    page.data.param["orgID"] = "";
                }
                if(page.data.param.teamBaseLvl=="-1"){
                    page.data.param["teamBaseLvl"] = "";
                }
                if(page.data.param.inUse=="-1"){
                    page.data.param["inUse"] = "";
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
                grid = mini.get("datagrid");
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.teamID);
            },
            //人数
            show_personnelNum:function(e){
                return '<a title="人数" href="javascript:window.page.logic.showNum(\'' + e.row.orgID + '\',\'' + e.row.teamID +'\',\'1' +'\',\'人员信息'+ '\')">'+ e.row.personnelNum +'</a>';
            },
            //车辆数
            show_vehicleNum:function(e){
                return '<a title="车辆数" href="javascript:window.page.logic.showNum(\'' + e.row.orgID + '\',\'' + e.row.teamID +'\',\'2' +'\',\'车辆信息' + '\')">'+ e.row.vehicleNum +'</a>';
            },
            //显示上传文件
            show_upload:function(e){
                return '<a href="javascript:ECS.util.renderUploader_Page(\'' + e.row.orgCode+'\',\''+e.row.teamOrgID+'\',\''+e.row.teamName+'\',\''+'2'+'\',\''+'应急队伍附件上传'+'\')">上传附件</a>';
            },
            //企业名称
            cbxDrtDept:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgID").attr("disabled",false);
                    ECS.ui.getCombobox("orgID", riskAreaTypeNameUrl, {
                        selectFirstRecord:true,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname",
                        async:false
                    },null,page.logic.initConstitution);
                }else{
                    $("#orgID").attr("disabled",true);
                    ECS.ui.getCombobox("orgID", riskAreaTypeNameUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        valueSField:"orgSname",
                        async:false
                    },null,page.logic.initConstitution);
                }

            },
            /**
             * 队伍类型
             */
            initTeamType:function(){
                ECS.ui.getComboSelects(teamTypeUrl,"teamType","ID","NAME",false);
            },
            /**
             * 建制
             */
            initConstitution:function(){
                pid=$("#orgID").find("option:selected").attr("code");//获取的是id
                if(pid=="-1"){
                    pid="";
                }
                ECS.ui.getComboSelects(constitutionUrl+"&name="+pid,"constitutionName","ID","NAME",false);
                page.logic.initteamPIDName("");
            },
            /**
             * 队伍级别
             */
            initTeamLvl:function(){
                ECS.ui.getComboSelects(teamLvlUrl,"teamLvlID","ID","NAME",false);
            },
            /**
             * 救援专业
             */
            initTeamSpeciality:function(){
                ECS.ui.getComboSelects(teamSpecialityUrl,"teamSpeciality","NAME","NAME",false);
            },
            /**
             * 所属应急队伍
             */
            initteamPIDName: function (name) {
                ECS.ui.getComboSelects(teamPIDNameUrl+"&name=" + encodeURI(name)+"&oid="+pid,"teamPIDName","NAME","NAME",false);
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
            /**
             * 初始化查询是否班组
             */
            teamBaseLvl: function () {
                ECS.ui.getCombobox("teamBaseLvl", inUseUrl, {
                    selectValue: -1,
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.teamID);
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
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message);
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
                var title = "队伍新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param teamID
             */
            edit: function (teamID) {
                var pageMode = PageModelEnum.Edit;
                var title = "队伍编辑";
                page.logic.detail(title, teamID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, teamID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '530px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'TeamAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "teamID": teamID,
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
             * 展示具体车辆信息
             */
            showNum:function(orgID,teamID,type,title){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '500px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'vehicleNum.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "orgID": orgID,
                            'teamID': teamID,
                            'type':type,
                            'title':title
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
                page.data.param["orgID"]=pid;
                if(page.data.param.orgID=="-1"){
                    page.data.param["orgID"] = "";
                }
                if(page.data.param.teamBaseLvl=="-1"){
                    page.data.param["teamBaseLvl"] = "";
                }
                if(page.data.param.inUse=="-1"){
                    page.data.param["inUse"] = "";
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/team/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/team/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/team/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
				
            }
           
          
        }
    };
    page.init();
    window.page = page;
});