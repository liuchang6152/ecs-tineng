var addUrl = ECS.api.emUrl + '/Device';//新增保存
var getSingleUrl = ECS.api.emUrl + '/Device';//编辑
var enterpriseUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var deviceCategUrl = ECS.api.emUrl + '/Device/deviceByDeviceCatg'; //设备大类
var deviceTypeUrl = ECS.api.emUrl + '/Device/deviceByDeviceType'; //设备小类
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
            this.bindUI();
            page.logic.cbxDeviceCateg();//大类
            page.logic.cbxDeviceType();//小类
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
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    page.logic.cbxEnterprise(ECS.sys.Context.SYS_ENTERPRISE_CODE);//企业
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.deviceId + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        page.logic.cbxEnterprise(data.enterpriseCode);//企业
                        $("#enterpriseID").attr("disabled","disabled");
                        ECS.form.setData('AddOrEditModal', data);
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
            /**
             * 企业
             */
            cbxEnterprise:function(code){
                if(ECS.sys.isHQ(code)){
                    ECS.ui.getCombobox("enterpriseID", enterpriseUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        codeField:"orgId",//获取id
                        valueField: "orgSname",
                        async:true
                    }, null);
                }else{
                    ECS.ui.getCombobox("enterpriseID", enterpriseUrl, {
                        selectValue: code,
                        keyField: "orgCode",
                        codeField:"orgId",//获取id
                        valueField: "orgSname",
                        async:true
                    }, null);
                    $("#enterpriseID").attr("disabled","disabled");
                }
            },
            /**
             * 大类
             */
            cbxDeviceCateg:function(){
                ECS.ui.getCombobox("deviceCatgId", deviceCategUrl, {
                    selectFirstRecord:true,
                    async:false
                }, null,page.logic.cbxDeviceType);
            },
            /**
             * 小类
             */
            cbxDeviceType:function(){
                var pid=$("#deviceCatgId").val();
                ECS.ui.getCombobox("deviceTypeId", deviceTypeUrl, {
                    async:false,
                    data:{
                        'deviceCatgId':pid
                    }
                }, null);
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
                data["enterpriseID"]=$("#enterpriseID").find("option:selected").attr("code");
                for(var key in data){
                    data[key]=$.trim(data[key]);
                }
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
                        enterpriseID: {
                            required: true
                        },
                        deviceName: {
                            required: true
                        },
                        deviceCatgId: {
                            required: true
                        },
                        deviceTypeId: {
                            required: true
                        },
                        activationPattern: {
                            required: true
                        },
                        deviceNumber: {
                            required: true
                        },
                        ipAddress: {
                            ipv4:true
                        },
                        sortNum: {
                            required: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});