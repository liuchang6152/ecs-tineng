var addUrl = ECS.api.bcUrl + '/user';                      //新增、编辑
var getSingleUrl = ECS.api.bcUrl + '/user';                //查询单条数据
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";                                                //根据企业code获取企业id;
var postNames_url = ECS.api.bcUrl + "/user/getAllPost";                            //岗位
var userSex_url = ECS.api.rttUrl + "/expert/getExpertSexEnumList";               //性别
var userEducation_url = ECS.api.rttUrl + "/expert/getExpertEducationEnumList";  //学历
var userAttribute_url = ECS.api.bcUrl + "/user/getAllUserAttribute";             //员工属性
var userLvl_url = ECS.api.bcUrl + "/user/getAllUserLvl";                          //行政级别（员工级别）
var userNature_url = ECS.api.bcUrl + "/user/getAllUserNature";                   //员工性质
var porg_url = ECS.api.bcUrl + '/org/porgName'; //总部组织机构树
var org_url = ECS.api.bcUrl + '/org/porgNameOne'; //企业组织机构树
var dutyUrl = ECS.api.bcUrl + '/duty/list';                                    //职务
var userOrgSet = [];                                        //员工管理对应的组织机构数据
var parentOrgID;
var currentOrgId;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //监听组织机构联动职务
            // mini.get("orgID").on("nodeclick",function(e){
            //     $("input[name=orgID]").next(".has-error").remove();
            //
            // });
            $('#btnSave').click(function () {
                page.logic.save();
            });
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
                console.log($('#userMobile').val())
                 if (!$('#userMobile').val() && !$('#userPhone').val()) { //
                     layer.msg('请输入手机号或者座机号');
                     return;
                 }
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
               
                
                // //校验出生日期
                // if($("#userBirthday").find("input").val()==""){
                //     layer.msg("请选择出生日期!");
                //     return false;
                // }
                // //校验入职时间
                // if($("#userJoinDatetime").find("input").val()==""){
                //     layer.msg("请选择入职时间!");
                //     return false;
                // }
                // //校验岗位
                // if(mini.get("postID").getValue()==""){
                //     layer.msg("请选择岗位！");
                //     return false;
                // }
                // //校验职务
                // if(mini.get("dutyID").getValue()==""){
                //     layer.msg("请选择职务！");
                //     return false;
                // }
                var data = ECS.form.getData('AddOrEditModal');
                //获取出生日期
                data.userBirthday = mini.get("userBirthday").getFormValue();
                //获取入职时间
                data.userJoinDatetime = mini.get("userJoinDatetime").getFormValue();
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                //组织机构的数据拼接处理
                if(mini.get("orgID").getSelectedNode()){
                    data.userOrgSet=[{userID:$("#userID").val(),orgID:mini.get("orgID").getSelectedNode().orgId}];
                }else{
                    //若无组织机构，那么找寻原有的存储数据，进行处理
                    data.userOrgSet = userOrgSet;
                }
                //岗位的数据拼接处理
                data.userPostSet = [];
                if(mini.get("postID").getSelecteds().length>0){
                    var Posters = mini.get("postID").getSelecteds();
                    for(var i=0;i<Posters.length;i++){
                        (function(cur_obj){
                            var cur_dt = {};
                            cur_dt.postID = cur_obj.postID;
                            cur_dt.userID = $("#userID").val();
                            data.userPostSet.push(cur_dt);
                            cur_dt = null;
                        })(Posters[i]);
                    }
                }
                //职务的数据拼接处理
                data.dutyEntitySet = [];
                if(mini.get("dutyID").getSelecteds().length>0){
                    var userDtuySet = mini.get("dutyID").getSelecteds();
                    for(var i=0;i<userDtuySet.length;i++){
                        (function(cur_obj){
                            var cur_dt = {};
                            cur_dt.dutyID = cur_obj.dutyID;
                            data.dutyEntitySet.push(cur_dt);
                            cur_dt = null;
                        })(userDtuySet[i]);
                    }
                }
                //删除多余的字段
                delete data.orgID;
                delete data.postID;
                delete data.dutyID;
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    dataType: "text",
                    data:JSON.stringify(data),
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
                if(data.getNode>0){
                    parentOrgID=data.getNode;
                }else{
                    parentOrgID="";
                }
                currentOrgId = data.topNode;
                //下拉框数据的添加
                page.logic.load_sidebar();//组织机构
                page.logic.select_option(userSex_url,"userSex"); //性别
                page.logic.select_option(userEducation_url,"userEducation");   //学历
                page.logic.select_option(userAttribute_url,"userAttributeID"); //员工属性
                page.logic.select_option(userLvl_url,"userLvlID"); //行政级别（员工级别）
                page.logic.select_option(userNature_url,"userNatureID"); //员工性质
                page.logic.selectDuty(dutyUrl+"?orgID="+currentOrgId,"dutyID");    //职务
                if (pageMode == PageModelEnum.NewAdd) {
                    page.logic.selectPost(postNames_url,"postID");    //岗位
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.userID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        //职务
                        page.logic.selectDuty(dutyUrl+"?orgID="+currentOrgId,"dutyID",data.dutyEntitySet);
                        //出生日期设置
                        mini.get("userBirthday").setValue(ECS.util.timestampToTime(data.userBirthday).split("T")[0]);
                        //入职时间设置
                        mini.get("userJoinDatetime").setValue(ECS.util.timestampToTime(data.userJoinDatetime).split("T")[0]);
                        //组织机构设置
                        mini.get("orgID").setValue(data.orgName);
                        //岗位
                        page.logic.selectPost(postNames_url,"postID",data.userPostSet);
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //岗位下拉框
            selectPost:function(url,dom_id,cb){
                $.ajax({
                    url:url,
                    type:"GET",
                    async:false,
                    success:function (Data) {
                        mini.get(dom_id).load(Data);
                        if(cb){
                            var postIdList="";
                            for(var i=0;i<cb.length;i++){
                                for(var j=0;j<Data.length;j++){
                                    if(Data[j].postID==cb[i].postID){
                                        postIdList+=cb[i].postID+",";
                                    }
                                }
                            }
                            mini.get(dom_id).setValue(postIdList)
                        }
                    }
                });
            },
            //职务下拉框
            selectDuty:function(url,dom_id,cb){
                $.ajax({
                    url:url,
                    type:"GET",
                    async:false,
                    success:function (Data) {
                        mini.get(dom_id).load(Data);
                        if(cb){
                            var dutyIdList="";
                            for(var i=0;i<cb.length;i++){
                                for(var j=0;j<Data.length;j++){
                                    if(Data[j].dutyID==cb[i].dutyID){
                                        dutyIdList+=cb[i].dutyID+",";
                                    }
                                }
                            }
                            mini.get(dom_id).setValue(dutyIdList)
                        }
                    }
                });
            },
            //删除
            onCloseClick: function(e) {
                var obj = e.sender;
                obj.setText("");
                obj.setValue("");
            },
            //侧边栏菜单添加
            load_sidebar:function(){
                var _url;
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    _url=porg_url;
                }else{
                    _url=org_url+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE;
                }
                $.ajax({
                    url: _url,
                    type: "GET",
                    async: false,
                    success: function (Data) {
                        if(Data.length>0){
                            mini.get("orgID").loadList(Data, "orgId", "orgPID");
                            mini.get("orgID").setValue(parentOrgID?parentOrgID:currentOrgId);
                        }
                    }
                });
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    async:false,
                    success:function (Data) {
                        if(cb){
                            //组织机构
                            mini.get("orgID").loadList(Data, "orgId", "orgPID");
                            mini.get("orgID").setValue(parentOrgID);
                            page.logic.selectDuty(dutyUrl+"?orgID="+parentOrgID,"dutyID");    //职务
                        }else{
                            //清空下拉框
                            // $(oPar).html("");
                            $("#"+oPar).html("");
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //性别、学历
                                    if(cur_key.key || cur_key.key==0){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }
                                    //员工属性
                                    if(oPar=="userAttributeID"){
                                        var $oPtion = $('<option value="'+cur_key.UserAttributeID+'">'+cur_key.userAttribute+'</option>');
                                    }
                                    //行政级别（员工级别）
                                    if(oPar=="userLvlID"){
                                        var $oPtion = $('<option value="'+cur_key.userLvlID+'">'+cur_key.userLvl+'</option>');
                                    }
                                    //员工性质
                                    if(cur_key.userNatureID){
                                        var $oPtion = $('<option value="'+cur_key.userNatureID+'">'+cur_key.userNature+'</option>');
                                    }
                                    $("#"+oPar).append($oPtion);
                                })(Data[i]);
                            }
                        }
                    }
                })
            },
            //不允许选择之后的日期
            onDrawDate:function(e){
                var date = e.date;
                var d = new Date();
                if (date.getTime() > d.getTime()) {
                    e.allowSelect = false;
                }
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function () {
                jQuery.validator.addMethod("email",
                    function(value,element,params){
                        var exp = new RegExp(params);
                        return exp.test(value);
                    },"请输入正确的邮箱地址!");
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        userName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        userUID: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        userCode: {
                            // required: true,
                            rangelength: [0, 200]
                        },
                        userIDCard: {
                            // required: true,
                            idcard:true
                        },
                        userSex:{
                            // required: true
                        },
                        orgID: {
                            required: true
                        },
                        // userMobile: {
                        //     required: true,
                        //     mobile:true
                        // },
                        // userPhone: {
                        //     required: true,
                        //     simplePhone:true
                        // },
                        userEmail: {
                            // required: true,
                           // email: /^\w+([-+.]\w+)*@\w+([-.]\\w+)*\.\w+([-.]\w+)*$/
                        },
                        userEducation: {
                            // required: true
                        },
                        userAttributeID:{
                            // required: true
                        }
                    }
                })
            }
        }
    };
    page.init();
    window.page = page;
});