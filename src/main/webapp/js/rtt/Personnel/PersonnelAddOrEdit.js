var addUrl = ECS.api.rttUrl + '/personnel';
var getSingleUrl = ECS.api.rttUrl + '/personnel';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var teamIDUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamName';//所属救援队伍
var teamTypeUrl = ECS.api.rttUrl + '/personnel/getTeamTypeEnumList';//人员类型
var workStatusUrl = ECS.api.rttUrl + '/personnel/getWorkStatusEnumList';  //状态
var getUserUrl = ECS.api.bcUrl + '/user';  //获取人员信息
var uploadAttrUrl = ECS.api.rttUrl + '/personnel/uploadFile';//照片上传
var updateUrl = ECS.api.rttUrl + '/personnel/downloadFile';//照片下载
var pageMode = PageModelEnum.NewAdd;
window.ownDetail;
window.pageLoadMode = PageLoadMode.None;
var uploader; //上传组件实例
var fileType; //附件类型
var validate; //验证实例
var fileTypes = new Array();
var attaArray = new Array(); //附件实体封装
var status = 0;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.initWorkStatus();//状态
            page.logic.initTeamType();//人员类型
            page.logic.upload();//照片上传
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(单选)",PageModelEnum.Details);
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
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                        ECS.ui.getCombobox("orgIds", riskAreaTypeNameUrl, {
                            selectFirstRecord:true,
                            keyField: "orgCode",
                            codeField:"orgId",
                            valueField: "orgSname",
                            async:false
                        },null,page.logic.initTeamName);
                        $("#orgIds").attr("disabled",false);
                    }else{
                       page.logic.cbxDrtDept(ECS.sys.Context.SYS_ENTERPRISE_CODE);
                    }
                    page.logic.initTeamName(); //所属救援队伍
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#crtUserDept").val(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    var myDate = new Date;
                    var year = myDate.getFullYear();//获取当前年
                    var yue = myDate.getMonth()+1;//获取当前月
                    var date = myDate.getDate();//获取当前日
                    $("#crtDate").val(year+"-"+yue+"-"+date);
                    return;
                }else{
                    $("#orgIds").attr("disabled",true);
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.personnelID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        if(data.personnelPhotoPath){
                            $("#idCardBtn").hide();
                            $("#view1").show();
                            $(".close").show();
                            $("#view1").html('<img id="img1" src="'+updateUrl+'?fileId='+data.personnelPhotoPath+'">');
                        }
                        ECS.form.setData('AddOrEditModal', data);
                        page.logic.cbxDrtDept(data.orgEntitySet[0].orgEntity.orgCode); //企业名称
                        ECS.ui.getCombobox("teamID", teamIDUrl+"&oid="+data.orgEntitySet[0].orgID, {
                            selectValue: data.teamID,
                            keyField: "ID",
                            valueField: "NAME",
                            async:false
                        });

                        //职务
                        var personnelJobList="";
                        for(var i=0;i<data.personnelJobList.length;i++){
                            if(i==0){
                                personnelJobList+=data.personnelJobList[i];
                            }else{
                                personnelJobList+=","+data.personnelJobList[i];
                            }
                        }
                        $("#personnelJob").val(personnelJobList);
                        $("#crtDate").val(ECS.util.DateRender(data.crtDate));
                        $("#inUse").iCheck('update');
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //企业名称
            cbxDrtDept:function(selCode){
                $("#orgIds").attr("disabled",true);
                ECS.ui.getCombobox("orgIds", riskAreaTypeNameUrl, {
                    selectValue: selCode,
                    keyField: "orgCode",
                    codeField:"orgId",
                    valueField: "orgSname",
                    async:false
                },null,page.logic.initTeamName);
            },
            /**
             * 所属救援队伍
             */
            initTeamName: function () {
                //清空选中的人员信息
                window.ownDetail="";
                $("#personnelName").val("");
                $("#personnelSexName").val("");
                $("#personnelBirthday").val("");
                $("#personnelMobile").val("");
                $("#personnelPhone").val("");
                $("#personnelJob").val("");
                $("#teamTypeName").val("");
                $("#userLvlName").val("");
                $("#userId").val("");
                var pid="";//获取的是id
                if($("#orgIds").find("option:selected").attr("code")){
                    pid=$("#orgIds").find("option:selected").attr("code");
                }else{
                    pid="";
                }
                ECS.ui.getCombobox("teamID", teamIDUrl+"&oid="+pid, {
                    keyField: "ID",
                    valueField: "NAME",
                    async:false
                });
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
             * 状态
             */
            initWorkStatus: function () {
                ECS.ui.getCombobox("personnelWorkStatus", workStatusUrl, {
                    selectValue: 0
                });
            },
            /**
             * 人员类型
             */
            initTeamType: function () {
                ECS.ui.getCombobox("teamType", teamTypeUrl, {
                    selectValue: 0
                });
            },
            //人员选择
            selectOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "orgCode":$("#orgIds").val(),
                            "userInfo":{
                                "userID":$("#userId").val(),
                                "userName":$("#personnelName").val()
                            }
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        $("#userId").val(window.ownDetail);
                        if(window.ownDetail){
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
                                    $("#personnelName").val(data.userName);
                                    $("#personnelSexName").val(data.userSexName);
                                    $("#personnelBirthday").val(ECS.util.DateRender(data.userBirthday));
                                    $("#personnelMobile").val(data.userMobile);
                                    $("#personnelPhone").val(data.userPhone);
                                    $("#personnelJob").val(data.dutys);
                                    $("#teamTypeName").val(data.userNature);
                                    $("#userLvlName").val(data.userLvl);
                                },
                                error: function (result) {
                                    ECS.hideLoading();
                                    var errorResult = $.parseJSON(result.responseText);
                                    layer.msg(errorResult.collection.error.message);
                                }
                            });
                        }
                    }
                })
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                var datas={};
                var orgEntitySet=[];
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    orgEntitySet.push({orgID:$("#orgIds").find("option:selected").attr("code")});
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    orgEntitySet.push({personnelID:$("#personnelID").val(),orgID:$("#orgIds").find("option:selected").attr("code")});
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                datas["orgEntitySet"]=orgEntitySet;
                datas["teamID"]=data.teamID;
                datas["teamType"]=data.teamType;
                datas["personnelWorkStatus"]=data.personnelWorkStatus;
                datas["userId"]=data.userId;
                datas["personnelID"]=data.personnelID;
                datas["crtUserName"]=data.crtUserName;
                datas["crtUserDept"]=data.crtUserDept;
                datas["crtDate"]=data.crtDate;
                datas["personnelPhotoPath"]=data.personnelPhotoPath;
                datas["inUse"]=data.inUse;
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:JSON.stringify(datas),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    },
                    error: function (result) {
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
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        orgIds: {
                            required: true
                        },
                        personnelName: {
                            required: true
                        },
                        teamID: {
                            required: true
                        },
                        teamType: {
                            required: true
                        },
                        personnelPhotoPath: {
                            required: true
                        },
                        personnelWorkStatus: {
                            required: true
                        }
                    }
                });
            },
            formValidates: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    ignore:"",
                    rules: {
                        personnelPhotoPath: {
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