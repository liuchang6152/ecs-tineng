var leftMenuUrl = ECS.api.rttUrl + '/msds/getTreeList'  ;              //左侧树级菜单
var checkListUrl = ECS.api.rttUrl + "/msds/getRightList";              //获取某个节点下的选项数据；
var delLinkAll =  ECS.api.rttUrl +"/msds/reset";                        //删除
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';   //企业名称
var loadUnitsUrl = ECS.api.rttUrl + "/msds/secunit";                   //二级单位
window.pageLoadMode = PageLoadMode.None;                                                                   //页面模式
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                       //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            this.bindUI();                      //绑定事件
            page.logic.initTable();             //初始化加载数据
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //侧边栏菜单添加点击,进行查询某一项相关联的数据
            mini.get("tree1").on("nodeselect", function (e){
                page.logic.onenode_load_dt();
            });
            //企业的下拉菜单值改变的时候，加载二级单位下拉菜单的数据；
            mini.get("orgId").on("valuechanged",function(){
                //加载二级单位的数据
                page.logic.load_units();
            });
            //当二级单位的下拉菜单值改变的时候，加载左侧tree菜单的数据；
            mini.get("deptcoder").on("valuechanged",function(){
                //加载二级单位的数据
                page.logic.load_sidebar(function(){
                    //刷新某个节点关联的数据；
                    page.logic.onenode_load_dt();
                });
            });
            //当点击“添加危化品”的时候，展示“危化品信息页面”；
            $("#btnAdd").on("click",function(){
                page.logic.add();
            });
            //点击删除的时候，当前某个节点关联的数据，勾选的，删除掉，并刷新此页面；
            $("#btnDel").on("click",function(){
                //删除当前节点已关联的相关勾选数据；
                page.logic.del_option_checked();
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化表格
             */
            initTable: function () {
                //加载企业；
                page.logic.load_enterprise(function(){
                    page.logic.load_units(function(){
                        page.logic.load_sidebar();
                    });//加载二级单位
                });
            },
            //删除当前节点已关联的相关勾选数据；
            del_option_checked:function(){
                if(mini.get("acheck_list").getValue()==""){
                    layer.msg("请选择需要删除的危化品数据！");
                    return false;
                }
                var idsArray = [];
                idsArray = mini.get("acheck_list").getValue().split(",");
                $.ajax({
                    url: delLinkAll + "?treeId=" + mini.get("tree1").getSelectedNode().id + "&applicationLevel="+ mini.get("tree1").getSelectedNode().obj +"&now=" + Math.random(),
                    type: "DELETE",
                    data: JSON.stringify(idsArray),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (result) {
                        result = JSON.parse(result)
                        if(result.isSuccess){
                            layer.msg(result.message);
                            //刷新左侧菜单，同时让之前的某个菜单节点还呈选中状态；
                            page.logic.load_sidebar(function(){
                                //刷新某个节点关联的数据；
                                page.logic.onenode_load_dt();
                            });
                        }else{
                            layer.msg(result.message);
                        }
                    }
                })
            },
            //tree某个节点相关联的数据加载
            onenode_load_dt:function(cb){
                ECS.showLoading();      //显示加载；
                if(!mini.get("tree1").getSelectedNode()){
                    ECS.hideLoading();      //隐藏加载；
                    return false;
                }
                $.ajax({
                    url: checkListUrl + "?treeId=" + mini.get("tree1").getSelectedNode().id +"&now=" + Math.random(),
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        ECS.hideLoading();      //隐藏加载；
                        mini.get("acheck_list").load(Data);     //checkboxlist加载选项数据
                        cb && cb(Data);
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
            //加载企业的下拉菜单数据
            load_enterprise:function(cb){
                $.ajax({
                    url:riskAreaTypeNameUrl,
                    type:"get",
                    timeout:5000,
                    success:function (data) {
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //企业
                        mini.get("orgId").load(data);
                        //若是总部用户，那么可用；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("orgId").setValue(data[0].orgId);
                        }else{
                            //若是企业用户，设置为不可用状态；
                            mini.get("orgId").disable();
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("orgId").setValue(cur_key.orgId);
                                    }
                                })(data[w]);
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
            //加载二级单位的下拉菜单数据
            load_units:function(cb){
                $.ajax({
                    url:loadUnitsUrl+"?orgId="+mini.get("orgId").getValue(),
                    type:"get",
                    timeout:5000,
                    success:function (data) {
                        //加载数据
                        mini.get("deptcoder").load(data);
                        //默认第一个选中
                        for(var w=0;w<data.length;w++){
                            if(data[w].id){
                                mini.get("deptcoder").setValue(data[w].id);
                                page.logic.load_sidebar(function(){
                                   
                                });
                                break;
                            }
                        }
                        cb && cb();
                    }
                });
            },
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "危化品信息";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 危化品信息页面
             */
            detail: function (title, msdsId, pageMode) {
                //获取某个节点的相关联的项的数据；
                page.logic.onenode_load_dt(function(data){
                    var aChild_list = [];
                    //拼接数据
                    for(var w=0;w<data.length;w++){
                        aChild_list.push(data[w]["id"])
                    }
                    //打开危化品信息页面
                    layer.open({
                        type: 2,
                        closeBtn: 0,
                        area: ['850px', '450px'],
                        skin: 'new-class',
                        shadeClose: false,
                        title: false,
                        content: 'MSDSModule.html?' + Math.random(),
                        success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            var data = {
                                "pageMode": pageMode,
                                "IdList":aChild_list,
                                "applicationLevel": mini.get("tree1").getSelectedNode().obj,    //节点的层级
                                "treeId": mini.get("tree1").getSelectedNode().id,                //节点的treeid
                                "orgId":mini.get("orgId").getSelected().orgId,                   //企业id
                                'title': title                                                     //标题
                            };
                            iframeWin.page.logic.setData(data);
                        },
                        end: function () {
                            //刷新左侧菜单，同时让之前的某个菜单节点还呈选中状态；
                            page.logic.load_sidebar(function(){
                                //重新加载左侧tree某个节点相关联的数据
                                page.logic.onenode_load_dt();
                            });
                            // page.logic.onenode_load_dt();    //重新加载左侧tree某个节点相关联的数据
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    })
                });
            },
            //侧边栏菜单添加
            load_sidebar:function(cb){
                var oCur_node = null;
                if(mini.get("tree1").getSelected()){
                    oCur_node = mini.get("tree1").getSelected();    //之前选中的节点；
                }
                // ECS.showLoading();      //显示加载；
                //若没有选中的，便不再继续往下执行
                if(!mini.get("orgId").getSelected()){
                    return false;
                }
                $.ajax({
                    url: leftMenuUrl + "?orgCode="+mini.get("orgId").getSelected().orgCode+"&treeID=" + mini.get("deptcoder").getValue() +"&now=" + Math.random(),
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        // ECS.hideLoading();      //隐藏加载；
                        //左侧菜单的数据填充
                        mini.get("tree1").loadList(Data, "id", "pid");
                        if(oCur_node){
                            //之前选中的点进行刷新；
                            mini.get("tree1").selectNode(oCur_node);
                            if(!mini.get("tree1").getSelected()){
                                //默认第一项呈选中状态；
                                mini.get("tree1").selectNode(Data[0]);
                            }
                        }else{
                            //默认第一项呈选中状态；
                            mini.get("tree1").selectNode(Data[0]);
                        }
                        //清空右侧某一项关联的数据
                        mini.get("acheck_list").load([]);
                        //设置左侧的滚动条
                        $("#tree1").parent().css("overflow-y","auto");
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
            }
        }
    };
    page.init();
    window.page = page;
});