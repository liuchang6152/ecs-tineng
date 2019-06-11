var delUrl = ECS.api.emUrl + '/CommonGroupOrg';
var commGroupsType_url = ECS.api.emUrl + '/CommonGroupOrg/allRiskTree'; //树形结构
var searchUrl = ECS.api.emUrl + '/CommonGroupOrg';
var searchGroupTypeUrl = ECS.api.emUrl + '/CommGroupsType';
var searchPersonUrl = ECS.api.emUrl + '/PersonInCommGroup'; //查询人员表格数据
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName';  //企业
window.pageLoadMode = PageLoadMode.None;
var detailGrid_Form;
$(function () {
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();			
			ECS.sys.RefreshContextFromSYS();
			page.logic.get_list(enterpriseCodeUrl, $("#enterpriseCode")); //企业名称
			var orgCode = mini.get('enterpriseCode').getSelectedNode().orgCode;
			page.logic.load_sidebar(commGroupsType_url, "tree1", orgCode); //树形菜单
			page.logic.loadGroupType(orgCode);
			page.logic.initTable();

		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//点击下拉框加载树形菜单
			mini.get("enterpriseCode").on("nodeclick", function (e) {
				page.logic.load_sidebar(commGroupsType_url, "tree1", e.node.orgCode); //树形菜单
				page.logic.loadGroupType(e.node.orgCode);
			});

			//点击左侧树形菜单,查询表格数据
			mini.get("tree1").on("nodeclick", function (e) {

				page.logic.search(); //表格
				mini.get("employee_grid").setData([]);


			});

			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			// 新增
			$('#btnAdd').click(function () {
				page.logic.add('新增', "", PageModelEnum.NewAdd);
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
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
				mini.parse();
				grid = mini.get("datagrid");
				detailGrid_Form = document.getElementById("detailGrid_Form");

			},
			show_edit: function (e) {
				return ECS.util.editRender(e.row.constitutionTypeID, e.row.orgCode);
			},
			/**
			 * 企业
			 */
			get_list: function (url, oPar, Pid, cb) {
				if (Pid) {
					//二级单位
					var cur_url = url + "?isAll=true&orgPID=" + Pid + "&orgLvl=3";
				} else {
					//企业
					var cur_url = url + "?orgLvl=2";
				}
				$.ajax({
					async: false,
					url: cur_url,
					type: "GET",
					success: function (Data) {
						if (Pid) {
							//二级单位
							mini.get("drtDeptCode").loadList(Data, "orgId", "orgPID");
							mini.get("drtDeptCode").setValue("全部");
							page.logic.load_risk_menu();
							cb && cb();
						} else {
							//企业
							mini.get("enterpriseCode").loadList(Data, "orgId", "orgPID");
							if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
								enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
								mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode);
							} else {
								enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
								mini.get("enterpriseCode").disable();
								for (var w = 0; w < Data.length; w++) {
									(function (cur_key) {
										if (cur_key.orgCode == enterpriseCode) {
											mini.get("enterpriseCode").setValue(cur_key.orgCode);
										}
									})(Data[w]);
								}
							}
							mini.get('enterpriseCode').doValueChanged();
							cb && cb();
						}
					}
				});
			},
			//树形菜单
			load_sidebar: function (treeUrl, oPar, pid) {
				$.ajax({
					url: treeUrl + "?code=" + pid,
					type: "get",
					success: function (data) {
						if (data.length == 0) {
							data.push({
								id: 0,
								name: '无',
								children: []
							})
						}
						//console.log(JSON.stringify(data))
						mini.get(oPar).loadList(data, "orgCode", "pOrgCode");

					},
					error: function (e) {
						//	alert(e);
					}
				});
			},
			onSelectionChanged: function (e) {
				var grid = e.sender;
				var record = grid.getSelected();
				if (record) {

					var employeeGrid = mini.get("employee_grid");
					employeeGrid.set({
						url: searchPersonUrl + '?commGroupId=' + record.commGroupid,
						ajaxType: "get",
						dataField: "pageList"
					});
					employeeGrid.load({

					}, function () {

					});
				}
			},
			loadGroupType: function (enterpriseCode) {

				var url = searchGroupTypeUrl + "/query?enterpriseCode=" + enterpriseCode;
				ECS.ui.getComboSelects(url,"commGroupType","commGroupTypeId","commGroupTypeName",false);
				
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
					dataField: "result"
				});
				console.log(tree.isLeaf(node))
				if (tree.isLeaf(node)) {
					grid.load({
						riskAreaCode: node.orgCode,
						groupName: page.data.param.key_words,
						commGroupTypeId: page.data.param.commGroupType
					});
				} else {
					grid.load({
						drtDeptCode: node.orgCode,
						groupName: page.data.param.key_words,
						commGroupTypeId: page.data.param.commGroupType
					});
				}
				
			},

			/**
			 * 新增
			 */
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "选择通讯组";
				var tree = mini.get("tree1");
				var node = tree.getSelectedNode();
				if (!node) {
					layer.msg("请选择风险区!");
					return;
				}
				var isLeaf = tree.isLeaf(node);
				var ctrl = mini.get("enterpriseCode");
				page.logic.detail(title, node.orgCode, ctrl.value, ctrl.text, pageMode, isLeaf);
			},

			/**
			 * 批量删除
			 */
			delAll: function () {
				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					idsArray.push({
						riskAreaCode: el.riskAreaCode,
						commGroupId: el.commGroupid
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
								layer.msg(result.message);
							}

						},
						error: function (result) {
							var errorResult = $.parseJSON(result.responseText);
							layer.msg("系统繁忙");
						}
					})
				}, function (index) {
					layer.close(index)
				});
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, riskAreaCode, enterpriseCode, enterpriseName, pageMode,isLeaf) {
				var gridList  = grid.getList();
				var keysArr = [];
				var keys = '';
				for (var index = 0; index < gridList.length; index++) {
					var element = gridList[index];
					keysArr.push(element.commGroupid);
					keys += element.commGroupid +";";
				}
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['400px', '400px'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'SelectGroup.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							"riskAreaCode": riskAreaCode,
							"enterpriseCode": enterpriseCode,
							'enterpriseName': enterpriseName,
							'title': title,
							'keys':keys,
							'isLeaf': isLeaf
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search();
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})
			},
			onShowRowDetail: function (e) {
			
				var grid = e.sender;
				var row = e.record;

				var td = grid.getRowDetailCellEl(row);
				td.appendChild(detailGrid_Form);
				detailGrid_Form.style.display = "block";


				page.logic.onSelectionChanged(e);
				

			},
		}
	};
	page.init();
	window.page = page;
});