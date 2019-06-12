var addUrl = ECS.api.rttUrl + '/emrgMtrl';                                    //新增 or 编辑保存
var getSingleUrl = ECS.api.rttUrl + '/emrgMtrl';                             //获取单条数据
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                           //企业、二级单位
var storeTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getStoreTypeEnumList';  //存放点类型
var storageNameUrl = ECS.api.rttUrl + '/mtrlStorage/mtrlStorageName';      //存放点名称
var repoTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getRepoTypeEnumList';     //储备库分类
var mesUnitUrl = ECS.api.rttUrl + '/emrgMtrl/mesUnit';                       //计量单位
var mtrlTypeUrl = ECS.api.rttUrl + '/emrgMtrl/mtrlType';                    //企内/外
var enterpriseCode = "";                                                       //企业编码
var drtDeptCode = "";                                                          //二级单位
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
window.ownDetail="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
        },
        bindUI: function () {
            //input数据前后不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //点击保存按钮，进行保存；
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，关闭弹框
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //二级单位点击后联动企业和存放点名称
            mini.get("drtDeptCode").on("nodeclick",function(e){
                $("#ownerName").val("");
                window.ownDetail="";
                $("#ownerContact").val("");
                $("#userID").val("");
                page.logic.cbxStorage();       //存放点名称
            });
            //点击企业菜单，二级单位联动
            mini.get("enterpriseCode").on("nodeclick",function(e){
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(单选)",PageModelEnum.Details)
            });
            //应急物资配置--点击选择，进行选择；
            $("#selectMedia").click(function () {
                page.logic.selectMedia();
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    page.logic.initMesUnit("");//计量单位
                    $("#storageName").hide();
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#crtUserDept").val(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    var myDate = new Date;
                    $("#crtDate").val(ECS.util.DateTimeRender(myDate));
                    //企业/二级单位下拉菜单加载
                    page.logic.get_list(riskorg_url,$("#enterpriseCode"),"",function(){
                        page.logic.cbxStorage();//存放点名称
                    });
                    page.logic.cbxStoreType();    //存放点类型
                    page.logic.cbxRepoType();     //储备库分类
                    page.logic.initExpertType();  //企内/外
                    return;
                }
                if (pageMode == PageModelEnum.Edit) {
                    $("#storageID").attr('disabled','disabled');
                    $('#storeType').attr('disabled','disabled');
                    $('#repoType').attr('disabled','disabled');
                    mini.get("enterpriseCode").disable();    //二级单位设置为不可用；
                    mini.get("drtDeptCode").disable();    //二级单位设置为不可用；
                    mini.get("expireDate").disable();     //日期
                    page.logic.cbxStoreType();    //存放点类型
                    page.logic.cbxRepoType();     //储备库分类
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.emrgMtrlID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        if(data.mtrlMdCategID==null){
                            data.mtrlMdCategID="-1";
                        }
                        if(data.mtrlSmCategID==null){
                            data.mtrlSmCategID="-1";
                        }
                        ECS.form.setData('AddOrEditModal', data);
                        mini.get("sortNum").setValue(data.sortNum);
                        $("#crtDate").val(ECS.util.timestampToHour(data.crtDate));
                        page.logic.initMesUnit(data.mesUnit);//计量单位
                        $("input[name=drtDeptCode]").val(data.drtDeptCode);
                        // //存放点类型
                        // var storeType_opiton = $('<option value="'+data.storeType+'">'+data.storeTypeName+'</option>');
                        // $("#storeType").append(storeType_opiton);
                        // //储备库分类  repoType
                        // var repoType_opiton = $('<option value="'+data.repoType+'">'+data.repoTypeName+'</option>');
                        // $("#repoType").append(repoType_opiton);
                        //存放点名称  storageID

                        $("#storeType").val(data.storeType);
                        $("#repoType").val(data.repoType);


                        var storageID_opiton = $('<option value="'+data.storageID+'">'+data.storageName+'</option>');
                        $("#storageID").append(storageID_opiton);

                        //企业/二级单位下拉菜单加载，并设置编辑内的默认值
                        page.logic.get_list(riskorg_url,$("#enterpriseCode"),"",function(){
                            mini.get("enterpriseCode").setValue(data.orgName);  //企业
                            enterpriseCode = data.enterpriseCode;               //企业编码存储
                            mini.get("drtDeptCode").setValue(data.drtDeptName); //二级单位
                            drtDeptCode = data.drtDeptCode;                      //二级单位编码存储
                            // page.logic.cbxStorage();//存放点名称
                            //设置存放点名称的默认值；
                            $("#storageID").val(data.storageID);
                            $("#storageName").val(data.storageName);
                        });

                        //物资大类值和code设置;
                        $("#bgCategName").val(data.bgCatgName);
                        $("#bgCatgCode").val(data.bgCatgCode);
                        //物资中类值和code设置；
                        $("#mdCategName").val(data.mdCatgName);
                        $("#mdCatgCode").val(data.mdCatgCode);
                        //物资小类值和code设置；
                        $("#smCategName").val(data.smCatgName);
                        $("#smCategCode").val(data.smCatgCode);

                        //企业（内/外）
                        var mtrlType_opiton = $('<option value="'+data.mtrlType+'">'+data.mtrlTypeName+'</option>');
                        $("#mtrlType").append(mtrlType_opiton);

                        mini.get("expireDate").setValue(ECS.util.strToDate(data.expireDate));
                        window.ownDetail={
                            "ownerContact": data.ownerContact,
                            "userID": data.userID,
                            "userName": data.ownerName
                        };
                        $("#inUse").iCheck('update');
                        ECS.hideLoading();
                    },
                    error: function (result) {
                        ECS.hideLoading();
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
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        if(mini.get("enterpriseCode").getSelectedNode()){
                            //若企业名称有选择的一项
                            enterpriseCode = mini.get("enterpriseCode").getSelectedNode().orgCode;
                        }
                        var data = {
                            "pageMode": pageMode,
                            "title": title,
                            "orgCode":enterpriseCode,
                            "userInfo":window.ownDetail
                        };
                        iframeWin.page.logic.setData(data);

                    },
                    end: function () {
                        $("#ownerContact").val(window.ownDetail.ownerContact);
                        $("#ownerName").val(window.ownDetail.userName);
                        $("#userID").val(window.ownDetail.userID);
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
                    async:false,
                    success:function (Data) {
                        if(Pid){
                            //二级单位
                            mini.get("drtDeptCode").loadList(Data,"orgId","orgPID");
                            if(Data.length>0){
                                if(Data[0].orgPID){
                                    for(var w=0;w<Data.length;w++){
                                        if(Data[w].orgId==Data[0].orgPID){
                                            mini.get("drtDeptCode").setValue(Data[w].orgSname);     //默认选择第一个节点大类；
                                            drtDeptCode = Data[w].orgCode;                           //二级单位的编码；
                                        }
                                    }
                                }else{
                                    mini.get("drtDeptCode").setValue(Data[0].orgSname);     //默认选择第一个节点大类；
                                    drtDeptCode = Data[0].orgCode;                           //二级单位的编码；
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
                                page.logic.get_list(riskorg_url,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId,function(){
                                    cb && cb();
                                });
                            }else{
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("enterpriseCode").disable();
                                for(var w=0;w<Data.length;w++){
                                    (function(cur_key){
                                        if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                            mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                            page.logic.get_list(riskorg_url,$("#drtDeptCode"),cur_key.orgId,function(){
                                                cb && cb();
                                            });
                                        }
                                    })(Data[w]);
                                }
                            }
                        }
                    }
                })
            },
            //装备大类、装备中类、装备小类三者联动
            selectMedia: function () {
                layer.open({
                    type: 2,
                    closeBtn: 1,
                    area: ['80%', '90%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: '物资分类选择',
                    content: './SelectType.html?r=' + Math.random(),
                    success: function (layero, index) {

                    },
                    end: function () {
                        var result =window.ownDetail;
                        var arr = [];
                        if(result.allName){
                            arr  = result.allName.split('-');
                        }else{
                            arr.push(result.bgCategName);
                        }
                        //物资大类
                        $("#bgCatgName").val(result.bgCategName);
                        $("#bgCatgCode").val(result.bgCategCode);
                        //物资中类
                        $("#mdCatgName").val(arr[1]);
                        $("#mdCatgCode").val(result.mdCategCode);
                        //物资小类
                        $("#smCatgName").val(arr[2]);
                        $("#smCatgCode").val(result.code);
                    }
                })
            },
            /**
             * 存放点类型
             */
            cbxStoreType:function(){
                ECS.ui.getCombobox("storeType", storeTypeUrl, {
                    async:false
                }, null,page.logic.cbxStorage);
            },
            /**
             * 储备库分类
             */
            cbxRepoType:function(){
                ECS.ui.getCombobox("repoType", repoTypeUrl, {
                    async:false
                }, null,page.logic.cbxStorage);
            },
            //物资存放点名称
            cbxStorage:function(){
                var storeType=$("#storeType").find("option:selected").attr("value");
                var repoType=$("#repoType").find("option:selected").attr("value");
                //倘若二级单位有选中的项，那么请求物资存放点名称的数据
                if(mini.get("drtDeptCode").getSelectedNode()){
                    ECS.ui.getCombobox("storageID", storageNameUrl, {
                        async:false,
                        data: {
                            "drtDeptCode":mini.get("drtDeptCode").getSelectedNode().orgCode,
                            "storeType":storeType,
                            "repoType":repoType
                        }
                    });
                }
            },
            getSmCatgCode:function(){
                $("#smCatgCode").val($("#mtrlSmCategID").find("option:selected").attr("code"));
            },
            /**
             * 计量单位
             */
            initMesUnit:function(name){
                ECS.ui.getComboSelect(mesUnitUrl,"mesUnit","value","value",true,name);
            },
            /**
             * 企内/外
             */
            initExpertType: function () {
                ECS.ui.getCombobox("mtrlType", mtrlTypeUrl, {
                    selectValue: 0
                }, null);
            },
            //不可选择之前的日期
            onDrawDate:function(e){
                var date = e.date;
                var d = new Date();
                if (date.getTime() < d.getTime()) {
                    e.allowSelect = false;
                }
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');   //自动搜集其它数据
                //拼接其它数据
                //企业、二级单位
                //企业--------------------------------
                if(mini.get("enterpriseCode").getSelectedNode()){
                    data["enterpriseCode"] = mini.get("enterpriseCode").getSelectedNode().orgCode;
                }else{
                    data["enterpriseCode"] = enterpriseCode;
                }
                //二级单位----------------------------
                if(mini.get("drtDeptCode").getSelectedNode()){
                    data["drtDeptCode"] = mini.get("drtDeptCode").getSelectedNode().orgCode;
                }else{
                    data["drtDeptCode"] = drtDeptCode;
                }
                //物资大类
                data["bgCatgName"] = $("#bgCatgName").val();
                data["bgCatgCode"] = $("#bgCatgCode").val();
                //物资中类
                data["mdCatgName"] = $("#mdCatgName").val();
                data["mdCatgCode"] = $("#mdCatgCode").val();
                //物资小类
                data["smCatgName"] = $("#smCatgName").val();
                data["smCatgCode"] = $("#smCatgCode").val();
                //库存量
                data["mtrlAmount"] = $("#mtrlAmount").val();
                //库存量下限
                data["lowLimit"] = $("#lowLimit").val();

                for(var key in data){
                    if(data[key]=="null"||data[key]=="-1"){
                        data[key]="";
                    }
                }
                //处理提交类型
                if (pageMode == PageModelEnum.NewAdd) {
                    var ajaxType = "POST";
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                if (pageMode == PageModelEnum.Edit) {
                   var ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:$.param(data),
                    dataType: "text",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if(result=="保存成功！"){
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        }else{
                            layer.msg(result);
                        }
                    },
                    error: function (result) {
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
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        drtDeptCode:{
                            required: true
                        },
                        storeType: {
                            required: true
                        },
                        repoType: {
                            required: true
                        },
                        storageID: {
                            required: true
                        },
                        sourceType: {
                            required: true
                        },
                        mtrlBgCategID: {
                            required: true
                        },
                        emrgMtrlName: {
                            required: true
                        },
                        mtrlAmount: {
                            required: true
                        },
                        mesUnit: {
                            required: true
                        },
                        ownerName:{
                            required:true
                        },
                        mtrlType: {
                            required: true
                        },
                        sortNum: {
                            required: true,
                            digits: true,
                            min: 0
                        }
                    }
                });
                if($("#mtrlBgCategID").val()=="-1"){
                    $("#mtrlBgCategID").val("");
                }
            }
        }
    };
    page.init();
    window.page = page;
});