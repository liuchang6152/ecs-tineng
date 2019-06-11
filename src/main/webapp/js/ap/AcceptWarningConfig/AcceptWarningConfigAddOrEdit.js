var addUrl = ECS.api.apUrl + '/RuleConfig';
var getSingleUrl = ECS.api.apUrl + '/RuleConfig/';//查询某一条数据
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';//企业名称
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
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
                //获取用户的相关数据
                ECS.sys.RefreshContextFromSYS();
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    $("#equalLvl").find("option[value='2']").attr("selected",true);
                    $("#pushType").find("option[value='1']").attr("selected",true);
                    page.logic.cbxenterpriseID(ECS.sys.Context.SYS_ENTERPRISE_CODE);//企业名称
                    return;
                }
                $("#equalLvl").attr("disabled",true);
                $.ajax({
                    url: getSingleUrl + data.ruleConfigID +"?now=" + Math.random(),
                    type: "get",
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (text) {
                        page.logic.cbxenterpriseID(text.enterpriseCode);//企业名称
                        $("#enterpriseID").attr("disabled","disabled");
                        $("#equalLvl").find("option[value="+text.equalLvl+"]").attr("selected",true);
                        $("#pushType").find("option[value="+text.pushType+"]").attr("selected",true);
                        $("#ruleConfigID").val(text.ruleConfigID);
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
             * 企业名称
             */
            cbxenterpriseID:function(code){
                if(ECS.sys.isHQ(code)){
                    ECS.ui.getCombobox("enterpriseID", riskAreaTypeNameUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        codeField: "orgId",
                        valueField: "orgSname",
                        async:false
                    });
                }else{
                    ECS.ui.getCombobox("enterpriseID", riskAreaTypeNameUrl, {
                        selectValue:code,
                        keyField: "orgCode",
                        codeField: "orgId",
                        valueField: "orgSname",
                        async:false
                    });
                    $("#enterpriseID").attr("disabled",true);
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
                var data = ECS.form.getData('AddOrEditModal');
                data["enterpriseID"] = $("#enterpriseID option:selected").attr("code");//code才是 id
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
                            layer.msg(result.collection.error.message);
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
                    rules: {
                        enterpriseID: {
                            required: true
                        },
                        equalLvl: {
                            required: true
                        },
                        pushType: {
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