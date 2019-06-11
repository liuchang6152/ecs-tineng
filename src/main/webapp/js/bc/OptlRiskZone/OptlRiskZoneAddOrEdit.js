var addUrl = ECS.api.bcUrl+ '/optlRiskZone';
var getSingleUrl =ECS.api.bcUrl + '/optlRiskZone';
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                  //企业、二级单位
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/riskArea/categ?showPleaseSelect=true';  //安全风险区分类
var riskAreaEnumListNameUrl = ECS.api.bcUrl + '/riskArea/getRiskAreaEnumList';  //安全风险区板块
var riskAreaNameUrl = ECS.api.bcUrl + '/riskArea/riskAreaNameAll';  //安全风险区名称
var zoneCatgUrl = ECS.api.bcUrl + '/optlRiskZone/getOptlZoneCatgEnumList';//作业风险区类型
var cate_dt = {};          //安全风险区分类树数据
var categID = "";          //安全风险区分类节点的id;(针对树的第一个大类节点来算)
var code = "";             //安全风险区分类节点的编码code;（针对树的第一个大类节点来算）
var enterpriseCode = "";  //企业分类节点的编码；（针对树的第一个大类节点来算）
var drtDeptCode = "";     //二级单位节点编码；（默认为空）；
var editUserName=[];//选择联系人
var usernameList=[];//选择联系人
var userIDList=[];//选择联系人
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var catgCode;//安全风险区分类code
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            //企业
            page.logic.get_list(riskorg_url,$("#enterpriseCode"));
            page.logic.cbxRiskAreaEnumList();//安全风险区板块
            page.logic.cbxLink("S");//安全风险区分类
            page.logic.cbxZoneCatg();//作业风险区类型
            //安全名称\作业名称\对象名称置灰
            mini.get("riskAreaID").disable();
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
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
            //点击企业菜单，二级单位联动
            mini.get("enterpriseCode").on("nodeclick",function(e){
                $("input[name=enterpriseCode]").next(".has-error").remove();
                enterpriseCode=e.node.orgCode;
                editUserName=[];
                $("#userName").html("");
                $("#userID").val("");
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            //监听二级单位点击
            mini.get("drtDeptCode").on("nodeclick",function(e){
                $("input[name=drtDeptCode]").next(".has-error").remove();
                drtDeptCode = e.node.orgCode;
                page.logic.cbxRiskAreaName("");
            });
            //监听安全风险区分类菜单点击
            mini.get("riskAreaTypeName").on("nodeclick",function(e){
                $("input[name=riskAreaTypeName]").next(".has-error").remove();
                catgCode=e.node.code;
                page.logic.cbxRiskAreaName("");
            });
            //当安全风险区名称选择以后
            mini.get("riskAreaID").on("valuechanged",function(e){
                $("input[name=riskAreaID]").next(".has-error").remove();
            });
            //人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details);
            });
        },
        logic: {
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    return;
                }
                if (pageMode == PageModelEnum.Edit) {
                    $('#enterpriseCode-text').html('<input name="enterpriseName" type="text" class="form-control" id="enterpriseName" /><input name="enterpriseCode" type="hidden" id="enterpriseCode" />');
                    $("#enterpriseName").attr('disabled','disabled');
                    $('#orgName-text').html('<input name="orgName" type="text" class="form-control" id="orgName" /><input name="drtDeptCode" type="hidden" id="drtDeptCode" />');
                    $('#orgName').attr('disabled','disabled');
                    $('#riskAreaCatg-text').html('<input name="riskAreaCatgName" type="text" class="form-control" id="riskAreaCatgName" />');
                    $("#riskAreaCatgName").attr('disabled','disabled');
                    $('#riskAreaTypeName-text').html('<input name="riskAreaTypeName" type="text" class="form-control" id="riskAreaTypeName" disabled="disabled" />');
                    $('#code').attr('disabled','disabled');
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.optlRiskZoneID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal',data);
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        mini.get("sortNum").setValue(data.sortNum);
                        //企业、二级单位的数据存储
                        mini.get("enterpriseCode").setValue(data.orgSname);         //设置企业的名称；
                        enterpriseCode = data.enterpriseCode;                       //企业的编码
                        mini.get("drtDeptCode").setValue(data.drtDeptSname);         //设置二级单位的名称；
                        drtDeptCode = data.drtDeptCode;                             //存储二级单位的编码；
                        //安全风险区名称
                        page.logic.cbxRiskAreaName(data.riskAreaID,data.riskAreaName);
                        //安全风险区分类
                        cate_dt["areaBgCatg"]=data.areaBgCatg;    //大类
                        cate_dt["areaMdCatg"]=data.areaMdCatg;    //中类
                        cate_dt["areaSmCatg"]=data.areaSmCatg;    //小类
                        //联系人
                        editUserName=[];
                        usernameList=[];
                        userIDList=[];
                        if(data.userEntitySet){
                            for(var i=0;i<data.userEntitySet.length;i++){
                                usernameList+=data.userEntitySet[i].userName+'<br/>';
                                userIDList.push(data.userEntitySet[i].userID);
                                editUserName.push(data.userEntitySet[i].userName);
                            }
                            // $("#userName").val(usernameList);
                            $("#userName").html(usernameList);
                            $("#userID").val(userIDList);
                        }
                        //是否启用
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
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
                                mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode);
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
            /**
             * 安全风险区板块
             */
            cbxRiskAreaEnumList:function(){
                ECS.ui.getCombobox("riskAreaCatg", riskAreaEnumListNameUrl, {
                    selectValue: "S",
                }, null,page.logic.cbxLink);
            },
            //安全风险区板块联动分类和名称
            cbxLink:function(pid){
                page.logic.select_option(riskAreaTypeNameUrl+"&riskAreaCatg="+pid,"#riskAreaTypeName");//安全风险区分类
                catgCode="";
                page.logic.cbxRiskAreaName("");
            },
            //安全风险区类型
            select_option:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (Data) {
                        mini.get(oPar).loadList(Data, "categID", "gcategID");
                        mini.get(oPar).setValue("请选择");
                        if(Data[0]){
                            categID = Data[0].categID;                                   //存储当前第一条节点的节点id值；
                            code =  Data[0].code;                                        //存储当前第一条节点的编码值；
                        }
                    }
                });
            },
            //可搜索下拉框
            selectCombox:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        mini.get(oPar).load(data);
                    }
                });
            },
            /**
             * 安全风险区
             */
            cbxRiskAreaName:function(riskId,value){
                if(riskId){
                    mini.get("riskAreaID").load([{riskAreaName: value, riskAreaID: riskId}]);
                    mini.get("riskAreaID").setValue(riskId);
                    return;
                }
                var riskAreaCatg = $("#riskAreaCatg").val();
                if(drtDeptCode){
                    var cur_url = riskAreaNameUrl+"?enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&riskAreaCatgCode="+catgCode+"&riskAreaCatg="+riskAreaCatg;
                    page.logic.selectCombox(cur_url,"#riskAreaID");//安全风险区
                    mini.get("riskAreaID").enable();
                }else{
                    mini.get("riskAreaID").disable();
                    mini.get("riskAreaID").setValue("-1");
                }
            },
            /**
             * 作业风险区类型
             */
            cbxZoneCatg:function(){
                ECS.ui.getCombobox("zoneCatg", zoneCatgUrl, {
                    selectValue:""
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
                        $("#userName").html(usernameList);
                        $("#userID").val(userIDList);
                    }
                });
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
                //处理数据
                //二级单位PID、二级单位的编码、企业的编码
                if(mini.get("drtDeptCode").getSelectedNode()){
                    data["drtDeptCode"] = mini.get("drtDeptCode").getSelectedNode().orgCode;
                }else{
                    data["drtDeptCode"] = drtDeptCode;
                }
                //企业的数据搜集
                data["enterpriseCode"] = enterpriseCode;
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaTypeName").getCheckedNodes(true);
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
                    //当弹框处于新增状态时，处理默认值；
                    if (pageMode == PageModelEnum.NewAdd) {
                        //小类
                        if(categID.indexOf("sm")!=-1){
                            data["areaSmCatg"]=code;
                        }
                        //中类
                        if(categID.indexOf("md")!=-1){
                            data["areaMdCatg"]=code;
                        }
                        //大类
                        if(categID.indexOf("bg")!=-1){
                            data["areaBgCatg"]=code;
                        }
                    }
                }
                if(data.userID){
                    var userEntity=[];
                    for(var i=0;i<data.userID.split(",").length;i++){
                        userEntity.push({"userID":data.userID.split(",")[i]});
                    }
                    data["userEntitySet"]=userEntity;
                }
                delete data.userID;
                delete data.userName;
                delete data.riskAreaTypeName;
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
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
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{time: 1000},function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    }, error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
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
                        enterpriseCode: {
                            required: true
                        },
                        drtDeptCode:{
                            required: true
                        },
                        riskAreaID:{
                            required: true
                        },
                        zoneCatg:{
                            required: true
                        },
                        name: {
                            required: true,
                            maxlength: 200
                        },
                        sname: {
                            required: true,
                            maxlength: 200
                        },
                        code: {
                            required: true,
                            maxlength: 200,
                            ucode:/^[A-Za-z0-9]+$/
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