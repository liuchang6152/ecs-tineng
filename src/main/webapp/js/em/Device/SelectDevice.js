var searchAddUrl = ECS.api.emUrl + '/DispatchDeviceConfig/getDevice';//点击新增查询页面
var addUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//保存
var enterpriseUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var deviceCategUrl = ECS.api.emUrl + '/Device/deviceByDeviceCatg'; //设备大类
var deviceTypeUrl = ECS.api.emUrl + '/Device/deviceByDeviceType'; //设备小类
var addObj;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            page.logic.cbxDeviceCateg();//大类
            page.logic.cbxDeviceType();//小类
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
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
            setData:function(data){
                addObj = data;
                grid = mini.get("datagrid");
                grid.set({url:searchAddUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                if(data.teamID){
                    grid.load({ "baseModelCategory":data.baseModelCategory ,"baseDataId":data.baseDataId,
                        "teamID":data.teamID,"enterpriseID": data.enterpriseID , "deviceMode":data.deviceMode});
                }else{
                    grid.load({ "baseModelCategory":data.baseModelCategory ,"baseDataId":data.baseDataId,
                        "enterpriseID": data.enterpriseID , "deviceMode":data.deviceMode});
                }
                page.logic.cbxEnterprise(data.enterpriseID);//企业
            },
            // 设备状态
            show_status:function(e){
                return e.row.activationPattern+"(激活)";
            },
            /**
             * 企业
             */
            cbxEnterprise:function(slecetOrgId){
                ECS.ui.getCombobox("enterpriseID", enterpriseUrl, {
                    selectValue: addObj.enterpriseID,
                    keyField: "orgId",
                    valueField: "orgSname"
                }, null);
                $("#enterpriseID").attr("disabled",true);
            },
            /**
             * 大类
             */
            cbxDeviceCateg:function(){
                ECS.ui.getCombobox("deviceCatgId", deviceCategUrl, {
                    selectValue: "",
                    data:{
                        'isAll':true
                    }
                }, null,page.logic.cbxDeviceType);
            },
            /**
             * 小类
             */
            cbxDeviceType:function(pid){
                ECS.ui.getCombobox("deviceTypeId", deviceTypeUrl, {
                    selectValue: "",
                    data:{
                        'isAll':true,
                        'deviceCatgId':pid
                    }
                }, null);
            },
            /**
             * 保存
             */
            save: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.deviceId);
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要新增的数据!");
                    return;
                }
                if(addObj.teamID){
                    var data = {
                        "deviceIDList":idsArray,
                        "enterpriseID":addObj.enterpriseID,
                        "deviceMode":"2",
                        "baseModelCategory":"2",
                        "baseDataId":addObj.enterpriseID,
                        "teamID":addObj.teamID
                    };
                }else{
                    var data = {
                        "deviceIDList":idsArray,
                        "enterpriseID":addObj.enterpriseID,
                        "deviceMode":addObj.deviceMode,
                        "baseModelCategory":addObj.baseModelCategory,
                        "baseDataId":addObj.baseDataId
                    };
                }

                //处理提交类型
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: "POST",
                    data:JSON.stringify(data),
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
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            /**
             * 搜索
             */
            search: function () {
                var searchParam={};
                var oldSearch={};
                if(addObj.teamID){
                    oldSearch={ "baseModelCategory":addObj.baseModelCategory ,"baseDataId":addObj.baseDataId,
                        "teamID":addObj.teamID,"enterpriseID": addObj.enterpriseID ,
                        "deviceMode":addObj.deviceMode};
                }else{
                    oldSearch={ "baseModelCategory":addObj.baseModelCategory ,"baseDataId":addObj.baseDataId,
                        "enterpriseID": addObj.enterpriseID , "deviceMode":addObj.deviceMode};
                }
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
                searchParam=$.extend(page.data.param , oldSearch);
                grid.load(searchParam);
            }
        }
    };
    page.init();
    window.page = page;
});