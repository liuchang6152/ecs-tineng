var delUrl=ECS.api.emUrl+"/DispatchDeviceConfig";var searchUrl=ECS.api.emUrl+"/DispatchDeviceConfig";var addUrl=ECS.api.emUrl+"/DispatchDeviceConfig/getDevice";var enterpriseUrl=ECS.api.bcUrl+"/org/porgName?orgLvl=2";var deviceCategUrl=ECS.api.emUrl+"/Device/deviceByDeviceCatg";var deviceTypeUrl=ECS.api.emUrl+"/Device/deviceByDeviceType";var riskArea_url=ECS.api.emUrl+"/DispatchDeviceConfig/getTreeList";var exportUrl=ECS.api.emUrl+"/DispatchDeviceConfig/ExportToExcel";window.pageLoadMode=PageLoadMode.None;var orgId="";var flag=false;var addObj;pageflag=true;redisKey="";$(function(){var a={init:function(){mini.parse();this.bindUI();ECS.sys.RefreshContextFromSYS();$("#searchForm").find("input").val("");a.logic.cbxEnterprise();a.logic.cbxDeviceCateg();a.logic.cbxDeviceType()},table:{},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#btnAdd").click(function(){if(flag){a.logic.add()}else{layer.msg("请选择二级单位或安全风险区或作业风险区!");return}});$("#btnDel").click(function(){a.logic.delAll()});$("#btnQuery").click(function(){a.logic.search()});mini.get("tree1").on("nodeselect",function(b){$("#searchForm")[0].reset();addObj={baseModelCategory:b.node.obj,baseDataId:b.node.tid,enterpriseID:orgId,deviceMode:"1"};flag=true;grid.load({baseModelCategory:b.node.obj,baseDataId:b.node.tid,enterpriseID:orgId,deviceMode:"1"})});$("#btnImp").click(function(){a.logic.imp()});$("#btnExport").click(function(){a.data.param={};a.data.param=ECS.form.getData("searchForm");a.data.param.deviceMode="1";a.data.param.enterpriseID=orgId;if(addObj){a.data.param.baseModelCategory=addObj.baseModelCategory;a.data.param.baseDataId=addObj.baseDataId}for(var c in a.data.param){a.data.param[c]=$.trim(a.data.param[c])}var b=a.logic.setUrlK(a.data.param);window.open(exportUrl+"?"+b)})},data:{param:{}},logic:{setUrlK:function(f){var d="",b,c;for(var e in f){if(f.hasOwnProperty(e)){b=e}c=f[e];d+="&"+b+"="+encodeURIComponent(c)}return d.substring(1,d.length)},initTable:function(){grid=mini.get("datagrid");grid.set({url:searchUrl,ajaxType:"get",dataField:"pageList"});grid.load({deviceMode:"1",enterpriseID:orgId})},show_status:function(b){return b.row.deviceE.activationPattern+"(激活)"},cbxEnterprise:function(){if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){ECS.ui.getCombobox("enterpriseCode",enterpriseUrl,{selectFirstRecord:true,keyField:"orgCode",valueField:"orgSname",codeField:"orgId",async:false},null,a.logic.load_sidebar)}else{ECS.ui.getCombobox("enterpriseCode",enterpriseUrl,{selectValue:ECS.sys.Context.SYS_ENTERPRISE_CODE,keyField:"orgCode",valueField:"orgSname",codeField:"orgId",async:false},null,a.logic.load_sidebar);$("#enterpriseCode").attr("disabled",true)}a.logic.load_sidebar()},load_sidebar:function(){flag=false;orgId=$("#enterpriseCode").find("option:selected").attr("code");var b=$("#enterpriseCode").val();a.logic.initTable();if(b){$.ajax({url:riskArea_url+"?orgCode="+b+"&treeID="+orgId,type:"GET",beforeSend:function(){ECS.showLoading()},success:function(c){ECS.hideLoading();mini.get("tree1").loadList(c,"id","pid")}})}},cbxDeviceCateg:function(){ECS.ui.getCombobox("deviceCatgId",deviceCategUrl,{selectValue:"",data:{isAll:true}},null,a.logic.cbxDeviceType)},cbxDeviceType:function(b){ECS.ui.getCombobox("deviceTypeId",deviceTypeUrl,{selectValue:"",data:{isAll:true,deviceCatgId:b}},null)},delAll:function(){var b=[];var c=grid.getSelecteds();$.each(c,function(d,e){b.push(e.cfgID)});if(b.length==0){layer.msg("请选择要删除的数据!");return}layer.confirm("确定删除吗？",{btn:["确定","取消"]},function(){$.ajax({url:delUrl,async:false,data:JSON.stringify(b),dataType:"text",contentType:"application/json;charset=utf-8",type:"DELETE",beforeSend:function(){ECS.showLoading()},success:function(d){ECS.hideLoading();if(d.indexOf("collection")<0){layer.msg("删除成功！",{time:1000},function(){grid.reload()})}else{d=JSON.parse(d);layer.msg(d.collection.error.message)}},error:function(d){var e=$.parseJSON(d.responseText);layer.msg(e.collection.error.message)}})},function(d){layer.close(d)})},add:function(){var b=PageModelEnum.NewAdd;a.logic.detail("选择应急设备","",b,"../Device/SelectDevice.html")},detail:function(e,d,c,b){layer.open({type:2,closeBtn:0,area:["60%","85%"],skin:"new-class",shadeClose:false,title:false,content:b+"?"+Math.random(),success:function(g,h){var f=layer.getChildFrame("body",h);var j=window[g.find("iframe")[0]["name"]];var i={pageMode:c,title:e,baseModelCategory:addObj.baseModelCategory,baseDataId:addObj.baseDataId,enterpriseID:addObj.enterpriseID,deviceMode:addObj.deviceMode};j.page.logic.setData(i)},end:function(){grid.reload();window.pageLoadMode=PageLoadMode.None}})},search:function(){a.data.param={};a.data.param=ECS.form.getData("searchForm");a.data.param.deviceMode="1";a.data.param.enterpriseID=orgId;if(addObj){a.data.param.baseModelCategory=addObj.baseModelCategory;a.data.param.baseDataId=addObj.baseDataId}for(var b in a.data.param){a.data.param[b]=$.trim(a.data.param[b])}grid.load(a.data.param)},imp:function(){var c=ECS.api.emUrl+"/DispatchDeviceConfig/importExcel";var b=ECS.api.emUrl+"/DispatchDeviceConfig/ExportExcel";var e=ECS.api.emUrl+"/DispatchDeviceConfig/importAddAll";var d="../../bc/UploadFile/UploadFile.html?"+Math.random();ECS.util.importExcel(c,b,e,d)}}};a.init();window.page=a});