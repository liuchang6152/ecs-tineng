var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName';  //企业
var commGroupsType_url = ECS.api.emUrl + '/CommGroupsType'; //树形结构
var addType_url = ECS.api.emUrl + '/CommGroupsType'; //新增修改通讯组类型
var delType = ECS.api.emUrl + '/CommGroupsType'; //删除通讯组类型
var delGroup = ECS.api.emUrl + '/CommGroups'; //删除通讯组
var searchUrl = ECS.api.emUrl + '/PersonInCommGroup'; //点击左侧树形菜单,查询表格数据
var exportUrl = ECS.api.emUrl +'/CommGroups/ExportToExcel';                //导出
window.pageLoadMode = PageLoadMode.None;
pageflag =true;
redisKey ='';
$(function () {
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			this.bindUI();
			$("#searchForm").find('input').val("");
			//获取用户的相关数据
			ECS.sys.RefreshContextFromSYS();
			page.logic.get_list(enterpriseCodeUrl, $("#enterpriseCode")); //企业名称
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//点击下拉框加载树形菜单
			mini.get("enterpriseCode").on("nodeclick", function (e) {
				page.logic.load_sidebar(commGroupsType_url, "commGroupsType", e.node.orgCode); //树形菜单
			});
			//点击左侧树形菜单,查询表格数据
			mini.get("commGroupsType").on("nodeclick", function (e) {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				if (node.children) {
					return;
				}
				page.logic.search(); //表格
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search(); //表格
			});
			//批量删除
			$('#btnDel').click(function () {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				page.logic.delAll(node.id, node);
			});

			   // 导入
			   $('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
           

				window.open(exportUrl+"?enterpriseCode="+mini.get("enterpriseCode").value);
              
            });
			//人员选择弹窗
			$("#btnAdd").click(function () {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				var nsCode = mini.get('enterpriseCode').getValue();
				if (node.children) {
					layer.msg("请选择组！", {
						time: 1000
					}, function () {

					});
				} else {
					var commGroupId = node.id;
					page.logic.selectOwner("人员选择", commGroupId, node, PageModelEnum.NewAdd, nsCode)
				}
			});
		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			//企业名称
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
							page.logic.load_sidebar(commGroupsType_url, "commGroupsType", enterpriseCode); //树形菜单
							cb && cb();
						}
					}
				});
			},
			//树形菜单
			load_sidebar: function (treeUrl, oPar, pid) {
				$.ajax({
					url: treeUrl + "?enterpriseCode=" + pid,
					type: "get",
					success: function (data) {
						if (data.length == 0) {
							$("#add").hide();
							$("#edit").hide();
							$("#remove").hide();
							data.push({
								id: 0,
								name: '无',
								children: []
							})
						} else {
							$("#add").show();
							$("#edit").show();
							$("#remove").show();
						}

						mini.get(oPar).loadData(data);

					},
					error: function (e) {
						//	alert(e);
					}
				});
			},
			search: function () {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				if (node.children) {
					return;
				}
				grid = mini.get("datagrid");
				grid.set({
					url: searchUrl + '/search',
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load({
					commGroupId: node.id,
					userName: $.trim( mini.get("key_words").value)
				});
			},
			/**
			 * 初始化表格
			 */
			initTable: function (e) {
				grid = mini.get("datagrid");
			},
			//类型管理
			onManage: function (e) {
				var ctrl = mini.get("enterpriseCode");
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				console.log(node);
				//   var newNode = {"selectGroupId":0};
				//   tree.addNode(newNode, "before", node);
				var pageMode = PageModelEnum.NewAdd;
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['900px', '500px'],
					skin: 'new-class',
					shadeClose: false,
					scrollbar: false,
					title: false,
					content: 'CommGroupType.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': "通讯组类型维护",
							'enterpriseCode': ctrl.value,
							'enterpriseName': ctrl.text
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {

						page.logic.load_sidebar(commGroupsType_url, "commGroupsType", ctrl.value); //树形菜单
					}
				})
			},
			//添加组
			onAddNode: function (e) {
				var ctrl = mini.get("enterpriseCode");
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				var pageMode = PageModelEnum.NewAdd;
				var title = "新增通讯组";
				var parentNode = tree.getParentNode(node)
				if (parentNode._level == -1) {
					page.logic.detail(title, ctrl.value, ctrl.text, node.id, node.name, pageMode);
				} else {
					layer.msg("请选择组类型！", {
						time: 1000
					}, function () {

					});
				}

			},
			//编辑组
			onEditNode: function (e) {
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				var parentNode = tree.getParentNode(node)
				var ctrl = mini.get("enterpriseCode");

				var title = "编辑通讯组";
				var pageMode = PageModelEnum.Edit;
				if (!node.children) {
					page.logic.detail(title, ctrl.value, ctrl.text, node.id, node.name, parentNode.id, parentNode.name, pageMode);
				} else {
					layer.msg("请选择组！", {
						time: 1000
					}, function () {

					});
				}

			},
			//删除组
			onRemoveNode: function (e) {
				var ctrl = mini.get("enterpriseCode");
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				if (node.children) {
					layer.msg("请选择组！", {
						time: 1000
					}, function () {

					});
					return;
				}
				if (node) {
					var data = {
						commGroupid: node.id
					};

					layer.confirm('确定删除选中通讯组？', {
						btn: ['确定', '取消']
					}, function () {
						$.ajax({
							url: delGroup,
							async: false,
							data: JSON.stringify(data),
							dataType: "json",
							contentType: "application/json;charset=utf-8",
							type: 'DELETE',
							success: function (result) {
								if (result.isSuccess) {
									layer.msg(result.message, {
										time: 1000
									}, function () {
										page.logic.load_sidebar(commGroupsType_url, "commGroupsType", ctrl.value); //树形菜单

									});
								} else {

									layer.msg(result.message)
								}
							},
							error: function (result) {
								var errorResult = $.parseJSON(result.responseText);
								layer.msg(errorResult.collection.error.message);
							}
						})
					}, function (index) {
						layer.close(index)
					});
				}
			},
			//显示右键菜单
			onBeforeOpen: function (e) {

				var menu = e.sender;
				var tree = mini.get("commGroupsType");
				var node = tree.getSelectedNode();
				if (!node) {
					e.cancel = true;
					return;
				}
				if (node && node.text == "Base") {
					e.cancel = true;
					//阻止浏览器默认右键菜单
					e.htmlEvent.preventDefault();
					return;
				}
				var manageItem = mini.getbyName("manage", menu);
				var addItem = mini.getbyName("add", menu);
				var editItem = mini.getbyName("edit", menu);
				var removeItem = mini.getbyName("remove", menu);

				if (node.id == "forms") {
					manageItem.show();
					addItem.show();
					editItem.hide();
					removeItem.hide();
				}
				if (node.id == "lists") {
					manageItem.hide();
					addItem.hide();
					editItem.show();
					removeItem.show();
				}
				var Event = e || window.event;
				if (Event.stopPropagation) { //W3C阻止冒泡方法
					Event.stopPropagation();
				} else {
					Event.cancelBubble = true; //IE阻止冒泡方法
				}
			},
			/**
			 * 批量删除
			 * */
			delAll: function (commGroupId, node) {
				var ctrl = mini.get("enterpriseCode");
				var idsArray = new Array();
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					var user = {
						userId: el.userID,
						commGroupId: commGroupId
					};
					idsArray.push(user);
				});
				if (idsArray.length == 0) {
					layer.msg("请选择要删除的数据!");
					return;
				}
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: searchUrl,
						async: false,
						data: JSON.stringify(idsArray),
						dataType: "json",
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function (result) {
							if (result.isSuccess) {
								layer.msg("删除成功！", {
									time: 1000
								}, function () {

									//	grid.load();
									var nodeName = node.name + '(' + Number(node.personCount - idsArray.length) + ')';
									var personCount = Number(node.personCount - idsArray.length);
									mini.get("commGroupsType").updateNode(node, { groupNameAndCount: nodeName, personCount: personCount });
									page.logic.search(); //表格
								});
							} else {
								layer.msg(result.message);
							}
						},
						error: function (result) {
							var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);
						}
					})
				}, function (index) {
					layer.close(index)
				});
			},
			//人员选择
			selectOwner: function (title, commGroupId, node, pageMode, nsCode) {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '90%'],
					skin: 'new-class',
					shadeClose: false,
					scrollbar: false,
					title: false,
					content: 'SelectPersons.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title,
							'orgCode': nsCode
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						var existPerson = [];
						function isRepeat(params) {
							var list = grid.getList();
							for (var i = 0; i < list.length; i++) {
								var obj = list[i];
								if (obj.userID == params.userId) {
									existPerson.push(params.userName);
									return true;
								}
							}
							return false;
						}

						var arr = [];

						for (var i = 0; i < window.ownDetail.length; i++) {
							var obj = window.ownDetail[i];
							if (!isRepeat(obj)) {
								var user = {
									userId: obj.userId,
									commGroupId: commGroupId
								};
								arr.push(user);
							} else {
								if (window.ownDetail.length > 0) {
									layer.msg("该人员已存在！" + existPerson.toString(','), {
										time: 1000
									});
									//	return false;
								}
							}

						}

						if (arr.length == 0) {
							return;
						}

						$.ajax({
							url: searchUrl,
							async: false,
							type: "POST",
							data: JSON.stringify(arr),
							dataType: "json",
							contentType: "application/json;charset=utf-8",
							beforeSend: function () {
								$('#btnSave').attr('disabled', 'disabled');
								ECS.showLoading();
							},
							success: function (result) {
								ECS.hideLoading();
								if (result.isSuccess) {

									var nodeName = node.name + '(' + Number(node.personCount + arr.length) + ')';
									var personCount = Number(node.personCount + arr.length);
									mini.get("commGroupsType").updateNode(node, { groupNameAndCount: nodeName, personCount: personCount });

									page.logic.search(); //表格
									layer.msg("保存成功！", {
										time: 1000
									}, function () {

									});
								} else {
									layer.msg(result.message);
								}
							},
							error: function (result) {
								$('#btnSave').attr('disabled', false);
								ECS.hideLoading();
								var errorResult = $.parseJSON(result.responseText);
								layer.msg(errorResult.collection.error.message);
							}
						})

					}
				})
			},

			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, enterpriseCode, enterpriseName, commGroupTypeId, commGroupTypeName, ptypeId, ptypeName, pageMode) {
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['400px', '400px'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'CommGroupAddOrEdit.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							"commGroupTypeId": commGroupTypeId,
							"commGroupTypeName": commGroupTypeName,
							"enterpriseCode": enterpriseCode,
							"enterpriseName": enterpriseName,
							'title': title

						};
						if (pageMode == PageModelEnum.NewAdd) {

						}
						if (pageMode == PageModelEnum.Edit) {
							data.commGroupTypeId = ptypeId;
							data.commGroupTypeName = ptypeName;
							data.groupName = commGroupTypeName;
							data.groupId = commGroupTypeId;
						}
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						page.logic.load_sidebar(commGroupsType_url, "commGroupsType", enterpriseCode); //树形菜单
					}
				})
			},

			imp: function () {
                var impUrl = ECS.api.emUrl +'/CommGroups/importExcel'; 
                var exportUrl =  ECS.api.emUrl +'/CommGroups/ExportExcel'; 
                var confirmUrl =  ECS.api.emUrl +'/CommGroups/importAddAll'; 
				var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
			}
         
		}
	};
	page.init();
	window.page = page;
});