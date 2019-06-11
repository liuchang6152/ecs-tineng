var addUrl = ECS.api.bcUrl + '/systemRegistersisPoint';
var getSingleUrl = ECS.api.bcUrl + '/systemRegistersisPoint';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
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
            page.logic.initOrgCode(enterpriseCodeUrl);//企业
        },
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            })
        },
        logic: {
            /**
             * 企业
             */
            initOrgCode:function(menu_url,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    async:false,
                    success:function (data) {
                        mini.get("enterpriseCode").loadList(data, "orgId", "orgPID");
                        //若是企业用户，设置为不可用状态；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                        }else{
                            mini.get("enterpriseCode").disable();
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                    }
                                })(data[w]);
                            }
                        }
                        cb && cb();
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
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.systemID + "?now=" + Math.random(),
                    type: "get",
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal', data);
                        $("#mntUserName").val(ECS.sys.Context.SYS_USER_NAME);
                        mini.get("sortNum").setValue(data.sortNum);
                        //企业
                        mini.get("enterpriseCode").disable();
                        mini.get("enterpriseCode").setValue(data.enterpriseCode);
                        $("#inUse").iCheck('update');   //是否启用
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
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
                data["sortNum"] = mini.get("sortNum").getValue();
                //企业的编码
                if(mini.get("enterpriseCode").getSelectedNode()){
                    data["enterpriseCode"] = mini.get("enterpriseCode").getSelectedNode().orgCode;
                }else{
                    //取默认存储的值；
                    data["enterpriseCode"] = ECS.sys.Context.SYS_ENTERPRISE_CODE;
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
                        systemName: {
                            required: true,
                            maxlength: 200
                        },
                        systemUID: {
                            required: true,
                            maxlength: 36
                        },
                        address: {
                            required: true,
                            maxlength: 200
                        },
                        path: {
                            required: true,
                            maxlength: 200
                        }
                    }
                })
            }
        }
    };
    page.init();
    window.page = page;
});