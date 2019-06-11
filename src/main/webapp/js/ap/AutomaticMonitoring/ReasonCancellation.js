var cancelkeyWordUrl = ECS.api.apUrl+"/AutomaticMonitoring/getKeywordReList?keyWordreCode=AP_AC_RFC_R";//取消下拉
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            this.bindUI();
            page.logic.cbxCancelWord();//取消下拉
        },
        bindUI: function () {
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $(".btnClose").click(function () {
                parent.cancelReason="";
                page.logic.closeLayer(false);
            });
        },
        logic: {
            data:{
                reason_dt:{}
            },
            setData: function (data) {
                $('#title-main').text(data.title);
            },
            //取消原因下拉
            cbxCancelWord:function(){
                ECS.ui.getCombobox("cancelWord", cancelkeyWordUrl, {
                    selectValue:"请选择",
                    keyField: "keyWord",
                    valueField: "keyWord",
                }, null,page.logic.cbxCancelReason);
            },
            cbxCancelReason:function(){
                if($("#cancelWord").val()=="请选择"){
                    return;
                }
                var oldValue = $('#cancelWord').val();
                if(page.logic.data.reason_dt[oldValue]){
                    return;
                }else{
                    page.logic.data.reason_dt[oldValue] = true;
                    var reason_arr = [];
                    for(var key in page.logic.data.reason_dt){
                        reason_arr.push(key);
                    }
                    $('#infoCancel').val(reason_arr.join(" "));
                    reason_arr = [];
                }
            },
            /**
             * 保存
             */
            save: function () {
               $("#infoCancel").val($.trim($("#infoCancel").val()));
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                parent.cancelReason=$.trim($("#infoCancel").val());
                page.logic.closeLayer(true);
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
                        infoCancel: {
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