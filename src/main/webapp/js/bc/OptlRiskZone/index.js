var delUrl = ECS.api.bcUrl + '/optlRiskZone';
var searchUrl = ECS.api.bcUrl + '/optlRiskZone';
var riskorg_url = ECS.api.bcUrl + '/org/porgName';//企业、二级单位
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/riskArea/categ?isAll=true';//安全风险区分类
var riskAreaEnumListNameUrl = ECS.api.bcUrl + '/riskArea/getRiskAreaEnumList?isAll=true';  //安全风险区板块
var riskAreaNameUrl = ECS.api.bcUrl + '/riskArea/riskAreaNameAll?isAll=true';  //安全风险区名称
var zoneCatgUrl = ECS.api.bcUrl + '/optlRiskZone/getOptlZoneCatgEnumList?isAll=true';//作业风险区类型
var inUseUrl = ECS.api.commonUrl + "/getInUse";
var exportUrl =  ECS.api.bcUrl +'/optlRiskZone/ExportToExcel'; 
var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";//企业编码；
var drtDeptCode = "";//二级单位编码；
var riskAreaID="";//安全风险区名称ID
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;
var catgCode;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();
            $("#searchForm").find('input').val("");
            //初始化查询是否启用
            page.logic.initInUse();
            page.logic.initTable();
            //企业、二级单位；
            page.logic.get_list(riskorg_url,$("#enterpriseCode"));
            page.logic.cbxRiskAreaEnumList();//安全风险区板块
            page.logic.cbxRiskAreaCatg("");//安全风险区分类
            page.logic.cbxZoneCatg();//作业风险区类型
            //安全风险区名称置灰
            mini.get("riskAreaID").disable();
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
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
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
                if(mini.get("riskAreaID").getSelected()&&mini.get("riskAreaID").getSelected().riskAreaID!="-1"){
                    page.data.param["riskAreaID"] = mini.get("riskAreaID").getSelected().riskAreaID;
                }
                //安全风险区分类
                if(mini.get("riskAreaCatgCode").getSelectedNode()){
                    var cur_node = mini.get("riskAreaCatgCode").getSelectedNode();
                    //小类
                    if(cur_node.categID.indexOf("sm")!=-1){
                        page.data.param["areaSmCatg"]=cur_node.code;
                    }
                    //中类
                    if(cur_node.categID.indexOf("md")!=-1){
                        page.data.param["areaMdCatg"]=cur_node.code;
                    }
                    //大类
                    if(cur_node.categID.indexOf("bg")!=-1){
                        page.data.param["areaBgCatg"]=cur_node.code;
                    }
                }else{
                    page.data.param["areaSmCatg"] = "";
                    page.data.param["areaMdCatg"]= "";
                    page.data.param["areaBgCatg"]= "";
                }
                delete page.data.param["riskAreaCatgCode"];
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
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
            //二级单位取值；
            mini.get("drtDeptCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    drtDeptCode="";
                }else{
                    drtDeptCode = e.node.orgCode;
                }
                page.logic.cbxRiskAreaName();
            });
            //当安全风险区分类选择以后，加载安全风险区名称的数据；
            mini.get("riskAreaCatgCode").on("nodeclick",function(e){
                if(e.node.code=="-1"){
                    catgCode="";
                }else{
                    catgCode = e.node.code;
                }
                page.logic.cbxRiskAreaName();
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
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.optlRiskZoneID);
            },
            //显示上传文件
            show_upload:function(e){
                return '<a href="javascript:ECS.util.renderUploader_Page(\'' + e.row.enterpriseCode+'\',\''+e.row.optlRiskZoneID+'\',\''+e.row.name+'\',\''+'14'+'\',\''+'作业风险区附件上传'+'\')">上传附件</a>';
            },
            //企业、二级单位的联动菜单
            get_list:function(url,oPar,Pid,cb){
                if(Pid){
                    //二级单位
                    var cur_url = url+"?isAll=true&orgPID="+Pid+"&orgLvl=3";
                }else{
                    //企业
                    var cur_url = url+"?orgLvl=2";
                }
                $.ajax({
                    url:cur_url,
                    type:"GET",
                    success:function (Data){
                        if(Pid){
                            //二级单位
                            mini.get("drtDeptCode").loadList(Data,"orgId","orgPID");
                            mini.get("drtDeptCode").setValue("全部");
                            page.logic.cbxRiskAreaName();
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
            /**
             * 安全风险区板块
             */
            cbxRiskAreaEnumList:function(){
                ECS.ui.getCombobox("riskAreaCatg", riskAreaEnumListNameUrl, {
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
                        mini.get("riskAreaCatgCode").setValue("-1");
                    }
                });
                catgCode="";
                page.logic.cbxRiskAreaName();
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
                    var riskUrl=riskAreaNameUrl+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&riskAreaCatgCode="+catgCode+"&riskAreaCatg="+riskAreaCatg
                    page.logic.selectCombox(riskUrl,"#riskAreaID");//安全风险区名称
                    mini.get("riskAreaID").enable();
                }else{
                    mini.get("riskAreaID").disable();
                    mini.get("riskAreaID").setValue("-1");
                }
            },
            /**
             * 作业风险区类型
             */
            cbxZoneCatg:function(){
                ECS.ui.getCombobox("zoneCatg",zoneCatgUrl, {
                    selectValue: ""
                }, null);
                $("#name").val("");
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.optlRiskZoneID);
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
                                result = JSON.parse(result)
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
            /**
             * 初始化查询inUse
             */
            initInUse: function () {
                ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: -1,
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
                var title = "作业风险区新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param optlRiskZoneID
             */
            edit: function (optlRiskZoneID) {
                var pageMode = PageModelEnum.Edit;
                var title = "作业风险区编辑";
                page.logic.detail(title, optlRiskZoneID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, optlRiskZoneID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['800px', '510px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'OptlRiskZoneAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "optlRiskZoneID": optlRiskZoneID,
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
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                //企业
                page.data.param["enterpriseCode"] = enterpriseCode;
                //二级单位
                page.data.param["drtDeptCode"] = drtDeptCode;
                //安全风险区名称
                if(mini.get("riskAreaID").getSelected()&&mini.get("riskAreaID").getSelected().riskAreaID!="-1"){
                    page.data.param["riskAreaID"] = mini.get("riskAreaID").getSelected().riskAreaID;
                }
                //安全风险区分类
                if(mini.get("riskAreaCatgCode").getSelectedNode()){
                    var cur_node = mini.get("riskAreaCatgCode").getSelectedNode();
                    //小类
                    if(cur_node.categID.indexOf("sm")!=-1){
                        page.data.param["areaSmCatg"]=cur_node.code;
                    }
                    //中类
                    if(cur_node.categID.indexOf("md")!=-1){
                        page.data.param["areaMdCatg"]=cur_node.code;
                    }
                    //大类
                    if(cur_node.categID.indexOf("bg")!=-1){
                        page.data.param["areaBgCatg"]=cur_node.code;
                    }
                }else{
                    page.data.param["areaSmCatg"] = "";
                    page.data.param["areaMdCatg"]= "";
                    page.data.param["areaBgCatg"]= "";
                }
                delete page.data.param["riskAreaCatgCode"];
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/optlRiskZone/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/optlRiskZone/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/optlRiskZone/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
            }
          
          
        }
    };
    page.init();
    window.page = page;
});