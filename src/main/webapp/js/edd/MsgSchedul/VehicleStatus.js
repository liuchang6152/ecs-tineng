var teamUrl = ECS.api.apUrl + '/policeProcess/getUserTeamId'; //队伍
var searchUrl = ECS.api.apUrl + '/policeProcess/getTeamByTeamIdStatus';   //车辆
var updateUrl = ECS.api.apUrl + '/firemanGo/changeVehicleState';  //修改状态

http://localhost:8090/api/ap/policeProcess/getUserTeamId?_=1548322303004
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
$(function() {

	var page = {
		//页面初始化
		init: function() {
           
			mini.parse();
			this.bindUI();
			page.logic.initTable();
           
			page.logic.InitTeam();
            
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function() {
		
			//搜索栏中input不允许输入空格
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});
		
			//查询
			$('#btnQuery').click(function() {
				page.logic.search();
			});
            
            mini.get("datagrid").on("cellendedit",function(e){
                page.logic.onchange(e);
            });
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			//加载队伍
			
			InitTeam: function() {
                $.ajax({
					url: teamUrl,
					type: "get",
				
					contentType: "application/json;charset=utf-8",
					success: function (data) {
						if(data.result){
							$("#lbteam").text(data.result.teamName);
							page.logic.search(data.result.teamId);
						}
				
                   

					},
					error: function (e) {
						//	alert(e);
					}
				});
			
			},
			show_Detail:function(e){
				return '<a href="javascript:window.page.logic.detail('+e.row.vehicleId+')">详情</a>';
			},
			detail: function (eventId) {
				var openUrl  = '../../html/edd/MsgSchedul/VehicleAlarmStatus.html?r=' + Math.random();
			
			
				window.parent.layerOpen(openUrl,eventId,function()
				{

				},{height:'550px',width:'80%',closeBtn:1});
			
			},
			/**
			 * 初始化表格
			 */
			initTable: function() {
                
				mini.parse();
				grid = mini.get("datagrid");

			},
			show_edit: function(e) {
				return ECS.util.editRender(e.row.commGroupTypeId, e.row.enterpriseCode);
			},
			
			/**
			 * 搜索
			 */
			search: function(teamId) {
				grid.set({
					url: searchUrl+"?teamIds="+teamId,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load();


               
			  
			

            },
            
            onchange :function(e){
				var jsonData = {
					vehicleID: e.row.vehicleId,
					poactionStatus :e.value
				};
                $.ajax({
					url: updateUrl ,//请求的地址
					async: false,
					type: 'PUT',
					data: JSON.stringify(jsonData),
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
			
			/**
			 * 关闭弹出层
			 */
			closeLayer: function(isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
		
		}
	};
	page.init();
	window.page = page;
});