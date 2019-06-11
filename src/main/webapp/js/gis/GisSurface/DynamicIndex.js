//var delUrl = ECS.api.bcUrl + '/systemRegistersisPoint';
var searchUrl = ECS.api.gisSurfaceUrl + '/surface';

var gisId = -1;
var typeCode = 0;
var state = 0; //0:不可编辑;1:可编辑
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = ""; //企业节点编码；
$(function () {
	var page = {
		//页面初始化
		init: function () {
			mini.parse();
			//this.bindUI();
			//初始化查询是否启用
			//page.logic.initGisType();
			var strfun = page.logic.getQueryString("url");
			//获取用户的相关数据
			ECS.sys.RefreshContextFromSYS();
			enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
			// enterpriseCode = "20000000";
			if (strfun != null) {
				eval(strfun);
			} else {
				document.oncontextmenu = new Function("return false"); //禁止鼠标右键
				//键盘锁屏不好使，先留着吧
				/*                $(document).keydown(function (e) {
				                    if (e.keyCode == 9 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
				                        e.keyCode=0;
				                        e.returnValue=false;
				                        document.body.focus();
				                        return false;
				                    }
				                });*/

			}
			/*            else {
			                page.logic.initTable();
			                page.logic.initTable2(gisId);
			                page.logic.search();
			                $("#datagrid").show();
			                $("#datagrid2").hide();

			                if (state == 0) {
			                    $("#isSelect").prop("disabled", true);
			                }
			                else {
			                    $("#isSelect").prop("disabled", false);
			                }
			            }*/
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {//切换中调用方法
			$("#searchForm")[0].reset();
			//搜索栏中input不允许输入空格
			$('input').keyup(function () {
				$(this).val($.trim($(this).val()))
			});
			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
			});
			grid = mini.get("datagrid");
			grid2 = mini.get("datagrid2");
			//添加
			grid.on("select", function (e) {
				page.logic.adds(); //grid选中数据 grid2添加选中
				var row = e.record;
				var data = grid2.getData();
				var querResult = JSLINQ(data).Where(function (x) {
					return x.gisSurfaceForID != row.gisSurfaceForID;
				}).ToArray();
				if (querResult.length > 0) {
					grid2.removeRows(querResult, true);
				}
			});
			grid2.on("rowclick", function (e) {
				var row = e.record;
				if (state == 0) //0:不可编辑;1:可编辑
				{
					var arrGisSurfaceIds = row.arrGisSurfaceIds;
					if (arrGisSurfaceIds != null) {
						//向父窗口传值gis面数组，用于反向映射
						var strGisSurfaceIds = arrGisSurfaceIds.join(',');
						var url = "getArrGisSurfaceIds('" + arrGisSurfaceIds + "')";
						window.parent.postMessage(url, '*');
					}
				}
			});
			$('#isSelect').click(function () {
				//alert("isSelect");
				var ischecked = $(this).prop("checked");
				$("#btnQuery").off();
				if (ischecked) {
					$("#datagrid").hide();
					$("#datagrid2").show();
					if (state == 1) {
						$("#btnQuery").attr("disabled", true);
					} else {
						$("#btnQuery").attr("disabled", false);
						$("#btnQuery").click(page.logic.search);

					}
					page.logic.setGrid2Selecteds();
					page.logic.setGrid2Height();
				} else {
					$("#datagrid").show();
					$("#datagrid2").hide();
					$("#btnQuery").attr("disabled", false);
					$("#btnQuery").click(page.logic.search);
					page.logic.setGridSelecteds();
					page.logic.setGridHeight();
				}

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
				grid.set({
					url: searchUrl,
					ajaxType: "get",
					dataField: "pageList"
				});

			},
			/**
			 * 初始化表格2
			 */
			initTable2: function (gisSurfaceId) {
				mini.parse();
				grid2 = mini.get("datagrid2");
				var grid2Url = page.logic.getDatagrid2RUL(gisSurfaceId);
				grid2.set({
					url: grid2Url,
					ajaxType: "get",
					dataField: "pageList"
				});
			},
			/**
			 * 搜索
			 */
			search: function () {
				grid = mini.get("datagrid");
				grid2 = mini.get("datagrid2");
				page.data.param = ECS.form.getData("searchForm");
				//grid2.load(page.data.param);
				page.data.param["enterprise"] = enterpriseCode;
				grid2.load(page.data.param, function (data) {
					if (state == 0) {
						grid2.clearSelect(true);
					}
				});
				page.data.param["type"] = typeCode;
				grid.load(page.data.param, function (data) {
					if (state == 1) {
						page.logic.setGridSelecteds();
					}
				});
			},
			/*
			 * 获取datagrid2的RUL
			 * */
			getDatagrid2RUL: function (gisSurfaceId) {
				var datagrid2URL;
				switch (typeCode) {
					case 2:
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/org/" + 2;
						break;
					case 3:
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/org/" + 3;
						break;
					case 4:
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/riskarea";
						break;
					case 5:
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/optlriskarea";
						break;
					case 15:
						// datagrid2URL = searchUrl + "/" + gisSurfaceId + "/optlriskarea";
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/medicalAddress";
						break;
					default:
						datagrid2URL = searchUrl + "/" + gisSurfaceId + "/org/" + 0;
						break;
				}
				return datagrid2URL;
			},
			/**
			 * grid2添加方法
			 */
			adds: function () {
				var ischecked = $("#isSelect").prop("checked");
				if (!ischecked) {
					grid = mini.get("datagrid");
					var items = grid.getSelecteds();
					page.logic.doAddItems(items);
				}

			},
			doAddItems: function (items) {
				items = mini.clone(items);
				//根据id判断，去除重复的item
				for (var i = items.length - 1; i >= 0; i--) {
					var item = items[i];
					var item2 = grid2.findRow(function (row) {
						if (row.gisSurfaceForID == item.gisSurfaceForID) return true;
					});
					if (item2) {
						items.removeAt(i);
					}
				}

				grid2.addRows(items);
				grid2.selects(items);
			},
			/*
			 * 获取datagrid2的RUL
			 * */
			getSave2RUL: function (gisSurfaceId, typeValueCode) {
				var save2URL;
				if (typeValueCode != 0 && typeValueCode != null) {
					switch (typeValueCode) {
						case 2:
							save2URL = searchUrl + "/" + gisSurfaceId + "/org/" + 2 + "?enterprise=" + enterpriseCode;
							break;
						case 3:
							save2URL = searchUrl + "/" + gisSurfaceId + "/org/" + 3 + "?enterprise=" + enterpriseCode;
							break;
						case 4:
							save2URL = searchUrl + "/" + gisSurfaceId + "/riskarea?enterprise=" + enterpriseCode;
							break;
						case 5:
							save2URL = searchUrl + "/" + gisSurfaceId + "/optlriskarea?enterprise=" + enterpriseCode;
							break;
						case 15:
							save2URL = searchUrl + "/" + gisSurfaceId + "/medicalAddress?enterprise=" + enterpriseCode;
							break;

					}
				}
				return save2URL;
			},
			/*
			 * 获取删除的RUL
			 * */
			getDeleteRUL: function (gisSurfaceId, typeValueCode) {
				var save2URL;
				if (typeValueCode != 0 && typeValueCode != null) {
					switch (typeValueCode) {
						case 2:
							save2URL = searchUrl + "/" + gisSurfaceId + "/org";
							break;
						case 3:
							save2URL = searchUrl + "/" + gisSurfaceId + "/org";
							break;
						case 4:
							save2URL = searchUrl + "/" + gisSurfaceId + "/riskarea";
							break;
						case 5:
							save2URL = searchUrl + "/" + gisSurfaceId + "/optlriskarea";
							break;
						case 15:
							save2URL = searchUrl + "/" + gisSurfaceId + "/medicalAddress";
							break;

					}
				}
				return save2URL;
			},
			/*
			 * grid 选中
			 * */
			setGridSelecteds: function () {
				grid = mini.get("datagrid");
				grid2 = mini.get("datagrid2");
				var data = grid2.getData();
				var ischecked = $('#isSelect').prop("checked");
				if (!ischecked) {
					var rows = grid.findRows(function (row) {
						var querResult = JSLINQ(data).Where(function (x) {
							return x.gisSurfaceForID == row.gisSurfaceForID;
						}).ToArray();
						if (querResult.length > 0) {
							return true;
						} else {
							return false;
						}

					});
					grid.selects(rows);
				}
			},
			/*
			 * grid2默认全部选中
			 * */
			setGrid2Selecteds: function () {
				//grid = mini.get("datagrid");
				grid2 = mini.get("datagrid2");
				var data = grid2.getData();
				var rows = grid2.findRows(function (row) {
					var querResult = JSLINQ(data).Where(function (x) {
						return x.gisSurfaceForID == row.gisSurfaceForID;
					}).ToArray();
					if (row.surfaceID == gisId || querResult.length > 0) return true;
					else return false
				});
				grid2.selects(rows);
			},
			/*
			 * grid的高度控制
			 * */
			setGridHeight: function () {
				grid = mini.get("datagrid");
				var searchHeight = document.getElementById("searchForm").offsetHeight;
				var winHeight = document.documentElement.clientHeight;
				grid.setHeight(winHeight - searchHeight - 30); //包含工具栏

			},
			/*
			 * grid2的高度控制
			 * */
			setGrid2Height: function () {
				grid2 = mini.get("datagrid2");
				var searchHeight = document.getElementById("searchForm").offsetHeight;
				var winHeight = document.documentElement.clientHeight;
				grid2.setHeight(winHeight - searchHeight - 30); //包含工具栏

			},
			/*
			 * 点击类型类型加载
			 * */
			typeClickLoad: function (typeCodeValue, stateValue) {//切换调用方法
				mini.parse();
				typeCode = typeCodeValue;
				state = stateValue;
				gisId = -1;
				selectIndex = 0;
				grid = mini.get("datagrid");
				grid2 = mini.get("datagrid2");
				grid2.commitEdit();
				if (typeCode != 0) {
					//page.bindUI();
					page.bindUI();
					$("#datagrid").hide();
					$("#datagrid2").show();
					page.logic.initTable();
					page.logic.initTable2(gisId);
					page.logic.search();
					$("#isSelect").prop("checked", true);
					grid.clearSelect(true); //清空列表
					grid2.clearSelect(true); //清空列表
					page.logic.setGrid2Height();
				}
				if (state == 0) {
					$("#isSelect").prop("disabled", true);
					grid2.allowCellEdit = false;
				} else {
					$("#isSelect").prop("disabled", false);
					grid2.allowCellEdit = true;
				}
			},
			/*
			 * 点击GIS面加载
			 * */
			gisSurfaceClickLoad: function (typeCodeValue, gisValueId, stateValue) {
				typeCode = typeCodeValue;
				gisId = gisValueId;
				state = stateValue;
				selectIndex = 0;
				grid = mini.get("datagrid");
				grid2 = mini.get("datagrid2");
				grid2.commitEdit();
				if (typeCode != 0 && gisId != 0) {
					$("#datagrid").hide();
					$("#datagrid2").show();
					$("#isSelect").attr("checked", 'checked');
					grid.clearSelect(true);
					grid2.selectAll(false);
					page.logic.initTable();
					page.logic.initTable2(gisId);
					page.logic.search();
					//page.logic.setGrid2Selecteds();
					page.logic.setGrid2Height();
				}
				$("#btnQuery").off();
				if (state == 0) {
					$("#isSelect").prop("disabled", true);
					$("#btnQuery").attr("disabled", false);
					$("#btnQuery").click(page.logic.search);
					grid2.allowCellEdit = false;
				} else {
					$("#isSelect").prop("disabled", false);
					$("#btnQuery").attr("disabled", true);
					grid2.allowCellEdit = true;
				}
			},
			/*
			 * 删除
			 * */
			deletes: function (typeCodeValue, gisValueId) {
				typeCode = typeCodeValue;
				gisId = gisValueId;
				if (typeCode != 0 && gisId != 0) {
					var deleteUrl = page.logic.getSave2RUL(gisId, typeCode);
					$.ajax({
						url: deleteUrl,
						async: true,
						//data: JSON.stringify(idsArray),
						dataType: "text",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'DELETE',
						beforeSend: function () {
							ECS.showLoading();
						},
						success: function (result) {
							ECS.hideLoading();
							if (result.indexOf('删除成功') > -1) {
								/*layer.msg("删除成功！", {
								    time: 1000
								}, function () {
								    grid.reload({pageIndex:0});
								});*/
								//page.logic.initTable2(gisId);
								gisId = -1;
								return true;
							} else {
								/*result = JSON.parse(result)
								layer.msg(result.collection.error.message)*/
								return false;
							}

						},
						error: function (result) {
							ECS.hideLoading();
							/*var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);*/
							return false;
						}
					});

				} else {
					layer.msg("请选择要删除的gis面数据!");
					return false;
				}
			},
			/**
			 * 保存
			 */
			save: function (typeCodeValue, gisValueId) {
				grid2 = mini.get("datagrid2");
				grid2.commitEdit();
				typeCode = typeCodeValue;
				gisId = gisValueId;
				var data = grid2.getSelecteds(); //getData();
				if(data.length != 0 ){
					if (!$("#isSelect").attr("checked")) {
						layer.msg('您未选择“已勾选”，请先勾选！', {
							time: 1000
						});
						//向父窗口传值-1,表示当前未勾选，不退出保存状态；
						var url = "isSave(-1,'" + data[0].name + "')";
						console.log(url)
						window.parent.postMessage(url, '*');
						return false;
					} else {
						//向父窗口传值-1,表示当前不愿退出保存状态；
						var url = "isSave(1,'" + data[0].name + "')";
						console.log(url)

						window.parent.postMessage(url, '*');
					}
				}else{
					layer.msg('保存失败，请选择关联数据！');
					return false;
				}

				

				grid2.commitEdit();
				if (typeCode > 0 && gisId > 0) {
					var jsonArr = [];
					if (typeCode == "2") {
						for (var i = 0; i < data.length; i++) {
							var json = {};
							json.surfaceID = gisId;
							json.gisSurfaceForID = data[i].gisSurfaceForID;
							json.orgLvl = 2;
							json.info = data[i].inf4o;
							jsonArr.push(json);
						}

					} else if (typeCode == "3") {
						for (var i = 0; i < data.length; i++) {
							var json = {};
							json.surfaceID = gisId;
							json.gisSurfaceForID = data[i].gisSurfaceForID;
							json.orgLvl = 3;
							json.info = data[i].info;
							jsonArr.push(json);
						}
					} else {
						for (var i = 0; i < data.length; i++) {
							var json = {};
							json.surfaceID = gisId;
							json.gisSurfaceForID = data[i].gisSurfaceForID;
							json.orgLvl = 0;
							json.info = data[i].info;
							jsonArr.push(json);
						}

					}

					var addUrl = page.logic.getSave2RUL(gisId, typeCode);
					//处理提交类型
					var ajaxType = "POST";
					$.ajax({
						url: addUrl,
						//async: false,
						type: ajaxType,
						data: JSON.stringify(jsonArr),
						dataType: "text",
						contentType: "application/json;charset=utf-8",
						beforeSend: function () {
							//$('#btnSave').attr('disabled', 'disabled');
							ECS.showLoading();
						},
						success: function (result) {
							ECS.hideLoading();
							if (result.indexOf('保存成功') > -1) {
								/*layer.msg("保存成功！",{
								    time: 1000
								});*/
								//page.logic.initTable2(gisId);
								gisId = -1;
								return true;
							} else {
								//layer.msg(result.collection.error.message)
								return false;
							}

						},
						error: function (result) {
							//$('#btnSave').attr('disabled', false);
							ECS.hideLoading();
							/*var errorResult = $.parseJSON(result.responseText);
							layer.msg(errorResult.collection.error.message);*/
							return false;
						}
					})
				} else {
					return false;
				}
			},
			getQueryString: function (name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
				var r = window.location.search.substr(1).match(reg);
				if (r != null) return unescape(r[2]);
				return null;
			}
			/**
			 * 初始化查询
			 */
			/*            initGisType: function () {
			                var gisTypeData = [{ key: 1, value: '企业' }, { key: 2, value: '二级单位'},{ key: 3, value: '安全风险区' }, { key: 4, value: '作业风险区'}];

			                var str = '';
			                $.each(gisTypeData, function (t,val) {
			                    str += '<option value="' +val.key + '">' + val.value + '</option>';
			                });
			                $('#type').html(str);

			            },*/
		}
	};
	page.init();
	window.page = page;
});
			// $('#btnEn').click(function () {
			// 	page.logic.typeClickLoad(15, 0);
			// })