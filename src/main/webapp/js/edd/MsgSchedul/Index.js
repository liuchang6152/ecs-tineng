var teamUrl = ECS.api.eddUrl + '/eddSchedul/getTeams'; //队伍
var dutyUrl = ECS.api.eddUrl + '/eddSchedul/dutyNames'; //队伍
var searchUrl = ECS.api.eddUrl + '/eddSchedul/page';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true';  //企业
var delUrl = ECS.api.eddUrl + '/eddSchedul';
var exportUrl = ECS.api.eddUrl +'/eddSchedul/ExportToExcel';   //导出

var teamIdUrl = ECS.api.apUrl + '/policeProcess/getUserTeamId'; //队伍
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
var teamId ;
$(function() {

	var page = {
		//页面初始化
		init: function() {
			mini.parse();
			this.bindUI();
			page.logic.initTable();
            page.logic.search();
			page.logic.InitTeam(teamUrl,'teamId');
			page.logic.Initduty(dutyUrl,'dutyName');
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function() {
			$(".btnClose").click(function() {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
			//搜索栏中input不允许输入空格
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});
			// 新增
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            	// 导出
			$('#btnExport').click(function() {
				var form = new mini.Form('searchForm');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
			}
				page.data.param = ECS.form.getData("searchForm");
				var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
			});
			//查询
			$('#btnQuery').click(function() {
				page.logic.search();
			});
			//批量删除
			$('#btnDel').click(function() {
				page.logic.delAll();
			});

		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			setUrlK: function (ojson) {

				var s = '', name, key;

				for (var p in ojson) {

					// if(!ojson[p]) {return null;} 

					if (ojson.hasOwnProperty(p)) { name = p };

					key = ojson[p];

					s += "&" + name + "=" + encodeURIComponent(key);

				};

				return s.substring(1, s.length);

			},
			//加载队伍
			
			InitTeam: function(menu_url, oPar) {
				ECS.ui.getComboSelects(menu_url,"teamId","teamID","teamName",false);
			
				$.ajax({
					url: teamIdUrl,
					type: "get",
				
					contentType: "application/json;charset=utf-8",
					success: function (data) {
						if(data.result){
						if(data.result.teamId){
							teamId = data.result.teamId;
						
							$('#btnExport').attr('disabled', false);
						};
						}
				
                   

					},
					error: function (e) {
						//	alert(e);
					}
				});
			},
			//加载职务
			Initduty: function(menu_url, oPar) {
				ECS.ui.getComboSelects(menu_url,"dutyName","name","name",false);
			
			},
			/**
			 * 初始化编辑数据
			 */
			setData: function(data) {
			
				$('#title-main').text(data.title);
			
				page.logic.search();
				pageMode = data.pageMode;
				if(pageMode == PageModelEnum.NewAdd) {
					return;
				}

			},
			/**
			 * 初始化表格
			 */
			initTable: function() {
				mini.parse();
				grid = mini.get("datagrid");

			},
			show_edit: function(e) {
				if(e.row.isTeam)
				return ECS.util.editRender(e.row.commGroupTypeId, e.row.enterpriseCode);
			},
			
			/**
			 * 搜索
			 */
			search: function() {
				var form = new mini.Form('searchForm');
				var data = form.getData();
				if (data.startTime > data.endTime) {
					layer.msg('开始时间不能大于结束时间');
					return;
			}
				page.data.param = ECS.form.getData("searchForm");
			   
				grid.set({
					url: searchUrl,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load(page.data.param);
				
				$('#personnelName').val('');


			},
			/**
			 * 批量删除
			 */
			delAll: function() {
				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function(i, el) {
					idsArray.push({
						schedulId: el.schedulId
					});
				});
				if(idsArray.length == 0) {
					layer.msg("请选择要删除的数据!");
					return;
				}
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function() {
					$.ajax({
						url: delUrl,
						async: true,
						data: JSON.stringify(idsArray),
						dataType: "json",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function(result) {
							if(result.isSuccess) {
								layer.msg("删除成功！", {
									time: 1000
								}, function() {
									grid.reload();
								});
							} else {

								layer.msg(result.message)
							}
						},
						error: function(result) {
							var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);
						}
					})
				}, function(index) {
					layer.close(index)
				});
			},
			/**
			 * 新增
			 */
			add: function() {
				var pageMode = PageModelEnum.NewAdd;
				var title = "通讯组新增";

				page.logic.detail(title, "", "", pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function(commGroupTypeId, orgID) {
				var pageMode = PageModelEnum.Edit;
				var title = "编辑值班人员";   
				page.logic.detail(title, commGroupTypeId, orgID, pageMode);
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function(title, commGroupTypeId, orgID, pageMode) {
				var commGroupTypeName;
				if(pageMode == PageModelEnum.Edit) {
					var row = mini.get("datagrid").getSelected();
					commGroupTypeName = row.commGroupTypeName;
				}
				var gridList  = grid.getSelected();

				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '90%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'Edit.html?' + Math.random(),
					success: function(layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title
						
						};
						if(pageMode==PageModelEnum.Edit){
						
						}
						iframeWin.page.logic.setData(data,gridList);
					},
					end: function() {
						if(window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						} else if(window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						}
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
			imp: function () {
                var impUrl = ECS.api.eddUrl +'/eddSchedul/importExcel'; 
                var exportUrl =  ECS.api.eddUrl +'/eddSchedul/ExportExcel'; 
                var confirmUrl =  ECS.api.eddUrl +'/eddSchedul/importAddAll'; 
				var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
			}
           
		}
	};
	page.init();
	window.page = page;
});