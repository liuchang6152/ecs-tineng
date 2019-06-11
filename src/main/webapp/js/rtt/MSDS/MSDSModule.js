var searchUrl = ECS.api.rttUrl + "/msds";                                                        //查询
var riskTypeUrl = ECS.api.rttUrl + "/riskType/getList";                                        //危险性类别下拉菜单
var saveUrl =  ECS.api.rttUrl + "/msds/set";                                                     //保存
var WarnSaveUrl = ECS.api.apUrl + "/DisposeWarning/RelatedMSDS";                              //危化品添加保存
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';                           //企业名称
var applicationLevel = null;                                                                      //节点层级
var treeId = null;                                                                                 //节点id;
var eventId = null;                                                                                //报警事件id;
var grid = null;                                                                                   //grid表格对象
window.pageLoadMode = PageLoadMode.None;                                                        //页面模式
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                       //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            this.bindUI();                      //绑定事件
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //查询
            $('#btnQuery').click(function () {
                page.data.aSelected_dt = [];    //清空之前所有的选项
                //page.data.selected_list = [];   //清空默认的缓存；
                page.logic.search();             //进行搜索
            });
            //点击关闭按钮，关闭弹框；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //点击确认，进行相关保存；
            $("#btnSave").click(function(){
                page.logic.save();
            });
        },
        data: {
            param: {},
            selected_list:[],      //列表默认情况下选择的数据
            aSelected_dt:[]         //列表操作行选中与否之后，选中的数据缓存；
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);              //页面标题
                pageMode = data.pageMode;                       //页面模式
                applicationLevel = data.applicationLevel?data.applicationLevel:"";     //节点层级;
                treeId = data.treeId?data.treeId:"";                            //节点id;
                eventId = data.eventId?data.eventId:"";                         //报警事件id(参数来源于处警模块)
                page.data.selected_list = data.IdList?data.IdList:[];          //选择的数据；
                //危险性分类下拉菜单的数据加载
                page.logic.danger_menu(function(){});
                page.logic.initTable();             //初始化表格
            },
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.on("load",page.logic.search(true));
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                //企业名称下拉数据
                page.logic.select_option(riskAreaTypeNameUrl,"orgId",function(){
                    page.logic.search(true);    //列表数据渲染
                });
                //gis点的动态数据 表1：当分页跨页的时候，表格加载成功以后，进行监听；
                grid.on("load",function(){
                    //当翻页以后，对当前的数据进行选中操作；
                    grid.selects(page.data.aSelected_dt);
                });
                //当行有变化的时候，将数据存储；
                grid.on("selectionchanged",function(e){
                    //若没有变化的行数，不再往下执行
                    if(e.records.length==0){
                        return false;
                    }
                    //剔除掉所有不可勾选的；
                    for(var w=0;w<e.records.length;w++){
                        if(grid.isSelected(e.records[w])){
                            //选中，进行缓存；
                            page.logic.save_selected(e.records[w],true);
                        }else{
                            //取消选中，剔除其相应的缓存
                            page.logic.save_selected(e.records[w],false);
                        }
                    }
                });
            },
            //缓存选中的数据
            //参数说明：
            //第一个参数表示：当前点击的行；
            //第二个参数表示当前点击的这条行数据是否为选中状态；
            save_selected:function(row,isSelected){
                var isHave = false;    //默认不存在；
                var cur_index = null;      //表示row这条数据在已存在的缓存里的位置；
                for(var w=0;w<page.data.aSelected_dt.length;w++){
                    (function(cur_key,index){
                        if(cur_key.msdsId==row.msdsId){
                            isHave = true;
                            cur_index = index
                        }
                    })(page.data.aSelected_dt[w],w);
                }
                if(isSelected){
                    //若选中的数据，缓存里没有，那么就添加；
                    if(!isHave){
                        page.data.aSelected_dt.push(row);
                    }
                }else{
                    //若是未选中的数据，缓存里有，那么剔除掉；
                    if(isHave){
                        page.data.aSelected_dt.splice(cur_index,1);
                    }
                }
            },
            //列表，选中的进行保存；
            save:function(){
                if(page.data.aSelected_dt.length==0){
                    layer.msg("请选择要保存的数据!");
                    return;
                }
                if(applicationLevel){
                    var idsArray = new Array();
                    for(var w=0;w<page.data.aSelected_dt.length;w++){
                        idsArray.push(page.data.aSelected_dt[w]["msdsId"]);
                    }
                    for(var i = 0;i < page.data.selected_list.length;i ++){
                        idsArray.push(page.data.selected_list[i]);
                    }
                    var arr = [];    //定义一个临时数组
                    for(var i = 0; i < idsArray.length; i++){    //循环遍历当前数组
                        //判断当前数组下标为i的元素是否已经保存到临时数组
                        //如果已保存，则跳过，否则将此元素保存到临时数组中
                        if(arr.indexOf(idsArray[i]) == -1){
                            arr.push(idsArray[i]);
                        }
                    }
                    idsArray = arr;
                    $.ajax({
                        url: saveUrl+"?applicationLevel="+applicationLevel+"&treeId="+treeId,
                        async: false,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'POST',
                        success: function (result) {
                            result = JSON.parse(result);
                            if(result.isSuccess){
                                layer.msg(result.message);
                                page.logic.closeLayer(true);
                            }else{
                                layer.msg(result.message);
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }else{
                    //来自于处警开发模块
                    //拼接数据
                    var idsArray = new Array();
                    for(var w=0;w<page.data.aSelected_dt.length;w++){
                        (function(cur_dt){
                            var one_dt = {};
                            one_dt["relatedMsdsId"] = null;
                            one_dt["eventId"] = eventId;
                            one_dt["msdsId"] = cur_dt.msdsId;
                            one_dt["isUsed"] = 1;
                            idsArray.push(one_dt)
                        })(page.data.aSelected_dt[w]);
                    }
                    //提交数据
                    $.ajax({
                        url: WarnSaveUrl,
                        async: false,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'POST',
                        success: function (result) {
                            result = JSON.parse(result);
                            if(result.isSuccess){
                                layer.msg(result.message);
                                page.logic.closeLayer(true);
                            }else{
                                layer.msg(result.message);
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
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
                        //企业加载下拉菜单-------------------
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
                    }
                })
            },
            //显示危险性类别
            show_risktype:function(e){
                if($.trim(e.row.riskType)==""){
                    return "空";
                }else{
                    return e.row.riskType;
                }
            },
            //危险性 （列表参数解析）
            param_danger:function(e){
                switch (e.row.risk){
                    case 1:
                        return '<span style="color:cornflowerblue;">有</span>';
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //急救措施 （列表参数解析）
            param_firstAidMeasure:function(e){
                switch (e.row.firstAidMeasure){
                    case 1:
                        return '<span style="color:cornflowerblue;">有</span>';
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //消防措施 （列表参数解析）
            param_fireMeasure:function(e){
                switch (e.row.fireMeasure){
                    case 1:
                        return '<span style="color:cornflowerblue;">有</span>';
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //泄露应用处理 （列表参数解析）
            param_revealHandle:function(e){
                switch (e.row.revealHandle){
                    case 1:
                        return '<span style="color:cornflowerblue;">有</span>';
                        break;
                    case 0:
                        return "无";
                        break;
                }
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
            /**
             * 搜索
             */
            search: function (sort) {
                /*
                所需参数：
                orgId//企业ID
                msdsChineseName//危化品中文名
                casno//CAS.No
                riskType  //危险性类别。   字符串，用逗号隔开
                */
                page.data.param = {};                 //初始化参数对象
                page.data.param = ECS.form.getData("searchForm");
                //排序
                if(sort){
                    page.data.param["sortType"]=1;
                }
                //企业名称数据处理；
                if(mini.get("orgId").getSelected()){
                    page.data.param["orgId"] = mini.get("orgId").getSelected().orgId;
                }else{
                    //取默认存储的值；
                    page.data.param["orgId"] = "";
                }
                //危险性类别；
                page.data.param["riskType"] = mini.get("riskType").getValue();
                grid.load(page.data.param,function(){
                    grid.deselectAll();
                   //  //判断默认从父页面拉过来的数据是否存在于缓存里
                   // for(var i=0;i<page.data.selected_list.length;i++){
                   //      for(var w=0;w<grid.getData().length;w++){
                   //          if(grid.getData()[w].msdsId==page.data.selected_list[i]){
                   //              page.logic.store_dt(grid.getData()[w].msdsId,grid.getData()[w]);
                   //          }
                   //      }
                   // }
                   //  //page.data.selected_list = [];       //清空默认的缓存，以免往后页面多次操作；
                   //  //让缓存的数据，在列表里进行选中；
                   //  if(page.data.aSelected_dt.length==0){
                   //      grid.deselectAll();
                   //  }else{
                   //      grid.selects(page.data.aSelected_dt);
                   //  }
                });
            },
            //将不存在的id存进来；
            //参数说明：第一个参数：某一行的id; 第二个参数：某一行的数据；
            store_dt:function(id,record_dt){
                var isIn = false;        //判断是否存在于缓存里，若存在，那么为true;若不存在，那么为false;
                for(var m=0;m<page.data.aSelected_dt.length;m++){
                    if(page.data.aSelected_dt[m].msdsId==id){
                        isIn = true;
                        break;
                    }
                }
                if(!isIn){
                    page.data.aSelected_dt.push(record_dt);
                }
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});