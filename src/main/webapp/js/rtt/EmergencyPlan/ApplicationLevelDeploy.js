var addUrl = ECS.api.rttUrl + '/emergencyPlan/set';              //新增
var leftMenuUrl = ECS.api.rttUrl + '/emergencyPlan/tree'  ;     //左侧树级菜单
var checkListUrl = ECS.api.rttUrl + "/emergencyPlan/getPlan";  //获取某个节点下的选项数据；
var resetUrl = ECS.api.rttUrl + "/emergencyPlan/reset";         //重置功能
var levelUrl = ECS.api.rttUrl + "/emergencyPlan/appLvl";        //应用级别菜单
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";        //根据企业code获取企业id;
var orgId = "";                                                    //企业id;
var emergencyPlanID = "";                                        //应急预案id
window.ownDetail;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //点击保存按钮，保存相关数据
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，关闭该弹框
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //当点击应用级别的下拉菜单的时候，相对应的刷新左侧tree组件
            mini.get("applicationLevel").on("valuechanged",function(){
                page.logic.load_sidebar(function(){
                    //同时清空当前某一节点关联的所有数据的选中状态；
                    mini.get("acheck_list").setValue("");
                });
            });
            //点击“重置”按钮，重置应用级别的下拉菜单的数据与选项之间的关联
            $("#btnReset").on("click",function(){
                    // layer.confirm('重置之后不可恢复，还确定要重置吗？', {
                    //     btn: ['确定', '取消']
                    // }, function () {
                    //
                    // });
                page.logic.reset_menu();
            });
            //侧边栏菜单添加点击,进行查询某一项相关联的数据
            mini.get("tree1").on("nodeselect", function (e){
                page.logic.onenode_load_dt(e.node.id);
            });
        },
        logic: {
            onDrawNode: function (e) {
                var tree = e.sender;
                var number = e.node.number;
                if (number) {
                    e.cellCls = "flag";
                } else {
                  
                }
            },
            /**
             * 保存
             */
            save: function () {
                //处理提交类型
                var ajaxType = "PUT";                            //提交方式
                window.pageLoadMode = PageLoadMode.Reload;    //设置页面模式为重新加载；
                //校验是否有值；
                //若应用级别没有值，那么提示用户选择应用级别下拉菜单；
                if(!mini.get("applicationLevel").getValue()){
                    layer.msg("请选择应用级别下拉菜单！");
                    return false;
                }
                if(!mini.get("tree1").getSelectedNode()){
                    layer.msg("请选择左侧tree菜单！");
                    return false;
                }
                if(!mini.get("acheck_list").getValue()){
                    layer.msg("请选择某个节点关联的配置项！");
                    return false;
                }
                var data = {};
                data.applicationLevel = mini.get("applicationLevel").getValue();    //应用级别id;
                data.emergencyPlanID = emergencyPlanID;                //某一项的id;
                data.reID = mini.get("acheck_list").getValue();         //关联的id;
                data.treeId = mini.get("tree1").getSelectedNode().id;   //某个选中的节点的id;

                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    timeout:5000,
                    // data:JSON.stringify(data),
                    // dataType: "text",
                    // contentType: "application/json;charset=utf-8",
                    data:$.param(data),
                    dataType:"text",
                    contentType: "application/x-www-form-urlencoded",
                    success: function (result) {
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
                        if(result){
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    }
                })
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                emergencyPlanID = data.emergencyPlanID;    //应急预案id;
                planDefinition = data.planDefinition;      //预案定义类别字段；
                //根据企业code获取企业id;
                orgId = data.orgID;
                page.logic.load_level_menu(function(){
                    //左侧tree组件的数据加载
                    page.logic.load_sidebar();
                });
                page.logic.GetOrgId(function(){
                    //应用级别下拉菜单数据加载

                });
            },
            // //获取企业id;
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
            //进行重置，取消关联
            reset_menu:function(){
                // 接收参数:emergencyPlanID  预案ID   清空预案关联 返回删除的数量
                layer.confirm('重置之后不可恢复，还确定要重置吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url:resetUrl+"?emergencyPlanID="+emergencyPlanID+"&now=" + Math.random(),
                        type: "DELETE",
                        timeout:5000,
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (Data) {
                            ECS.hideLoading();      //隐藏加载；
                            layer.msg("重置成功", {
                                time: 1000
                            }, function () {
                                mini.get("applicationLevel").enable();  //将应用级别下拉框设置为可用状态；
                            });
                        },
                        error:function(err){
                            ECS.hideLoading();      //隐藏加载；
                            //提示错误信息
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }, function (index) {
                    layer.close(index);
                });
            },
            //tree某个节点相关联的数据加载
            onenode_load_dt:function(treeID,cb){
                // 获得树结构对应的下级列表:GET:api/rtt/emergencyPlan/getPlan
                // 接收参数
                // applicationLevel  (应用级别  1,2,3,4,5)
                // treeID  树的ID
                // emergencyPlanID 预案ID
                // 左侧图片为示例    如果预案与对应的对象有关联  则obj属性为其id
                ECS.showLoading();      //显示加载；
                $.ajax({
                    url: checkListUrl + "?applicationLevel=" + mini.get("applicationLevel").getValue() + "&treeID="+treeID+"&emergencyPlanID="+emergencyPlanID+"&now=" + Math.random(),
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        ECS.hideLoading();      //隐藏加载；
                        //某个节点的关联数据：
                        mini.get("acheck_list").load(Data);     //checkboxlist加载选项数据
                        //处理选项数据，将选中的选项数据提取出来，进行拼接
                        var aDefault_val_store = [];
                        for(var w=0;w<Data.length;w++){
                            (function(cur_dt){
                                if(cur_dt["obj"] && cur_dt["obj"]==cur_dt["id"]){
                                    aDefault_val_store.push(cur_dt["id"]);
                                }
                            })(Data[w]);
                        }
                        //某些选项呈选中状态；
                         mini.get("acheck_list").setValue(aDefault_val_store.join(","));

                        $("#acheck_list").parent().css("overflow-y","auto");    //右侧的关联数据盒子设置滚动条；
                        cb && cb();
                    },
                    error:function(err){
                        ECS.hideLoading();      //隐藏加载；
                        //提示错误信息
                        if(err){
                            layer.msg(err,{
                                time: 1000
                            });
                        }
                    }
                });
            },
            //应用级别菜单数据----------------------
            load_level_menu:function(cb){
                $.ajax({
                    url: levelUrl + "?emergencyPlanID="+emergencyPlanID+"&planDefinition="+planDefinition+"&now=" + Math.random(),
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        mini.get("applicationLevel").load(Data);
                        for(var w=0;w<Data.length;w++){
                            if(Data[w]["obj"]){
                                mini.get("applicationLevel").setValue(Data[w]["id"]);    //设置默认值；
                                mini.get("applicationLevel").disable();                 //将下拉框设置为不可用状态；
                            }
                        }
                        cb && cb();
                    },
                    error:function(err){
                        //提示错误信息
                        if(err){
                            layer.msg(err,{
                                time: 1000
                            });
                        }
                    }
                });
            },
            //侧边栏菜单添加
            load_sidebar:function(cb){
                //应用级别没有选择的时候，不再往下执行-------------
                if(mini.get("applicationLevel").getValue()==""){
                   // layer.msg("请选择应用级别！");
                    return false;
                }
                ECS.showLoading();      //显示加载；
                $.ajax({
                    url: leftMenuUrl + "?applicationLevel=" + mini.get("applicationLevel").getValue() + "&emergencyPlanID="+emergencyPlanID+"&orgID="+orgId+"&now=" + Math.random(),
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        ECS.hideLoading();      //隐藏加载；
                        //左侧菜单的数据填充
                        mini.get("tree1").loadList(Data, "id", "pid");
                        $(".mini-splitter-pane1").css("overflow-y","auto");   //设置滚动条
                        //清空右侧某一项关联的数据
                        mini.get("acheck_list").load([]);
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
            select_option:function(menu_url,oPar,selectValue){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    timeout:5000,
                    success:function (data) {
                        mini.get(oPar).loadList(data, "orgId", "orgPID");
                        if(selectValue!=undefined){
                            mini.get(oPar).setValue(selectValue, false);
                        }
                    },
                    error:function(err){
                        //提示错误信息
                        if(err){
                            layer.msg(err,{
                                time: 1000
                            });
                        }
                    }
                })
            },
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