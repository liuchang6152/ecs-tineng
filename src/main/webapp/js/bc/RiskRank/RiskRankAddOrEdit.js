var addUrl = ECS.api.bcUrl + '/riskRank';                                          //新增、编辑
var getSingleUrl = ECS.api.bcUrl + '/riskRank';                                   //查询单条数据
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            page.logic.cbxOrgID();//企业
            //是否启用
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            //是否接警
            $('#isPickup').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            //是否发送短信
            $('#isSendSMS').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            //是否发送群呼
            $('#isPhoneCall').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
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
            //当“损害等级”下拉框值改变时，实时变更“显示等级”一项的值；
            $("#lossRank").change(function(){
                $("#rankDisplay").val($(this).find("option:selected").text()+$("#possibilityRank").val());
            });
            //当“可能性等级”下拉框值改变时，实时变更“显示等级”一项的值；
            $("#possibilityRank").change(function(){
                $("#rankDisplay").val($("#lossRank").find("option:selected").text()+$("#possibilityRank").val());
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
                    data:$.param(data),
                    dataType: "text",
                    success: function (result) {
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message);
                        }
                    }, error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            /**
             * 企业
             */
            cbxOrgID:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("enterpriseCode", enterpriseCodeUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        async:false
                    });
                }else{
                    ECS.ui.getCombobox("enterpriseCode", enterpriseCodeUrl, {
                        selectValue:ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        async:false
                    });
                    $("#enterpriseCode").attr("disabled",true);
                }
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    $("#rankDisplay").val("A1");
                    return;
                }else{
                    $("#enterpriseCode").attr("disabled","disabled");
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.riskRankID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        //是否接警
                        $("#isPickup").iCheck('update');
                        //是否发送短信
                        $("#isSendSMS").iCheck('update');
                        //是否发送群呼
                        $("#isPhoneCall").iCheck('update');
                        //是否启用
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
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
                        enterpriseCode: {
                            required: true
                        },
                        lossRank: {
                            required: true
                        },
                        possibilityRank: {
                            required: true
                        },
                        rankDisplay: {
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