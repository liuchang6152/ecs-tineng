var delUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//删除
var searchUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//表格查询
var addUrl = ECS.api.emUrl + '/DispatchDeviceConfig/getDevice';//点树形结构新增
var enterpriseUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var deviceCategUrl = ECS.api.emUrl + '/Device/deviceByDeviceCatg'; //设备大类
var deviceTypeUrl = ECS.api.emUrl + '/Device/deviceByDeviceType'; //设备小类
var riskArea_url = ECS.api.emUrl + '/DispatchDeviceConfig/getTreeList'; //树形结构
var exportUrl = ECS.api.emUrl + '/DispatchDeviceConfig/ExportToExcel';  //导出
window.pageLoadMode = PageLoadMode.None;
var orgId="";
var flag=false;
var addObj;
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            page.logic.cbxEnterprise();//企业
            page.logic.cbxDeviceCateg();//大类
            page.logic.cbxDeviceType();//小类
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            // 新增
            $('#btnAdd').click(function () {
                if(flag){
                    page.logic.add();
                }else{
                    layer.msg("请选择二级单位或安全风险区或作业风险区!");
                    return;
                }
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //点击左侧树形菜单,查询表格数据
            mini.get("tree1").on("nodeselect", function (e){
                $("#searchForm")[0].reset();
                addObj={"baseModelCategory":e.node.obj ,"baseDataId":e.node.tid,"enterpriseID": orgId , "deviceMode":"1"};
                flag=true;
                grid.load({ "baseModelCategory":e.node.obj ,"baseDataId":e.node.tid,"enterpriseID": orgId , "deviceMode":"1"});
            });

                // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["deviceMode"]="1";
                page.data.param.enterpriseID = orgId  ;
                if(addObj){
                    page.data.param["baseModelCategory"]=addObj.baseModelCategory;
                    page.data.param["baseDataId"]=addObj.baseDataId;
                }
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
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                grid.load({"deviceMode":"1","enterpriseID": orgId });//调度模式
            },
            // 设备状态
            show_status:function(e){
                return e.row.deviceE.activationPattern+"(激活)";
            },
            /**
             * 企业
             */
            cbxEnterprise:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        async:false
                    },null,page.logic.load_sidebar);
                }else{
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        async:false
                    },null,page.logic.load_sidebar);
                    $("#enterpriseCode").attr("disabled",true);
                }
                page.logic.load_sidebar();//左侧树形结构
            },
            //树形菜单
            load_sidebar:function(){
                flag=false;
                orgId=$("#enterpriseCode").find("option:selected").attr("code");
                var orgCode=$("#enterpriseCode").val();
                page.logic.initTable();//表格
                if(orgCode){
                    $.ajax({
                        url: riskArea_url+"?orgCode="+orgCode+"&treeID="+orgId,
                        type: "GET",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            ECS.hideLoading();
                            mini.get("tree1").loadList(data, "id", "pid");
                        }
                    });
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
                    idsArray.push(el.cfgID);
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
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (result) {
                            ECS.hideLoading();
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
                page.logic.detail("选择应急设备","", pageMode,"../Device/SelectDevice.html");
            },
            /**
             * 新增或者编辑详细页面
             */
            detail: function (title, deviceID, pageMode,content) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['60%', '85%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: content+'?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "title":title,
                            "baseModelCategory":addObj.baseModelCategory,
                            "baseDataId":addObj.baseDataId,
                            "enterpriseID":addObj.enterpriseID,
                            "deviceMode":addObj.deviceMode
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        grid.reload();
                        window.pageLoadMode = PageLoadMode.None;
                    }
                })
            },
            //搜索
            search: function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["deviceMode"]="1";
                page.data.param.enterpriseID = orgId  ;
                if(addObj){
                    page.data.param["baseModelCategory"]=addObj.baseModelCategory;
                    page.data.param["baseDataId"]=addObj.baseDataId;
                }
                for(var key in page.data.param){
                    page.data.param[key]=$.trim(page.data.param[key]);
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.emUrl +'/DispatchDeviceConfig/importExcel'; 
                var exportUrl =  ECS.api.emUrl +'/DispatchDeviceConfig/ExportExcel'; 
                var confirmUrl =  ECS.api.emUrl +'/DispatchDeviceConfig/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});