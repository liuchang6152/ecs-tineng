var Team_list = ECS.api.gisPoint;//应急队伍列表查询
var Team_type = ECS.api.rttUrl+"/team/getListByParam?param=teamType&isAll=true";   //队伍类型
var Team_lv = ECS.api.rttUrl+"/team/getListByParam?param=teamLvl";      //队伍级别
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var gisId = "";             //gis点的地图id;
var StaticPointId = "";   //gis点的业务主键id;
var grid = null;          //grid对象；
var isTriggerEdit = false;  //是否进入编辑状态；若是true,那么进入编辑状态；若是false,那么退出编辑状态；
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
            param: {},
            team_type_dt:{},     //应急队伍类型数据
            team_level_dt:{}     //应急队伍级别数据
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                gisId = data.gisId;                     //gis点的地图id;
                StaticPointId = data.StaticPointId;   //gis点的业务主键id;
                $('#title-main').text(data.title);     //弹框的标题存储;
                isTriggerEdit = data.isTriggerEdit;    //存储“是否进入编辑”的标志状态;
                //设置name参数
                page.data.param = {};
                gisId = data.gisId;
                //grid设置url参数
                grid.set({
                    ajaxType:"get",
                    url:Team_list + "/" +data.gisId+"/static/"+data.StaticPointId+"/team"
                });
                grid.load(page.data.param,function(){
                    //若是未编辑状态下，添加不可操作的手势
                    if(!isTriggerEdit){
                        $("#add_one").css("cursor","not-allowed");
                    }
                });
                //加载队伍类型
                page.logic.Team_type_list();
                //加载队伍级别；
                page.logic.Team_lv_list();
            },
            //手机号码的表单校验
            mobile_test:function(e){
                if(e.isValid){
                    var Re_tel = /^1(3|4|5|7|8)\d{9}$/;                              //手机号码
                    if(Re_tel.test(e.value)){
                        e.isValid = true;
                    }else{
                        e.isValid = false;
                    }
                }
            },
            //应急队伍：队伍类型    by yuanshuang
            Team_type_list:function(){
                $.ajax({
                    url: Team_type,
                    type: "GET",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        var cur_dt = [];
                        // console.log("当前获取的数组：",data);
                        for(var i=0;i<data.length;i++){
                            if(data[i]["ID"]!=""){
                                cur_dt.push(data[i]);
                            }
                        }
                        page.data.team_type_dt = cur_dt;
                        cur_dt = null;
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //应急队伍：队伍级别    by yuanshaung
            Team_lv_list:function(){
                $.ajax({
                    url: Team_lv,
                    type: "GET",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                         // console.log("队伍级别：",data);
                         page.data.team_level_dt = data;
                    },
                    error: function (result) {
                        // ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //静态数据：应急队伍类型的数据渲染  by yuanshuang
            team_type_text:function(e){
                var aCur_json = page.data.team_type_dt;
                var get_target_val = "";
                for(var w=0;w<aCur_json.length;w++){
                    (function(cur_key){
                        if(cur_key["ID"]==e.row.teamTypeId){
                            get_target_val = cur_key["NAME"];
                        }
                    })(aCur_json[w]);
                }
                return get_target_val;
            },
            //静态数据：应急队伍级别的数据渲染  by yuanshuang
            team_lv_text:function(e){
                var get_target_val = "",
                    aCur_json = page.data.team_level_dt;
                for(var w=0;w<aCur_json.length;w++){
                    (function(cur_key){
                        if(cur_key["ID"]==e.row.teamLvlId){
                            get_target_val = cur_key["NAME"];
                        }
                    })(aCur_json[w]);
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
                    var s = '<a class="New_Button input_useless"  style="cursor:not-allowed;" href="javascript:;">新增</a>'
                        + ' <a class="Edit_Button input_useless"  style="cursor:not-allowed;" href="javascript:;" >编辑</a>'
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
                    if (confirm("确定删除此记录？")) {
                        grid.loading("删除中，请稍后......");
                        $.ajax({
                            url:ECS.api.gisPoint+"/"+gisId+"/static/"+row.staticPointId+"/team",
                            async: true,
                            dataType: "text",
                            timeout:1000,
                            data:JSON.stringify([row.teamPointId]),
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
                var StaticPointId_edit = row.staticPointId;   //gis业务主键id;
                grid.commitEdit();
                var rowData = grid.getChanges();
                grid.loading("保存中，请稍后......");
                var url = "";                                                        //接口
                var sub_type = "";                                                   //请求方式
                //拼接数据--------------------------------------------------
                // console.log("得到的数据：",rowData);
                var data = {};
                data.teamName = row.teamName;               //队伍名称
                data.teamTypeId = row.teamTypeId;           //队伍类型
                data.teamLvlId = row.teamLvlId;             //队伍级别
                data.personCount = row.personCount;         //人数
                data.vehicleCount = row.vehicleCount;       //车辆数
                data.boatCount = row.boatCount;              //船舶数
                data.ownerName = row.ownerName;              //负责人
                data.ownerContact = row.ownerContact;       //联系方式
                //拼接接口和请求方式
                if(StaticPointId_edit){
                    //修改保存
                    url = ECS.api.gisPoint+"/"+gisId+"/static/"+StaticPointId_edit+"/team/"+row.teamPointId+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;     //接口
                    sub_type = "PUT";                                                                               //请求方式
                    data.staticPointId=row.staticPointId;                                                        //gis业务主键id;
                    data.teamPointId=row.teamPointId;
                }else{
                    //新增保存
                    url = Team_list + "/" +gisId+"/static/"+StaticPointId+"/team?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;          //接口
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