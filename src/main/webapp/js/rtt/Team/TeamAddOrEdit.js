var addUrl = ECS.api.rttUrl + '/team';
var getSingleUrl = ECS.api.rttUrl + '/team';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var constitutionUrl = ECS.api.rttUrl + '/team/getListByParam?param=constitutionName'; //建制
var teamPIDNameUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamPIDName';  //所属应急队伍
var teamTypeIDUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamType';  //队伍类型
var teamLvlUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamLvl';  //队伍级别
var teamSpecialityUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamSpeciality';  //救援专业
var teamTypeUrl = ECS.api.rttUrl + '/expert/getExpertTypeEnumList';  //队伍类别
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
window.ownDetail="";
var oid="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            $('#teamBaseLvl').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.initTeamTypeID();//队伍类型
            page.logic.initTeamLvl();//队伍级别
            page.logic.initTeamSpeciality();//救援专业
            page.logic.initTeamType();//队伍类别
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
            //成立时间
            mini.get("teamBuildDate").on("valuechanged",function(e){
                $("input[name=teamBuildDate]").next(".has-error").remove();
            });
            //负责人选择
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(单选)",PageModelEnum.Details)
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
                    if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                        ECS.ui.getCombobox("orgIds", riskAreaTypeNameUrl, {
                            selectFirstRecord:true,
                            keyField: "orgCode",
                            codeField:"orgId",
                            valueField: "orgSname",
                            async:false
                        },null,page.logic.initConstitution);
                        $("#orgIds").attr("disabled",false);
                    }else{
                        page.logic.cbxDrtDept(ECS.sys.Context.SYS_ENTERPRISE_CODE); //企业名称
                    }
                    page.logic.initConstitution();//建制
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#crtUserDept").val(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    var myDate = new Date;
                    var year = myDate.getFullYear();//获取当前年
                    var yue = myDate.getMonth()+1;//获取当前月
                    var date = myDate.getDate();//获取当前日
                    $("#crtDate").val(year+"-"+yue+"-"+date);
                    return;
                }else{
                    page.logic.initConstitution();//建制
                    $('#teamBaseLvl').attr('disabled', 'disabled');
                    $('#teamBaseLvl').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#orgIds").attr("disabled",true);
                    $("#constitutionNameID").attr("disabled",true);
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.teamID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        window.ownDetail={
                            "ownerContact": data.teamMobile,
                            "userID": data.userID,
                            "userName": data.teamManager
                        };
                        ECS.form.setData('AddOrEditModal', data);
                        page.logic.cbxDrtDept(data.orgEntitySet[0].enterpriseCode); //企业名称
                        mini.get("teamBuildDate").setValue(ECS.util.strToDate(data.teamBuildDate));
                        if(data.teamPID==null){
                            $("#teamPID").attr('disabled','disabled');
                        }
                        //登记时间
                        $("#crtDate").val(ECS.util.timestampToTime(data.crtDate));
                        $("#inUse").iCheck('update');
                        $("#teamBaseLvl").iCheck('update');
                        ECS.hideLoading();
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //企业名称
            cbxDrtDept:function(selCode){
                ECS.ui.getCombobox("orgIds", riskAreaTypeNameUrl, {
                    selectValue: selCode,
                    keyField: "orgCode",
                    codeField:"orgId",
                    valueField: "orgSname",
                    async:false
                },null,page.logic.initConstitution);
                $("#orgIds").attr("disabled",true);
            },
            /**
             * 建制
             */
            initConstitution: function () {
                window.ownDetail="";
                $("#teamManager").val("");
                $("#teamMobile").val("");
                $("#userID").val("");
                var pid="";
                if($("#orgIds").find("option:selected").attr("code")){
                    pid=$("#orgIds").find("option:selected").attr("code");
                }else{
                    pid="";
                }
                ECS.ui.getCombobox("constitutionNameID", constitutionUrl, {
                    keyField: "ID",
                    valueField: "NAME",
                    codeField:"NAME",
                    async:false,
                    data:{
                        name:pid
                    }
                }, null,page.logic.initteamPIDName);
            },
            /**
             * 所属应急队伍
             */
            initteamPIDName: function () {
                $("#constitutionName").val($("#constitutionNameID").find("option:selected").attr("code"));
                $("#teamPID").attr('disabled',false);
                if($("#constitutionNameID").val()==$("#constitutionNameID option:first").val()){
                    $("#teamPID").attr('disabled','disabled');
                }
                ECS.ui.getCombobox("teamPID", teamPIDNameUrl, {
                    keyField: "ID",
                    valueField: "NAME",
                    codeField:"NAME",
                    async:false,
                    data:{
                        "name":$("#constitutionNameID").find("option:selected").val(),
                        "oid":oid
                    }
                });
            },
            /**
             * 队伍类型
             */
            initTeamTypeID: function () {
                ECS.ui.getCombobox("teamTypeID", teamTypeIDUrl, {
                    selectValue: "",
                    keyField: "ID",
                    valueField: "NAME"
                }, null);
            },
            /**
             * 队伍级别
             */
            initTeamLvl: function () {
                ECS.ui.getCombobox("teamLvlID", teamLvlUrl, {
                    selectValue: "",
                    keyField: "ID",
                    valueField: "NAME",
                    codeField:"NAME"
                });
            },
            /**
             * 救援专业
             */
            initTeamSpeciality: function () {
                ECS.ui.getCombobox("teamSpecialityID", teamSpecialityUrl, {
                    selectValue: "",
                    keyField: "ID",
                    valueField: "NAME",
                    codeField:"NAME"
                });

            },
            /**
             * 队伍类别
             */
            initTeamType: function () {
                ECS.ui.getCombobox("teamType", teamTypeUrl, {
                    selectValue: 0
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
                    content: '../EmrgMtrl/SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "orgCode":$("#orgIds").val(),
                            "userInfo":window.ownDetail
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        $("#teamMobile").val(window.ownDetail.ownerContact);
                        $("#teamManager").val(window.ownDetail.userName);
                        $("#userID").val(window.ownDetail.userID);
                    }
                })
            },
            /**
             * 保存
             */
            save: function () {
                $("#teamSpeciality").val($("#teamSpecialityID").find("option:selected").attr("code"));
                $("#teamPIDName").val($("#teamPID").find("option:selected").attr("code"));
                $("#orgNames").val($("#orgIds").find("option:selected").attr("title"));
                $("#teamLvl").val($("#teamLvlID").find("option:selected").attr("code"));
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                if(data.teamBaseLvl>0&&data.teamPID==null){
                    layer.msg("当选中是否班组时，所属应急队伍为必填！");
                    return
                }
                var orgEntitySet=[];
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    orgEntitySet.push({enterpriseCode:$("#orgIds").val(),orgID:$("#orgIds").find("option:selected").attr("code")});
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    orgEntitySet.push({enterpriseCode:$("#orgIds").val(),teamID:$("#teamID").val(),orgID:$("#orgIds").find("option:selected").attr("code")});
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                data["orgEntitySet"]=orgEntitySet;
                delete data["orgIds"];
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
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
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
                jQuery.validator.addMethod("ucode",
                    function(value,element,params){
                        var exp = new RegExp(params);
                        return exp.test(value);
                    },"请输入正确格式!");
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        teamPhone: {
                            required: true,
                            ucode:/^\d{4}$|^([0-9]{3,4}-)?[0-9]{7,9}$/
                        },
                        orgIds:{
                            required: true
                        },
                        teamName: {
                            required: true,
                            maxlength:200
                        },
                        constitutionNameID: {
                            required: true
                        },
                        teamLvlID: {
                            required: true
                        },
                        teamTypeID: {
                            required: true
                        },
                        teamSpecialityID: {
                            required: true
                        },
                        teamManager: {
                            required: true,
                            maxlength: 200
                        },
                        teamBuildDate: {
                            required: true
                        },
                        teamMobile: {
                            required: true
                        },
                        teamType: {
                            required: true
                        },
                        teamAddress:{
                            maxlength: 200
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});