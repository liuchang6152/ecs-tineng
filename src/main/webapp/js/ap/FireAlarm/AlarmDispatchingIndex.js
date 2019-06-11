var eventUrl = ECS.api.apUrl + '/fileAlarmChild/getPoliceEventList';
var upPoliceStatusurl =  ECS.api.apUrl + '/policeProcess/upPoliceStatus';


var vm = new Vue({
    el: '#main',
    data: {
        items: [],

        eventId: ''

    }
});
$(function () {
	var index = parent.layer.getFrameIndex(window.name); //获取子窗口索引
	var page = {
		init: function () {
		
			this.bindUI();

		//	page.logic.initPage();
		
		},
		table: {},
		bindUI: function () {

			
		},
		data: {
			param: {}
		},
		logic: {
			
			
		
			setData: function (data) {
				vm.items = data;
			},
		
		

		
			detail: function (eventId) {
				$.ajax({
					url: upPoliceStatusurl+"?eventId="+eventId,
					async: true,
					type: "GET",
					dataType: "json",
				
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						// $('#btnSaveData').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						if (result.isSuccess) {
							var openUrl = '../../html/ap/FiremanGo/Index.html?r=' + Math.random();
							window.parent.layerOpen(openUrl,eventId,function(){},{closeBtn:0});
						page.logic.closeLayer(true);
						} else {
							layer.msg(result.message);
						}
					},
					error: function (result) {
						// $('#btnSaveData').attr('disabled', false);
						ECS.hideLoading();
						layer.msg("系统繁忙");
					}
				})
				
			},
		/**
			 * 关闭弹出层
			 */
			closeLayer: function(isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
		}
	};
	page.init();
	window.page = page;
});

