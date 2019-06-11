var searchUrl = ECS.api.emUrl + '/VoiceResearch';
var exportUrl = ECS.api.emUrl + '/VoiceResearch/ExportToExcel';    //导出
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
$(function () {
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();
			page.logic.initTable();
			page.logic.search(0);
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			// 导出
			$('#btnExport').click(function () {
				page.data.param = ECS.form.getData("searchForm");
				window.open(exportUrl);
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search(0);
			});
			//批量删除
			$('#btnDel').click(function () {
				page.logic.delAll();
			});
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			/**
			 * 初始化表格
			 */
			initTable: function () {
				grid = mini.get("datagrid");
				pager = mini.get('datagridPager');
				pager.on('pagechanged', function (e) {
					page.logic.search(e.pageIndex);
				});
				// $('.weixinAudio').weixinAudio({
				// 	autoplay: false,
				// 	src: 'http://localhost:8056/Oh.mp3',
				// });
			},
			show_edit: function (e) {
				return '<a href="javascript:window.page.logic.Player(' + e.row._uid + ')">' + e.value + '</a>';
			},
			/**
			 * 搜索
			 */
			search: function (pageIndex) {
				var form = new mini.Form('searchForm');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
				}
				if (pageIndex == undefined || pageIndex == null) {
					pageIndex = 0;
				}
				page.data.param = ECS.form.getData("searchForm");
				var strStartTime = mini.formatDate(mini.parseDate(page.data.param.startTime), 'yyyyMMddTHHmmssZ');
				var strEndTime = mini.formatDate(mini.parseDate(page.data.param.endTime), 'yyyyMMddTHHmmssZ');
				var res = parent.getRecords(strStartTime, strEndTime,
					page.data.param.ringUpNumber, page.data.param.answerPhoneNumber,
					pageIndex, 10);
				grid.setData(res.data);
				pager.setPageIndex(pageIndex);
				pager.setTotalCount(res.total);
			},
			/**
			 * 批量删除
			 */
			delAll: function () {
				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					idsArray.push({
						schedulId: el.schedulId
					});
				});
				if (idsArray.length == 0) {
					layer.msg("请选择要删除的数据!");
					return;
				}
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: delUrl,
						async: true,
						data: JSON.stringify(idsArray),
						dataType: "json",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function (result) {
							if (result.isSuccess) {
								layer.msg("删除成功！", {
									time: 1000
								}, function () {
									grid.reload();
								});
							} else {

								layer.msg(result.message)
							}
						},
						error: function (result) {
							var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);
						}
					})
				}, function (index) {
					layer.close(index)
				});
			},
			/**
			 * 新增
			 */
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "通讯组新增";

				page.logic.detail(title, "", "", pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function (commGroupTypeId, orgID) {
				var pageMode = PageModelEnum.Edit;
				var title = "编辑值班人员";
				page.logic.detail(title, commGroupTypeId, orgID, pageMode);
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, commGroupTypeId, orgID, pageMode) {
				var commGroupTypeName;
				if (pageMode == PageModelEnum.Edit) {
					var row = mini.get("datagrid").getSelected();
					commGroupTypeName = row.commGroupTypeName;
				}
				var gridList = grid.getSelected();
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '70%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'Edit.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title
						};
						if (pageMode == PageModelEnum.Edit) {

						}
						iframeWin.page.logic.setData(data, gridList);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})
			},
			Player: function (uid) {
				// $('.weixinAudio').weixinAudio({
				// 	autoplay: false,
				// 	src: 'http://localhost:8056/Imagine.mp3',
				// });
				// $('#audio_area').click();				
				var row = grid.getRowByUid(uid);
				parent.recordDownload(row.starttime, row.endtime, row.filename, row.vruid, row.streamid);
			},
			calltime: function (e) {
				var strStartTime = e.record.starttime.substring(0, 4) + '-' + e.record.starttime.substring(4, 6) + '-' + e.record.starttime.substring(6, 8)
					+ ' ' + e.record.starttime.substring(9, 11) + ':' + e.record.starttime.substring(11, 13) + ':' + e.record.starttime.substring(13, 15);
				var strEndTime = e.record.endtime.substring(0, 4) + '-' + e.record.endtime.substring(4, 6) + '-' + e.record.endtime.substring(6, 8)
					+ ' ' + e.record.endtime.substring(9, 11) + ':' + e.record.endtime.substring(11, 13) + ':' + e.record.endtime.substring(13, 15);
				var res = mini.parseDate(strEndTime) - mini.parseDate(strStartTime);
				return res / 1000;
			},
			renderTime: function (e) {
				return e.value.substring(0, 4) + '-' + e.value.substring(4, 6) + '-' + e.value.substring(6, 8)
					+ ' ' + e.value.substring(9, 11) + ':' + e.value.substring(11, 13) + ':' + e.value.substring(13, 15);
			}
		}
	};
	page.init();
	window.page = page;
});




