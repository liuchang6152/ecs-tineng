var noFeedbackUrl = ECS.api.apUrl + '/firemanGo/noFeedback';   //命令下达
var changeStateUrl = ECS.api.apUrl + '/firemanGo/changeState';   //命令下达
var vm = new Vue({
    el: '#main',
    data: {
        items: [],

        eventId: ''

    }
});
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
          
         
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
            setData: function (data,eventId) {
                vm.eventId = eventId;
                page.logic.initData(data);
            },

            initData: function (data) {
                if(data.result){
                    var tel =[];

                    for (var index = 0; index < data.result.length; index++) {
                        for (var k = 0; k < data.result[index].list.length; k++) {
                            var element =  data.result[index].list[k];
                            tel.push(element.contactWay);
                        }
                    }
                   
                    
                  //  parent.parent.teamcall(tel);
                }
                vm.items = data.result;
            },

            singleCall:function(item){
                   parent.parent.callNs(item.contactWay,vm.eventId);
            },
            /**
             * 保存
             */
            save: function (item) {
                var submitData =  {"firemanGoID":item.firemanGoID};
                $.ajax({
                    url: changeStateUrl,
                    async: false,
                    type: 'put',
                    data:JSON.stringify(submitData),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#'+item.firemanGoID).attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.isSuccess) {
							layer.msg("确认成功！", {
								time: 1000
							}, function() {
                               parent.page.logic.init();
                               $('#'+item.firemanGoID).text("已反馈");
                               $('#'+item.firemanGoID).prev(['data='+item.firemanGoID]).hide();
							});
						} else {
							layer.msg(result.message);
						}
                    },
                    error: function (result) {
                        $('#'+item.firemanGoID).attr('disabled', false);
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
            }
        }
    }
    page.init();
    window.page = page;
})