var addUrl=ECS.api.apUrl + '/DirectAlarm';//保存
var getSinglesUrl=ECS.api.apUrl + '/AutomaticMonitoring';//查询
var accptUrl=ECS.api.apUrl + '/DirectAlarm/mobileEvent';//点受理
var riskRankUrl=ECS.api.bcUrl + '/riskRank/getListRiskRank?inUse=1';//预警等级
var eventLvlIdUrl=ECS.api.apUrl + '/DirectAlarm/eventLvl';//事故等级
var accCategoryUrl = ECS.api.bcUrl+"/accidentCategory/list"; //事故大类
var accTypeUrl = ECS.api.bcUrl+"/accidentCategory/accidentType";//事故小类
var keyWordUrl = ECS.api.apUrl+"/AutomaticMonitoring/getKeywordReList?keyWordreCode=AP_AC_FAE_R";//补充下拉
var getGisUrl = ECS.api.gisSurfaceUrl;//gis交互接口
var gisenterpriseId="";//点击gis获取企业id
var gisdrtDeptId="";
var gisoptlRiskZoneId="";
var initeventId="";
var gisriskAreaId="";
var gisriskAnlsObjId="";
var gispointId="";
var cancelReason="";//取消原因
var curIP="";
var addSum="";//警情摘要
var alarmNum="";//报警电话
var answerNum="";//接警电话
window.pageLoadMode = PageLoadMode.None;
$(function(){
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page={
        //页面初始化
        init:function(){
            this.bindUI();
            mini.parse();
            page.logic.cbxRiskRank();//预警等级
            page.logic.cbxAccidentCategory();//事故大类
            page.logic.cbxKeyWord();//补充信息下拉
            page.logic.getGisValue();//点击gis获取位置
        },
        table:{},
        //绑定事件和逻辑
        bindUI:function(){
            //开始受理
            $("#btnAccept").click(function () {
                window.parent.page.logic.answer();
                $("#mobileOrPhone").val(alarmNum);
                var acceptList={};
                acceptList["mobileOrPhone"]=alarmNum;
                acceptList["seatIp"]=curIP;
                $.ajax({
                    url: accptUrl+"?now=" + Math.random(),
                    async: false,
                    type: "POST",
                    data: JSON.stringify(acceptList),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (result) {
                        result = JSON.parse(result);
                        initeventId=result.result.eventId;
                        $('#btnAccept').attr('disabled', true);
                        $('#btnCancle').attr('disabled', false);
                        $('#btnAlarm').attr('disabled', false);
                        ECS.hideLoading();
                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            });
            //补充信息展开隐藏
            $("#infoList").hover(function(){
                $("#nav_submenu").css("display","table").stop();
            },function(){
                $("#nav_submenu").stop().hide();
            });
            //补充信息赋值
            $("#nav_submenu").on("click","li",function () {
                var str=$("#information").val();
                $("#information").val(str+$(this).attr("title")+"  ");
            });
            //事故等级
            $(document).on("change",'#eventLvlId',function(){
                var selectVal=$("#eventLvlId").find("option:selected").attr("code");
                layer.confirm('你确认事故等级是'+selectVal+'吗？', {
                    btn: ['确定','取消'] //按钮
                }, function(index){
                    layer.close(index);
                    page.logic.cbxInfo();
                }, function(){
                    $("#eventLvlId").val("7");
                });
            });
            //人员受伤填写提示
            $("#casualtyCount").blur(function () {
                this.value=this.value.replace(/\D/g,'');
                if(this.value){
                    layer.confirm('你确认人员受伤是'+this.value+'人吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        layer.close(index);
                    }, function(){
                        $("#casualtyCount").val("");
                    });
                }
            });
            //人员死亡填写提示
            $("#dieCount").blur(function () {
                this.value=this.value.replace(/\D/g,'');
                if(this.value){
                    layer.confirm('你确认人员死亡是'+this.value+'人吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        layer.close(index);
                    }, function(){
                        $("#dieCount").val("");
                    });
                }
            });
            //财产损失提示
            $("#propertyLossCount").blur(function () {
                this.value=this.value.replace(/\D/g,'');
                if(this.value){
                    layer.confirm('您确定财产损失是'+this.value+'万元吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        layer.close(index);
                    }, function(){
                        $("#propertyLossCount").val("");
                    });
                }
            });
            //接警
            $("#btnAlarm").click(function(){
                page.logic.save("");
            });
            //取消
            $("#btnCancle").click(function(){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['500px', '300px'],
                    skin: 'new-class',
                    title: false,
                    shadeClose: false,
                    content: '../AutomaticMonitoring/ReasonCancellation.html?' + Math.random(),
                    success: function(layero,index){
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "title":"取消原因"
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (cancelReason) {
                            page.logic.save("1");
                        }
                    }
                });
            });
            //地址改变时 接警摘要一起变
            $("#eventAddress").blur(function () {
                addSum=$("#eventAddress").val();
                page.logic.cbxInfo();
            });
        },
        data:{//定义参数
            param:{}
        },
        //定义业务逻辑方法
        logic:{
            setData: function (data) {
                ECS.sys.RefreshContextFromSYS();
                $("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_zjdxgis/index_ptquery.html?iframe=true&show_info=false&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));
                curIP=data.curIP;
                alarmNum=data.alarmNum;
                answerNum=data.answerNum;
                page.logic.cbxEventLvl();//事故等级
                if(data.mode){
                    $('#btnAccept').attr('disabled', true);
                    $('#btnCancle').attr('disabled', false);
                    $('#btnAlarm').attr('disabled', false);
                    initeventId=data.eventId;
                    $("#mobileOrPhone").val(alarmNum);
                    $.ajax({
                        url: getSinglesUrl + "?eventId="+initeventId,
                        type: "get",
                        async: true,
                        dataType: "json",
                        success: function (data) {
                            gisenterpriseId=data.enterpriseId;
                            gisdrtDeptId=data.drtDeptId;
                            gisriskAreaId=data.riskAreaId;
                            gisoptlRiskZoneId=data.optlRiskSoneId;
                            gisriskAnlsObjId=data.riskAnlsObjId;
                            gispointId=data.pointId;
                            addSum = data.eventAddress;
                            if(data.eventAddress){
                                $("#eventAddress").attr("readonly",false);
                            }else{
                                $("#eventAddress").attr("readonly",true);
                            }
                            ECS.form.setData('AddOrEditModal', data);
                            //初始化选定gis
                            if(gisoptlRiskZoneId){
                                page.logic.getList("4",gisoptlRiskZoneId,"作业风险区");
                            }else if(gisriskAreaId){
                                page.logic.getList("3",gisriskAreaId,"安全风险区");
                            }else if(gisdrtDeptId){
                                page.logic.getList("2",gisdrtDeptId,"二级单位");
                            }else if(gisenterpriseId){
                                page.logic.getList("1",gisenterpriseId,"企业");
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }
            },
            /**
             * 预警等级
             */
            cbxRiskRank:function(){
                ECS.ui.getCombobox("riskRankId", riskRankUrl+"&enterpriseCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE, {
                    selectValue: "-1",
                    keyField: "riskRankID",
                    valueField: "rankDisplay",
                    async:false
                }, null);
            },
            /**
             * 事故等级
             */
            cbxEventLvl:function(){
                ECS.ui.getCombobox("eventLvlId", eventLvlIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE, {
                    selectValue: "7",
                    keyField: "eventLvlId",
                    valueField: "eventLvlName",
                    codeField: "eventLvlName",
                    async:false
                }, null);
            },
            //警情摘要
            cbxInfo:function(){
                var myDate = new Date;
                var year = myDate.getFullYear();//获取当前年
                var yue = myDate.getMonth()+1;//获取当前月
                var date = myDate.getDate()<10?"0"+myDate.getDate():myDate.getDate();//获取当前日
                var hours = myDate.getHours()<10?"0"+myDate.getHours():myDate.getHours();//时
                var minutes = myDate.getMinutes()<10?"0"+myDate.getMinutes():myDate.getMinutes();//分
                var second = myDate.getSeconds()<10?"0"+myDate.getSeconds():myDate.getSeconds();//秒
                if(yue<10){
                    yue="0"+yue;
                }
                var accidentCategory="";
                var accidentType="";
                var eventLvl=$("#eventLvlId option:selected").text();
                if($("#accidentCategoryId").val()=="-1"){
                    accidentCategory="";
                }else{
                    accidentCategory=$("#accidentCategoryId option:selected").text();
                }
                if($("#accidentTypeId").val()=="-1"){
                    accidentType="";
                }else{
                    accidentType=$("#accidentTypeId option:selected").text();
                }
                if(addSum==null){
                    addSum="";
                }
                $("#eventSummary").val("接警信息："+year+"年"+yue+"月"+date+"日"+" "+hours+":"+minutes+":"+second+"  "+addSum+
                    eventLvl+ accidentCategory+accidentType);
            },
            //补充信息下拉
            cbxKeyWord:function(){
                $.ajax({
                    url: keyWordUrl,
                    type: "get",
                    dataType: "json",
                    success: function (result) {
                        if(result.length>0){
                            for(var i=0;i<result.length;i++){
                                $("#nav_submenu").append("<li title='"+result[i].keyWordreExplain+"'>"+result[i].keyWord+"</li>");
                            }
                        }
                    }, error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //事故大类
            cbxAccidentCategory:function(){
                ECS.ui.getCombobox("accidentCategoryId", accCategoryUrl, {
                    selectValue: "-1",
                    keyField: "accidentCategoryID",
                    valueField: "accidentCategoryName",
                    async:false
                },null,page.logic.cbxAccidentType);
            },
            //事故小类
            cbxAccidentType:function(pid){
                ECS.ui.getCombobox("accidentTypeId", accTypeUrl, {
                    selectValue: "-1",
                    keyField: "accidentTypeID",
                    valueField: "accidentTypeName",
                    async:false,
                    data:{
                        "accidentCategoryID":pid
                    }
                },null,page.logic.cbxInfo);
                page.logic.cbxInfo();
            },
            //初始化定位gis
            getList:function(value,id,name){
                if(id){
                    $.ajax({
                        url: getGisUrl+"/surface/type/"+value+"/alarm/"+id+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async: false,
                        type: "get",
                        dataType: "json",
                        success: function (result) {
                            if(result.length>0){
                                var data = {"layerName":name,"id":result[0].gisSurfaceId};
                            }else{
                                var data = {"layerName":"","id":""};
                            }
                            setTimeout(function(){
                                var frm = document.getElementById("iframe_map");
                                var ie_chrome = frm.document;
                                if(ie_chrome == undefined){
                                    frm.contentWindow.postMessage(data, "*");
                                }else{
                                    frm.postMessage(data, "*");
                                }
                            },5000);
                        }, error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }
            },
            //点击gis传值出来
            getGisValue:function(){
                if(window.addEventListener){
                    window.addEventListener("message", page.logic.handleMessage, false);
                }else{
                    window.attachEvent("onmessage", page.logic.handleMessage);
                }
            },
            handleMessage:function(event){
                event = event || window.event;
                var type="";
                switch(event.data[0].layerName)
                {
                    case "企业":
                        type=2;
                        break;
                    case "二级单位":
                        type=3;
                        break;
                    case "安全风险区":
                        type=4;
                        break;
                    case "作业风险区":
                        type=5;
                        break;
                    default:
                        type="";
                }
                $.ajax({
                    url: getGisUrl+"/type/"+type+"/id/"+event.data[0].id+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    async: true,
                    type: "get",
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (result) {
                        var addInfo="";
                        addSum="";
                        if(result.enterpriseName){
                            addInfo+=result.enterpriseName;
                        }
                        if(result.unitName){
                            addInfo+=result.unitName;
                            addSum+=result.unitName;
                        }
                        if(result.riskAreaName){
                            addInfo+=result.riskAreaName;
                            addSum+=result.riskAreaName;
                        }
                        if(result.optlRiskZoneName){
                            addInfo+=result.optlRiskZoneName;
                            addSum+=result.optlRiskZoneName;
                        }
                        gisenterpriseId=result.enterpriseId;
                        gisdrtDeptId=result.unitId;
                        gisriskAreaId=result.riskAreaId;
                        gisoptlRiskZoneId=result.optlRiskZoneId;
                        gisriskAnlsObjId="";
                        gispointId="";
                        $("#eventAddress").val(addInfo);
                        if(addInfo){
                            $("#eventAddress").attr("readonly",false);
                        }else{
                            $("#eventAddress").attr("readonly",true);
                        }
                        page.logic.cbxInfo();
                        ECS.hideLoading();
                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 保存
             */
            save: function (status) {
                if($("#riskRankId").val()=="-1"){
                    $("#riskRankId").val("");
                }
                if($("#accidentCategoryId").val()=="-1"){
                    $("#accidentCategoryId").val("");
                }
                if($("#accidentTypeId").val()=="-1"){
                    $("#accidentTypeId").val("");
                }
                if(status!=1){
                    page.logic.formValidate();
                    if (!$('#AddOrEditModal').valid()) {
                        return;
                    }
                }
                var data = ECS.form.getData('AddOrEditModal');
                data["eventId"]=initeventId;
                data["enterpriseId"]=gisenterpriseId;
                data["drtDeptId"]=gisdrtDeptId;
                data["riskAreaId"]=gisriskAreaId;
                data["optlRiskSoneId"]=gisoptlRiskZoneId;
                data["riskAnlsObjId"]=gisriskAnlsObjId;
                data["pointId"]=gispointId;
                data["alarmTelStatus"]="2";
                data["eventType"]="0";
                data["eventSource"]="1";
                data["isDelete"]="0";
                data["sortNum"]="1";
                data["pushStatus"]="1";
                data["seatIp"]=curIP;
                data["eventSummary"]+=data.information;
                var casualtyEntityList=[];
                var propertyLossEntityList=[];
                if($("#casualtyCount").val()){
                    casualtyEntityList.push({
                        "eventId":initeventId,
                        "casualtyTypeCode":"AP_AC_WOUNDED",
                        "casualtyCount":$("#casualtyCount").val(),
                        "sortNum":"1",
                        "casualtyDiscription":"受伤",
                        "isDelete":"0"
                    });
                }
                if($("#dieCount").val()){
                    casualtyEntityList.push({
                        "eventId":initeventId,
                        "casualtyTypeCode":"AP_AC_DEATH",
                        "casualtyCount":$("#dieCount").val(),
                        "sortNum":"1",
                        "casualtyDiscription":"死亡",
                        "isDelete":"0"
                    });
                }
                data["casualtyEntityList"]=casualtyEntityList;
                if($("#propertyLossCount").val()){
                    propertyLossEntityList.push({
                        "eventId":initeventId,
                        "propertyLossTypeCode":"AP_AC_OTHER",
                        "propertyLossMoney":$("#propertyLossCount").val(),
                        "sortNum":"1",
                        "propertyLossDiscription":"财产损失",
                        "isDelete":"0"
                    });
                }
                data["propertyLossEntityList"]=propertyLossEntityList;
                delete data["casualtyCount"];
                delete data["dieCount"];
                delete data["propertyLossCount"];
                delete data["information"];
                if(status=="1"){
                    data["alarmTelStatus"]="1";
                    data["eventSummary"]+=cancelReason;
                    data["cancelReason"]=cancelReason;
                    $.ajax({
                        url: addUrl,
                        async: false,
                        type: "PUT",
                        data: JSON.stringify(data),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (result) {
                            parent.hasArlamId={"eventId":initeventId,"ip":curIP,"isAlram":false};
                            parent.layer.close(index);
                            ECS.hideLoading();
                        }, error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                    return;
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: "PUT",
                    data: JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (result) {
                        result = JSON.parse(result);
                        parent.hasArlamId={"eventId":initeventId,"ip":curIP,"isAlram":true};
                        parent.layer.close(index);
                        ECS.hideLoading();
                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        riskRankId:{
                            required: true
                        },
                        mobileOrPhone:{
                            required: true
                        },
                        accidentCategoryId:{
                            required: true
                        },
                        accidentTypeId:{
                            required: true
                        },
                        eventAddress: {
                            required: true
                        },
                        alertsPersonInfo: {
                            required: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});
