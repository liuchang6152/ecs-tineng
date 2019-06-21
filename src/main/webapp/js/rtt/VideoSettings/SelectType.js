var leftMenuUrl = ECS.api.rttUrl + '/videoSurveullance/getTreeList'; //左侧树级菜单
var checkListUrl = ECS.api.rttUrl + "/msds/getRightList"; //获取某个节点下的选项数据；
var delLinkAll = ECS.api.rttUrl + "/msds/reset"; //删除
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName'; //企业名称
var loadUnitsUrl = ECS.api.rttUrl + "/msds/secunit"; //二级单位
window.pageLoadMode = PageLoadMode.None; //页面模式
var orgId;
var orglist = [];
var nsData;
var secordOrglist = [];
$(function () {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var page = {
		//页面初始化
		init: function () {
			mini.parse(); //初始化miniui框架
			ECS.sys.RefreshContextFromSYS(); //判断是否登录(获取当前用户)
			this.bindUI(); //绑定事件
			page.logic.initTable(); //初始化加载数据
			page.logic.enterprise(riskAreaTypeNameUrl, "enterpriseCode"); //企业名称
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
			//当保存；
			$("#btnSave").on("click", function () {
				page.logic.save();
			});
			//查询
			$("#btnQuery").click(function () {
				page.logic.load_Tree();
			});

			$("#enterpriseCode").change(function () {
				page.logic.enterprisechanged();
			});
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			enterprisechanged: function () {
				var enterprise = $("#enterpriseCode").val();
				var secordUrl = riskAreaTypeNameUrl + "?isAll=false&orgPID=" + enterprise + "&orgLvl=3";
				page.logic.getsecordEnterPriseSelects(secordUrl, "drtDeptCode", 'orgId', 'orgSname', false); //树形菜


			},
			enterprise: function (menu_url, oPar) {
				$.ajax({
					url: menu_url + "?orgLvl=1",
					type: "get",
					success: function (data) {
						var datalist = [];
						// //若是企业用户，设置为不可用状态；
						if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
							$.each(data, function (i, el) {
								datalist.push({
									id: el["orgId"],
									text: el["orgSname"]
								});
							});
						} else {
							var newList = JSLINQ(data).Where(function (x) {
								return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE;
							}).ToArray();
							$.each(newList, function (i, el) {
								datalist.push({
									id: el["orgId"],
									text: el["orgSname"]
								});
							});
							var secordUrl = menu_url + "?isAll=false&orgPID=" + newList[0].orgId + "&orgLvl=3";
							page.logic.getsecordEnterPriseSelects(secordUrl, "drtDeptCode", 'orgId', 'orgSname', false); //树形菜单
							$('#' + oPar).attr('disabled', 'disabled');

						}
						orgList = datalist;
						$('#' + oPar).select2({
							tags: false,
							data: datalist,
							language: {
								noResults: function (params) {
									return "没有匹配项";
								}
							},
						});
						console.log(nsData)
						$('#' + oPar).val(nsData.riskAreaCode).trigger("change");

					},
					error: function (e) {
						//	alert(e);
					}
				})
			},
			getsecordEnterPriseSelects: function (url, ctrlId, key, value, tags) {
				console.log(url);
				// $("#" + ctrlId).html('<option value="" selected="selected">可输入</option>');
				$.ajax({
					url: url,
					async: false,
					dataType: "json",
					success: function (data) {
						console.log(data.length);
						var datalist = [];
						$.each(data, function (i, el) {
							datalist.push({
								id: el[key],
								text: el[value],
								code: el["orgId"]
							});
						});
						secordOrglist = datalist;
						$('#' + ctrlId).select2({
							tags: tags,
							data: datalist,
							language: {
								noResults: function (params) {
									return "没有匹配项";
								}
							},
						});
					},
				});
				
				if (nsData.orgId) {
					$('#' + ctrlId).val(nsData.orgId).select2();
				}
			},
			/**
			 * 初始化表格
			 */
			initTable: function () {

			},
			//删除当前节点已关联的相关勾选数据；
			del_option_checked: function () {
				if (mini.get("acheck_list").getValue() == "") {
					layer.msg("请选择需要删除的危化品数据！");
					return false;
				}
				var idsArray = [];
				idsArray = mini.get("acheck_list").getValue().split(",");
				$.ajax({
					url: delLinkAll + "?treeId=" + mini.get("tree1").getSelectedNode().id + "&applicationLevel=" + mini.get("tree1").getSelectedNode().obj + "&now=" + Math.random(),
					type: "DELETE",
					data: JSON.stringify(idsArray),
					dataType: "text",
					contentType: "application/json;charset=utf-8",
					success: function (result) {
						result = JSON.parse(result)
						if (result.isSuccess) {
							layer.msg(result.message);
							//刷新某个节点关联的数据；
							page.logic.onenode_load_dt();
						} else {
							layer.msg(result.message);
						}
					}
				})
			},
			//tree某个节点相关联的数据加载
			onenode_load_dt: function (cb) {
				ECS.showLoading(); //显示加载；
				if (!mini.get("tree1").getSelectedNode()) {
					return false;
				}
				$.ajax({
					url: checkListUrl + "?treeId=" + mini.get("tree1").getSelectedNode().id + "&now=" + Math.random(),
					type: "GET",
					timeout: 5000,
					success: function (Data) {
						ECS.hideLoading(); //隐藏加载；
						// mini.get("acheck_list").load(Data); //checkboxlist加载选项数据
						cb && cb(Data);
					},
					error: function (err) {
						ECS.hideLoading(); //隐藏加载；
						//提示错误信息
						if (err) {
							layer.msg(err, {
								time: 1000
							});
						}
					}
				});
			},
			getLevenName: function (node, name) {
				var pNode = mini.get("tree1").getParentNode(node);
				if (pNode._level > -1) {
					name += "$$" + pNode.name;
					page.logic.getLevenName(pNode, name);
				} else {
					reutnName = name
				}
				return reutnName;
			},
			/*侧边栏菜单搜索列表数据*/
			getFulladdress: function () {
				page.data.param = {}
				//获取树选中的节点id和code;
				if (mini.get("tree1").getSelectedNode()) {
					var node = mini.get("tree1").getSelectedNode();
					var name = node.name;
					var position = page.logic.getLevenName(node, name);
					var strArr = position.split('$$');
					var title = '';
					for (var index = strArr.length; index > 0; index--) {
						title += strArr[index - 1] + (index == 1 ? "" : "  --  ");
					}
					return title;
				}

			},
			save: function () {
				var address = page.logic.getFulladdress();

				var obj = {};
				if ($("#tree1 .mini-tree-nodetext").length > 0) {
					obj.id = mini.get('tree1').getSelectedNode().id;
					obj.obj = mini.get('tree1').getSelectedNode().obj;
					obj.name = address;
					//  }
				}
				parent.ownDetail = obj;
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},

			setData: function (data) {
				console.log(data)
				nsData = data;
				orgId = data.orgId;
				console.log(orgId)
			},
			//侧边栏菜单添加
			load_Tree: function (cb) {
				ECS.showLoading(); //显示加载；
				var currentOrt = JSLINQ(orglist).Where(function (x) {
					return x.id == $("#enterpriseCode").val();
				}).ToArray()[0];
				console.log($("#enterpriseCode").val())
				console.log($("#drtDeptCode").val())

				if (!$("#enterpriseCode").val()) {
					layer.msg("企业不能为空");
					ECS.hideLoading(); //隐藏加载；
					return;
				}
				if (!$("#drtDeptCode").val()) {
					layer.msg("二级单位不能为空");
					ECS.hideLoading(); //隐藏加载；
					return;
				}
				$.ajax({
					url: leftMenuUrl + "?orgID=" + $("#enterpriseCode").val() + "&treeID=" + $("#drtDeptCode").val() + "&now=" + Math.random(),
					type: "GET",
					timeout: 5000,
					success: function (Data) {
						ECS.hideLoading(); //隐藏加载；
						//左侧菜单的数据填充
						mini.get("tree1").loadList(Data, "id", "pid");
						//默认第一项呈选中状态；
						mini.get("tree1").selectNode(Data[0]);
						//清空右侧某一项关联的数据
						// mini.get("acheck_list").load([]);
						//设置左侧的滚动条
						$("#tree1").parent().css("overflow-y", "auto");
						cb && cb();
					},
					error: function (err) {
						ECS.hideLoading(); //隐藏加载；
						//提示错误信息
						if (err) {
							layer.msg(err, {
								time: 1000
							});
						}
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
		}
	};
	page.init();
	window.page = page;
});