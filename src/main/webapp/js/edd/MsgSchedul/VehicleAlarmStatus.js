var initUrl = ECS.api.rttUrl + '/vehicle/getVehicleMalfunctionNoPage'; //队伍
var vehicleId;
$(function () {

	var page = {
		//页面初始化
		init: function () {
			this.bindUI();
			
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			$('#GPS定位系统').click(function () {
				page.logic.Status('GPS定位系统')
			});
			$('#动力监控系统').click(function () {
				page.logic.Status('动力监控系统')
			});
			$('#转向监控系统').click(function () {
				page.logic.Status('转向监控系统')
			});
			$('#制动监控系统').click(function () {
				page.logic.Status('制动监控系统')
			});
			$('#传动监控系统').click(function () {
				page.logic.Status('传动监控系统')
			});
			$('#错误操作').click(function () {
				page.logic.Status('错误操作')
			});
			$('#其他监控').click(function () {
				page.logic.Status('其他监控')
			});
			$('#空调电气控系统').click(function () {
				page.logic.Status('空调电气控系统')

			});
			$('#轮胎监控系统').click(function (e) {
				page.logic.Status('轮胎监控系统')


			});

		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {

			  /**
             * 初始化编辑数据
             */
            setData: function (data) {
				vehicleId =data;
				page.logic.load(vehicleId);
              
            },

			Status: function (obj) {
				page.logic.init(obj);
				$("text").attr('fill', '#60707d');
				$("#" + obj).attr('fill', '#FFF000')
				// var type = 'auto';
				// var msg = obj + "胎压不足";
				// layer.open({
				// 	type: 1
				// 	, offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
				// 	, id: 'layerDemo' + type //防止重复弹出
				// 	, content: '<div style="padding: 20px 100px;">' + msg + '</div>'
				// 	, btn: '关闭'
				// 	, btnAlign: 'c' //按钮居中
				// 	, shade: 0 //不显示遮罩
				// 	, yes: function () {
				// 		layer.closeAll();
				// 	}
				// });

			},


			/**
			 * 初始化表格
			 */
			init: function (name) {

				var flag;
				var grid = mini.get('grid');
				switch (name) {
					
					case "动力监控系统":
						flag = 1; break;
					case "传动监控系统":
						flag = 2; break;
					case "转向监控系统":
						flag = 3; break;
					case "制动监控系统":
						flag = 4; break;
					case "空调电气控系统":
						flag = 5; break;
					case "错误操作":
						flag = 6; break;
					case "轮胎监控系统":
						flag = 7; break;
					case "其他监控":
						flag = 8; break;
						case "GPS定位系统":
						flag = 9; break;
				}
				grid.set({
					url: initUrl + '?vehicleId='+vehicleId+'&systemId='+flag,
					ajaxType: 'GET'

				});

				grid.load();

			},

			load:function(){
				$.ajax({
					url: initUrl + '?vehicleId='+vehicleId,
					type: "get",
					dataType: "json",
					success: function (result) {
						for (var index = 0; index < result.length; index++) {
							var element = result[index];
						
							switch(element.systemId){
								case 1: 
								$("#g动力监控系统").attr('fill', '#FFF000');break;
								case 2: 
								$("#g传动监控系统").attr('fill', '#FFF000');break;
								case 3: 
								$("#g转向监控系统").attr('fill', '#FFF000');break;
								case 4: 
								$("#g制动监控系统").attr('fill', '#FFF000');break;
								case 5: 
								$("#g空调电气控系统").attr('fill', '#FFF000');break;
								case 6: 
								$("#g错误操作").attr('fill', '#FFF000');break;
								case 7: 
								$("#g轮胎监控系统").attr('fill', '#FFF000');break;
								case 8: 
								$("#g其他监控").attr('fill', '#FFF000');break;
							}
						}
					},
					error: function (result) {
					
					}
				})
			}
		}
	};
	page.init();
	window.page = page;
});