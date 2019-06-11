var searchUrl = ECS.api.rttUrl + "/msds";                                                                  //查询
var delUrl = ECS.api.rttUrl + '/msds';                                                                     //删除
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2';                                               //企业名称
var riskTypeUrl = ECS.api.rttUrl + "/riskType/getList";                                                  //危险性类别下拉菜单
var exportUrl = ECS.api.rttUrl + '/msds/ExportToExcel';  //导出
var enterpriseCode = null;                                                                                  //企业编码
var grid = null;                                                                                              //grid表格对象
var orgId = null;                                                                                      //企业id
pageflag =true;
redisKey ='';
window.pageLoadMode = PageLoadMode.None;               
                                                    //页面模式
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                       //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            this.bindUI();                      //绑定事件
            //危险性类别加载完毕后，查询列表
            page.logic.danger_menu(function(){
                page.logic.initTable();             //初始化表格
            });
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //监听企业
            mini.get("orgId").on("nodeclick",function(e){
                if(e.node.orgCode=="-1"){
                    orgId="";
                }else{
                    orgId = e.node.orgId;
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
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //重置
            $("#btnReset").click(function () {
                page.logic.clear_val();
            });

                 // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};                 //初始化参数对象
                page.data.param = ECS.form.getData("searchForm");
              
                //企业名称数据处理；
                if(mini.get("orgId").getSelectedNode()){
                    page.data.param["orgId"] = mini.get("orgId").getSelectedNode().orgId;
                }else{
                    //取默认存储的值；
                    page.data.param["orgId"] = orgId;
                }
                //危险性类别；
                page.data.param["riskType"] = mini.get("riskType").getValue();
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
                //企业名称下拉数据
                page.logic.select_option(riskAreaTypeNameUrl,"#orgId",function(){
                    page.logic.search(true);    //列表数据渲染
                });
            },
            //清空查询条件
            clear_val:function(){
                $("#msdsChineseName").val("");         //清空危化品中文名
                $("#casno").val("");                    //清空 CAS No
                mini.get("riskType").setValue("");     //清空危险性类别表单的值
                page.logic.search(true);                //进行查询
            },
            //显示编辑操作图标列
            show_edit:function(e){
                return '<a title="编辑" href="javascript:window.page.logic.edit(' + e.row.msdsId + ')" class="mr__10"><i class="icon-edit edit"></i></a><a title="详情" href="javascript:window.page.logic.detailPage(' + e.row.msdsId + ')" class="mr__10"><i class="icon-details edit"></i></a>';
            },
            //显示危险性类别
            show_risktype:function(e){
                if($.trim(e.row.riskType)==""){
                    return "空";
                }else{
                    return e.row.riskType;
                }
            },
            //企业名称下拉菜单数据的加载
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        // page.logic.clear_val();   //重置所有的条件
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //企业
                        mini.get("orgId").loadList(data,"orgId","orgPID");
                        //若是企业用户，设置为不可用状态；
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("orgId").setValue(mini.get("orgId").data[0].orgCode);
                            orgId = mini.get("orgId").data[0].orgId;
                        }else{
                            mini.get("orgId").disable();
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("orgId").setValue(cur_key.orgSname);
                                        orgId = cur_key.orgId;                                      //存储企业的id;
                                    }
                                })(data[w]);
                            }
                        }
                        //员工所属企业编码；
                        cb && cb();
                    }
                })
            },
            //急救措施 （列表参数解析）
            param_firstAidMeasure:function(e){
                switch (e.row.firstAidMeasure){
                    case 1:
                        return "有";
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //消防措施 （列表参数解析）
            param_fireMeasure:function(e){
                switch (e.row.fireMeasure){
                    case 1:
                        return "有";
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //泄急应用处理 （列表参数解析）
            param_revealHandle:function(e){
                switch (e.row.revealHandle){
                    case 1:
                        return "有";
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //危险性 （列表参数解析）
            param_danger:function(e){
                switch (e.row.risk){
                    case 1:
                        return "有";
                        break;
                    case 0:
                        return "无";
                        break;
                }
            },
            //危险性类别  （多选）
            danger_menu:function(cb){
                $.ajax({
                    url:riskTypeUrl,
                    type:"get",
                    success:function (data) {
                        mini.get("riskType").load(data);     //加载下拉菜单的数据
                        cb && cb();
                    }
                });
            },
            //危险性类别多选下拉框，点击关闭清空值
            onCloseClick:function(e) {
                var obj = e.sender;
                obj.setText("");
                obj.setValue("");
            },
            /**
             * 批量删除
             */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.msdsId);
                });
                if (idsArray.length == 0) {
                    layer.msg("请选择需要删除的危化品数据!");
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
                            result = JSON.parse(result)
                            if(result.isSuccess){
                                layer.msg(result.message);
                                page.logic.search(true);
                            }else{
                                layer.msg(result.message);
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
                var title = "危化品新增";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 编辑
             * @param msdsId
             */
            edit: function (msdsId) {
                var pageMode = PageModelEnum.Edit,
                    title = "危化品编辑";
                page.logic.detail(title, msdsId, pageMode);
            },
            /*
            详情查看
            *@param msdsId
            * */
            detailPage:function(msdsId){
                var pageMode = PageModelEnum.View,
                    title = "危化品详情";
                page.logic.detail(title, msdsId, pageMode);
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, msdsId, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['1100px', '550px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'AddEditMSDS.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "msdsId": msdsId,
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
                page.data.param = {};                 //初始化参数对象
                page.data.param = ECS.form.getData("searchForm");
                //排序
                if(sort){
                    page.data.param["sortType"]=1;
                }
                //企业名称数据处理；
                if(mini.get("orgId").getSelectedNode()){
                    page.data.param["orgId"] = mini.get("orgId").getSelectedNode().orgId;
                }else{
                    //取默认存储的值；
                    page.data.param["orgId"] = orgId;
                }
                //危险性类别；
                page.data.param["riskType"] = mini.get("riskType").getValue();
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/msds/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/msds/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/msds/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});