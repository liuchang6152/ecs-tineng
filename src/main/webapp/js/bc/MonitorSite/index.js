var delUrl = ECS.api.bcUrl + '/monitorSite';                                          //删除（批量）
var searchUrl = ECS.api.bcUrl + '/monitorSite';                                       //查询、列表初始化
var inUseUrl = ECS.api.commonUrl + "/getInUse";                                       //是否启用
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                                   //企业、二级单位
var orgType_url = ECS.api.bcUrl + '/org/porgName';                                   //企业类型（二级单位）
var riskType_url = ECS.api.bcUrl +'/riskArea/getRiskAreaEnumList?isAll=true';                 //安全风险区（板块）
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj?isAll=true';                         //安全风险区分类
var riskAreaName_url = ECS.api.bcUrl +'/riskArea/getAllList?isAll=true';                       //安全风险区名称
var oprisktype_url = ECS.api.bcUrl + "/optlRiskZone/getOptlZoneCatgEnumList?isAll=true";     //作业风险区类型
var oprisk_url = ECS.api.bcUrl +'/optlRiskZone/getAllList?isAll=true';                         //作业风险区名称
var RiskAnlsObj_url = ECS.api.bcUrl + '/riskAnlsObj/getRiskObjCatgEnumList?isAll=true';      //风险分析对象类型
var RiskAnlsObjName_url = ECS.api.bcUrl + '/riskAnlsObj/getAllList?isAll=true';               //风险分析对象名称
var CheckType_url =  ECS.api.bcUrl + '/monitorSite/type?isAll=true';//检测类型
var dataTest =  ECS.api.bcUrl + '/monitorSite/getMonitorSiteValue';//数据测试
var exportUrl= ECS.api.bcUrl + '/monitorSite/ExportToExcel';//导出
window.pageLoadMode = PageLoadMode.None;
var grid = null;
var flag = false;
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
var optlRiskZoneID="";//作业风险区名称ID
$(function () {
    var userName = ECS.sys.getLoginNameFromSYS();
    var page = {
        //页面初始化
        init: function () {
            mini.parse();//miniui框架初始化
            this.bindUI();            //绑定事件
            $("#searchForm").find('input').val("");
            page.logic.initInUse();   //初始化查询是否启用
            page.logic.initTable();   //表格填充数据
            //获取用户的相关数据
            ECS.sys.RefreshContextFromSYS();
            //企业、二级单位；
            page.logic.get_list(orgType_url,$("#enterpriseCode"));
            //安全风险区板块
            page.logic.select_option(riskType_url,$("#riskAreaCatg"));
            //安全风险区分类
            page.logic.select_option(riskType_url2+"&riskAreaCatg=",$("#riskAreaCatgName"),"ww");
            //作业风险区类型
            page.logic.select_option(oprisktype_url,$("#zoneCatg"));
            //风险分析对象类型
            page.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));
            //检测类型
            page.logic.select_option(CheckType_url,$("#monitorTypeID"));
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
            // 新增
            $('#btnAdd').click(function () {
                page.logic.add('新增', "", PageModelEnum.NewAdd);
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function(){
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
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaCatgName").getCheckedNodes(true);
                if(cate_arr.length>0){
                    for(var i=0;i<cate_arr.length;i++){
                        (function(cur_data){
                            //小类
                            if(cur_data.categID.indexOf("sm")!=-1){
                                page.data.param["areaSmCatg"]=cur_data.code;
                            }
                            //中类
                            if(cur_data.categID.indexOf("md")!=-1){
                                page.data.param["areaMdCatg"]=cur_data.code;
                            }
                            //大类
                            if(cur_data.categID.indexOf("bg")!=-1){
                                page.data.param["areaBgCatg"]=cur_data.code;
                            }
                        })(cate_arr[i]);
                    }
                }
                delete page.data.param.riskAreaCatgName;//删除安全风险区分类多余的字段；
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
            });
            //数据测试
            $("#btnTest").click(function () {
                page.logic.test();
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
            //点击企业菜单，二级单位联动
            mini.get("enterpriseCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    enterpriseCode="";
                }else{
                    enterpriseCode = e.node.orgCode;
                }
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            //二级单位联动安全风险区名称
            mini.get("drtDeptCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    drtDeptCode="";
                }else{
                    drtDeptCode = e.node.orgCode;
                }
                page.logic.load_risk_menu();
            });
            //当安全风险区板块选择以后，加载安全风险区分类；
            $("#riskAreaCatg").change(function(){
                page.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"ww");
            });
            //当安全风险区分类选择以后，加载安全风险区名称
            mini.get("riskAreaCatgName").on("valuechanged",function(){
                page.logic.load_risk_menu();
            });
            //当安全风险区名称选择以后，加载作业风险区名称
            mini.get("riskAreaCode").on("valuechanged",function(e){
                if(e.value===""||e.value==="-1"){
                    mini.get("riskAreaCode").setValue("-1");
                    riskAreaID="";
                }else{
                    riskAreaID = e.selected.riskAreaID;
                }
                page.logic.load_optrisk_menu();//加载作业风险区名称
            });
            //当作业风险区类型选择以后，加载作业风险区名称
            $("#zoneCatg").change(function(){
                page.logic.load_optrisk_menu();
            });
            //作业风险区名称选择以后，加载风险分析对象名称
            mini.get("optlRiskCode").on("valuechanged",function(e){
                if(e.value==""||e.value=="-1"){
                    mini.get("optlRiskCode").setValue("-1");
                    optlRiskZoneID="";
                }else{
                    optlRiskZoneID = e.selected.optlRiskZoneID;
                }
                page.logic.load_rapTypeNameList();//加载风险分析对象名称的数据
            });
            //风险分析对象类型选择以后，加载风险分析对象名称的数据
            $("#riskAnlsObjCatg").change(function(){
                page.logic.load_rapTypeNameList();
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
            },
            //显示上传文件
            show_upload:function(e){
                return '<a href="javascript:ECS.util.renderUploader_Page(\'' + e.row.enterpriseCode+'\',\''+e.row.siteID+'\',\''+e.row.siteName+'\',\''+'5'+'\',\''+'实时监测点附件上传'+'\')">上传附件</a>';
            },
            //显示编辑操作图标列
            show_edit:function(e){
                return ECS.util.editRender(e.row.siteID);
            },
            //企业、二级单位的联动菜单
            get_list:function(url,oPar,Pid,cb){
                var cur_url;
                if(Pid){
                    //二级单位
                    cur_url = url+"?isAll=true&orgPID="+Pid+"&orgLvl=3";
                }else{
                    //企业
                    cur_url = url+"?orgLvl=2";
                }
                $.ajax({
                    url:cur_url,
                    type:"GET",
                    success:function (Data){
                        if(Pid){
                            //二级单位
                            mini.get("drtDeptCode").loadList(Data,"orgId","orgPID");
                            mini.get("drtDeptCode").setValue("全部");
                            page.logic.load_risk_menu();
                            cb && cb();
                        }else{
                            //企业
                            mini.get("enterpriseCode").loadList(Data,"orgId","orgPID");
                            //若是企业用户，设置为不可用状态；
                            if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                                enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
                                mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);
                                page.logic.get_list(riskorg_url,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId);
                            }else{
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("enterpriseCode").disable();
                                for(var w=0;w<Data.length;w++){
                                    (function(cur_key){
                                        if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                            mini.get("enterpriseCode").setValue(cur_key.orgSname);
                                            page.logic.get_list(riskorg_url,$("#drtDeptCode"),cur_key.orgId);
                                        }
                                    })(Data[w]);
                                }
                            }
                            grid.load({"enterpriseCode":enterpriseCode});
                            cb && cb();
                        }
                    }
                });
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        if(cb && (typeof cb != "function")){
                            //安全风险区分类
                            mini.get("riskAreaCatgName").loadList(Data,"categID","gcategID");
                            page.logic.load_risk_menu();//安全风险区名称
                        }else{
                            $(oPar).html("");
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //安全风险区类型、风险分析对象类型、作业风险区类型
                                    if(cur_key.key || cur_key.key==0){
                                        var $oPtion = $('<option title="'+cur_key.value+'" value="'+cur_key.key+'">'+cur_key.value.substring(0,20)+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            cb && cb();
                        }
                    }
                });
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
            //安全风险区名称的数据加载
            load_risk_menu:function(){
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaCatgName").getCheckedNodes(true);
                var areaSmCatg = "";    //小类
                var areaMdCatg = "";    //中类
                var areaBgCatg = "";    //大类
                if(cate_arr.length>0){
                    for(var i=0;i<cate_arr.length;i++){
                        (function(cur_data){
                            if(cur_data.categID==""){
                                areaSmCatg="";
                                areaMdCatg="";
                                areaBgCatg="";
                            }else if(cur_data.categID.indexOf("sm")!=-1){
                                areaSmCatg=cur_data.code;
                            }else if(cur_data.categID.indexOf("md")!=-1){
                                areaMdCatg=cur_data.code;
                            }else if(cur_data.categID.indexOf("bg")!=-1){
                                areaBgCatg=cur_data.code;
                            }
                        })(cate_arr[i]);
                    }
                }
                var riskAreaCatg = $("#riskAreaCatg").val();
                if(drtDeptCode){
                    var cur_url = riskAreaName_url+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+areaSmCatg+"&areaMdCatg="+areaMdCatg+"&areaBgCatg="+areaBgCatg+"&riskAreaCatg="+riskAreaCatg;
                    page.logic.selectCombox(cur_url,"#riskAreaCode");//安全风险区名称
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
            //作业风险区名称的数据加载
            load_optrisk_menu:function(){
                var zoneCate = $("#zoneCatg").val();//作业风险区类型；
                //判断安全风险区名称是否为空
                if(riskAreaID){
                    var cur_url = oprisk_url+"&riskAreaID="+riskAreaID+"&zoneCatg="+zoneCate;
                    page.logic.selectCombox(cur_url,"#optlRiskCode");//作业风险区名称
                    mini.get("optlRiskCode").enable();
                }else{
                    mini.get("optlRiskCode").disable();
                    mini.get("optlRiskCode").setValue("-1");
                }
                mini.get("riskAnlsObjCode").disable();
                mini.get("riskAnlsObjCode").setValue("-1");
            },
            //风险分析对象名称的菜单数据加载
            load_rapTypeNameList:function(){
                var riskAnlsObjCatg = $("#riskAnlsObjCatg").val(),//风险分析对象类型id
                    RapTypeName_url = RiskAnlsObjName_url+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+riskAnlsObjCatg;
                if(optlRiskZoneID){
                    page.logic.selectCombox(RapTypeName_url,"#riskAnlsObjCode");//风险分析对象名称
                    mini.get("riskAnlsObjCode").enable();
                }else{
                    mini.get("riskAnlsObjCode").disable();
                    mini.get("riskAnlsObjCode").setValue("-1");
                }
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.siteID);
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
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message);
                            }
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }, function (index) {
                    layer.close(index)
                });
            },
            //数据测试
            test:function(){
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push({"siteID":el.siteID,"siteNumber":el.siteNumber,"systemUID":el.systemUID});
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择要测试的数据!");
                    return;
                }
                $.ajax({
                    url: dataTest,
                    async: false,
                    type: "put",
                    data: JSON.stringify(idsArray),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    success: function (result) {
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                grid.reload();
                            });
                        } else {
                            grid.reload();
                            layer.msg(result.collection.error.message);
                        }
                    }, error: function (result) {
                        grid.reload();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
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
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "实时监测点新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param siteID
             */
            edit: function (siteID) {
                var pageMode = PageModelEnum.Edit;
                var title = "实时监测点编辑";
                page.logic.detail(title, siteID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, siteID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'MonitorSiteAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "siteID": siteID,
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
             * 搜索
             */
            search: function (sort) {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                //倒序
                if(sort){
                    page.data.param["sortType"]=1;
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
                //安全风险区分类数据
                var cate_arr = mini.get("riskAreaCatgName").getCheckedNodes(true);
                if(cate_arr.length>0){
                    for(var i=0;i<cate_arr.length;i++){
                        (function(cur_data){
                            //小类
                            if(cur_data.categID.indexOf("sm")!=-1){
                                page.data.param["areaSmCatg"]=cur_data.code;
                            }
                            //中类
                            if(cur_data.categID.indexOf("md")!=-1){
                                page.data.param["areaMdCatg"]=cur_data.code;
                            }
                            //大类
                            if(cur_data.categID.indexOf("bg")!=-1){
                                page.data.param["areaBgCatg"]=cur_data.code;
                            }
                        })(cate_arr[i]);
                    }
                }
                delete page.data.param.riskAreaCatgName;//删除安全风险区分类多余的字段；
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/monitorSite/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/monitorSite/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/monitorSite/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
            }
           
           
        }
    };
    page.init();
    window.page = page;
});