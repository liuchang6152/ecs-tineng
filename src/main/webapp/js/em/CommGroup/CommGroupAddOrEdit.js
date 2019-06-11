var addUrl = ECS.api.emUrl + '/CommGroups';
var delUrl = ECS.api.emUrl + '/CommGroups'; //删除

window.pageLoadMode = PageLoadMode.None;
var enterpriseCode = '';
var enterpriseName = '';
var commGroupTypeCode = '';
var commGroupTypeName = '';
var groupName = '';
var groupId = '';
$(function() {
	var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
	var page = {
		//页面初始化
		init: function() {
			mini.parse();
			this.bindUI();

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

		},
		data: {
			param: {}
		},
		//定义业务逻辑方法
		logic: {
			/**
			 * 初始化编辑数据
			 */
			setData: function(data) {
				enterpriseCode = data.enterpriseCode;
				enterpriseName = data.enterpriseName;
				commGroupTypeName = data.commGroupTypeName;
				commGroupTypeCode = data.commGroupTypeId;
				groupName = data.groupName;
				groupId = data.groupId;
				$("#orgName").val(enterpriseName);
				$("#commGroupType").val(data.commGroupTypeName);
				$('#title-main').text(data.title);
				$("#commGroupName").val(groupName);

				pageMode = data.pageMode;
				if(pageMode == PageModelEnum.NewAdd) {
					return;
				}

			},

			/**
			 * 保存
			 */
			save: function() {
				page.logic.formValidate();

				if(!$('#AddOrEditModal').valid()) {
					return;
				}

				var data = ECS.form.getData('AddOrEditModal');
				var jsonData = {
					commGroupTypeId: commGroupTypeCode,
					groupName: data.commGroupName,
					enterpriseCode: enterpriseCode,
					commGroupid: groupId
				};

				//处理提交类型
				var ajaxType = "POST";
				if(pageMode == PageModelEnum.NewAdd) {
					window.pageLoadMode = PageLoadMode.Reload;
				} else if(pageMode == PageModelEnum.Edit) {
					ajaxType = "PUT";
					window.pageLoadMode = PageLoadMode.Refresh;
				}

				console.log(JSON.stringify(jsonData));
				$.ajax({
					url: addUrl,
					async: false,
					type: ajaxType,
					data: JSON.stringify(jsonData),
					dataType: "json",
					contentType: "application/json;charset=utf-8",
					beforeSend: function() {
						$('#btnSave').attr('disabled', 'disabled');
						ECS.showLoading();
					},
					success: function(result) {
						ECS.hideLoading();
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
						commGroupName: {
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