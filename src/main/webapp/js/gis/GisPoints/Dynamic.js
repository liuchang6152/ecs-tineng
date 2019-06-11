//2018.11.28: 补充新增表4，gis点动态数据的初始化展示，且不可操作； by yuanshuang;
var searchUrl = ECS.api.rttUrl + '/videoSurveullance/getVideoAdressInfoPage'; //接口
var gisId = -1; //gis点的id保存；
var state = 0; //0:不可编辑;1:可编辑
var grid = null; //表1对象；（gis点动态的，非勾选时的表）
var grid2 = null; //表2对象；（gis点动态的，勾选时的表）
// var grid3 = null;  //表3对象； （gis点静态的表）
var isTriggerEdit = false; //若为true,表示进入编辑状态；若为false，表示退出编辑状态；
var tabs = null; //tabs切换对象；
mini_debugger = false; //取消调试
window.pageLoadMode = PageLoadMode.None;
$(function () {
	var page = {
		//页面初始化
		init: function () {
			ECS.sys.RefreshContextFromSYS(); //获取用户的相关数据；
			mini.parse();
			grid = mini.get("datagrid"); //gis点的动态表1：展示所有业务数据；
			grid2 = mini.get("datagrid2"); //gis点的动态表2：选中的结果集合；
			grid4 = mini.get("datagrid4"); //gis点的动态表3：展示所有点的关联的动态数据；
			// grid3 = mini.get("datagrid3");     //gis点的静态主表：展示所有点的关联的静态数据 或者 所有的静态数据 或者某个点的所有静态数据；
			// tabs = mini.get("tabs");            //初始化tab对象；
			this.bindUI(); //绑定事件
			//初始化状态加载所有点关联的所有数据；
			page.logic.check_point(-1);
			//解决父级窗口，右键点击问题；
			document.oncontextmenu = new Function("return false");
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
			$("#searchForm")[0].reset();
			//搜索栏中input不允许输入空格
			$('input').keydown(function(e) {
				if (e.keyCode == 32) {
					return false;
				}
			});
			//tab切换,动态加载数据；
			// tabs.on("activechanged", function (e) {
			//     if (e.tab.title == "静态数据") {
			//         if(gisId>0){
			//             page.logic.static_list(gisId);
			//         }else{
			//             page.logic.static_list(-1);
			//         }
			//         e.cancel = true;
			//     }
			// });
			// gis点动态：查询
			$('#btnQuery').click(function () {
				var cur_gisId = gisId ? gisId : -1;
				page.logic.check_dymic_dt(function () {
					//若已勾选
					if ($("#isSelect").attr('checked') == 'checked') {
						if (cur_gisId > 0) {
							grid2.selects(page.data.aSelected_dt); //表2的展示；
						}
					} else {
						//若未勾选
						grid.selects(page.data.aSelected_dt); //表1的展示
					}
				});
			});
			//gis点动态数据：点击“已勾选”的复选框
			$('#isSelect').click(function () {
				var ischecked = $(this).prop("checked");
				if (ischecked) {
					//若已勾选
					$("#datagrid").hide(); //隐藏表1；
					$("#datagrid2").show(); //显示表2；
					grid2.clearRows(); //清除所有行；
					// "pageSize": 10,
					// "totalPage": 0,
					// "pageNumber": 0,
					// "pageIndex": 0,
					grid2.addRows(page.data.aSelected_dt); //将选中的行添加进来；
					grid2.selectAll(); //选中第一行；
				} else {
					//若未勾选
					page.logic.get_check(gisId, function () {
						grid.selects(page.data.aSelected_dt);
					});
					grid.select();
				}
			});
			//gis点的静态数据：查询
			$('#btnQuery2').click(function () {
				page.logic.static_list();
			});
			//gis点的动态数据 表1：当分页跨页的时候，表格加载成功以后，进行监听；
			grid.on("load", function (e) {
				//若是在编辑状态下
				console.log(e)
				// if(isTriggerEdit){
				//     //当翻页以后，对当前的数据进行选中操作；
				//     grid.selects(page.data.aSelected_dt);
				// }
			});
			//gis点的动态数据 表1：当表头点击时，进行判断
			grid.on("headercellmousedown", function (e) {
				console.log("列对象：", e.column);
				console.log("表格对象：", e.sender);
			});
			//gis点的动态数据 表4：当分页跨页的时候，表格加载成功以后，进行监听；
			grid4.on("load", function () {
				// grid4.selectAll();//取消默认选中第一行
			});
			//gis点的动态数据：表格1，勾选框，筛选，不可勾选；
			// grid.on("selectionchanged",function(e){
			//     //若没有变化的行数，不再往下执行
			//     console.log(e)
			//     if(e.records.length==0){
			//         return false;
			//     }
			//     if(isTriggerEdit){
			//         //若是在编辑状态下
			//             //点击某一行时，判断当前这一行，是否可操作；
			//             var oCur_tr = e.records[0];
			//             if(oCur_tr.status=='未绑定'){
			//                 var check_button = false;
			//                 //当前这一行，又存在于所有点关联的数据；
			//                 // for(var a=0;a<page.data.aDymic_init_dt.length;a++){
			//                 //     if(oCur_tr.gisPointForID==page.data.aDymic_init_dt[a].gisPointForID){
			//                 //         check_button = true;
			//                 //         break;
			//                 //     }
			//                 // }
			//                 page.data.aDymic_init_dt.push(oCur_tr);
			//                 if(check_button==false){
			//                     //取消选中，剔除其相应的缓存
			//                     grid.deselect(oCur_tr);
			//                     page.logic.save_selected(oCur_tr,false);
			//                 }
			//                 check_button = null;   //释放存储的变量
			//             }

			//     }else{
			//         //若是退出编辑状态下
			//         //剔除掉所有不可勾选的；
			//         for(var w=0;w<e.records.length;w++){
			//             grid.deselect(e.records[w]);
			//             //取消选中，剔除其相应的缓存
			//             page.logic.save_selected(e.records[w],false);
			//         }
			//     }
			// });
			//gis点的动态数据：表1.当点击“全选”的时候，将其保存；
			$("#mini-4checkall").parents("td").on("click", function () {
				// if(!$("#mini-4checkall").is(":visible")){
				//     return false;
				// }
				if (isTriggerEdit) {
					//若是进入编辑状态；
					// （此处放置定时器，是为了解决“已勾选”选择以后，莫名其妙触发此事件的bug，胡乱删缓存的情况。）
					setTimeout(function () {
						if ($("#datagrid").is(":hidden")) {
							return false;
						}
						var aForm_dt = grid.getData(); //获取所有的数据
						for (var w = 0; w < aForm_dt.length; w++) {
							if (grid.isSelected(aForm_dt[w])) {
								//选中，进行缓存；
								page.logic.save_selected(aForm_dt[w], true);
							} else {
								//剔除缓存
								page.logic.save_selected(aForm_dt[w], false);
							}
						}
					}, 100);
				} else {
					//若是退出编辑状态；
					// grid.deselectAll(); 暂时注释
				}
			});
			//gis点的动态数据：表2，当点击全选的时候进行保存；
			$("#mini-17checkall").parents("td").on("click", function () {
				if (isTriggerEdit) {
					//若是进入编辑状态；
					// （此处放置定时器，是为了解决“已勾选”选择以后，莫名其妙触发此事件的bug，胡乱删缓存的情况。）
					setTimeout(function () {
						if ($("#datagrid2").is(":hidden")) {
							return false;
						}
						var aForm_dt = grid2.getData(); //获取表2静态数据集合----所有的数据
						for (var w = 0; w < aForm_dt.length; w++) {
							if (grid2.isSelected(aForm_dt[w])) {
								//选中，进行缓存；
								page.logic.save_selected(aForm_dt[w], true);
							} else {
								//剔除缓存
								page.logic.save_selected(aForm_dt[w], false);
							}
						}
					}, 100);
				}
			});
			//gis点的动态数据：表1，勾选的时候，进行缓存；
			grid.on("cellclick", function (e) {
				console.log(e)
				if (isTriggerEdit) {
					//只有进入编辑状态，才可操作；
					if (grid.isSelected(e.record)) {
						//选中，进行缓存；
						page.logic.save_selected(e.record, true);
					} else {
						//取消选中，剔除其相应的缓存
						page.logic.save_selected(e.record, false);
					}
				}
				grid.select(e.record);
			});
			//gis点动态数据：表格1单元格绘制
			grid.on("drawcell", function (e) { //ns
				page.logic.ondrawcell(e);
			});
			//gis点动态数据：表2，勾选的时候，进行缓存；
			grid2.on("rowclick", function (e) {
				//进入编辑状态下，才可进行选中缓存操作；
				if (isTriggerEdit) {
					if (grid2.isSelected(e.record)) {
						//选中，进行缓存；
						page.logic.save_selected(e.record, true);
					} else {
						//取消选中，剔除其相应的缓存
						page.logic.save_selected(e.record, false);
					}
				}
			});
			//gis点动态数据：表4，点击某一行，是否返回给父窗口响应的gis点id;
			grid4.on("rowclick", function (e) {
				//点默认初始化，动态数据的某个单条数据，返回给父窗口相应的gis点id;
				console.log(isTriggerEdit)
				if (!isTriggerEdit && gisId < 0) {
					var url = "GetGisId(" + e.record.gisId + ")";
					window.parent.postMessage(url, '*');
				}
			});
			//gis点静态数据：表3，点击某一行，是否返回给父窗口响应的gis点id;
			// grid3.on("rowclick",function(e){
			//     //点默认初始化，动态数据的某个单条数据，返回给父窗口相应的gis点id;
			//     if(!isTriggerEdit && gisId<0){
			//         var url = "GetGisId("+e.record.gisId+")";
			//         window.parent.postMessage(url, '*');
			//     }
			// });


			// $('#btnSave').click(function () { //保存
			// 	page.logic.save(63);
			// });
			// $('#btnDelete').click(function () { //删除
			// 	page.logic.deletes(63);
			// });
			// $('#btnGive').click(function () { //放弃
			// 	page.logic.give_up();
			// });
			// $('#btnEdit').click(function () { //进入编辑
			// 	page.logic.IntoEdit(1, 63);
			// });
			// $('#btnEd').click(function () { //点击gis点
			// 	page.logic.check_point(63);
			// });

		},
		data: {
			param: {},
			aStatic_list: [{
				id: 1,
				text: '消防栓'
			}, {
				id: 2,
				text: '消防站'
			}, {
				id: 3,
				text: '消防炮'
			}, {
				id: 4,
				text: '门口/出入口'
			}, {
				id: 5,
				text: '应急队伍点'
			}, {
				id: 6,
				text: '物资存放点'
			}],
			aType_list: {
				"1": "消防栓",
				"2": "消防站",
				"3": "消防炮",
				"4": "门口/出入口",
				"5": "应急队伍点",
				"6": "物资存放点"
			},
			aSelected_dt: [], //保存不同类型的存储的数据；
			aStatic_dt: [],
			aDymic_type: {
				"1": "实时监测点",
				"2": "应急物资存放点",
				"3": "应急队伍点",
				"4": "应急装备存放点"
			}, //gis点的动态类型数据；
			aDymic_init_dt: [] //初始化，所有gis点关联的数据
		},
		//定义业务逻辑方法
		logic: {
			//点的名称的渲染
			show_name: function (e) {
				return e.row.name;
				//return e.row.name+"---"+e.row.isDisabled;
			},
			//表格绘制
			ondrawcell: function (e) {
				var row = e.record,
					field = e.field,
					cellCls = e.cellCls,
					cellHtml = e.cellHtml;
				if (isTriggerEdit) {
					// 若进入编辑状态；
					if (row.isDisabled == "1" && cellCls == "mini-checkcolumn") {
						var check_button = false;
						//当前这一行，不存在于当前点已关联的集合中；
						for (var w = 0; w < page.data.aDymic_init_dt.length; w++) {
							if (row.gisPointForID == page.data.aDymic_init_dt[w].gisPointForID) {
								check_button = true;
								break;
							}
						}
						if (check_button == false) {
							e.cellHtml = "<span class=\"mini-grid-checkbox checkbox-enabled mini-icon\"></span>";
							//若列头的复选框没有头添加不可用的样式，那么添加上,同时隐藏复选框；
							if (!$("#mini-4checkall").hasClass("checkbox-enabled")) {
								$("#mini-4checkall").addClass("checkbox-enabled");
								$("#mini-4checkall").parents(".mini-grid-headerCell-outer").remove();
							}
						}
						check_button = null;
					}
				} else {
					//若未进入编辑状态；
					if (cellCls == "mini-checkcolumn") {
						e.cellHtml = "<span class=\"mini-grid-checkbox checkbox-enabled mini-icon\"></span>";
					}
				}
			},
			//总复选框“是否可用”样式
			ondrawcell_head: function () {
				if (isTriggerEdit) {
					// 若进入编辑状态；
					$("#mini-4checkall").removeClass("checkbox-enabled");
				} else {
					//若未进入编辑状态；
					$("#mini-4checkall").addClass("checkbox-enabled");
				}
			},
			/*
			 * grid的高度控制
			 */
			setGridHeight: function () {
				var searchHeight = document.getElementById("searchForm").offsetHeight;
				var winHeight = document.documentElement.clientHeight;
				grid4.setHeight(winHeight - searchHeight - 60); //动态数据：初始化的表高度设置；（所有点关联的所有数据；）
				grid.setHeight(winHeight - searchHeight - 60); //动态数据：展示表1的高度（展示所有业务数据的那张表）
				grid2.setHeight(winHeight - searchHeight - 60); //动态数据：展示表2的高度（选中的集合；或者 某个gis点关联的所有数据；）
				//静态数据表高度设置；
				// var searchHeight2 = document.getElementById("searchForm2").offsetHeight;
				// grid3.setHeight(winHeight - searchHeight2-60);
			},
			//静态数据：获取GIS点的点类型；
			get_static_type: function (cb) {
				$.ajax({
					url: ECS.api.gisPoint + "/static/type",
					type: 'GET',
					success: function (dt) {
						$("#type2").html(""); //清空列表
						//添加“全部”一项
						var oPtion_first = $('<option value="">全部</option>');
						$("#type2").append(oPtion_first);
						//添加“其它”项
						for (var w = 0; w < dt.length; w++) {
							if (dt[w].key) {
								var oPtion = $('<option value="' + dt[w].key + '">' + dt[w].value + '</option>');
								$("#type2").append(oPtion);
							}
						}
						page.data.aStatic_dt = dt; //存储gis点的点类型；
						cb && cb();
					}
				});
			},
			//GIS点的静态数据的加载
			static_list: function (GisId) {
				//设置参数 点类型  名称
				page.data.param = {};
				// page.data.param["type"] = $("#type2").val();  //gis点类型
				page.data.param["name"] = $("#name2").val(); //名称
				page.data.param['enterprise'] = ECS.sys.Context.SYS_ENTERPRISE_CODE; //企业编码；

				//存储gis点的id
				if (GisId) {
					gisId = GisId;
				}
				//grid3设置url参数
				// grid3.set({
				//     ajaxType:"get",
				//     url:ECS.api.gisPoint+"/"+(gisId?gisId:"-1")+"/static"
				// });
				//加载数据
				// grid3.load(page.data.param,function(){
				//     //若是未编辑状态下，添加不可操作的手势
				//     if(!isTriggerEdit){
				//         $("#add_one").css("cursor","not-allowed");
				//     }
				// });
			},
			//静态数据：Gis点的点类型的实现
			gispointtype: function (e) {
				return page.data.aType_list[e.row.pointType];
			},
			//静态数据：操作按钮的展示（新增、编辑、删除、更新、取消）  by yuanshuang
			onActionRenderer: function (e) {
				var cur_grid3 = e.sender;
				var record2 = e.record;
				var uid = record2._uid;
				var rowIndex = e.rowIndex;
				if (isTriggerEdit) {
					//若是进入编辑状态，那么将操作按钮设置为可编辑状态；
					var s = '<a class="New_Button" href="javascript:page.logic.newRow()">新增</a>' +
						' <a class="Edit_Button" href="javascript:page.logic.editRow(\'' + uid + '\')" >编辑</a>' +
						' <a class="Delete_Button" href="javascript:page.logic.delRow(\'' + uid + '\')">删除</a>';
				} else {
					//若是退出编辑状态，那么将操作按钮设置为不可编辑状态；
					var s = '<a class="New_Button input_useless" style="cursor: not-allowed;" href="javascript:;">新增</a>' +
						' <a class="Edit_Button input_useless" style="cursor: not-allowed;" href="javascript:;" >编辑</a>' +
						' <a class="Delete_Button input_useless" style="cursor: not-allowed;" href="javascript:;">删除</a>';
				}
				if (cur_grid3.isEditingRow(record2)) {
					s = '<a class="Update_Button" style="margin-right:10px;" href="javascript:page.logic.updateRow(\'' + uid + '\')">更新</a>' +
						'<a class="Cancel_Button" href="javascript:page.logic.cancelRow(\'' + uid + '\')">取消</a>';
				}
				return s;
			},
			//静态数据：新增一行
			newRow: function () {
				if (!isTriggerEdit) {
					//禁止跳转
					var event = event || window.event;
					if (event.preventDefault) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
				}
				var row = {};
				grid3.addRow(row, 0);
				grid3.cancelEdit();
				grid3.beginEditRow(row);
			},
			//静态数据：编辑一行
			editRow: function (row_uid) {
				var row = grid3.getRowByUID(row_uid);
				if (row) {
					grid3.cancelEdit();
					grid3.beginEditRow(row);
				}
			},
			//静态数据：取消保存行
			cancelRow: function (row_uid) {
				grid3.reload();
			},
			//静态数据：删除行
			delRow: function (row_uid) {
				var row = grid3.getRowByUID(row_uid);
				if (row) {
					var GisId = row.gisId; //gis地图点的Id
					var StaticPointId = row.staticPointId; //gis业务主键id;
					if (confirm("确定删除此记录？")) {
						grid3.loading("删除中，请稍后......");
						$.ajax({
							url: ECS.api.gisPoint + "/" + GisId + "/static",
							async: true,
							dataType: "text",
							timeout: 1000,
							data: JSON.stringify([StaticPointId]),
							contentType: "application/json;charset=utf-8",
							type: 'DELETE',
							success: function (text) {
								grid3.reload();
							},
							error: function () {}
						});
					}
				}
			},
			//静态数据：保存行
			updateRow: function (row_uid) {
				var row = grid3.getRowByUID(row_uid);
				var GisId = row.gisId; //gis地图点的Id
				var StaticPointId = row.staticPointId; //gis业务主键id;
				//校验非空
				var form = new mini.Form("#datagrid3");
				form.validate();
				if (form.isValid() == false) return;
				grid3.commitEdit(); //提交编辑的数据；
				var rowData = grid3.getChanges();
				grid3.loading("保存中，请稍后......");
				var data = {};
				data.pointType = row.pointType; //点类型
				data.location = row.location; //位置描述
				data.info = row.info; //信息
				data.name = row.name; //点名称
				var url = "",
					sub_type = "";
				if (StaticPointId) {
					//修改保存
					url = ECS.api.gisPoint + "/" + GisId + "/static/" + StaticPointId + "?enterprise=" + ECS.sys.Context.SYS_ENTERPRISE_CODE;
					sub_type = "PUT";
					data.staticPointId = row.staticPointId; //gis业务主键id;
					data.gisId = row.gisId; //gis点id;
				} else {
					//新增保存
					url = ECS.api.gisPoint + "/" + gisId + "/static?enterprise=" + ECS.sys.Context.SYS_ENTERPRISE_CODE; //接口
					sub_type = "POST"; //请求方式
					data.gisId = gisId; //gis点id;
				}
				$.ajax({
					url: url,
					type: sub_type,
					data: JSON.stringify(data),
					dataType: "text",
					contentType: "application/json;charset=utf-8",
					success: function (text) {
						grid3.reload();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						// alert(jqXHR.respopnseText);
					}
				});
			},
			//查看下，是否可点击
			isClick: function (e) {
				var record2 = e.record;
				var uid = record2._uid;
				switch (e.row.pointType) {
					case 5: //应急队伍点
					case 6: //物资存放点
						return '<button style="width:30px;height:20px;line-height:20px;" class="btn btn-primary btn-sm" onclick="javascript:page.logic.GotoPage(\'' + uid + '\')">编辑</button>';
						break;
					default:
						return '<button style="border:#CCCCCC solid 1px;width:30px;height:20px;line-height:20px;cursor:not-allowed;" class="btn btn-primary btn-sm input_useless" onclick="javascript:;">编辑</button>'
				}
			},
			/*
			静态数据查看：
			跳转页面，去字表
			1：当点类型为应急队伍点时，查看按钮可点击进行操作，展示子表 StaticTeam.html;
			2：当点类型为物资存放点时，查看按钮可点击进行操作，展示子表 StaticStorage.html;
			*/
			GotoPage: function (Row_uid) {
				var row = grid3.getRowByUID(Row_uid),
					GisId = row.gisId, //gis地图点的Id
					StaticPointId = row.staticPointId, //gis业务主键id;
					PointType = row.pointType; //点类型
				switch (row.pointType) {
					case 5:
						var title = "应急队伍点列表";
						break;
					case 6:
						var title = "物资存放点列表";
						break;
				}
				page.logic.detail(title, GisId, StaticPointId, PointType);
			},
			/**
			 * 查看字表页面
			 * 参数列表：
			 * 第一个参数表示：弹框的标题；
			 * 第二个参数表示：gis地图点的id;
			 * 第三个参数表示：gis点的业务主键id;
			 * 第四个参数表示：gis点的类型：5：应急队伍点 或者 6：物资存放点
			 * */
			detail: function (title, GisId, StaticPointId, PointType) {
				//点类型的判断
				if (PointType == 5) {
					var pageType = "StaticTeam.html";
				} else if (PointType == 6) {
					var pageType = "StaticStorage.html";
				}
				layer.open({
					type: 2,
					closeBtn: 0,
					area: ['650px', '450px'],
					skin: 'new-class',
					shadeClose: false,
					title: false,
					content: pageType + '?' + Math.random(),
					success: function (layero, index) {
						var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						var data = {
							"gisId": GisId, //gis点的id;
							"StaticPointId": StaticPointId, //gis点的主键业务id;
							'title': title, //标题
							'isTriggerEdit': isTriggerEdit //子列表的按钮，是否可以进行编辑
						};
						iframeWin.page.logic.setData(data);
					},
					end: function () {
						if (window.pageLoadMode == PageLoadMode.Refresh) {
							window.pageLoadMode = PageLoadMode.None;
						} else if (window.pageLoadMode == PageLoadMode.Reload) {
							window.pageLoadMode = PageLoadMode.None;
						}
					}
				});
			},
			/*拼接url  by yuanshuang*/
			set_init_url: function (n) {
				var url = "";
				if (typeof n == "number") {
					if (n < 0) {
						url = searchUrl + "?status=" + n; //查询某个点关联的所有类型的信息
					} else {
						url = searchUrl + "?status=" + n + "&gisId=" + gisId; //查询某个点关联的所有类型的信息
					};
				};
				if (typeof n == "object") {
					if (n.type != undefined) {
						console.log(gisId)
						if(n.type == 1){
							url = searchUrl + "?status=" + n.type;
							// grid4.set({
							// 	ajaxType: "get",
							// 	url: search_url
							// });
						}else{
							if (gisId > 1) {
								url = searchUrl + "?status=" + n.type + "&gisId=" + gisId;
							};
						};
						
						 //查询某个点的具体某个类型关联的所有信息
					} else {
						console.log(isTriggerEdit)
						url = searchUrl + "?gisId=" + n.gisId;
					};
				};
				return url;
			},
			//缓存选中的数据
			//参数说明：
			//第一个参数表示：当前点击的行；
			//第二个参数表示当前点击的这条行数据是否为选中状态；
			save_selected: function (row, isSelected) {
				var isHave = false; //默认不存在；
				var cur_index = null; //表示row这条数据在已存在的缓存里的位置；
				// for(var w=0;w<page.data.aSelected_dt.length;w++){
				//     (function(cur_key,index){
				//         if((cur_key.gisPointForID==row.gisPointForID) && (cur_key.type==row.type)){
				//             isHave = true;
				//             cur_index = index
				//         }
				//     })(page.data.aSelected_dt[w],w);
				// }
				// page.data.aSelected_dt.push(row);
				if (isSelected) {
					//若选中的数据，缓存里没有，那么就添加；
					if (!isHave) {
						page.data.aSelected_dt = [];
						page.data.aSelected_dt.push(row);
					}
				} else {
					//若是未选中的数据，缓存里有，那么剔除掉；
					if (isHave) {
						page.data.aSelected_dt.splice(cur_index, 1);
					}
				}
			},
			//对缓存的数据进行过滤
			filter_data: function (dt) {
				var aCur_data = [];
				for (var i = 0; i < dt.length; i++) {
					(function (cur_dt) {
						var cur_one = {};
						cur_one.gisId = gisId; //gis地图点id;
						cur_one.type = cur_dt.type; //gis点的类型;
						cur_one.gisPointForId = cur_dt.gisPointForId; //gis点的id;
						cur_one.info = cur_dt.info ? cur_dt.info : ""; //gis点的信息;
						aCur_data.push(cur_one);
					})(dt[i]);
				}
				return aCur_data; //将处理后的数据返回；
			},
			//gis点动态数据列表的分类：返回分类的名字；
			get_type_val: function (e) {
				return page.data.aDymic_type[e.row.type];
			},
			/**
			 * gis点动态数据：搜索
			 */
			search: function (search_url, cb) {
				console.log(gisId)
				search_url = mini.encode(search_url);
				var ischecked = $("#isSelect").prop("checked");
				page.data.param = {};
				//设置name参数
				if (gisId < 1) {
					page.data.param["gisId"] = '';
				}

				//设置企业编码参数
				page.data.param["enterprise"] = ECS.sys.Context.SYS_ENTERPRISE_CODE;
				//若是"已勾选"为勾选状态；
				if (ischecked) {
					//其它方式处理
					//若是进入编辑状态，那么便用表2
					if (isTriggerEdit) {
						//grid2设置url参数
						grid2.set({
							ajaxType: "get",
							url: search_url,
						});
						grid2.load(page.data.param, function (result) {
							//存储当前点关联的所有点的数据；
							console.log(result)
							page.data.aDymic_init_dt = [];
							page.data.aDymic_init_dt = result.data; //存储所有点关联的所有数据；
							page.data.aSelected_dt = result.data;
							grid2.selectAll();
							cb && cb();
						});
					} else {
						//是否处于编辑状态，若是退出编辑状态，那么便用表4（表4，仅仅用来展示数据）
						grid4.set({
							ajaxType: "get",
							url: search_url
						});
						grid4.load(page.data.param, function (result) {
							// grid4.selectAll(true);
							cb && cb();
						});
						grid4.select();
						page.data.aDymic_init_dt = []; //同时清空缓存（缓存：gis点关联的所有数据）
					}
				} else {
					//grid设置url参数
					grid.set({
						ajaxType: "get",
						url: search_url
					});

					//若是"已勾选"为                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            非勾选状态；
					grid.load(page.data.param, function (result) {
						grid.clearSelect(true);
						cb && cb();
					});
				}
				grid.selectAll();
				//设置所有表格的高度；
				page.logic.setGridHeight();
			},
			/*进入 or 退出 编辑状态 */
			/*
			第一个参数表示：是否编辑状态；0表示退出编辑，1表示进入编辑；
			第二个参数表示：gisId；
			* */
			IntoEdit: function (status, GisId) {
				switch (status) {
					case 0:
						//退出编辑
						//表单已勾选处于未选中状态；
						$("#isSelect").prop("checked", false);
						//表单已勾选不可操作；
						$("#isSelect").prop("disabled", true);
						isTriggerEdit = false; //存储“退出编辑”的状态；
						break;
					case 1:
						//进入编辑
						//表单已勾选处于选中状态；
						$("#isSelect").prop("checked", true);
						//表单已勾选可操作；
						$("#isSelect").prop("disabled", false);
						//gis点分类，默认选择“全部”；
						// $("#type").val("");
						isTriggerEdit = true; //存储“进入编辑”的状态；
						break;
				}
				gisId = GisId; //保存地图的点id
				//若是进入编辑状态，需要将相关联的数据存储
				if (isTriggerEdit) {
					//动态数据：进行查询
					page.logic.get_check(GisId, function () {
						//存储相关联的数据（默认已选中的）
						var row_list = grid2.getData();
						for (var w = 0; w < row_list.length; w++) {
							page.logic.save_selected(row_list[w], true);
						}
						page.logic.ondrawcell_head(); //总复选框设置为可用；
					});
					page.logic.static_list(GisId); //查询某个gis点关联的所有静态数据；

					//关闭弹出层
					layer.closeAll('iframe'); //关闭所有的iframe层

				} else {
					//回到初始化状态
					page.logic.typeClickLoad(1, function () {
						page.logic.ondrawcell_head(); //绘制总复选框
						page.data.aSelected_dt = []; //清空gis点关联的缓存
					});
				}
			},
			//查询某个gis点关联的数据；
			check_point: function (GisId) {
				//查询动态数据
				if (GisId > 0) {
					page.logic.get_check(GisId); //查询某个gis点关联的所有动态数据；
				} else {
					//所有gis点关联的所有动态数据；
					page.logic.typeClickLoad(0, function () {
						page.logic.ondrawcell_head(); //绘制总复选框
					});
				}
				//查询静态数据；
				// if(GisId>0){
				//     page.logic.static_list(GisId);    //查询某个gis点关联的所有静态数据；
				// }else{
				//     //所有gis点关联的所有静态数据；
				//     page.logic.get_static_type(function(){
				//         page.logic.static_list(-1);          //用作测试使用（静态的）
				//     });
				// }
				//关闭弹出层
				layer.closeAll('iframe'); //关闭所有的iframe层
			},
			//拼接查询接口,只针对动态数据进行操作  by yuanshuang
			get_check: function (GisId, cb) {
				var url = "";
				gisId = GisId;
				//勾选状态下
				if ($("#isSelect").attr("checked")) {
					$("#datagrid").hide(); //表格一隐藏
					//若是处于编辑状态，显示表2，隐藏表4；
					if (isTriggerEdit) {
						$("#datagrid2").show(); //表格二显示
						$("#datagrid4").hide(); //表格四隐藏
						url = page.logic.set_init_url({
							gisId: gisId
						});
					} else {
						//若是处于退出编辑状态，显示表4，隐藏表2；
						$("#datagrid2").hide(); //表格二隐藏
						$("#datagrid4").show(); //表格四显示
						url = page.logic.set_init_url(1);
							
					}
					//拼接接口(gis点某个类型或者全部)
					// if($("#type").val()==""){
					//     //选择“全部”一项的；
					//     url = page.logic.set_init_url(gisId);
					// }else{
					//     //未选择“全部”一项的

					// }
				} else {
					//未勾选状态下
					$("#datagrid").show(); //表格一显示
					$("#datagrid2").hide(); //表格二隐藏
					$("#datagrid4").hide(); //表格四隐藏
					url = page.logic.set_init_url({
						type: 2
					});
				}
				page.logic.search(url, cb);
			},
			//查询动态数据；
			check_dymic_dt: function (cb) {
				var url = "";
				if (isTriggerEdit) {
					//若是在编辑状态下；
					// url = searchUrl + "?status=1" + "&videoName=" + $("#name").val();
					if ($("#isSelect").attr('checked') == 'checked') {
						layer.msg("请取消勾选!");
						return false;
						// //若是在勾选状态下
						// url = searchUrl + "?videoName=" + $("#name").val(); //查询某个点关联的所有类型的信息
					} else {
						//若是在非勾选状态下
						url = searchUrl + "?videoName=" + $("#name").val(); //查询某个点的具体某个类型关联的所有信息
					}
				} else {
					//若是在非编辑状态下；
					url = searchUrl + "?status=1" + "&videoName=" + $("#name").val(); //查询某个点关联的所有类型的信息
				}
				url = encodeURI(url);
				page.logic.search(url, cb);
			},
			/*
			 * 点击类型加载
			 * 参数n表示：地图点id;
			 * */
			typeClickLoad: function (n, cb) {

				if (!isTriggerEdit) {
					//显示表4，隐藏表1,表2；
					$("#datagrid").hide();
					$("#datagrid2").hide();
					$("#datagrid4").show();
				} else {
					//显示表2，隐藏表1，表4；
					$("#datagrid").hide();
					$("#datagrid4").hide();
					$("#datagrid2").show();
				}
				//清除表1，表2，表4；
				grid.clearSelect(true);
				grid2.clearSelect(true);
				// grid4.clearSelect(true);
				grid2.deselectAll(true);
				// $("#type").val("");                        //gis点的类型默认选择全部；
				$("#isSelect").prop("checked", true); //勾选选中
				$("#isSelect").prop("disabled", true); //勾选不可操作
				//查询列表
				var cur_url = "";
				if (n) {
					gisId = n; //存储地图的点id;
					cur_url = page.logic.set_init_url(n);
				} else {
					cur_url = page.logic.set_init_url({
						type: 1
					}); //首页url
				}
				page.logic.search(cur_url, cb);
			},
			//刷新页面，同时退出编辑；
			refresh_page: function () {
				isTriggerEdit = false; //退出编辑
				page.logic.check_point(-1); //刷新动态数据和静态数据；（初始化，所有点的关联的数据）
			},
			/*
			 * 删除
			 * */
			deletes: function (GisId) {
				if (gisId) {
					var deleteUrl = ECS.api.gisSurfaceUrl + '/survVideoGIS/delSurvVideoGisRealtion?gisId=' + GisId + '&survVideoId=' + page.data.aSelected_dt[0].survVideoId;
					$.ajax({
						url: deleteUrl,
						async: false,
						dataType: "json",
						timeout: 1000,
						contentType: "application/json;charset=utf-8",
						type: 'Get',
						beforeSend: function () {
							// ECS.showLoading();
						},
						success: function (result) {
							console.log(result)
							// ECS.hideLoading();
							if (result.isSuccess) {
								layer.msg(result.message, {
									time: 1000
								}, function () {
									isTriggerEdit = false; //退出编辑
									//向父窗口传递“删除成功”的信息
									var url = "isDelete(1)";
									window.parent.postMessage(url, '*');
								});
								page.logic.check_point(-1);
							} else {
								//向父窗口传递“删除失败”的信息
								var url = "isDelete(-1)";
								window.parent.postMessage(url, '*');
							}
						},
						error: function (result) {
							ECS.hideLoading();
							return false;
						}
					});
				} else {
					layer.msg("请选择要删除的gis面数据!");
					return false;
				};
				page.logic.give_up();
			},
			/**
			 * 保存
			 * GisId： 表示gis点的id;
			 */
			save: function (GisId) {
				gisId = GisId;
				if (gisId > 0) {
					//倘若gis点动态数据的表格判断是否勾选数据：
					if (!$("#isSelect").attr("checked")) {
						layer.msg('您未选择“已勾选”，请先勾选！', {
							time: 1000
						});
						//向父窗口传值-1,表示当前不愿退出保存状态；
						var url = "isSave(-1)";
						window.parent.postMessage(url, '*');
						return false;
					}
					//静态数据是否存在行编辑？若存在，那么不再往下进行
					// if(grid3.isEditing()){
					//     layer.msg('您当前的地图点的静态数据存在行编辑，请先退出行编辑',{
					//         time: 1000
					//     });
					//     //向父窗口传值-1,表示当前不愿退出保存状态；
					//     var url = "isSave(-1)";
					//     window.parent.postMessage(url, '*');
					//     return false;
					// }

					console.log(page.data.aSelected_dt)
					//处理提交类型
					var ajaxType = "POST";
					//拼接数据----------
					var jsonArr = {
						"gisID": GisId,
						"survVideoID": page.data.aSelected_dt[0].survVideoId || '',
					};
					var obj = {
						"VideoId": page.data.aSelected_dt[0].survVideoId || '',
						"VideoName": page.data.aSelected_dt[0].survVideoName || ''
					}
					//当前gis点关联的动态数据存在的情况下，向后端提交数据；
					$.ajax({
						url: ECS.api.gisSurfaceUrl + '/survVideoGIS/addSurvVideoGisRealtion',
						type: ajaxType,
						data: JSON.stringify(jsonArr),
						dataType: "json",
						contentType: "application/json;charset=utf-8",
						beforeSend: function () {
							// ECS.showLoading();
						},
						success: function (dt) {
							// ECS.hideLoading();
							// //当前gis点关联的动态数据有的时候
							// var result = eval("(" + dt + ")");
							// if (result.isSuccess) {
							// 	page.logic.save_success(result.result); //向父窗口返回保存成功提示；
							// }
							if (dt.isSuccess) {
								layer.msg(dt.message, {
									time: 1000
								}, function () {
									var url = "isSave(1," + JSON.stringify(obj) + ")";
									console.log(dt);
									window.parent.postMessage(url, '*');
									page.logic.search(page.logic.set_init_url({
										type: 1
									}), '', true);
								});
							} else {
								layer.msg(da.message, {
									time: 1000
								}, function () {
									var url = "isSave(-1," + JSON.stringify(obj) + ")";
									console.log(dt);
									window.parent.postMessage(url, '*');
									page.logic.search(page.logic.set_init_url({
										type: 1
									}), '', true);
								});
							}
						},
						error: function (result) {
							// ECS.hideLoading();
						}
					});
				}
				page.logic.give_up();
			},
			//放弃（退出编辑，并刷新页面）
			give_up: function () {
				isTriggerEdit = false;
				$('#name').val('');
				grid4.set({
					ajaxType: "get",
					url: page.logic.set_init_url({
						type: 1
					})
				});
				grid4.load(page.data.param, function (result) {
					// grid4.selectAll(true);
					// cb && cb();
				});
				grid.hide();
				grid2.hide();
				grid4.show();
				$("#isSelect").prop("disabled", true);
				$("#isSelect").prop("checked", true); //勾选选中
				// page.logic.check_point(-1); //刷新动态数据和静态数据；（初始化，所有点的关联的数据）
			},
			//新增gis点保存以后，返回给父窗口的数据
			save_success: function (result_dt) {
				grid3 = mini.get("datagrid3");
				//提示保存成功，并刷新列表
				layer.msg("保存成功！", {
					time: 1000
				}, function () {
					isTriggerEdit = false;
					page.logic.check_point(-1); //刷新动态数据和静态数据；（初始化，所有点的关联的数据）
				});
				var Point_Dynamic = result_dt; //动态数据；
				//存储返回的数据
				var aReturn_dt = {
					"static_dt": {},
					"damic_dt": Point_Dynamic
				};
				//拼接静态数据；
				var Point_Static = grid3.getData();
				//搭建静态数据的数据结构；
				for (var i = 0; i < page.data.aStatic_dt.length; i++) {
					aReturn_dt["static_dt"]["" + page.data.aStatic_dt[i].key] = [];
				}
				//存储静态数据的点类型和相应的id集合；
				if (Point_Static.length > 0) {
					for (var w = 0; w < Point_Static.length; w++) {
						aReturn_dt["static_dt"]["" + Point_Static[w].pointType].push(Point_Static[w].staticPointId);
					}
				}
				//向父窗口传值1,表示当前愿退出保存状态；
				var url = "isSave(1," + JSON.stringify(aReturn_dt) + ")";
				window.parent.postMessage(url, '*');
			},
			getQueryString: function (name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
				var r = window.location.search.substr(1).match(reg);
				if (r != null) return unescape(r[2]);
				return null;
			}
		}
	};
	page.init();
	window.page = page;
});