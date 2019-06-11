var delUrl = ECS.api.emUrl + '/Device';//删除
var useUrl = ECS.api.emUrl + '/Device/updateDeviceInuse';//修改启用禁用
var searchUrl = ECS.api.emUrl + '/Device';//查询
var enterpriseUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var deviceCategUrl = ECS.api.emUrl + '/Device/deviceByDeviceCatg'; //设备大类
var deviceTypeUrl = ECS.api.emUrl + '/Device/deviceByDeviceType'; //设备小类
window.pageLoadMode = PageLoadMode.None;
var exportUrl = ECS.api.emUrl + '/Device/ExportToExcel';  //导出
$(function () {
    var page = {
        //页面初始化
        init: function () {
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();
            $("#searchForm").find('input').val("");
            page.logic.cbxEnterprise();//企业
            page.logic.cbxDeviceCateg();//大类
            page.logic.cbxDeviceType();//小类
            page.logic.initTable();
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });

                 // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
            
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
              
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {

            setUrlK: function (ojson) {

				var s = '', name, key;

				for (var p in ojson) {

					// if(!ojson[p]) {return null;} 

					if (ojson.hasOwnProperty(p)) { name = p };

					key = ojson[p];

					s += "&" + name + "=" + encodeURIComponent(key);

				};

				return s.substring(1, s.length);

			},
            /**
             * 初始化表格
             */
            initTable: function () {
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                if(e.row.inUse==1){
                    return '<a title="启用" href="javascript:window.page.logic.inUse(\'' + e.row.deviceId +'\',\''+e.row.inUse+'\')"><i class="icon-enable"></i></a>　|　'+
                        '<a title="编辑" href="javascript:window.page.logic.edit(\'' + e.row.deviceId +'\')"><i class="icon-edit edit"></i></a>　|　'+
                        '<a title="状态列表配置" href="javascript:window.page.logic.deploy(\'' + e.row.deviceId +'\',\''+e.row.deviceName+'\')"><i class="icon-deploy history"></i></a>';
                }else{
                    return '<a title="禁用" href="javascript:window.page.logic.inUse(\'' + e.row.deviceId +'\',\''+e.row.inUse+'\')"><i class="icon-disable del"></i></a>　|　'+
                        '<a title="编辑" href="javascript:window.page.logic.edit(\'' + e.row.deviceId +'\')"><i class="icon-edit edit"></i></a>　|　'+
                        '<a title="状态列表配置" href="javascript:window.page.logic.deploy(\'' + e.row.deviceId +'\',\''+e.row.deviceName+'\')"><i class="icon-deploy history"></i></a>';
                }
            },
            // 设备状态
            show_status:function(e){
                return e.row.deviceOperationPattern+"(激活)";
            },
            //修改启用禁用
            inUse:function(deviceId,inUse){
                var data=new Array();
                if(inUse=="0"){
                    data["inUse"]="1";
                }else{
                    data["inUse"]="0";
                }
                $.ajax({
                    url: useUrl+"/"+deviceId+"/"+data["inUse"],
                    async: false,
                    type: "PUT",
                    data:$.param(data),
                    dataType: "text",
                    success: function (result) {
                        if (result.indexOf('collection') < 0) {
                            layer.msg("修改成功！", {
                                time: 1000
                            }, function () {
                                grid.reload();
                            });
                        } else {
                            result = JSON.parse(result);
                            layer.msg(result.collection.error.message);
                        }
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
            },
            /**
             * 企业
             */
            cbxEnterprise:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectFirstRecord: true,
                        async:false,
                        keyField: "orgCode",
                        valueField: "orgSname"
                    }, null);
                }else{
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async:false,
                        keyField: "orgCode",
                        valueField: "orgSname"
                    }, null);
                    $("#enterpriseCode").attr("disabled",true);
                }
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
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.deviceId);
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要删除的数据!");
                    return;
                }
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: false,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        success: function (result) {
                            if (result.indexOf('collection') < 0) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    grid.reload();
                                });
                            } else {
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message);
                            }
                        },
                        error: function (result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "应急设备维护新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param deviceId
             */
            edit: function (deviceId) {
                var pageMode = PageModelEnum.Edit;
                var title = "应急设备维护编辑";
                page.logic.detail(title, deviceId, pageMode);
            },
            /**
             * 新增或者编辑详细页面
             */
            detail: function (title, deviceId, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'DeviceAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "deviceId": deviceId,
                            'title': title
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
             * 状态列表配置
             */
            deploy:function(deviceId,deviceName){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['600px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'deploy.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "deviceId": deviceId,
                            "deviceName":deviceName
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        page.logic.search(true);
                    }
                })
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
                grid.load(page.data.param);
            }
            ,
            imp: function () {
                var impUrl = ECS.api.emUrl +'/Device/importExcel'; 
                var exportUrl =  ECS.api.emUrl +'/Device/ExportExcel'; 
                var confirmUrl =  ECS.api.emUrl +'/Device/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});