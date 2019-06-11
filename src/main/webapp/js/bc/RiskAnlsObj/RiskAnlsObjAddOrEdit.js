var addUrl = ECS.api.bcUrl + '/riskAnlsObj';                                          //新增、编辑
var getSingleUrl = ECS.api.bcUrl + '/riskAnlsObj';                                   //查询单条数据
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                                   //企业、二级单位
var orgType_url = ECS.api.bcUrl + '/org/porgName';                                   //企业类型（二级单位）
var riskType_url = ECS.api.bcUrl +'/riskArea/getRiskAreaEnumList';                 //安全风险区（板块）
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj?showPleaseSelect=true';  //安全风险区分类
var riskAreaName_url = ECS.api.bcUrl +'/riskArea/getAllList';                       //安全风险区名称
var oprisktype_url = ECS.api.bcUrl + "/optlRiskZone/getOptlZoneCatgEnumList?showPleaseSelect=true"; //作业风险区类型
var oprisk_url = ECS.api.bcUrl +'/optlRiskZone/getAllList';                         //作业风险区名称
var RiskAnlsObj_url = ECS.api.bcUrl +'/riskAnlsObj/getRiskObjCatgEnumList';       //风险分析对象类型
var drtDeptPID = "";        //二级单位的pid;
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
var editUserName=[];//选择联系人
var usernameList=[];//选择联系人
var userIDList=[];//选择联系人
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var cate_dt = {};       //安全风险区分类树数据
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //点击企业菜单，二级单位联动
            mini.get("enterpriseCode").on("nodeclick",function(e){
                enterpriseCode=e.node.orgCode;
                editUserName=[];
                $("#userName").html("");
                $("#userID").val("");
                $("input[name=enterpriseCode]").next(".has-error").remove();
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            //当二级单位数据发生改变的时候，加载安全风险区名称的数据；
            mini.get("drtDeptCode").on("nodeclick",function(e){
                drtDeptCode = e.node.orgCode;
                $("input[name=drtDeptCode]").next(".has-error").remove();
                page.logic.load_risk_menu("");
            });
            //当安全风险区分类选择以后，加载安全风险区名称的数据；
            mini.get("riskAreaCatgName").on("valuechanged",function(){
                $("input[name=riskAreaCatgName]").next(".has-error").remove();
                page.logic.load_risk_menu("");
            });
            //当安全风险区名称选择以后，加载作业风险区名称的数据；
            mini.get("riskAreaID").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("riskAreaID").setValue("-1");
                    riskAreaID="";
                }else{
                    riskAreaID = e.selected.riskAreaID;
                }
                $("input[name=riskAreaID]").next(".has-error").remove();
                page.logic.load_optrisk_menu("");//加载作业风险区名称
            });
            //当作业风险区类型选择以后，加载作业风险区名称的数据
            $("#zoneCatg").change(function(){
                page.logic.load_optrisk_menu("");
            });
            //作业风险区名称选择以后，加载风险分析对象名称
            mini.get("optlRiskName").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("optlRiskName").setValue("-1");
                    optlRiskZoneID="";
                }else{
                    optlRiskZoneID = e.selected.optlRiskZoneID;
                }
                $("input[name=optlRiskName]").next(".has-error").remove();
            });
            //人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details)
            });
            //安全名称\作业名称\对象名称置灰
            mini.get("riskAreaID").disable();
            mini.get("optlRiskName").disable();
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
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaCatgName").getCheckedNodes(true);
                if(cate_arr.length>0){
                    for(var i=0;i<cate_arr.length;i++){
                        (function(cur_data){
                            //小类
                            if(cur_data.categID.indexOf("sm")!=-1){
                                data["areaSmCatg"]=cur_data.code;
                            }
                            //中类
                            if(cur_data.categID.indexOf("md")!=-1){
                                data["areaMdCatg"]=cur_data.code;
                            }
                            //大类
                            if(cur_data.categID.indexOf("bg")!=-1){
                                data["areaBgCatg"]=cur_data.code;
                            }
                        })(cate_arr[i]);
                    }
                }else{
                    //当弹框处于编辑状态时，才有值；
                    if (pageMode == PageModelEnum.Edit) {
                        //当用户没有自动选择时，默认获取编辑里的数据
                        data["areaBgCatg"]=cate_dt["areaBgCatg"];   //大类
                        data["areaMdCatg"]=cate_dt["areaMdCatg"];    //中类
                        data["areaSmCatg"]=cate_dt["areaSmCatg"];    //小类
                    }
                }
                delete data.riskAreaCatgName;     //删除安全风险区分类多余的字段；
                //二级单位PID、二级单位的编码、
                if(mini.get("drtDeptCode").getSelectedNode()){
                    data["drtDeptPID"] = mini.get("drtDeptCode").getSelectedNode().orgPID;
                    data["drtDeptCode"] = mini.get("drtDeptCode").getSelectedNode().orgCode;
                }else{
                    data["drtDeptPID"] = drtDeptPID;
                    data["drtDeptCode"] = drtDeptCode;
                }
                //企业的编码
                data["enterpriseCode"] = enterpriseCode;
                //作业风险区id;
                data["optlRiskZoneID"] = optlRiskZoneID;
                data["riskAreaID"] = riskAreaID;
                //风险分析对象类型
                data["riskAnlsObjCatg"] = $("#riskAnlsObjCatg").find("option:selected").val();
                if(data.userID){
                    var userEntity=[];
                    for(var i=0;i<data.userID.split(",").length;i++){
                        userEntity.push({"userID":data.userID.split(",")[i]});
                    }
                    data["userEntity"]=userEntity;
                }
                delete data.userID;
                delete data.userName;
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
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
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
                })
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                //获取用户的相关数据
                ECS.sys.RefreshContextFromSYS();
                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    //企业
                    page.logic.get_list(orgType_url,$("#enterpriseCode"));
                    //安全风险区类型（板块）
                    page.logic.select_option(riskType_url,$("#riskAreaCatg"));
                    //加载安全风险区分类的数据；
                    page.logic.select_option(riskType_url2+"&riskAreaCatg=S",$("#riskAreaCatgName"),"ww");
                    //作业风险区类型
                    page.logic.select_option(oprisktype_url,$("#zoneCatg"));
                    //风险分析对象类型
                    page.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));
                    //当安全风险区板块选择以后，加载安全风险区分类和名称的数据；
                    $("#riskAreaCatg").change(function(){
                        page.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"xx");
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    return;
                }else if (pageMode == PageModelEnum.Edit) {
                    //将开发设计当中的下拉框设置为不可编辑状态；
                    mini.get("enterpriseCode").disable();               //企业
                    mini.get("drtDeptCode").disable();                  //二级单位
                    //安全风险区板块
                    $("#riskAreaCatg").attr("disabled","disabled");
                    //安全风险区分类
                    mini.get("riskAreaCatgName").disable();
                    //作业风险区类型
                    $("#zoneCatg").attr("disabled","disabled");
                    //作业风险区名称
                    $("#optlRiskName").attr("disabled","disabled");
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.riskAnlsObjID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        mini.get("sortNum").setValue(data.sortNum);
                        //企业、二级单位的数据存储
                        mini.get("enterpriseCode").setValue(data.orgSname);                //设置企业的名称；
                        enterpriseCode = data.enterpriseCode;                             //企业的编码
                        mini.get("drtDeptCode").setValue(data.drtDeptSname);   //设置二级单位的名称；
                        drtDeptCode = data.drtDeptCode;                                    //存储二级单位的编码；
                        // 二级单位的父级id;（若有，就存储，若无，就不要；）
                        if(data.drtDeptPID){
                            drtDeptPID = data.drtDeptPID;
                        }
                        optlRiskZoneID=data.optlRiskZoneID;
                        //安全风险区板块
                        page.logic.create_option($("#riskAreaCatg"),data.riskAreaCatg,data.riskAreaCatgName);
                        //安全风险区分类
                        if(data.bgCategName && data.mdCategName && data.smCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName+","+data.mdCategName+","+data.smCategName);
                        }else if(data.bgCategName && data.mdCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName+","+data.mdCategName);
                        }else if(data.bgCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName);
                        }
                        cate_dt["areaBgCatg"]=data.areaBgCatg?data.areaBgCatg:"";    //大类
                        cate_dt["areaMdCatg"]=data.areaMdCatg?data.areaMdCatg:"";    //中类
                        cate_dt["areaSmCatg"]=data.areaSmCatg?data.areaSmCatg:"";    //小类
                        //安全风险区名称
                        page.logic.load_risk_menu(data.riskAreaCode,data.riskAreaSname);
                        //作业风险区类型
                        page.logic.create_option($("#zoneCatg"),data.zoneCatg,data.zoneCatgName);
                        //作业风险区名称
                        page.logic.load_optrisk_menu(data.optlRiskCode,data.optlRiskSname);
                        //风险分析对象类型（分类）
                        page.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"),function(){
                            $("#riskAnlsObjCatg").val(data.riskAnlsObjCatg);
                        });
                        //风险分析对象名称
                        page.logic.create_option($("#riskAnlsObjName"),data.riskAnlsObjCode,data.riskAnlsObjName);
                        //联系人
                        editUserName=[];
                        usernameList=[];
                        userIDList=[];
                        if(data.userEntity){
                            for(var i=0;i<data.userEntity.length;i++){
                                usernameList+=data.userEntity[i].userName+'<br/>';
                                userIDList.push(data.userEntity[i].userID);
                                editUserName.push(data.userEntity[i].userName);
                            }
                            // $("#userName").val(usernameList);
                            $("#userName").html(usernameList);
                            $("#userID").val(userIDList);
                        }
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
            load_optrisk_menu:function(id,value){
                if(id){
                    mini.get("optlRiskName").load([{name: value, optlRiskZoneID: id}]);
                    mini.get("optlRiskName").setValue(id);
                    return;
                }
                var zoneCate = $("#zoneCatg").val();//作业风险区类型；
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    var cur_url = oprisk_url+"?riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate;
                    page.logic.selectCombox(cur_url,"#optlRiskName");//作业风险区名称
                    mini.get("optlRiskName").enable();
                }else{
                    mini.get("optlRiskName").disable();
                    mini.get("optlRiskName").setValue("-1");
                }
            },
            //安全风险区名称的数据加载
            load_risk_menu:function(code,value){
                if(code){
                    mini.get("riskAreaID").load([{riskAreaName: value, riskAreaCode: code}]);
                    mini.get("riskAreaID").setValue(code);
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
                    page.logic.selectCombox(cur_url,"#riskAreaID");//安全风险区
                    mini.get("riskAreaID").enable();
                }else{
                    mini.get("riskAreaID").disable();
                    mini.get("riskAreaID").setValue("-1");
                }
                mini.get("optlRiskName").disable();
                mini.get("optlRiskName").setValue("-1");
            },
            //人员选择
            selectOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../RiskAnalysisPoint/SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "userId":$("#userID").val(),
                            "orgCode":enterpriseCode,
                            "userName":editUserName
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        editUserName=[];
                        usernameList=[];
                        userIDList=[];
                        for(var obj in window.ownDetail){
                            usernameList+=window.ownDetail[obj]+'<br/>';
                        }
                        for (var i in window.ownDetail){
                            editUserName.push(window.ownDetail[i]);
                        }
                        for (var i in window.ownDetail){
                            userIDList.push(i);
                        }
                        // $("#userName").val(usernameList);
                        $("#userName").html(usernameList);
                        $("#userID").val(userIDList);
                    }
                })
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
                            //企业树级菜单
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
                })
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    async:false,
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
                                    //安全风险区类型、风险分析对象类型；
                                    if(cur_key.key || cur_key.key==0){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            cb && cb();
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
            },
            formValidate: function () {
                jQuery.validator.addMethod("ucode",
                    function(value,element,params){
                        var exp = new RegExp(params);
                        return exp.test(value);
                    },"只能输入字母和数字!");
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        enterpriseCode: {
                            required: true
                        },
                        drtDeptCode: {
                            required: true
                        },
                        riskAreaCatg: {
                            required: true
                        },
                        riskAreaID: {
                            required: true
                        },
                        optlRiskName: {
                            required: true
                        },
                        riskAnlsObjCatg: {
                            required: true
                        },
                        name: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        code: {
                            required: true,
                            rangelength: [0, 200],
                            ucode:/^[A-Za-z0-9]+$/
                        },
                        sortNum: {
                            required: true,
                            digits: true,
                            min: 0
                        }
                    }
                })
            }
        }
    }
    page.init();
    window.page = page;
})