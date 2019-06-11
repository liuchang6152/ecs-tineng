var addUrl = ECS.api.rttUrl + '/vehicleMaintain';
var getSmailUrl = ECS.api.rttUrl + '/vehicleMaintain/getVehicleSmallInfo';

var getSingleUrl = ECS.api.rttUrl + '/constitutionType/getSingleConstitutionType';
var updateUrl = ECS.api.rttUrl + '/vehicleMaintain/updateVehicleSmall';  //修改
var uploadAttrUrl = ECS.api.rttUrl + '/vehicle/uploadFile';//照片上传
var downloadUrl = ECS.api.rttUrl + '/vehicle/downloadFile';//照片下载

var uploader; //上传组件实例
var fileType; //附件类型
var validate; //验证实例
var fileTypes = new Array();
var attaArray = new Array(); //附件实体封装
var status = 0;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;

var listLength = $("#nameList .form-group").length;
$(function() {
	var index = parent.layer.getFrameIndex(window.name); //获取子窗口索引
	var page = {
		init: function() {
			mini.parse();
			$('input').blur(function() {
				$(this).val($.trim($(this).val()))
			});
		
			page.logic.upload();//照片上传
			this.bindUI();
		
		
		},
		bindUI: function() {
			$('#btnSave').click(function() {
				page.logic.save();
			});
			$(".btnClose").click(function() {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
			});

			 //删除附件
			 $(".close").click(function() {
                page.logic.delAtt(this);
            });
            //图片预览
            $(".viewImg").bind("click", function() {
                var image = $(this);
                image.viewer({
                    inline: false,
                    viewed: function() {
                        image.viewer('zoomTo', 1);
                    },
                    hidden: function() {
                        $(".viewImg").viewer('destroy');
                    }
                });
            });
            //上传按钮组
            $("#idCardBtn").click(function() {
                fileType = 1;
            });

			$("#addNewName").click(function() {
				var strArr = '';
				

				$("#nameList").find(".form-control").each(function(i) {
					$(this).val($(this).val());
					if($(this).val() != "") {
						strArr += $(this).val();

					}
				});
				if(strArr.length >=200){
					return false;
				}
				$("#nameList").append('<div class="form-group">' +
					'<div class="col-xs-7 col-xs-offset-3">' +
					'<input type="text" name="list' + listLength + '" class="form-control required" maxlength="200" /></div>' +
					'<span class="span-required">* &nbsp;&nbsp;</span>' +
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
				
				$('#vehicleSmallName').attr('disabled', 'disabled');
                ECS.form.setData('AddOrEditModal', row);
					$.ajax({
						type:"GET",//get或post
						url:getSmailUrl+"/"+row.vehicleSmallId,//请求的地址
						data:{},//参数
						dataType:'json',//text,json,xml,jsonp
						contentType: 'application/json;charset=utf-8',
						beforeSend:function(res){//发送前函数
						
							ECS.showLoading();
							console.log(res)
						},
						success:function(result){//成功的回调函数
							ECS.hideLoading();
							if(result.vehicleBigPicture){
								$("#idCardBtn").hide();
								$("#view1").show();
								$(".close").show();
								$("#view1").html('<img id="img1" src="'+downloadUrl+'?fileId='+result.vehicleBigPicture+'">');
							}
							if(result.vehicleSmallAttributes.length>0) {
								console.log(result);
								var gridList = result.vehicleSmallAttributes;
								$("#firstName").val(gridList[0]);
								$("#firstName").attr("nameid", gridList[0]);
						
								for(var i = 1; i < gridList.length; i++) {
									$("#nameList").append('<div class="form-group">' +
										'<div class="col-xs-7 col-xs-offset-3">' +
										'<input type="text" pid="" nameid="" name="list' + i + '" class="form-control required" maxlength="200" value="' + gridList[i] + '" onblur="this.value=this.value.replace(/\\s+/g,\'\')" /></div>' +
										'<span class="span-required">*&nbsp;&nbsp;&nbsp;</span>' +
										'<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>' +
										'</div>');
								}
								listLength = $("#nameList .form-group").length;
							} else {
							//	layer.msg(result.message);
							}
						},
						error:function(err){//失败的回调函数
							$('#btnSave').attr('disabled', false);
							ECS.hideLoading();
							layer.msg('系统繁忙');
						}
					})



				

				

			},
			
			
			/**
			 * 保存
			 */
			save: function() {
				page.logic.formValidate();
				var numArr = [];
				
				var data = ECS.form.getData('AddOrEditModal');
				$("#nameList").find(".form-control").each(function(i) {
					$(this).val($.trim($(this).val()));
					if($(this).val() != "") {
						numArr.push( $(this).val());

					}
				});

				var obj = {

					vehicleSmallName: $("#vehicleSmallName").val(),
					vehicleSmallId: $("#vehicleSmallId").val(),
					vehicleSmallAttribute :numArr.toString(','),
					vehicleBigPicture :data.personnelPhotoPath,
					vehicleSmallPicture  :data.personnelPhotoPath
				}

				if(obj.vehicleSmallAttribute.length>200){
					layer.msg("技术属性超长");
					return;
				}

				if(!$('#AddOrEditModal').valid()) {
					return;
				}

				//处理提交类型
				var ajaxType = "PUT";
				if(pageMode == PageModelEnum.NewAdd) {
					window.pageLoadMode = PageLoadMode.Reload;
				} else if(pageMode == PageModelEnum.Edit) {
					ajaxType = "PUT";
					window.pageLoadMode = PageLoadMode.Refresh;

				}

				$.ajax({
					url: updateUrl,
					async: false,
					type: "PUT",
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
			 //上传附件
			 upload: function() {
                uploader = new plupload.Uploader({
                    browse_button: ["idCardBtn"], //触发文件选择元素id
                    url: uploadAttrUrl, //服务器端的上传页面地址
                    multi_selection: false,
                    multipart_params: {
                        'collectionStr': ''
                    },
                    filters: {
                        mime_types: [ //只允许上传图片
                            { title: "Image files", extensions: "jpg,jpeg,png,JPG,JPEG,PNG" }
                        ],
                        max_file_size: '50mb', //最大只能上传50mb的文件
                        prevent_duplicates: false //不允许选取重复文件
                    }
                });
                uploader.init();
                uploader.bind('FilesAdded', function(uploader, files) {
                    if (files[0].name.length > 100) {
                        uploader.removeFile(files[0]);
                        layer.msg("文件名称不能超过100字符！");
                        return;
                    }
                    //如果添加的文件在文件列表里已经存在 则更新文件(移除旧文件)
                    if (uploader.files.length > 0) {
                        var isHave = false;
                        for (x in uploader.files) {
                            if (uploader.files[x].fileType == fileType) {
                                fileTypes.push(fileType);
                                files[0].fileType = fileType;
                                fileTypes.splice(x, 1);
                                uploader.removeFile(uploader.files[x]);
                                isHave = true;
                            }
                        }
                        if (!isHave) {
                            fileTypes.push(fileType);
                            files[0].fileType = fileType;
                        }
                    } else {
                        fileTypes.push(fileType);
                        files[0].fileType = fileType;
                    }
                    ECS.showLoading();
                    uploader.start();
                });
                uploader.bind('FileUploaded', function(uploader, file, responseObject) {
                    if (pageMode == PageModelEnum.NewAdd) {
                        //附件实体封装
                        var obj = {};
                        obj.fileId = responseObject.response;
                        obj.fileName = file.name;
                        obj.fileType = file.fileType;
                        attaArray.push(obj);
                    }
                    if (pageMode == PageModelEnum.Edit) {
                        var isHave = false;
                        for (x in attaArray) {
                            if (attaArray[x].fileType == file.fileType) {
                                attaArray[x].fileId = responseObject.response;
                                attaArray[x].fileName = file.name;
                                isHave = true;
                            }
                        }
                        if (!isHave) {
                            var obj = {};
                            obj.fileId = responseObject.response;
                            obj.fileName = file.name;
                            obj.fileType = file.fileType;
                            obj.careVehId = $("#careVehId").val();
                            attaArray.push(obj);
                        }
                    }
                });
                uploader.bind('UploadComplete', function(uploader, files) {
                    page.logic.previewImage(files[0], function(imgsrc) {
                        $("#idCardBtn").hide();
                        $("#view1").show();
                        $(".close").show();
                        $('#view1').empty();
                        $('#view1').append('<img id="img1' + '" src="' + imgsrc + '" />');
                    });
                    if(attaArray.length>0){
                        $("#personnelPhotoPath").val(attaArray[0].fileId);
                        $("#personnelPhotoPath").closest(".form-group").removeClass("has-error");
                        $("#personnelPhotoPath").next("#personnelPhotoPath-error").remove();
                    }else{
                        $("#personnelPhotoPath").val("");
                    }
                    ECS.hideLoading();
                });
                uploader.bind('Error', function(uploader, errObject) {
                    if (errObject.code == -600) {
                        layer.msg("上传文件不能大于50MB！");
                        return;
                    }
                    errObject.file.status = 2;
                    layer.msg(JSON.parse(errObject.response).collection.error.message);
                });
			},
			 //删除附件
			 delAtt: function(id) {
                $("#view1 img").remove();
                $("#view1").hide();
                $(".close").hide();
                $("#idCardBtn").show();
                for (x in uploader.files) {
                    if (uploader.files[x].fileType == 1) {
                        fileTypes.splice(x, 1);
                        uploader.files.splice(x, 1);
                        break;
                    }
                }
                $("#personnelPhotoPath").val("");
                page.logic.formValidates();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
            },
            previewImage: function(file, callback) {
                if (!file || !/image\//.test(file.type)) return; //确保文件是图片
                if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
                    var fr = new mOxie.FileReader();
                    fr.onload = function() {
                        callback(fr.result);
                        fr.destroy();
                        fr = null;
                    };
                    fr.readAsDataURL(file.getSource());
                } else {
                    var preloader = new mOxie.Image();
                    preloader.onload = function() {
                        preloader.downsize(300, 300); //先压缩一下要预览的图片,宽300，高300
                        var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
                        callback && callback(imgsrc); //callback传入的参数为预览图片的url
                        preloader.destroy();
                        preloader = null;
                    };
                    preloader.load(file.getSource());
                }
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