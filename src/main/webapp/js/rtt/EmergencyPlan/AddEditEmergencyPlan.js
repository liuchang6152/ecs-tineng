var addUrl = ECS.api.rttUrl + '/emergencyPlan';                                                //保存(新增 or 编辑)
var getSingleUrl = ECS.api.rttUrl + '/emergencyPlan/oneEmergencyPlan';                      //获取当前的编辑数据展示
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';                         //企业名称
var PlanDefinition_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanDefinition";   //预案定义
var PlanLevel_url = ECS.api.rttUrl+"/emergencyPlan/enum?enumName=PlanLevel";              //预案层级
var Category_url = ECS.api.bcUrl+"/accidentCategory/list";                                  //预案分类(事故大类)
var Category_url2 = ECS.api.rttUrl+"/emergencyPlan/accidentType";                          //预案类型（事故小类）
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";                                    //根据企业code获取企业id;
var FileDownLoadUrl = ECS.api.rttUrl + "/structuredplanfile/downloadFile";                //下载接口
var orgId = "";                                                                                  //企业id的存储                                                                             //企业id;
var save_once = false;                            //确保保存一次；
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var grid = null;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();                    //mini组件初始化
            this.bindUI();                   //绑定事件
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            //文件上传组件部分  start-----------------------
            grid = mini.get("grid1");
            grid.on("drawcell", function (e) {
                var field = e.field;
                var record = e.record;
                var uid = record._uid;
                var value = e.value;
                if (field == "status") {
                    if (record.status == "等待上传") {
                    } else if (record.status == "已完成") {
                    } else if (record.status == "上传成功") {
                    } else {
                        e.cellHtml = '<div class="progressbar">'
                            + '<div class="progressbar-percent" style="width:' + value + '%;"></div>'
                            + '<div class="progressbar-label">' + value + '%</div>'
                            + '</div>';
                    }
                }
                if (field == "action") {
                    if (record.action == "ok") {
                        e.cellHtml = '<a class="upicon-remove" name="' + uid + '"><a>';
                    }
                }
            });
            var uploader = WebUploader.create({
                //swf文件路径
                swf:'../../../lib/webuploader/swfupload.swf',
                // 文件接收服务端。
                server: ECS.api.rttUrl+"/emergencyPlan/upLoad",
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: '#uploadPlaceholder',
                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                resize: false,
                // 自动上传
                auto: true,
                // 文件上传参数表，用来标记文件的所有者（如果是一篇文章的附件，就是文章的ID）
                formData: {
                    owner: 'webuploader.webuploader'
                },
                fileVal: 'file',
                // 单个文件大小限制（单位：byte），这里限制为 50M
                fileSingleSizeLimit: 50 * 1024 * 1024
            });
            // 添加到上传队列
            uploader.on('fileQueued', function (file) {
                var size = bytesToSize(file.size);
                var row = { fileId: file.id, atchName: file.name, type: file.ext, size: size, status: "等待上传" };
                grid.addRow(row);
            });
            uploader.on('uploadProgress', function (file, percentage) {
                var row = grid.findRow(function (row) {
                    if (row.fileId == file.id) return true;
                })
                grid.updateRow(row, { status: percentage });
            });
            //此处有repsonse接收服务端返回来的数据；我用atchID字段存储；
            uploader.on('uploadSuccess', function (file,response) {
                var row = grid.findRow(function (row) {
                    if (row.fileId == file.id) return true;
                });
                grid.updateRow(row, { status:"上传成功",action:"ok",atchID:response});
            });
            uploader.on('uploadError', function (file, reason) {
                var row = grid.findRow(function (row) {
                    if (row.fileId == file.id) return true;
                })
                grid.updateRow(row, { status: "上传出错" });
            });
            // 不管上传成功还是失败，都会触发 uploadComplete 事件
            uploader.on('uploadComplete', function (file) {
                uploader.removeFile(file, true);
            });
            // 当开始上传流程时触发
            uploader.on('startUpload', function () {
                mini.get("beginBtn").setEnabled(false);
            });
            // 当所有文件上传结束时触发
            uploader.on('uploadFinished', function () {
                mini.get("beginBtn").setEnabled(true);
            });
            uploader.on('error', function (type, arg, file) {
                if (type == "Q_TYPE_DENIED") {
                    mini.alert("请上传正确格式文件");
                } else if (type == "Q_EXCEED_SIZE_LIMIT") {
                    mini.alert('文件[' + file.name + ']大小超出限制值');
                }
                //else if(type == "Q_EXCEED_SIZE") {
                //     mini.alert('文件[' + file.name + ']大小超出限制50M');
                // }
                else if(type == "F_EXCEED_SIZE"){
                    mini.alert("上传的该文件大小超过了最大限制50M,无法上传");
                }
                // }else{
                //     mini.alert("上传出错！请检查后重新上传！错误代码" + type);
                // }
            });
            function bytesToSize(bytes) {
                if(bytes === "空") return "空";
                if (bytes === 0) return '0 B';
                var k = 1024,
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));

                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            }
            $(document.body).on("click", ".upicon-remove", function (e) {
                //当为详情状态，不可点击
                if(pageMode == PageModelEnum.View){
                    return false;
                }
                var uid = $(this).attr("name");
                var row = grid.getRowByUID(uid);
                grid.removeRow(row);
            })
            //文件上传组件部分  end-------------------------------------
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //点击保存按钮，进行数据保存；
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，关闭弹框；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //预案分类选择以后，联动预案类型；
            $("#accidentCategoryID").on("change",function(){
                //联动预案类型----
                page.logic.category_menu2();                                     //预案类型（事故小类）
            });
        },
        data:{
            plandefinition_dt:{"0":"综合预案","1":"专项预案","2":"现场处置预案"},                //预案定义
            planlevel_dt:{"0":"中国石化级","1":"直属企业级","2":"二级单位级","3":"基层单位级"}   //预案层级
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                if(save_once){
                    layer.msg("正在保存！");
                }
                //校验其它字段；
                // page.logic.formValidate();
                // if (!$('#AddOrEditModal').valid()) {
                //     return;
                // }
                //预案名称检测；
                var Re_case_font = /^[0-9a-zA-Z\u4e00-\u9fa5]+(_?\s?[0-9a-zA-Z\u4e00-\u9fa5]{0,})+$/;
                if (!Re_case_font.test($("#emergencyPlanName").val())) {
                    layer.msg('"预案名称"只能输入中英文以及下划线或者空格！');
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                //处理数据
                data.orgID = orgId;                   //应急预案所属企业id;
                //预案分类
                if($("#accidentCategoryID").val()==-1){
                    layer.msg("请选择预案分类");
                    return;
                }else{
                    data.accidentCategoryID = $("#accidentCategoryID").val();
                }
                var accidentTypeID = "";
                //预案类型（数据格式为数组）
                if($.trim(mini.get("accidentTypeID").getValue())=="" || $.trim(mini.get("accidentTypeID").getValue())=="请选择"){
                    layer.msg("请选择预案类型");
                    return;
                }else{
                    var aType_list = mini.get("accidentTypeID").getSelecteds();
                    var accidentTypeID_dt = [];
                    for(var a=0;a<aType_list.length;a++){
                        accidentTypeID_dt.push(aType_list[a].accidentTypeID);
                    }
                    if(accidentTypeID_dt.length>0){
                        accidentTypeID = accidentTypeID_dt.join(",");
                    }else{
                        accidentTypeID = "";
                    }
                }

                var aFile = grid.getData();     //附件列表
                var atchID = "";                //附件id集合
                if(aFile.length>0){
                    var attachID_dt = [];       //附件（数据格式为数组）
                    for(var w=0;w<aFile.length;w++){
                        if(aFile[w]["atchID"]){
                            attachID_dt.push(aFile[w]["atchID"]);
                        }
                    }
                    if(attachID_dt.length>0){
                        atchID = attachID_dt.join(",");
                    }else{
                        atchID = "";
                    }
                    if(atchID==""){
                        layer.msg("您正在上传文件，请稍后进行保存！");
                        return;
                    }
                }else{
                    layer.msg("请至少选择一个文件上传，您目前没有选择文件，无法进行保存！");
                    return;
                }
                //删除废数据
                delete data.enterpriseCode;
                delete data.file;
                delete data.crtDate;
                delete data.crtUserName;
                delete data.atchID;
                delete data.accidentTypeID;

                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                ECS.showLoading();    //进行加载；
                save_once = true;

                $.ajax({
                    url: addUrl+"?accidentTypeID="+accidentTypeID+"&atchID="+atchID,
                    async: false,
                    type: ajaxType,
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        ECS.hideLoading();
                        var result = JSON.parse(data);
                        console.log("返回的信息：",result.message);
                        if(result.isSuccess){
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        }else{
                            layer.msg(result.message);
                        }
                    }, error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        console.log("返回的错误信息：",errorResult);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //获取企业id;
            GetOrgId:function(cb){
                $.ajax({
                    url:getOrgIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        orgId = Data.orgId;                   //存储企业id;
                        cb && cb();
                    }
                });
            },
            //附件下载通道设置---------
            file_download:function(e){
                  return '<a href="'+FileDownLoadUrl+'?atchPath='+e.record.atchPath+'&atchName='+e.record.atchName+'" class="ml__5">'+e.record.atchName+'</a>';
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;

                $("#enterpriseCode input").css("color","#555555");    //企业名称的字体色设置；

                //若是新增模式下
                if (pageMode == PageModelEnum.NewAdd) {
                    //企业名称（树级菜单）
                    page.logic.select_option(riskAreaTypeNameUrl,"enterpriseCode",function(){
                        // page.logic.GetOrgId();     //根据企业code查询企业id;
                    });
                    page.logic.planDefinition_menu();                                     //预案定义
                    page.logic.planLevel_menu();                                          //预案层级
                    //预案分类（事故大类）
                    page.logic.category_menu(function(){
                        mini.get("accidentTypeID").setValue("请选择");
                        // page.logic.category_menu2();                                     //预案类型（事故小类）
                    });
                    //登记人
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    //登记时间
                    var myDate = new Date,           //时间对象
                        year = myDate.getFullYear(),  //获取当前年
                        yue = myDate.getMonth()+1,    //获取当前月
                        date = myDate.getDate();      //获取当前日
                    $("#crtDate").val(year+"-"+yue+"-"+date);
                    return;
                }
                //若是编辑模式下，预案名称和企业名称不可编辑
                if (pageMode == PageModelEnum.Edit) {
                    // $("#emergencyPlanName").attr('disabled','disabled');      //预案名称不可用；
                    $("#enterpriseCode").attr('disabled','disabled');         //企业名称不可用
                }

                //若是详情模式下，那么
                if(pageMode == PageModelEnum.View){
                    //所有的表单设置为不可用状态；
                    page.logic.disable_all();
                }
                $.ajax({
                    url: getSingleUrl + "?emergencyPlanID=" + data.emergencyPlanID + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        ECS.form.setData('AddOrEditModal', data);
                        //企业名称
                        page.logic.select_option(riskAreaTypeNameUrl,"enterpriseCode",function(){
                            orgId = data.orgID;                                    //企业id存储
                            mini.get("enterpriseCode").setValue(data.orgSname); //填充企业名称
                        });  //企业名称（树级菜单）
                        //预案定义
                        page.logic.planDefinition_menu(function(){
                            $("#planDefinition").val(data.planDefinition);
                        });
                        //预案层级
                        page.logic.planLevel_menu(function(){
                            $("#planLevel").val(data.planLevel);
                        });
                        //预案分类（事故大类）
                        page.logic.category_menu(function(){
                            //设置预案大类的默认值
                            $("#accidentCategoryID").val(data.accidentCategoryID);
                            //预案类型（事故小类）(多选功能)
                            page.logic.category_menu2(function(){
                                //默认设置预案类型的值；
                                var category_default_val = "";
                                if(data.accidentTypeEntity){
                                    for(var w=0;w<data.accidentTypeEntity.length;w++){
                                        (function(cur_dt){
                                            if(w==data.accidentTypeEntity.length-1){
                                                category_default_val+=cur_dt.accidentTypeID;
                                            }else{
                                                category_default_val+=cur_dt.accidentTypeID+",";
                                            }
                                        })(data.accidentTypeEntity[w]);
                                    }
                                }
                                mini.get("accidentTypeID").setValue(category_default_val);              //设置预案类型的值；
                            });
                        });
                        //附件列表-------------------------------------
                        if(data.attachmentEntities){
                            //附件的数据处理
                            var aFile_list = [];
                            for(var n=0;n<data.attachmentEntities.length;n++){
                                (function(cur_key){
                                    var one_file = {};
                                    one_file.atchName = cur_key.atchName;             //附件名称
                                    one_file.atchID = cur_key.atchID;                 //附件id
                                    one_file.type = cur_key.atchName.split(".")[1];   //附件类型；
                                    one_file.atchPath = cur_key.atchPath;             //附件atchPath
                                    //文件大小
                                    if((cur_key.atchSize/1024).toFixed(1)>1024){
                                        var iSize = (cur_key.atchSize/1024).toFixed(1);
                                        one_file.size = (iSize/1024).toFixed(1)+"Mb";            //文件大小
                                    }else{
                                        one_file.size = (cur_key.atchSize/1024).toFixed(1)+"Kb";  //文件大小
                                    }
                                    one_file.action = "ok";                                  //文件这一行的删除按钮展示；
                                    one_file.status = "上传成功";                            //上传状态
                                    aFile_list.push(one_file);                               //存储文件的数据；
                                })(data.attachmentEntities[n]);
                            }
                            //附件列表的数据展示
                            grid.addRows(aFile_list);
                        }
                        //登记时间
                        $("#crtDate").val(ECS.util.timestampToTime(data.crtDate));

                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //将弹框上所有的表单全部设置为不可用状态，仅仅供查看；
            disable_all:function(){
                $("#emergencyPlanName").attr("disabled","disabled");      //预案名称设置为不可用；
                mini.get("enterpriseCode").disable();                       //企业名称设置为不可用；
                $("#planDefinition").attr("disabled","disabled");         //预案定义设置为不可用；
                $("#planLevel").attr("disabled","disabled");              //预案层级设置为不可用；
                $("#accidentCategoryID").attr("disabled","disabled");    //预案分类设置为不可用；
                mini.get("accidentTypeID").disable();                       //预案类型设置为不可用；
                $("#remark").attr("disabled","disabled");                 //描述设置为不可用；

                //删除上传控件
                $("#uploadPlaceholder").remove();
                //将上传按钮置灰
                $("#beginBtn").css({
                    "background":"#ccc",
                    "color":"white"
                });
                //将保存按钮隐藏
                $("#btnSave").hide();
            },
            //预案类型多选下拉框，点击关闭清空值
            onCloseClick:function(e) {
                var obj = e.sender;
                obj.setText("");
                obj.setValue("");
            },
            //预案定义
            planDefinition_menu:function(cb){
                $.ajax({
                    url:PlanDefinition_url,
                    type:"get",
                    success:function (data) {
                        $("#planDefinition").html("");
                        //默认添加一条“全部”
                        var cur_init_option = '<option value="">请选择</option>';
                        $("#planDefinition").append(cur_init_option);
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+(cur_dt["key"]==null?'':cur_dt["key"])+'">'+cur_dt["value"]+'</option>';
                                $("#planDefinition").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案层级
            planLevel_menu:function(cb){
                $.ajax({
                    url:PlanLevel_url,
                    type:"get",
                    success:function (data) {
                        $("#planLevel").html("");
                        //默认添加一条“全部”
                        var cur_init_option = '<option value="">请选择</option>';
                        $("#planLevel").append(cur_init_option);
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+(cur_dt["key"]==null?'':cur_dt["key"])+'">'+cur_dt["value"]+'</option>';
                                $("#planLevel").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案分类(事故大类)
            category_menu:function(cb){
                $.ajax({
                    url:Category_url,
                    type:"get",
                    success:function (data) {
                        $("#accidentCategoryID").html("");
                        //添加其它项
                        for(var w=0;w<data.length;w++){
                            (function(cur_dt){
                                var cur_option = '<option value="'+cur_dt["accidentCategoryID"]+'">'+cur_dt["accidentCategoryName"]+'</option>';
                                $("#accidentCategoryID").append(cur_option);
                            })(data[w]);
                        }
                        cb && cb();
                    }
                });
            },
            //预案类型（事故小类）
            category_menu2:function(cb){
                if($("#accidentCategoryID").val()){
                    $.ajax({
                        url:Category_url2+"?accidentCategoryID="+$("#accidentCategoryID").val(),
                        type:"get",
                        success:function (data) {
                            mini.get("accidentTypeID").load(data);     //加载下拉菜单的数据
                            cb && cb();
                        }
                    });
                }
            },
            //企业名称下拉菜单数据的加载
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        // page.logic.clear_val();   //重置所有的条件
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //企业
                        mini.get("enterpriseCode").loadList(data,"orgId","orgPID");
                        //若是总部用户，那么可用；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                            orgId = mini.get("enterpriseCode").data[0].orgId;
                        }else{
                        //若是企业用户，设置为不可用状态；
                            mini.get("enterpriseCode").disable();
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                        orgId = cur_key.orgId;                                      //存储企业的id;
                                    }
                                })(data[w]);
                            }
                        }
                        cb && cb();
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
                    rules: {
                        name: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        sname: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        stdCode: {
                            required: true,
                            rangelength: [0, 100]
                        }
                    }
                })

            }
        }
    }
    page.init();
    window.page = page;
})