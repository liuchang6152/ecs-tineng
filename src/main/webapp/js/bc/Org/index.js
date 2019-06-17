var delUrl = ECS.api.bcUrl + '/org';                                  //删除
var searchUrl = ECS.api.bcUrl + '/org';                               //数据的处理（查询）
var exportUrl = ECS.api.bcUrl +'/org/ExportToExcel';                //导出
var org_url = ECS.api.bcUrl + '/org/porgName?isAll=true';           //总部树
var porg_url = ECS.api.bcUrl + '/org/porgNameOne';                  //企业树
var orgType_url = ECS.api.bcUrl + '/org/orgType?isAll=true';       //机构类型
var orgLvl_url = ECS.api.bcUrl + '/org/orgLvl?isAll=true';         //机构级别
var orgNature_url = ECS.api.bcUrl + '/org/orgNature?isAll=true';   //机构性质
var riskorg_url = ECS.api.bcUrl + '/org/porgName';   
var grid = null;   //全局变量
var selectCode="";
pageflag =true;
redisKey ='';
var nsName;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            page.logic.initTable();
            page.logic.load_sidebar();//左侧菜单
            page.logic.clear_val(); //默认清空查询条件上的表单值；
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
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
             
                //上层名称节点id
                if(mini.get("tree1").getSelectedNode()){
                    page.data.param.orgId = mini.get("tree1").getSelectedNode().orgId;
                }else{
                    page.data.param.orgId = mini.get("tree1").data[0].orgId;
                }
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
              
            });
            //侧边栏菜单添加点击,进行查询
            mini.get("tree1").on("nodeselect", function (){
                page.logic.typelist_dt();
            });
            //左侧树级菜单_查询（筛选树菜单）
            $('#btnQuery2').click(function () {
                var key = $.trim($("#tree_val").find("input").val());
                if (key == "" || key == "全部") {
                    mini.get("tree1").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("tree1").filter(function (node) {
                        var text = node.orgSname ? node.orgSname.toLowerCase() : "";
                        if (text.indexOf(key) != -1) {
                            return true;
                        }
                    });
                }
            });
            //点击左侧展开收缩
            var isHiden = true;
            $('.btn-toggle').click(function(){
                if(isHiden){
                    $(".leftNav-body").hide();
                    $('.box-body').css("margin-left","0");
                    $(this).css({"left":"0","transform":"rotate(180deg)"});
                }else{
                    $(".leftNav-body").show();
                    $('.box-body').css("margin-left","280px");
                    $(this).css({"left":"263px","transform":"rotate(0deg)"});
                }
                isHiden = !isHiden;
                page.logic.search();
            });
            //左侧空白处，点击右键菜单
            $("#treeMenu2 li").click(function(){
                page.logic.onAddNode2();
            });

            $("#enterpriseCode").change(function(){
				page.logic.enterprisechanged();
			});
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {

            // 企业改变事件
			enterprisechanged: function () {
                page.logic.load_sidebar(porg_url);   //侧边栏菜单的刷新
			
			},
            //企业名称
			enterprise: function (menu_url, oPar) {
				$.ajax({
					url: menu_url+"?orgLvl=1",
					type: "get",
					success: function (data) {
					
						var datalist = [];
					 // //若是企业用户，设置为不可用状态；
					 if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) 
					 {
						$.each(data, function (i, el) {
							datalist.push({ id: el["orgCode"], text: el["orgSname"],orgId:el["orgId"] });
						});
					 }else{
						var newList = JSLINQ(data).Where(function (x) { return x.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE ; }).ToArray();
						$.each(newList, function (i, el) {
							datalist.push({ id: el["orgCode"], text: el["orgSname"],orgId:el["orgId"] });
						});
                        
					
                        $('#' + oPar).attr('disabled', 'disabled');
                        
					
					 }
					 orgList = datalist;
						$('#' + oPar).select2({
							tags: false,
							data: datalist,
							language: {
								noResults: function (params) {
									return "没有匹配项";
								}
							},
                        });
                        page.logic.enterprisechanged();
					},
					error: function (e) {
						layer.msg("系统繁忙");
					}
				})
			},

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
                page.logic.enterprise(riskorg_url,"enterpriseCode");

                //所有查询条件的添加；
                //机构类型
                page.logic.select_option(orgType_url,$("#orgTypeID"));
                //机构级别
                page.logic.select_option(orgLvl_url,$("#orgLvlID"));
                //机构性质
                page.logic.select_option(orgNature_url,$("#orgNatureID"));
            },
            //清空查询条件上的表单的值；
            clear_val:function(){
                $("#orgTypeID").val("");            //机构类型
                $("#orgLvlID").val("");             //机构级别
                $("#orgNatureID").val("");         //机构性质
                $("#orgName").val("");              //机构全称
                $("#orgCode").val("");              //机构编码
            },
            //显示上传文件
            show_upload:function(e){
                return '<a href="javascript:ECS.util.renderUploader_Page(\'' + e.row.orgCode+'\',\''+e.row.orgId+'\',\''+e.row.orgName+'\',\''+'11'+'\',\''+'企业组织机构附件上传'+'\')">上传附件</a>';
            },
            /****
             *　　　　　封装右键菜单函数：
             *　　　　elementID   要自定义右键菜单的 元素的id
             *　　　　menuID　　　 要显示的右键菜单DIv的 id
             */
            rightmenu:function(elementID,menuID){
                var menu=document.getElementById(menuID);      //获取菜单对象
                var element=document.getElementById(elementID);//获取点击拥有自定义右键的 元素
                element.onmousedown=function(aevent){         //设置该元素的 按下鼠标右键右键的 处理函数
                    if(window.event)aevent=window.event;      //解决兼容性
                    if(aevent.button==2){                   //当事件属性button的值为2时，表用户按下了右键
                        document.oncontextmenu=function(aevent){
                            if(window.event){
                                aevent=window.event;
                                aevent.returnValue=false;         //对IE 中断 默认点击右键事件处理函数
                            }else{
                                aevent.preventDefault();          //对标准DOM 中断 默认点击右键事件处理函数
                            };
                        };
                        menu.style.cssText='display:block;top:'+(aevent.pageY-50)+'px;'+'left:'+aevent.pageX+'px;'
                        //将菜单相对 鼠标定位
                    }
                };
                menu.onmouseout=function(){                  //设置 鼠标移出菜单时 隐藏菜单
                    setTimeout(function(){
                        menu.style.display="none";
                    },400);
                }
            },
            //侧边栏菜单添加
            load_sidebar:function(){
                var enterprise = $("#enterpriseCode").val();
            
                var _url =porg_url+"?orgCode="+enterprise;
                // if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                //     _url=org_url;
                // }else{
                //     _url=porg_url+"?orgCode="+enterprise;
                // }
                $.ajax({
                    url: _url,
                    type: "GET",
                    success: function (Data) {
                        if(Data.length>0){
                            mini.get("tree1").loadList(Data, "orgId", "orgPID");
                            page.logic.search();
                        }else{
                            page.logic.rightmenu("left_tree","treeMenu2");
                        }
                    },
                    error:function(){
                        page.logic.rightmenu("left_tree","treeMenu2");
                    }
                });
            },
            //刷新列表、侧边栏菜单、以及查询条件充值
            reset_all:function(sort){
                page.logic.clear_val();    //清空查询条件
                page.logic.load_sidebar(porg_url,function(){
                    //侧边栏菜单的刷新
                    page.data.param = {};
                    //倒序
                    if(sort){
                        page.data.param["sortType"] = 1;
                    }
                    page.data.param["orgId"]="";
                    //刷新列表
                    grid.load(page.data.param);
                });
            },
            //插入节点
             onAddBefore:function(e) {
                var tree = mini.get("tree1");
                 var node = tree.getSelectedNode();
                 var parentNode = tree.getParentNode(node);
                 console.log(parentNode.orgName)
                 nsName = parentNode.orgName
                 if(tree.getAncestors(node).length=="0"){
                     selectCode="";
                 }else if(tree.getAncestors(node).length=="1"){
                     selectCode=node.orgCode;
                 }else{
                     for(var i=0;i<tree.getAncestors(node).length;i++){
                         if(tree.getAncestors(node)[i]._level=="1"){
                             selectCode=tree.getAncestors(node)[i].orgCode;
                         }
                     }
                 }
                 page.logic.add(node.orgPID);
             },
            //增加子节点
             onAddNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                console.log(node)
                // var parentNode = tree.getParentNode(node);
                // console.log(parentNode.orgName)
                nsName = node.orgName
                console.log(node)
                 if(tree.getAncestors(node).length=="0"){
                     selectCode="";
                 }else if(tree.getAncestors(node).length=="1"){
                     selectCode=node.orgCode;
                 }else{
                    for(var i=0;i<tree.getAncestors(node).length;i++){
                        if(tree.getAncestors(node)[i]._level=="1"){
                            selectCode=tree.getAncestors(node)[i].orgCode;
                        }
                    }
                }
                 page.logic.add(node.orgId,function(name,id){
                    //插入节点
                    page.logic.load_sidebar(porg_url);   //侧边栏菜单的刷新
                });
            },
            //右键菜单，点击触发
            onAddNode2:function(){
                page.logic.add("",function(){
                    page.logic.load_sidebar(porg_url);   //侧边栏菜单的刷新
                });
                $("#treeMenu2").hide();   //隐藏该右侧菜单；
            },
            //编辑节点
            onEditNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                if(tree.getAncestors(node).length=="0"){
                    selectCode="";
                }else if(tree.getAncestors(node).length=="1"){
                    selectCode=node.orgCode;
                }else{
                    for(var i=0;i<tree.getAncestors(node).length;i++){
                        if(tree.getAncestors(node)[i]._level=="1"){
                            selectCode=tree.getAncestors(node)[i].orgCode;
                        }
                    }
                }
                page.logic.edit(node.orgId,node.orgPID)
            },
            //删除节点
            onRemoveNode:function(e) {
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                page.logic.delSingle(node.orgId);
            },
            //显示编辑操作图标列
            show_edit:function(e){
                return ECS.util.editRender(e.row.orgId,e.row.orgPID);
            },
            //显示右键菜单
            onBeforeOpen:function(e) {
                var menu = e.sender;
                var tree = mini.get("tree1");
                var node = tree.getSelectedNode();
                if (!node) {
                    e.cancel = true;
                    return;
                }
                if ((node && node.text == "Base") || (node.orgName=="全部" && node.orgId<0)) {
                    e.cancel = true;
                    //阻止浏览器默认右键菜单
                    e.htmlEvent.preventDefault();
                    return;
                }
                ////////////////////////////////
                var editItem = mini.getbyName("edit", menu);
                var removeItem = mini.getbyName("remove", menu);
                var addPnode = mini.getbyName("addPnode", menu);
                editItem.show();
                removeItem.enable();
                if (node.orgId == "-1") {
                    editItem.disable();
                    removeItem.disable();
                }
                if (node._level == "0") {
                    addPnode.hide();
                }else{
                    addPnode.show();
                }
                var Event = e || window.event;
                if(Event.stopPropagation) { //W3C阻止冒泡方法
                    Event.stopPropagation();
                } else {
                    Event.cancelBubble = true; //IE阻止冒泡方法
                }
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        //下拉框数据填充
                        for(var i=0;i<Data.length;i++){
                            (function(cur_key){
                                if(cur_key.value){
                                    var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                }
                                if(cur_key.orgSname){
                                    var $oPtion = $('<option value="'+cur_key.orgPID+'">'+cur_key.orgSname+'</option>');
                                }
                                $(oPar).append($oPtion);
                            })(Data[i]);
                        }
                        cb && cb();
                    }
                })
            },
            /**
             * 批量删除
             * */
            delAll: function () {
                var idsArray = new Array();
                var rowsArray = grid.getSelecteds();
                $.each(rowsArray, function (i, el) {
                    idsArray.push(el.orgId);
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
                                    //刷新列表、侧边栏菜单、以及查询条件充值
                                    page.logic.reset_all();
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
             * 单条删除
             */
            delSingle: function (id) {
                var data = new Array();
                data.push(id);
                layer.confirm('温馨提示：可能存在相关引用，您确认删除当前组织机构吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    $.ajax({
                        url: delUrl,
                        async: false,
                        data: JSON.stringify(data),
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
                                    //刷新列表、侧边栏菜单、以及查询条件充值
                                    page.logic.reset_all();
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
                    layer.close(index);
                });
            },
            /**
             * 新增
             */
            add: function (orgPID,cb) {
                var pageMode = PageModelEnum.NewAdd;
                var title = "企业组织机构新增";
                if(orgPID){
                    page.logic.detail(title, "", pageMode,orgPID,cb);
                }else{
                    page.logic.detail(title, "", pageMode);
                }
            },
            /**
             * 编辑
             * @param OrgId
             */
            edit: function (OrgId,orgPID,cb) {
                var pageMode = PageModelEnum.Edit;
                var title = "企业组织机构编辑";
                if(orgPID){
                    page.logic.detail(title, OrgId, pageMode,orgPID,cb);
                }else{
                    page.logic.detail(title, OrgId, pageMode);
                }
            },
            /**
             * 装置新增或者编辑详细页面
             */
            detail: function (title, OrgId, pageMode,orgPID,cb) {
                var sCode;
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    sCode = selectCode;
                }else{
                    sCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                };
                console.log(OrgId)
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['780px', '480px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'OrgAddOrEdit.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "OrgId": OrgId,
                            "orgPID":orgPID,
                            "selectCode":sCode,
                            'title': title,
                            'name': nsName
                        };
                        //进行回调
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            //刷新列表、侧边栏菜单、以及查询条件充值
                            page.logic.reset_all(true);
                            cb && cb();
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            //刷新列表、侧边栏菜单、以及查询条件充值
                            page.logic.reset_all(true);
                            cb && cb();
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            /*侧边栏菜单搜索列表数据*/
            typelist_dt:function(){
                page.data.param = {}
                var node = mini.get("tree1").getSelectedNode();
                //获取树选中的节点id和code;
                if(node){
                    if(mini.get("tree1").getAncestors(node).length=="0"){
                        selectCode="";
                    }else if(mini.get("tree1").getAncestors(node).length=="1"){
                        selectCode=node.orgCode;
                    }else{
                        for(var i=0;i<mini.get("tree1").getAncestors(node).length;i++){
                            if(mini.get("tree1").getAncestors(node)[i]._level=="1"){
                                selectCode=mini.get("tree1").getAncestors(node)[i].orgCode;
                            }
                        }
                    }
                    page.data.param["orgId"] = mini.get("tree1").getSelectedNode().orgId;    //上层名称节点id
                }
                grid.load(page.data.param);
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
                //上层名称节点id
                if(mini.get("tree1").getSelectedNode()){
                    page.data.param.orgId = mini.get("tree1").getSelectedNode().orgId;
                }else{
                    page.data.param.orgId = mini.get("tree1").data[0].orgId;
                }
                grid.load(page.data.param);
            },
            imp: function () {
                var impUrl = ECS.api.bcUrl +'/org/importExcel'; 
                var exportUrl =  ECS.api.bcUrl +'/org/ExportExcel'; 
                var confirmUrl =  ECS.api.bcUrl +'/org/importAddAll'; 
                var pageUrl = '../UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl,function(){
                    page.logic.load_sidebar(porg_url);   //侧边栏菜单的刷新
                });
				
				
            },
           
           
        }
    };
    page.init();
    window.page = page;
});