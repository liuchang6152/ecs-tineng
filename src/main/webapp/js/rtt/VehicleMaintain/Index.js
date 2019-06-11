var enterpriseUrl = ECS.api.bcUrl + '/org/porgName';  //企业
var dutyUrl = ECS.api.eddUrl + '/eddSchedul/dutyNames'; //队伍
var searchUrl = ECS.api.rttUrl + '/vehicleMaintain/getVehicleBigInfoByOrgId';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=1'; //企业
var addUrl = ECS.api.rttUrl + '/vehicleMaintain';
var delUrl = ECS.api.rttUrl + '/vehicleMaintain';   //删除车辆
var delAttrUrl = ECS.api.rttUrl + '/vehicleMaintain/deleteSmall';  //删除属性
var delSmailUrl = ECS.api.rttUrl + '/vehicleMaintain';
var searchDetailUrl = ECS.api.rttUrl + '/vehicleMaintain';
var exportUrl = ECS.api.eddUrl + '/eddSchedul/ExportToExcel';   //导出
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
var detailGrid_Form;
var grid;
$(function () {

	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();
			ECS.sys.RefreshContextFromSYS();
			page.logic.get_list(enterpriseUrl, $("#orgCode"));
			page.logic.initTable();
			page.logic.search();
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
			// 新增
			$('#btnAdd').click(function () {
				page.logic.add();
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
			//加载企业
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
							mini.get("orgCode").loadList(Data, "orgId", "orgPID");
							if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
								enterpriseCode = mini.get("orgCode").data[0].orgCode;
								mini.get("orgCode").setValue(mini.get("orgCode").data[0].orgCode);
							} else {
								enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
								mini.get("orgCode").disable();
								for (var w = 0; w < Data.length; w++) {
									(function (cur_key) {
										if (cur_key.orgCode == enterpriseCode) {
											mini.get("orgCode").setValue(cur_key.orgCode);
										}
									})(Data[w]);
								}
							}
							mini.get('orgCode').doValueChanged();
							cb && cb();
						}
					}
				});
			},

			/**
			 * 初始化表格
			 */
			initTable: function () {
				mini.parse();
				grid = mini.get("datagrid");
				detailGrid_Form = document.getElementById("detailGrid_Form");

			},
			show_edit: function (e) {
				return ECS.util.editRender("", "");
			},

			show_edit2: function (e) {
				return ECS.util.editRender("", "");

			},

			//返回编辑按钮
			show_editeditAttr: function () {

				return '<a title="编辑" href="javascript:window.page.logic.editAttr()"><i class="icon-edit edit"></i>编辑</a>&nbsp&nbsp<a title="删除" href="javascript:window.page.logic.delAttr()"><i class="icon-delete delete"></i>删除</a>';
			},


			/**
			 * 搜索
			 */
			search: function () {
				page.data.param = ECS.form.getData("searchForm");



				grid.set({
					url: searchUrl,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load(page.data.param);

			},


			/**
			 * 批量删除
			 */
			delAll: function () {
				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					idsArray.push(el.vehicleBigID);
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
								layer.msg(result.message, {
									time: 1000
								}, function () {
									grid.reload();
								});
							} else {

								layer.msg(result.message)
							}
						},
						error: function (result) {

							layer.msg(result.responseText);
						}
					})
				}, function (index) {
					layer.close(index)
				});
			},
			/**
			 * 新增
			 */
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "新增车辆分类";

				page.logic.detail(title, pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function () {
				var pageMode = PageModelEnum.Edit;
				var title = "修改车辆分类";
				page.logic.detail(title, pageMode);
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, pageMode) {
				var row;
				if (pageMode == PageModelEnum.Edit) {
					row = mini.get("datagrid").getSelected();

				}

				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['500px', '450px'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'Edit.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title

						};

						iframeWin.page.logic.setData(data, row);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search(true);
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


				mini.get("gridDetail").set({
					url: searchDetailUrl + "/" + row.vehicleBigID,
					ajaxType: "get",
					dataField: "result"
				});

				mini.get("gridDetail").load();


			},
			/**
			 * 关闭弹出层
			 */
			closeLayer: function (isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},


			editAttr: function () {
				var row = mini.get("gridDetail").getSelected();


				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['700px', '60%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'Attribute.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": PageModelEnum.NewAdd,
							'title': '属性管理'

						};

						iframeWin.page.logic.setData(data, row);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							page.logic.search(true);
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				})
			},
			delAttr: function () {
				var row = mini.get("gridDetail").getSelected();
				var ids = [];
				ids.push(row.vehicleSmallId)
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: delAttrUrl,
						async: true,
						data: JSON.stringify(ids),
						dataType: "json",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function (result) {
							if (result.isSuccess) {
								layer.msg(result.message, {
									time: 1000
								}, function () {
									mini.get("gridDetail").reload();
								});
							} else {

								layer.msg(result.message)
							}
						},
						error: function (result) {

							layer.msg(result.responseText);
						}
					})
				}, function (index) {
					layer.close(index)
				});
			}

		}
	};
	page.init();
	window.page = page;
});