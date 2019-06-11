var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true'; //企业
var commGroupsType_url = ECS.api.emUrl + '/CommGroupsType'; //树形结构
var saveUrl = ECS.api.emUrl + '/CommonGroupOrg'; //保存
window.pageLoadMode = PageLoadMode.None;
var riskAreaCode, enterpriseCode, enterpriseName, isLeaf;
$(function () {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var node = {};
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();


			mini.get("commGroupsType").on("drawnode", function (e) {
				var field = e.field,
					record = e.record,
					index = e.rowIndex;
				if (e.record._level == 0) {
					e.showCheckBox = false;

				}
			});
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//保存
			$("#btnSave").click(function () {
				page.logic.save();
			});
			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
			//点击下拉框加载树形菜单
			mini.get("enterpriseCode").on("nodeclick", function (e) {
				page.logic.load_sidebar(commGroupsType_url, "commGroupsType", e.node.orgId); //树形菜单
			});
			//点击左侧树形菜单,查询表格数据
			mini.get("commGroupsType").on("nodeclick", function (e) {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				if (node.children) {
					return;
				}

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
			setData: function (data) {
				riskAreaCode = data.riskAreaCode;
				enterpriseCode = data.enterpriseCode;
				enterpriseName = data.enterpriseName;
				isLeaf = data.isLeaf;
				$('#title-main').text(data.title);
				mini.get("enterpriseCode").setEnabled(false);

				page.logic.select_option(enterpriseCodeUrl, "#enterpriseCode", data.keys); //企业名称
				pageMode = data.pageMode;
				if (pageMode == PageModelEnum.NewAdd) {
					return;
				}

			},
			//企业名称
			select_option: function (menu_url, oPar, keys) {
				$.ajax({
					url: menu_url,
					type: "get",
					success: function (data) {
						mini.get(oPar).loadList(data, "orgCode", "porgCode");
						mini.get(oPar).setValue(enterpriseCode);

						var ctrl = mini.get("enterpriseCode");
						// data[0].orgCode
						page.logic.load_sidebar(commGroupsType_url, "commGroupsType", ctrl.value, keys); //树形菜单
					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
			//树形菜单
			load_sidebar: function (treeUrl, oPar, pid, keys) {
				$.ajax({
					url: treeUrl + "?enterpriseCode=" + pid + "&commGroupIds=" + keys,
					type: "get",
					success: function (data) {
						if (data.length == 0) {
							data.push({
								id: 0,
								name: '无',
								children: []
							})
						}

						mini.get(oPar).loadData(data);

					},
					error: function (e) {
						//	alert(e);
					}
				});
			},

			/**
			 * 关闭弹出层
			 */
			closeLayer: function (isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
			/**
			 * 保存
			 */
			save: function () {
				var arr = [];
				var tree = mini.get("commGroupsType");
				var node = tree.getCheckedNodes(false);
				if (node.length == 0) {
					layer.msg("请选择通讯组");
					return false;
				}
				for (var i = 0; i < node.length; i++) {
					var row = node[i];
					var jsonData = {
						commGroupId: row.id
					};
					if (isLeaf) {
						jsonData.riskAreaCode = riskAreaCode;
					} else {
						jsonData.drtDeptCode = riskAreaCode;
					}
					arr.push(jsonData);
				}

				//处理提交类型
				var ajaxType = "POST";
				window.pageLoadMode = PageLoadMode.Refresh;
				console.log(JSON.stringify(jsonData));
				$.ajax({
					url: saveUrl,
					async: false,
					type: ajaxType,
					data: JSON.stringify(arr),
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					beforeSend: function () {
						$('#btnSave').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function (result) {
						ECS.hideLoading();
						$('#btnSave').attr('disabled', false);
						if (result.isSuccess) {
							layer.msg("保存成功！", {
								time: 1000
							}, function () {
								page.logic.closeLayer(true);
							});
						} else {
							layer.msg(result.message);
						}
					},
					error: function (result) {
						$('#btnSave').attr('disabled', false);
						ECS.hideLoading();

						layer.msg(result.message);
					}
				})
			},
			beforenodeselect: function (e) {

				//禁止选中父节点

				if (e.isLeaf == false) {
					e.cancel = true;
				}
			}
		}
	};
	page.init();
	window.page = page;
});