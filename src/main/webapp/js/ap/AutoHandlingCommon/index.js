//应急预案接口----------------：
var Category_url = ECS.api.bcUrl+"/accidentCategory/list";                                               //预案分类(事故大类)
var Category_url2 = ECS.api.bcUrl+"/accidentCategory/accidentType";                                     //预案类型（事故小类）
var riskRank_url=ECS.api.bcUrl+"/riskRank/getListRiskRank";                                             //预警等级
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";                                                //根据企业code获取企业id;
//处警页面接口----------------：
var getAlarmUrl = ECS.api.apUrl+"/AutomaticMonitoring";                         //获取报警信息
var saveAlarmUrl = ECS.api.apUrl+"/DisposeWarning";                              //保存报警信息
var getEventUrl =  ECS.api.apUrl+"/DirectAlarm/eventLvl";                       //获取事故等级 ?orgCode=
var getCaseUrl =  ECS.api.apUrl+"/DisposeWarning/RelatedPlan";                 //预案列表接口（已启动、未启动：【综合预案、专项预案、现场处置预案】）
var saveCaseUrl = ECS.api.apUrl+"/DisposeWarning/RelatedPlan";                 //“启动预案”点击 进行保存；
var dangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";                   //危化品加载；
var saveDangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";              //危化品保存
var delDangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";               //危化品删除
var warnEndUrl = ECS.api.apUrl+"/DisposeWarning/complete";                    //报警事件结束
var InsertDangerUrl = ECS.api.apUrl+"/DisposeWarning/MSDS";                   //危化品--从工厂模型里取数据，插入表里
var InsertCaseUrl = ECS.api.apUrl+"/DisposeWarning/emergencyPlan";           //预案--从工厂模型里取数据，插入表里
var InsertAllUrl = ECS.api.apUrl+"/DisposeWarning/gis";                        //当地图发生改变时，插入预案和危化品的数据到表里去；
var FinishedUrl = ECS.api.apIpVerify+"/status";                //报警结束
var EventId = "";                                                 //报警事件id;
var IpAdress = "";                                                //机器ip地址
var grid = null;                                                  //grid表格对象
//与gis相关的层级范围的id;----------------------------
var enterpriseId = null;            /*企业ID*/
var drtDeptId = null;               /*二级单位ID*/
var riskAreaId = null;              /*安全风险区ID*/
var optlRiskSoneId = null;         /*作业风险区ID*/
var riskAnlsObjId = null;          /*风险分析对象ID*/
var pointId = null;                 /*风险分析点ID*/
var map_posi = null;                //全局变量，捕获地图页的位置
var mapchanged = false;             //地址是否改变，若改变，那么设置为true；若未改变，那么设置为false；
var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
window.pageLoadMode = PageLoadMode.None;                         //页面模式
$(function () {
    var page = {
        //页面初始化
        init: function () {
            //获取报警事件的id;
            var Base_EventId = page.logic.get_key("eventId");
            EventId = Base_EventId?Base_EventId:"";
            if(EventId==""){
                return false;
            }
            IpAdress = page.logic.get_key("ip");    //获取ip地址
            mini.parse();                       //初始化miniui框架

            //动态计算应急指令发送、应急地图、应急通讯录三者的iframe窗口高度；
            page.logic.set_iframe_h();

            //接警信息模块---左移；
            $(".mini-tabs-body").css("position","relative");   //设置相对定位；
            $("#callinfo_box").css("left","-"+$("#case_start_t").offsetLeft+"px");
            //接警信息模块---位置、警情摘要对齐设置；
            var iLeft = $("#tel_get").outerWidth()-$("#posi_set").outerWidth();
            $("#posi_set,#info_set").css("margin-left",iLeft+"px");

            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            //设置首页的操作按钮“处置完成”和“关闭”按钮安置在tab切换的右侧；
            var oBtn_list = $('<div class="layui-border-box" id="aBtn_list_box" style="text-align: left;">' +
                    '<a href="javascript:;" class="btn btn-default btn-primary mr__5" style="height:30px;line-height:30px;padding:0px;" id="warn_end_btn">处置完成</a>'+
                    '<a href="javascript:;" class="btn btn-default btn-close" style="height:30px;line-height:30px;padding:0px;" id="cancel_btn">关闭</a>'+
                '</div>');
            $(".mini-tabs-headers .mini-tabs-space").css({
                "position":"relative"
            });
            //可操作按钮的位置摆放
            oBtn_list.css({
                "position":"absolute",
                "right":"0px",
                "top":"-5px",
                "text-align":"right",
                "width":"50%",
                "height":"30px"
            });
            //将可操作的按钮添置进来；
            $(".mini-tabs-headers .mini-tabs-space").append(oBtn_list);
            this.bindUI();                      //绑定事件
            //设置应急指令发送页面的页面链接
            var oRigin_url = "./../../em/MsgSend/index.html?PageModel=1&eventId="+EventId;
            $("#sendorder").attr("src",oRigin_url);
            //设置样式问题；
            $("#pinel_first").parent().css("overflow-y","auto");
            //事故等级数据加载
            page.logic.load_EventLevel(function(){
                //预案分类（事故大类）
                page.logic.category_menu(function(){
                    //预案类型（事故小类）
                    page.logic.category_menu2(function(){
                        //预警等级
                        page.logic.riskRank_menu(function(){
                            //接警信息模块、实时监测报警情况模块加载
                            page.logic.get_alarm_message();
                        });
                    });
                });
            });
            //从工厂模型里取数据，将危化品数据插入到表里；
            page.logic.get_danger_from_factory(function () {
                //危化品（已确认）
                page.logic.danger_confirmed_product();
                //自动匹配危化品（列表加载）
                page.logic.danger_unconfirmed_product();
            });
            //从工厂模型里取数据，将应急预案数据插入到表里；
            page.logic.get_case_from_factory(function () {
                //启动预案选项加载(综合预案、专项预案、现场处置预案)
                page.logic.get_start_list();
                //未启动预案选项加载(综合预案、专项预案、现场处置预案)
                page.logic.get_close_list();
            });
            $("#call_situation_box").slideUp();        //实时监测报警情况----收缩
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //预案分类选择以后，联动预案类型；
            $("#accidentCategoryId").on("change",function(){
                //联动预案类型----
                page.logic.category_menu2();                                     //预案类型（事故小类）
            });
            //接警信息----保存
            $("#btnSave").click(function(){
                page.logic.save();
            });
            //接警信息----“人员受伤”失去焦点校验
            $("#dieCount").blur(function(){
                if($("#dieCount").val()!="" && $("#dieCount").val()!="无"){
                    var check_one = page.logic.check_val($("#dieCount").val(),"人员受伤");
                    if(!check_one){
                        // $("#error_health").show();        //展示错误提示
                        $("#dieCount").val("");
                    }else{
                        //二次确认填写信息
                        layer.confirm('你确认人员受伤是'+this.value+'人吗？', {
                            btn: ['确定','取消'] //按钮
                        }, function(index){
                            layer.close(index);
                        }, function(){
                            $("#dieCount").val("");
                        });
                        $("#error_health").hide();      //隐藏错误提示
                    }
                }
            });
            //接警信息----“人员死亡”失去焦点校验
            $("#casualtyCount").blur(function(){
                if($("#casualtyCount").val()!="" && $("#casualtyCount").val()!="无"){
                    var check_two = page.logic.check_val($("#casualtyCount").val(),"人员死亡");
                    if(!check_two){
                        $("#casualtyCount").val("");
                        // $("#error_death").show();     //展示错误提示
                    }else{
                        //二次确认填写信息
                        layer.confirm('你确认人员死亡是'+this.value+'人吗？', {
                            btn: ['确定','取消'] //按钮
                        }, function(index){
                            layer.close(index);
                        }, function(){
                            $("#casualtyCount").val("");
                        });
                        $("#error_death").hide();      //隐藏错误提示
                    }
                }
            });
            //接警信息----“财产损失”失去焦点校验
            $("#propertyLossCount").blur(function(){
                if($("#propertyLossCount").val()!="" && $("#propertyLossCount").val()!="无"){
                    var check_three = page.logic.check_val($("#propertyLossCount").val(),"财产损失");
                    if(!check_three){
                        $("#propertyLossCount").val("");
                        // $("#error_money").show();    //展示错误提示；
                    }else{
                        //二次确认填写信息
                        layer.confirm('你确认财产损失是'+this.value+'万元吗？', {
                            btn: ['确定','取消'] //按钮
                        }, function(index){
                            layer.close(index);
                        }, function(){
                            $("#propertyLossCount").val("");
                        });
                        $("#error_money").hide();    //隐藏错误提示；
                    }
                }
            });
            //启动预案----保存
            $("#start_case_btn").click(function(){
                page.logic.filter_case_list();
            });
            $("#eventLvlId").change(function () {
                $("#EventType_error").hide();   //隐藏错误提示信息
                if(this.value){
                    var oPtion_select=$("#eventLvlId option:selected"); //获取选中的项
                    layer.confirm('你确认事故等级是'+oPtion_select.text()+'吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        layer.close(index);
                    }, function(){
                        $("#eventLvlId").val("");
                    });
                }
            });
            //点击“查找其它综合预案”，打开预案列表；
            $("#check_case_btn_0").click(function () {
                page.logic.gotocaselist({
                    // businessModelId:8,
                    planDefinition:0,
                    title:"其它综合预案选项"
                });
            });
            //点击“查找其它专项预案”，打开预案列表；
            $("#check_case_btn_1").click(function () {
                page.logic.gotocaselist({
                    // businessModelId:8,
                    planDefinition:1,
                    title:"其它专项预案选项"
                });
            });
            //点击“查找其它处置预案”，打开预案列表；
            $("#check_case_btn_2").click(function () {
                page.logic.gotocaselist({
                    // businessModelId:8,
                    planDefinition:2,
                    title:"其它处置预案选项"
                });
            });
            //点击“查找其它处置预案”，打开预案列表；
            $("#check_case_btn_3").click(function () {
                page.logic.gotocaselist({
                    // businessModelId:8,
                    planDefinition:3,
                    title:"其它处置预案选项"
                });
            });
            //点击“查找其它处置预案”，打开预案列表；
            $("#check_case_btn_4").click(function () {
                page.logic.gotocaselist({
                    // businessModelId:8,
                    planDefinition:4,
                    title:"其它处置预案选项"
                });
            });
            //点击“确认危化品”，进行保存
            $("#danger_save_btn").click(function(){
                page.logic.save_danger();
            });
            //点击“查找其它危化品”，打开危化品列表页；
            $("#search_danger_btn").click(function(){
                page.logic.gotodangerlist();
            });
            //"已确认危化品"列表，点击某一项进行删除；
            $("#danger_box_0").click(function(e){
                if(e.target.tagName=="I"){
                    page.logic.remove_danger(e.target);
                }
            });
            //点击“地图重选报警位置”打开地图页
            $("#mapset_btn").click(function () {
                page.logic.gotomap();
            });
            $(".mini-tabs-space").click(function(e){
                switch ($(e.target).attr("id")){
                    case "warn_end_btn":
                        //点击“处置完成”按钮，进行报警事件结束，关闭当前弹层；
                        page.logic.warn_event_end();
                    break;
                    case "cancel_btn":
                        //点击“关闭”，关闭当前弹层；
                        page.logic.closeLayer(index);
                    break;
                }
            });
            //点击“展开 or 收缩”，是否进行展开或者收缩
            $("#isVisible_btn").click(function(){
                if($(this).text()=="展开"){
                    $("#call_situation_box").slideDown();      //展开
                    $(this).html("收缩");
                }else{
                    $("#call_situation_box").slideUp();        //收缩
                    $(this).html("展开");
                }
            });
            //接警信息----人员损伤、人员死亡、财产损失，当聚焦时，若为无，设置为空；
            $("#dieCount,#casualtyCount,#propertyLossCount").focus(function(){
                if($(this).val()=="无"){
                    $(this).val("");
                }
            });
            //接警信息----人员损伤、人员死亡、财产损失，当失去焦点时，若为空，设置为无；
            $("#dieCount,#casualtyCount,#propertyLossCount").blur(function(){
                if($(this).val()==""){
                    $(this).val("无");
                }
            });
            //tab切换,若当前页不为首页，那么隐藏操作按钮“处置完成”和“关闭”；
            mini.get("tabs").on("activechanged",function(e){
                if(e.index==0){
                    //展示操作按钮；
                    $("#aBtn_list_box").show();
                    $("#aBtn_list_box a").show();
                }else{
                    //隐藏操作按钮；
                    $("#aBtn_list_box").hide();
                    $("#aBtn_list_box a").hide();
                }
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            //实时监测点--“具体位置”字段展示
            adressDetail:function(e){
                return e.row.riskAreaName+"->"+e.row.optlRiskZoneName+"->"+e.row.riskAnlsobjName;
            },
            //报警时间转化
            warn_time:function(e){
                return ECS.util.DateTimeRender(e.row.alertsLogStartTime);
            },
            //动态计算设置iframe窗口高度：应急指令发送、应急地图、应急通讯录；
            set_iframe_h:function(){
                var iClient_h = $(window).height();                           //获取可见区域的高度；
                var iHead_h = $(".box-header").outerHeight();                //导航标题的高度；
                var iTtile_h = $(".mini-tabs-scrollCt").outerHeight()+52;   //tab标题的高度；
                $("#sendorder,#iframe_map,#iframe_tell,#iframe_PLC").css("height",(iClient_h-(iHead_h+iTtile_h))+"px");
            },
            //初始化
            setData:function(data){
                $("#titles").text(data.title);    //弹框标题设置；
                ECS.sys.RefreshContextFromSYS();        //用户登录
                //地图链接设置
                $("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_zjdxgis/index.html?"+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));
            },
            /**
             * 实时监测报警情况模块 数据填充
             */
            initTable: function (data,enterprise_dt) {
                //获取数据-------------------------------------
                var company_text = enterprise_dt["enterpriseName"],       //企业名称的数据
                    company_id = enterprise_dt["enterpriseId"],           //企业名称的id;
                    table_list = [];          //表格数据

                for(var key in data){
                    table_list = data[key];
                }
                //筛选表格列表数据
                var aFilter_dt = [];
                for(var w=0;w<table_list.length;w++){
                    if(typeof table_list[w]=="object"){
                        aFilter_dt.push(table_list[w]);
                    }
                }
                //企业名称数据填充
                $("#orgID").html("<option value='"+company_id+"'>"+company_text+"</option>");

                //表格列表数据数据填充-------------
                grid = mini.get("datagrid");
                grid.clearRows();             //清空表格
                grid.addRows(aFilter_dt);     //表格重新添加数据；
            },
            //报警事件id or ip获取
            get_key:function(name){
                if(window.location.href.indexOf(name)!=-1){
                    var get_param = window.location.href.split("?")[1];
                    if(get_param.indexOf("&")==-1){
                        var arr = get_param.split("=");
                        if(arr[0]==name){
                            return arr[1];
                        }
                    }else{
                       var arr_list = get_param.split("&");
                       var cur_val = "";
                       for(var w=0;w<arr_list.length;w++){
                           (function(cur_dt){
                                var one_dt = cur_dt.split("=");
                                if(one_dt[0]==name){
                                    cur_val = one_dt[1];
                                }
                           })(arr_list[w]);
                       }
                       return cur_val;
                    }
                }else{
                    return "";
                }
            },
            //报警事件结束
            warn_event_end:function(){
                $.ajax({
                    url: warnEndUrl+"?eventId="+EventId+"&isFinished=1",
                    async: false,
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    type: 'PUT',
                    success: function (Response) {
                        var Response = JSON.parse(Response);
                        if (Response.isSuccess) {
                            page.logic.warn_event_flowClose();
                            layer.msg("结束报警事件成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(index);
                            });
                        } else {
                            layer.msg("结束报警事件失败！");
                        }
                    }
                });
            },
            //api描述：把当前机器设置为不忙的状态 可以继续弹出自动接警
            warn_event_flowClose:function(){
                $.ajax({
                    url:FinishedUrl+"?orgId="+enterpriseId+"&ip="+IpAdress +"&status=close&now=" + Math.random(),
                    async: true,//异步
                    contentType: "application/json;charset=utf-8",
                    type: 'GET',
                    success: function () {
                        console.log("结束报警信息");
                    }
                });
            },
            //获取报警信息-----1229
            get_alarm_message:function(){
                var getAlarmInfoUrl = getAlarmUrl+"?eventId="+EventId;
                $.ajax({
                    url: getAlarmInfoUrl,
                    type: "GET",
                    // timeout: 5000,
                    success: function (data) {
                         // console.log("详情数据：",data);
                        //数据填充------------------------
                        $("#riskRankId").val(data["riskRankId"]);                                 //预警等级
                        $("#eventLvlId").val(data["eventLvlId"]);                                 //事故等级
                        $("#accidentCategoryId").val(data["accidentCategoryId"]);               //事故大类
                        // $("#eventSummary").html(data["eventSummary"]?data["eventSummary"]:"无");   //警情摘要
                        var warn_info = data["eventSummary"]?data["eventSummary"]:"";
                        //实时地更新“事故小类”，并将值塞进来；
                        page.logic.category_menu2(function(){
                            $("#accidentTypeId").val(data["accidentTypeId"]);                     //事故小类
                            //设置警情摘要的值：
                            warn_info+=(" "+$("#eventLvlId").find("option:selected").text());          //事故等级；
                            warn_info+=(" "+$("#accidentCategoryId").find("option:selected").text()); //事故小类；
                            warn_info+=(" "+$("#accidentTypeId").find("option:selected").text());     //事故大类；
                            $("#eventSummary").html(warn_info);
                        });
                        $("#dieCount").val(data["dieCount"]?data["dieCount"]:"无");                                  //人员受伤
                        $("#casualtyCount").val(data["casualtyCount"]?data["casualtyCount"]:"无");                      //人员死亡
                        $("#propertyLossCount").val(data["propertyLossCount"]?data["propertyLossCount"]:"无");             //财产损失

                        $("#callPhone").html(data["callPhone"]?data["callPhone"]:"无");                              //报警电话
                        $("#call_warner").html(data["alertsPersonInfo"]);                                            //报警人
                        $("#eventAddress").val(data["eventAddress"]?data["eventAddress"]:"无");                    //位置

                        //位置拼接进行处理
                        enterpriseId = data["enterpriseId"];          //企业id存储
                        drtDeptId = data["drtDeptId"];                //二级单位id存储
                        riskAreaId = data["riskAreaId"];             //安全风险区id存储
                        optlRiskSoneId = data["optlRiskSoneId"];    //作业风险区id存储

                        $("#eventAddress").val(data["eventAddress"]);       //位置重设

                        //实时监测报警情况模块------
                        page.logic.load_fiveseconds_dt(data);
                    }
                });
            },
            //实时监测数据，隔5秒刷新一次
            load_fiveseconds_dt:function(dt){
                if(dt){
                    //若有数据，那么直接进行渲染表；
                    page.logic.initTable(
                        dt["alertsLogEntityMap"],
                        {"enterpriseName":dt["enterpriseName"],"enterpriseId":dt["enterpriseId"]}
                    );
                    setTimeout(function(){
                        page.logic.load_fiveseconds_dt();
                    },5000);
                }else{
                    //若没有数据，那么进行请求,再进行渲染列表；
                    var getAlarmInfoUrl = getAlarmUrl+"?eventId="+EventId;
                    $.ajax({
                        url: getAlarmInfoUrl,
                        type: "GET",
                        timeout: 5000,
                        success: function (data) {
                            page.logic.initTable(
                                data["alertsLogEntityMap"],
                                {"enterpriseName":data["enterpriseName"],"enterpriseId":data["enterpriseId"]}
                            );
                            setTimeout(function(){
                                page.logic.load_fiveseconds_dt();
                            },5000);
                        }
                    });
                }

            },
            //接警信息 人员受伤、人员死亡、财产损失 校验；
             check_val:function(str,name) {
                 var patrn = /^\d+(\.\d+)?$/;    //财产损失
                 var patrn2 = /^\d+$/;           //人员受伤、人员死亡
                 var result = true;
                 switch (name){
                     case "财产损失":
                         if (!patrn.exec(str)) {
                             result = false;
                         }
                         break;
                     case "人员受伤":
                     case "人员死亡":
                         if (!patrn2.exec(str)) {
                             result = false;
                         }
                         break;
                 }
                return result;
            },
            //接警信息---保存
            save:function(){
                //搜集数据，进行拼接；
                //校验事故等级，是否为空
                if(!$("#eventLvlId").val()){
                    $("#EventType_error").show();   //展示错误提示信息；
                    return false;
                }
                //校验人员受伤、人员死亡、财产损失不可填写非数字的符号
                if($("#dieCount").val()!="" && $("#dieCount").val()!="无"){
                    var check_one = page.logic.check_val($("#dieCount").val(),"人员受伤");
                    if(!check_one){
                        $("#error_health").show();
                        return false;
                    }else{
                        $("#error_health").hide();
                    }
                }
                if($("#casualtyCount").val()!="" && $("#casualtyCount").val()!="无"){
                    var check_two = page.logic.check_val($("#casualtyCount").val(),"人员死亡");
                    if(!check_two){
                        $("#error_death").show();
                        return false;
                    }else{
                        $("#error_death").hide();
                    }
                }
                if($("#propertyLossCount").val()!="" && $("#propertyLossCount").val()!="无"){
                    var check_three = page.logic.check_val($("#propertyLossCount").val(),"财产损失");
                    if(!check_three){
                        $("#error_money").show();
                        return false;
                    }else{
                        $("#error_money").hide();
                    }
                }
                var data = {};
                data["eventId"] = EventId;                                                     //报警事件id;
                data["riskRankId"] = $("#riskRankId").val();                                  //预警等级
                data["eventLvlId"] = $("#eventLvlId").val();                                  //事故等级
                data["accidentCategoryId"] = $("#accidentCategoryId").val();                //事故大类
                data["accidentTypeId"] = $("#accidentTypeId").val();                         //事故小类

                data["dieCount"] = ($.trim($("#dieCount").val())=="" || $("#dieCount").val()=="无")?"":$("#dieCount").val();                                          //人员受伤
                data["casualtyCount"] = ($.trim($("#casualtyCount").val())=="" || $("#casualtyCount").val()=="无")?"":$("#casualtyCount").val();                   //人员死亡
                data["propertyLossCount"] = ($.trim($("#propertyLossCount").val())=="" || $("#propertyLossCount").val()=="无")?"":$("#propertyLossCount").val(); //财产损失
                data["eventAddress"] = $("#eventAddress").val();                             //位置
                data["enterpriseId"] = enterpriseId;    /*企业ID*/
                data["drtDeptId"] = drtDeptId;           /*二级单位ID*/
                data["riskAreaId"] = riskAreaId;         /*安全风险区ID*/
                data["optlRiskSoneId"] = optlRiskSoneId;  /*作业风险区ID*/
                data["riskAnlsObjId"] = riskAnlsObjId;    /*风险分析对象ID*/
                data["pointId"] = pointId;                 /*风险分析点ID*/
                //进行保存；
                $.ajax({
                    url: saveAlarmUrl,
                    async: false,
                    data: JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    type: 'PUT',
                    success: function (Response) {
                        var Response = JSON.parse(Response)
                        if (Response.isSuccess) {
                            layer.msg("报警信息保存成功！");
                            //若是地理位置发生了改变，那么就从工厂模型里取数据，进行插入，然后再刷新预案和危化品的模块数据；
                            if(mapchanged){
                                page.logic.case_danger_from_factory(function(){
                                    //渲染数据，刷新启动预案和未启动预案部分
                                    page.logic.get_start_list();                 //已启动的预案部分；
                                    page.logic.get_close_list();                 //未启动的预案部分；
                                    //渲染数据，刷新危化品部分；
                                    page.logic.danger_confirmed_product();       //已确认部分
                                    page.logic.danger_unconfirmed_product();      //未确认部分
                                });
                            }
                        } else {
                            layer.msg("报警信息保存失败！");
                        }
                    }
                });
            },
            //打开查看“危化品”详情：
            //第一个参数表示：危化品的id;
            //第二个参数表示：危化品的名字；
            //第三个参数表示：若为true,当前点击的这一行在自动匹配危化品列里，若为false,当前点击的这一行在已确认危化品列里；
            ShowMsDsDetail:function(msdsId,page_name,boolearn){
                //若当前点击的这一项是自动匹配危化品列里；
                if(boolearn=="true"){
                    $("#danger_box_1 input").each(function(){
                        if($(this).attr("msdsId")==msdsId){
                            this.checked = true;
                        }
                    });
                }
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['80%', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './../../rtt/MSDS/detail.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "msdsId": msdsId,
                            'title': "查看危化品",
                            "pagename":page_name,
                            "ishidden":boolearn
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end:function(){
                        //若是危化品详情页点击了“确认”按钮，那么将这一项，挪到“已确认危化品”列里；
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.save_danger();
                        }
                        //若是危化品详情页点击了“取消”按钮，并且当前这一项处于“自动匹配危化品”列里，那么这一项取消选中状态；
                        if (window.pageLoadMode == PageLoadMode.None) {
                            if($("#danger_box_1 input:checked").attr("msdsId")==msdsId){
                                $("#danger_box_1 input:checked")[0].checked = false;
                            }
                        }
                    }
                });
            },
            //危化品----保存；
            save_danger:function(){
                //拼接数据
                var aFilter_list = [];                                                             //空数组，用来存储某条选中的值；
                var aInput_checked = $("#danger_box_1").find("input:checkbox:checked");       //未启动部分，选中项；
                if(aInput_checked.length==0){
                    layer.msg("请勾选您想确认的危化品！");
                    return false;
                }
                for(var w=0;w<aInput_checked.length;w++){
                    (function(one_checked){
                        var oSpace_dt = {};
                        oSpace_dt["relatedMsdsId"] = $(one_checked).attr("relatedMsdsId");
                        oSpace_dt["eventId"] = $(one_checked).attr("eventId");
                        oSpace_dt["msdsId"] = $(one_checked).attr("msdsId");
                        oSpace_dt["isUsed"] = 1;
                        aFilter_list.push(oSpace_dt);
                    })(aInput_checked[w]);
                }
                $.ajax({
                    url: saveDangerUrl,
                    async: false,
                    data: JSON.stringify(aFilter_list),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    type: 'PUT',
                    success: function (Response) {
                        var Response = JSON.parse(Response)
                        if (Response.isSuccess) {
                            //渲染危化品（已确认、自动匹配部分）
                            page.logic.danger_confirmed_product();
                            page.logic.danger_unconfirmed_product();
                        } else {
                            layer.msg("相关危化品保存失败！");
                        }
                    }
                });
            },
            //跳转危化品列表页
            gotodangerlist:function(){
                var pageMode = PageModelEnum.NewAdd,      //页面模式设置
                    title = "危化品信息";                    //页面标题设置
                //打开危化品信息页面
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['850px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './../../rtt/MSDS/MSDSModule.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "eventId":EventId,                          //报警事件id;
                            'title': title                               //标题
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        //刷新危化品模块部分
                        //危化品（已确认）
                        page.logic.danger_confirmed_product();
                        //自动匹配危化品（列表加载）
                        page.logic.danger_unconfirmed_product();
                        window.pageLoadMode = PageLoadMode.None;
                    }
                })
            },
            //已确认危化品----删除
            remove_danger:function(obj){
                var idsArray = new Array();      //数组
                var one_dt = {};                  //单条数据
                one_dt.relatedMsdsId = $(obj).attr("relatedMsdsId");
                one_dt.eventId = $(obj).attr("eventId");
                one_dt.msdsId = $(obj).attr("msdsId");
                one_dt.msdsIds = $(obj).attr("msdsIds");
                one_dt.isUsed = 0;
                idsArray.push(one_dt);    //存储搜集的数据
                $.ajax({
                    url: delDangerUrl,
                    async: false,
                    data: JSON.stringify(idsArray),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    type: 'DELETE',
                    success: function (result) {
                        var Response = JSON.parse(result)
                        if (Response.isSuccess) {
                            //刷新危化品模块
                            page.logic.danger_unconfirmed_product();
                            page.logic.danger_confirmed_product();
                        } else {
                            layer.msg("删除失败！");
                        }
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //当地图位置发生改变的时候，将预案和危化品重新插入表里；
            case_danger_from_factory:function(cb){
                $.ajax({
                    url: InsertAllUrl + "?eventId=" + EventId ,
                    type: "POST",
                    // timeout: 5000,
                    success: function (result) {
                        if(result.isSuccess){
                            cb && cb();
                        }
                    }
                });
            },
            //从工厂模型取数据，将相应的危化品数据进行插入表里；
            get_danger_from_factory:function(cb){
                $.ajax({
                    url: InsertDangerUrl + "?eventId=" + EventId ,
                    type: "POST",
                    // timeout: 5000,
                    success: function (result) {
                        if(result.isSuccess){
                            cb && cb();
                        }
                    }
                });
            },
            //从工厂模型取数据，将相应的预案数据进行插入表里；
            get_case_from_factory:function(cb){
                $.ajax({
                    url: InsertCaseUrl + "?eventId=" + EventId ,
                    type: "POST",
                    timeout: 5000,
                    success: function (result) {
                        if(result.isSuccess){
                            cb && cb();
                        }
                    }
                });
            },
            //已确认危化品列表加载；
            danger_confirmed_product:function(cb){
                var $oPar = $("#danger_box_0");     //已确认危化品父级盒子
                $.ajax({
                    url:dangerUrl+"?eventId="+EventId+"&isUsed=1",
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        //渲染数据；
                        $oPar.html("");                        //清空盒子
                        for(var w=0;w<Data.length;w++){
                            var oLi = $('<li style="width: 50%;" class="mb__5 pull-left">'+
                                '<span style="cursor:hand;" onclick="page.logic.ShowMsDsDetail(\''+Data[w].msdsId+'\',\''+Data[w].msdsChineseName+'\',\''+false+'\')" >'+Data[w].msdsChineseName+'</span>'+
                                '<i class="icon-close ml__5" style="color: red;cursor:pointer;" eventId="'+Data[w].eventId+'" isUsed="'+Data[w].isUsed+'" msdsChineseName="'+Data[w].msdsChineseName+'" msdsId="'+Data[w].msdsId+'" relatedMsdsId="'+Data[w].relatedMsdsId+'" msdsIds="'+Data[w].msdsIds+'"></i>'+
                                '</li>');
                            $oPar.append(oLi);
                        }
                        cb && cb();
                    }
                });
            },
            //自动未匹配危化品列表加载；
            danger_unconfirmed_product:function(cb){
                var $oPar = $("#danger_box_1");     //已确认危化品父级盒子
                $.ajax({
                    url:dangerUrl+"?eventId="+EventId+"&isUsed=0",
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        //渲染数据；
                        $oPar.html("");                                 //清空盒子
                        //填充数据
                        for(var w=0;w<Data.length;w++){
                            var oLi = $('<li style="width: 50%;" class="mb__5 pull-left">' +
                                '<input type="checkbox" class="layui-form-checkbox" style="margin:0px;"  eventId="'+Data[w].eventId+'" isUsed="'+Data[w].isUsed+'" msdsChineseName="'+Data[w].msdsChineseName+'" msdsId="'+Data[w].msdsId+'" relatedMsdsId="'+Data[w].relatedMsdsId+'" msdsIds="'+Data[w].msdsIds+'" />'+
                                '<label class="ml__5" style="cursor:hand;" onclick="page.logic.ShowMsDsDetail(\''+Data[w].msdsId+'\',\''+Data[w].msdsChineseName+'\',\''+true+'\')" >'+Data[w].msdsChineseName+'</label>'+
                                '</li>');
                            $oPar.append(oLi);
                        }
                        cb && cb();
                   }
                });
            },
            //已启动的预案----  20190102
            get_start_list:function(){
                //综合预案
                var case_url_0 = page.logic.case_list_url(1,EventId,0);
                page.logic.render_start_list(case_url_0,$("#start_case_0"));
                //专项预案
                var case_url_1 = page.logic.case_list_url(1,EventId,1);
                page.logic.render_start_list(case_url_1,$("#start_case_1"));
                //现场处置预案
                var case_url_2 = page.logic.case_list_url(1,EventId,2);
                page.logic.render_start_list(case_url_2,$("#start_case_2"));
                //灭火处置预案
                var case_url_3 = page.logic.case_list_url(1,EventId,3);
                page.logic.render_start_list(case_url_3,$("#start_case_3"));
                //其他
                var case_url_4 = page.logic.case_list_url(1,EventId,4);
                page.logic.render_start_list(case_url_4,$("#start_case_4"));
            },
            //未启动的预案----   20190102
            get_close_list:function(){
                //综合预案
                var case_url_0 = page.logic.case_list_url(0,EventId,0);
                page.logic.render_close_list(case_url_0,$("#close_case_0"));
                //专项预案
                var case_url_1 = page.logic.case_list_url(0,EventId,1);
                page.logic.render_close_list(case_url_1,$("#close_case_1"));
                //现场处置预案
                var case_url_2 = page.logic.case_list_url(0,EventId,2);
                page.logic.render_close_list(case_url_2,$("#close_case_2"));
                //灭火处置预案
                var case_url_3 = page.logic.case_list_url(0,EventId,3);
                page.logic.render_close_list(case_url_3,$("#close_case_3"));
                //其他
                var case_url_4 = page.logic.case_list_url(0,EventId,4);
                page.logic.render_close_list(case_url_4,$("#close_case_4"));
            },
            //拼接预案的接口----  20190102
            //参数说明：
            // isStart: 0 未启动预案； 1  已启动预案；
            // eventId: 接警事件id
            //case_type: 预案定义，0综合预案；1专项预案；2现场处置预案
            case_list_url:function(isUsed,eventId,planDefinition){
                return  getCaseUrl+"?isUsed="+isUsed+"&eventId="+eventId+"&planDefinition="+planDefinition;
            },
            //渲染未启动预案列表结构；----  20190102
            //参数说明：
            /*
            url: 接口；
            $oPar: 父级盒子；
            cb: 回调函数
            * */
            render_close_list:function(url,$oPar,cb){
                $.ajax({
                    url:url,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        $oPar.html("");                        //清空盒子
                        for(var w=0;w<Data.length;w++){
                            var oLi = $('<li style="width: 50%;" class="mb__5 pull-left">'+
                                            '<input type="radio" class="layui-form-radio" name="startPlan" style="margin:0px;" isUsed="'+Data[w].isUsed+'" emergencyPlanId="'+Data[w].emergencyPlanId+'" emergencyPlanName="'+Data[w].emergencyPlanName+'" eventId="'+Data[w].eventId+'" planDefinition="'+Data[w].planDefinition+'" relatedPlanId="'+Data[w].relatedPlanId+'"'+ '/>'+
                                            '<label class="ml__5">'+Data[w].emergencyPlanName+'</label>'+
                                            '</li>');
                            $oPar.append(oLi);
                        }
                        cb && cb();
                    }
                });
            },
            //渲染启动预案列表结构；
           //参数说明：
            /*
            url: 接口；
            $oPar: 父级盒子；
            cb: 回调函数
            * */
            render_start_list:function(url,$oPar,cb){
                $.ajax({
                    url:url,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        $oPar.html("");
                        for(var w=0;w<Data.length;w++) {
                            var oLi = $('<li style="text-decoration:underline;width:50%;" class="pull-left mb__5">' +
                                '<span>[<span style="color:red;cursor:pointer;" onclick="page.logic.gotosetpage(\'' + Data[w].emergencyPlanId + '\',\'' + Data[w].eventId +'\',\''+ Data[w].emergencyPlanName + '\')"  isUsed="'+Data[w].isUsed+'" emergencyPlanId="'+Data[w].emergencyPlanId+'" emergencyPlanName="'+Data[w].emergencyPlanName+'" eventId="'+Data[w].eventId+'" planDefinition="'+Data[w].planDefinition+'" relatedPlanId="'+Data[w].relatedPlanId+'"'+'>点击执行</span>]</span> <span>'+Data[w].emergencyPlanName+' (启动时间：'+ECS.util.DateTimeRender(Data[w].usedDate)+')</span>'+
                                '</li>');
                            $oPar.append(oLi);
                        }
                        cb && cb();
                    }
                });
            },
            //筛选未匹配的未启动的已勾选的预案，并将其放到已启动的预案列表上；
            //未匹配的未启动的已勾选的预案，三种类型要对应插到已启动的预案列表里；
            filter_case_list:function(){
                //拼接数据
                var aFilter_list = [];                                                             //空数组，用来存储某条选中的值；
                var aInput_checked = $("#case_close_box").find("input:radio:checked");    //未启动部分，选中项；
                if(aInput_checked.length==0){
                    layer.msg("请先勾选您要启动的预案！");
                    return false;
                }
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '350px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'ShowEmergencyPlan.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "emergencyPlanID": aInput_checked.attr("emergencyPlanId"),
                            "checkMode":true,
                            'title': "启动预案"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end:function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            for(var w=0;w<aInput_checked.length;w++){
                                (function(one_checked){
                                    var oSpace_dt = {};
                                    oSpace_dt["emergencyPlanId"] = $(one_checked).attr("emergencyPlanId");
                                    oSpace_dt["emergencyPlanIds"] = $(one_checked).attr("emergencyPlanIds");
                                    oSpace_dt["emergencyPlanName"] = $(one_checked).attr("emergencyPlanName");
                                    oSpace_dt["eventId"] = $(one_checked).attr("eventId");
                                    oSpace_dt["isUsed"] = 1;
                                    oSpace_dt["planDefinition"] = $(one_checked).attr("planDefinition");
                                    oSpace_dt["relatedPlanId"] = $(one_checked).attr("relatedPlanId");
                                    aFilter_list.push(oSpace_dt);
                                })(aInput_checked[w]);
                            }
                            $.ajax({
                                url: saveCaseUrl,
                                async: false,
                                data: JSON.stringify(aFilter_list),
                                dataType: "text",
                                contentType: "application/json;charset=utf-8",
                                type: 'PUT',
                                success: function (Response) {
                                    window.pageLoadMode = PageLoadMode.None;
                                    var Response = JSON.parse(Response);
                                    if (Response.isSuccess) {
                                        //渲染数据，刷新启动预案和未启动预案部分
                                        page.logic.get_start_list();
                                        page.logic.get_close_list();
                                    } else {
                                        layer.msg("启动预案失败！");
                                    }
                                }
                            });
                        }
                    }
                });
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
            //事故等级下拉菜单数据加载
            load_EventLevel:function(cb){
                $.ajax({
                    url:getEventUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type: "GET",
                    timeout:5000,
                    success: function (data) {
                        //渲染事故等级下拉菜单数据；
                        $("#eventLvlId").html("");
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                if(cur_dt["eventLvlId"]>0){
                                    var cur_option = '<option value="'+cur_dt["eventLvlId"]+'">'+cur_dt["eventLvlName"]+'</option>';
                                    $("#eventLvlId").append(cur_option);
                                }
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预警等级下拉菜单数据加载
            riskRank_menu:function(cb){
                $.ajax({
                    url:riskRank_url+"?enterpriseCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type:"get",
                    success:function (data) {
                        $("#riskRankId").html("");
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+cur_dt["riskRankID"]+'">'+cur_dt["rankDisplay"]+'</option>';
                                $("#riskRankId").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案分类(事故大类)
            category_menu:function(cb){
                $.ajax({
                    url:Category_url,
                    type:"get",
                    success:function (data) {
                        $("#accidentCategoryId").html("");
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+cur_dt["accidentCategoryID"]+'">'+cur_dt["accidentCategoryName"]+'</option>';
                                $("#accidentCategoryId").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案类型（事故小类）
            category_menu2:function(cb){
                if($("#accidentCategoryId").val()){
                    $.ajax({
                        url:Category_url2+"?accidentCategoryID="+$("#accidentCategoryId").val(),
                        type:"get",
                        success:function (data) {
                            $("#accidentTypeId").html("");
                            //添加其它项
                            for(var w=0;w<data.length;w++){
                                (function(cur_dt){
                                    var cur_option = '<option value="'+cur_dt["accidentTypeID"]+'">'+cur_dt["accidentTypeName"]+'</option>';
                                    $("#accidentTypeId").append(cur_option);
                                })(data[w]);
                            }
                            cb && cb();
                        }
                    });
                }else{
                    $("#accidentTypeId").html("");
                    cb && cb();
                }
            },
            //跳转到地图页-------------------
            gotomap:function(){
                var pageMode = PageModelEnum.View;   //设置查看模式
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'setmap.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "enterpriseId":enterpriseId,        //企业ID
                            "drtDeptId":drtDeptId,               //二级单位ID
                            "riskAreaId":riskAreaId,            //安全风险区ID
                            "optlRiskSoneId":optlRiskSoneId,   //作业风险区ID
                            // "riskAnlsObjId":riskAnlsObjId,      //风险分析对象ID
                            // "pointId":pointId,                   //风险分析点ID
                            "title": "重选报警位置"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        //将地图定位结果返回到接警信息模块“位置”表单页面上去；
                        //倘若地图上没有选择，那么不再进行赋值；
                        if(!map_posi){
                            mapchanged = false;
                            return false;
                        }
                        $("#eventAddress").removeAttr("disabled");   //删除掉位置表单禁用，设置为可用状态；
                        //若地址进行改变了，重新赋值；
                        if($("#eventAddress").val()!=map_posi){
                            $("#eventAddress").val(map_posi);
                            mapchanged = true;
                        }else{
                            mapchanged = false;
                        }
                        window.pageLoadMode = PageLoadMode.None;
                    }
                })
            },
            //跳转到“预案列表”页面
            gotocaselist:function(dt){
                var pageMode = PageModelEnum.View;   //设置查看模式
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '580px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './../../rtt/EmergencyPlan/EmergencyPlan_list.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            // "businessModelId":dt.businessModelId,
                            "planDefinition":dt.planDefinition,
                            "EventId":EventId,
                            "title": dt.title
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Reload) {
                            //渲染数据，刷新启动预案和未启动预案部分
                            page.logic.get_start_list();
                            page.logic.get_close_list();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            //跳转到“结构化预案详情”页面；
            gotosetpage:function(emergencyPlanID,eventID,emergencyPlanName){
                var pageMode = PageModelEnum.View;   //设置查看模式
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['90%', '90%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './../../rtt/EmergencyPlan/StructuredPlan.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "emergencyPlanID": emergencyPlanID,
                            "emergencyPlanName":emergencyPlanName,
                            "eventID":eventID,
                            "IsOnlyRead":true,
                            "title": "结构化预案执行"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Reload) {
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});