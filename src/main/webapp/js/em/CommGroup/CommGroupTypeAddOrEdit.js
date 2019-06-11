var addUrl = ECS.api.emUrl + '/CommGroupsType';
var updateUrl = ECS.api.emUrl + '/CommGroupsType/addAndUpdate';
var getSingleUrl = ECS.api.rttUrl + '/constitutionType/getSingleConstitutionType';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2&isAll=true';  //企业

var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
var commGroupTypeName = '';
var commGroupTypeId = '';
var listLength = $("#nameList .form-group").length;
$(function() {
	var index = parent.layer.getFrameIndex(window.name); //获取子窗口索引
	var page = {
		init: function() {
			mini.parse();
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});
			this.bindUI();
			page.logic.initOrgCode(enterpriseCodeUrl, $("#enterpriseCode")); //企业
		
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
			setData: function(data) {
				enterpriseCode = data.enterpriseCode;
				commGroupTypeName = data.commGroupTypeName;
				commGroupTypeId = data.commGroupTypeId;
				//$("#firstName").val(commGroupTypeName);

				$('#title-main').text(data.title);
				mini.get("enterpriseCode").setValue(enterpriseCode);
				mini.get("enterpriseCode").setEnabled(false);
				pageMode = data.pageMode;
				if(pageMode == PageModelEnum.NewAdd) {
					return;
				}
				if(pageMode == PageModelEnum.Edit) {
					var gridList = data.gridList;

					ECS.form.setData('AddOrEditModal', data);
					$("#firstName").val(gridList[0].commGroupTypeName);
					$("#firstName").attr("nameid", gridList[0].commGroupTypeId);
					$("#firstName").attr("pid", gridList[0].commGroupTypeId);
					for(var i = 1; i < gridList.length; i++) {
						$("#nameList").append('<div class="form-group">' +
							'<div class="col-xs-7 col-xs-offset-3">' +
							'<input type="text" pid="' + gridList[i].commGroupTypeId + '" nameid="' + gridList[i].commGroupTypeId + '" name="list' + i + '" class="form-control required" maxlength="200" value="' + gridList[i].commGroupTypeName + '" onblur="this.value=this.value.replace(/\\s+/g,\'\')" /></div>' +
							'<span class="span-required">*</span>' +
							'</div>');
					}
					listLength = $("#nameList .form-group").length;

				};
				if(data.row){
					var select = $("input[pid='"+data.row.commGroupTypeId+"']");
					$(select).focus().select();
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
						mini.get("enterpriseCode").setValue(enterpriseCode);
					}
				})
			},
			
			/**
			 * 保存
			 */
			save: function() {
				page.logic.formValidate();
				var repeatArr =[];
				var numArr = [];
				var flag  = false;
				var msg  = "";
				$("#nameList").find(".form-control").each(function(i) {
					$(this).val($.trim($(this).val()));
					if($(this).val() != "") {
						numArr.push({
							enterpriseCode: $("input[name=enterpriseCode]").val(),
							commGroupTypeName: $(this).val(),
							commGroupTypeId: $(this).attr("nameid"),
							sortNum: i
						});
						if(repeatArr.indexOf($(this).val())<0){
							repeatArr.push($(this).val());
						}else{
							flag =true;
							msg = "重复项："+$(this).val();
							return false;
						}
						
					}
				});
				if(flag){
					layer.msg(msg);
					return false;
					
				}
				if(!$('#AddOrEditModal').valid()) {
					return;
				}

				$("#nameEntitys").val(JSON.stringify(numArr));
				var data = ECS.form.getData('AddOrEditModal');
				var ob = JSON.parse(data.nameEntitys); //去掉数组中对象属性的双引号

				//处理提交类型
				var ajaxType = "POST";
				if(pageMode == PageModelEnum.NewAdd) {
					window.pageLoadMode = PageLoadMode.Reload;
				} else if(pageMode == PageModelEnum.Edit) {
					ajaxType = "POST";
					window.pageLoadMode = PageLoadMode.Refresh;
					addUrl = updateUrl;

				}

				console.log(JSON.stringify(ob));
				$.ajax({
					url: addUrl,
					async: false,
					type: ajaxType,
					data: JSON.stringify(numArr),
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
						constitutionType: {
							required: true
						},
						constitutionCode: {
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