var eventUrl = ECS.api.apUrl + '/fileAlarmChild/getTransferPoliceInfo';
var historyEventUrl = ECS.api.apUrl + '/fileAlarmChild/getHistoricalEvents';
var wf1Url = ECS.api.apUrl + '/fileAlarmChild/getPoliceStatusK';  //接警流程
var wfUrl = ECS.api.apUrl + '/fileAlarmChild/getPoliceStatus';  //接警流程
var sourceUrl = ECS.api.apUrl + '/fileAlarmChild/getPoliceSource';  //接警来源
$(function () {
	var page = {
		init: function () {
			mini.parse();
			this.bindUI();
			//获取用户的相关数据
			ECS.sys.RefreshContextFromSYS();
		//	$("#userUid").val(ECS.sys.Context.SYS_USER_CODE);
			page.logic.initPage();
			page.logic.initStatus();
			page.logic.initWF();
			page.logic.search();
			page.logic.search2();
		},
		table: {},
		bindUI: function () {
				$('input').blur(function () {
					$(this).val($.trim($(this).val()))
				});

				
					//手动处警
					$('#btn_alarmDispatching').click(function() {
						page.logic.alarmDispatching();
					});
				//手动报警
				$('#btn').click(function() {
					page.logic.openHO();
				});
				//查询
				$('#btnQuery').click(function() {
					page.logic.search();
				});
				//查询
				$('#btnQuery2').click(function() {
					page.logic.search2();
				});
		},
		data: {
			param: {}
		},
		logic: {
			alarmDispatching:function(){
				var openUrl = '../../html/ap/FireAlarm/AlarmDispatchingIndex.html';
				window.parent.layerOpen(openUrl,'',function(){
					page.logic.search();
					page.logic.search2();
				},{height:'500px',width:'60%'});
			},
			openHO:function(){
				window.parent.HOstatus =true;
				var openUrl = '../../html/ap/FireAlarm/HO.html';
				window.parent.layerOpen(openUrl,'',function(){
					window.parent.HOstatus =false;
					page.logic.search();
					page.logic.search2();
				},{closeBtn:0});
			},
			initStatus :function(){
				// ECS.ui.getComboSelects(sourceUrl,"status","policeId","policeName",false);
			},
			initWF :function(){
				ECS.ui.getComboSelects(wf1Url,"eventCode","flowCode","flowName",false);
				ECS.ui.getComboSelects(wfUrl,"eventCode2","flowCode","flowName",false);
			},
			initPage: function () {
				var eventGrid = mini.get('eventDatagrid');
				eventGrid.set({
					url: eventUrl,
					ajaxType: 'GET',
					dataField: 'pageList'
				});

				var historyGrid = mini.get('historyDatagrid');
				historyGrid.set({
					url: historyEventUrl , //+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
					ajaxType: 'GET',
					dataField: 'pageList'
				});
			},
			search: function () {
			

				page.data.param = ECS.form.getData("searchForm");
				var form = new mini.Form('searchForm');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
			}
				var eventGrid = mini.get('eventDatagrid');
			     eventGrid.load(page.data.param,function(e){
				$("#lbtotal").text("("+e.total+")");	
				 });
			
				
			},
			search2: function () {
				page.data.param = ECS.form.getData("searchForm2");
				var form = new mini.Form('searchForm2');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
			}
				var historyGrid = mini.get('historyDatagrid');
				historyGrid.load(page.data.param);
			},
			show_Detail:function(e){
				return '<a href="javascript:window.page.logic.detail('+e.row.eventId+')">'+e.value+'</a>';
			},
			show_edit: function (e) {
				return '<a href="javascript:window.page.logic.WFdetail('+e.row.eventId+')">查看</a>';
			},
			detail: function (eventId) {
				var eventGrid = mini.get('eventDatagrid');
				var row  = eventGrid.getSelected();
				var openUrl  = '../../html/ap/FireAlarm/AO.html?r=' + Math.random();
				if(row.eventSource==0){
					openUrl  = '../../html/ap/FireAlarm/HO.html?r=' + Math.random();
				}
			
			
			
				window.parent.layerOpen(openUrl,eventId,function(){},{closeBtn:0});
				// layer.open({
				// 	type: 2,
				// 	closeBtn: 1,
				// 	area: ['100%', '100%'],
				// 	skin: 'new-class',
				// 	shadeClose: false,
				// 	title: '接警',
				// 	content: 'AO.html?r=' + Math.random(),
				// 	success: function (layero, index) {

				// 	},
				// 	end: function () {

				// 	}
				// })
			},
			WFdetail: function (eventId) {
				var openUrl = '../../html/ap/FireAlarm/WF.html?r=' + Math.random();
				window.parent.layerOpen(openUrl,eventId);
				// layer.open({
				// 	type: 2,
				// 	closeBtn: 1,
				// 	area: ['80%', '80%'],
				// 	skin: 'new-class',
				// 	shadeClose: false,
				// 	title: '单警情记录',
				// 	content: 'WF.html?r=' + Math.random(),
				// 	success: function (layero, index) {

				// 	},
				// 	end: function () {

				// 	}
				// })
			}
		}
	};
	page.init();
	window.page = page;
});