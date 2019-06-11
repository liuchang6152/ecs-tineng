
var searchUrl = ECS.api.eddUrl + '/eddSchedul';
var searcVehiclehUrl = ECS.api.rttUrl + '/vehicle/getListByOrgId';
var presentJeevesUrl = ECS.api.eddUrl + '/EDDPresentJeeves/all?&pageSize=9999&pageIndex=0';
var updateUrl = ECS.api.rttUrl + '/vehicle/updateStatus';
var vm = new Vue({
	el: '#main',
	data: {
		items: [],
		vehicles: [],
		presentJeeves: []
	}, methods: {

		gernerateId: function (index) {

			return "sp_" + index;

		},
		gernerateSelId: function (index) {

			return "sel_" + index;

		},
		isShow: function (e) {
			if (e && e.length > 0) {
				return true;
			}
			return false;
		},
		mouseout: function () {
			layer.close(vm.tips);
		},

		mouseover: function (items, id) {
			if (!items) {
				return;
			}
			var div = "";
			for (var index = 0; index < items.length; index++) {
				var item = items[index];
				div = div + "<div class='col-xs-4'>";
				div = div + " <label class='control-label'>" + item.systemName + "</label>";
				div = div + "  </div>";
				div = div + "<div class='col-xs-4'>";
				div = div + " <label class='control-label'>" + item.relevantModuleCh + "</label>";
				div = div + "  </div>";
				div = div + "<div class='col-xs-4'>";
				div = div + " <label class='control-label'>" + item.priority + "</label>";
				div = div + "  </div>";
			}

			var html = ""
				+ "<div style='text-align: center;  class='form-horizontal'>"
				+ " <div class='row' >"
				+ " <div class='col-xs-12'>"
				+ " <div class='form-group'>"
				+ " <div class='col-xs-4'>"
				+ " <label class='control-label'>系统分类</label>"
				+ "  </div>"
				+ "  <div class='col-xs-4' >"
				+ " <label class='control-label'>相关部件</label>"
				+ "  </div>"
				+ "  <div class='col-xs-4' >"
				+ " <label class='control-label'>故障等级</label>"
				+ "  </div>"

				+ div
				+ "  </div>"
				+ "  </div>"

				+ "  </div>";
			vm.tips = layer.tips(html, '#' + id, { area: ['400px', 'auto'], time: 0, tips: [1, '#c00'] });
		},

	}

});



$(function () {



	var page = {
		//页面初始化
		init: function () {
			ECS.sys.RefreshContextFromSYS();
			page.logic.PersonArr();
			page.logic.VehicleArr();
			page.logic.PresentJeevesArr();
			//获取用户的相关数据

			mini.parse();
			this.bindUI();

		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});

			// 值班详情
			$('#btnDetail').click(function () {


				page.layerAlter("Index.html?", '值班表维护');
			});

			// 
			$('#btnVehicleDetail').click(function () {
				page.layerAlter("../../../html/rtt/Vehicle/index.html?", '应急车辆');
			});
			// 
			$('#btnPresentJeevesDetail').click(function () {

				page.layerAlter("../PresentJeeves/index.html?", '占道维护');
			});

		},
		data: {
			param: {}
		},

		layerAlter: function (url, title) {
			layer.open({
				type: 2,
				skin: 'layui-layer-rim', //加上边框
				area: ['80%', '70%'],
				content: url + Math.random(),
				title: title
			});
		},
		template: function (info, flag) {
			var phoneNum = flag == 1 ? info.userMobile : info.userPhone;
			window.parent.call(phoneNum);
		},
		//定义业务逻辑方法
		logic: {
			initTable: function () {
			},
			callMobile: function (e) {
				page.template(e, 1);
			},
			callPhone: function (e) {
				page.template(e, 2);
			},
			noneClick: function () {

			},
			Status: function (obj) {
				if (obj.abnormalStatus == 1) {
					var type = 'auto';
					var msg = "存在异常";
					layer.open({
						type: 1
						, offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
						, id: 'layerDemo' + type //防止重复弹出
						, content: '<div style="padding: 20px 100px;">' + msg + '</div>'
						, btn: '关闭'
						, btnAlign: 'c' //按钮居中
						, shade: 0 //不显示遮罩
						, yes: function () {
							layer.closeAll();
						}
					});
				}
			},

			VehicleClick: function (obj) {
				var e = obj.vehicleID;
				$("#sel_" + e).val(obj.poactionStatus);
				$("#sp_" + e).toggle();
				$("#sel_" + e).toggle();
			},
			Vehiclechange: function (obj) {
				var e = obj.vehicleID;
				//	$("#sp_"+e).text($("#sel_"+e +" option:selected").text());
				$("#sp_" + e).toggle();
				$("#sel_" + e).toggle();
				var param = { vehicleID: obj.vehicleID, poactionStatus: $("#sel_" + e).val() };
				$.ajax({
					url: updateUrl + "?vehicleID=" + obj.vehicleID + "&poactionStatus=" + $("#sel_" + e).val(),//请求的地址
					async: false,
					type: 'PUT',
					data: {},
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						if (result.isSuccess) {
							page.logic.VehicleArr();
						}
						layer.msg(result.message);
					},
					error: function (result) {
						layer.msg(result.responseText);
					}
				})


			},

			PersonArr: function () {
				$.ajax({
					url: searchUrl,
					type: "get",
					success: function (data) {
						vm.items = data;
					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
			VehicleArr: function () {
				$.ajax({
					url: searcVehiclehUrl + '?orgCode=' + ECS.sys.Context.SYS_ENTERPRISE_CODE,
					type: "get",
					success: function (data) {
						vm.vehicles = data;
					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
			PresentJeevesArr: function () {
				$.ajax({
					url: presentJeevesUrl,
					type: "get",
					success: function (data) {
						vm.presentJeeves = page.logic.Convert(data.pageList);
					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
			Convert: function (items) {
				items.forEach(function (item) {
					//（开始时间和结束时间前后各增加一天）
					// item.startDate = item.startDate + 86400000;
					// item.endDate = item.endDate + 86400000;
					item.noticeDate = moment(item.noticeDate).format('YYYY-MM-DD ');
					item.startDate = moment(item.startDate).format('YYYY-MM-DD ');
					item.endDate = moment(item.endDate).format('YYYY-MM-DD ');
				});
				return items;
			}



		}
	};
	page.init();
	window.page = page;
});