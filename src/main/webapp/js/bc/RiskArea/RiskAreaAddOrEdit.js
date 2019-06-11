var addUrl = ECS.api.bcUrl + '/riskArea';
var getSingleUrl = ECS.api.bcUrl + '/riskArea';
var riskType_url = ECS.api.bcUrl +'/riskArea/getRiskAreaEnumList';     //安全风险区类型
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj';             //安全风险区分类
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                       //企业、二级单位
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var editUserName=[];//选择联系人
var usernameList=[];//选择联系人
var userIDList=[];//选择联系人
var cate_dt = {};          //安全风险区分类树数据
var categID = "";          //安全风险区分类节点的id;(针对树的第一个大类节点来算)
var code = "";             //安全风险区分类节点的编码code;（针对树的第一个大类节点来算）
var enterpriseCode = "";  //企业分类节点的编码；（针对树的第一个大类节点来算）
var drtDeptCode = "";     //二级单位节点编码；（默认为空）；
var drtDeptPID = "";      //二级单位的父级id;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    console.log(ECS.api.bcUrl + '/riskArea/getRiskAreaCode')
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
        },
        bindUI: function () {
             $.ajax({//获取安全风险区编码
                 url: ECS.api.bcUrl + '/riskArea/getRiskAreaCode',
                 async: false,
                 type: 'GET',
                 data: '',
                 dataType: "text",
                 contentType: "application/json;charset=utf-8",
                 success: function (res) {
                        console.log(res);
                        $('#riskAreaCode').val(res);
                 },
                 error: function (result) {
                     layer.msg('请联系后台管理员！')
                 }
             })
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
                $("input[name=enterpriseCode]").next(".has-error").remove();
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
                enterpriseCode=e.node.orgCode;
                editUserName=[];
                $("#userName").html("");
                $("#userID").val("");
            });
            mini.get("drtDeptCode").on("nodeclick",function(e){
                $("input[name=drtDeptCode]").next(".has-error").remove();
            });
            mini.get("riskAreaCatgName").on("nodeclick",function(e){
                $("input[name=riskAreaCatgName]").next(".has-error").remove();
            });
            //人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details)
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
                //二级单位PID、二级单位的编码、企业的编码
                if(mini.get("drtDeptCode").getSelectedNode()){
                    data["drtDeptPID"] = mini.get("drtDeptCode").getSelectedNode().orgPID;
                    data["drtDeptCode"] = mini.get("drtDeptCode").getSelectedNode().orgCode;

                }else{
                    data["drtDeptPID"] = drtDeptPID;
                    data["drtDeptCode"] = drtDeptCode;
                }
                //企业的数据搜集
                data["enterpriseCode"] = enterpriseCode;
                if(data.userID){
                    var userEntity=[];
                    for(var i=0;i<data.userID.split(",").length;i++){
                        userEntity.push({"userID":data.userID.split(",")[i]});
                    }
                    data["userEntity"]=userEntity;
                }
                delete data.userID;
                delete data.userName;
                delete data.riskAreaCatgName;
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
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    //填充下拉框数据
                    //安全风险区板块的数据加载
                    page.logic.select_option(riskType_url,$("#riskAreaCatg"),function(){
                        page.logic.load_riskAreaCate();     //加载安全风险区的数据
                    });
                    //企业
                    page.logic.get_list(riskorg_url,$("#enterpriseCode"),"",function(){});
                    //当“安全风险区板块”的值发生改变的时候，加载“安全风险区分类”的数据；
                    $("#riskAreaCatg").change(function(){
                        page.logic.load_riskAreaCate();
                    });
                    return;
                }
                //若当前窗口是编辑状态下，那么企业、二级单位、安全风险区类型、安全风险区编码置灰，不可编辑；
                mini.get("enterpriseCode").disable();          //企业设置为不可编辑状态；
                mini.get("drtDeptCode").disable();              //二级单位设置为不可编辑状态；
                $("#riskAreaCatg").attr("disabled","disabled");                 //安全风险区类型为不可编辑状态；
                $("#riskAreaCatg").addClass("input_useless");
                mini.get("riskAreaCatgName").disable();              //安全风险区分类设置为不可编辑状态；
                $("#riskAreaCode").attr("disabled","disabled");                 //安全风险区编码为不可编辑状态
                $("#riskAreaCode").addClass("input_useless");
                $.ajax({
                    url: getSingleUrl + "/" + data.riskAreaID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        //企业、二级单位的数据存储
                        mini.get("enterpriseCode").setValue(data.orgSname);         //设置企业的名称；
                        enterpriseCode = data.enterpriseCode;                       //企业的编码
                        mini.get("drtDeptCode").setValue(data.drtDeptSname);         //设置二级单位的名称；
                        drtDeptCode = data.drtDeptCode;                             //存储二级单位的编码；
                        // 二级单位的父级id;（若有，就存储，若无，就不要；）
                        if(data.drtDeptPID){
                            drtDeptPID = data.drtDeptPID;
                        }
                        //安全风险区类型
                        page.logic.select_option(riskType_url,$("#riskAreaCatg"),function(){
                            $("#riskAreaCatg").val(data.riskAreaCatg);               //安全风险区类型，相应的选中
                        });
                        //安全风险区分类，相应的选中
                        if(data.bgCategName && data.mdCategName && data.smCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName+","+data.mdCategName+","+data.smCategName);
                        }else if(data.bgCategName && data.mdCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName+","+data.mdCategName);
                        }else if(data.bgCategName){
                            mini.get("riskAreaCatgName").setValue(data.bgCategName);
                        }
                        //安全风险区分类
                        cate_dt["areaBgCatg"]=data.areaBgCatg;    //大类
                        cate_dt["areaMdCatg"]=data.areaMdCatg;    //中类
                        cate_dt["areaSmCatg"]=data.areaSmCatg;    //小类
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
                            $("#userName").html(usernameList);
                            $("#userID").val(userIDList);
                        }
                        mini.get("sortNum").setValue(data.sortNum);
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
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
                            //单条节点的数据：orgId  orgCode  orgName  orgPID  orgSname
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
                                enterpriseCode=mini.get("enterpriseCode").data[0].orgCode;
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
            //安全风险区分类的菜单数据加载；
            load_riskAreaCate:function(){
                page.logic.select_option(riskType_url2+"?riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"xx");
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        if(cb && typeof cb != "function"){
                            //安全风险区分类树结构
                            mini.get("riskAreaCatgName").loadList(Data,"categID","gcategID");
                            if(Data[0]){
                                categID = Data[0].categID;                                   //存储当前第一条节点的节点id值；
                                code =  Data[0].code;                                        //存储当前第一条节点的编码值；
                            }
                        }else{
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //安全风险区类型
                                    if(cur_key.key){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            $("#riskAreaCatg").val("S");
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
                            required: true,
                            rangelength: [0, 200]
                        },
                        drtDeptCode: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        riskAreaCatg: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        riskAreaCatgName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        riskAreaName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        riskAreaSName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        riskAreaCode:{
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
    };
    page.init();
    window.page = page;
});