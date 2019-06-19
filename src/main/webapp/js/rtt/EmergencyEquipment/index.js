var searchTypeUrl = ECS.api.apUrl + '/event/getconfimPlanDefinition'; //预案类型
var smallTypeUrl = ECS.api.apUrl + '/event/getAccidentCategory'; //事故小类
var searchUrl = ECS.api.rttUrl + '/emergencyEquipment'; //查询、列表初始化
var exportUrl = ECS.api.rttUrl + '/emergencyEquipment/ExportToExcel';   //导出
var dept_url = ECS.api.apUrl + '/event/getSecunit';         //企业、二级单位
var riskType_url = ECS.api.apUrl + '/event/getRiskArea';  //安全风险区类型
var OptRisk_url = ECS.api.apUrl + '/event/getOptRisk';  //作业风险区类型
var RiskAnlsObj_url = ECS.api.apUrl + '/event/getRiskAnlsObj';  //安全风险区类型
var delUrl = ECS.api.rttUrl + '/emergencyEquipment'; //删除
var Enterprise_url = ECS.api.rttUrl +'/expert/getExpertTypeEnumList';                //企业内/外
var inUseUrl = ECS.api.commonUrl + "/getInUse";//是否启用
var bigUrl = ECS.api.bcUrl + '/busiBgCateg/getListByModelID?businessModelId=32'; //大类
var mUrl = ECS.api.bcUrl + '/busiBgCateg/getListByBgCode'; //中类
var stockpilePointTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getStoreTypeEnumList'; //   存放点类型
var stockpileTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getRepoTypeEnumList'; //存储库类型
var riskorg_url = ECS.api.bcUrl + '/org/porgName';
var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";    //企业节点编码；
var drtDeptCode = "";       //二级单位节点编码；
window.pageLoadMode = PageLoadMode.None;
$(function () {
	var page = {
		//页面初始化
		init: function () {
			mini.parse();                      //初始化miniui框架
			this.bindUI();                     //绑定事件
			ECS.sys.RefreshContextFromSYS();
			page.logic.loadType();
			$("#searchForm")[0].reset();      //初始化查询条件
			page.logic.initTable();            //初始化表格
			page.logic.enterprise(riskorg_url, "enterpriseCode"); //企业名称
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			//展示收缩
			$('#btnToggle').click(function () {
				if (flag) {
					flag = !flag;
					$(this).html('<i class="icon-showMore"></i>');
					$(".search-unfixed").hide();
				} else {
					flag = !flag;
					$(this).html('<i class="icon-hideMore"></i>');
					$(".search-unfixed").show();
				}
			});

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
			// 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
			// 导出
			$('#btnExport').click(function () {
				var param = ECS.form.getData("searchForm");
				var urlParam = page.logic.setUrlK(param);

				window.open(exportUrl + "?" + urlParam);
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
			});
			//批量删除
			$('#btnDel').click(function () {
				page.logic.delAll();
			});

			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
			});

			$("#businessBgCategID").change(function(e){
					page.logic.loadmodelType($("#businessBgCategID").val());
			});
			//企业
			$("#enterpriseCode").change(function (e) {
					page.data.param['enterpriseCode'] = ECS.sys.Context.SYS_ENTERPRISE_CODE;
			});

		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			//企业
				enterprise: function (menu_url, oPar) {
					$.ajax({
						url: menu_url + "?orgLvl=1",
						type: "get",
						success: function (data) {
							console.log(data)
							var datalist = [];
							// //若是企业用户，设置为不可用状态；
							if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
								$.each(data, function (i, el) {
									datalist.push({
										id: el["orgCode"],
										text: el["orgSname"]
									});
								});
							} else {
								var newList = JSLINQ(data).Where(function (x) {
									return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE;
								}).ToArray();
								$.each(newList, function (i, el) {
									datalist.push({
										id: el["orgCode"],
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
						},
						error: function (e) {
							//	alert(e);
						}
					})
				},
					getsecordEnterPriseSelects: function (url, ctrlId, key, value, tags) {
						console.log(url);
						$("#" + ctrlId).html('<option value="" selected="selected">可输入</option>');
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
										text: el[value]
									});
								});
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
						})
					},
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
			//返回操作列按钮
			show_editeditAttr: function () {
				return '<a title="编辑" href="javascript:window.page.logic.editAttr()"><i class="icon-edit edit"></i></a>&nbsp&nbsp<a title="删除" href="javascript:window.page.logic.delAttr()"><i class="icon-delete delete"></i></a>';
			},
			editAttr: function () {
				var row = mini.get("datagrid").getSelected();
			   page.logic.edit( row.emrgEquipID);
			},
			delAttr: function () {
				var row = mini.get("datagrid").getSelected();
				var ids = [];
				ids.push(row.emrgEquipID)
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: delUrl + "?emrgequipIds=" + row.emrgEquipID,
						async: true,
						//	data: JSON.stringify(ids),
						dataType: "json",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function (result) {
							if (result.isSuccess) {
								layer.msg('删除成功')
								page.logic.search();
							} else {
								layer.msg('删除失败')
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
			 * 批量删除
			 * */
			delAll: function () {
				var idsArray = new Array();
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					idsArray.push(el.emrgEquipID);
				});
				var a = idsArray.toString(',');
				if (rowsArray.length == 0) {
					layer.msg("请选择要删除的数据!");
					return;
				}
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: delUrl + "?emrgequipIds=" + idsArray.toString(','),
						async: false,

						dataType: "json",
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						success: function (result) {
							if (result.isSuccess) {
								layer.msg('删除成功');
								page.logic.search();
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
			getEnterpriseType :function(){
				$("#equIpOwner").html('<option value="" selected="selected">可输入</option>');
				var datalist = [{"text":"队伍","id":1},{"text":"企业","id":2}];
				$('#equIpOwner').select2({
					tags: false,
					data: datalist,
					language: {
						noResults: function (params) {
							return "没有匹配项";
						}
					},
				});
			},
			loadType: function (enterpriseCode) {
				page.logic.getEnterpriseType();
				console.log(ECS.sys.Context.SYS_ENTERPRISE_CODE)
				ECS.ui.getComboSelects(searchTypeUrl, "planDefinition", "id", "name", false);
				ECS.ui.getComboSelects(smallTypeUrl, "smallIds", "accidentTypeID", "accidentTypeName", false);
				ECS.ui.getComboSelects(dept_url, "drtDeptCode", "drtDeptCode", "drtDeptName", false);//二级单位
				ECS.ui.getComboSelects(bigUrl,"businessBgCategID","businessBgCategCode","businessBgCategName",false);
				ECS.ui.getComboSelects(stockpilePointTypeUrl,"stockpilePointType","key","value",false);
				ECS.ui.getComboSelects(stockpileTypeUrl,"stockpileType","key","value",false);
				ECS.ui.getComboSelects('',"businessMdCategID","businessMdCategCode","businessMdCategName",false);
				ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: "-1",
                    data: {
                        'isAll': true
                    }
                }, null);
			},
			loadmodelType :function(value){
				ECS.ui.getComboSelects(mUrl+"?businessBgCategCode="+value,"businessMdCategID","businessMdCategCode","businessMdCategName",false);
			},
            /**
             * 初始化表格
             */
			initTable: function () {
				page.logic.search();
			},
            /**
             * 搜索
             */
			search: function (showSort) {
				page.data.param = ECS.form.getData("searchForm");
				grid = mini.get("datagrid");
				console.log($("#enterpriseCode"));
				// console.log($("#enterpriseCode").find("option:selected").val());
				page.data.param['enterpriseCode'] = ECS.sys.Context.SYS_ENTERPRISE_CODE;
				console.log(ECS.sys.Context.SYS_ENTERPRISE_CODE);
				grid.set({
					url: searchUrl,
					ajaxType: "get",
					dataField: "pageList"
				});
				grid.load(page.data.param);
		
			},

		
			/**
		 * 新增
		 */
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "应急装备新增";

				page.logic.detail(title, "",  pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function (emrgEquipID) {
				var pageMode = PageModelEnum.Edit;
				var title = "应急装备编辑";
				page.logic.detail(title, emrgEquipID, pageMode);
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, emrgEquipID, pageMode) {
			
				var gridList = grid.getSelected();

				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '90%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'AddOrEdit.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title

						};
						if (pageMode == PageModelEnum.Edit) {

						}
						iframeWin.page.logic.setData(data, gridList);
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
			/**
			 * 关闭弹出层
			 */
			closeLayer: function (isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
			imp: function () {
                var impUrl = ECS.api.rttUrl +'/emergencyEquipment/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/emergencyEquipment/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/emergencyEquipment/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }

		}
	};
	page.init();
	window.page = page;
});