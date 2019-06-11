var delUrl = ECS.api.bcUrl + '/duty';//删除
var searchUrl = ECS.api.bcUrl + '/duty'; //查询接口路径
var OrgNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';  //企业名称
var dutyTypeUrl =  ECS.api.bcUrl + '/duty/type'; //职务类型
var inUseUrl = ECS.api.commonUrl + "/getInUse";  //是否启用
var dutyLevelUrl = ECS.api.bcUrl +'/duty/level' ;//职务级别
var exportUrl = ECS.api.bcUrl + '/duty/ExportToExcel';  //导出
var importUrl = ECS.api.bcUrl + '/duty/importExcel';  //导入
var uploader;
window.pageLoadMode = PageLoadMode.None;
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
            page.logic.initTable();
            page.logic.cbxOrgName();//企业名称
            page.logic.search();
            page.logic.initDutyType();//职务类型
            page.logic.initDutyLevel();//职务级别
            page.logic.initInUse();//是否启用
            page.logic.upload();//导入
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
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
                page.data.param = ECS.form.getData("searchForm");
              
                page.data.param["orgID"] = $("#orgID").find("option:selected").attr("code");
                if(page.data.param["inUse"]=="-1"){
                    page.data.param["inUse"] = "";
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
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"data"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.dutyID);
            },
            //企业名称
            cbxOrgName:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("orgID", OrgNameUrl, {
                        selectFirstRecord: true,
                        async:false,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname"
                    }, null);
                    $("#orgID").attr("disabled",false);
                }else{
                    ECS.ui.getCombobox("orgID", OrgNameUrl, {
                        selectValue:ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        async:false,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname"
                    }, null);
                    $("#orgID").attr("disabled",true);
                }
            },
            /**
             * 职务类型
             */
            initDutyType:function(){
                ECS.ui.getComboSelects(dutyTypeUrl,"dutyTypeID","dutyTypeID","dutyTypeName",false);
            },
            /**
             * 职务级别
             */
            initDutyLevel:function(){
                ECS.ui.getComboSelects(dutyLevelUrl,"dutyLevelID","dutyLevelID","dutyLevelName",false);
            },
            /**
             * 初始化查询inUse
             */
            initInUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: "-1",
                    data: {
                        'isAll': true
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
                    idsArray.push(el.dutyID);
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
                        async: true,
                        data: JSON.stringify(idsArray),
                        dataType: "text",
                        contentType: "application/json;charset=utf-8",
                        type: 'DELETE',
                        beforeSend: function () {
                            layer.closeAll();
                            ECS.showLoading();
                        },
                        success: function (result) {
                            ECS.hideLoading();
                            if (result.indexOf('collection') < 0) {
                                layer.msg("删除成功！", {
                                    time: 1000
                                }, function () {
                                    grid.reload({pageIndex:0});
                                });
                            } else {
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message);
                                layer.msg(result)
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
            },
            /**
             * 导入数据
             */
            upload: function() {
                uploader = new plupload.Uploader({
                    browse_button : 'btnImport',
                    url : importUrl,
                    filters: {
                        mime_types : [
                            { title : "xlsx files", extensions : "xlsx" },
                        ]
                    }
                });
                uploader.init();
                uploader.bind('FilesAdded',function(uploader,files){
                    if(files[0].name.length > 50) {
                        uploader.removeFile(files[0]);
                        layer.msg("文件名称不能超过50个字符！");
                        return;
                    }
                    if (uploader.files.length >0) {
                        uploader.start();
                    }
                });
                uploader.bind('UploadProgress',function(uploader,file){
                    layer.msg("正在导入文件请耐心等待！");
                });
                uploader.bind('FileUploaded', function(uploader, file, responseObject) {
                    var responseList=JSON.parse(responseObject.response);
                    var errorMsg="";
                    if(responseList.isSuccess){
                        layer.msg("导入成功！");
                        page.logic.search(true);
                    } else{
                        var errmes=responseList.message.split("!");
                        for(var i=0;i<errmes.length-1;i++){
                            errorMsg+="<p>" + (parseInt(i)+1) + "、"+errmes[i]+";</p>";
                        }
                        page.logic.importDetail("导入数据错误", errorMsg, PageModelEnum.Details)
                    }
                });
            },
            /**
             * 导入数据错误页面
             */
            importDetail: function (title ,errorTip,pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '400px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../RiskAnalysisPoint/RiskAnalysisPointDataError.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            'errorTip':errorTip
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        page.logic.search();
                        window.pageLoadMode = PageLoadMode.Refresh;
                    }
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "企业职务新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param teamID
             */
            edit: function (dutyID) {
                var pageMode = PageModelEnum.Edit;
                var title = "企业职务编辑";
                page.logic.detail(title, dutyID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, dutyID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '400px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'DutyAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "dutyID": dutyID,
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
                });
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                page.data.param["orgID"] = $("#orgID").find("option:selected").attr("code");
                if(page.data.param["inUse"]=="-1"){
                    page.data.param["inUse"] = "";
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/duty/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/duty/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/duty/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
          
           
        }
    };
    page.init();
    window.page = page;
});