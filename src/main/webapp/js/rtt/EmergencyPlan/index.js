//应急预案接口----------------：
var searchUrl = ECS.api.rttUrl + "/emergencyPlan";                                                        //查询
var delUrl = ECS.api.rttUrl + '/emergencyPlan';                                                           //删除
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';                                    //企业名称
var PlanDefinition_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanDefinition&isAll=true";   //预案定义
var PlanLevel_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanLevel&isAll=true";              //预案层级
var Category_url = ECS.api.bcUrl+"/accidentCategory/list";                                               //预案分类(事故大类)
var Category_url2 = ECS.api.bcUrl+"/accidentCategory/accidentType";                                     //预案类型（事故小类）
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";        //根据企业code获取企业id;
var exportUrl =  ECS.api.rttUrl +'/emergencyPlan/ExportToExcel'; 
var orgId = null;                                                   //企业id
var grid = null;                                                    //grid表格对象
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;                         //页面模式
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                       //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            this.bindUI();                      //绑定事件
            //根据企业code获取企业id;
            page.logic.GetOrgId(function(){
                page.logic.initTable();             //初始化表格
            });
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
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
                page.logic.clear_val();
            });
            //预案分类选择以后，联动预案类型；
            $("#accidentCategoryID").on("change",function(){
                //联动预案类型----
                page.logic.category_menu2();                                     //预案类型（事故小类）
            });

                 // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
              
                //企业名称数据处理；
                if(mini.get("orgID").getSelectedNode()){
                    page.data.param["orgID"] = mini.get("orgID").getSelectedNode().orgId;
                }else{
                    //取默认存储的值；
                    page.data.param["orgID"] = orgId;
                }
                // page.data.param["orgID"] = "30650700";     //用作测试
                //预案分类
                page.data.param["accidentCategoryID"] = $("#accidentCategoryID").val();
                //预案类型的数据进行处理
                var accidentTypeID = "";
                if($.trim(mini.get("accidentTypeID").getValue())=="" || $.trim(mini.get("accidentTypeID").getValue())=="全部"){
                    page.data.param["accidentTypeID"] = "";
                }else{
                    var aType_list = mini.get("accidentTypeID").getSelecteds();
                    var accidentTypeID_dt = [];
                    for(var a=0;a<aType_list.length;a++){
                        accidentTypeID_dt.push(aType_list[a].accidentTypeID);
                    }
                    if(accidentTypeID_dt.length>0){
                        page.data.param["accidentTypeID"] = accidentTypeID_dt.join(",");
                    }else{
                        page.data.param["accidentTypeID"] = "";
                    }
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
                    if(key){
                        s += "&" + name + "=" + encodeURIComponent(key);

                    }

				};

				return s.substring(1, s.length);

			},
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                //企业名称下拉数据
                page.logic.select_option(riskAreaTypeNameUrl,"orgID",function(){
                    page.logic.search(true);    //列表数据渲染
                });
                page.logic.planDefinition_menu();     //预案定义
                page.logic.planLevel_menu();          //预案层级
                //预案分类（事故大类）
                page.logic.category_menu(function(){
                    page.logic.category_menu2();          //预案类型（事故小类）
                });
            },
            //获取企业id;
            GetOrgId:function(cb){
                $.ajax({
                     // url:getOrgIdUrl+"?orgCode=35650000",     //用作测试
                    url:getOrgIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        orgId = Data.orgId;                   //存储企业id;
                        cb && cb();
                    }
                });
            },
            //清空查询条件
            clear_val:function(){
                $("#emergencyPlanName").val("");             //清空预案名称
                $("#planDefinition").val("");                //预案定义设置为“全部”
                $("#planLevel").val("");                      //预案层级设置为“全部”
                $("#accidentCategoryID").val("");            //预案分类设置为“全部”
                mini.get("accidentTypeID").setValue("全部"); //预案类型设置为“全部”
                page.logic.search(true);                       //进行查询
            },
            //显示编辑操作图标列
            show_edit:function(e){
                return ECS.util.editRender(e.row.emergencyPlanID);
            },
            //企业名称下拉菜单数据的加载
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //企业
                        mini.get("orgID").loadList(data,"orgId","orgPID");
                        //若是总部用户，那么可用；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("orgID").setValue(mini.get("orgID").data[0].orgCode);
                            orgId = mini.get("orgID").data[0].orgId;                                           //企业id;
                        }else{
                            //若是企业用户，设置为不可用状态；
                            mini.get("orgID").disable();
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("orgID").setValue(cur_key.orgSname);
                                        orgId = cur_key.orgId;       //存储企业id;
                                    }
                                })(data[w]);
                            }
                        }
                        cb && cb();
                    }
                })
            },
            //预案定义
            planDefinition_menu:function(){
                $.ajax({
                    url:PlanDefinition_url,
                    type:"get",
                    success:function (data) {
                        $("#planDefinition").html("");
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+(cur_dt["key"]==null?'':cur_dt["key"])+'">'+cur_dt["value"]+'</option>';
                                $("#planDefinition").append(cur_option);
                            })(data[w]);
                        }
                        $("#planDefinition").val("");
                    }
                });
            },
            //预案层级
            planLevel_menu:function(){
                $.ajax({
                    url:PlanLevel_url,
                    type:"get",
                    success:function (data) {
                        $("#planLevel").html("");
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+(cur_dt["key"]==null?'':cur_dt["key"])+'">'+cur_dt["value"]+'</option>';
                                $("#planLevel").append(cur_option);
                            })(data[w]);
                        }
                        $("#planLevel").val("");
                    }
                });
            },
            //预案分类(事故大类)
            category_menu:function(cb){
                $.ajax({
                    url:Category_url,
                    type:"get",
                    success:function (data) {
                        $("#accidentCategoryID").html("");
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                if(cur_dt["accidentCategoryID"]<0){
                                    var cur_option = '<option value="">全部</option>';
                                }else{
                                    var cur_option = '<option value="'+cur_dt["accidentCategoryID"]+'">'+cur_dt["accidentCategoryName"]+'</option>';
                                }
                                $("#accidentCategoryID").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案类型（事故小类）
            category_menu2:function(cb){
                if($("#accidentCategoryID").val()>0){
                    $.ajax({
                        url:Category_url2+"?accidentCategoryID="+$("#accidentCategoryID").val(),
                        type:"get",
                        success:function (data) {
                            //过滤数据------------------------------
                            var aFilter_dt = [];
                            for(var w=0;w<data.length;w++){
                                //修改其中一项，将“请选择”改为“全部”；
                                if(data[w]["accidentTypeID"]>0){
                                    aFilter_dt.push(data[w]);
                                }
                            }
                            //进行插入数据
                            mini.get("accidentTypeID").load(aFilter_dt);     //加载下拉菜单的数据
                            cb && cb();
                        }
                    });
                }else{
                    mini.get("accidentTypeID").setValue("全部");
                    cb && cb();
                }
            },
            //应用级别，已配置 or 未配置
            set_level:function(e){
                if(e.row.applicationLevel==null){
                    //未配置
                    return '<a href="javascript:page.logic.gotosetpage(\''+e.row.emergencyPlanID+ '\',\'' +e.row.planDefinition+'\',\''+e.row.orgID+'\')" style="text-decoration:underline;">未配置</a>';
                }else{
                    //已配置
                    return '<a href="javascript:page.logic.gotosetpage(\''+e.row.emergencyPlanID+ '\',\''+e.row.planDefinition+'\',\''+e.row.orgID+'\')" style="color:red;text-decoration:underline;">已配置</a>';
                }
            },
            //预案类型
            cate_type:function(e){
                if(e.row.accidentTypeName){
                    return e.row.accidentTypeName.join(",");
                }else{
                    return "空";
                }
            },
            is_true:function(e){
                switch(e.row.isStructure){
                    case 1:
                        return '<span style="color:green;cursor:pointer;" onclick="page.logic.gotoStructurePlan(\''+e.row.emergencyPlanID+'\',\''+e.row.emergencyPlanName+'\',\''+e.row.orgID+'\')">是</span>';
                        break;
                    case 0:
                        return '<span style="color:red;cursor:pointer;" onclick="page.logic.gotoStructurePlan(\''+e.row.emergencyPlanID+'\',\''+e.row.emergencyPlanName+'\',\''+e.row.orgID+'\')">否</span>';
                        break;
                }
            },
            //跳转到“结构化预案”页面；(第一个参数表示：应急预案id； 第二个参数表示：应急预案名称；)
            gotoStructurePlan:function(emergencyPlanID,emergencyPlanName,orgID){
                var pageMode = PageModelEnum.View;   //设置查看模式
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['90%', '90%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'StructuredPlan.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "emergencyPlanID": emergencyPlanID,         //应急预案id;
                            "emergencyPlanName":emergencyPlanName,    //应急预案名称
                            "orgID":orgID,
                            "title": "结构化预案"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            //跳转到“应用级别配置”页面；参数说明：第一个参数：应急预案id; 第二个参数：预案类型类别
            gotosetpage:function(emergencyPlanID,planDefinition,orgID){
                var pageMode = PageModelEnum.View;   //设置查看模式
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'ApplicationLevelDeploy.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "emergencyPlanID": emergencyPlanID,    //预案id；
                            "planDefinition":planDefinition,       //预案定义类型；
                            "orgID":orgID,
                            "title": "应用级别配置"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.emergencyPlanID);
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
                        success: function (result) {
                            result = JSON.parse(result)
                            if(result.isSuccess){
                                layer.msg(result.message);
                                page.logic.search(true);
                            }else{
                                layer.msg(result.message);
                            }
                        },
                        error: function (result) {
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
                var title = "应急预案新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param emergencyPlanID
             */
            edit: function (emergencyPlanID) {
                var pageMode = PageModelEnum.Edit,
                    title = "应急预案编辑";
                page.logic.detail(title, emergencyPlanID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, emergencyPlanID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['900px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AddEditEmergencyPlan.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "emergencyPlanID": emergencyPlanID,
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
            search: function (sort) {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                //排序
                if(sort){
                    page.data.param["sortType"]=1;
                }
                //企业名称数据处理；
                if(mini.get("orgID").getSelectedNode()){
                    page.data.param["orgID"] = mini.get("orgID").getSelectedNode().orgId;
                }else{
                    //取默认存储的值；
                    page.data.param["orgID"] = orgId;
                }
                // page.data.param["orgID"] = "30650700";     //用作测试
                //预案分类
                page.data.param["accidentCategoryID"] = $("#accidentCategoryID").val();
                //预案类型的数据进行处理
                var accidentTypeID = "";
                if($.trim(mini.get("accidentTypeID").getValue())=="" || $.trim(mini.get("accidentTypeID").getValue())=="全部"){
                    page.data.param["accidentTypeID"] = "";
                }else{
                    var aType_list = mini.get("accidentTypeID").getSelecteds();
                    var accidentTypeID_dt = [];
                    for(var a=0;a<aType_list.length;a++){
                        accidentTypeID_dt.push(aType_list[a].accidentTypeID);
                    }
                    if(accidentTypeID_dt.length>0){
                        page.data.param["accidentTypeID"] = accidentTypeID_dt.join(",");
                    }else{
                        page.data.param["accidentTypeID"] = "";
                    }
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/emergencyPlan/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/emergencyPlan/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/emergencyPlan/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});