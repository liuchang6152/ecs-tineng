var delUrl = ECS.api.bcUrl + '/riskAnalysisPoint';
var searchUrl = ECS.api.bcUrl + '/riskAnalysisPoint';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var drtDeptCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=3&isAll=true'; //二级单位
var riskAreaEnumListUrl = ECS.api.bcUrl + '/riskArea/getRiskAreaEnumList?isAll=true';  //安全风险区板块
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/riskArea/getCategObj?isAll=true';  //安全风险区分类
var riskAreaNameUrl = ECS.api.bcUrl + '/riskArea/getAllList?isAll=true';  //安全风险区名称
var zoneCatgUrl = ECS.api.bcUrl + '/optlRiskZone/getOptlZoneCatgEnumList?isAll=true';//作业风险区类型
var optlRiskNameUrl = ECS.api.bcUrl + '/optlRiskZone/getAllList?isAll=true';//作业风险区名称
var riskAnlsObjCatgUrl = ECS.api.bcUrl + '/riskAnlsObj/getRiskObjCatgEnumList?isAll=true';//风险分析对象类型
var riskAnlsObjNameUrl = ECS.api.bcUrl + '/riskAnlsObj/getAllList?isAll=true';//风险分析对象名称
var inUseUrl = ECS.api.commonUrl + '/getInUse';
var exportUrl= ECS.api.bcUrl + '/riskAnalysisPoint/ExportToExcel';//导出
var importUrl = ECS.api.bcUrl + '/riskAnalysisPoint/importExcelData';//导入
window.pageLoadMode = PageLoadMode.None;
var uploader;
var flag = false;
var grid = null;  //gri对象；
var smCatg = "";    //小类
var mdCatg = "";    //中类
var bgCatg = "";    //大类
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
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
            //初始化查询是否启用
            page.logic.inUse();
            page.logic.initTable();
            page.logic.upload();
            page.logic.initOrgCode(enterpriseCodeUrl,$("#enterpriseCode"));//企业
            page.logic.cbxRiskAreaEnumList();//安全风险区板块
            page.logic.cbxRiskAreaCatg("");//安全风险区分类
            page.logic.cbxZoneCatg();//作业风险区类型
            page.logic.cbxRiskAnlsObjCatg();//风险分析对象类型
            //安全名称\作业名称\对象名称置灰
            mini.get("riskAreaCode").disable();
            mini.get("optlRiskCode").disable();
            mini.get("riskAnlsObjCode").disable();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //展示收缩
            $('#btnToggle').click(function () {
                if(flag){
                    flag=!flag;
                    $(this).html('<i class="icon-showMore"></i>');
                    $(".search-unfixed").hide();
                }else{
                    flag=!flag;
                    $(this).html('<i class="icon-hideMore"></i>');
                    $(".search-unfixed").show();
                }
            });
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });

                      // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["areaBgCatg"]=bgCatg;
                page.data.param["areaMdCatg"]=mdCatg;
                page.data.param["areaSmCatg"]=smCatg;
               delete page.data.param["riskAreaCatgCode"];
               
                //企业
                page.data.param["enterpriseCode"] = enterpriseCode;
                //二级单位
                page.data.param["drtDeptCode"] = drtDeptCode;
                //安全风险区名称
                if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){
                    page.data.param["riskAreaCode"] = mini.get("riskAreaCode").getSelected().riskAreaCode;
                }
                //作业风险区名称
                if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){
                    page.data.param["optlRiskCode"] = mini.get("optlRiskCode").getSelected().code;
                }
                //风险分析对象名称
                if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){
                    page.data.param["riskAnlsObjCode"] = mini.get("riskAnlsObjCode").getSelected().code;
                }
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
            });
            //监听企业tree菜单点击
            mini.get("enterpriseCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    enterpriseCode="";
                }else{
                    enterpriseCode = e.node.orgCode;
                }
                page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),e.node.orgId);
            });
            //监听二级单位点击加载安全风险区名称
            mini.get("drtDeptCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    drtDeptCode="";
                }else{
                    drtDeptCode = e.node.orgCode;
                }
                page.logic.cbxRiskAreaName();
            });
            //监听安全风险区分类tree菜单点击
            mini.get("riskAreaCatgCode").on("nodeclick",function(e){
                var cate_arr = e.node.code;
                //小类
                if(e.node.categID.indexOf("sm")!=-1){
                    smCatg=cate_arr;
                    mdCatg="";
                    bgCatg="";
                }
                //中类
                if(e.node.categID.indexOf("md")!=-1){
                    mdCatg=cate_arr;
                    smCatg="";
                    bgCatg="";
                }
                //大类
                if(e.node.categID.indexOf("bg")!=-1){
                    bgCatg=cate_arr;
                    smCatg="";
                    mdCatg="";
                }
                page.logic.cbxRiskAreaName();
            });
            //当安全风险区名称选择以后，加载作业风险区名称的数据；
            mini.get("riskAreaCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("riskAreaCode").setValue("-1");
                    riskAreaID="";
                }else{
                    riskAreaID = e.selected.riskAreaID;
                }
                page.logic.cbxOptlRiskName();//加载作业风险区名称的数据；
            });
            //作业风险区名称选择以后，加载风险分析对象名称的数据
            mini.get("optlRiskCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("optlRiskCode").setValue("-1");
                    optlRiskZoneID="";
                }else{
                    optlRiskZoneID = e.selected.optlRiskZoneID;
                }
                page.logic.cbxRiskAnlsObjName();   //加载风险分析对象名称的数据
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //导出
            $('#btnExport').click(function () {
                window.open(exportUrl+"?enterpriseCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE)
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
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
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.pointID);
            },
            /**
             * 企业
             */
            initOrgCode:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        mini.get("enterpriseCode").loadList(data, "orgId", "orgPID");
                        //若是企业用户，设置为不可用状态；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
                            mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                            page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId);
                        }else{
                            enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                            mini.get("enterpriseCode").disable();
                            for(var w=0;w<data.length;w++){
                                (function(menu_url){
                                    if(menu_url.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("enterpriseCode").setValue(menu_url.orgSname);
                                        page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),menu_url.orgId);
                                    }
                                })(data[w]);
                            }
                        }
                        grid.load({"enterpriseCode":enterpriseCode});
                    }
                });
            },
            /**
             * 二级单位
             */
            cbxDrtDeptCode:function(menu_url,oPar,pid){
                $.ajax({
                    url:menu_url+"&orgPID="+pid,
                    type:"get",
                    success:function (data) {
                        mini.get("drtDeptCode").loadList(data,"orgId","orgPID");
                        mini.get("drtDeptCode").setValue("全部");
                        page.logic.cbxRiskAreaName();
                    }
                });
            },
            /**
             * 安全风险区板块
             */
            cbxRiskAreaEnumList:function(){
                ECS.ui.getCombobox("riskAreaCatg", riskAreaEnumListUrl, {
                    selectValue: ""
                }, null,page.logic.cbxRiskAreaCatg);
            },
            //安全风险区分类
            cbxRiskAreaCatg:function(pid){
                $.ajax({
                    url:riskAreaTypeNameUrl+"&riskAreaCatg="+pid,
                    type:"get",
                    success:function (data) {
                        mini.get("riskAreaCatgCode").loadList(data, "categID", "gcategID");
                        mini.get("riskAreaCatgCode").setValue("全部");
                    }
                });
                bgCatg="";
                mdCatg="";
                smCatg="";
                page.logic.cbxRiskAreaName();//安全风险区名称
            },
            //可搜索下拉框
            selectCombox:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        mini.get(oPar).load(data);
                        mini.get(oPar).setValue("-1");
                    }
                });
            },
            /**
             * 安全风险区名称
             */
            cbxRiskAreaName:function(){
                var riskAreaCatg=$("#riskAreaCatg").val();
                if(drtDeptCode){
                    var riskUrl=riskAreaNameUrl+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+smCatg+"&areaMdCatg="+mdCatg+"&areaBgCatg="+bgCatg+"&riskAreaCatg="+riskAreaCatg
                    page.logic.selectCombox(riskUrl,"#riskAreaCode");//安全风险区名称
                    mini.get("riskAreaCode").enable();
                }else{
                    mini.get("riskAreaCode").disable();
                    mini.get("riskAreaCode").setValue("-1");
                }
                mini.get("optlRiskCode").disable();
                mini.get("optlRiskCode").setValue("-1");
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            /**
             * 作业风险区类型
             */
            cbxZoneCatg:function(){
                ECS.ui.getCombobox("zoneCatg", zoneCatgUrl, {
                    selectValue: "",
                }, null,page.logic.cbxOptlRiskName);
            },
            /**
             * 作业风险区名称
             */
            cbxOptlRiskName:function(){
                var zoneCate = $("#zoneCatg").val();//作业风险区类型
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    page.logic.selectCombox(optlRiskNameUrl+"&riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate,"#optlRiskCode");//作业风险区名称
                    mini.get("optlRiskCode").enable();
                }else{
                    mini.get("optlRiskCode").disable();
                    mini.get("optlRiskCode").setValue("-1");
                }
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            /**
             * 风险分析对象类型
             */
            cbxRiskAnlsObjCatg:function() {
                ECS.ui.getCombobox("riskAnlsObjCatg", riskAnlsObjCatgUrl, {
                    selectValue: "",
                }, null,page.logic.cbxRiskAnlsObjName);
            },
            /**
             * 风险分析对象名称
             */
            cbxRiskAnlsObjName:function() {
                var riskAnlsObjCatg = $("#riskAnlsObjCatg").val(),//风险分析对象类型id
                    RapTypeName_url = riskAnlsObjNameUrl+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+riskAnlsObjCatg;
                if(optlRiskZoneID){
                    page.logic.selectCombox(RapTypeName_url,"#riskAnlsObjCode");//风险分析对象名称
                    mini.get("riskAnlsObjCode").enable();
                }else{
                    mini.get("riskAnlsObjCode").disable();
                    mini.get("riskAnlsObjCode").setValue("-1");
                }
            },
            /**
             * 是否启用
             */
            inUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: -1,
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
                    idsArray.push(el.pointID);
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
                                    grid.reload();
                                });
                            } else {
                                result = JSON.parse(result)
                                layer.msg(result.collection.error.message);
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
                            { title : "xlsx files", extensions : "xlsx" }
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
                    if(responseList[0].isSuccess){
                        layer.msg("导入成功！");
                        page.logic.search();
                    } else{
                        for(var i=0;i<responseList.length;i++){
                            errorMsg+="<p>" + (parseInt(i)+1) + "、"+responseList[i].message+"</p>";
                        }
                        page.logic.importDetail("导入数据错误", errorMsg, PageModelEnum.Details);
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
                    content: 'RiskAnalysisPointDataError.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            'errorTip':errorTip,
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        page.logic.search();
                        window.pageLoadMode = PageLoadMode.Refresh;
                    }
                })
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "风险分析点新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param pointId
             */
            edit: function (pointID) {
                var pageMode = PageModelEnum.Edit;
                var title = "风险分析点编辑";
                page.logic.detail(title, pointID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, pointID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['900px', '500px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'RiskAnalysisPointAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "pointID": pointID,
                            'title': title
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.Refresh;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.Reload;
                        }
                    }
                });
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["areaBgCatg"]=bgCatg;
                page.data.param["areaMdCatg"]=mdCatg;
                page.data.param["areaSmCatg"]=smCatg;
               delete page.data.param["riskAreaCatgCode"];
                if(showSort){
                    page.data.param={};
                    page.data.param["sortType"] = 1;
                }
                //企业
                page.data.param["enterpriseCode"] = enterpriseCode;
                //二级单位
                page.data.param["drtDeptCode"] = drtDeptCode;
                //安全风险区名称
                if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){
                    page.data.param["riskAreaCode"] = mini.get("riskAreaCode").getSelected().riskAreaCode;
                }
                //作业风险区名称
                if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){
                    page.data.param["optlRiskCode"] = mini.get("optlRiskCode").getSelected().code;
                }
                //风险分析对象名称
                if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){
                    page.data.param["riskAnlsObjCode"] = mini.get("riskAnlsObjCode").getSelected().code;
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/riskAnalysisPoint/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/riskAnalysisPoint/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/riskAnalysisPoint/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
            }
          
        }
    };
    page.init();
    window.page = page;
});