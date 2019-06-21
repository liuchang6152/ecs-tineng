//以下是需要的部分：
//结构化预案相关接口-------------------------------------------------------------
var leftMenuUrl = ECS.api.rttUrl + "/structuredplancategory";  //左侧树接口
var leftDelUrl = ECS.api.rttUrl + "/structuredplancategory";   //左侧树-删除
var aPositionList = [];     //选择人集合选择（应急职责、处置步骤，共同使用。）
var  stateUrl= ECS.api.rttUrl + "/disposalsteps/satelist";  //反馈状态
var  sendOrdersUrl= ECS.api.apUrl + "/relatedplanexecuted";  //预案下达指令
//根节点添加
var addRootUrl =  ECS.api.rttUrl + "/structuredplancategory";           //根节点添加保存
//应急职责------------------------------------------------
var dutyInintUrl = ECS.api.rttUrl + "/emergencyduties";                 //应急职责，列表渲染；
var dutyaddUrl = ECS.api.rttUrl + "/emergencyduties";                   //应急职责，新增 or 修改；
var dutydelUrl = ECS.api.rttUrl + "/emergencyduties";                   //应急职责，删除；
//处置步骤-----------------------------------------------
var DisposalInitUrl = ECS.api.rttUrl + "/disposalsteps";                           //处置步骤，列表渲染；
var DisposaladdUrl = ECS.api.rttUrl + "/disposalsteps";                            //处置步骤，新增 or 修改；
var DisposaldelUrl = ECS.api.rttUrl + "/disposalsteps";                            //处置步骤，删除
var ResponseListUrl = ECS.api.rttUrl + "/disposalsteps/feedbackMethodList";     //反馈方式下拉列表集合
//附件---------------------------------------------------
var FileInitUrl =  ECS.api.rttUrl + "/structuredplanfile";                     //附件列表初始化
var FileUploadUrl = ECS.api.rttUrl + "/structuredplanfile/uploadFile";       //附件上传接口
var FileDelUrl = ECS.api.rttUrl + "/structuredplanfile";                       //附件行删除（附件删除）
var FileAddUrl = ECS.api.rttUrl + "/structuredplanfile";                       //附件保存（新增 or 编辑）
var FileDownLoadUrl = ECS.api.rttUrl + "/structuredplanfile/downloadFile";   //下载接口
var emergencyPlanID = "";          //应急预案id
var emergencyPlanName = "";        //应急预案 name;
var grid1 = null;                   //应急职责（可操作模式）--表格
var grid2 = null;                   //处置步骤（可操作模式）--表格
var grid3 = null;                   //附件(可操作模式)--表格
var grid4 = null;                   //应急职责(可读模式)--表格
var grid5 = null;                   //处置步骤(可读模式)--表格
var grid6 = null;                   //附件(可读模式)--表格
var structuredPlanCategoryId = "";    //结构化预案类别ID;
var CurRow = null;                      //附件当前这一行；
var IsOnlyRead = false;                 //是否只读，开关； 若为true, 则表示只读；若为false, 则表示当前页面处于可操作模式；
var IsCanClick = true;                  //添加根目录是否可点击。
// mini_debugger = false;                   //取消miniui的自我调试
window.ownDetail;
var orgID = null;
var eventId;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            grid1 = mini.get("datagrid1");    //应急职责----表格（可操作模式）
            grid2 = mini.get("datagrid2");    //处置步骤----表格（可操作模式）
            grid3 = mini.get("datagrid3");    //附件----表格（可操作模式）

            grid4 = mini.get("datagrid4");    //应急职责----表格（可读模式）
            grid5 = mini.get("datagrid5");    //处置步骤----表格（可读模式）
            grid6 = mini.get("datagrid6");    //附件----表格（可读模式）

            this.bindUI();
            // ECS.sys.RefreshContextFromSYS();//获取当前用户
            // page.logic.setData();      //用于测试
            page.logic.statelist();//处置步骤反馈状态
            page.logic.statelists();//职责反馈状态
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //点击保存按钮，保存相关数据
            // $('#btnSave').click(function () {
            //     page.logic.save();
            // });
            //点击关闭按钮，关闭该弹框
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.Reload;
                page.logic.closeLayer(false);
            });
            //下达命令
            $("#btnSend").click(function () {
                page.logic.sendOrders();
            });
            //应急职责反馈状态查询
            $('#btnQuerys').click(function(){
                grid4.load({"state":$("#states").val()});
            });
            //步骤 反馈状态查询
            $('#btnQuery').click(function(){
                grid5.load({"state":$("#state").val()});
            });
            //侧边栏菜单添加点击,进行查询某一项相关联的数据
            // mini.get("tree1").on("nodeselect", function (e){
            //     page.logic.onenode_load_dt(e.node.id);
            // });
            //"查看应急预案"按钮，鼠标滑入滑出效果设置；
            $("#call_btn").hover(function(){
                $(this).css("background","#0b93d9");
            },function(){
                $(this).css("background","#45c8dc");
            });
            //“查看应急预案”按钮，点击，查看应急预案详情页
            $("#call_btn").click(function(){
                page.logic.ShowEmergencyPlan();
            });
            //应急职责/处置步骤----批量删除
            $('#btnDel,#btnDel2,#btnDel3').click(function () {
                page.logic.delAll();
            });
            //应急职责/处置步骤----批量新增
            $("#btnAdd,#btnAdd2,#btnAdd3").click(function(){
                page.logic.newRow();
            });
            //左侧树菜单---"添加根目录"按钮点击，直接新增根节点；
            $("#add_one_node").on("click",function(){
                //当为可操作模式下，才能进行节点操作；
                if(!IsOnlyRead){
                    page.logic.AddOneNode();
                }
            });
            //左侧树菜单节点点击，动态刷新列表
            mini.get("tree1").on("nodeclick",function(e){
                structuredPlanCategoryId = e.node.structuredPlanCategoryId;
                page.logic.reload_table();              //动态刷新表
            });
            $("#datagrid3").on("click",function(e){
                var oCur_upload_btn = $(e.target);
                //判断上传按钮是否可操作；
                if(oCur_upload_btn.hasClass("uploadPlaceholder") && !oCur_upload_btn.attr("id")){
                    layer.msg("当前行不处于编辑状态，您无法进行操作！")
                }
                //判断删除按钮是否可操作；
                if(oCur_upload_btn.hasClass("upicon-remove")){
                    var oCur_Row = grid3.getRowByUID(oCur_upload_btn.attr("uid"));   //当前操作的这一行
                    if(grid3.isEditingRow(oCur_Row)) {
                        oCur_upload_btn.parent().find("a").attr("href","javascript:;");   //清空图片链接
                        oCur_upload_btn.parent().find("a").html("");                        //清空图片内容
                        oCur_upload_btn.hide();                                             //删除图标，清除掉
                        //更新此行的数据
                        grid3.updateRow(oCur_Row,{
                            atchName:"",
                            atchPath:"",
                            atchSize:""
                        });
                        page.logic.editRow(oCur_upload_btn.attr("uid"));    //并让当前行处于编辑状态；
                    }else{
                        layer.msg("当前行不处于编辑状态，您无法进行操作！");
                    }
                }
            });
        },
        data:{
            param:{},                                                                      //请求，参数集合拼接处理
            aResponseList:[],                                                             //处置步骤----反馈方式（列表数据集合）
            FileType:[{"id":17,"text":"流程图"},{"id":18,"text":"消防部署图"}]          //附件类型集合
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                //处理提交类型
                var ajaxType = "PUT";                            //提交方式
                window.pageLoadMode = PageLoadMode.Reload;    //设置页面模式为重新加载；
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                //由于测试，先注释掉；必要代码；
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                emergencyPlanID = data.emergencyPlanID;    //应急预案id;
                emergencyPlanName = data.emergencyPlanName;  //应急预案名称；
                IsOnlyRead = data.IsOnlyRead?data.IsOnlyRead:false;   //设置页面模式
                eventId = data.eventID?data.eventID:"";   //设置页面模式
                orgID = data.orgID;
                //面包屑导航动态设置
                $(".bread_title").html(emergencyPlanName);
                ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
                //废代码删除-----------------
                //根据企业code获取企业id;
                // page.logic.GetOrgId(function(){
                    //应用级别下拉菜单数据加载
                    // page.logic.load_level_menu(function(){
                    //
                    // });
                // });
                page.logic.page_set_model();     //当前页面模式设置（可读 or 可操作）
                //左侧tree组件的数据加载
                page.logic.load_sidebar(function(){
                    if(!structuredPlanCategoryId){
                        return false;
                    }
                    if(IsOnlyRead){
                        page.logic.onlyRead_load();     //可读模式部分数据加载
                    }else{
                        page.logic.canAction_load();    //可操作模式部分数据加载
                    }
                });
            },
            //可读模式，页面可读部分数据加载；
            onlyRead_load:function(){
                //应急职责-------------------------------------------------
                grid4.set({
                    ajaxType:"get",
                    url:dutyInintUrl+"/executelist?eventId="+eventId+"&emergencyPlanId="+emergencyPlanID+"&structuredPlanCategoryId="+structuredPlanCategoryId
                });
                grid4.load({"state":$("#states").val()});   //处置步骤表格数据
                //处置步骤-------------------------------------------------
                grid5.set({
                    ajaxType:"get",
                    url:DisposalInitUrl+"/executelist?structuredPlanCategoryId="+structuredPlanCategoryId +"&emergencyPlanId="+emergencyPlanID + "&eventId="+eventId
                });
                grid5.load({"state":$("#state").val()});
                //已下达状态不可选中
                grid5.on("beforeselect", function (e) {
                    if (e.record.state == 1) e.cancel = true;
                });
                //附件-----------------------------------------------------
                grid6.set({
                    ajaxType:"get",
                    url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                });
                grid6.load();
            },
            //可操作模式，页面可操作部分数据加载；
            canAction_load:function(){
                //应急职责-------------------------------------------------
                grid1.set({
                    ajaxType:"get",
                    url:dutyInintUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                });
                grid1.load();
                //处置步骤-------------------------------------------------
                grid2.set({
                    ajaxType:"get",
                    url:DisposalInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                });
                //反馈方式列表加载
                page.logic.load_responese_dt(function(){
                    grid2.load();    //处置步骤表格数据
                });
                //附件-----------------------------------------------------
                grid3.set({
                    ajaxType:"get",
                    url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                });
                grid3.load();
            },
            //设置页面的状态模式，为可读，or 可操作
            page_set_model:function(){
                if(IsOnlyRead){
                    //隐藏批量操作按钮（新增、删除）
                    //应急职责/处置步骤/附件可操作模式隐藏；
                    $(".box-tools,#datagrid1,#datagrid2,#datagrid3").hide();
                    //应急职责/处置步骤/附件可读模式展示；
                    $("#datagrid4,#datagrid5,#datagrid6").show();
                    //隐藏“上传提示”
                    $("#upload_ts").hide();
                    //反馈状态显示
                    $(".search-tools").show();
                    $("#nav_tabs li").removeClass("active");
                    $("#nav_tabs li").eq(1).addClass("active");
                    $(".tab-content .tab-pane").removeClass("active");
                    $(".tab-content .tab-pane").eq(1).addClass("active");
                }else{
                    //展示批量操作按钮（新增、删除）
                    //应急职责/处置步骤/附件可操作模式展示；
                    $(".box-tools,#datagrid1,#datagrid2,#datagrid3").show();
                    //应急职责/处置步骤/附件可读模式隐藏；
                    $("#datagrid4,#datagrid5,#datagrid6").hide();
                    //展示“上传提示”
                    $("#upload_ts").show();
                    //反馈状态隐藏
                    $(".search-tools").hide();
                }
            },
            //刷新列表（应急职责、处置步骤、附件）
            reload_table:function(){
                if(IsOnlyRead){
                    grid4.set({
                        ajaxType:"get",
                        url:dutyInintUrl+"/executelist?eventId="+eventId+"&emergencyPlanId="+emergencyPlanID+"&structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid4.load({"state":$("#states").val()});   //处置步骤表格数据
                    //处置步骤-------------------------------------------------
                    grid5.set({
                        ajaxType:"get",
                        url:DisposalInitUrl+"/executelist?structuredPlanCategoryId="+structuredPlanCategoryId +"&emergencyPlanId="+emergencyPlanID + "&eventId="+eventId
                    });
                    grid5.load({"state":$("#state").val()});
                    //已下达状态不可选中
                    grid5.on("beforeselect", function (e) {
                        if (e.record.state == 1) e.cancel = true;
                    });
                    //附件-----------------------------------------------------
                    grid6.set({
                        ajaxType:"get",
                        url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid6.load();
                }else{
                    //应急职责-------------------------------------------------
                    grid1.set({
                        ajaxType:"get",
                        url:dutyInintUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid1.load();
                    //处置步骤-------------------------------------------------
                    grid2.set({
                        ajaxType:"get",
                        url:DisposalInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    //反馈方式列表加载
                    page.logic.load_responese_dt(function(){
                        grid2.load();    //处置步骤表格数据
                    });
                    //附件-----------------------------------------------------
                    grid3.set({
                        ajaxType:"get",
                        url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid3.load();
                }
            },
            /**
             * 处置步骤反馈状态
             */
            statelist:function(){
                ECS.ui.getCombobox("state", stateUrl, {
                    selectValue:"",
                    async:false
                }, null);
            },
            /**
             * 职责反馈状态
             */
            statelists:function(){
                ECS.ui.getCombobox("states", stateUrl, {
                    selectValue:"",
                    async:false
                }, null);
            },
            /**
             * 下达命令
             */
            sendOrders: function () {
                if ($('[name=sendType]:checked').length == 0) {
                    layer.msg("请选择下达命令类型!");
                    return;
                }
                var sendType ="";
                if ($('[name=sendType]:checked').length == 2) {
                    sendType = "1,2";
                }
                else if ($('#msg').is(':checked')) {
                    sendType = "1";
                }
                else if ($('#voice').is(':checked')) {
                    sendType = "2";
                }
                var idsArray = [];
                var rowsArray = grid5.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push({
                        "relatedPlanExecutedId": "",
                        "exectutedId": el.disposalStepsId,
                        "emergencyPlanId": emergencyPlanID,
                        "emergencyPlanName": "",
                        "eventId": eventId,
                        "executedType":1,
                        "crtDate": "",
                        "sortNum": "1",
                        "isDelete": "0",
                        "sendStateParam":sendType
                    });
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要下达命令的数据!");
                    return;
                }
                $.ajax({
                    url: sendOrdersUrl,
                    async: false,
                    type: "POST",
                    data:JSON.stringify(idsArray),
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
                                grid5.reload();
                            });
                        } else {
                            layer.msg(result.collection.error.message);
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
             * 反馈情况
             */
            send:function(msgId,msgContent,systemId){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '500px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../../em/MsgTrack/detail.html?r=' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            msgID: msgId,
                            msgContent: msgContent,
                            businessModelId:"35",
                            systemId:systemId,
                            title: '通知反馈记录'
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function (r) {
                        if (r) {
                            grid.record();
                        }
                    }
                })

            },
            //获取企业id;
            // GetOrgId:function(cb){
            //     $.ajax({
            //         url:getOrgIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
            //         type: "GET",
            //         timeout:5000,
            //         success: function (Data) {
            //             orgId = Data.orgId;                   //存储企业id;
            //             cb && cb();
            //         }
            //     });
            // },
            //左侧右键菜单 start------------------by yuanshuang
            //插入节点
            onAddBefore:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                page.logic.add(node.structuredPlanCategoryPid,tree.getParentNode(node).emergencyPlanName);
            },
            //增加子节点
            onAddNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                page.logic.add(node.structuredPlanCategoryId,node.emergencyPlanName,function(name,id){
                    //插入节点
                    page.logic.load_sidebar();   //侧边栏菜单的刷新
                });
            },
            //编辑节点
            onEditNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                page.logic.edit(node.structuredPlanCategoryId,node.structuredPlanCategoryPid)
            },
            //删除节点
            onRemoveNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                page.logic.delSingle(node.structuredPlanCategoryId);
            },
            //删除节点
            delSingle:function(structuredPlanCategoryId){
                if (confirm("确定删除此节点？")) {
                    layer.msg("删除中……");
                    $.ajax({
                        url:leftDelUrl,
                        async: true,
                        dataType: "text",
                        timeout:1000,
                        data:JSON.stringify([structuredPlanCategoryId]),
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        success: function (response) {
                            var result = JSON.parse(response);
                            layer.msg(result.message);
                            if(result.isSuccess){
                                //刷新左侧树
                                page.logic.load_sidebar();
                            }
                        },
                        error: function (){}
                    });
                }
            },
            //显示右键菜单
            onBeforeOpen:function(e) {
                var menu = e.sender;
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                //若当前没有节点选中；
                if (!node) {
                    e.cancel = true;
                    return;
                }
                //若当前页面为可读模式下；
                if(IsOnlyRead){
                    e.cancel = true;
                    return;
                }
                switch (mini.get("tree1").getLevel(node)){
                    case 0:
                        //若是第一层节点，那么显示“新增节点”功能
                        $("#mini-16").show();
                        $("#add_list").find(".mini-menuitem").eq(0).show();   //显示"添加节点";
                        if(node.emergencyPlanName==emergencyPlanName){
                            //若是根节点，不可删除
                            $("#del_node").hide();                                  //去掉"删除节点";
                        }else{
                            //若是根节点的同级节点，可删除
                            $("#del_node").show();                                  //展示"删除节点";
                        }
                        break;
                    case 1:
                        //若是第二层节点，那么显示“新增节点”功能
                        $("#mini-16").show();
                        $("#add_list").find(".mini-menuitem").eq(0).show();   //显示"添加节点";
                        $("#del_node").show();                                  //显示"删除节点";
                        break;
                    case 2:
                        //若是第三层节点，那么隐藏“新增节点”功能
                        $("#mini-16").hide();                                   //隐藏“新增节点”
                        $("#del_node").show();                                  //显示"删除节点";
                        break;
                }
                ////////////////////////////////
                var editItem = mini.getbyName("edit", menu);
                var removeItem = mini.getbyName("remove", menu);
                editItem.show();
                removeItem.enable();
                if (node.structuredPlanCategoryId == "-1") {
                    editItem.enable();
                    removeItem.enable();
                }
                var Event = e || window.event;
                if(Event.stopPropagation) { //W3C阻止冒泡方法
                    Event.stopPropagation();
                }else{
                    Event.cancelBubble = true; //IE阻止冒泡方法
                }
            },
            /**
             * 新增
             */
            add: function (PID,ParentName,cb) {
                var pageMode = PageModelEnum.NewAdd;
                var title = "新增处置类别";
                if(PID){
                    page.logic.detail(title, "", pageMode,PID,ParentName,"",cb);
                }else{
                    page.logic.detail(title, "", pageMode);
                }
            },
            /**
             * 编辑
             * @param Id
             */
            edit: function (Id,PID,cb) {
                var pageMode = PageModelEnum.Edit;
                var title = "编辑处置类别";
                if(PID){
                    page.logic.detail(title,Id,pageMode,PID,"","",cb);
                }else{
                    page.logic.detail(title,Id,pageMode);
                }
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, Id, pageMode,PID,ParentName,CurNodeName,cb) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['550px', '250px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AddEditLevel.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,                    //页面模式;
                            "Id": Id,                                 //当前节点的id;
                            "Name":CurNodeName?CurNodeName:"",       //当前节点的名字;
                            "PID":PID,                                //当前节点的父级id;
                            "emergencyPlanID":emergencyPlanID,    //预案id;
                            "ParentName":ParentName,                 //当前节点的父级节点名称;
                            'title': title                            //（新增 or 编辑）节点的弹框标题;
                        };
                        //进行回调
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            $("#add_one_node").hide();
                            page.logic.load_sidebar();
                            cb && cb();
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            $("#add_one_node").hide();
                            page.logic.load_sidebar();
                            cb && cb();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                });
            },
            //左侧右键菜单 end--------------------by yuanshuang
            //打开查看“应急预案”详情
            ShowEmergencyPlan:function(){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './../../ap/AutoHandlingCommon/ShowEmergencyPlan.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "emergencyPlanID": emergencyPlanID,
                            "checkMode":false,
                            'title': "查看应急预案",
                            "isToggle":!IsOnlyRead
                        };
                        iframeWin.page.logic.setData(data);
                    }
                });
            },
            //------改造部分 start by yuanshuang------------------------------------------------------
            //应急职责：操作按钮的展示（新增、编辑、删除、更新、取消）  by yuanshuang
            onActionRenderer:function(e) {
                var cur_grid3 = e.sender;
                var record2 = e.record;
                var uid = record2._uid;
                var rowIndex = e.rowIndex;
                //若是进入编辑状态，那么将操作按钮设置为可编辑状态；
                var s = '<a class="New_Button" href="javascript:page.logic.newRow()">新增</a>'
                    + ' <a class="Edit_Button" href="javascript:page.logic.editRow(\'' + uid + '\')" >编辑</a>'
                    + ' <a class="Delete_Button" href="javascript:page.logic.delRow(\'' + uid + '\')">删除</a>';
                if (cur_grid3.isEditingRow(record2)) {
                    s = '<a class="Update_Button" style="margin-right:10px;" href="javascript:page.logic.updateRow(\'' + uid + '\')">更新</a>'
                        + '<a class="Cancel_Button" href="javascript:page.logic.cancelRow(\''+ uid + '\')">取消</a>';
                }
                return s;
            },
            //新增一行
            newRow:function() {
                //判断是否有节点id, 若没有，那么不再往下进行；
                if(!structuredPlanCategoryId){
                    layer.msg("请先添加根节点！");
                    return false;
                }
                var row = {};
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责---当前查看的这一行
                    grid1.addRow(row, 0);
                    grid1.cancelEdit();
                    grid1.beginEditRow(row);
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤---当前查看的这一行
                    grid2.addRow(row, 0);
                    grid2.cancelEdit();
                    grid2.beginEditRow(row);
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //附件---当前查看的这一行
                    grid3.addRow(row, 0);
                    grid3.cancelEdit();
                    grid3.beginEditRow(row);
                    //设置行id
                    $("#datagrid3 tr").each(function(){
                        if($(this).hasClass("mini-grid-rowEdit")){
                            $(this).find(".uploadPlaceholder").attr("id","uploadPlaceholder");
                        }else{
                            $(this).find(".uploadPlaceholder").removeAttr("id");
                        }
                    });
                    page.logic.fileUpload_init();    //初始化上传控件
                }
            },
            //编辑一行
            editRow:function(row_uid) {
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责
                    var row = grid1.getRowByUID(row_uid);
                    if (row) {
                        grid1.cancelEdit();
                        grid1.beginEditRow(row);
                    }
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤
                    var row = grid2.getRowByUID(row_uid);
                    if (row) {
                        grid2.cancelEdit();
                        grid2.beginEditRow(row);
                    }
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //附件
                    var row = grid3.getRowByUID(row_uid);
                    if (row) {
                        grid3.cancelEdit();
                        grid3.beginEditRow(row);
                        //设置行id
                        $("#datagrid3 tr").each(function(){
                            if($(this).hasClass("mini-grid-rowEdit")){
                                $(this).find(".uploadPlaceholder").attr("id","uploadPlaceholder");
                            }else{
                                $(this).find(".uploadPlaceholder").removeAttr("id");
                            }
                        });
                        page.logic.fileUpload_init();    //初始化上传控件
                    }
                }
            },
            //取消保存行
            cancelRow:function(row_uid) {
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责-------------------------------------------------
                    grid1.set({
                        ajaxType:"get",
                        url:dutyInintUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid1.load();
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤-------------------------------------------------
                    grid2.set({
                        ajaxType:"get",
                        url:DisposalInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    //反馈方式列表加载
                    page.logic.load_responese_dt(function(){
                        grid2.load();    //处置步骤表格数据
                    });
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //附件-----------------------------------------------------
                    grid3.set({
                        ajaxType:"get",
                        url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                    });
                    grid3.load();
                }
            },
            //删除行
            delRow:function(row_uid) {
                var oCur_table = null;        //当前要操作的表格
                var DelUrl = null;            //删除接口
                var row = null;               //当前要删除的行
                var emergencyDutiesId = "";   //删除行业务主键id;
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责
                    oCur_table = grid1;
                    DelUrl = dutydelUrl;
                    row = grid1.getRowByUID(row_uid);
                    emergencyDutiesId = row.emergencyDutiesId;   //应急职责id;
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤
                    oCur_table = grid2;
                    DelUrl = DisposaldelUrl;
                    row = grid2.getRowByUID(row_uid);
                    emergencyDutiesId = row.disposalStepsId;   //处置步骤id;
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //附件
                    oCur_table = grid3;
                    DelUrl = FileDelUrl;
                    row = grid3.getRowByUID(row_uid);
                    emergencyDutiesId = row.atchID;   //附件 id;
                }
                if (row) {
                    layer.confirm('确定删除吗？', {
                        btn: ['确定', '取消']
                    }, function () {
                        $.ajax({
                            url:DelUrl,
                            async: true,
                            dataType: "text",
                            timeout:1000,
                            data:JSON.stringify([emergencyDutiesId]),
                            contentType: "application/json;charset=utf-8",
                            type: 'DELETE',
                            beforeSend: function () {
                                ECS.showLoading();
                            },
                            success: function (msg) {
                                ECS.hideLoading();
                                var result = JSON.parse(msg);   //语句化执行
                                if(result.isSuccess){
                                    layer.msg(result.message, {
                                        time: 1000
                                    }, function () {
                                        oCur_table.reload();
                                    });
                                }else{
                                    layer.msg(result.message)
                                }
                            },
                            error: function (result) {
                                ECS.hideLoading();
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        });
                    }, function (index) {
                        layer.close(index);
                    });
                }
            },
            //应急职责--责任人换行渲染；
            duty_list:function(e){
                if(e.row.dutyNames){
                    return e.row.dutyNames.replace(/\)\,/g,")<br/>");
                }else{
                    return "";
                }
            },
            //保存行
            updateRow:function(row_uid) {
                var oCur_table = null;                  //当前操作的表格
                var row = grid1.getRowByUID(row_uid);   //当前操作的行
                var CurAddUrl = "";                     //当前新增 or 编辑 接口
                var Cur_id = "";                        //当前这一行的业务id
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责
                    oCur_table = grid1;
                    row = grid1.getRowByUID(row_uid);
                    Cur_id = row.emergencyDutiesId;   //应急职责 主键id;
                    CurAddUrl = dutyaddUrl;
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤
                    oCur_table = grid2;
                    row = grid2.getRowByUID(row_uid);
                    Cur_id = row.disposalStepsId;   //处置步骤 主键id;
                    CurAddUrl = DisposaladdUrl;
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //附件
                    oCur_table = grid3;
                    row = grid3.getRowByUID(row_uid);
                    Cur_id = row.atchID;   //附件名字;
                    CurAddUrl = FileAddUrl;
                }
                //应急职责----------
                if(oCur_table==grid1){
                    var form = new mini.Form("#datagrid1");
                }
                //处置步骤----------
                if(oCur_table==grid2){
                    var form = new mini.Form("#datagrid2");
                }
                //附件
                if(oCur_table==grid3){
                    var form = new mini.Form("#datagrid3");
                }
                //校验非空
                form.validate();
                if (form.isValid() == false) return;
                if(oCur_table==grid3){
                    //如果是附件的tab下，校验附件；
                    if(!row.atchName){
                        layer.msg("请选择附件!");
                        return;
                    }
                }else{
                    //校验选择人是否为空；
                    if(!row.dutyIds){
                        layer.msg("请选择责任人!");
                        return;
                    }
                }
                oCur_table.commitEdit();   //提交编辑的数据；
                var rowData = oCur_table.getChanges();
                oCur_table.loading("保存中，请稍后......");
                var data = {};
                console.log("责任人的数据：",row.dutyNames);
                if(oCur_table==grid1){
                    //应急职责，参数拼接
                    data.structuredPlanCategoryId = row.structuredPlanCategoryId?row.structuredPlanCategoryId:"";                  //结构化预案类别ID
                    data.dutiesContent = row.dutiesContent?row.dutiesContent:"";                                                       //职责内容
                    data.dutyIds = row.dutyIds?row.dutyIds:"";                                                                           //"职务IDs,以逗号分隔"
                    data.dutyNames = row.dutyNames?row.dutyNames:"";                                                                    //"职务名称，以逗号分隔"
                    data.inUse = row.inUse?row.inUse:1;                                                                                   // 是否启用（1是；0否）
                    data.sortNum = row.sortNum?row.sortNum:"";                                                                           // 排序
                }else if(oCur_table==grid2){
                    //处置步骤，参数拼接
                    data.structuredPlanCategoryId = row.structuredPlanCategoryId?row.structuredPlanCategoryId:"";     //结构化预案类别ID
                    data.stepsOutline = row.stepsOutline?row.stepsOutline:"";                //步骤概述
                    data.stepsContent = row.stepsContent?row.stepsContent:"";                //步骤内容
                    data.feedbackMethod = row.feedbackMethod?row.feedbackMethod:"";         //反馈方式(0无；1到场情况；2处置进展)
                    data.dutyIds = row.dutyIds?row.dutyIds:"";                     //职务IDs,以逗号分隔
                    data.dutyNames = row.dutyNames?row.dutyNames:"";              //职务名称，以逗号分隔
                    data.inUse = row.inUse?row.inUse:1;;                            //是否启用（1是；0否）
                    data.sortNum = row.sortNum?row.sortNum:"";                     //排序
                }
                var sub_type = "POST";        //默认，新增保存
                if(Cur_id){
                    //修改保存
                    sub_type = "PUT";
                    if(oCur_table==grid1){
                        data.emergencyDutiesId = row.emergencyDutiesId;              //应急职责ID
                    }else if(oCur_table==grid2){
                        data.disposalStepsId = row.disposalStepsId;                  //处置步骤ID
                    }
                }
                if(oCur_table==grid3){
                    sub_type = "POST";
                    var formData = new FormData();   //创建form对象
                    //添加传递参数
                    formData.append("srcType",row.srcType);               //附件来源类型
                    formData.append("srcRef",structuredPlanCategoryId); //左侧菜单的当前节点的id;
                    formData.append("atchName",row.atchName); //文件名称
                    formData.append("atchPath",row.atchPath); //文件路径
                    formData.append("atchSize",row.atchSize); //文件大小
                    //附件ID设置;
                    if(Cur_id){
                        formData.append("atchID",row.atchID);
                    }else{
                        formData.append("atchID","");
                    }
                    var request = new XMLHttpRequest();
                    request.open(sub_type, CurAddUrl);
                    request.send(formData);
                    //监测响应成功，初始化控件
                    request.onload = function(){
                        //附件-----------------------------------------------------
                        grid3.set({
                            ajaxType:"get",
                            url:FileInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                        });
                        grid3.load();
                    }
                }else{

                    //其它表-----
                    $.ajax({
                        url: CurAddUrl,
                        type:sub_type,
                        data: JSON.stringify(data),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        success: function (text) {
                            //table页加载
                            if($("#nav_tabs").find("li.active").index()==0){
                                //应急职责-------------------------------------------------
                                grid1.set({
                                    ajaxType:"get",
                                    url:dutyInintUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                                });
                                grid1.load();
                            }else if($("#nav_tabs").find("li.active").index()==1){
                                //处置步骤-------------------------------------------------
                                grid2.set({
                                    ajaxType:"get",
                                    url:DisposalInitUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId
                                });
                                //反馈方式列表加载
                                page.logic.load_responese_dt(function(){
                                    grid2.load();    //处置步骤表格数据
                                });
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // alert(jqXHR.respopnseText);
                        }
                    });
                }
            },
            //应急职责：选择人按钮；
            dutyselect_btn:function(e){
                var record2 = e.record;
                var uid = record2._uid;
                return '<a style="width:30px;height:20px;line-height:20px;" class="btn btn-primary btn-sm" onclick="page.logic.GotoPage(\'' + uid + '\')">选择</a>';
            },
            //行编辑，责任人不可编辑
            OnCellBeginEdit:function(e){
                var record = e.record, field = e.field;
                if (field == "dutyNames") {
                    e.cancel = true;
                }
            },
            //------改造部分 end by yuanshuang--------------------------------------------------------
            //应急职责列表部分 start by yuanshuang---------------------
            /*
            应急职责、处置步骤--选择查看：
            跳转页面，SelectOrg.html
            */
            GotoPage:function(Row_uid){
                var oCur_table = "";
                if($("#nav_tabs").find("li.active").index()==0){
                    var row = grid1.getRowByUID(Row_uid);   //应急职责---当前查看的这一行
                    oCur_table = grid1;
                }else if($("#nav_tabs").find("li.active").index()==1){
                    var row = grid2.getRowByUID(Row_uid);   //处置步骤---当前查看的这一行
                    oCur_table = grid2;
                }
                if(!oCur_table.isEditingRow(row)) {
                    layer.msg("当前行处于非编辑状态，不可操作！");
                    return false;
                }
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['80%', '100%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectOrg.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            'title': "职位选择",                 //标题
                            "orgID":orgID
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        //若职位选择不为空，那么填充进来；
                        if(aPositionList.length>0){
                            var aName_list = [];   //职务名称集合
                            var IdList = [];       //职务id集合
                            for(var w=0;w<aPositionList.length;w++){
                                (function(cur_dt){
                                    aName_list.push(cur_dt.dutyName);
                                    IdList.push(cur_dt.dutyID);
                                })(aPositionList[w]);
                            }
                            //在更新行前，判断此行是否处于编辑状态
                            var isEdit_btn = false;
                            var iSort = "";               //排序
                            var sDutyContent = "";        //职责内容
                            var oCur_table = null;
                            if($("#nav_tabs").find("li.active").index()==0){
                                //应急职责
                                oCur_table = grid1;
                            }else if($("#nav_tabs").find("li.active").index()==1){
                                //处置步骤
                                oCur_table = grid2;
                            }
                            if(oCur_table.isEditingRow(row)) {
                                isEdit_btn = true;
                            }
                            oCur_table.commitEdit();   //前端静态提交编辑的数据；
                            //前端静态更新行
                            if(oCur_table == grid1){
                                //应急职责--行更新
                                oCur_table.updateRow(row,{dutyNames: aName_list.join("<br/>"),dutyIds:IdList.join(","),structuredPlanCategoryId:structuredPlanCategoryId});//更改行:职位选择；
                            }else if(oCur_table == grid2){
                                //处置步骤---行更新
                                oCur_table.updateRow(row,{dutyNames: aName_list.join("<br/>"),dutyIds:IdList.join(","),structuredPlanCategoryId:structuredPlanCategoryId});//更改行:职位选择；
                            }
                            //若是这一行原本处于编辑状态，那么此刻恢复它的编辑状态
                            if(isEdit_btn) {
                                page.logic.editRow(Row_uid);
                            }
                        }
                        if (window.pageLoadMode == PageLoadMode.Refresh){
                            window.pageLoadMode = PageLoadMode.None;
                        }else if(window.pageLoadMode == PageLoadMode.Reload){
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var oCur_table = null;   //当前操作的表格
                var DelUrl = "";        //当前删除的接口
                var idsArray = [];
                if($("#nav_tabs").find("li.active").index()==0){
                    //应急职责
                    oCur_table = grid1;
                    DelUrl = dutydelUrl;
                }else if($("#nav_tabs").find("li.active").index()==1){
                    //处置步骤
                    oCur_table = grid2;
                    DelUrl = DisposaldelUrl;
                }else if($("#nav_tabs").find("li.active").index()==2){
                    //处置步骤
                    oCur_table = grid3;
                    DelUrl = FileDelUrl;
                }
                var rowsArray = oCur_table.getSelecteds();

                $.each(rowsArray, function (i, el) {
                    //应急职责
                    if(oCur_table==grid1){
                        idsArray.push(el.emergencyDutiesId);
                    }
                    //处置步骤
                    if(oCur_table==grid2){
                        idsArray.push(el.disposalStepsId);
                    }
                    //附件
                    if(oCur_table==grid3){
                        idsArray.push(el.atchID);
                    }
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: DelUrl,
                        async: true,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (msg) {
                            ECS.hideLoading();
                            var result = JSON.parse(msg);   //语句化执行
                            if(result.isSuccess){
                                layer.msg(result.message, {
                                    time: 1000
                                }, function () {
                                    oCur_table.reload();
                                });
                            }else{
                                layer.msg(result.message)
                            }
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index);
                });
            },
            //应急职责列表部分 end by yuanshuang-----------------------
            //处置步骤列表部分 start by yuanshuang---------------------
            //反馈方式，下拉列表数据请求集合
            load_responese_dt:function(cb){
                $.ajax({
                    url: ResponseListUrl,
                    type: 'GET',
                    success: function (dt) {
                        page.data.aResponseList = [];   //清空缓存的数组
                        //重新组合数据
                        for(var w=0;w<dt.length;w++){
                            var one_dt = {};
                            one_dt["id"] = dt[w]["key"];          //id值存储
                            one_dt["text"] = dt[w]["value"];      //value值存储
                            page.data.aResponseList.push(one_dt);
                        }
                        cb && cb();
                    }
                });
            },
            //可读模式 步骤 反馈状态
            show_state:function(e){
                if(e.row.state==1){
                    return '<a title="'+e.row.stateName+'" href="javascript:window.page.logic.send(\'' + e.row.msgId + '\',\'' + e.row.content +'\',\''+ e.row.disposalStepsId + '\')">'+e.row.stateName+'</a>';
                }else{
                    return e.row.stateName;
                }
            },
            //可读模式 职责 反馈状态
            show_states:function(e){
                if(e.row.state==1){
                    return '<a title="'+e.row.stateName+'" href="javascript:window.page.logic.send(\'' + e.row.msgId + '\',\'' + e.row.content +'\',\''+ e.row.emergencyDutiesId + '\')">'+e.row.stateName+'</a>';
                }else{
                    return e.row.stateName;
                }
            },
            //反馈方式处理；
            response_name:function(e){
                var cur_type = "";
                for(var w=0;w<page.data.aResponseList.length;w++){
                    if(page.data.aResponseList[w]["id"]==e.row.feedbackMethod){
                        cur_type = page.data.aResponseList[w]["text"];
                        break;
                    }
                }
                return cur_type;
            },
            //处置步骤列表部分 end by yuanshuang-----------------------
            //附件列表部分 start by yuanshuang-------------------------
            //表格，附件列数据渲染
            file_upload:function(e){
                var record2 = e.record;
                var uid = record2._uid;
                if(IsOnlyRead){
                    //可读模式-------------
                    return '<div style="float:left;" class="img_box">'+
                                '<a href="'+FileDownLoadUrl+'?atchPath='+e.record.atchPath+'&atchName='+e.record.atchName+'" class="ml__5">'+e.record.atchName+'</a>'+
                            '</div>';
                }else{
                    //可操作模式-----------
                    if(e.record.atchName){
                        return '<div style="float:left;" class="img_box">'+
                            '<a href="'+FileDownLoadUrl+'?atchPath='+e.record.atchPath+'&atchName='+e.record.atchName+'" class="ml__5">'+e.record.atchName+'</a>'+
                            '<span class="upicon-remove mt__5" uid="'+uid+'" style="float:right;"></span>'+
                            '</div>'+
                            '<div onclick="page.logic.findCurRow(' + uid + ')" style="float:right;padding:0px;position:relative;heidght:25px;line-height:25px;overflow:hidden;" class="img_btn_box" row_id="'+uid+'">' +
                            '<div class="btn-primary" style="height:auto;width:60px;">上传附件</div>'+
                            '<div class="uploadPlaceholder"></div>'+
                            '</div>';
                    }else{
                        return '<div style="float:left;" class="img_box"></div>'+
                            '<div onclick="page.logic.findCurRow(' + uid + ')" style="float:right;padding:0px;position:relative;heidght:25px;line-height:25px;overflow:hidden;" class="img_btn_box" row_id="'+uid+'">' +
                            '<div class="btn-primary" style="height:auto;width:60px;">上传附件</div>'+
                            '<div class="uploadPlaceholder"></div>'+
                            '</div>';
                    }
                }
            },
            //附件上传，点击到当前选择的这一行
            findCurRow:function(row_uid){
                CurRow = null;
                CurRow = grid3.getRowByUID(row_uid);   //当前这一行；
            },
            //附件类型处理
            FileTypeName:function(e){
                var typeName = "";
                for(var w=0;w<page.data.FileType.length;w++){
                    if(page.data.FileType[w]["id"]==e.row.srcType){
                        typeName = page.data.FileType[w]["text"];
                        break;
                    }
                }
                return typeName;

            },
            //附件上传组件使用
            fileUpload_init:function(){
                //文件配置设置----------------------
                var uploader = WebUploader.create({
                    //swf文件路径
                    swf:'../../../lib/webuploader/swfupload.swf',
                    // 文件接收服务端。
                    server: FileUploadUrl,
                    // 选择文件的按钮。可选。
                    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    pick: {
                        id: '#uploadPlaceholder',
                        multiple:false
                    },
                    // 只允许选择图片文件。
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    //每次只允许上传单个文件；
                    fileNumLimit: 1,
                    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                    // resize: false,
                    compress: false,//webuploader默认压缩图片,设置compress:false，可以按照原始比例上传图片
                    // 选完文件后不自动上传
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
                uploader.on('fileQueued', function (file){});
                //上传过程中
                uploader.on('uploadProgress', function (file, percentage) {
                    var row = grid3.findRow(function (row) {
                        if (row.fileId == file.id) return true;
                    });
                    // console.log("上传进度：",percentage);
                    // grid3.updateRow(CurRow, { status: percentage });
                });
                //此处有repsonse接收服务端返回来的数据；我用atchID字段存储；
                uploader.on('uploadSuccess', function (file,response) {
                    var row = grid3.findRow(function (row) {
                        if (row.fileId == file.id) return true;
                    });
                    var updateRow_dt = {};
                    //拼接数据：
                    for(var w=0;w<response.length;w++){
                        switch (response[w]["key"]){
                            case "atchName":    //附件名字
                            case "atchPath":    //附件链接
                            case "atchSize":    //附件大小
                                updateRow_dt[response[w]["key"]] = response[w]["value"];
                            break;
                        }
                    }
                    grid3.updateRow(CurRow, updateRow_dt);    //更新行
                    //让当前行处于编辑状态；
                    page.logic.editRow(CurRow._uid);
                });
                //上传失败
                uploader.on('uploadError', function (file, reason) {
                    var row = grid3.findRow(function (row) {
                        if (row.fileId == file.id) return true;
                    })
                    grid3.updateRow(CurRow, { status: "上传出错" });
                });
                // 不管上传成功还是失败，都会触发 uploadComplete 事件
                uploader.on('uploadComplete', function (file) {
                    uploader.removeFile(file, true);
                });
                uploader.on('error', function (type, arg, file) {
                    if (type == "Q_TYPE_DENIED") {
                        mini.alert("请上传正确格式文件");
                    } else if (type == "Q_EXCEED_SIZE_LIMIT") {
                        mini.alert('文件[' + file.name + ']大小超出限制值');
                    } else if(type == "Q_EXCEED_NUM_LIMIT"){
                        mini.alert("抱歉，超过每次上传数量图片限制");
                    }
                });
            },
            //可操作模式下，附件tab下，附件类型值改变，更新当前行的数据；
            onDeptChanged:function(e){
                var row_uid = $(e.sender.el).parents("tr").find(".img_btn_box").attr("row_id");    //当前行的uid
                var oCurRow = grid3.getRowByUID(row_uid);   //当前这一行；
                //拼接数据：
                var updateRow_dt = {};
                updateRow_dt.srcType = e.selected.id;
                updateRow_dt.srcTypeName = e.selected.text;
                grid3.updateRow(oCurRow, updateRow_dt);    //更新行
                //让当前行处于编辑状态；
                page.logic.editRow(oCurRow._uid);
            },
            //计算选择的文件大小
            bytesToSize:function(bytes) {
                if(bytes === "空") return "空";
                if (bytes === 0) return '0 B';
                var k = 1024,
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));

                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            },
            //附件列表部分 end by yuanshuang---------------------------
            //添加一个根节点
            AddOneNode:function(){
                if(!IsCanClick){
                    layer.msg("正在添加根节点中，请稍后……");
                    return false;
                }
                IsCanClick = false;
                //拼接新增的节点数据
                page.data.param = {};
                page.data.param["emergencyPlanId"]=emergencyPlanID;       //预案id;
                page.data.param["emergencyPlanName"]=emergencyPlanName;   //预案名称
                page.data.param["inUse"]=1;
                page.data.param["sortNum"]=1;
                page.data.param["structuredPlanCategoryId"]=null;
                page.data.param["structuredPlanCategoryPid"]=null;
                //保存节点的数据
                $.ajax({
                    url: addRootUrl,
                    async: false,
                    type: "POST",
                    data: JSON.stringify(page.data.param),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function() {
                        ECS.showLoading();
                    },
                    success: function(result) {
                        ECS.hideLoading();
                        if(result.isSuccess) {
                            layer.msg("保存成功！", {
                                time: 1000
                            }, function(){
                                //隐藏“新增根目录”按钮，同时刷新该节点树
                                $("#add_one_node").hide();
                                page.logic.load_sidebar();
                            });
                        } else {
                            layer.msg(result.message);
                            IsCanClick = true;         //将添加根节点的是否点击开关打开；
                        }
                    },
                    error: function(result) {
                        ECS.hideLoading();
                        IsCanClick = true;         //将添加根节点的是否点击开关打开；
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            //侧边栏菜单添加
            load_sidebar:function(cb){
                ECS.showLoading();      //显示加载；
                $.ajax({
                    url: leftMenuUrl + "?emergencyPlanId="+emergencyPlanID,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        ECS.hideLoading();      //隐藏加载；
                        if(Data.length>0){
                            //左侧菜单的数据填充
                            mini.get("tree1").loadList(Data, "structuredPlanCategoryId", "structuredPlanCategoryPid");
                            //默认根节点选中
                            mini.get("tree1").selectNode(mini.get("tree1").getRootNode().children[0]);
                            //取第一条数据，存储预案类别ID;
                            structuredPlanCategoryId = mini.get("tree1").getRootNode().children[0].structuredPlanCategoryId;
                        }else{
                            //当可操作模式下如果无数据时，添加个按钮进行操作
                            if(IsOnlyRead){
                                $("#add_one_node").hide();
                            }else{
                                $("#add_one_node").show();
                            }
                        }
                        cb && cb();
                    },
                    error:function(err){
                        ECS.hideLoading();      //隐藏加载；
                        if(err){
                            layer.msg(err,{
                                time: 1000
                            });
                        }
                    }
                });
            },
            //企业名称
            // select_option:function(menu_url,oPar,selectValue){
            //     $.ajax({
            //         url:menu_url,
            //         type:"get",
            //         timeout:5000,
            //         success:function (data) {
            //             mini.get(oPar).loadList(data, "orgId", "orgPID");
            //             if(selectValue!=undefined){
            //                 mini.get(oPar).setValue(selectValue, false);
            //             }
            //         },
            //         error:function(err){
            //             //提示错误信息
            //             if(err){
            //                 layer.msg(err,{
            //                     time: 1000
            //                 });
            //             }
            //         }
            //     })
            // },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})

