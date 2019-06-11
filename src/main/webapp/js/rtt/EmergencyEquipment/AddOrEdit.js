var addUrl = ECS.api.rttUrl + '/emergencyEquipment';
var detailUrl = ECS.api.rttUrl + '/emergencyEquipment/getEmrgequipById';
var riskorg_url = ECS.api.bcUrl + '/org/porgName';   
var getUserUrl = ECS.api.bcUrl + '/user';  //获取人员信息
var stockpilePointTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getStoreTypeEnumList'; //   存放点类型
var stockpileTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getRepoTypeEnumList'; //存储库类型
var stockpilePointUrl = ECS.api.rttUrl + '/emergencyEquipment/getEmeStoPoint'; //   存放点
var Enterprise_url = ECS.api.rttUrl +'/expert/getExpertTypeEnumList';                //企业内/外
var unit_url = ECS.api.rttUrl +'/emergencyEquipment/getParammesunit';                //单位
var mesUnitUrl = ECS.api.rttUrl + '/emrgMtrl/mesUnit';//计量单位
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
var enterpriseName = '';
var orgList = [];
var storageID = '';
var drtDeptCode = '';
$(function() {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var page = {
		//页面初始化
		init: function() {
			mini.parse();
			this.bindUI();
			page.logic.initTable();
			page.logic.loadType();

		},
		table: {},
		//绑定事件和逻辑
		bindUI: function() {
			$(".btnClose").click(function() {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});

			//保存
			$("#btnSave").click(function() {
				page.logic.save();
			});
			$("#selectMedia").click(function () {
				page.logic.selectMedia();
			});

			$("#selectUser").click(function () {
				page.logic.selectUser();
			});

			$("#drtDeptCode").change(function(){
				page.logic.loadstockpilePoint();
			});
			$("#storeType").change(function(){
				page.logic.loadstockpilePoint();
			});
			$("#repoType").change(function(){
				page.logic.loadstockpilePoint();
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
			getEnterpriseType :function(){
				$("#equipOwner").html('<option value="" selected="selected">可输入</option>');
				var datalist = [{"text":"队伍","id":1},{"text":"企业","id":2}];
				$('#equipOwner').select2({
					tags: false,
					data: datalist,
					language: {
						noResults: function (params) {
							return "没有匹配项";
						}
					},
				});
			},

			// 企业改变事件
			enterprisechanged: function () {
			
				var enterprise = $("#enterpriseCode").val();
				if(orgList.length>0){
					var newList = JSLINQ(orgList).Where(function (x) { return x.id == enterprise ; }).ToArray();
				
					var secordUrl  = riskorg_url+"?isAll=false&orgPID="+newList[0].orgId+"&orgLvl=3";
					page.logic.getsecordEnterPriseSelects(secordUrl, "drtDeptCode",'orgCode','orgSname',false); //树形菜
				}
			},
			// 加载二级
			getsecordEnterPriseSelects : function (url, ctrlId, key, value, tags) {
				console.log(url);
				$("#" + ctrlId).html('<option value="" selected="selected">可输入</option>');
				$.ajax({
					url: url,
					async: false,
					dataType: "json",
					success: function (data) {
				
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
						if(drtDeptCode){
							$("#drtDeptCode").val(drtDeptCode);
						//	$("#drtDeptCode").text(drtDeptCode);
						}
						console.log(12);
					},
				})
			},
		
			loadType: function (enterpriseCode) {
                ECS.ui.getComboSelects(stockpilePointTypeUrl,"storeType","key","value",false);
				ECS.ui.getComboSelects(stockpileTypeUrl,"repoType","key","value",false);
				ECS.ui.getComboSelects(Enterprise_url,"equipType","key","value",false);
				// ECS.ui.getComboSelects(unit_url,"mesUnit","id","name",false);
				ECS.ui.getComboSelect(mesUnitUrl,"mesUnit","value","value",true,name);
			},

			loadstockpilePoint :function(){
				var orgCode = $("#drtDeptCode").val()==null ?"":$("#drtDeptCode").val();
				var repoType = $("#repoType").val()==null ?"":$("#repoType").val();
				var mtrlType = $("#storeType").val()==null ?"":$("#storeType").val(); 
				page.logic.getComboSelects(stockpilePointUrl + "?orgCode="+orgCode+"&repoType="+repoType+"&mtrlType="+mtrlType,"storageID","id","name",false);
				
			},



			getComboSelects : function (url, ctrlId, key, value, tags) {
				$("#" + ctrlId).html('<option value="" selected="selected">可输入</option>');
				$.ajax({
					url: url,
					async: true,
					dataType: "json",
					success: function (data) {
					  
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
						if(storageID){
							$("#storageID").val(storageID);
						}
					
					},
				})
			},

			

			 /**
             * 初始化表格
             */
            initTable: function () {
				page.logic.getEnterpriseType();
                //获取用户的相关数据
                ECS.sys.RefreshContextFromSYS();
                //企业、二级单位；
                page.logic.enterprise(riskorg_url,"enterpriseCode");
                //安全风险区类型
			   $("#crtUserDept").val(ECS.sys.Context.SYS_ENTERPRISE_NAME);
			   
			 
			},
			
			//企业名称
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
							datalist.push({ id: el["orgCode"], text: el["orgSname"],orgId:el["orgId"] });
						});
					 }else{
						var newList = JSLINQ(data).Where(function (x) { return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE ; }).ToArray();
						$.each(newList, function (i, el) {
							datalist.push({ id: el["orgCode"], text: el["orgSname"],orgId:el["orgId"] });
						});
						var secordUrl  = menu_url+"?isAll=false&orgPID="+newList[0].orgId+"&orgLvl=3";
						page.logic.getsecordEnterPriseSelects(secordUrl, "drtDeptCode",'orgCode','orgSname',false); //树形菜单
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
						layer.msg("系统繁忙");
					}
				})
			},

		

			/**
			 * 初始化编辑数据
			 */
			setData: function(data,row) {
				$('#title-main').text(data.title);
				pageMode = data.pageMode;
				var timeoutID = setInterval(function() {
					if (window.document.readyState != "loading") {
						try {
							clearTimeout(timeoutID);
							if(pageMode == PageModelEnum.NewAdd) {
								return;
							}else{
								$.ajax({
									url: detailUrl+"?emrgequipId="+row.emrgEquipID,
									type: "get",
									async: true,
									success: function (data) {
										page.logic.Convert(data);
										for (var key in data) {
											row[key]= data[key] ;
										}
										drtDeptCode = data.drtDeptCode;
										storageID = data.storageID;
										ECS.form.setData('AddOrEditModal', row);
									   var form = new mini.Form("AddOrEditModal");
									 form.setData(row, false);
								
									},
									error: function (e) {
										//	alert(e);
									}
								});
					
							}
					   
						} catch(e) {
		
						}
					}
				}, 3000);
			
         
			  
			


			},
		
			selectUser:function(){
				layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../Personnel/SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                      
						var data = {
                            "pageMode": pageMode,
							'title': '人员选择(单选)',
                            "orgCode": $("#enterpriseCode").val(),
                            "userInfo":{
                                "userID":$("#userID").val(),
                                "userName":$("#userName").val()
                            }
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        $("#userId").val(window.ownDetail);
                        $.ajax({
                            url: getUserUrl + "/" + window.ownDetail + "?now=" + Math.random(),
                            type: "get",
                            async: true,
                            dataType: "json",
                            beforeSend: function () {
                                ECS.showLoading();
                            },
                            success: function (data) {
								ECS.hideLoading();
								var tel  = data.userPhone || data.userMobile;
								$("#userName").val(data.userName);
								$("#userID").val(data.userID);
								
                                $("#phone").val(tel);
                              
                            },
                            error: function (result) {
                                ECS.hideLoading();
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        });
                    }
                })
			},

			selectMedia: function () {
				layer.open({
					type: 2,
					closeBtn: 1,
					area: ['80%', '90%'],
					skin: 'new-class',
					shadeClose: false,
					title: '储存库分类选择',
					content: 'SelectType.html?r=' + Math.random(),
					success: function (layero, index) {

					},
					end: function () {
						var result =window.ownDetail;
						var arr = [];
						if(result.allName){
							 arr  = result.allName.split('-');
						}else{
							arr.push(result.bgCategName);
						}
						
						$("#businessBgCategName").val(result.bgCategName);
						$("#businessBgCategCode").val(result.bgCategCode);
						$("#businessMdCategName").val(arr[1]);
						$("#businessMdCategCode").val(result.mdCategCode);
						$("#businessSmCategName").val(arr[2]);
						$("#businessSmCategCode").val(result.code);
					}
				})
			},

			/**
			 * 保存
			 */
			save: function() {
				page.logic.formValidate();
				var data = ECS.form.getData('AddOrEditModal');
				data.userID = 	$("#userID").val();
				if(!$('#AddOrEditModal').valid()) {
					return;
				}
				var message = '';
				if(!data.businessBgCategCode){
					message +='装备大类不能为空';
				}
				if(!data.equipAmount){
					message +='库存量不能为空';
				}
				if(!data.userID){
					message +='负责人不能为空';
				}
				if(!data.productionDate){
					message +='出厂日期不能为空';
				}
				if(message){
					layer.msg(message);
					return false;
				}
				//处理提交类型
				var ajaxType = "POST";
				if(pageMode == PageModelEnum.NewAdd) {
					window.pageLoadMode = PageLoadMode.Reload;
				} else if(pageMode == PageModelEnum.Edit) {
					ajaxType = "PUT";
					window.pageLoadMode = PageLoadMode.Refresh;
				}
				// console.log(JSON.stringify(data));
				$.ajax({
					url: addUrl,
					async: false,
					type: ajaxType,
					data: JSON.stringify(data),
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					beforeSend: function() {
						$('#btnSave').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function(result) {
						ECS.hideLoading();
						$('#btnSave').attr('disabled', false);
						if(result.isSuccess) {
							layer.msg("保存成功！", {
								time: 1000
							}, function() {
								page.logic.closeLayer(true);
							});
						} else {
							layer.msg(result.message);
						}
					},
					error: function(result) {
						$('#btnSave').attr('disabled', false);
						ECS.hideLoading();
						var errorResult = $.parseJSON(result.responseText);
						layer.msg(errorResult.collection.error.message);
					}
				})
			},

			Convert: function (item) {
					item.expireDate = moment(item.expireDate).format('YYYY-MM-DD ');
					item.productionDate = moment(item.productionDate).format('YYYY-MM-DD ');
				
				return item;
			},

			/**
			 * 关闭弹出层
			 */
			closeLayer: function(isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
			formValidate: function() {
				ECS.form.formValidate('AddOrEditModal', {
					rules: {
						
						equipOwner: {
							required: true
						},
						drtDeptCode: {
							required: true
						},
						// storeType: {
						// 	required: true
						// },
						// repoType: {
						// 	required: true
						// },
						storageID: {
							required: true
						},
						// sourceType: {
						// 	required: true
						// },
						businessBgCategName: {
							required: true
						},
						emrgEquipName: {
							required: true
						},
						// emrgEquipCode: {
						// 	required: true
						// },
						equipAmount: {
							required: true
						},
						userID: {
							required: true
						},
						productionDate: {
							required: true
						},
						
						equipType: {
							required: true
						}
						
					}
				});
			}
		}
	};
	page.init();
	window.page = page;
});