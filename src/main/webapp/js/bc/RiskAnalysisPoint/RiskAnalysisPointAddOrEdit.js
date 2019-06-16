var addUrl = ECS.api.bcUrl+ '/riskAnalysisPoint';
var getSingleUrl =ECS.api.bcUrl + '/riskAnalysisPoint';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var drtDeptCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=3'; //二级单位
var riskAreaEnumListUrl = ECS.api.bcUrl + '/riskArea/getRiskAreaEnumList';  //安全风险区板块
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/riskArea/getCategObj';  //安全风险区分类
var riskAreaNameUrl = ECS.api.bcUrl + '/riskArea/getAllList';  //安全风险区名称
var zoneCatgUrl = ECS.api.bcUrl + '/optlRiskZone/getOptlZoneCatgEnumList?showPleaseSelect=true';//作业风险区类型
var optlRiskNameUrl = ECS.api.bcUrl + '/optlRiskZone/getAllList?showPleaseSelect=true';//作业风险区名称
var riskAnlsObjCatgUrl = ECS.api.bcUrl + '/riskAnlsObj/getRiskObjCatgEnumList?showPleaseSelect=true';//风险分析对象类型
var riskAnlsObjNameUrl = ECS.api.bcUrl + '/riskAnlsObj/getAllList?showPleaseSelect=true';//风险分析对象名称
var disasterTypeUrl=ECS.api.bcUrl +'/riskAnalysisPoint/getListByParam?param=disasterType';//事故灾难类型
var highRiskLvlUrl=ECS.api.bcUrl +'/riskAnalysisPoint/getListByParam?param=highRiskLvl';//最高风险等级
var pageMode = PageModelEnum.NewAdd;
var editUserName=[];
var usernameList=[];
var userIDList=[];
var smCatg = "";    //小类
var mdCatg = "";    //中类
var bgCatg = "";    //大类
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            page.logic.initOrgCode(enterpriseCodeUrl,$("#enterpriseCode"));//企业
            page.logic.cbxRiskAreaEnumList();//安全风险区板块
            page.logic.cbxRiskAreaType("S");//安全风险区分类
            page.logic.cbxDisasterType();//事故灾难类型
            page.logic.cbxZoneCatg();//作业风险区类型
            page.logic.cbxRiskAnlsObjCatg();//风险分析对象类型
            //安全名称\作业名称\对象名称置灰
            mini.get("riskAreaCode").disable();
            mini.get("optlRiskCode").disable();
            mini.get("riskAnlsObjCode").disable();
        },
        bindUI: function () {
        		$.ajax({ //获取安全风险区编码
        			url: ECS.api.bcUrl + '/riskArea/getRiskAreaCode?typeID=5',
        			async: false,
        			type: 'GET',
        			data: '',
        			dataType: "text",
        			contentType: "application/json;charset=utf-8",
        			success: function (res) {
        				console.log(res);
        				$('#rapCode').val(res);
        			},
        			error: function (result) {
        				layer.msg('请联系后台管理员！')
        			}
        		})
        		//保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //监听企业tree菜单点击
            mini.get("enterpriseCode").on("nodeclick",function(e){
                enterpriseCode = e.node.orgCode;
                editUserName=[];
                $("#userName").html("");
                $("#userID").val("");
                $("input[name=enterpriseCode]").next(".has-error").remove();
                page.logic.cbxHighRiskLvl(e.node.orgCode);//最高风险等级
                page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),e.node.orgId);//二级单位
            });
            //监听二级单位点击加载安全风险区名称
            mini.get("drtDeptCode").on("nodeclick",function(e){
                drtDeptCode = e.node.orgCode;
                $("input[name=drtDeptCode]").next(".has-error").remove();
                page.logic.cbxRiskAreaName("");
            });
            //监听安全风险区分类tree菜单点击
            mini.get("riskAreaCatgCode").on("nodeclick",function(e){
                $("input[name=riskAreaCatgCode]").next(".has-error").remove();
                var cate_arr = e.node.code;
                //小类
                if(e.node.categID.indexOf("sm")!=-1){
                    smCatg=cate_arr;
                    mdCatg="";
                    bgCatg="";
                }
                //中类
                if(e.node.categID.indexOf("md")!=-1){
                    mdCatg=cate_arr;
                    smCatg="";
                    bgCatg="";
                }
                //大类
                if(e.node.categID.indexOf("bg")!=-1){
                    bgCatg=cate_arr;
                    smCatg="";
                    mdCatg="";
                }
                page.logic.cbxRiskAreaName("");
            });
            //当安全风险区名称选择
            mini.get("riskAreaCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("riskAreaCode").setValue("-1");
                    riskAreaID="";
                }else{
                    riskAreaID = e.selected.riskAreaID;
                }
                $("input[name=riskAreaCode]").next(".has-error").remove();
                page.logic.cbxOptlRiskName("");//加载作业风险区名称
                page.logic.cbxRiskAnlsObjName("");//加载风险分析对象名称
            });
            //作业风险区名称选择
            mini.get("optlRiskCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("optlRiskCode").setValue("-1");
                    optlRiskZoneID="";
                }else{
                    optlRiskZoneID = e.selected.optlRiskZoneID;
                }
                $("input[name=optlRiskCode]").next(".has-error").remove();
                page.logic.cbxRiskAnlsObjName("");//加载风险分析对象名称
            });
            //人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details);
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                /**
                 * 不可编辑
                 */
                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled','disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    return;
                }else if (pageMode == PageModelEnum.Edit) {
                    /**
                     * 编辑模式下不可编辑
                     */
                    $('#enterpriseCode-text').html('<input name="orgSname" type="text" class="form-control" id="orgSname" disabled="disabled" /><input name="enterpriseCode" type="hidden" id="enterpriseCode" />');
                    $('#orgName-text').html('<input name="drtDeptSname" type="text" class="form-control" id="drtDeptSname" disabled="disabled" />');
                    $('#riskAreaCatg').attr('disabled','disabled');
                    $('#zoneCatg').attr('disabled','disabled');
                    $('#riskAnlsObjCatg').attr('disabled','disabled');
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.pointID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal',data);
                        enterpriseCode = data.enterpriseCode;
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        mini.get("sortNum").setValue(data.sortNum);
                        //风险区分类
                        if(data.smCategName){
                            $('#riskAreaCatgName-text').html('<input name="smCategName" type="text" class="form-control" id="smCategName" value="'+data.smCategName+'" disabled="disabled" />');
                        }else if(data.mdCategName){
                            $('#riskAreaCatgName-text').html('<input name="mdCategName" type="text" class="form-control" id="mdCategName" value="'+data.mdCategName+'" disabled="disabled" />');
                        }else if(data.bgCategName){
                            $('#riskAreaCatgName-text').html('<input name="bgCategName" type="text" class="form-control" id="bgCategName" value="'+data.bgCategName+'" disabled="disabled" />');
                        }
                        editUserName=[];
                        usernameList=[];
                        userIDList=[];
                        if(data.userMap){
                            for(var obj in data.userMap){
                                usernameList+=data.userMap[obj]+'<br/>';
                            }
                            for (var i in data.userMap){
                                editUserName.push(data.userMap[i]);
                            }
                            $("#userName").val(usernameList);
                            for (var i in data.userMap){
                                userIDList.push(i);
                            }
                            $("#userName").html(usernameList);
                            $("#userID").val(userIDList);
                        }
                        $("#inUse").iCheck('update');
                        //安全风险区名称
                        page.logic.cbxRiskAreaName(data.riskAreaCode,data.riskAreaSname);
                        //作业风险区名称
                        page.logic.cbxOptlRiskName(data.optlRiskCode,data.optlRiskSname);
                        //风险分析对象名称
                        page.logic.cbxRiskAnlsObjName(data.riskAnlsObjCode,data.riskAnlsObjName);
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 企业
             */
            initOrgCode:function(menu_url){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        mini.get("enterpriseCode").loadList(data, "orgId", "orgPID");
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                            page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId);
                            page.logic.cbxHighRiskLvl(mini.get("enterpriseCode").data[0].orgCode);
                        }else{
                            enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                            mini.get("enterpriseCode").disable();
                            for(var w=0;w<data.length;w++){
                                (function(menu_url){
                                    if(menu_url.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("enterpriseCode").setValue(menu_url.orgSname);
                                        page.logic.cbxHighRiskLvl(ECS.sys.Context.SYS_ENTERPRISE_CODE);
                                        page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),menu_url.orgId);
                                    }
                                })(data[w]);
                            }
                        }
                    }
                })
            },
            /**
             * 二级单位
             */
            cbxDrtDeptCode:function(menu_url,oPar,pid){
                $.ajax({
                    url:menu_url+"&orgPID="+pid,
                    type:"get",
                    success:function (data) {
                        mini.get("drtDeptCode").loadList(data, "orgId", "orgPID");
                    }
                });
            },
            /**
             * 安全风险区板块
             */
            cbxRiskAreaEnumList:function(){
                ECS.ui.getCombobox("riskAreaCatg", riskAreaEnumListUrl, {
                    selectValue: "S",
                }, null,page.logic.cbxRiskAreaType);
            },
            //安全风险区分类
            cbxRiskAreaType:function(pid){
                $.ajax({
                    url:riskAreaTypeNameUrl+"?riskAreaCatg="+pid,
                    type:"get",
                    async:false,
                    success:function (data) {
                        mini.get("riskAreaCatgCode").loadList(data, "categID", "gcategID");
                        page.logic.cbxRiskAreaName("");
                    }
                });
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
            cbxRiskAreaName:function(code,value){
                if(code){
                    mini.get("riskAreaCode").load([{riskAreaName: value, riskAreaCode: code}]);
                    mini.get("riskAreaCode").setValue(code);
                    return;
                }
                var riskAreaCatg = $("#riskAreaCatg").val();
                if(drtDeptCode){
                    var cur_url = riskAreaNameUrl+"?enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+smCatg+"&areaMdCatg="+mdCatg+"&areaBgCatg="+bgCatg+"&riskAreaCatg="+riskAreaCatg;
                    page.logic.selectCombox(cur_url,"#riskAreaCode");//安全风险区
                    mini.get("riskAreaCode").enable();
                }else{
                    mini.get("riskAreaCode").disable();
                    mini.get("riskAreaCode").setValue("-1");
                }
                mini.get("optlRiskCode").disable();
                mini.get("optlRiskCode").setValue("-1");
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            /**
             * 作业风险区类型
             */
            cbxZoneCatg:function(){
                ECS.ui.getCombobox("zoneCatg", zoneCatgUrl, {
                    selectValue: "",
                    async:false
                }, null,page.logic.cbxOptlRiskName);
            },
            /**
             * 作业风险区名称
             */
            cbxOptlRiskName:function(code,value){
                if(value){
                    mini.get("optlRiskCode").load([{name: value, code: code}]);
                    mini.get("optlRiskCode").setValue(code);
                    return;
                }
                var zoneCate = $("#zoneCatg").val();//作业风险区类型
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    page.logic.selectCombox(optlRiskNameUrl+"&riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate,"#optlRiskCode");//作业风险区名称
                    mini.get("optlRiskCode").enable();
                }else{
                    mini.get("optlRiskCode").disable();
                    mini.get("optlRiskCode").setValue("-1");
                }
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            /**
             * 风险分析对象类型
             */
            cbxRiskAnlsObjCatg:function(){
                ECS.ui.getCombobox("riskAnlsObjCatg", riskAnlsObjCatgUrl, {
                    selectValue: "",
                }, null,page.logic.cbxRiskAnlsObjName);
            },
            /**
             * 风险分析对象名称
             */
            cbxRiskAnlsObjName:function(code,value) {
                if(value){
                    mini.get("riskAnlsObjCode").load([{name: value, code: code}]);
                    mini.get("riskAnlsObjCode").setValue(code);
                    return;
                }
                var riskAnlsObjCatg = $("#riskAnlsObjCatg").val(),//风险分析对象类型id
                    RapTypeName_url = riskAnlsObjNameUrl+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+riskAnlsObjCatg;
                if(optlRiskZoneID){
                    page.logic.selectCombox(RapTypeName_url,"#riskAnlsObjCode");//风险分析对象名称
                    mini.get("riskAnlsObjCode").enable();
                }else{
                    mini.get("riskAnlsObjCode").disable();
                    mini.get("riskAnlsObjCode").setValue("-1");
                }
            },
            /**
             * 事故灾难类型
             */
            cbxDisasterType:function(){
                ECS.ui.getCombobox("disasterType", disasterTypeUrl, {
                    keyField: "ID",
                    valueField: "NAME",
                    async:false
                }, null);
            },
            /**
             * 最高风险等级
             */
            cbxHighRiskLvl:function(pid){
                ECS.ui.getCombobox("highRiskLvl", highRiskLvlUrl+"&name="+pid, {
                    keyField: "ID",
                    valueField: "NAME",
                    async:false
                }, null);
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
                    content: 'SelectOwner.html?' + Math.random(),
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
                        $("#userName").html(usernameList);
                        $("#userID").val(userIDList);
                    }
                })
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                //企业的编码
                data["enterpriseCode"] = enterpriseCode;
                var IDList=[];
                var rapUserEntity=[];
                if(data.userID.length>0){
                    IDList = data.userID.split(",");
                }
                delete data["enterpriseName"];
                delete data["riskAreaCatgName"];
                delete data["riskAnlsObjCatg"];
                delete data["riskAreaCatg"];
                delete data["riskAreaCatgCode"];
                delete data["zoneCatg"];
                for(var key in data){
                    data[key]=$.trim(data[key]);
                }
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    if(IDList.length>0){
                        for(var i=0;i<IDList.length;i++){
                            rapUserEntity.push({userID:IDList[i]});
                        }
                    }
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    if(IDList.length>0){
                        for(var i=0;i<IDList.length;i++){
                            rapUserEntity.push({userID:IDList[i],pointID:$("#pointID").val()});
                        }
                    }
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                data["rapUserEntity"]=rapUserEntity;
                delete data["userID"];
                delete data["userName"];
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        // layer.msg(result,{time: 1000},function() {
                        //     page.logic.closeLayer(true);
                        // });
                        var result = $.parseJSON(result);
                        if (result.isSuccess) {
                            layer.msg("保存成功",{time: 1000},function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.message);
                            $('#btnSave').attr('disabled', true);
                        }
                    }, error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        // layer.msg(result);
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.message);
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
                    },"只能输入字母和数字!");
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        drtDeptCode:{
                            required: true
                        },
                        riskAreaCatg: {
                            required: true
                        },
                        riskAreaCatgCode:{
                            required: true
                        },
                        riskAreaCode:{
                            required: true
                        },
                        rapName: {
                            required: true,
                            maxlength: 200
                        },
                        rapCode: {
                            required: true,
                            maxlength: 200,
                            ucode:/^[A-Za-z0-9]+$/
                        },
                        highRiskLvl: {
                            required: true
                        },
                        disasterType: {
                            required: true
                        },
                        rapDes: {
                            maxlength: 200
                        },
                        biasTerm: {
                            maxlength: 200
                        },
                        majConsequence: {
                            maxlength: 200
                        },
                        personnelLoss: {
                            maxlength: 200
                        },
                        propertyLoss: {
                            maxlength: 200
                        },
                        nonPropertyLoss: {
                            maxlength: 200
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