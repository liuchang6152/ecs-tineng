var meetingRecordUrl = ECS.api.bodyUrl + '/projectRawData/getPhysicalBatchQuery';
var seachUrl = ECS.api.bodyUrl + '/physicalService';
$(function () {
	var page = {
		init: function () {
			mini.parse();
			page.bindUI();
			// page.logic.initOrg();
			page.logic.search();
		},
		table: {},
		bindUI: function () {
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			$('#btnQuery').click(function () {
				page.logic.search();
			});
			$('#btnAgain').click(function () {//重新计算
				page.logic.count();
			});
			$('body').on('click','.see', function () {
				page.logic.see();
				});
		},
		data: {
			param: {}
		},
		logic: {
			count: function(){
				var res = mini.get('datagrid');
				// var nsRes = res.getSelecteds();//获取多个的
				var nsRes = res.getSelected(); //获取单个的
				console.log(nsRes);
				if (nsRes) {
					$.ajax({
						async: false,
						url: seachUrl + '?batch=' + nsRes.rawprojectBatchcode,
						type: "GET",
						success: function (res) {
							console.log(res)
						},
						error: function (e) {
							console.log(e);
						}
					})
				}else{
					layer.msg('请选中批次！');
					return;
				}
				page.logic.search();
			},
			see: function () {
				var res = mini.get('datagrid');
				var nsRes = res.getSelected();
				layer.open({
					type: 2,
					title: '体能人员查询',
					content: '../../../html/pft/body/see.html',
					area: ['1000px', '500px'],
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
						console.log(nsRes)
						var currentLayer = window[layero.find('iframe')[0]['name']];
						if (currentLayer.page.logic.setData) {
							currentLayer.page.logic.setData(nsRes);
						}
					}
				});
			},
			  draw: function(e) {
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
				if (data.beginTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
				}
				var grid = mini.get("datagrid");
				grid.set({
					url: meetingRecordUrl,
					ajaxType: "get",
					dataField: "pageList"
				});
				data.beginTime = mini.formatDate(data.beginTime, 'yyyy-MM-dd HH:mm:ss');
				data.endTime = mini.formatDate(data.endTime, 'yyyy-MM-dd HH:mm:ss');
				grid.load(data);
			},
			// rendererOperate: function (e) {
			// 	var id = e.record.meetingRecordId;
			// 	var attachmentR = '<a href="javascript:ECS.util.renderUploader_Page(\'' +
			// 		mini.get('orgCode').getSelectedNode().orgCode +
			// 		'\',\'' + e.row.meetingRecordId +
			// 		'\',\'' + e.row.meetingTheme +
			// 		'\',\'' + '17' +
			// 		'\',\'' + '音频会议附件上传' + '\')"><i class="icon-details edit mr__5"></i></a>'
			// 	var operate = attachmentR + '<a href="javascript:window.page.logic.detail(' + id + ')"><i class="icon-edit edit"></i></a>';
			// 	return operate;
			// },
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
		}
	};
	page.init();
	window.page = page;
});