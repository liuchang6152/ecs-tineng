var initUrl = ECS.api.emUrl + '/meetingUser/getMeeting';    //会议相关信息
var getAlertInformationUrl = ECS.api.apUrl + '/fileAlarmChild/getAlertInformation';    //接警信息
var updateStatusUrl = ECS.api.emUrl + '/initiateMeeting/call';    //更新接通状态
//var getOut = ECS.api.emUrl + '/meetingUser/leaveMeeting';   //离场
window.pageLoadMode = PageLoadMode.None;
var vm = new Vue({
	el: '#main',
	data: {
		total: 20,
		items: [],
		meetingAbstract: '',
		meetingTheme: '',
		startTime: '',
		meetingRecordId: '',
		crtUserName: '',
		usersCount: 0,
		eventId: '',
		AlertInfo: '',
		show: true,
		heigth:''
	},
	mounted: function () {
		this.heigth = document.body.clientHeight - 120 + 'px';
	}
	, methods: {
		isShow: function (e) {
			if (e && e.length > 0) {
				return true;
			}
			return false;
		},
		getPhone: function (obj) {
			//isHandset (0座机，1手机)
			console.log(JSON.stringify(obj));
			return obj.isHandSet == 0 ? obj.phone : obj.mobile;
		}
	}

});

$(function () {
	var page = {
		init: function () {
			mini.parse();
			page.bindUI();
			// page.logic.init();
			/*==========================右键============================== */

			context.init({ preventDoubleContext: false });

			context.attach('html', [
				{ header: '操作' },
				{
					text: '呼叫', action: function (e) {
						var select = $(".selectorDiv li input:checked + label");
						var userList = [];
						$(select).each(function (i) {
							var a = $(select[i]).attr("data");
							userList.push(a);
						});
						parent.parent.makecall(userList);

					}
				},
				// {
				// 	text: '请离场', action: function (e) {
				// 		var select = $(".selectorDiv .init input:checked");
				// 		page.logic.GetOut(select[0].value);
				// 	}
				// },
				{
					text: '屏蔽', action: function (e) {
					
						var select = $(".selectorDiv li input:checked + label");
						var userList = [];
					
						$(select).each(function (i) {
							var a = $(select[i]).attr("data");
							userList.push(a);
						});
						parent.meetCtrl(userList, 1);
					
						$(select).addClass("off");
						$(select).removeClass("on");
					}
				}, {
					text: '取消屏蔽', action: function (e) {
						var select = $(".selectorDiv li input:checked + label");
						var userList = [];
						$(select).each(function (i) {
							var a = $(select[i]).attr("data");
							userList.push(a);
						});
						parent.meetCtrl(userList, 0);
						$(select).addClass("on");
						$(select).removeClass("off");
					}
				}
			]);


			$(document).on('mouseover', '.me-codesta', function () {
				$('.finale h1:first').css({ opacity: 0 });
				$('.finale h1:last').css({ opacity: 1 });
			});

			$(document).on('mouseout', '.me-codesta', function () {
				$('.finale h1:last').css({ opacity: 0 });
				$('.finale h1:first').css({ opacity: 1 });
			});
			/*==========================右键============================== */

		},
		table: {},
		bindUI: function () {
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			$('#btnSelect').click(function () {
				page.logic.Select();
			});

			$('#btnOffMeeting').click(function () {
				page.logic.OffMeeting();
			});

			$('#btnOff').click(function () {
				page.logic.Off();
			});

			$('#btnOn').click(function () {
				page.logic.On();
			});
			$('#btnLoad').click(function () {
				page.logic.init();
			});

		},
		data: {
			param: {
			}
		},
		logic: {
			setStatus: function (number, callType) {
				 if(number.length==14&& number.substr(0,3)=="080"){
					number = number.substr(3,11);
				 }
				if (callType == 3 || callType == 4) {
					$.ajax({
						url: updateStatusUrl + "?metingRecordId=" + vm.meetingRecordId + "&phone=" + number + "&status=" + Number(callType - 2),
						async: false,
						type: 'get',
						data: {},
						dataType: "json",
						contentType: "application/json;charset=utf-8",
						success: function (result) {
							page.logic.init();
						},
						error: function (result) {
							layer.msg("系统繁忙");
						}
					})
				}


			},
			setData: function (result) {
				vm.meetingRecordId = result.meetingRecordPojo.meetingRecordId;
				vm.eventId = result.meetingRecordPojo.eventId;
				if (!vm.eventId) {
					vm.show = false;
				}
				page.logic.init();
			},
			init: function () {
				var d = { meetingRecordId: vm.meetingRecordId };
				$.ajax({
					url: initUrl,
					async: true,
					data: d,
					dataType: "json",
					// timeout: 1000,
					contentType: "application/json;charset=utf-8",
					type: 'get',
					success: function (result) {
						if (result.isSuccess) {
							vm.items = result.result.users;
							vm.total = 20 - vm.items.length;
							vm.meetingAbstract = result.result.meetingAbstract;
							vm.meetingTheme = result.result.meetingTheme;
							vm.startTime = result.result.startTime;
							vm.crtUserName = result.result.crtUserName;
							vm.usersCount = result.result.usersCount;
						}
					},
					error: function (result) {
						var errorResult = $.parseJSON(result.responseText);
						console.log(JSON.stringify(errorResult));
						layer.msg("系统繁忙");
					}
				});

				if (vm.eventId) {
					var d = { eventId: vm.eventId };
					$.ajax({
						url: getAlertInformationUrl,
						async: true,
						data: d,
						dataType: "json",
						// timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'get',
						success: function (result) {
							vm.AlertInfo = page.logic.Convert(result);

						},
						error: function (result) {

							// var errorResult = $.parseJSON(result.responseText);
							// console.log(JSON.stringify(errorResult));
							// layer.msg("系统繁忙");
						}
					});
				}
			},

			Convert: function (items) {


				items.initTime = moment(items.initTime).format('YYYY-MM-DD HH:mm:ss');


				return items;
			},
			Select: function () {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '90%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'Select.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {

							'title': '会议详情'

						};

						iframeWin.page.logic.setData(vm.meetingRecordId,vm.items);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.init();
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})

			},
			// GetOut: function (meetingUserId) {
			// 	var d = { meetingUserId: meetingUserId };
			// 	$.ajax({
			// 		url: getOut,
			// 		async: true,
			// 		data: d,
			// 		dataType: "json",
			// 		timeout: 1000,
			// 		contentType: "application/json;charset=utf-8",
			// 		type: 'put',
			// 		success: function (result) {
			// 			if (result.isSuccess) {
			// 				layer.msg("删除成功！", {
			// 					time: 1000
			// 				}, function () {
			// 					grid.reload();
			// 				});
			// 			} else {
			// 				layer.msg(result.message)
			// 			}
			// 		},
			// 		error: function (result) {
			// 			var errorResult = $.parseJSON(result.responseText);
			// 			layer.msg("系统繁忙");
			// 		}
			// 	});
			// },
			OffMeeting: function () {
				var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
				parent.layer.close(index);
			},
			Off: function () {
				var nums = page.logic.getPhoneNum();
				parent.meetCtrl(nums, 1);

				var select = $(".selectorDiv li.init input + label");
				$(select).addClass("off");
				$(select).removeClass("on");
			},
			On: function () {
			

				var nums = page.logic.getPhoneNum();
				parent.meetCtrl(nums, 0);

				var select = $(".selectorDiv li.init input + label");
				$(select).addClass("on");
				$(select).removeClass("off");
			},
			getPhoneNum: function () {
				//isHandset (0座机，1手机)
				var nums = [];
				for (var i = 0, len = vm.items.length; i < len; i++) {
					nums.push(vm.items[i].isHandSet == 0 ? vm.items[i].phone : vm.items[i].mobile);
				}
				return nums;
			},
			startMeetingRecord: function () {
				if (vm.eventId) {
					parent.startRecord(parent.currentPcNum, vm.eventId);
				}
				else {
					parent.startRecord(parent.currentPcNum, '');
				}
			}
		}
	};
	page.init();
	window.page = page;
});



