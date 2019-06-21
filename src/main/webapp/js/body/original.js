var meetingRecordUrl = ECS.api.bodyUrl + '/projectRawData/getProjectRawData';
var orgUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=1';
var projectBatchcode, rawprojectPeoplecode;
$(function () {
	var page = {
		init: function () {
			mini.parse();
			page.bindUI();
			// page.logic.initOrg();
			//page.logic.setData();

		},
		table: {},
		bindUI: function () {
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			$('#btnQuery').click(function () {
				page.logic.search();
			});
			$('body').on('click', '.see', function () {
				page.logic.see();
			})
		},
		data: {
			param: {}
		},
		logic: {
			setData: function (res) {
				console.log(res);
				projectBatchcode = res.rawprojectBatchcode;
				rawprojectPeoplecode = res.rawprojectPeoplecode;
				page.logic.search();
			},
			see: function () {
				layer.open({
					type: 2,
					title: '体能人员查询',
					content: '../../../html/pft/body/see.html',
					area: ['100%', '100%'],
					btn: ['确定', '取消'],
					yes: function (index, layero) {
						var iframeWindow = window['layui-layer-iframe' + index],
							submitID = 'layuiadmin-app-comm-submit',
							submit = layero.find('iframe').contents().find('#' + submitID);

						//监听提交
						iframeWindow.layui.form.on('submit(' + submitID + ')', function (data) {
							var field = data.field; //获取提交的字段

							//提交 Ajax 成功后，静态更新表格中的数据
							//$.ajax({});
							table.reload('LAY-app-content-comm'); //数据刷新
							layer.close(index); //关闭弹层
						});

						submit.trigger('click');
					},
					success: function (layero, index) {

					}
				});
			},
			// initOrg: function () {
			// 	ECS.sys.RefreshContextFromSYS();
			// 	$.ajax({
			// 		async: false,
			// 		url: orgUrl,
			// 		type: "GET",
			// 		success: function (data) {
			// 			mini.get('orgCode').loadList(data, "orgCode", "porgCode");
			// 			if (ECS.sys.Context.SYS_IS_HQ) {
			// 				mini.get('orgCode').setValue(data[0].orgCode);
			// 			} else {
			// 				enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
			// 				mini.get("orgCode").disable();
			// 				for (var w = 0; w < data.length; w++) {
			// 					(function (cur_key) {
			// 						if (cur_key.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE) {
			// 							mini.get("orgCode").setValue(cur_key.orgCode);
			// 						}
			// 					})(data[w]);
			// 				}
			// 			}
			// 		},
			// 		error: function (e) {
			// 			console.log(e);
			// 		}
			// 	})
			// },
			draw: function (e) {
				var record = e.record;
				var column = e.column;
				if (column.header == "查看详情") {
					// e.cellHtml = '<a href="javascript:browser(0)"> 浏览 </a><a href="javascript:browser(1)"> 编辑 </a>';
					e.cellHtml = '<a href="###" class="see"> 查看 </a>';
				}
			},
			search: function () {
				var form = new mini.Form('searchForm');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
				}
				var grid = mini.get("datagrid");
				grid.set({
					url: meetingRecordUrl + '/' + projectBatchcode + '/' + rawprojectPeoplecode,
					ajaxType: "get",
					dataField: "pageList"
				});
				data.startTime = mini.formatDate(data.startTime, 'yyyy-MM-dd HH:mm:ss');
				data.endTime = mini.formatDate(data.endTime, 'yyyy-MM-dd HH:mm:ss');
				grid.load(data);
			},
			rendererOperate: function (e) {
				var id = e.record.meetingRecordId;
				var attachmentR = '<a href="javascript:ECS.util.renderUploader_Page(\'' +
					mini.get('orgCode').getSelectedNode().orgCode +
					'\',\'' + e.row.meetingRecordId +
					'\',\'' + e.row.meetingTheme +
					'\',\'' + '17' +
					'\',\'' + '音频会议附件上传' + '\')"><i class="icon-details edit mr__5"></i></a>'
				var operate = attachmentR + '<a href="javascript:window.page.logic.detail(' + id + ')"><i class="icon-edit edit"></i></a>';
				return operate;
			},
			detail: function (id) {
				ECS.util.detail({
					url: 'detail.html',
					height: 500,
					data: {
						title: '会议详情',
						meetingRecordId: id,
						pageMode: PageModelEnum.Details
					}
				});
			}
		},

	};
	page.init();
	window.page = page;
});