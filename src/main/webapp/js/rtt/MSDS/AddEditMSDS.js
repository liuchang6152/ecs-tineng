var addUrl = ECS.api.rttUrl + '/msds';                                     //保存(新增 or 编辑)
var riskTypeUrl = ECS.api.rttUrl + "/riskType/getList";                  //危险性类别下拉菜单
var addChildUrl = ECS.api.rttUrl + "/msdsFrimAtb/getForAdd";            //新增模式下，动态添加主属性菜单列表
var delFileUrl = ECS.api.rttUrl + "/msds/deleteFile";              //删除附件接口
var getSingleUrl = ECS.api.rttUrl + '/msds/findOne';                     //获取当前的编辑数据展示
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';              //企业名称
var FileDownLoadUrl = ECS.api.rttUrl + "/structuredplanfile/downloadFile";   //下载接口
var getMsdsTotalTypeUrl = ECS.api.rttUrl + "/msds/getMsdsTotalTypevalue";   //下载接口
var orgId = "";                                                              //企业id的存储
var msdsId = "";                                                             //危化品id
var save_once = false;                                                      //确保保存一次；
var pageMode = PageModelEnum.NewAdd;                                                          //页面模式
window.pageLoadMode = PageLoadMode.None;
var grid = null;                                                                                 //grid对象
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();                    //mini组件初始化
            this.bindUI();                   //绑定事件
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            //文件上传组件部分  start--------
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
                server: ECS.api.rttUrl+"/msds/uploadFile",
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: '#uploadPlaceholder',
                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                resize:true,
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
                var oTrigger_repeat_btn = true,
                    aCur_files = grid.getData(),//附件列表
                    oCur_row = null;
                //判断当前上传的文件是否存在于已上传的文件列表当中；
                if(aCur_files.length>0){
                    for(var i=0;i<aCur_files.length;i++){
                        if (file.name==aCur_files[i].atchName){
                            oCur_row = aCur_files[i];
                            oTrigger_repeat_btn = false;
                            break;
                        }
                    }
                }
                //若列表里没有此文件，那么将此文件添加到列里来
                var size = bytesToSize(file.size);
                if(oTrigger_repeat_btn){
                    var row = { fileId: file.id, atchName: file.name, type: file.ext, size: size, status: "等待上传" };
                    grid.addRow(row);
                }else{
                    //若列表里存在此文件，那么进行更新该文件的相关数据；
                    var oCurUpdate_dt = { fileId: file.id, atchName: file.name, type: file.ext, size: size, status: "等待上传" };
                    grid.updateRow(oCur_row,oCurUpdate_dt);
                }
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
                console.log("服务端返回的数据:",response);
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
                } else if(type == "F_EXCEED_SIZE"){
                    mini.alert("上传的该文件大小超过了最大限制50M,无法上传");
                }
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
                //真实删除
                // page.logic.DeleteFile([row],function(){
                    grid.removeRow(row);
                // });
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
        },
        data:{},
        logic: {
            /**
             * 保存
             */
            save: function () {
                if(save_once){
                    layer.msg("正在保存！");
                }
                //校验其它字段；
                page.logic.formValidate();
                //如果校验不通过，不再往下执行
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                //校验危化品中文名，只能输入中文；
                var Re_chinese_font = /^([\u4e00-\u9fa5]?[0-9]?)+(_?\s?[\u4e00-\u9fa50-9]{0,})+$/;
                if (!Re_chinese_font.test($("#msdsChineseName").val())) {
                    layer.msg('"危化品中文名"只能输入汉字以及下划线和空格！');
                    return;
                }
                //校验危化品英文名，只能输入英文；
                var Re_english_font = /^[a-zA-Z]+(_?\s?[a-zA-Z]{0,})+$/;
                if (!Re_english_font.test($("#msdsEnglishName").val())) {
                    layer.msg('"危化品英文名"只能输入字母以及下划线和空格！');
                    return;
                }
                //校验危险性类别，不可为空；
                if(mini.get("riskType").getValue()=="" || mini.get("riskType").getValue()=="请选择"){
                    layer.msg('"危险性类别"不可为空！');
                    return;
                }

                var data = {};
                //处理数据
                //基本参数数据拼接-------------------------
                data["msdsId"] = $("#msdsId").val();                                    //危化品ID
                data["orgId"] = orgId;                                                   //应急预案所属企业id;
                data["msdsChineseName"] = $("#msdsChineseName").val();                //危化品中文名
                data["msdsEnglishName"] = $("#msdsEnglishName").val();                //危化品英文名
                data["msdsAliasName"] = $("#msdsAliasName").val();                     //危化品别名
                data["casno"] = $("#casno").val();                                       //cas no
                data["materialCode"] = $("#materialCode").val();                       //物料编码
                data["riskType"] = mini.get("riskType").getValue();                     // 危险性类别
                data["attachIds"] = "";     //附件id集合
                //附件列表数据拼接-------------------------
                var aFile = grid.getData();   //附件列表
                if(aFile.length>0){
                    var attachID_dt = [];       //附件（数据格式为数组）
                    for(var w=0;w<aFile.length;w++){
                        if(aFile[w]["atchID"]){
                            attachID_dt.push(aFile[w]["atchID"]);
                        }
                    }
                    if(attachID_dt.length>0){
                        data["attachIds"] = attachID_dt.join(",");
                    }
                }
                // else{
                //     layer.msg("请至少选择一个文件上传，您目前没有选择文件，无法进行保存！");
                //     return;
                // }
                //动态数据拼接-----------------------------
                data["msdsTotalTypeValue"] = "[";
                var aModel_box = $("#ChildAttr_list").find(".model_box");
                for(var w=0;w<aModel_box.length;w++){
                    var one_dt = {};
                    var sbig_t = $(aModel_box[w]).find(".row").eq(0).text();
                    one_dt["mainParam"] = sbig_t.substring(0,sbig_t.length-1);   //标题
                    //该标题下对应的字段
                    one_dt["subparams"] = "[";
                    var aTextArea = $(aModel_box[w]).find("textarea");
                    for(var m=0;m<aTextArea.length;m++){
                        (function(cur_obj,index){
                            var per_dt = {};
                            var small_t = $(cur_obj).parents(".form-group").find("div").eq(0).html();   //键位
                            per_dt["k"]=small_t.substring(0,small_t.length-1);
                            per_dt["v"]=$(cur_obj).val();
                            if(index==aTextArea.length-1){
                                one_dt["subparams"]+=JSON.stringify(per_dt);
                            }else{
                                one_dt["subparams"]+=JSON.stringify(per_dt)+",";
                            }
                        })(aTextArea[m],m);
                    }
                    one_dt["subparams"] += "]";
                    if(w==aModel_box.length-1){
                        data["msdsTotalTypeValue"]+=JSON.stringify(one_dt);
                    }else{
                        data["msdsTotalTypeValue"]+=JSON.stringify(one_dt)+",";
                    }
                }
                data["msdsTotalTypeValue"] += "]";
                //删除废数据
                delete data.enterpriseCode;
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                save_once = true;
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        var result = JSON.parse(data);    //序列化语句；
                        if(result.isSuccess){
                            layer.msg(result.message,{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        }else{
                            layer.msg(result.message);
                        }
                    }, error: function (result) {
                        console.log("错误返回的信息：",result);
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //附件下载通道设置---------
            file_download:function(e){
                if(e.record.atchPath){
                    return '<a href="'+FileDownLoadUrl+'?atchPath='+e.record.atchPath+'&atchName='+e.record.atchName+'" class="ml__5">'+e.record.atchName+'</a>';
                }else{
                    return '<a href="javascript:;" class="ml__5">'+e.record.atchName+'</a>';
                }
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                msdsId = data.msdsId;      //危化品id存储
                //若是新增模式下
                if (pageMode == PageModelEnum.NewAdd) {
                    page.logic.select_option(riskAreaTypeNameUrl,"#enterpriseCode");    //企业名称（树级菜单）
                    //危险性类别下拉菜单
                    page.logic.danger_menu(function(){
                        mini.get("riskType").setValue("请选择");
                    });
                    page.logic.add_get_structure();                                         //渲染子属性列表结构

                    $.ajax({
                        url: getMsdsTotalTypeUrl + "?orgID=" + 30650700 + "&now=" + Math.random(),
                        type: "get",
                        async: true,
                        dataType: "json",
                        success: function (data) {
                            //子属性列表渲染
                            page.logic.render_childAttr_list(data);
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "?msdsId=" + data.msdsId + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                         ECS.form.setData('AddOrEditModal', data);
                        // $("#msdsChineseName").attr("disabled","disabled");
                        //企业名称
                        page.logic.select_option(riskAreaTypeNameUrl,"enterpriseCode",function(){
                            orgId = data.orgId;                                    //企业id存储
                            mini.get("enterpriseCode").setValue(data.orgSname); //填充企业名称
                        });  //企业名称（树级菜单）

                        //危险性类别下拉菜单
                        page.logic.danger_menu(function(){
                         //设置危险性类别的默认值；
                            var category_default_val = "";
                            for(var x=0;x<data["riskTypeEntityList"].length;x++){
                                (function(cur_dt){
                                    if(x==data.riskTypeEntityList.length-1){
                                        category_default_val+=cur_dt.riskTypeId;
                                    }else{
                                        category_default_val+=cur_dt.riskTypeId+",";
                                    }
                                })(data.riskTypeEntityList[x]);
                            }
                            mini.get("riskType").setValue(category_default_val);
                        });
                        //子属性列表渲染
                        page.logic.render_childAttr_list(data["msdsTotalTypeValueForEdit"]);
                        //附件列表-------------------------------------
                        if(data.attachmentEntities){
                            //附件的数据处理
                            var aFile_list = [];
                            for(var n=0;n<data.attachmentEntities.length;n++){
                                (function(cur_key){
                                    var one_file = {};
                                    one_file.atchName = cur_key.atchName;             //附件名称
                                    one_file.atchPath = cur_key.atchPath;             //附件路径
                                    one_file.atchID = cur_key.atchID;                 //附件id
                                    one_file.type = cur_key.atchName.split(".")[1];   //附件类型
                                    //文件大小
                                    if((cur_key.atchSize/1024).toFixed(1)>1024){
                                        var iSize = (cur_key.atchSize/1024).toFixed(1);
                                        one_file.size = (iSize/1024).toFixed(1)+"Mb";            //文件大小
                                    }else{
                                        one_file.size = (cur_key.atchSize/1024).toFixed(1)+"Kb";  //文件大小
                                    }
                                    one_file.action = "ok";                           //文件这一行的删除按钮展示；
                                    one_file.status = "上传成功";                     //上传状态
                                    aFile_list.push(one_file);                         //存储文件的数据；
                                })(data.attachmentEntities[n]);
                            }
                            //附件列表的数据展示
                            grid.addRows(aFile_list);
                            //若是详情模式下，那么
                            if(pageMode == PageModelEnum.View){
                                //所有的表单设置为不可用状态；
                                page.logic.disable_all();
                            }
                        }

                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //将弹框上所有的表单全部设置为不可用状态，仅仅供查看；
            disable_all:function(){
                mini.get("enterpriseCode").disable();                    //企业名称设置为不可用；
                $("#msdsChineseName").attr("disabled","disabled");    //危化品中文名不可用
                $("#msdsEnglishName").attr("disabled","disabled");    //危化品英文名不可用
                $("#msdsAliasName").attr("disabled","disabled");      //化学品别名不可用
                $("#casno").attr("disabled","disabled");               //CAS NO 不可用
                $("#materialCode").attr("disabled","disabled");       //物料编码 不可用
                mini.get("riskType").disable();                         //危险性类别 不可用
                //所有的动态主属性  不可用；
                $("#ChildAttr_list").find("textarea").attr("disabled","disabled");
                $("#btnSave").hide();   //隐藏保存按钮；
                //删除上传控件
                $("#uploadPlaceholder").remove();
                //将上传按钮置灰
                $("#beginBtn").css({
                    "background":"#ccc",
                    "color":"white"
                });
            },
            DeleteFile:function(row_arr,cb){
                var Ids_array = [];
                for(var w=0;w<row_arr.length;w++){
                    Ids_array.push(row_arr[w].atchID);
                }
                ECS.showLoading();      //提示加载，正在操作中
                $.ajax({
                    url: delFileUrl,
                    async: false,
                    data: JSON.stringify(Ids_array),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    type: 'DELETE',
                    success: function (result) {
                        ECS.hideLoading();     //隐藏加载
                        if (result.indexOf('collection') < 0) {
                            layer.msg("删除成功！");
                            cb && cb();
                        } else {
                            result = JSON.parse(result)
                            layer.msg(result.collection.error.message)
                        }
                    },
                    error: function (result) {
                        ECS.hideLoading();     //隐藏加载
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //新增模式下获取数据
            add_get_structure:function(cb){
                $.ajax({
                    url:addChildUrl,
                    type:"get",
                    success:function (data) {
                        page.logic.render_childAttr_list(data,cb);
                    }
                })
            },
            //动态加载主属性列表结构
            render_childAttr_list:function(data,cb){
                $("#ChildAttr_list").html("");      //清空属性列表
                for(var i=0;i<data.length;i++){
                    if(data[i]["subparams"].length==0){
                        continue;
                    }
                    (function(cur_dt){
                        //创建盒子
                        var oPar_box = $('<div class="model_box"></div>');
                        $("#ChildAttr_list").append(oPar_box);
                        //创建某一父属性一级标题盒子
                        var oPar_title = $('<div class="row">' +
                            '<div class="col-xs-2 control-label" style="padding-right:0px;">'+cur_dt["mainParam"]+'：</div>'+
                            '</div>'+
                            '<div class="row">'+
                            '<div class="col-xs-1"></div>'+
                            '<div class="col-xs-11" style="height: 1px; background: #CCCCCC; margin:10px 0px;"></div>'+
                            '</div>'
                        );
                        $(oPar_box).append(oPar_title);      //加载进来标题
                        //创建某一父属性下的子属性列表
                        var att_list = cur_dt["subparams"];
                        var oRow_one = null;
                        for(var w=0;w<att_list.length;w++){
                            if(w%2==0){
                                oRow_one = $('<div class="row"></div>');     //重建属性父盒子变量
                                oPar_box.append(oRow_one);
                                var oLeft_att_box = $('<div class="col-xs-6">' +
                                    '<div class="form-group">' +
                                    '<div class="col-xs-4 control-label">'+att_list[w]["k"]+'：</div>' +
                                    '<div class="col-xs-8">' +
                                    '<textarea style="width:100%;height:100px;" cols="30" rows="10">'+att_list[w]["v"]+'</textarea>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>');
                                oRow_one.append(oLeft_att_box);
                            }else{
                                var oRight_att_box = $('<div class="col-xs-6">' +
                                    '<div class="form-group">' +
                                    '<div class="col-xs-4 control-label">'+att_list[w]["k"]+'：</div>' +
                                    '<div class="col-xs-8">' +
                                    '<textarea style="width:100%;height:100px;" cols="30" rows="10">'+att_list[w]["v"]+'</textarea>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>');
                                oRow_one.append(oRight_att_box);
                                oRow_one = null;        //释放属性父盒子变量
                            }
                        }
                    })(data[i]);
                }
                cb && cb();
            },
            //危险性类别  （多选）
            danger_menu:function(cb){
                $.ajax({
                    url:riskTypeUrl,
                    type:"get",
                    success:function (data) {
                        mini.get("riskType").load(data);     //加载下拉菜单的数据
                        cb && cb();
                    }
                });
            },
            //危险性类别多选下拉框，点击关闭清空值
            onCloseClick:function(e) {
                var obj = e.sender;
                obj.setText("");
                obj.setValue("");
            },
            //企业名称下拉菜单数据的加载
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //企业
                        mini.get("enterpriseCode").loadList(data,"orgId","orgPID");
                        //若是总部用户，那么可用；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                            orgId = mini.get("enterpriseCode").data[0].orgId;                                      //存储企业的id;
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
                        msdsChineseName: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        msdsEnglishName: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        msdsAliasName: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        casno: {
                            required: true,
                            rangelength: [0, 100]
                        },
                        materialCode:{
                            required: true,
                            rangelength: [0, 100]
                        }
                    }
                });
            }
        }
    }
    page.init();
    window.page = page;
})