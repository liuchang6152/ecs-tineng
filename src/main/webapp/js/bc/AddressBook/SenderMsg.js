var sendUrl = ECS.api.emUrl + '/addressBook';


var phoneNum ="";
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
      
          
        },
        bindUI: function () {
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
       
         
          
        },
        logic: {
          /**
             * 初始化编辑数据
             */
            setData: function (data) {
             
                phoneNum = data.phone;
            },
           
         
            /**
             * 保存
             */
            save: function () {
                var data = ECS.form.getData('AddOrEditModal');
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
           
                var phone = [];
                phone.push(phoneNum);
                var submitData = {
                    phones:phone,
                    news : data.area_Msg
                }
              
            
                $.ajax({
                    url: sendUrl,
                    async: false,
                    type: 'POST',
                    data:JSON.stringify(submitData),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.isSuccess) {
							layer.msg("发送成功！", {
								time: 1000
							}, function() {
								page.logic.closeLayer(true);
							});
						} else {
							layer.msg(result.message);
						}
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                       // var errorResult = $.parseJSON(result.responseText);
                        layer.msg("系统繁忙");
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
                ECS.form.formValidate('AddOrEditModal', {
					rules: {
						area_Msg: {
							required: true
						}
					}
				});
               
             
            }
        }
    }
    page.init();
    window.page = page;
})