var grid = null; //全局变量
var video_type = ECS.api.rttUrl + "/videoSurveullance/findSurvVideoType";
var videoUrl = ECS.api.rttUrl + '/videoSurveullance/findVideoDeploy';
var systemUrl = ECS.api.rttUrl + '/videoSurveullance/findSurvVideoSystem';
$(function () {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var ns_code = '';
	var ns_treeid = '';
	var ns_row = '';
	var leavel = [];
	var nsLeavel = [];





	var page = {
		//页面初始化
		init: function () {
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
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});

			//保存
			$("#btnSave").click(function () {
				page.logic.save();
			});

			//工厂模拟位置选择
			$('#selectMedia').click(function () {
				page.logic.add('工厂模型位置', "", PageModelEnum.NewAdd);
			});
			//通道号请选择
			$('#selectPass').click(function () {
				page.logic.addPass('通道号', "", PageModelEnum.NewAdd);
				return ;
			});

			$("#typeId").change(function (e) {//视频类型
				leavel.forEach(function (item, index, arr) {
					if ($("#typeId").val() == item.id) {
						$('#priorityName').val(item.priorityName);
						$('#priorityName').attr('key', item.priorityId);
					}
				});
			});
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			//下拉框
			select_option: function (menu_url, oPar) {//视频类型
				page.logic.getComboSelects(menu_url, oPar, "typeId", "typeName", true);
			},
			select_options: function (menu_url, oPar) {//视频系统
				page.logic.getComboSelect_s(menu_url, oPar, "systemId", "systemName", true);
			},
			


			getComboSelects: function (url, ctrlId, key, value, tags) {
				$("#" + ctrlId).html('<option value="" selected="selected">可搜索</option>');
				$.ajax({
					url: url,
					async: false,
					dataType: "json",
					success: function (data) {

						var datalist = [];
						$.each(data, function (i, el) {
							leavel.push({
								id: el[key],
								text: el[value],
								priorityName: el.priorityName,
								priorityId: el.priorityId,
							});
							datalist.push({
								id: el[key],
								text: el[value],
								priorityName: el.priorityName
							});
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
			getComboSelect_s: function (url, ctrlId, key, value, tags) {
				$("#" + ctrlId).html('<option value="" selected="selected">可搜索</option>');
				$.ajax({
					url: url,
					async: false,
					dataType: "json",
					success: function (data) {
						console.log(data)
						var datalist = [];
						$.each(data, function (i, el) {
							nsLeavel.push({
								id: el[key],
								text: el[value],
								systemName: el.systemName,
								systemId: el.systemId,
							});
							datalist.push({
								id: el[key],
								text: el[value],
								systemName: el.systemName
							});
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
			
			onButtonEdit: function (e) {
				var pageMode = PageModelEnum.NewAdd;
				var title = "选择工厂模型位置";
				page.logic.detail(title, "", pageMode);


			},


			/**
			 * 初始化编辑数据
			 */
			setData: function (data,row) {

				ns_code = data.riskAreaCode;
				ns_treeid = data.treeID;
				ns_row = data.id;

				$('#title-main').text(data.title);
				page.data.param.pageMode = data.pageMode;
				page.data.param.id = data.id;
				page.logic.select_option(video_type, "typeId");//视频类型
				page.logic.select_options(systemUrl, "systemId"); //视频系统
				if (data.pageMode != PageModelEnum.NewAdd) {
					var form = new mini.Form('AddOrEditModal');
					$.ajax({
						url: videoUrl + '?survVideoId=' + data.id,
						type: "get",
						dataType: "json",
						beforeSend: function () {
							ECS.showLoading();
						},
						success: function (rdata) {
							console.log(data);
							// $('#typeId').attr('disabled', 'disabled');// 视频类型可以编辑

							form.setData(rdata);
							ECS.form.setData('AddOrEditModal', rdata);
							ECS.hideLoading();
							$("#name").val(row.name);
						
						},
						error: function (result) {
							ECS.hideLoading();
							var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);
						}
					});
				}

			},


			/**
			 * 保存
			 */
			save: function () {
				
				console.log(window.ownDetail);
				var data = ECS.form.getData('AddOrEditModal');
				console.log(data)
			
					if (!data.name) {
						layer.msg('请选择工厂模型位置！');
						return false;
					}
				if (!data.survVideoName) {
					layer.msg('请输入视频名称');
					return false;
				}else{
					if (data.survVideoName.length > 100) {
						layer.msg('视频名称过长，请筛减！');
						return false;
					}
				}

				if (!data.location) {
					layer.msg('请输入位置描述');
					return false;
				}
				if (!data.typeId) {
					layer.msg('请选择视频类型')
					return false;
				};
				if (!data.systemId) { //$("#systemId").val()
					layer.msg('请选择视频系统')
					return false;
				};
					if (!data.channel) {
						layer.msg('请输入通道号')
						return false;
					}
				
				// if (!data.pageUrl) {
				// 	layer.msg('请输入视频地址');
				// 	return false;
				// }
				// if (!data.username) {
				// 	layer.msg('请输入用户名');
				// 	return false;
				// }
				// if (!data.password) {
				// 	layer.msg('请输入用户密码');
				// 	return false;
				// }
				// console.log(nsData);
				console.log(page.data.param.pageMode);
				var resUrl, type;
				if (PageModelEnum.Edit == page.data.param.pageMode) {
					resUrl = ECS.api.rttUrl + "/videoSurveullance/updateVideoDeploy";
					type = 'put';
					console.log(ns_row)
					data.survVideoId = ns_row;
				} else {
					resUrl = ECS.api.rttUrl + "/videoSurveullance/addVideoDeploy";
					type = 'post'
				}
				$.ajax({
					url: resUrl,
					async: false,
					data: JSON.stringify(data),
					dataType: "json",
					timeout: 1000,
					contentType: "application/json;charset=utf-8",
					type: type,
					success: function (result) {
						console.log(result)
						if (result.isSuccess) {
							 layer.msg("保存成功！", {
							 	time: 1000
							 }, function () {
								 	window.parent.pageLoadMode = window.pageLoadMode;
								 	parent.layer.close(index);
							 });
							 parent.page.logic.search();
						} else {
							layer.msg(result.message, {
								time: 1000
							});
							return false;
						}

					},
					error: function (result) {

						layer.msg(result.responseText);
					}
				})




				page.logic.formValidate();
				var data = ECS.form.getData('AddOrEditModal');
				data.userID = $("#userID").val();
				// if(!$('#AddOrEditModal').valid()) {
				// 	return;
				// }

			},
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "工厂模型位置";
				// var tree = mini.get('#enterpriseCode').getValue();
				var ctrl = mini.get("enterpriseCode");
				page.logic.detail(title, '', '', '', pageMode);
			},
			addPass: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "通道号";
				page.logic.detailPass(title, '', '', '', pageMode);
			},
			detail: function (title, riskAreaCode, enterpriseCode, enterpriseName, pageMode, isLeaf) {
				// var gridList = grid.getList();
				var keysArr = [];
				var keys = '';
				console.log(ns_code)
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['100%', '100%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'SelectType.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						console.log(parent.nsValue);
						$('#businessBgCategName').val(parent.nsValue);
						var data = {
							"pageMode": pageMode,
							"riskAreaCode": ns_code,
							'treeID': ns_treeid,
							"enterpriseCode": enterpriseCode,
							'enterpriseName': enterpriseName,
							'title': title,
							'keys': keys,
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						$('#name').val(window.ownDetail.name);
						$('#baseDataId').val(window.ownDetail.id);
						$('#baseModelCategory').val(window.ownDetail.obj);
						console.log(parent.ownDetail.passageway)
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})
			},
			detailPass: function (title, riskAreaCode, enterpriseCode, enterpriseName, pageMode, isLeaf) {
				var keys = '';
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['100%', '100%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'SelectPass.html?' + Math.random(),
					success: function (layero, index) {
						var iframeWin = window[layero.find('iframe')[0]['name']];
						$('#businessBgCategName').val(parent.nsValue);
						var data = {
							"pageMode": pageMode,
							"riskAreaCode": ns_code,
							'treeID': ns_treeid,
							"enterpriseCode": enterpriseCode,
							'enterpriseName': enterpriseName,
							'title': title,
							'keys': keys,
						};
						// iframeWin.page.logic.setData(data);
					},
					end: function () {
						console.log(window.passDetail)
						$('#channel').val(window.passDetail);
						// $('#baseModelCategory').val(window.ownDetail.obj);
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						}
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

						equipOwner: {
							required: true
						},
						drtDeptCode: {
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