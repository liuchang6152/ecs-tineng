var teamUrl = ECS.api.apUrl + '/policeProcess';  //队伍
var carUrl = ECS.api.apUrl + '/policeProcess/getTeamByTeamId';   //车辆
var orderSender = ECS.api.apWebSocket + '/policeProcess';   //命令下达
var closePageUrl = ECS.api.apUrl + '/policeProcess/vehicleReturn';   //命令下达
var sendUrl = ECS.api.apUrl + '/policeProcess/policeEnd';

var detailUrl = ECS.api.apUrl + '/fileAlarmChild/singlePoliceRecord';  //案件详情
var previewUrl = ECS.api.apUrl + '/event/getPreviewPreview';  //预案
var downloadUrl = ECS.api.rttUrl + '/vehicle/downloadFile';//照片下载
var videoUrl = ECS.api.apUrl + '/policeProcess/getVideoSurveillance';  //队伍
var noFeedbackUrl = ECS.api.apUrl + '/firemanGo/noFeedback';   //命令下达
var teamIPUrl = ECS.api.apUrl + '/fileAlarmChild/findByIp?teamId='

window.pageLoadMode = PageLoadMode.None;
var tabindex1 = 0;
var tabindex2 = 0;
var tabindex3 = 0;
var tabindex4 = 0;
var vm = new Vue({
	el: '#main',
	data: {
		items: [],
		selectedItem: [],
		eventId: '',
		detail: {},
		selectedTree: [],
		attrUrl: '',
		heigth: '',
		heigth3: '',
		width: '',
		video: [],
		src: '',
		tips: null
	},
	mounted: function () {
		this.heigth = document.body.clientHeight - 120 + 'px';
		this.heigth3 = document.body.clientHeight - 200 + 'px';
		this.width = document.body.clientWidth - 100 + 'px';
	},

	methods: {
		returnJson: function (d) {
			return JSON.stringify(d);
		},
		getImgUrl: function (d) {
			return downloadUrl + '?fileId=' + d;
		},
		windowOpen: function (video) {
			window.open(video.url);
		},
		getElementId: function (ele, id) {
			return ele + id;
		},

		setAttr: function (item) {
			if (item.poactionStatusName == '待命') {
				return "TRUE";
			} else {
				return "FALSE";
			}
		},

		getError: function (item) {
			if (item.systemName) {
				return "系统分类：" + item.systemName + "   相关部件： " + item.relevantModuleCh;
			}
		},

		mouseout: function () {
			layer.close(vm.tips);
		},

		mouseover: function (items, id) {
			if (items.length == 0) {
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
			vm.tips = layer.tips(html, '#div' + id, { area: ['400px', 'auto'], time: 0, tips: [1, '#c00'] });
		}
	},


});

$(function () {
	var page = {
		init: function () {
			mini.parse();
			page.bindUI();


			mini.get("tree1").on("drawnode", function (e) {
				var field = e.field,
					record = e.record,
					index = e.rowIndex;
				if (e.record._level != 0) {
					e.showCheckBox = false;

				}
			});

		},
		table: {},
		bindUI: function () {
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			//调度
			$('#btndispatch').click(function () {
				page.logic.dispatch();
			});

			//调度全部
			$('#btndispatchAll').click(function () {
				page.logic.dispatchAll();
			});

			//清空
			$('#btnclearCaar').click(function () {
				page.logic.clearCaar();
			});
			//命令下达
			$('#btnOrderSend').click(function () {
				page.logic.OrderSend();
			});

			//警情情况电话下达
			$('#btnAlarmSend').click(function () {
				page.logic.AlarmSend();
			});

			$('#btnHangup').click(function () {
				parent.hangup();
			});

			$('#btnClose').click(function () {
				parent.hangup();
				parent.setFree();
				try {
					document.getElementById("iframe").contentWindow.DoStopPlay();
				} catch (error) {

				}

				var index = parent.layer.getFrameIndex(window.name);
				parent.layer.close(index);
			});


			//其它预案
			$('#btnOther').click(function () {
				page.logic.otherPlan();
			});


			//点击左侧树形菜单,查询表格数据
			mini.get("tree1").on("nodecheck", function (e) {
				if (e.checked) {
					//	return ;
				}
				// var tree = mini.get("tree1");
				// var node = tree.getSelectedNode();
				// if (!node.children) {
				// 	return;
				// }
				page.logic.drawCar(e); //表格
			});
			$('#btnSendTask').click(function () {
				page.logic.sendTask();
			});
		},
		data: {
			param: {
				sendSuccessArr: [],
				sendFailArr: []
			}
		},
		logic: {
			setData: function (eventId, readonly) {
				vm.eventId = eventId;
				console.log(eventId);
				page.logic.init();
				if (readonly) {
					$('#btndispatch').hide();
					$('#btndispatchAll').hide();
					$('#btnclearCaar').hide();
					$('#btnOrderSend').hide();
					$('#btnAlarmSend').hide();
					$('#btnHangup').hide();
					$('#btnoff').hide();
					parent.setFree();
				} else {
					parent.setBusy();
				}
			},

			isExist: function (item) {
				for (var index = 0; index < vm.selectedTree.length; index++) {
					var element = vm.selectedTree[index];
					if (element.teamId == item.teamId) {
						item.checked = true;
					}
				}
			},

			defaultSelect: function (list) {
				for (var index = 0; index < list.length; index++) {
					var element = list[index];
					if (element.show) {
						element.checked = true;
					}
				}
			},

			init: function () {
				page.logic.initTab1();
				page.logic.initTab2();
				$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
					var target = e.target // newly activated tab
					var relatedTarget = e.relatedTarget // previous active tab
					switch (target.hash) {
						case "#tab1": page.logic.initTab1(); break;
						case "#tab2": page.logic.initTab2(); break;
						case "#tab3": page.logic.initTab3(); break;
						case "#tab4": page.logic.initTab4(); break;
					}
				});


			},
			initTab1: function () {

				$.ajax({
					async: false,
					url: teamUrl + "?eventId=" + vm.eventId,
					type: "get",
					success: function (data) {

						for (var index = 0; index < data.result.length; index++) {
							var element = data.result[index];
							page.logic.defaultSelect(data.result);
							page.logic.isExist(element);

						}
						//console.log(JSON.stringify(data))
						mini.get("tree1").loadData(data.result);
						page.logic.drawCar();
						tabindex1 = 1;
					},
					error: function (e) {
						//	alert(e);
					}
				});

			},
			initTab2: function () {

				$.ajax({
					url: detailUrl + "?eventId=" + vm.eventId,
					type: "get",
					success: function (data) {
						vm.detail = page.logic.Convert(data);
						tabindex2 = 1;

					},
					error: function (e) {
						//	alert(e);
					}
				});

			},
			initTab3: function () {

				$.ajax({
					url: previewUrl + "?eventId=" + vm.eventId,
					type: "get",
					success: function (data) {
						if (data.isSuccess) {
							if (!data.result) {
								layer.msg('未匹配到预案');
								return false;
							}
							tabindex3 = 1;
							$("#previewName").text(data.message);
							var filename = data.result.atchName;
							var index = filename.lastIndexOf(".");
							var suffix = filename.substr(index + 1);

							if (suffix == "doc" || suffix == "docx" || suffix == "xls" || suffix == "xlsx" || suffix == "rar") {
								layer.msg("该文件不支持在线预览");
							}
							vm.attrUrl = downloadUrl + '?fileId=' + data.result.atchPath + "#toolbar=0";
						}

					},
					error: function (e) {
						//	alert(e);
					}
				});

			},
			initTab4: function () {

				if (tabindex4 == 0) {
					$.ajax({
						url: videoUrl + "?eventId=24362",// + vm.eventId,
						type: "get",
						success: function (data) {
							tabindex4 = 1;
							vm.video = data;
							vm.src = "video.html";
						},
						error: function (e) {
							//	alert(e);
						}
					});
				}
			},
			Convert: function (item) {

				if (item.alarmTime) {
					item.alarmTime = moment(item.alarmTime).format('YYYY-MM-DD HH:mm:ss');
				}
				if (item.initTime) {
					item.initTime = moment(item.initTime).format('YYYY-MM-DD HH:mm:ss');
				}
				if (item.commandTime) {
					item.commandTime = moment(item.commandTime).format('YYYY-MM-DD HH:mm:ss');
				}
				if (item.completeTime) {
					item.completeTime = moment(item.completeTime).format('YYYY-MM-DD HH:mm:ss');
				}
				if (item.registerTime) {
					item.registerTime = moment(item.registerTime).format('YYYY-MM-DD HH:mm:ss');
				}


				item.teamEntities.forEach(function (entity) {
					if (entity.printingTime) {
						entity.printingTime = moment(entity.printingTime).format('YYYY-MM-DD HH:mm:ss');
					}
					if (entity.handleTime) {
						entity.handleTime = moment(entity.handleTime).format('YYYY-MM-DD HH:mm:ss');

					}
				});
				return item;
			},

			check: function (id) {
				var check = $("#" + id).prop("checked");

				if (check) {
					$("#div" + id).css("border", "3px solid red");
				} else {
					$("#div" + id).css("border", "1px solid #dddddd");
				}
				page.logic.dispatch();
			},

			drawCar: function (e) {
				var data = mini.get("tree1").getCheckedNodes();
				if (data.length == 0) {
					vm.items = [];
					return false;
				}
				vm.selectedTree = data;
				var teamIds = [];
				$(data).each(function (e) {
					teamIds.push(data[e].teamId);
				})
				page.logic.Car(teamIds.toString(','));
			},


			Car: function (teamIds) {
				var jsonData = { teamId: teamIds };
				$.ajax({
					url: carUrl + "?teamIds=" + teamIds,
					type: "get",
					//	data: JSON.stringify(teamIds),
					contentType: "application/json;charset=utf-8",
					success: function (data) {

						vm.items = data;


					},
					error: function (e) {
						//	alert(e);
					}
				});

			},
			dispatchAll: function () {
				var dispatchCar = [];
				var select = $("#selectCar input[type='checkbox']");

				$(select).each(function (e) {
					dispatchCar.push(JSON.parse(select[e].value))
				});

				vm.selectedItem = dispatchCar;
				$("#selectCar input[type='checkbox']").prop("checked", 'true');
				$("#selectCar [data='TRUE']").css("border", "3px solid red");
			},

			dispatch: function () {
				var dispatchCar = [];
				var select = $("#selectCar input:checked");
				$(select).each(function (e) {
					dispatchCar.push(JSON.parse(select[e].value))
				});

				vm.selectedItem = dispatchCar;
			},
			clearCaar: function () {

				vm.selectedItem = [];
				$("#selectCar input[type='checkbox']").attr("checked", false);
				$("#selectCar .thumbnail").css("border", "1px solid #dddddd");
			},

			canel: function (item) {
				var oderCars = vm.selectedItem;
				var sList = $.grep(vm.selectedItem, function (n, i) {
					return item.vehicleId == n.vehicleId;
				}, item)
				vm.selectedItem = sList;
				$("#" + item.vehicleId).attr("checked", false);
				$("#div" + item.vehicleId).css("border", "1px solid #dddddd");
			},

			OrderSend: function (teamId) {
				var tramIds = [];
				var selectCars = [];
				var select = vm.selectedItem;// $("#selectedCar input:checked");
				$(select).each(function (e) {
					var obj = select[e];
					tramIds.push(obj.teamId);
					selectCars.push(obj.vehicleId);
				});

				if (selectCars.length == 0) {
					layer.msg('请选择车辆');
					return;
				}
				//	var ws = new WebSocket(ECS.api.webSocket + "/websocketNew/" + teamId);
				var jsonData = {
					tramIds: tramIds,
					vehicleIds: selectCars,
					eventId: vm.eventId,
					teamIdGUID: parent.webSocketId
				};
				$.ajax({
					url: orderSender,
					type: "post",
					data: JSON.stringify(jsonData),
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						$('#btnOrderSend').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (data) {
						if (data.isSuccess) {
							vm.selectedItem = [];
							page.logic.clearCaar();
							page.logic.init();
							page.logic.drawCar();

							var teamIds = [];
							for (var i = 0, len = jsonData.tramIds.length; i < len; i++) {
								if (teamIds.indexOf(jsonData.tramIds[i]) == -1) {
									teamIds.push(jsonData.tramIds[i]);
								}
							}

							for (var i = 0, len = teamIds.length; i < len; i++) {
								var teamID = teamIds[i];
								$.ajax({
									url: teamIPUrl + teamID,
									type: "GET",
									contentType: "application/json;charset=utf-8",
									success: function (data1) {
										if (data1.isSuccess) {
											// zhongIP,eventId|zhiIP|batch
											parent.sendOrder(data1.result, jsonData.eventId + '|' + parent.netIP + '|' + data.result + '|' + teamID);
											//layer.msg('下达成功');
										}
										else {
											alert(data1.message);
										}
									}
								});
							}
							
						} else {
							layer.msg(data.message);

						}

						$('#btnOrderSend').attr('disabled', false);
						// $('#btnAlarmSend').attr('disabled', false);

						ECS.hideLoading();

					},
					error: function (e) {
						$('#btnOrderSend').attr('disabled', false);
						ECS.hideLoading();
					}
				});

			},
			AlarmSend: function () {
				var status = parent.getStatus();
				var arr = status.split('|');
				if (arr[0] != 1) {
					layer.msg("正在通话中");
					return;
				}
				$.ajax({
					url: noFeedbackUrl + '?eventID=' + vm.eventId,
					type: "GET",
					success: function (data) {
						if (data.result.length > 0) {
							layer.open({
								type: 2
								, area: ['30%', '40%']
								, offset: 'auto' //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
								, id: 'layerDemo' + 'auto' //防止重复弹出
								, content: 'Feedback.html?' + Math.random()

								, btnAlign: 'c' //按钮居中
								, shade: 0 //不显示遮罩
								, yes: function () {
									layer.closeAll();
								}, title: "更改队伍反馈状态",
								success: function (layero, index) {
									var body = layer.getChildFrame('body', index);
									var iframeWin = window[layero.find('iframe')[0]['name']];


									iframeWin.page.logic.setData(data, vm.eventId);
								},
								end: function () {
									parent.parent.closeTeamcall();
								}
							});
						} else {
							layer.msg("无未反馈记录");
						}

					},
					error: function (e) {
						console.log(e);
					}
				})
			},
			otherPlan: function () {
				layer.open({
					type: 2
					, area: ['90%', '90%']
					, offset: 'auto' //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
					, id: 'layerDemo' + 'auto' //防止重复弹出
					, content: 'More.html?' + Math.random()

					, btnAlign: 'c' //按钮居中
					, shade: 0 //不显示遮罩
					, yes: function () {
						layer.closeAll();
					}, title: "更多预案",
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"eventId": vm.eventId
						};

						iframeWin.page.logic.setData(data);
					},
					end: function () {
						tabindex3 = 0;

						page.logic.initTab3();
					}
				});
			},
			closePage: function () {
				//	var jsonData = { eventId: vm.eventId };
				$.ajax({
					url: closePageUrl + "?eventId=" + vm.eventId,
					type: "get",
					//	data: JSON.stringify(jsonData),
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						var strMsg = "";
						var data = result.result;
						var msg = "<div style='text-align: center'>";
						for (var index = 0; index < data.length; index++) {
							var element = data[index];
							msg += element.teamName + "          " + element.vehicleName + "        出警 <br/>";
							strMsg += element.teamName + "          " + element.vehicleName + "        出警  \n";
						}
						msg += "<span style='color:red'>确定结束事件吗？</span> </div>"
						strMsg += "确定结束事件吗？"
						var flag = confirm(strMsg);
						if (flag) {
							var submitData = {
								eventId: vm.eventId

							}
							$.ajax({
								url: sendUrl,
								async: false,
								type: 'POST',
								data: JSON.stringify(submitData),
								dataType: "json",
								contentType: "application/json;charset=utf-8",
								beforeSend: function () {
									$('#btnSave').attr('disabled', 'disabled');
									ECS.showLoading();
								},
								success: function (result) {
									ECS.hideLoading();
									if (result.isSuccess) {
										parent.hangup();
										parent.setFree();
										layer.closeAll();
										var type = 'auto';
										layer.open({
											type: 2
											, area: ['30%', '30%']
											, offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
											, id: 'layerDemo' + type //防止重复弹出
											, content: 'End.html?' + Math.random()

											, btnAlign: 'c' //按钮居中
											, shade: 0 //不显示遮罩
											, yes: function () {
												layer.closeAll();
											}, title: "处警总结",
											success: function (layero, index) {
												var body = layer.getChildFrame('body', index);
												var iframeWin = window[layero.find('iframe')[0]['name']];
												var data = {
													"eventId": vm.eventId
												};

												iframeWin.page.logic.setData(data);
											},
											end: function () {
												var index = parent.layer.getFrameIndex(window.name);
												//	parent.layer.close(index);
											}
										});

									} else {
										layer.msg('系统繁忙');
									}
								},
								error: function (result) {
									$('#btnSave').attr('disabled', false);
									ECS.hideLoading();
									// var errorResult = $.parseJSON(result.responseText);
									layer.msg("系统繁忙");
								}
							})
						}
					},
					error: function (e) {

					}
				});

			},
			rendererSendSuccess: function (str) {
				page.data.param.sendSuccessArr.push(str);
				page.logic.renderer();
			},
			rendererSendFail: function (str) {
				page.data.param.sendFailArr.push(str);
				page.logic.renderer();
			},
			renderer: function () {
				var tree = mini.get('tree1');
				for (var i = 0, ilen = page.data.param.sendFailArr.length; i < ilen; i++) {
					var arr = page.data.param.sendFailArr[i].split('|');
					var teamID = arr[3];
					var batch = arr[2];
					for (var j = 0, len = tree.getNode(teamID + '').children.length; j < len; j++) {
						var node = tree.getNode(teamID).children[j];
						if (node.firemanGoBatch == '第' + batch + '批次' && node.name.indexOf('未反馈') != -1) {
							var nodeId = node.teamId;
							var nodeText = node.name.replace('未反馈', '发送失败');
							var mnode = tree.getNode(nodeId + '');
							tree.setNodeText(mnode, nodeText);
						}
					}
				}
				for (var i = 0, ilen = page.data.param.sendSuccessArr.length; i < ilen; i++) {
					var arr = page.data.param.sendSuccessArr[i].split('|');
					var teamID = arr[3];
					var batch = arr[2];
					for (var j = 0, len = tree.getNode(teamID + '').children.length; j < len; j++) {
						var node = tree.getNode(teamID).children[j];
						if (node.firemanGoBatch == '第' + batch + '批次' && node.name.indexOf('未反馈') != -1) {
							var nodeId = node.teamId;
							var nodeText = node.name.replace('未反馈', '发送成功');
							var mnode = tree.getNode(nodeId + '');
							tree.setNodeText(mnode, nodeText);
						}
					}
				}
			},
			sendTask: function () {
				var tree = mini.get('tree1');
				var node = tree.getSelectedNode();
				if (!node) {
					layer.msg('请选择未反馈或发送失败的批次');
					return;
				}
				if (!tree.isLeaf(node)) {
					layer.msg('请选择未反馈或发送失败的批次');
					return;
				}
				if(node.confirmStateName != '未反馈'){
					layer.msg('请选择未反馈或发送失败的批次');
					return;
				}
				var parentNode = tree.getParentNode(node);
				var batch = node.firemanGoBatch.match(/\d+/g);		
				$.ajax({
					url: teamIPUrl + parentNode.teamId,
					type: "GET",
					contentType: "application/json;charset=utf-8",
					success: function (data) {
						if (data.isSuccess) {
							// zhongIP,eventId|zhiIP|batch
							parent.sendOrder(data.result, vm.eventId + '|' + parent.netIP + '|' + batch + '|' + parentNode.teamId);
							layer.msg('发送成功');
						}
						else {
							alert(data.message);
						}
					}
				});
			}
		}
	};
	page.init();
	window.page = page;
});



