var delUrl=ECS.api.bcUrl+"/monitorSite";var searchUrl=ECS.api.bcUrl+"/monitorSite";var inUseUrl=ECS.api.commonUrl+"/getInUse";var riskorg_url=ECS.api.bcUrl+"/org/porgName";var orgType_url=ECS.api.bcUrl+"/org/porgName";var riskType_url=ECS.api.bcUrl+"/riskArea/getRiskAreaEnumList?isAll=true";var riskType_url2=ECS.api.bcUrl+"/riskArea/getCategObj?isAll=true";var riskAreaName_url=ECS.api.bcUrl+"/riskArea/getAllList?isAll=true";var oprisktype_url=ECS.api.bcUrl+"/optlRiskZone/getOptlZoneCatgEnumList?isAll=true";var oprisk_url=ECS.api.bcUrl+"/optlRiskZone/getAllList?isAll=true";var RiskAnlsObj_url=ECS.api.bcUrl+"/riskAnlsObj/getRiskObjCatgEnumList?isAll=true";var RiskAnlsObjName_url=ECS.api.bcUrl+"/riskAnlsObj/getAllList?isAll=true";var CheckType_url=ECS.api.bcUrl+"/monitorSite/type?isAll=true";var dataTest=ECS.api.bcUrl+"/monitorSite/getMonitorSiteValue";var exportUrl=ECS.api.bcUrl+"/monitorSite/ExportToExcel";window.pageLoadMode=PageLoadMode.None;var grid=null;var flag=false;var enterpriseCode="";var drtDeptCode="";var riskAreaID="";var optlRiskZoneID="";$(function(){var b=ECS.sys.getLoginNameFromSYS();var a={init:function(){mini.parse();this.bindUI();$("#searchForm").find("input").val("");a.logic.initInUse();a.logic.initTable();ECS.sys.RefreshContextFromSYS();a.logic.get_list(orgType_url,$("#enterpriseCode"));a.logic.select_option(riskType_url,$("#riskAreaCatg"));a.logic.select_option(riskType_url2+"&riskAreaCatg=",$("#riskAreaCatgName"),"ww");a.logic.select_option(oprisktype_url,$("#zoneCatg"));a.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));a.logic.select_option(CheckType_url,$("#monitorTypeID"));mini.get("riskAreaCode").disable();mini.get("optlRiskCode").disable();mini.get("riskAnlsObjCode").disable()},table:{},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#btnAdd").click(function(){a.logic.add("新增","",PageModelEnum.NewAdd)});$("#btnDel").click(function(){a.logic.delAll()});$("#btnQuery").click(function(){a.logic.search()});$("#btnImp").click(function(){a.logic.imp()});$("#btnExport").click(function(){a.data.param={};a.data.param=ECS.form.getData("searchForm");a.data.param.enterpriseCode=enterpriseCode;a.data.param.drtDeptCode=drtDeptCode;if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){a.data.param.riskAreaCode=mini.get("riskAreaCode").getSelected().riskAreaCode}if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){a.data.param.optlRiskCode=mini.get("optlRiskCode").getSelected().code}if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){a.data.param.riskAnlsObjCode=mini.get("riskAnlsObjCode").getSelected().code}var e=mini.get("riskAreaCatgName").getCheckedNodes(true);if(e.length>0){for(var d=0;d<e.length;d++){(function(f){if(f.categID.indexOf("sm")!=-1){a.data.param.areaSmCatg=f.code}if(f.categID.indexOf("md")!=-1){a.data.param.areaMdCatg=f.code}if(f.categID.indexOf("bg")!=-1){a.data.param.areaBgCatg=f.code}})(e[d])}}delete a.data.param.riskAreaCatgName;var c=a.logic.setUrlK(a.data.param);window.open(exportUrl+"?"+c)});$("#btnTest").click(function(){a.logic.test()});$("#btnToggle").click(function(){if(flag){flag=!flag;$(this).html('<i class="icon-showMore"></i>');$(".search-unfixed").hide()}else{flag=!flag;$(this).html('<i class="icon-hideMore"></i>');$(".search-unfixed").show()}});mini.get("enterpriseCode").on("nodeclick",function(c){if(c.node.orgCode=="-1"){enterpriseCode=""}else{enterpriseCode=c.node.orgCode}a.logic.get_list(riskorg_url,$("#drtDeptCode"),c.node.orgId)});mini.get("drtDeptCode").on("nodeclick",function(c){if(c.node.orgCode=="-1"){drtDeptCode=""}else{drtDeptCode=c.node.orgCode}a.logic.load_risk_menu()});$("#riskAreaCatg").change(function(){a.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"ww")});mini.get("riskAreaCatgName").on("valuechanged",function(){a.logic.load_risk_menu()});mini.get("riskAreaCode").on("valuechanged",function(c){if(c.value===""||c.value==="-1"){mini.get("riskAreaCode").setValue("-1");riskAreaID=""}else{riskAreaID=c.selected.riskAreaID}a.logic.load_optrisk_menu()});$("#zoneCatg").change(function(){a.logic.load_optrisk_menu()});mini.get("optlRiskCode").on("valuechanged",function(c){if(c.value==""||c.value=="-1"){mini.get("optlRiskCode").setValue("-1");optlRiskZoneID=""}else{optlRiskZoneID=c.selected.optlRiskZoneID}a.logic.load_rapTypeNameList()});$("#riskAnlsObjCatg").change(function(){a.logic.load_rapTypeNameList()})},data:{param:{}},logic:{setUrlK:function(g){var e="",c,d;for(var f in g){if(g.hasOwnProperty(f)){c=f}d=g[f];e+="&"+c+"="+encodeURIComponent(d)}return e.substring(1,e.length)},initTable:function(){grid=mini.get("datagrid");grid.set({url:searchUrl,ajaxType:"get",dataField:"pageList"})},show_upload:function(c){return"<a href=\"javascript:ECS.util.renderUploader_Page('"+c.row.enterpriseCode+"','"+c.row.siteID+"','"+c.row.siteName+"','5','实时监测点附件上传')\">上传附件</a>"},show_edit:function(c){return ECS.util.editRender(c.row.siteID)},get_list:function(d,g,f,c){var e;if(f){e=d+"?isAll=true&orgPID="+f+"&orgLvl=3"}else{e=d+"?orgLvl=2"}$.ajax({url:e,type:"GET",success:function(i){if(f){mini.get("drtDeptCode").loadList(i,"orgId","orgPID");mini.get("drtDeptCode").setValue("全部");a.logic.load_risk_menu();c&&c()}else{mini.get("enterpriseCode").loadList(i,"orgId","orgPID");if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){enterpriseCode=mini.get("enterpriseCode").data[0].orgCode;mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);a.logic.get_list(riskorg_url,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId)}else{enterpriseCode=ECS.sys.Context.SYS_ENTERPRISE_CODE;mini.get("enterpriseCode").disable();for(var h=0;h<i.length;h++){(function(j){if(j.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){mini.get("enterpriseCode").setValue(j.orgSname);a.logic.get_list(riskorg_url,$("#drtDeptCode"),j.orgId)}})(i[h])}}grid.load({enterpriseCode:enterpriseCode});c&&c()}}})},select_option:function(d,e,c){$.ajax({url:d,type:"GET",success:function(g){if(c&&(typeof c!="function")){mini.get("riskAreaCatgName").loadList(g,"categID","gcategID");a.logic.load_risk_menu()}else{$(e).html("");for(var f=0;f<g.length;f++){(function(i){if(i.key||i.key==0){var h=$('<option title="'+i.value+'" value="'+i.key+'">'+i.value.substring(0,20)+"</option>")}$(e).append(h)})(g[f])}c&&c()}}})},selectCombox:function(c,d){$.ajax({url:c,type:"get",success:function(e){mini.get(d).load(e);mini.get(d).setValue("-1")}})},load_risk_menu:function(){var g=mini.get("riskAreaCatgName").getCheckedNodes(true);var j="";var f="";var c="";if(g.length>0){for(var e=0;e<g.length;e++){(function(i){if(i.categID==""){j="";f="";c=""}else{if(i.categID.indexOf("sm")!=-1){j=i.code}else{if(i.categID.indexOf("md")!=-1){f=i.code}else{if(i.categID.indexOf("bg")!=-1){c=i.code}}}}})(g[e])}}var d=$("#riskAreaCatg").val();if(drtDeptCode){var h=riskAreaName_url+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+j+"&areaMdCatg="+f+"&areaBgCatg="+c+"&riskAreaCatg="+d;a.logic.selectCombox(h,"#riskAreaCode");mini.get("riskAreaCode").enable()}else{mini.get("riskAreaCode").disable();mini.get("riskAreaCode").setValue("-1")}mini.get("optlRiskCode").disable();mini.get("optlRiskCode").setValue("-1");mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")},load_optrisk_menu:function(){var d=$("#zoneCatg").val();if(riskAreaID){var c=oprisk_url+"&riskAreaID="+riskAreaID+"&zoneCatg="+d;a.logic.selectCombox(c,"#optlRiskCode");mini.get("optlRiskCode").enable()}else{mini.get("optlRiskCode").disable();mini.get("optlRiskCode").setValue("-1")}mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")},load_rapTypeNameList:function(){var c=$("#riskAnlsObjCatg").val(),d=RiskAnlsObjName_url+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+c;if(optlRiskZoneID){a.logic.selectCombox(d,"#riskAnlsObjCode");mini.get("riskAnlsObjCode").enable()}else{mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")}},delAll:function(){var c=new Array();var d=grid.getSelecteds();$.each(d,function(e,f){c.push(f.siteID)});if(c.length==0){layer.msg("请选择要删除的数据!");return}layer.confirm("确定删除吗？",{btn:["确定","取消"]},function(){$.ajax({url:delUrl,async:false,data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",type:"DELETE",beforeSend:function(){layer.closeAll();ECS.showLoading()},success:function(e){ECS.hideLoading();if(e.indexOf("collection")<0){layer.msg("删除成功！",{time:1000},function(){grid.reload()})}else{e=JSON.parse(e);layer.msg(e.collection.error.message)}},error:function(e){ECS.hideLoading();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},function(e){layer.close(e)})},test:function(){var c=[];var d=grid.getSelecteds();$.each(d,function(e,f){c.push({siteID:f.siteID,siteNumber:f.siteNumber,systemUID:f.systemUID})});if(c.length==0){layer.msg("请选择要测试的数据!");return}$.ajax({url:dataTest,async:false,type:"put",data:JSON.stringify(c),dataType:"json",contentType:"application/json;charset=utf-8",success:function(e){if(e.indexOf("collection")<0){layer.msg("保存成功！",{time:1000},function(){grid.reload()})}else{grid.reload();layer.msg(e.collection.error.message)}},error:function(e){grid.reload();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},initInUse:function(){ECS.ui.getCombobox("inUse",inUseUrl,{selectValue:"-1",data:{isAll:true}},null)},add:function(){var c=PageModelEnum.NewAdd;var d="实时监测点新增";a.logic.detail(d,"",c)},edit:function(d){var c=PageModelEnum.Edit;var e="实时监测点编辑";a.logic.detail(e,d,c)},detail:function(e,d,c){layer.open({type:2,closeBtn:0,area:["800px","80%"],skin:"new-class",shadeClose:false,title:false,content:"MonitorSiteAddOrEdit.html?"+Math.random(),success:function(g,h){var f=layer.getChildFrame("body",h);var j=window[g.find("iframe")[0]["name"]];var i={pageMode:c,siteID:d,title:e};j.page.logic.setData(i)},end:function(){if(window.pageLoadMode==PageLoadMode.Refresh){a.logic.search(true);window.pageLoadMode=PageLoadMode.None}else{if(window.pageLoadMode==PageLoadMode.Reload){a.logic.search(true);window.pageLoadMode=PageLoadMode.None}}}})},search:function(d){a.data.param={};a.data.param=ECS.form.getData("searchForm");if(d){a.data.param.sortType=1}a.data.param.enterpriseCode=enterpriseCode;a.data.param.drtDeptCode=drtDeptCode;if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){a.data.param.riskAreaCode=mini.get("riskAreaCode").getSelected().riskAreaCode}if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){a.data.param.optlRiskCode=mini.get("optlRiskCode").getSelected().code}if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){a.data.param.riskAnlsObjCode=mini.get("riskAnlsObjCode").getSelected().code}var e=mini.get("riskAreaCatgName").getCheckedNodes(true);if(e.length>0){for(var c=0;c<e.length;c++){(function(f){if(f.categID.indexOf("sm")!=-1){a.data.param.areaSmCatg=f.code}if(f.categID.indexOf("md")!=-1){a.data.param.areaMdCatg=f.code}if(f.categID.indexOf("bg")!=-1){a.data.param.areaBgCatg=f.code}})(e[c])}}delete a.data.param.riskAreaCatgName;grid.load(a.data.param)},imp:function(){var d=ECS.api.bcUrl+"/monitorSite/importExcel";var c=ECS.api.bcUrl+"/monitorSite/ExportExcel";var f=ECS.api.bcUrl+"/monitorSite/importAddAll";var e="../UploadFile/UploadFile.html?"+Math.random();ECS.util.importExcel(d,c,f,e)}}};a.init();window.page=a});