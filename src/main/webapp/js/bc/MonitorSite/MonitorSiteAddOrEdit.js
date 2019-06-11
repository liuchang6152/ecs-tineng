var addUrl = ECS.api.bcUrl + '/monitorSite';                                          //新增、编辑
var getSingleUrl = ECS.api.bcUrl + '/monitorSite';                                   //查询单条数据
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                                   //企业、二级单位
var orgType_url = ECS.api.bcUrl + '/org/porgName';                                   //企业类型（二级单位）
var riskType_url = ECS.api.bcUrl +'/riskArea/getRiskAreaEnumList';                 //安全风险区（板块）
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj?showPleaseSelect=true'; //安全风险区分类
var riskAreaName_url = ECS.api.bcUrl +'/riskArea/getAllList';                       //安全风险区名称
var oprisktype_url = ECS.api.bcUrl + "/optlRiskZone/getOptlZoneCatgEnumList?showPleaseSelect=true";     //作业风险区类型
var oprisk_url = ECS.api.bcUrl +'/optlRiskZone/getAllList?showPleaseSelect=true';                         //作业风险区名称
var RiskAnlsObj_url = ECS.api.bcUrl + '/riskAnlsObj/getRiskObjCatgEnumList?showPleaseSelect=true';      //风险分析对象类型
var RiskAnlsObjName_url = ECS.api.bcUrl + '/riskAnlsObj/getAllList?showPleaseSelect=true';               //风险分析对象名称
var CheckType_url =  ECS.api.bcUrl + '/monitorSite/type';                           //检测类型
var System_url = ECS.api.bcUrl + '/monitorSite/system';                             //系统标识
var mesureUnit_url = ECS.api.bcUrl + '/monitorSite/unit';                          // 测量单位
var rapName_url =  ECS.api.bcUrl + '/riskAnalysisPoint/rapNameList';              //风险分析点名称（下拉框）
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
var optlRiskZoneCode="";//作业风险区名称编码
var riskAnlsObjCode="";//风险分析对象名称编码
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            ECS.sys.RefreshContextFromSYS();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            $('#isFireAlarm').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                data['pointID'] = $("#pointID").find("option:selected").attr("att_id"); //风险分析点名称id；
                delete data['riskAreaCatgName'];     //删除安全风险区分类多余的字段；
                delete data['drtDeptCode'];     //二级单位code;
                delete data['enterpriseCode']; //企业编码
                delete data['optlRiskZoneName'];  //作业风险区名称
                delete data['riskAnlsObjCatg'];   //风险分析对象类型
                delete data['riskAnlsObjName'];   //风险分析对象名称
                delete data['riskAnlsObjCatg'];   //风险分析对象类型
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:$.param(data),
                    dataType: "text",
                    success: function (result) {
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    }, error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                mini.parse();
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                //系统标识
                page.logic.select_option(System_url,$("#systemUID"));
                //检测类型
                page.logic.select_option(CheckType_url,$("#monitorTypeID"));
                //测量单位
                page.logic.select_option(mesureUnit_url,$("#paramMesUnitID"));
                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    //企业
                    page.logic.get_list(orgType_url,$("#enterpriseCode"));
                    //点击企业菜单，二级单位联动
                    mini.get("enterpriseCode").on("nodeclick",function(e){
                        enterpriseCode = e.node.orgCode;
                        $("input[name=enterpriseCode]").next(".has-error").remove();
                        page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
                    });
                    //二级单位联动安全风险区名称
                    mini.get("drtDeptCode").on("nodeclick",function(e){
                        drtDeptCode = e.node.orgCode;
                        $("input[name=drtDeptCode]").next(".has-error").remove();
                        page.logic.load_risk_menu("");
                    });
                    //安全风险区类型（板块）
                    page.logic.select_option(riskType_url,$("#riskAreaCatg"));
                    //加载安全风险区分类的数据；
                    page.logic.select_option(riskType_url2+"&riskAreaCatg=S",$("#riskAreaCatgName"),"xx");
                    //当安全风险区板块选择以后，加载安全风险区分类和名称的数据；
                    $("#riskAreaCatg").change(function(){
                        page.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"xx");
                    });
                    //作业风险区类型
                    page.logic.select_option(oprisktype_url,$("#zoneCatg"));
                    //风险分析对象类型
                    page.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));
                    //当安全风险区分类选择以后，加载安全风险区名称的数据；
                    mini.get("riskAreaCatgName").on("valuechanged",function(){
                        $("input[name=riskAreaCatgName]").next(".has-error").remove();
                        page.logic.load_risk_menu("");
                    });
                    //当安全风险区名称选择以后，加载作业风险区名称
                    mini.get("riskAreaName").on("valuechanged",function(e){
                        if(e.value==""||e.value=="-1"){
                            mini.get("riskAreaName").setValue("-1");
                            riskAreaID="";
                        }else{
                            riskAreaID = e.selected.riskAreaID;
                        }
                        $("input[name=riskAreaName]").next(".has-error").remove();
                        page.logic.load_optrisk_menu("");//加载作业风险区名称
                        page.logic.load_rapNameList();    //加载风险分析点名称的数据；
                    });
                    //当作业风险区类型选择以后，加载作业风险区名称的数据
                    $("#zoneCatg").change(function(){
                        page.logic.load_optrisk_menu("");
                    });
                    //作业风险区名称选择
                    mini.get("optlRiskZoneName").on("valuechanged",function(e){
                        if(e.value==""||e.value=="-1"){
                            mini.get("optlRiskZoneName").setValue("-1");
                            optlRiskZoneID="";
                            optlRiskZoneCode="";
                        }else{
                            optlRiskZoneID = e.selected.optlRiskZoneID;
                            optlRiskZoneCode = e.selected.code;
                        }
                        $("input[name=optlRiskZoneName]").next(".has-error").remove();
                        page.logic.load_rapNameList(); //风险分析点名称的数据
                        page.logic.load_rapTypeNameList("");   //风险分析对象名称的数据
                    });
                    //风险分析对象类型选择以后，加载风险分析对象名称的数据
                    $("#riskAnlsObjCatg").change(function(){
                        page.logic.load_rapTypeNameList("");   //加载风险分析对象名称的数据
                    });
                    //风险分析对象名称选择以后，加载风险分析点名称的数据；
                    mini.get("riskAnlsObjName").on("valuechanged",function(e){
                        $("input[name=riskAnlsObjName]").next(".has-error").remove();
                        if(e.value==""||e.value=="-1"){
                            riskAnlsObjCode="";
                        }else{
                            riskAnlsObjCode = e.selected.code;
                        }
                        page.logic.load_rapNameList();
                    });
                    //安全名称\作业名称\对象名称置灰
                    mini.get("riskAreaName").disable();
                    mini.get("optlRiskZoneName").disable();
                    mini.get("riskAnlsObjName").disable();
                    return;
                }else if (pageMode == PageModelEnum.Edit) {
                    //不可编辑状态；
                    mini.get("enterpriseCode").disable();//企业
                    mini.get("drtDeptCode").disable(); //二级单位
                    $("#riskAreaCatg").attr("disabled","disabled");//安全风险区板块
                    mini.get("riskAreaCatgName").disable();//安全风险区分类
                    //安全名称\作业名称\对象名称置灰
                    mini.get("riskAreaName").disable();
                    mini.get("optlRiskZoneName").disable();
                    mini.get("riskAnlsObjName").disable();
                    $("#zoneCatg").attr("disabled","disabled");//作业风险区类型
                    $("#riskAnlsObjCatg").attr("disabled","disabled");//风险分析对象类型
                    $("#pointID").attr("disabled","disabled");//风险分析点名称
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.siteID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        mini.get("sortNum").setValue(data.sortNum);
                        //企业、二级单位的数据存储
                        mini.get("enterpriseCode").setValue(data.enterpriseSname);         //设置企业的名称；
                        enterpriseCode = data.enterpriseCode;                             //企业的编码
                        mini.get("drtDeptCode").setValue(data.drtDeptName);               //设置二级单位的名称；
                        drtDeptCode = data.drtDeptCode;                                    //存储二级单位的编码；
                        //安全风险区板块
                        page.logic.create_option($("#riskAreaCatg"),data.riskAreaCatg,data.riskAreaCatgValue);
                        //安全风险区分类
                        mini.get("riskAreaCatgName").setValue(data.riskAreaCatgName);
                        //安全风险区名称
                        page.logic.load_risk_menu(data.areaCode,data.areaName);
                        //作业风险区类型
                        page.logic.create_option($("#zoneCatg"),(data.zoneCatg?data.zoneCatg:""),data.zoneCatgName);
                        //作业风险区名称
                        page.logic.load_optrisk_menu(data.optlRiskZoneCode,data.optlRiskZoneName);
                        //风险分析对象类型
                        page.logic.create_option($("#riskAnlsObjCatg"),data.riskAnlsObjCatg,data.riskAnlsObjCatgName);
                        //风险分析对象名称
                        page.logic.load_rapTypeNameList(data.riskAnlsObjCode,data.riskAnlsObjName);
                        //风险分析点名称
                        page.logic.create_option($("#pointID"),data.rapCode,data.rapName,data.pointID);
                        $("#systemUID").val(data.systemUID);
                        $("#paramMesUnitID").val(data.paramMesUnitID);
                        //位号编码
                        $("#siteNumber").val(data.siteNumber);
                        $("#isFireAlarm").iCheck('update');
                        //是否启用
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //编辑详情，默认填充下拉框；
            create_option:function($oPar,id,value,cur_id){
                var $option = null;
                if(cur_id){
                    $option = $('<option value="'+id+'" att_id="'+cur_id+'">'+value+'</option>');
                }else{
                    $option = $('<option value="'+id+'">'+value+'</option>');
                }
                $oPar.append($option);
                $oPar.val(id);
            },
            //风险分析点名称的数据加载
            load_rapNameList:function(){
                //安全风险区名称id;
                var Rap_url = rapName_url+"?riskAreaID="+riskAreaID+"&riskCode="+optlRiskZoneCode+"&anlsObjCode="+riskAnlsObjCode;
                // //若安全风险区名称没有值时，那么不再查询风险分析点名称的数据；
                if(!riskAreaID){
                    return false;
                }
                $.ajax({
                    url:Rap_url,
                    type:"GET",
                    success:function (Data) {
                        $("#pointID").html("");    //清空列表
                        //加载成功以后，进行渲染；
                        for(var w=0;w<Data.length;w++){
                            (function(cur_key){
                                if(cur_key.valueName){
                                    $oPtion = $('<option title="'+cur_key.valueName+'" value="'+cur_key.keyCode+'" att_id="'+cur_key.keyId+'">'+cur_key.valueName.substring(0,20)+'</option>')
                                    $("#pointID").append($oPtion);
                                }
                            })(Data[w]);
                        }
                    }
                });
            },
            //风险分析对象名称的菜单数据加载
            load_rapTypeNameList:function(code,value){
                if(code){
                    mini.get("riskAnlsObjName").load([{name: value, code: code}]);
                    mini.get("riskAnlsObjName").setValue(code);
                    return;
                }
                var riskAnlsObjCatg = $("#riskAnlsObjCatg").val(),//风险分析对象类型id；
                    RapTypeName_url = RiskAnlsObjName_url+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+riskAnlsObjCatg;
                if(optlRiskZoneID){//作业风险区名称id
                    page.logic.selectCombox(RapTypeName_url,"#riskAnlsObjName");//风险分析对象名称
                    mini.get("riskAnlsObjName").enable();
                    if(value){
                        mini.get("riskAnlsObjName").setValue(value);
                        mini.get("riskAnlsObjName").disable();
                    }
                }else{
                    mini.get("riskAnlsObjName").disable();
                    mini.get("riskAnlsObjName").setValue("-1");
                }
            },
            //作业风险区名称的数据加载
            load_optrisk_menu:function(code,value){
                if(code){
                    mini.get("optlRiskZoneName").load([{name: value, code: code}]);
                    mini.get("optlRiskZoneName").setValue(code);
                    return;
                }
                var zoneCate = $("#zoneCatg").val();//作业风险区类型；
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    var cur_url = oprisk_url+"&riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate;
                    page.logic.selectCombox(cur_url,"#optlRiskZoneName");//作业风险区名称
                    mini.get("optlRiskZoneName").enable();
                }else{
                    mini.get("optlRiskZoneName").disable();
                    mini.get("optlRiskZoneName").setValue("-1");
                }
                mini.get("riskAnlsObjName").disable();
                mini.get("riskAnlsObjName").setValue("-1");
            },
            //可搜索下拉框
            selectCombox:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    async:false,
                    success:function (data) {
                        mini.get(oPar).load(data);
                        mini.get(oPar).setValue("-1");
                    }
                });
            },
            //安全风险区名称的数据加载
            load_risk_menu:function(code,value){
                if(code){
                    mini.get("riskAreaName").load([{riskAreaName: value, riskAreaCode: code}]);
                    mini.get("riskAreaName").setValue(code);
                    return;
                }
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaCatgName").getCheckedNodes(true);
                var areaSmCatg = "";    //小类
                var areaMdCatg = "";    //中类
                var areaBgCatg = "";    //大类
                if(cate_arr.length>0){
                    for(var i=0;i<cate_arr.length;i++){
                        (function(cur_data){
                            if(cur_data.categID==""){
                                areaSmCatg="";
                                areaMdCatg="";
                                areaBgCatg="";
                            }else if(cur_data.categID.indexOf("sm")!=-1){
                                areaSmCatg=cur_data.code;
                            }else if(cur_data.categID.indexOf("md")!=-1){
                                areaMdCatg=cur_data.code;
                            }else if(cur_data.categID.indexOf("bg")!=-1){
                                areaBgCatg=cur_data.code;
                            }
                        })(cate_arr[i]);
                    }
                };
                var riskAreaCatg = $("#riskAreaCatg").val();
                if(drtDeptCode){
                    var cur_url = riskAreaName_url+"?enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+areaSmCatg+"&areaMdCatg="+areaMdCatg+"&areaBgCatg="+areaBgCatg+"&riskAreaCatg="+riskAreaCatg;
                    page.logic.selectCombox(cur_url,"#riskAreaName");//安全风险区
                    mini.get("riskAreaName").enable();
                }else{
                    mini.get("riskAreaName").disable();
                    mini.get("riskAreaName").setValue("-1");
                }
                mini.get("optlRiskZoneName").disable();
                mini.get("optlRiskZoneName").setValue("-1");
                mini.get("riskAnlsObjName").disable();
                mini.get("riskAnlsObjName").setValue("-1");
            },
            //企业、二级单位的联动菜单
            get_list:function(url,oPar,Pid,cb){
                if(Pid){
                    //二级单位
                    var cur_url = url+"?orgPID="+Pid+"&orgLvl=3";
                }else{
                    //企业
                    var cur_url = url+"?orgLvl=2";
                }
                $.ajax({
                    url:cur_url,
                    type:"GET",
                    success:function (Data) {
                        if(Pid){
                            //二级单位
                            mini.get("drtDeptCode").loadList(Data,"orgId","orgPID");
                            if(Data.length>0){
                                if(Data[0].orgPID){
                                    for(var w=0;w<Data.length;w++){
                                        if(Data[w].orgId==Data[0].orgPID){
                                            mini.get("drtDeptCode").setValue(Data[w].orgSname);     //默认选择第一个节点大类；
                                            drtDeptCode = Data[w].orgCode;                          //默认情况，存储第一个节点的编码；
                                        }
                                    }
                                    drtDeptPID = Data[0].orgPID;      //存储二级单位的父级节点id;
                                }else{
                                    mini.get("drtDeptCode").setValue(Data[0].orgSname);     //默认选择第一个节点大类；
                                    drtDeptCode = Data[0].orgCode;                          //默认情况，存储第一个节点的编码；
                                }
                            }
                            cb && cb();
                        }else{
                            //企业
                            mini.get("enterpriseCode").loadList(Data,"orgId","orgPID");
                            //若是企业用户，设置为不可用状态；
                            if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                                enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
                                mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                                page.logic.get_list(riskorg_url,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId);
                            }else{
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("enterpriseCode").disable();
                                for(var w=0;w<Data.length;w++){
                                    (function(cur_key){
                                        if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                            mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                            page.logic.get_list(riskorg_url,$("#drtDeptCode"),cur_key.orgId);
                                        }
                                    })(Data[w]);
                                }
                            }
                            cb && cb();
                        }
                    }
                });
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        if(cb && (typeof cb != "function")){
                            //安全风险区分类
                            mini.get("riskAreaCatgName").loadList(Data,"categID","gcategID");
                            page.logic.load_risk_menu("");
                        }else{
                            $(oPar).html("");
                            $('#riskAreaCatg').find('option[value=S]').attr("selected",true);
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //安全风险区类型、风险分析对象类型、测量单位；
                                    if(cur_key.key || cur_key.key==0){
                                        var $oPtion = $('<option title="'+cur_key.value+'" value="'+cur_key.key+'">'+cur_key.value.substring(0,20)+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            cb && cb();
                        }
                    }
                });
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function () {
                jQuery.validator.addMethod("ucode",
                    function(value,element,params){
                        var exp = new RegExp(params);
                        return exp.test(value);
                    },"请输入正确格式!");
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        enterpriseCode:{
                            required: true
                        },
                        drtDeptCode:{
                            required: true
                        },
                        riskAreaName:{
                            required: true
                        },
                        pointID:{
                            required: true
                        },
                        monitorTypeID:{
                            required: true
                        },
                        siteName: {
                            required: true
                        },
                        systemUID: {
                            required: true
                        },
                        paramMesUnitID: {
                            required: true
                        },
                        siteNumber: {
                            required: true,
                            ucode:/^[A-Za-z0-9\$\#\.\:\_\-]+$/
                        },
                        sortNum: {
                            required: true,
                            digits: true,
                            min: 0
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});