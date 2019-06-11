var searchUrl = ECS.api.bcUrl + '/duty'; //查询接口路径
var dutyTypeUrl =  ECS.api.bcUrl + '/duty/type'; //职务类型
var OrgNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';  //企业名称
var inUseUrl = ECS.api.commonUrl + "/getInUse";  //是否启用
var dutyLevelUrl = ECS.api.bcUrl +'/duty/level' ;//职务级别
var getSingleUrl =ECS.api.bcUrl+'/duty/oneDuty';//单条查询
var addUrl=ECS.api.bcUrl+'/duty';//新增
var mtrlTypeEnumUrl=ECS.api.bcUrl+'/duty/mtrlTypeEnum';//企内/外
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
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.cbxOrgName();//企业名称
            page.logic.cbxDutyType();//职务类型
            page.logic.cbxDutyLevel();//职务级别
            page.logic.cbxMtrlTypeName();//企内/外
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
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
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
                }
                $.ajax({
                    url: getSingleUrl + "?dutyID="+data.dutyID + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        $("#orgCode").attr("disabled",true);
                        //登记时间
                        mini.get("sortNum").setValue(data.sortNum);
                        $("#crtDate").val(ECS.util.timestampToTime(data.crtDate));
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
            //企业名称
            cbxOrgName:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("orgCode", OrgNameUrl, {
                        selectFirstRecord: true,
                        async:false,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname"
                    }, null);
                    $("#orgCode").attr("disabled",false);
                }else{
                    ECS.ui.getCombobox("orgCode", OrgNameUrl, {
                        selectValue:ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async:false,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname"
                    }, null);
                    $("#orgCode").attr("disabled",true);
                }
            },
            /**
             * 职务类型
             */
            cbxDutyType:function(){
                ECS.ui.getCombobox("dutyTypeID", dutyTypeUrl, {
                    selectFirstRecord:true,
                    async:false,
                    keyField:"dutyTypeID",
                    valueField:"dutyTypeName"
                });
            },
            /**
             * 职务级别
             */
            cbxDutyLevel:function(){
                ECS.ui.getCombobox("dutyLevelID", dutyLevelUrl, {
                    async:false,
                    keyField:"dutyLevelID",
                    valueField:"dutyLevelName"
                });
            },
            /**
             * 企内/外
             */
            cbxMtrlTypeName:function(){
                ECS.ui.getCombobox("mtrlType", mtrlTypeEnumUrl, {
                    selectValue:"0",
                    async:false
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
                data["sortNum"] = mini.get("sortNum").getValue();
                data["orgID"] = $("#orgCode").find("option:selected").attr("code");
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
                    data:$.param(data),
                    dataType:"text",
                    contentType: "application/x-www-form-urlencoded",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg(result,{
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
                        orgCode: {
                            required: true
                        },
                        dutyTypeID: {
                            required: true
                        },
                        dutyLevelID: {
                            required: true
                        },
                        dutyName: {
                            required: true,
                            maxlength:200
                        },
                        dutyCode: {
                            required: true,
                            ucode:/^[A-Za-z0-9]+$/
                        },
                        mtrlTypeName: {
                            required: true
                        },
                        sortNum: {
                            digits: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});