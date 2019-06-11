var delUrl = ECS.api.emUrl + '/CommonGroupOrg';
var treeurl = ECS.api.apUrl + '/event/getRiskTree'; //树形结构
var searchUrl = ECS.api.apUrl + '/event/getEmergencyPlanByCondition';
var searchTypeUrl = ECS.api.apUrl + '/event/getconfimPlanDefinition';
var submitUrl = ECS.api.apUrl + '/event/planDetermination';
window.pageLoadMode = PageLoadMode.None;
var eventId  ='';
$(function () {
    var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();
			page.logic.initTable();
			ECS.sys.RefreshContextFromSYS();
         
            page.logic.loadType();
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//点击左侧树形菜单,查询表格数据
			mini.get("tree1").on("nodeclick", function (e) {
				page.logic.search(); //表格
			});

			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			// 新增
			$('#btnAdd').click(function () {
				page.logic.submit();
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
			});
		

		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
            setData: function (data) {
             
				eventId = data.eventId;
				page.logic.load_sidebar(treeurl, "tree1"); //树形菜单
            },
			/**
			 * 初始化表格
			 */
			initTable: function () {
				mini.parse();
				grid = mini.get("datagrid");

			},
			show_edit: function (e) {
				return ECS.util.editRender(e.row.constitutionTypeID, e.row.orgCode);
			},
			
			//树形菜单
			load_sidebar: function (treeUrl, oPar) {
				$.ajax({
					url: treeUrl + "?eventId=" + eventId,
					type: "get",
					success: function (data) {
						
						mini.get(oPar).loadList(data.result, "orgRiskId", "pOrgRiskId");

					},
					error: function (e) {
						//	alert(e);
					}
				});
            },
            
		
			loadType: function (enterpriseCode) {

			
				ECS.ui.getComboSelects(searchTypeUrl,"Type","id","name",false);
				
			},
			/**
			 * 搜索
			 */
			search: function () {
				var tree = mini.get("tree1");
				var node = tree.getSelectedNode();
				page.data.param = ECS.form.getData("searchForm");

				grid.set({
					url: searchUrl ,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load({
					enterpriseId: node.orgRiskId,
					emergencyPlanName:page.data.param.key_words,
					planDefinition :page.data.param.Type
				});
			},

			/**
			 * 确认
			 */
			submit: function () {
                var rows = grid.getSelected();
                var jsonData = {
					eventId: eventId,
					planId: rows.emergencyPlanID
				};
                
                $.ajax({
                    url: submitUrl,
					async: false,
					type: 'post',
					data: JSON.stringify(jsonData),
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					beforeSend: function() {
						$('#btnAdd').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function(result) {
                        ECS.hideLoading();
                        $('#btnAdd').attr('disabled', false);
						if(result.isSuccess) {
							layer.msg("确认成功！", {
								time: 1000
							}, function() {
                                page.logic.closeLayer(true);
							});
						} else {
							layer.msg(result.message);
						}
					},
					error: function(result) {
						$('#btnAdd').attr('disabled', false);
						ECS.hideLoading();
					
						layer.msg('系统繁忙');
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