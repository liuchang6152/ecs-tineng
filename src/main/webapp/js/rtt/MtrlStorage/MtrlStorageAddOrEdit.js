var addUrl = ECS.api.rttUrl + '/mtrlStorage';                       //新增、编辑
var getSingleUrl = ECS.api.rttUrl + '/mtrlStorage';                //查询单条数据
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                 //企业、二级单位
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj?showPleaseSelect=true'; //安全风险区分类
var riskAreaName_url = ECS.api.bcUrl +'/riskArea/getAllList?showPleaseSelect=true';//安全风险区名称
var oprisktype_url = ECS.api.bcUrl + "/optlRiskZone/getOptlZoneCatgEnumList?showPleaseSelect=true";//作业风险区类型
var oprisk_url = ECS.api.bcUrl +'/optlRiskZone/getAllList?showPleaseSelect=true';  //作业风险区名称
var RiskAnlsObj_url = ECS.api.bcUrl +'/riskAnlsObj/getRiskObjCatgEnumList?showPleaseSelect=true';  //风险分析对象类型
var RiskAnlsObjName_url = ECS.api.bcUrl +'/riskAnlsObj/getAllList?showPleaseSelect=true'; //风险分析对象名称
var Enterprise_url = ECS.api.rttUrl +'/expert/getExpertTypeEnumList';                //企业内/外
var DepositType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=29'; //存放点类型
var StoreType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=34'; //存储库类型
var teskType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=33'; //ns业务类型
var Ranks_url = ECS.api.rttUrl + '/team/getTeamListByOrgId'; //应急队伍
var enterpriseCode = "";  //企业分类节点的编码；（针对树的第一个大类节点来算）
var drtDeptCode = "";     //二级单位节点编码；（默认为空）；
var drtDeptPID = "";      //二级单位的父级id;
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
var riskAnlsObjCode="";//风险分析对象名称编码
var teamId;
var repoType, storeTyp;
var isNum = 0;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var cate_dt = {};       //安全风险区分类树数据
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            //企业
            page.logic.get_list(riskorg_url,$("#enterpriseCode"));
             //业务类型
             page.logic.select_option(teskType_url, $("#teskType"));
             //所属企业
             page.logic.bulongType();
              //应急队伍
              mini.get("ranks").setValue("请选择");
            //存放点类型
              page.logic.select_option(DepositType_url, $("#storeType"));
              //储备库分类
              page.logic.select_option(StoreType_url, $("#repoType"));
              //
            //   $('#storageClass').attr('disabled','disabled');
              mini.get('storageClass').disable();
              //企业解封
              mini.get('enterpriseCode').enable();
        },
        bindUI: function () {
            
              //业务类型
              $('#teskType').change(function () {
                  var nsType = $('#teskType option:selected').val();
                  if (nsType == '1006') {
                      DepositType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=29';
                      StoreType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=34';
                  } else if (nsType == '1007') {
                      DepositType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=30';
                      StoreType_url = ECS.api.rttUrl + '/mtrlStorage/getListByModelID?businessModelId=35';
                  }
                  //存放点类型
                  page.logic.select_option(DepositType_url, $("#storeType"));
                  //储备库分类
                  page.logic.select_option(StoreType_url, $("#repoType"));
              });
             //所属企业
             $('#bulongType').change(function () {
                 isNum++;
                 if (isNum > 1) {
                    if (pageMode == PageModelEnum.Edit) {
                        layer.confirm('确定切换吗？', {
                                btn: ['确定', '取消']
                            }, function () {
                                // $("#AddOrEditModal")[0].reset();
                                layer.closeAll();
                            },
                            function (index) {//取消
                                console.log(index)
                                layer.close(index);
                                parent.layer.close(index);
                            });
                    }
                 }
                 
                 page.logic.bulongType();
             });
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
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
                enterpriseCode = e.node.orgCode;
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            //监听二级单位点击
            mini.get("drtDeptCode").on("nodeclick",function(e){
                drtDeptCode = e.node.orgCode;
                $("input[name=drtDeptCode]").next(".has-error").remove();
                mini.get('storageClass').setValue(e.node.orgSname);
                //加载安全风险区名称的数据
                page.logic.load_risk_menu("");
            });
            //当安全风险区分类选择以后，加载安全风险区名称的数据
            mini.get("riskAreaCatgName").on("valuechanged",function(){
                page.logic.load_risk_menu("");
            });
           
            //当安全风险区名称选择以后，加载作业风险区名称
            mini.get("riskAreaCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("riskAreaCode").setValue("-1");
                    riskAreaID="";
                }else{
                    riskAreaID = e.selected.riskAreaID;
                }
                mini.get('storageClass').setValue(e.selected.riskAreaName);
                page.logic.load_optrisk_menu("");//加载作业风险区名称
                page.logic.load_riskobj_menu("");    //加载风险分析对象名称的数据；
            });
             //监听风险分析对象名称
             mini.get("riskAnlsObjCode").on("valuechanged", function (e) {
                //  console.log(e.selected.name)
                 if (e.selected.name != 'undefined' ) {
                    mini.get('storageClass').setValue(e.selected.name);
                 }
             });
            //当作业风险区类型有变化的时候，是否可加载作业风险区名称；
            $("#optlRiskZoneCatg").change(function(){
                page.logic.load_optrisk_menu("");
            });
            //作业风险区名称选择
            mini.get("optlRiskZoneCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("optlRiskZoneCode").setValue("-1");
                    optlRiskZoneID="";
                    optlRiskZoneCode="";
                }else{
                    optlRiskZoneID = e.selected.optlRiskZoneID;
                    optlRiskZoneCode = e.selected.code;
                }
                mini.get('storageClass').setValue(e.selected.name);
                page.logic.load_riskobj_menu("");   //风险分析对象名称的数据
            });
            //风险分析对象类型选择以后，加载风险分析对象名称的数据
            $("#riskAnlsObjCatg").change(function(){
                page.logic.load_riskobj_menu("");   //加载风险分析对象名称的数据
            });
           
            //安全名称\作业名称\对象名称置灰
            mini.get("riskAreaCode").disable();
            mini.get("optlRiskZoneCode").disable();
            mini.get("riskAnlsObjCode").disable();
        },
        logic: {
             bulongType: function () {
                    mini.get('ranks').setValue('请选择');
                 nsType = $('#bulongType option:selected').val();
                  console.log(nsType);
                  if (nsType != '-1') {
                    if (nsType == '0') {
                        mini.get('ranks').disable(); //禁用应急队伍
                        // mini.get('ranks').enable(); //禁用应急队伍
                        mini.get('enterpriseCode').enable();//企业
                        mini.get('drtDeptCode').enable(); //二级单位
                        mini.get('riskAreaCatgName').enable(); //安全风险区分类：
                         $('#optlRiskZoneCatg').attr('disabled', false); //作业风险区类型：
                         $('#riskAnlsObjCatg').attr('disabled', false); //风险分析对象类型：
                    } else {

                        mini.get('drtDeptCode').setValue(''); //二级单位清空
                        mini.get('ranks').enable(); //应急队伍
                        mini.get('enterpriseCode').disable(); //企业
                        mini.get('enterpriseCode').setValue(''); //企业
                        mini.get('drtDeptCode').disable(); //二级单位
                        mini.get('riskAreaCatgName').disable(); //安全风险区分类：
                        // mini.get('riskAreaCatgName').setValue(''); //安全风险区分类：
                        $('#riskAreaCatgName').val(""); //安全风险区分类：
                        mini.get('riskAreaCode').setValue(''); //安全风险区名称：
                        mini.get('riskAreaCode').disable(); //安全风险区名称：
                        mini.get('optlRiskZoneCode').setValue(''); //作业风险区名称：
                        mini.get('optlRiskZoneCode').disable(); //作业风险区名称：
                        mini.get('riskAnlsObjCode').setValue(''); //风险分析对象名称：
                        mini.get('riskAnlsObjCode').disable(); //风险分析对象名称：
                        $('#optlRiskZoneCatg').attr('disabled', true); //作业风险区类型：
                        $('#optlRiskZoneCatg').html(''); //作业风险区类型：
                        $('#riskAnlsObjCatg').attr('disabled', true); //风险分析对象类型：
                        $('#riskAnlsObjCatg').html(''); //风险分析对象类型：
                        mini.get('storageClass').setValue(''); //存放点所属：
                    }
                    };
                
                 //应急队伍
                 $('#ranks').click(function () {
                     page.logic.select_options(Ranks_url, $("#ranks"), "ww");
                 });
             },
            /**
             * 保存
             */
            save: function () {
                if ($('#bulongType').val() == '-1') {
                    layer.msg('请选择所属企业');
                    return;
                };
                if ($('#teskType').val() == '-1') {
                    layer.msg('请选择业务类型');
                    return;
                };
                
                page.logic.formValidate();
               
                if (!$('#AddOrEditModal').valid()) {
                    return;
                };
                
                if ($('#storeType').val() == '-1') {
                    layer.msg('请选择存放点类型');
                    return;
                };
                if ($('#storageName').val() == '') {
                    layer.msg('请输入存放点名称');
                    return;
                } else {
                    //存放点名称
                    if ($('#storageName').val().length > 50) {
                        layer.msg('存放点名称输入过长，请筛减！');
                        return;
                    }
                    console.log()
                };
                
                if ($('#repoType').val() == '-1') {
                    layer.msg('请选择储存库分类');
                    return;
                };
                
                var data = ECS.form.getData('AddOrEditModal');
                //企业的数据搜集
                if(mini.get("enterpriseCode").getSelectedNode()){
                    data["enterpriseCode"] = mini.get("enterpriseCode").getSelectedNode().orgCode;
                }else{
                    data["enterpriseCode"] = enterpriseCode;
                }
                //二级单位PID、二级单位的编码、企业的编码
                if(mini.get("drtDeptCode").getSelectedNode()){
                    data["drtDeptPID"] = mini.get("drtDeptCode").getSelectedNode().orgPID;
                    data["drtDeptCode"] = mini.get("drtDeptCode").getSelectedNode().orgCode;
                }else{
                    data["drtDeptPID"] = drtDeptPID;
                    data["drtDeptCode"] = drtDeptCode;
                }
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
                for(var key in data){
                    if(data[key]=="-1"){
                        data[key] = "";
                    }
                }
                data["subordinateType"] = $('#bulongType').val() || ''; //ns所属类型
                data["repoCategory"] = $('#teskType').val() || ''; //ns业务类型
                
                if ($('#bulongType').val() != '0') {
                    if (mini.get('ranks').getValue() == '请选择'){
                         layer.msg('请选择应急队伍');
                         return;
                    }
                }else{
                    if (mini.get('drtDeptCode').getValue() == '') {
                        layer.msg('请选择二级单位');
                        return;
                        }
                    }
                if (mini.get('ranks').getValue() == '请选择') {
                     data["teamId"] = '';
                }else{
                    data["teamId"] = mini.get('ranks').getValue() || ''; //应急队伍
                }
                
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                console.log(data.subordinateType);
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:$.param(data),
                    dataType: "text",
                    success: function (result) {
                        console.log(result)
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 2000
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
                
                //企业(内/外)
                page.logic.select_option(Enterprise_url,$("#mtrlType"));

                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    //作业风险区类型
                    page.logic.select_option(oprisktype_url,$("#optlRiskZoneCatg"));
                    //风险分析对象类型
                    page.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));
                    //安全风险区分类
                    page.logic.select_option(riskType_url2,$("#riskAreaCatgName"),"xx");

                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    return;
                }else if (pageMode == PageModelEnum.Edit) {
                    // console.log("是否进入？");
                    mini.get("enterpriseCode").disable();           //企业
                    mini.get("drtDeptCode").disable();              //二级单位
                    mini.get("riskAreaCatgName").disable();                //安全风险区分类
                    $("#optlRiskZoneCatg").attr("disabled","disabled");  //作业风险区类型
                    $("#riskAnlsObjCatg").attr("disabled","disabled");   //风险分析对象类型
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.storageID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        console.log("编辑返回的数据是：",data)
                        ECS.form.setData('AddOrEditModal', data);
                        //企业、二级单位的数据存储
                        mini.get("enterpriseCode").setValue(data.enterpriseName);   //设置企业的名称；
                        enterpriseCode = data.enterpriseCode;                       //企业的编码
                        mini.get("drtDeptCode").setValue(data.drtDeptName);         //设置二级单位的名称；
                        drtDeptCode = data.drtDeptCode;                             //存储二级单位的编码；

                        // 二级单位的父级id;（若有，就存储，若无，就不要；）
                        if(data.drtDeptPID){
                            drtDeptPID = data.drtDeptPID;
                        }
                        //清空企业
                        if (data.subordinateType == 1) {
                            $('#enterpriseCode-text input').val('');
                            $('#orgName-text input').val('');
                            $('#riskAreaCatgName-text input').val('');
                        }
                        page.logic.load_risk_menu(data.riskAreaCode,data.riskAreaName);                        //安全风险区名称
                        page.logic.load_optrisk_menu(data.optlRiskZoneCode,data.optlRiskZoneName);            //作业风险区名称
                        page.logic.load_riskobj_menu(data.riskAnlsObjCode,data.riskAnlsObjName);              //风险分析对象名称
                        page.logic.set_default_val($("#optlRiskZoneCatg"),data.optlRiskZoneCatg,data.optlRiskZoneCatgName);    //作业风险区分类
                        page.logic.set_default_val($("#riskAnlsObjCatg"),data.riskAnlsObjCatg,data.riskAnlsObjCatgName);     //风险分析对象类型
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        // console.log(data.storeType);
                         $("#bulongType").find("option[value=" + data.subordinateType + "]").attr("selected", true); //所属类型；
                         $("#teskType").find("option[value=" + data.repoCategory + "]").attr("selected", true);      //业务类型；
                        repoType = data.repoType;
                        storeType = data.storeType;
                         
                        //安全风险区分类
                        var riskAreaCatgName="";
                        if(data.bgCategName!=null){
                            riskAreaCatgName+=data.bgCategName;
                        }
                        if(data.mdCategName!=null){
                            if(data.bgCategName!=null){
                                riskAreaCatgName+=",";
                            }
                            riskAreaCatgName+=data.mdCategName;
                        }
                        if(data.smCategName!=null){
                            if(data.mdCategName!=null){
                                riskAreaCatgName+=",";
                            }
                            riskAreaCatgName+=","+data.smCategName;
                        }
                        //应急队伍
                        if (data.subordinateType == '0') {//企业
                            // page.logic.bulongType();

                            mini.get('ranks').disable(); //应急队伍
                            // $('#riskAnlsObjCatg').attr('disabled', false); //风险分析对象类型
                            // $('#optlRiskZoneCatg').attr('disabled', false); //作业风险区类型
                            // mini.get('enterpriseCode').enable();         //企业
                            // mini.get('drtDeptCode').enable();            //二级单位
                            // mini.get('riskAreaCode').enable();           //二级单位
                            // mini.get('riskAreaCatgName').enable();       //安全风险区分：
                            // $('#riskAreaCatg').attr('disabled', false); //安全风险区板块
                            // $('#zoneCatg').attr('disabled', false);      //作业风险区分类
                        }else{
                            teamId = data.teamId;
                            $('#ranks').val(teamId);
                            mini.get('riskAreaCode').disable();
                           page.logic.select_options(Ranks_url, $("#ranks"), "ww");
                        }
												//存放点所属
												mini.get("storageClass").setValue(data.riskAnlsObjName); //存放点所属

                        mini.get("riskAreaCatgName").setValue(riskAreaCatgName);
                        cate_dt["areaBgCatg"]=data.areaBgCatg;    //大类
                        cate_dt["areaMdCatg"]=data.areaMdCatg;    //中类
                        cate_dt["areaSmCatg"]=data.areaSmCatg;    //小类
                        $("#inUse").iCheck('update');
                        mini.get("sortNum").setValue(data.sortNum);//排序
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //设置默认选中的值
            set_default_val:function(oPar,key,value,attr_id){
                if(value==null){
                    value="";
                }
                var $oPtion;
                if(attr_id){
                    $oPtion = $('<option value="'+key+'" att_id="'+attr_id+'">'+value+'</option>');
                }else{
                    $oPtion = $('<option value="'+key+'">'+value+'</option>');
                }
                $(oPar).append($oPtion);
                $(oPar).val(key);
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
            //作业风险区名称的数据加载
            load_optrisk_menu:function(code,value){
                if(code){
                    mini.get("optlRiskZoneCode").load([{name: value, code: code}]);
                    mini.get("optlRiskZoneCode").setValue(code);
                    return;
                }
                var zoneCate = $("#optlRiskZoneCatg").val();//作业风险区类型；
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    var cur_url = oprisk_url+"&riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate;
                    page.logic.selectCombox(cur_url,"#optlRiskZoneCode");//作业风险区名称
                    mini.get("optlRiskZoneCode").enable();
                }else{
                    mini.get("optlRiskZoneCode").disable();
                    mini.get("optlRiskZoneCode").setValue("-1");
                }
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            //风险分析对象名称的菜单数据加载
            load_riskobj_menu:function(code,value){
                if(code){
                    mini.get("riskAnlsObjCode").load([{name: value, code: code}]);
                    mini.get("riskAnlsObjCode").setValue(code);
                    return;
                }
                var riskAnlsObjCatg = $("#riskAnlsObjCatg").val() || '',//风险分析对象类型id；
                    RapTypeName_url = RiskAnlsObjName_url+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+riskAnlsObjCatg;
                if(optlRiskZoneID){//作业风险区名称id
                    page.logic.selectCombox(RapTypeName_url,"#riskAnlsObjCode");//风险分析对象名称
                    mini.get("riskAnlsObjCode").enable();
                    if(value){
                        mini.get("riskAnlsObjCode").setValue(value);
                        mini.get("riskAnlsObjCode").disable();
                    }
                }else{
                    mini.get("riskAnlsObjCode").disable();
                    mini.get("riskAnlsObjCode").setValue("-1");
                }
            },
            //安全风险区名称的数据加载
            load_risk_menu:function(code,value){
                if(value){
                    mini.get("riskAreaCode").load([{riskAreaName: value, riskAreaCode: code}]);
                    mini.get("riskAreaCode").setValue(code);
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
                if(drtDeptCode){
                    var cur_url = riskAreaName_url+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+areaSmCatg+"&areaMdCatg="+areaMdCatg+"&areaBgCatg="+areaBgCatg;
                    page.logic.selectCombox(cur_url,"#riskAreaCode");//安全风险区
                    mini.get("riskAreaCode").enable();
                }else{
                    mini.get("riskAreaCode").disable();
                    mini.get("riskAreaCode").setValue("-1");
                }
                mini.get("optlRiskZoneCode").disable();
                mini.get("optlRiskZoneCode").setValue("-1");
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
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
                            //清空下拉框
                            $(oPar).html("");
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //安全风险区类型、风险分析对象类型、作业风险区类型、存放点类型、储备库分类；
                                    if(cur_key.key || cur_key.key==0){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            cb && cb();
                        }
                        if (storeType) {
                            $("#storeType").val(storeType);
                        }

                        if (repoType) {
                            $("#repoType").val(repoType);
                        };
                        
                    }
                });
            },
             //应急队伍
             select_options: function (menu_url, oPar, cb) {
                 $.ajax({
                     url: menu_url,
                     type: "GET",
                     success: function (Data) {
                         console.log(Data)
                         if (cb && (typeof cb != "function")) {
                             //安全风险区分类

                             mini.get("ranks").loadList(Data, "teamID", "teamName");
                             page.logic.load_risk_menus();
                         } else {
                             //清空下拉框
                             $(oPar).html("");
                             //下拉框数据填充
                             for (var i = 0; i < Data.length; i++) {
                                 (function (cur_key) {
                                     //安全风险区类型、风险分析对象类型、作业风险区类型、存放点类型、储备库分类；
                                     if (cur_key.crtUserName || cur_key.crtUserName == 0) {
                                         var $oPtion = $('<option title="' + cur_key.crtUserName + '" value="' + cur_key.crtUserName + '">' + cur_key.crtUserName.substring(0, 20) + '</option>');
                                     }
                                     $(oPar).append($oPtion);
                                 })(Data[i]);
                             }
                             cb && cb();
                         }
                         //应急队伍
                         mini.get("ranks").setValue("请选择");
                         if (teamId){
                                mini.get("ranks").setValue(teamId);
                         }

                     }
                 })

             },
               //应急队伍
               load_risk_menus: function () {
                   //
                   var cate_arr = mini.get("ranks").getCheckedNodes(true);
                   var areaSmCatg = ""; //小类
                   var areaMdCatg = ""; //中类
                   var areaBgCatg = ""; //大类
                   if (cate_arr.length > 0) {
                       for (var i = 0; i < cate_arr.length; i++) {
                           (function (cur_data) {
                               if (cur_data.categID == "") {
                                   areaSmCatg = "";
                                   areaMdCatg = "";
                                   areaBgCatg = "";
                               } else if (cur_data.categID.indexOf("sm") != -1) {
                                   areaSmCatg = cur_data.code;
                               } else if (cur_data.categID.indexOf("md") != -1) {
                                   areaMdCatg = cur_data.code;
                               } else if (cur_data.categID.indexOf("bg") != -1) {
                                   areaBgCatg = cur_data.code;
                               }
                           })(cate_arr[i]);
                       }
                   }
                   var riskAreaCatg = $("#riskAreaCatg").val();
                   if (drtDeptCode) {
                       var cur_url = riskAreaName_url + "&enterpriseCode=" + enterpriseCode + "&drtDeptCode=" + drtDeptCode + "&areaSmCatg=" + areaSmCatg + "&areaMdCatg=" + areaMdCatg + "&areaBgCatg=" + areaBgCatg + "&riskAreaCatg=" + riskAreaCatg;
                       page.logic.selectCombox(cur_url, "#riskAreaCode"); //安全风险区
                       mini.get("riskAreaCode").enable();
                   } else {
                       mini.get("riskAreaCode").disable();
                       mini.get("riskAreaCode").setValue("-1");
                   }
                //    mini.get("optlRiskCode").disable();
                //    mini.get("optlRiskCode").setValue("-1");
                //    mini.get("riskAnlsObjCode").disable();
                //    mini.get("riskAnlsObjCode").setValue("-1");
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
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        // storeType: {//存放点类型
                        //     required: true
                        // },
                        repoType: {
                            required: true
                        },
                        // storageName: {//存放点名称
                        //     required: true
                        // },
                        mtrlType: {
                            required: true
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