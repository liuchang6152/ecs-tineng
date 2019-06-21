var meetingRecordUrl = ECS.api.bodyUrl + '/testersAttribute/search';
var orgUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=1';
// var sexUrl = ECS.api.rttUrl + '/expert/getExpertSexEnumList'; //性别
var userSex_url = ECS.api.rttUrl + "/expert/getExpertSexEnumList";
var nsCode;
$(function () {
	var page = {
		init: function () {
			mini.parse();
			page.bindUI();
			 page.logic.initMeetingType();//性别
		},
		table: {},
		bindUI: function () {
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			$('#btnQuery').click(function () {
				page.logic.search();
			});
			$('body').on('click','.see', function () {
				page.logic.see();
			})
			$('body').on('click','.see1', function () {
				page.logic.see1();
			});
			// mini.get('meetingType').on('valuechanged', function (e) {
			// 	page.logic.getEvents(e);
			// })
		},
		data: {
			param: {}
		},
		logic: {
			setData: function(res){
				console.log(res)
				nsCode = res.rawprojectBatchcode;
				page.logic.search();
			},
			  initMeetingType: function () {
			  	var data = [{
			  				id: '',
			  				text: '请选择'
			  			}, {
			  			id: 0,
			  			text: '男'
			  		},
			  		{
			  			id: 1,
			  			text: '女'
			  		},
			  	];
			  	mini.get('testersGender').setData(data);
			  	mini.get('testersGender').select(0);
				},
				  // getEvents: function (e) {
				  // 	if (e.value == 1) {
				  // 		mini.get('eventId').setEnabled(true);
				  // 		ECS.util.bindCmb({
				  // 			url: eventUrl,
				  // 			ctrId: 'eventId',
				  // 			idField: 'eventId',
				  // 			textField: 'eventAddressr'
				  // 		}, function (result) {
				  // 			mini.get('eventId').setData(result.result);
				  // 			mini.get('eventId').select(0);
				  // 		});
				  // 	} else {
				  // 		mini.get('eventId').setEnabled(false);
				  // 		mini.get('eventId').setData([]);
				  // 	}
				  // },
			see: function () {
				var res = mini.get('datagrid');
				var nsRes = res.getSelected();
				console.log(res.getSelected())
				layer.open({
					type: 2,
					title: '查看打分明细',
					content: '../../../html/pft/body/scoring.html',
					area: ['650px', '350px'],
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
						var currentLayer = window[layero.find('iframe')[0]['name']];
						if (currentLayer.page.logic.setData) {
							currentLayer.page.logic.setData(nsRes);
						}
					}
				});
			},
			see1: function () {
				var res = mini.get('datagrid');
				var nsRes = res.getSelected();
				layer.open({
					type: 2,
					title: '查看原始数据',
					content: '../../../html/pft/body/original.html',
					area: ['650px', '350px'],
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
			  	if (column.header == "成绩查看") {
			  		// e.cellHtml = '<a href="javascript:browser(0)"> 浏览 </a><a href="javascript:browser(1)"> 编辑 </a>';
			  		e.cellHtml = '<a href="###" class="see"> 查看打分明细 </a><a href="###" class="see1"> 查看原始数据 </a>';
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
					url: meetingRecordUrl + '?rawprojectBatchcode=' + nsCode,
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
		}
	};
	page.init();
	window.page = page;
});