var delUrl = ECS.api.bcUrl + '/riskArea';//删除（批量）
var searchUrl = ECS.api.bcUrl + '/riskArea';                          //查询、列表初始化
var inUseUrl = ECS.api.commonUrl + "/getInUse";                           //是否启用
var riskType_url = ECS.api.bcUrl +'/riskArea/getRiskAreaEnumList?isAll=true';  //安全风险区类型
var riskType_url2 = ECS.api.bcUrl +'/riskArea/getCategObj?isAll=true';   //安全风险区分类
var riskorg_url = ECS.api.bcUrl + '/org/porgName';                        //企业、二级单位
var exportUrl =  ECS.api.bcUrl +'/riskArea/ExportToExcel'; 
var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";    //企业节点编码；
var drtDeptCode = "";       //二级单位节点编码；
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                      //初始化miniui框架
            this.bindUI();                     //绑定事件
            $("#searchForm").find('input').val("");
            page.logic.initInUse();            //初始化查询是否启用
            page.logic.select_option(riskType_url2 + "&riskAreaCatg=",$("#riskAreaCatgName"),"ww");//安全风险区分类
            page.logic.initTable();            //初始化表格
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
                //安全风险区分类
                if(mini.get("riskAreaCatgName").getSelectedNode()){
                   var cur_node = mini.get("riskAreaCatgName").getSelectedNode();
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
                delete page.data.param["riskAreaCatgName"];
				var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //点击企业菜单，二级单位联动
            mini.get("enterpriseCode").on("nodeclick",function(e){
                enterpriseCode = e.node.orgCode;
                page.logic.get_list(riskorg_url,$("#drtDeptCode"),e.node.orgId);
            });
            //二级单位取值；
            mini.get("drtDeptCode").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    drtDeptCode="";
                }else{
                    drtDeptCode = e.node.orgCode;
                }
            });
            //当“安全风险区板块”的值发生改变的时候，加载“安全风险区分类”的数据；
            $("#riskAreaCatg").change(function(){
                page.logic.load_riskAreaCate();
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
                //获取用户的相关数据
                ECS.sys.RefreshContextFromSYS();
                //企业、二级单位；
                page.logic.get_list(riskorg_url,$("#enterpriseCode"));
                //安全风险区类型
                page.logic.select_option(riskType_url,$("#riskAreaCatg"));
            },
            //显示上传文件
            show_upload:function(e){
                return '<a href="javascript:ECS.util.renderUploader_Page(\'' + e.row.enterpriseCode+'\',\''+e.row.riskAreaID+'\',\''+e.row.riskAreaName+'\',\''+'13'+'\',\''+'安全风险区附件上传'+'\')">上传附件</a>';
            },
            //显示编辑操作图标列
            show_edit:function(e){
                return ECS.util.editRender(e.row.riskAreaID);
            },
           //安全风险区分类(列表字段处理)
            ShowRiskAreaCate:function (e){
                //配置小类
                if(e.row.smCategName){
                    return e.row.smCategName;
                }
                //配置中类
                if(e.row.mdCategName){
                    return e.row.mdCategName;
                }
                //配置大类
                if(e.row.bgCategName){
                    return e.row.bgCategName;
                }
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
                })
            },
            //安全风险区分类的菜单数据加载；
            load_riskAreaCate:function(){
                page.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"xx");
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        if(cb){
                            //安全风险区分类
                            mini.get("riskAreaCatgName").loadList(Data,"categID","gcategID");
                        }else{
                            //下拉框数据填充
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    //安全风险区类型
                                    if(cur_key.value){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                        }
                    }
                })
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.riskAreaID);
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
                                }, function (){
                                    grid.reload();
                                });
                            } else {
                                result = JSON.parse(result);
                                layer.msg(result.collection.error.message)
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
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "安全风险区新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param riskAreaID
             */
            edit: function (riskAreaID) {
                var pageMode = PageModelEnum.Edit;
                var title = "安全风险区编辑";
                page.logic.detail(title, riskAreaID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, riskAreaID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '480px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'RiskAreaAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "riskAreaID": riskAreaID,
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
                //安全风险区分类
                if(mini.get("riskAreaCatgName").getSelectedNode()){
                   var cur_node = mini.get("riskAreaCatgName").getSelectedNode();
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
                delete page.data.param["riskAreaCatgName"];
                grid.load(page.data.param);
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

            imp: function () {
                var impUrl = ECS.api.bcUrl +'/riskArea/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/riskArea/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/riskArea/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
				
            }
           
            
        }
    };
    page.init();
    window.page = page;
});