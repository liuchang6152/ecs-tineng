var getGisUrl = ECS.api.gisSurfaceUrl;//gis交互接口
var invalidAlarmUrl = ECS.api.apUrl + '/fileAlarmChild/invalidAlarm/'
var keyWordUrl = ECS.api.apUrl + "/fileAlarmChild/keywordre";//关键字
var mobileOrPhoneUrl = ECS.api.apUrl + "/fileAlarmChild/mobileOrPhone";//获取主要信息
var startUrl = ECS.api.apUrl + "/fileAlarmChild/addEvent";//开始受理
var saveUrl = ECS.api.apUrl + "/fileAlarmChild/updateEvent";//自动立案
var saveHOUrl = ECS.api.apUrl + "/fileAlarmChild/manualEvent";//自动立案
var type_url = ECS.api.apUrl + "/fileAlarmChild/getAccidentTypePojo";//案件类型
var detailUrl = ECS.api.apUrl + '/fileAlarmChild/singlePoliceRecord';  //案件详情
var saveEventUrl = ECS.api.apUrl + "/fileAlarmChild/saveEvent";//自动接警保存
var fIndex;
var treatStatus = false;
var eventId;
var readyState;
var currentTime;
var timeFlag = false;
window.pageLoadMode = PageLoadMode.None;
var vm = new Vue({
	el: '#content',
	data: {
		items: [],
		second: 0,
		masterCallNum: '',
		eventId: ''
	}
});
$(function () {
	var page = {
		//页面初始化
		init: function () {
			ECS.sys.RefreshContextFromSYS();
			mini.parse();
			this.bindUI();
			page.logic.initTable();
			page.logic.initPage();
			page.logic.getKeyWords();
			document.oncontextmenu = function () { return false; }

		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});

			$("#selectGIS").click(function () {
				page.logic.GIS();
			});

			$("#btnStart").click(function () {
				page.logic.Start(true);
			});

			$("#btnRepeat").click(function () {
				page.logic.Repeat();
			});

			$("#btnTransfer").click(function () {
				page.logic.Transfer();
			});

			$("#btnInvalid").click(function () {
				page.logic.Invalid();
			});

			$("#btnHangup").click(function () {
				page.logic.hangup();
			});

			$("#selectMedia").click(function () {
				page.logic.selectMedia();
			});

			//自动
			$("#btnSave").click(function () {
				page.logic.Save();
			});

			//手动
			$("#btnSave_HO").click(function () {
				page.logic.SaveHO();
			});

			//自动接警保存
			$("#btnSaveData").click(function () {
				page.logic.SaveData();
			});

			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			//列表弹出
			setData: function (data) {
				parent.setBusy();
				if (data) {

					$('#btnStart').attr('disabled', 'disabled');
					readyState = 1;
				}
				vm.eventId = data;
				if (data) {
					$.ajax({
						url: detailUrl + "?eventId=" + vm.eventId,
						type: "get",
						success: function (result) {

							eventId = vm.eventId;
							var data = page.logic.Convert(result);
							$("#startTime").val(data.alarmTime);
							$("#mobileOrPhone").val(data.mobileOrPhone);
							$("#mobileOrPhone").text(data.mobileOrPhone);
							$("#userName").val(data.userName);
							$("#userName").text(data.userName);
							$("#ringInstallAddress").val(data.ringInstallAddress);
							$("#ringInstallAddress").text(data.ringInstallAddress);
							$("#accidentType").val(data.accidentTypeId);
							$("#eventSummary").val(data.eventSummary);
							$("#answerInstallAddress").val(data.eventAddress);
							$("#isExplode").attr("checked", data.isExplode == 1 ? true : false);
							$("#isPersonIn").attr("checked", data.isPersonIn == 1 ? true : false);
							$("#fireLvl").val(data.fireLvl);
							$("#fireSubstanceTypeIds").val(data.fireSubstanceTypeIds);    //起火物质数组
							$("#fireSubstanceTypeNames").val(data.fireSubstanceName);    //起火物质数组
							$("#fireSubstanceTypeNames").text(data.fireSubstanceName);    //起火物质数组

							var msg = "摘机时长：" + data.receptionTime + "秒，受理时长：" + data.processingTime + "秒";
							$("#btnHangup").attr('disabled', 'disabled');
							$("#htitle").text(msg);
							$("#iTile").text("警情电话" + data.mobileOrPhone);
							page.data.param.enterpriseId = result.enterpriseId;
							page.data.param.unitId = result.unitId;
							page.data.param.riskAreaId = result.riskAreaId;
							page.data.param.optlRiskZoneId = result.optlRiskZoneId;

						},
						error: function (e) {
							//	alert(e);
						}
					});
				}

			},
			//电话弹出
			setData2: function (data) {
				page.data.param.masterCallNum = data.masterCallNum;
				page.data.param.ip = data.ip;
				vm.masterCallNum = data.masterCallNum;
				page.logic.getMobileOrPhone();
			},
			GIS: function () {
				var enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
				var pageMode = PageModelEnum.View;   //设置查看模式
				fIndex = layer.open({
					type: 2,
					closeBtn: 1,
					area: ['96%', '96%'],
					skin: 'new-class',
					shadeClose: false,
					title: '选择报警位置',
					shade: [0.8, '#393D49'],
					content: 'SelectMap.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							"enterpriseId": page.data.param.enterpriseId,        //企业ID
							"drtDeptId": page.data.param.unitId,               //二级单位ID
							"riskAreaId": page.data.param.riskAreaId,            //安全风险区ID
							"optlRiskSoneId": page.data.param.optlRiskZoneId,   //作业风险区ID
							// "riskAnlsObjId":riskAnlsObjId,      //风险分析对象ID
							// "pointId":pointId,                   //风险分析点ID
							"title": "选择报警位置"
						};
						iframeWin.page.logic.setData(data);

					},
					end: function () {
						if (page.data.param.res) {
							$('#answerInstallAddress').val(page.data.param.res);
							$("#eventSummary").val(page.data.param.res);
						}
					}
				})
			},
			initPage: function () {
				if (window.addEventListener) {
					window.addEventListener("message", page.logic.handleMessage, false);
				} else {
					window.attachEvent("onmessage", page.logic.handleMessage);
				}
			},
			handleMessage: function (event) {
				event = event || window.event;
				var type = "";
				switch (event.data[0].layerName) {
					case "企业":
						type = 2;
						break;
					case "二级单位":
						type = 3;
						break;
					case "安全风险区":
						type = 4;
						break;
					case "作业风险区":
						type = 5;
						break;
					default:
						type = "";
				}
				$.ajax({
					url: getGisUrl + "/surface/type/" + type + "/id/" + event.data[0].id,
					async: true,
					type: "get",
					dataType: "json",
					beforeSend: function () {
						ECS.showLoading();
					},
					success: function (result) {
						var res = '';
						if (result.enterpriseName) {
							res += result.enterpriseName;
						}
						if (result.unitName) {
							res += '-' + result.unitName;
						}
						if (result.riskAreaName) {
							res += '-' + result.riskAreaName;
						}
						if (result.optlRiskZoneName) {
							res += '-' + result.optlRiskZoneName;
						}
						page.data.param.enterpriseId = result.enterpriseId;
						page.data.param.unitId = result.unitId;
						page.data.param.riskAreaId = result.riskAreaId;
						page.data.param.optlRiskZoneId = result.optlRiskZoneId;
						$('#answerInstallAddress').val(res);
						$("#eventSummary").val(res);
						layer.close(fIndex);
						ECS.hideLoading();
					}, error: function (result) {
						ECS.hideLoading();
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},
			Start: function (flag) {
				if (!timeFlag) {
					return;
				}
				treatStatus = true;
				if (flag) {
					window.parent.answer();
				}
				$('#btnStart').css({ 'color': '#fff', 'background-color': '#2A72B5', 'border-color': '#2A72B5' });
			},
			AnswerSuccess: function (flag) {
				parent.setBusy();
				var param = {
					//TODO systemID
					alarmTime: currentTime,
					"seatIp": page.data.param.ip,
					"callPhone": page.data.param.masterCallNum,
					enterpriseId: page.data.param.enterpriseId,
					//	page.data.param.drtDeptId = result.orgCode;
					riskAreaId: page.data.param.riskAreaId,
					optlRiskSoneId: page.data.param.optlRiskSoneId,
					riskAnlsObjId: page.data.param.riskAnlsObjId,
					accidentTypeId: $("#accidentType").val(),
					fireLvl: $("#fireLvl").val(),
					// "systemID": 12345,
					"userName": $("#userName").text(),
					"mobileOrPhone": $("#mobileOrPhone").text(),
					"ringInstallAddress": $("#ringInstallAddress").text(),
					"answerInstallAddress": $("#answerInstallAddress").val(),
					eventAddress: $("#answerInstallAddress").val()
				};

				$.ajax({
					url: startUrl,
					async: true,
					type: "POST",
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					data: JSON.stringify(param),
					beforeSend: function () {
						$('#btnStart').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						if (result.isSuccess) {
							eventId = result.result;
							$("#btnStart").text("正在受理");
							$("#telTile").text("警情电话" + page.data.param.masterCallNum + "，接听中...");

							vm.second = 0;
							$('#btnRepeat').attr('disabled', false);
							$('#btnTransfer').attr('disabled', false);
							$('#btnInvalid').attr('disabled', false);
							layer.msg("受理成功！", {
								time: 1000
							}, function () {

							});
							if (flag) {
								parent.startRecord('', eventId, true);
							}
						} else {
							$('#btnStart').attr('disabled', false);
							layer.msg(result.message);
						}
					},
					error: function (result) {
						$('#btnStart').attr('disabled', false);
						ECS.hideLoading();
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},
			Repeat: function () {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '80%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'repeatAlarm.html',
					success: function (layero, index) {
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							eventId: eventId
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							$('#btnRepeat').attr('disabled', 'disabled');
							$('#btnTransfer').attr('disabled', 'disabled');
							$('#btnInvalid').attr('disabled', 'disabled');
							$('#btnSaveData').attr('disabled', 'disabled');
							$('#btnSave').attr('disabled', 'disabled');
						}
					}
				})
			},
			Transfer: function () {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '80%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'transferAlarm.html',
					success: function (layero, index) {
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							eventId: eventId
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							$('#btnRepeat').attr('disabled', 'disabled');
							$('#btnTransfer').attr('disabled', 'disabled');
							$('#btnInvalid').attr('disabled', 'disabled');
							$('#btnSaveData').attr('disabled', 'disabled');
							$('#btnSave').attr('disabled', 'disabled');
						}

					}
				})
			},
			Invalid: function () {
				parent.hangup();
				ECS.util.addOrEdit({
					url: invalidAlarmUrl + eventId
				}, function (data) {
					data = $.parseJSON(data);
					if (data.isSuccess) {
						layer.msg('操作成功');
						$('#btnRepeat').attr('disabled', 'disabled');
						$('#btnTransfer').attr('disabled', 'disabled');
						$('#btnInvalid').attr('disabled', 'disabled');
						$('#btnSaveData').attr('disabled', 'disabled');
						$('#btnSave').attr('disabled', 'disabled');
						readyState = true;
					}
					else {
						layer.msg('操作失败');
					}
				});
			},
			selectMedia: function () {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '80%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'fireSubstance.html',
					success: function (layero, index) {

					},
					end: function () {

					}
				})
			},
			KeyWord: function (obj) {
				var eventSummary = $("#eventSummary").val();
				$("#eventSummary").val(eventSummary + obj.keyWordreExplain);
			},
			getMobileOrPhone: function () {
				$.ajax({
					//必须用同步，接口慢，异步操作后续会报错
					async: false,
					url: mobileOrPhoneUrl + "?mobileOrPhone=" + page.data.param.masterCallNum,
					type: "get",
					dataType: "json",
					success: function (result) {
						currentTime = result.currentTime;
						$("#startTime").text(result.currentTime)
						$("#userName").text(result.userName);
						$("#ringInstallAddress").text(result.caseAddress);
						$("#answerInstallAddress").text(result.caseAddress);
						$("#answerInstallAddress").val(result.caseAddress);
						$("#eventSummary").text(result.caseAddress);

						page.data.param.enterpriseId = result.orgId;
						//	page.data.param.drtDeptId = result.orgCode;
						page.data.param.riskAreaId = result.riskAreaID;
						page.data.param.optlRiskSoneId = result.optlRiskZoneID;
						page.data.param.riskAnlsObjId = result.riskAnlsObjID;
						//page.data.param.pointId = result.orgCode;
						timeFlag = true;
						var availableTags = result.caseAddreses;
						var data = page.logic.ConvertList(availableTags);

						$("#answerInstallAddress").autocomplete({
							scroll: true,

							minLength: 0,
							focus: function (event, ui) {
								$("#answerInstallAddress").val(ui.item.label);
								return false;
							},
							select: function (event, ui) {
								page.data.param.enterpriseId = ui.item.orgId;
								//	page.data.param.drtDeptId = result.orgCode;
								page.data.param.riskAreaId = ui.item.riskAreaId;
								page.data.param.optlRiskSoneId = ui.item.optlRiskZoneID;
								page.data.param.riskAnlsObjId = ui.item.riskAnlsObjID;

								$("#answerInstallAddress").val(ui.item.label);
								$("#eventSummary").val(ui.item.label);
								$this = $(this);
								setTimeout(function () {
									$this.blur();
								}, 1);
							},
							change: function (event, ui) {

							},
							autoFocus: false,
							source: data
						}).focus(function () {
							$(this).autocomplete("search");
						});
					},
					error: function (result) {
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},
			getKeyWords: function () {
				$.ajax({
					url: keyWordUrl,
					type: "get",
					dataType: "json",
					success: function (result) {
						vm.items = result;
					}, error: function (result) {
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},
			getSecond: function () {
				var timeoutID = setInterval(function () {
					if (readyState) {
						clearTimeout(timeoutID);
					}
					vm.second++;
				}, 1000);
			},
			initTable: function () {
				page.logic.getComboSelect(type_url, "accidentType", "accidentTypeID", "accidentTypeName", false);
				page.logic.getSecond();
				if (!$("#startTime").text()) {

					var date = new Date();
					$("#startTime").text(moment(date).format('YYYY-MM-DD HH:mm:ss'))
				}

			},

			getComboSelect: function (url, ctrlId, key, value, tags) {

				$.ajax({
					url: url,
					async: true,
					dataType: "json",
					success: function (data) {
						var datalist = [];
						$.each(data, function (i, el) {
							datalist.push({ id: el[key], text: el[value] });
						});
						$('#' + ctrlId).select2({
							tags: tags,
							data: datalist,
							language: {
								noResults: function (params) {
									return "没有匹配项";
								}
							},
						});
					},
				})
			},
			Save: function () {
				if (!$("#answerInstallAddress").val()) {
					layer.msg("请在地图上选择案发位置"); return;
				}
				if (!$("#accidentType").val()) {
					layer.msg("请选择案件类型"); return;
				}
				if (!$("#fireLvl").val()) {
					layer.msg("请选择火势大小"); return;
				}
				// if (!$("#fireSubstanceTypeIds").val()) {
				// 	layer.msg("请选择起火物质"); return;
				// }
				if (!eventId) {
					layer.msg("事件未受理"); return;
				}
				//TODO riskAnlsObjId pointId
				var param = {
					"eventId": eventId,
					"accidentTypeId": $("#accidentType").val(),
					"enterpriseId": page.data.param.enterpriseId,
					"drtDeptId": page.data.param.unitId,
					"riskAreaId": page.data.param.riskAreaId,
					"optlRiskSoneId": page.data.param.optlRiskZoneId,
					// "riskAnlsObjId": 94,
					// "pointId": 1200,
					"alertsPersonInfo": page.data.param.masterCallNum,
					"eventSummary": $("#eventSummary").val(),
					"eventAddress": $("#answerInstallAddress").val(),
					"isExplode": Number($("#isExplode").is(":checked")),
					"isPersonIn": Number($("#isPersonIn").is(":checked")),
					"fireLvl": $("#fireLvl").val(),
					"fireSubstanceTypeIds": ($("#fireSubstanceTypeIds").val()).split(',')    //起火物质数组
				};
				$.ajax({
					url: saveUrl,
					async: true,
					type: "PUT",
					dataType: "json",
					data: JSON.stringify(param),
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						$('#btnSave').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						if (result.isSuccess) {
							layer.msg("立案成功！", {
								time: 1000
							}, function () {
								page.logic.Redirection(eventId);
								//	page.logic.closeLayer(true);
							});


						} else {
							layer.msg(result.message);
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
			SaveHO: function () {
				if (!$("#answerInstallAddress").val()) {
					layer.msg("请在地图上选择案发位置"); return;
				}
				if (!$("#accidentType").val()) {
					layer.msg("请选择案件类型"); return;
				}
				if (!$("#fireLvl").val()) {
					layer.msg("请选择火势大小"); return;
				}
				// if (!$("#fireSubstanceTypeIds").val()) {
				// 	layer.msg("请选择起火物质"); return;
				// }
				var param = {
					alarmTime: $("#startTime").text(),
					"accidentTypeId": $("#accidentType").val(),
					"enterpriseId": page.data.param.enterpriseId,
					"drtDeptId": page.data.param.unitId,
					"riskAreaId": page.data.param.riskAreaId,
					"optlRiskSoneId": page.data.param.optlRiskZoneId,
					"eventSummary": $("#eventSummary").val(),
					"eventAddress": $("#answerInstallAddress").val(),
					"isExplode": Number($("#isExplode").is(":checked")),
					"isPersonIn": Number($("#isPersonIn").is(":checked")),
					"fireLvl": $("#fireLvl").val(),
					"fireSubstanceTypeIds": ($("#fireSubstanceTypeIds").val()).split(',')    //起火物质数组
				};
				$.ajax({
					url: saveHOUrl,
					async: true,
					type: "POST",
					dataType: "json",
					data: JSON.stringify(param),
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						$('#btnSave_HO').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						if (result.isSuccess) {
							layer.msg("立案成功！");
							$('#btnSave_HO').attr('disabled', true);

							page.logic.Redirection(result.result);
							//	var index = parent.layer.getFrameIndex(window.name);
							//	parent.layer.close(index);
							//	var openUrl = '../../html/ap/FiremanGo/Index.html';
							//	window.parent.layerOpen(openUrl, result.result);

						} else {
							layer.msg(result.message);
						}
					}, error: function (result) {
						$('#btnSave_HO').attr('disabled', false);
						ECS.hideLoading();
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},

			SaveData: function () {
				if (!$("#answerInstallAddress").val()) {
					layer.msg("请在地图上选择案发位置"); return;
				}
				if (!$("#accidentType").val()) {
					layer.msg("请选择案件类型"); return;
				}
				if (!$("#fireLvl").val()) {
					layer.msg("请选择火势大小"); return;
				}
				if (!eventId) {
					layer.msg("警情未受理"); return;
				}
				var param = {
					"eventId": eventId,
					"accidentTypeId": $("#accidentType").val(),
					"enterpriseId": page.data.param.enterpriseId,
					"drtDeptId": page.data.param.unitId,
					"riskAreaId": page.data.param.riskAreaId,
					"optlRiskSoneId": page.data.param.optlRiskZoneId,
					// "riskAnlsObjId": 94,
					// "pointId": 1200,
					"alertsPersonInfo": page.data.param.masterCallNum,
					"eventSummary": $("#eventSummary").val(),
					"eventAddress": $("#answerInstallAddress").val(),
					"isExplode": Number($("#isExplode").is(":checked")),
					"isPersonIn": Number($("#isPersonIn").is(":checked")),
					"fireLvl": $("#fireLvl").val(),
					"fireSubstanceTypeIds": ($("#fireSubstanceTypeIds").val()).split(',')    //起火物质数组
				};
				$.ajax({
					url: saveEventUrl,
					async: true,
					type: "PUT",
					dataType: "json",
					data: JSON.stringify(param),
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						$('#btnSaveData').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						if (result.isSuccess) {
							layer.msg("保存成功！", {
								time: 1000
							}, function () {

							});

						} else {
							layer.msg(result.message);
						}
						$('#btnSaveData').attr('disabled', false);
					},
					error: function (result) {
						$('#btnSaveData').attr('disabled', false);
						ECS.hideLoading();
						layer.msg("系统繁忙");
					}
				})
			},

			Redirection: function (eventId) {
				layer.confirm('是否跳转处警页面？', {
					btn: ['确定', '取消']
				}, function () {
					var openUrl = '../../html/ap/FiremanGo/Index.html';
					window.parent.layerOpen(openUrl, eventId, function () {

						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					}, { closeBtn: 0 });
				}, function (index) {
					parent.hangup();
					parent.setFree();
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);

				});
			},
			hangup: function () {
				layer.confirm('确定要挂断电话？', {
					btn: ['确定', '取消']
				}, function () {
					$("#telTile").text("警情电话" + page.data.param.masterCallNum + "，已挂断");
					readyState = 1;
					parent.hangup();
					parent.setBusy();
					if (!treatStatus) {
						$('#btnStart').attr('disabled', 'disabled');
						$('#btnSave').attr('disabled', 'disabled');
						parent.setFree();
						page.logic.closeLayer(true);
					}
					layer.closeAll();
				});
			},
			afterTransfer: function () {
				$("#telTile").text("警情电话" + page.data.param.masterCallNum + "，已挂断");
				readyState = 1;
			},
			Convert: function (item) {
				item.alarmTime = moment(item.alarmTime).format('YYYY-MM-DD ');
				return item;
			},
			closeLayer: function (flag) {
				if (flag) {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				}
				else {
					layer.confirm('确定要关闭窗口吗？', {
						btn: ['确定', '取消']
					}, function () {
						parent.hangup();
						parent.setFree();
						var index = parent.layer.getFrameIndex(window.name);
						parent.layer.close(index);
					});
				}
			},
			ConvertList: function (items) {
				var newArr = [];
				items.forEach(function (item) {
					var obj = new Object();
					for (key in item) {
						obj[key] = item[key];
					}

					obj.value = item.address;
					obj.label = item.address;

					newArr.push(obj);
				});
				return newArr;
			}
		}
	};
	page.init();
	window.page = page;
});