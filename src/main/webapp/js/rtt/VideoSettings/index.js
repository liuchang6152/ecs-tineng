var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true';  //企业
var searchTypeUrl = ECS.api.apUrl + '/event/getconfimPlanDefinition'; //预案类型
var smallTypeUrl = ECS.api.apUrl + '/event/getAccidentCategory'; //事故小类
var searchUrl = ECS.api.rttUrl + '/videoSurveullance'; //查询、列表初始化
var exportUrl = ECS.api.rttUrl + '/emergencyEquipment/ExportToExcel';   //导出
var dept_url = ECS.api.apUrl + '/event/getSecunit';         //企业、二级单位
var riskType_url = ECS.api.apUrl + '/event/getRiskArea';  //安全风险区类型
var OptRisk_url = ECS.api.apUrl + '/event/getOptRisk';  //作业风险区类型
var RiskAnlsObj_url = ECS.api.apUrl + '/event/getRiskAnlsObj';  //安全风险区类型
var delUrl = ECS.api.rttUrl + '/videoSurveullance/deleteVideoDeploy'; //删除
var Enterprise_url = ECS.api.rttUrl +'/expert/getExpertTypeEnumList';                //企业内/外

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
			page.logic.enterprise(riskorg_url, "enterpriseCode"); //企业名称
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
				console.log($('#drtDeptCode').val())
				if ($('#drtDeptCode').val() != null && $('#drtDeptCode').val() != '') {
					page.logic.add();
				}else{
					layer.msg('请选择二级单位');
					return;
				}
				
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

			$("#enterpriseCode").change(function(){
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
				var secordUrl  = riskorg_url+"?isAll=false&orgPID="+enterprise+"&orgLvl=3";
				page.logic.getsecordEnterPriseSelects(secordUrl, "drtDeptCode",'orgCode','orgSname',false); //树形菜
				
              
			},
			enterprise: function (menu_url, oPar) {
				$.ajax({
					url: menu_url+"?orgLvl=1",
					type: "get",
					success: function (data) {
						var datalist = [];
					 // //若是企业用户，设置为不可用状态；
					 if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) 
					 {
						$.each(data, function (i, el) {
							datalist.push({ id: el["orgId"], text: el["orgSname"] });
						});
					 }else{
						var newList = JSLINQ(data).Where(function (x) { return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE ; }).ToArray();
						$.each(newList, function (i, el) {
							datalist.push({ id: el["orgId"], text: el["orgSname"]});
						});
						var secordUrl  = menu_url+"?isAll=false&orgPID="+newList[0].orgId+"&orgLvl=3";
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

			getsecordEnterPriseSelects : function (url, ctrlId, key, value, tags) {
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
							datalist.push({ id: el[key], text: el[value] });
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
			//返回编辑按钮
			show_editeditAttr: function () {
				return '<a title="编辑" href="javascript:window.page.logic.editAttr()"><i class="icon-edit edit"></i></a>';
			},
			editAttr: function () {
				var row = mini.get("datagrid").getSelected();
			   page.logic.edit(row.survVideoId);
			},
			delAttr: function () {
				var row = mini.get("datagrid").getSelected();
				var ids = [];
				ids.push(row.survVideoId)
				layer.confirm('确定删除吗？', {
					btn: ['确定', '取消']
				}, function () {
					$.ajax({
						url: delUrl + "?survVideoId=" + row.survVideoId,
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

				var idsArray = [];
				var rowsArray = grid.getSelecteds();
				$.each(rowsArray, function (i, el) {
					idsArray.push(el.survVideoId);
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
						url: delUrl,
						async: false,
						dataType: "json",
						data: JSON.stringify(idsArray),
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
				$("#drtDeptCode").html('<option value="" selected="selected">可输入</option>');
				var datalist = [{"text":"队伍","id":1},{"text":"企业","id":2}];
				$('#drtDeptCode').select2({
					tags: false,
					data: datalist,
					language: {
						noResults: function (params) {
							return "没有匹配项";
						}
					},
				});
			
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
			 *
             */
			search: function (showSort) {
				page.data.param = ECS.form.getData("searchForm");
				grid = mini.get("datagrid");
				grid.set({
					url: searchUrl,
					ajaxType: "get",
					dataField: "pageList"
				});
				console.log(page.data.param)
				if(page.data.param.drtDeptCode == '全部'){
					page.data.param.drtDeptCode = '';
				}
				grid.load(page.data.param);
		
			},

		
			/**
		 * 新增
		 */
			add: function () {
				var pageMode = PageModelEnum.NewAdd;
				var title = "新增视频配置";

				page.logic.detail(title, "",  pageMode);
			},
			/**
			 * 编辑
			 * @param commGroupTypeId
			 */
			edit: function (emrgEquipID) {
				var pageMode = PageModelEnum.Edit;
				var title = "编辑视频配置";
				page.logic.detail(title, emrgEquipID, pageMode);
			},
			/**
			 * 新增或者编辑详细页面
			 */
			detail: function (title, emrgEquipID, pageMode) {
				var treeID
				var gridList = grid.getSelected();
				var nsCode = $('#enterpriseCode').val();
				if ($('drtDeptCode').val()){
					treeID =$('drtDeptCode').val();
				};
				
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '80%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'AddOrEdit.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": pageMode,
							'title': title,
							'riskAreaCode': nsCode,
							'treeID': treeID,
							'id': emrgEquipID,
							'orgCode': $('#drtDeptCode').val()
						};
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
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['80%', '60%'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: 'UploadFile.html?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"pageMode": PageModelEnum.NewAdd,
							'title': '导入'

						};

						iframeWin.page.logic.setData(data);
					},
					end: function () {
						page.logic.search();
					}
				})
			}

		}
	};
	page.init();
	window.page = page;
}); 