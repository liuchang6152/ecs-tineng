var addUrl = ECS.api.rttUrl + '/vehicleMaintain';
var getSmailUrl = ECS.api.rttUrl + '/vehicleMaintain';

var getSingleUrl = ECS.api.rttUrl + '/constitutionType/getSingleConstitutionType';
var enterpriseCodeUrl =ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true';  //企业'; //企业
var enterpriseCode  ;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;

var listLength = $("#nameList .form-group").length;
$(function() {
	var index = parent.layer.getFrameIndex(window.name); //获取子窗口索引
	var page = {
		init: function() {
			mini.parse();
			ECS.sys.RefreshContextFromSYS();
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});
			this.bindUI();
			page.logic.initOrgCode(enterpriseCodeUrl,"enterpriseCode"); //企业
		
		},
		bindUI: function() {
			$('#btnSave').click(function() {
				page.logic.save();
			});
			$(".btnClose").click(function() {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});

			$("#addNewName").click(function() {

				$("#nameList").append('<div class="form-group">' +
					'<div class="col-xs-7 col-xs-offset-3">' +
					'<input type="text" name="list' + listLength + '" class="form-control required" maxlength="200" /></div>' +
					'<span class="span-required">* &nbsp;&nbsp;&nbsp;</span>' +
					'<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
				listLength++;

			});
			$('#nameList').on('click', '.delName', function() {
				$(this).closest('.form-group').remove();
				listLength--;
				return false;
			});
		},
		logic: {
			/**
			 * 初始化编辑数据
			 */
			setData: function(data,row) {
			

				$('#title-main').text(data.title);
			
				pageMode = data.pageMode;
				if(pageMode == PageModelEnum.NewAdd) {
					return;
				}
				if(pageMode == PageModelEnum.Edit) {
				


					ECS.form.setData('AddOrEditModal', row);
					enterpriseCode = row.orgCode;
					mini.get("enterpriseCode").setValue(row.orgCode);
					mini.get("enterpriseCode").setEnabled(false);
					$.ajax({
						type:"GET",//get或post
						url:getSmailUrl+"/"+row.vehicleBigID,//请求的地址
						data:{},//参数
						dataType:'json',//text,json,xml,jsonp
						contentType: 'application/json;charset=utf-8',
						beforeSend:function(res){//发送前函数
						
							ECS.showLoading();
							console.log(res)
						},
						success:function(result){//成功的回调函数
							ECS.hideLoading();
							if(result.isSuccess) {
								console.log(result);
								var gridList = result.result;
								$("#firstName").val(gridList[0].vehicleSmallName);
								$("#firstName").attr("nameid", gridList[0].vehicleSmallId);
								$("#firstName").attr("pid",row.vehicleBigID);
								for(var i = 1; i < gridList.length; i++) {
									$("#nameList").append('<div class="form-group">' +
										'<div class="col-xs-7 col-xs-offset-3">' +
										'<input type="text" pid="' +row.vehicleBigID + '" nameid="' + gridList[i].vehicleSmallId + '" name="list' + i + '" class="form-control required" maxlength="200" value="' + gridList[i].vehicleSmallName + '" onblur="this.value=this.value.replace(/\\s+/g,\'\')" /></div>' +
										'<span class="span-required">*&nbsp;&nbsp;&nbsp;</span>' +
										'<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>' +
										'</div>');
								}
								listLength = $("#nameList .form-group").length;
							} else {
								//layer.msg(result.message);
							}
						},
						error:function(err){//失败的回调函数
							$('#btnSave').attr('disabled', false);
							ECS.hideLoading();
							layer.msg(err.message);
						}
					})



				

				}

			},
			/**
			 * 企业
			 */
			initOrgCode: function(menu_url, oPar) {
				$.ajax({
					url: menu_url,
					type: "get",
					success: function(data) {
						mini.get("enterpriseCode").loadList(data, "orgCode", "porgCode");
					
						//若是企业用户，设置为不可用状态；
						if (ECS.sys.Context.SYS_IS_HQ) {
							mini.get(oPar).setValue(data[0].orgCode);
						} else {
							enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
							mini.get(oPar).disable();

							for (var w = 0; w < data.length; w++) {
								(function (cur_key) {
									if (cur_key.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE) {
										mini.get(oPar).setValue(cur_key.orgCode);
										
									}
								})(data[w]);
							}
						}
					}
				})
			},
			
			/**
			 * 保存
			 */
			save: function() {
				page.logic.formValidate();
				var numArr = [];
				

				$("#nameList").find(".form-control").each(function(i) {
					$(this).val($.trim($(this).val()));
					if($(this).val() != "") {
						if(pageMode == PageModelEnum.NewAdd) {
							numArr.push( $(this).val());
						}
						if(pageMode == PageModelEnum.Edit) {
							numArr.push({
								vehicleSmallId: $(this).attr("nameid"),
							vehicleSmallName: $(this).val(),
							});
							
						}
					}
				});

				var obj = {
					orgCode: $("input[name=enterpriseCode]").val(),
					vehicleBigName: $("#vehicleBigName").val(),
					vehicleBigID: $("#vehicleBigID").val(),
					
				
				}

				if(!$('#AddOrEditModal').valid()) {
					return;
				}

				//处理提交类型
				var ajaxType = "POST";
				if(pageMode == PageModelEnum.NewAdd) {
					obj.vehicleSmalls=numArr
					window.pageLoadMode = PageLoadMode.Reload;
				} else if(pageMode == PageModelEnum.Edit) {
					ajaxType = "PUT";
					obj.vehicleSmallEntities=numArr
					window.pageLoadMode = PageLoadMode.Refresh;

				}

				$.ajax({
					url: addUrl,
					async: false,
					type: ajaxType,
					data: JSON.stringify(obj),
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					beforeSend: function() {
						$('#btnSave').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function(result) {
						ECS.hideLoading();
						$('#btnSave').attr('disabled', false);
						if (result.isSuccess) {
							layer.msg(result.message, {
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
					
						layer.msg("系统繁忙");
					}
				})
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
						enterpriseCode: {
							required: true
						},
						vehicleBigName: {
							required: true
						},
						firstName: {
							required: true
						}
					}
				});
			}
		}
	}
	page.init();
	window.page = page;
})