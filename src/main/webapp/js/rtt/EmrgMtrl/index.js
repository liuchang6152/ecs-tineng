var delUrl = ECS.api.rttUrl + '/emrgMtrl';
var searchUrl = ECS.api.rttUrl + '/emrgMtrl';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var drtDeptCodeUrl = ECS.api.bcUrl + '/org/porgName?isAll=true&orgLvl=3'; //二级单位
var bgCatgUrl = ECS.api.bcUrl + '/busiBgCateg/getListByModelID1?businessModelId=31&isAll=true'; //物资大类
var mdCatgUrl = ECS.api.bcUrl + '/busiBgCateg/getListByBgCode1?isAll=true'; //物资中类
var smCatgUrl = ECS.api.bcUrl + '/busiBgCateg/getListByMdCode1?isAll=true'; //物资小类
var storeTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getStoreTypeEnumList'; //存放点类型
var repoTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getRepoTypeEnumList'; //储备库分类
var mtrlTypeUrl = ECS.api.rttUrl + '/emrgMtrl/mtrlType';//企内/外
var mtrlAmountUrl = ECS.api.rttUrl + '/emrgMtrl/mesUnitCount';//库存量报警数
var mtrlAmountSearchUrl = ECS.api.rttUrl + '/emrgMtrl/getAlarmExpertList';//库存量报警数查询接口
var inUseUrl = ECS.api.commonUrl + "/getInUse";
var exportUrl = ECS.api.rttUrl + '/emrgMtrl/ExportToExcel';  //导出
pageflag =true;
redisKey ='';
// var curordID;    企业id;
var flag = false;
var pidcode;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            page.logic.initInUse();
            page.logic.initTable();
            page.logic.initOrgCode(enterpriseCodeUrl,"#enterpriseCode");//企业
            page.logic.cbxBgCatg();//物资大类
            page.logic.cbxMdCatg();//物资中类
            page.logic.cbxSmCatg();//物资小类
            page.logic.cbxMtrlType();//企内/外
            page.logic.cbxStoreType();//存放点类型
            page.logic.cbxRepoType();//储备库分类
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
                page.logic.add();
            });
            //批量删除
            $('#btnDel').click(function () {
                page.logic.delAll();
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //监听企业tree菜单点击
            mini.get("enterpriseCode").on("nodeclick",function(e){
                pidcode=e.node.orgCode;
                page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),e.node.orgId);
                page.logic.getMtrlAmount();
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
            //监听二级单位点击加载库存量报警数量
            mini.get("drtDeptCode").on("nodeclick",function(e){
                page.logic.getMtrlAmount();
            });
            //库存量报警查询
            $('#btnMtrlAmount').click(function () {
                var drtDeptCode=$("input[name=drtDeptCode]").val();
                page.logic.searchMtrlAmount(pidcode,drtDeptCode);
            });
            //重置
            $("#btnReset").click(function () {
                $("#searchForm")[0].reset();
                mini.get("drtDeptCode").setValue("全部");
                $("#mdCatgName").attr("disabled",true);
                $("#smCatgName").attr("disabled",true);
                mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode);
                page.logic.getMtrlAmount();
            });

                    // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["enterpriseCode"]=pidcode;
              
                for(var key in page.data.param){
                    if(page.data.param[key]=="-1" || page.data.param[key]=="全部"){
                        page.data.param[key]="";
                    }
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
                grid.set({url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
            },
            show_edit:function(e){
                return ECS.util.editRender(e.row.emrgMtrlID);
            },
            /**
             * 企业
             */
            initOrgCode:function(menu_url,oPar){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    async:false,
                    success:function (data) {
                        mini.get(oPar).loadList(data, "orgId", "orgPID");
                        //若是总部用户，设置为可用状态
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get(oPar).setValue(mini.get(oPar).data[0].orgCode);
                            // curordID = data[0].orgId;   //企业id;
                            pidcode = mini.get(oPar).data[0].orgCode;
                            page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId);
                        }else{
                            //若是企业用户，设置为不可用状态；
                            pidcode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                            mini.get(oPar).disable();
                            for(var w=0;w<data.length;w++){
                                (function(menu_url){
                                    if(menu_url.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get(oPar).setValue(menu_url.orgSname);
                                        page.logic.cbxDrtDeptCode(drtDeptCodeUrl,$("#drtDeptCode"),menu_url.orgId);
                                        // curordID=menu_url.orgId;
                                    }
                                })(data[w]);
                            }
                        }
                        page.logic.getMtrlAmount();
                    }
                });
                page.logic.search();
            },
            /**
             * 二级单位
             */
            cbxDrtDeptCode:function(menu_url,oPar,pid){
                $.ajax({
                    url:menu_url+"&orgPID="+pid,
                    type:"get",
                    success:function (data) {
                        mini.get("drtDeptCode").loadList(data, "orgId", "orgPID");
                        mini.get("drtDeptCode").setValue("全部");
                    }
                })
            },
            //库存量报警数量
            getMtrlAmount:function(){
                var drtcode=$("input[name=drtDeptCode]").val();
                if(drtcode=="-1"||drtcode=="全部"){
                    drtcode="";
                }
                $.ajax({
                    url: mtrlAmountUrl + "?enterpriseCode=" + pidcode+"&drtDeptCode="+drtcode,
                    dataType: "json",
                    success: function (data) {
                        $("#sum").text(data);
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 物资大类
             */
            cbxBgCatg: function () {
                ECS.ui.getCombobox("bgCatgName", bgCatgUrl, {
                    selectValue: "全部",
                    keyField: "businessBgCategName",
                    valueField: "businessBgCategName",
                    codeField: "businessBgCategCode"
                }, null,page.logic.cbxMdCatg);
            },
            /**
             * 物资中类
             */
            cbxMdCatg: function () {
                var bgcode=$("#bgCatgName").find("option:selected").attr("code");
                if(bgcode&&bgcode!="null"){
                    $("#mdCatgName").attr("disabled",false);
                    $("#smCatgName").html("<option value='全部'>全部</option>").attr("disabled",true);
                    ECS.ui.getCombobox("mdCatgName", mdCatgUrl, {
                        selectValue: "全部",
                        keyField: "businessMdCategName",
                        valueField: "businessMdCategName",
                        codeField: "businessMdCategCode",
                        data:{
                            "businessBgCategCode":bgcode
                        }
                    }, null,page.logic.cbxSmCatg);
                } else{
                    $("#mdCatgName").html("<option value='全部'>全部</option>").attr("disabled",true);
                    $("#smCatgName").html("<option value='全部'>全部</option>").attr("disabled",true);
                }
            },
            /**
             * 物资小类
             */
            cbxSmCatg: function () {
                var mdcode=$("#mdCatgName").find("option:selected").attr("code");
                if(mdcode&&mdcode!="null"){
                    $("#smCatgName").attr("disabled",false);
                    ECS.ui.getCombobox("smCatgName", smCatgUrl, {
                        selectValue: "全部",
                        keyField: "businessSmCategName",
                        valueField: "businessSmCategName",
                        data:{
                            "businessMdCategCode":mdcode
                        }
                    }, null);
                } else{
                    $("#smCatgName").html("<option value='全部'>全部</option>").attr("disabled",true);
                }
            },
            /**
             * 企内/外
             */
            cbxMtrlType: function () {
                ECS.ui.getCombobox("mtrlType", mtrlTypeUrl, {
                    selectValue: "",
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            /**
             * 存放点类型
             */
            cbxStoreType:function(){
                ECS.ui.getCombobox("storeType", storeTypeUrl, {
                    selectValue: -1,
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            /**
             * 储备库分类
             */
            cbxRepoType:function(){
                ECS.ui.getCombobox("repoType", repoTypeUrl, {
                    selectValue: -1,
                    data: {
                        'isAll': true
                    }
                }, null);
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
             * 批量删除
             */
            delAll: function () {
                var idsArray = [];
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.emrgMtrlID);
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
                                    grid.reload();                 //表格刷新；
                                    page.logic.getMtrlAmount();    //库存量报警树刷新；
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
                    layer.close(index);
                });
            },
            /**
             * 新增
             */
            add: function () {
                var pageMode = PageModelEnum.NewAdd;
                var title = "应急物资新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param emrgMtrlID
             */
            edit: function (emrgMtrlID) {
                var pageMode = PageModelEnum.Edit;
                var title = "应急物资编辑";
                page.logic.detail(title, emrgMtrlID, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, emrgMtrlID, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['80%', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'EmrgMtrlAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            'pageMode': pageMode,
                            'emrgMtrlID': emrgMtrlID,
                            'title': title
                            // 'curordID':curordID
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            page.logic.getMtrlAmount();
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            page.logic.getMtrlAmount();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /**
             * 库存量报警搜索
             */
            searchMtrlAmount: function (entercode,drtcode) {
                if(drtcode=="全部"){
                    drtcode="";
                }
                grid.set({url:mtrlAmountSearchUrl});
                grid.load({enterpriseCode:entercode,drtDeptCode:drtcode});
            },
            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");
                page.data.param["enterpriseCode"]=pidcode;
                if(showSort){
                    page.data.param["sortType"] = 1;
                }
                for(var key in page.data.param){
                    if(page.data.param[key]=="-1" || page.data.param[key]=="全部"){
                        page.data.param[key]="";
                    }
                }
                grid.set({url:searchUrl});
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/emrgMtrl/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/emrgMtrl/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/emrgMtrl/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});