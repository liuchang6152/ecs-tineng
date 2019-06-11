var Storage_list = ECS.api.gisPoint;                                             //应急物资存放点列表
var storage_type_url = ECS.api.rttUrl+"/mtrlStorage/getStoreTypeEnumList";  //存放点类型接口
var repository_type_url = ECS.api.rttUrl+"/mtrlStorage/getRepoTypeEnumList";//储备库类型接口
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var gisId = "";            //gis点的地图id;
var StaticPointId = "";   //gis点的业务主键id;
var isTriggerEdit = false;  //是否进入编辑状态；若是true,那么进入编辑状态；若是false,那么退出编辑状态；
var grid = null;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            ECS.sys.RefreshContextFromSYS();    //获取用户的相关数据；
            mini.parse();
            grid = mini.get("datagrid");
            this.bindUI();
        },
        bindUI: function () {
            //点击关闭按钮，进行关闭；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            document.oncontextmenu=new Function("return false");
        },
        data: {
            param: {},                   //参数设置
            storage_type_dt:{},         //存放点类型数据
            repository_type_dt:{}      //存储库类型数据
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                gisId = data.gisId;                     //gis点的地图id;
                StaticPointId = data.StaticPointId;   //gis点的业务主键id;
                $('#title-main').text(data.title);     //存储弹框的标题；
                isTriggerEdit = data.isTriggerEdit;   //存储“是否进入编辑”的标志；
                //设置name参数
                page.data.param = {};
                gisId = data.gisId;
                //grid设置url参数
                grid.set({
                    ajaxType:"get",
                    url:Storage_list + "/" +data.gisId+"/static/"+data.StaticPointId+"/storage"
                });
                grid.load(page.data.param,function(){
                    //若是未编辑状态下，添加不可操作的手势
                    if(!isTriggerEdit){
                        $("#add_one").css("cursor","not-allowed");
                    }
                });
                page.logic.storage_type_list();        //存放点类型的数据加载
                page.logic.repository_type_list();     //存储库类型的数据加载
            },
            //存放点类型数据的渲染
            storage_type_list:function(){
                $.ajax({
                    url: storage_type_url,
                    type: "GET",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        page.data.storage_type_dt = data;
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //存储库类型数据的渲染
            repository_type_list:function(){
                $.ajax({
                    url: repository_type_url,
                    type: "GET",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        page.data.repository_type_dt = data;
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //筛选相应的存放点类型数据
            storage_type_text:function(e){
                var aCur_json = page.data.storage_type_dt;
                var get_target_val = "";
                for(var w=0;w<aCur_json.length;w++){
                    (function(cur_key){
                        if(cur_key["key"]==e.row.storeType){
                            get_target_val = cur_key["value"];
                        }
                    })(aCur_json[w])
                }
                return get_target_val;
            },
            //筛选相应的存储库类型数据
            repository_type_text:function(e){
                var aCur_json = page.data.repository_type_dt;
                var get_target_val = "";
                for(var w=0;w<aCur_json.length;w++){
                    (function(cur_key){
                        if(cur_key["key"]==e.row.repoType){
                            get_target_val = cur_key["value"];
                        }
                    })(aCur_json[w])
                }
                return get_target_val;
            },
            //静态数据：操作按钮的展示（新增、编辑、删除、更新、取消）  by yuanshuang
            onActionRenderer:function(e) {
                var cur_grid3 = e.sender;
                var record2 = e.record;
                var uid = record2._uid;
                var rowIndex = e.rowIndex;
                if(isTriggerEdit){
                    var s = '<a class="New_Button" href="javascript:page.logic.newRow()">新增</a>'
                        + ' <a class="Edit_Button" href="javascript:page.logic.editRow(\'' + uid + '\')" >编辑</a>'
                        + ' <a class="Delete_Button" href="javascript:page.logic.delRow(\'' + uid + '\')">删除</a>';
                }else{
                    var s = '<a class="New_Button input_useless" style="cursor:not-allowed;" href="javascript:;">新增</a>'
                        + ' <a class="Edit_Button input_useless" style="cursor:not-allowed;" href="javascript:;" >编辑</a>'
                        + ' <a class="Delete_Button input_useless" style="cursor:not-allowed;" href="javascript:;">删除</a>';
                }
                if (cur_grid3.isEditingRow(record2)) {
                    s = '<a class="Update_Button" style="margin-right:10px;" href="javascript:page.logic.updateRow(\'' + uid + '\')">更新</a>'
                        + '<a class="Cancel_Button" href="javascript:page.logic.cancelRow(\''+ uid + '\')">取消</a>';
                }
                return s;
            },
            //静态数据：新增一行
            newRow:function() {
                if(!isTriggerEdit){
                    //禁止跳转
                    var event = event || window.event;
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
                var row = {};
                grid.addRow(row, 0);
                grid.cancelEdit();
                grid.beginEditRow(row);
            },
            //静态数据：编辑一行
            editRow:function(row_uid) {
                var row = grid.getRowByUID(row_uid);
                if (row) {
                    grid.cancelEdit();
                    grid.beginEditRow(row);
                }
            },
            //静态数据：取消保存行
            cancelRow:function(row_uid) {
                grid.reload();
            },
            //静态数据：删除行
            delRow:function(row_uid) {
                var row = grid.getRowByUID(row_uid);
                if (row) {
                    // var GisId = row.gisId;                   //gis地图点的Id
                    var StaticPointId = row.staticPointId;   //gis业务主键id;
                    if (confirm("确定删除此记录？")) {
                        grid.loading("删除中，请稍后......");
                        $.ajax({
                            url:ECS.api.gisPoint+"/"+gisId+"/static/"+StaticPointId+"/storage",
                            async: true,
                            dataType: "text",
                            timeout:1000,
                            data:JSON.stringify([row.storagePointId]),
                            contentType: "application/json;charset=utf-8",
                            type: 'DELETE',
                            success: function (text) {
                                grid.reload();
                            },
                            error: function () {
                            }
                        });
                    }
                }
            },
            //保存行
            updateRow:function(row_uid) {
                //校验非空
                var form = new mini.Form("#datagrid");
                form.validate();
                if (form.isValid() == false) return;

                //请求后端，拼接数据
                var row = grid.getRowByUID(row_uid);
                var GisId = row.gisId;                   //gis地图点的Id
                var StaticPointId_edit = row.staticPointId;   //gis业务主键id;
                 grid.commitEdit();
                var rowData = grid.getChanges();
                grid.loading("保存中，请稍后......");
                var url = "";                                                        //接口
                var sub_type = "";                                                   //请求方式
                //拼接数据------------
                var data = {};
                data.storageName = row.storageName;       //应急物资存放点名称
                data.storeType = row.storeType;           //存放点类型
                data.repoType = row.repoType;             //存储库类型
                //拼接接口和请求方式
                if(StaticPointId_edit){
                    //修改保存
                    url = Storage_list + "/" +gisId+"/static/"+row.staticPointId+"/storage/"+row.storagePointId+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;     //接口
                    sub_type = "PUT";                                                                               //请求方式
                    data.staticPointId=row.staticPointId;                                                        //gis业务主键id;
                    data.storagePointId = row.storagePointId;                                                   //应急物资存放点id;
                }else{
                    //新增保存
                    url = Storage_list + "/" +gisId+"/static/"+StaticPointId+"/storage?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;          //接口
                    sub_type = "POST";                                                           //请求方式
                    data.staticPointId = StaticPointId;                                        //gis业务主键id;
                }
                $.ajax({
                    url: url,
                    type:sub_type,
                    data: JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (text) {
                        grid.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        // alert(jqXHR.respopnseText);
                    }
                });
            },
            //查看下，是否可点击
            isClick:function(e){
                var record2 = e.record;
                var uid = record2._uid;
                if(e.row.storagePointId){
                    return '<button class="btn btn-primary btn-sm" onclick="javascript:page.logic.GotoPage(\'' + uid + '\')">编辑</button>';
                }else{
                    return '<button class="btn btn-primary btn-sm input_useless" style="border:#CCCCCC solid 1px;cursor:not-allowed;" onclick="javascript:;">编辑</button>';
                }
            },
            /*
            应急物资列表查看：
            跳转页面前，搭配参数
            */
            GotoPage:function(Row_uid){
                var row = grid.getRowByUID(Row_uid),
                    GisId = gisId,                        //gis地图点的Id
                    StaticPointId = row.staticPointId,   //gis业务主键id;
                    StorageId = row.storagePointId,      //应急物资存放点id;
                    title = "应急物资列表";
                page.logic.detail(title,GisId,StaticPointId,StorageId);
            },
            /**
             * 查看字表页面
             * 参数列表：
             * 第一个参数表示：弹框的标题；
             * 第二个参数表示：gis地图点的id;
             * 第三个参数表示：gis点的业务主键id;
             * 第四个参数表示：应急物资存放点id;
             * */
            detail: function (title, GisId, StaticPointId,StorageId) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['500px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'StaticMtrl.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "gisId": GisId,                         //gis点的id;
                            "StaticPointId":StaticPointId,         //gis点的主键业务id;
                            'title': title,                         //标题;
                            "StorageId":StorageId,                  //应急物资存放点id;
                            'isTriggerEdit':isTriggerEdit         //存储“是否编辑”状态；
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
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
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    rules: {}
                })
            }
        }
    }
    page.init();
    window.page = page;
})