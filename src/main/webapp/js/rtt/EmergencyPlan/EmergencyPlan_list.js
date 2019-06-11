// var searchUrl = ECS.api.apUrl + "/DisposeWarning/emergencyPlan";                                           //查询
var searchUrl = ECS.api.rttUrl + "/emergencyPlan";                                                       //查询
var addUrl = ECS.api.apUrl + "/DisposeWarning/RelatedPlan";                                             //新增保存
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';                                    //企业名称
var PlanDefinition_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanDefinition&isAll=true";   //预案定义
var PlanLevel_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanLevel&isAll=true";              //预案层级
var Category_url = ECS.api.bcUrl+"/accidentCategory/list";                                               //预案分类(事故大类)
var Category_url2 = ECS.api.bcUrl+"/accidentCategory/accidentType";                                     //预案类型（事故小类）
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";        //根据企业code获取企业id;
var orgId = null;                                                   //企业id
var grid = null;                                                    //grid表格对象
// var businessModelId = null;                   //业务模块id;
var planDefinition = null;                    //预案定义类型；
var EventId = null;                            //报警事件id;
window.ownDetail;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;                         //页面模式

$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
        },
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
                page.logic.clear_val();
            });
            //预案分类选择以后，联动预案类型；
            $("#accidentCategoryID").on("change",function(){
                //联动预案类型----
                page.logic.category_menu2();                                     //预案类型（事故小类）
            });
            //点击保存按钮，保存相关数据
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，关闭该弹框
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        data: {
            param: {},
            cate_dt:[]    //预案分类的数据存储
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                //处理提交类型
                var ajaxType = "POST";                            //提交方式
                window.pageLoadMode = PageLoadMode.Reload;    //设置页面模式为重新加载；
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                if(rowsArray.length==0){
                    layer.msg("请勾选您要的预案选项！");
                    return false;
                }
                $.each(rowsArray, function (i, el) {
                    // console.log("选中的每条数据：",el);
                    var oSpace_dt = {};
                    oSpace_dt["relatedPlanId"] = null;                           //应急预案主键id 为null; (新增模式)
                    oSpace_dt["emergencyPlanId"] = el.emergencyPlanID;         //应急预案ID
                    oSpace_dt["emergencyPlanName"] = el.emergencyPlanName;    //应急预案名称
                    oSpace_dt["eventId"] = EventId;                              //报警事件ID
                    oSpace_dt["isUsed"] = 0;                                      //是否启动，0表示未启动；
                    oSpace_dt["planDefinition"] = el.planDefinition;           //预案定义类型；
                    idsArray.push(oSpace_dt);
                });
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    timeout:5000,
                    data:JSON.stringify(idsArray),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    // data:$.param(idsArray),
                    // dataType:"text",
                    // contentType: "application/x-www-form-urlencoded",
                    success: function (result) {
                        console.log("返回的数据状态：",result);
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    },
                    error: function (result) {
                        if(result){
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    }
                })
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                // businessModelId = data.businessModelId;    //业务模块ID;
                planDefinition = data.planDefinition;      //预案定义;
                EventId = data.EventId;     //事件id;
                ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
                page.bindUI();
                //根据企业code获取企业id;
                page.logic.GetOrgId(function(){
                    page.logic.initTable();             //初始化表格
                });
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
                    //预案分类（事故大类）
                    page.logic.category_menu(function(){
                        page.logic.category_menu2();          //预案类型（事故小类）
                        page.logic.search(true);             //列表数据渲染  (由于列表中的“预案分类”字段需要根据下拉菜单“预案分类”的数据进行解析，因此先加载“预案分类”)
                    });
                });
                page.logic.planDefinition_menu(function () {
                    $("#planDefinition").val(planDefinition);
                    $("#planDefinition").attr("disabled","disabled");
                });     //预案定义
                page.logic.planLevel_menu();          //预案层级

            },
            //获取企业id;
            GetOrgId:function(cb){
                $.ajax({
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
                $("#emergencyPlanName").val("");         //清空预案名称
                $("#planDefinition").val("");            //预案定义设置为“全部”
                $("#planLevel").val("");                  //预案层级设置为“全部”
                $("#accidentCategoryID").val("");        //预案分类设置为“全部”
                $("#accidentTypeID").val("");             //预案类型设置为“全部”
                page.logic.search(true);                   //进行查询
            },
            //显示编辑操作图标列
            // show_edit:function(e){
            //     return ECS.util.editRender(e.row.emergencyPlanID);
            // },
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
            planDefinition_menu:function(cb){
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
                        cb && cb();
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
                        //添加“全部”一项；
                        var one_option = '<option value="">全部</option>';
                        $("#accidentCategoryID").append(one_option);
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+cur_dt["accidentCategoryID"]+'">'+cur_dt["accidentCategoryName"]+'</option>';
                                $("#accidentCategoryID").append(cur_option);
                            })(data[w]);
                        }
                        page.data.cate_dt = data;    //存储预案分类的数据；
                        cb && cb();
                    }
                });
            },
            //预案类型（事故小类）
            category_menu2:function(cb){
                if($("#accidentCategoryID").val()){
                    $.ajax({
                        url:Category_url2+"?accidentCategoryID="+$("#accidentCategoryID").val(),
                        type:"get",
                        success:function (data) {
                            $("#accidentTypeID").html("");
                            //添加“全部”一项；
                            var one_option = '<option value="">全部</option>';
                            $("#accidentTypeID").append(one_option);
                            //添加其它项
                            for(var w=0;w<data.length;w++){
                                (function(cur_dt){
                                    var cur_option = '<option value="'+cur_dt["accidentTypeID"]+'">'+cur_dt["accidentTypeName"]+'</option>';
                                    $("#accidentTypeID").append(cur_option);
                                })(data[w]);
                            }
                            cb && cb();
                        }
                    });
                }else{
                    $("#accidentTypeID").html("");
                    //添加“全部”一项；
                    var one_option = '<option value="">全部</option>';
                    $("#accidentTypeID").append(one_option);
                    cb && cb();
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
            //预案分类
            cate_method:function(e){
                var CurTypeName = "无";
                if(e.row.accidentCategoryID) {
                    for (var w = 0; w < page.data.cate_dt.length; w++) {
                        (function (cur_dt) {
                            if (cur_dt.accidentCategoryID == e.row.accidentCategoryID) {
                                CurTypeName = cur_dt.accidentCategoryName;
                            }
                        })(page.data.cate_dt[w]);
                    }
                }
                return CurTypeName;
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

                //添加额外的参数：
                // page.data.param["businessModelId"] = businessModelId;              //业务模块ID；
                page.data.param["planDefinition"] = planDefinition;                //预案定义类型；

                // console.log("查询时的参数说明：",page.data.param);
                grid.load(page.data.param);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})