var Storage_list = ECS.api.gisPoint;//应急物资列表查询
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var gisId = "";             //gis点的地图id;
var StaticPointId = "";   //gis点的业务主键id;
var StorageId = "";       //应急物资存放点id;
var isTriggerEdit = false;  //是否进入编辑状态；若是true,那么进入编辑状态；若是false,那么退出编辑状态；
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();    //获取用户的相关数据；
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
            aStatic_list:[{ id: 1, text: '消防栓' }, { id: 2, text: '消防站'}, { id: 3, text: '消防炮'}, { id: 4, text: '门口/出入口'}, { id: 5, text: '应急队伍点'}, { id: 6, text: '物资存放点'}],
            aType_list:{"1":"消防栓","2":"消防站","3":"消防炮","4":"门口/出入口","5":"应急队伍点","6":"物资存放点"}
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                gisId = data.gisId;                     //gis点的地图id;
                StaticPointId = data.StaticPointId;   //gis点的业务主键id;
                StorageId = data.StorageId;            //应急物资存放点id;
                $('#title-main').text(data.title);     //弹框标题;
                isTriggerEdit = data.isTriggerEdit;    //存储“是否进入编辑”的标志状态;
                //设置name参数
                page.data.param = {};
                //grid设置url参数
                grid.set({
                    ajaxType:"get",
                    url:Storage_list + "/" +data.gisId+"/static/"+data.StaticPointId+"/storage/"+data.StorageId+"/mtrl"
                });
                grid.load(page.data.param,function(){
                    //若是未编辑状态下，添加不可操作的手势
                    if(!isTriggerEdit){
                        $("#add_one").css("cursor","not-allowed");
                    }
                });
            },
            //开始部分------------------------------------------------------------
            //静态数据：Gis点的点类型的实现  by yuanshuang
            gispointtype:function(e){
                return page.data.aType_list[e.row.pointType];
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
                    if (confirm("确定删除此记录？")) {
                        grid.loading("删除中，请稍后......");
                        $.ajax({
                            url:Storage_list+"/"+gisId+"/static/"+StaticPointId+"/storage/"+StorageId+"/mtrl",
                            async: true,
                            dataType: "text",
                            timeout:1000,
                            data:JSON.stringify([row.staticMtrlId]),
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
                var StaticMtrlId = row.staticMtrlId;   //应急物资的id;
                grid.commitEdit();
                var rowData = grid.getChanges();
                grid.loading("保存中，请稍后......");
                var url = "";                                                        //接口
                var sub_type = "";                                                   //请求方式
                //拼接数据--------------------------------------------------
                var data = {};
                data.storagePointId = StorageId;                //应急物资存放点id;
                data.mtrlName = row.mtrlName;                  //物资名称
                data.mtrlAmount = row.mtrlAmount;             //库存量
                data.mesUnit = row.mesUnit;                    //计量单位
                data.ownerName = row.ownerName;               //负责人
                data.ownerContact = row.ownerContact;        //联系方式
                //data.staticPointId=StaticPointId;            //gis业务主键id;
                //拼接接口和请求方式
                if(StaticMtrlId){
                    //修改保存
                    url = Storage_list+"/"+gisId+"/static/"+StaticPointId+"/storage/"+StorageId+"/mtrl/"+row.staticMtrlId+"?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;     //接口
                    sub_type = "PUT";                                                                                                       //请求方式
                    data.staticMtrlId = row.staticMtrlId;
                }else{
                    //新增保存
                    url = Storage_list+"/"+gisId+"/static/"+StaticPointId+"/storage/"+StorageId+"/mtrl?enterprise="+ECS.sys.Context.SYS_ENTERPRISE_CODE;          //接口
                    sub_type = "POST";                                                                                   //请求方式
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
            //结束部分------------------------------------------------------------
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