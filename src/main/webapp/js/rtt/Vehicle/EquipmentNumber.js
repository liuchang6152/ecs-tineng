var noFeedbackUrl = ECS.api.apUrl + '/firemanGo/noFeedback';   //命令下达
var changeStateUrl = ECS.api.apUrl + '/firemanGo/changeState';   //命令下达
var vm = new Vue({
    el: '#main',
    data: {
        items: []
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
            setData: function (data) {
                page.logic.initData(data);
            },

            initData: function (data) {
                if(data.length>0){
                  
                    for (var index = 0; index < data.length; index++) {
                        var element =  data[index];
                        vm.items.push({emrgequipId:element.emrgequipId,emrgequipName:element.emrgequipName,getEmrgequipAmount:element.getEmrgequipAmount});
                    }
                   
                    
                
                }
            
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