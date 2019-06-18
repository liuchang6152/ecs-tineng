var getSingleUrl=ECS.api.apUrl + '/AutomaticMonitoring';//查询、列表初始化
var addUrl=ECS.api.apUrl + '/AutomaticMonitoring';//保存
var riskRankUrl=ECS.api.bcUrl + '/riskRank/getListRiskRank?inUse=1';//预警等级
var eventLvlIdUrl=ECS.api.apUrl + '/DirectAlarm/eventLvl';//事故等级
var orgNameUrl = ECS.api.bcUrl +'/org/porgName?orgLvl=2';//企业
var accCategoryUrl = ECS.api.bcUrl+"/accidentCategory/list"; //事故大类
var accTypeUrl = ECS.api.bcUrl+"/accidentCategory/accidentType";//事故小类
var keyWordUrl = ECS.api.apUrl+"/AutomaticMonitoring/getKeywordReList?keyWordreCode=AP_AC_FAE_R";//补充下拉
var getGisUrl = ECS.api.gisSurfaceUrl;//gis交互接口
var getStatuUrl = ECS.api.apIpVerify+"/status";//关闭时请求
var acceptance = ECS.api.apIpVerify;//开始受理
var  acceptanceUrl= ECS.api.apUrl + '/AutomaticMonitoring/alarmTelStatus';//开始受理状态
var eventId="";
var uuid="";
var curIP="";
var gisenterpriseId="";//点击gis获取id
var gisdrtDeptId="";
var gisoptlRiskZoneId="";
var gisriskAreaId="";
var gisriskAnlsObjId="";
var gispointId="";
var cancelReason="";
var flag=false;//实时监测报警情况表格中是否有信息
window.pageLoadMode = PageLoadMode.None;
$(function(){
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
	var page={
		//页面初始化
		init:function(){
			this.bindUI();
            mini.parse();
            //5s更新表格数据
            setInterval('page.logic.initTable()',5000);
            page.logic.cbxKeyWord();//补充信息下拉
            page.logic.getGisValue();//点击gis获取位置
		},
		table:{},
		//绑定事件和逻辑
		bindUI:function(){
            //补充信息展开隐藏
            $("#infoList").hover(function(){
                $("#nav_submenu").css("display","table").stop();
            },function(){
                $("#nav_submenu").stop().hide();
            });
            //补充信息赋值
            $("#nav_submenu").on("click","li",function () {
                var str = $(this).attr("title");
                var text = $("#information").val();
                if(text.indexOf(str)!=-1){
                    return;
                }
                $("#information").val(text+$(this).attr("title")+"  ");
            });
            //开始受理
            $("#btnAccept").click(function () {
                $('#btnAccept').attr('disabled', true);
                $('#btnCancle').attr('disabled', false);
                $('#btnAlarm').attr('disabled', false);
                $.ajax({
                    url: acceptanceUrl +"?eventId="+eventId +"&now=" + Math.random(),
                    type: "put",
                    dataType: "text",
                    success: function () {
                        $.ajax({
                            url: acceptance +"/"+ uuid +"?ip="+curIP +"&eventId="+eventId+"&now=" + Math.random(),
                            type: "get",
                            dataType: "json",
                            success: function (result) {
                                layer.msg(result.message);
                            },
                            error: function (result) {
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        });
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            });
            //事故等级
            $(document).on("change",'select#eventLvlId',function(){
                var selectVal=$("#eventLvlId").find("option:selected").attr("code");
                if(selectVal!=undefined){
                    layer.confirm('你确认事故等级是'+selectVal+'吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(index){
                        layer.close(index);
                    }, function(){
                        $("#eventLvlId").val("7");
                    });
                }else{
                    $("#eventLvlId").val("7");
                }
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
                if(flag){
                    page.logic.save("2");
                }else{
                    layer.msg('此报警信息已无效，请取消！');
                }
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
                    content: 'ReasonCancellation.html?' + Math.random(),
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
		},
		data:{//定义参数
			param:{}
		},
		//定义业务逻辑方法
		logic:{
            setData: function (data) {
                ECS.sys.RefreshContextFromSYS();
                $("#iframe_map").attr("src",ECS.api.gisserver_url+"/all_zjdxgis/index_ptquery.html?iframe=true&show_info=false&code="+window.btoa(ECS.sys.Context.SYS_ENTERPRISE_CODE));
                page.logic.cbxRiskRank();//预警等级
                page.logic.cbxEventLvl();//事故等级
                page.logic.cbxDrtDept(); //企业名称
                page.logic.cbxAccidentCategory();//事故大类
		        if(data.mode){
                    eventId=data.eventId;
                    curIP=data.curIP;
                }else{
                    uuid=data.uuid;
                    curIP=data.curIP;
                    eventId=data.event.eventId;
                }
                $.ajax({
                    url: getSingleUrl + "?eventId="+eventId +"&now=" + Math.random(),
                    type: "get",
                    async: false,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (Data) {
                        if(data.alertRule=="2"){
                            $('#btnAccept').remove();
                            $('#btnCancle').attr('disabled', false);
                            $('#btnAlarm').attr('disabled', false);
                        }else if(Data.alarmTelStatus=="0"){
                            $('#btnAccept').attr('disabled', false);
                            $('#btnCancle').attr('disabled', true);
                            $('#btnAlarm').attr('disabled', true);
                        }else{
                            $('#btnAccept').attr('disabled', true);
                            $('#btnCancle').attr('disabled', false);
                            $('#btnAlarm').attr('disabled', false);
                        }
                        gisenterpriseId=Data.enterpriseId;
                        gisdrtDeptId=Data.drtDeptId;
                        gisriskAreaId=Data.riskAreaId;
                        gisoptlRiskZoneId=Data.optlRiskSoneId;
                        gisriskAnlsObjId=Data.riskAnlsObjId;
                        gispointId=Data.pointId;
                        if(Data.eventAddress){
                            $("#eventAddress").attr("readonly",false);
                        }else{
                            $("#eventAddress").attr("readonly",true);
                        }
                        ECS.form.setData('AddOrEditModal', Data);
                        $(".eventSummary").html(Data.eventSummary);//警情摘要
                        //加载报警位置信息表格
                        var logEntityMap=[];
                        for(var obj in Data.alertsLogEntityMap){
                            logEntityMap=logEntityMap.concat(Data.alertsLogEntityMap[obj]);
                        }
                        if(logEntityMap.length>0){
                            flag=true;
                        }else{
                            flag=false;
                        }
                        mini.get("alarm").setData(logEntityMap);
                        //加载反馈位置信息表格
                        var feedbackHtml=[];
                        for(var i=0;i<logEntityMap.length;i++){
                            feedbackHtml=feedbackHtml.concat(logEntityMap[i].sendMap);
                        }
                        mini.get("feedback").setData(feedbackHtml);
                        //初始化选定gis
                        if(Data.optlRiskSoneId){
                            page.logic.getList("5",Data.optlRiskSoneId,"作业风险区");
                        }else if(Data.riskAreaId){
                            page.logic.getList("4",Data.riskAreaId,"安全风险区");
                        }else if(Data.drtDeptId){
                            page.logic.getList("3",Data.drtDeptId,"二级单位");
                        }else if(Data.enterpriseId){
                            page.logic.getList("2",Data.enterpriseId,"企业");
                        }
                        ECS.hideLoading();
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            initTable:function(){
                $.ajax({
                    url: getSingleUrl + "?eventId="+eventId +"&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (Data) {
                        var logEntityMaps=[];
                        //加载报警信息信息表格
                        for(var obj in Data.alertsLogEntityMap){
                            logEntityMaps=logEntityMaps.concat(Data.alertsLogEntityMap[obj]);
                        }
                        if(logEntityMaps.length>0){
                            flag=true;
                        }else{
                            flag=false;
                        }
                        mini.get("alarm").setData(logEntityMaps);
                        //加载反馈位置信息表格
                        var feedbackHtml=[];
                        for(var i=0;i<logEntityMaps.length;i++){
                            feedbackHtml=feedbackHtml.concat(logEntityMaps[i].sendMap);
                        }
                        mini.get("feedback").setData(feedbackHtml);
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //表格中具体位置
            adressDetail:function(e){
		        return e.row.riskAreaName+"->"+e.row.optlRiskZoneName+"->"+e.row.riskAnlsobjName;
            },
            //应急监测点
            siteName:function(e){
		        return e.row.rapName+"->"+e.row.siteName;
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
                });
            },
            //企业名称
            cbxDrtDept:function(){
                ECS.ui.getCombobox("enterpriseId", orgNameUrl, {
                    keyField: "orgId",
                    valueField: "orgSname",
                    async:false
                });
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
                    url: getGisUrl+"/surface/type/"+type+"/id/"+event.data[0].id+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    async: true,
                    type: "get",
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (result) {
                        var addInfo="";
                        if(result.enterpriseName){
                            addInfo+=result.enterpriseName;
                        }
                        if(result.unitName){
                            addInfo+=result.unitName;
                        }
                        if(result.riskAreaName){
                            addInfo+=result.riskAreaName;
                        }
                        if(result.optlRiskZoneName){
                            addInfo+=result.optlRiskZoneName;
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
                        ECS.hideLoading();
                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            /**
             * 保存
             */
            save: function (status) {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#riskRankId").val()=="-1"){
                    $("#riskRankId").val("");
                }
                if($("#accidentCategoryId").val()=="-1"){
                    $("#accidentCategoryId").val("");
                }
                if($("#accidentTypeId").val()=="-1"){
                    $("#accidentTypeId").val("");
                }
                var data = ECS.form.getData('AddOrEditModal');
                var dataList={"alarmTelStatus":status,
                    "eventAddress":data.eventAddress,
                    "eventId":eventId,
                    "riskRankId":data.riskRankId,
                    "accidentCategoryId":data.accidentCategoryId,
                    "accidentTypeId":data.accidentTypeId,
                    "enterpriseId":gisenterpriseId,
                    "drtDeptId":gisdrtDeptId,
                    "riskAreaId":gisriskAreaId,
                    "optlRiskSoneId":gisoptlRiskZoneId,
                    "riskAnlsObjId":gisriskAnlsObjId,
                    "pointId":gispointId,
                    "eventLvlId":data.eventLvlId
                };
                var casualtyEntityList=[];
                var propertyLossEntityList=[];
                if($("#casualtyCount").val()){
                    casualtyEntityList.push({
                        "eventId":eventId,
                        "casualtyTypeCode":"AP_AC_WOUNDED",
                        "casualtyCount":$("#casualtyCount").val(),
                        "sortNum":"1",
                        "casualtyDiscription":"受伤",
                        "isDelete":"0"
                    });
                }
                if($("#dieCount").val()){
                    casualtyEntityList.push({
                        "eventId":eventId,
                        "casualtyTypeCode":"AP_AC_DEATH",
                        "casualtyCount":$("#dieCount").val(),
                        "sortNum":"1",
                        "casualtyDiscription":"死亡",
                        "isDelete":"0"
                    });
                }
                dataList["casualtyEntityList"]=casualtyEntityList;
                if($("#propertyLossCount").val()){
                    propertyLossEntityList.push({
                        "eventId":eventId,
                        "propertyLossTypeCode":"AP_AC_OTHER",
                        "propertyLossMoney":$("#propertyLossCount").val(),
                        "sortNum":"1",
                        "propertyLossDiscription":"财产损失",
                        "isDelete":"0"
                    });
                }
                dataList["propertyLossEntityList"]=propertyLossEntityList;
                if(status=="1"){
                    data["eventSummary"]+=cancelReason;
                    dataList["cancelReason"]=cancelReason;
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: "PUT",
                    data:JSON.stringify(dataList),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnAlarm').attr('disabled', true);
                        $('#btnCancle').attr('disabled', true);
                        ECS.showLoading();
                    },
                    success: function (result) {
                        //点击取消时更新计数
                        if(status=="1"){
                            $.ajax({
                                url: getStatuUrl + "?orgId="+gisenterpriseId+"&ip="+curIP +"&status=close&now=" + Math.random(),
                                type: "get",
                                dataType: "json",
                                success: function () {
                                    parent.hasArlamId={"eventId":eventId,"ip":curIP,"isAlram":false};
                                    parent.layer.close(index);
                                    ECS.hideLoading();
                                },
                                error: function (result) {
                                    $('#btnAlarm').attr('disabled', false);
                                    $('#btnCancle').attr('disabled', false);
                                    ECS.hideLoading();
                                    var errorResult = $.parseJSON(result.responseText);
                                    layer.msg(errorResult.collection.error.message);
                                }
                            });
                        }else{
                            parent.hasArlamId={"eventId":eventId,"ip":curIP,"isAlram":true};
                            parent.layer.close(index);
                            ECS.hideLoading();
                        }
                    }, error: function (result) {
                        $('#btnAlarm').attr('disabled', false);
                        $('#btnCancle').attr('disabled', false);
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
                        eventAddress:{
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
