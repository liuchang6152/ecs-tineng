var delUrl = ECS.api.emUrl + '/CommGroupsType';
var searchUrl = ECS.api.emUrl + '/CommGroupsType';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true';  //企业
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
$(function() {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var page = {
		//页面初始化
		init: function() {
			mini.parse();
			this.bindUI();
			page.logic.initTable();

			page.logic.initOrgCode(enterpriseCodeUrl); //企业
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
			$('#btnAdd').click(function() {
				page.logic.add('新增', "", PageModelEnum.NewAdd);
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
			/**
			 * 初始化编辑数据
			 */
			setData: function(data) {
				enterpriseCode = data.enterpriseCode;
				$('#title-main').text(data.title);
				mini.get("enterpriseCode").setValue(enterpriseCode);
				mini.get("enterpriseCode").setEnabled(false);
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
				return ECS.util.editRender(e.row.commGroupTypeId, e.row.enterpriseCode);
			},
			/**
			 * 企业
			 */
			initOrgCode: function(menu_url) {
				$.ajax({
					url: menu_url,
					type: "get",
					success: function(data) {
						mini.get("enterpriseCode").loadList(data, "orgCode", "porgCode");
						mini.get("enterpriseCode").setValue(enterpriseCode);
					}
				})
			},
			/**
			 * 搜索
			 */
			search: function(showSort) {
				page.data.param = ECS.form.getData("searchForm");
				if(showSort) {
					page.data.param["sortType"] = 1;
				}

				var url = searchUrl + "/query";
				grid.set({
					url: url,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load({
					enterpriseCode:mini.get("enterpriseCode").value,
					commGroupTypeName:mini.get("TypeName").value
				});

			},
			/**
			 * 批量删除
			 */
			delAll: function() {
				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function(i, el) {
					idsArray.push({
						commGroupTypeId: el.commGroupTypeId
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
				var title = "通讯组类型配置";

				page.logic.detail(title, "", "", pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function(commGroupTypeId, orgID) {
				var pageMode = PageModelEnum.Edit; 
				var title = "通讯组类型配置";
				page.logic.detail(title, commGroupTypeId, orgID, pageMode);
			},
			/**
			 * 装置新增或者编辑详细页面
			 */
			detail: function(title, commGroupTypeId, orgID, pageMode) {
				var commGroupTypeName;
				if(pageMode == PageModelEnum.Edit) {
					var row = mini.get("datagrid").getSelected();
					commGroupTypeName = row.commGroupTypeName;
				}
				var gridList  = grid.getList();
				var row  =grid.getSelected();
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['400px', '80%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'CommGroupTypeAddOrEdit.html?' + Math.random(),
					success: function(layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							"commGroupTypeId": commGroupTypeId,
							"commGroupTypeName": commGroupTypeName,
							"orgID": orgID,
							'title': title,
							"enterpriseCode": enterpriseCode
						};
						if(pageMode==PageModelEnum.Edit){
							data.gridList =gridList;
							data.row =row;
						}
						iframeWin.page.logic.setData(data);
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
			}
		}
	};
	page.init();
	window.page = page;
});