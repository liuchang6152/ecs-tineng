var delUrl=ECS.api.bcUrl+"/monitorSite";var searchUrl=ECS.api.bcUrl+"/monitorSite";var inUseUrl=ECS.api.commonUrl+"/getInUse";var riskorg_url=ECS.api.bcUrl+"/org/porgName";var orgType_url=ECS.api.bcUrl+"/org/porgName";var riskType_url=ECS.api.bcUrl+"/riskArea/getRiskAreaEnumList?isAll=true";var riskType_url2=ECS.api.bcUrl+"/riskArea/getCategObj?isAll=true";var riskAreaName_url=ECS.api.bcUrl+"/riskArea/getAllList?isAll=true";var oprisktype_url=ECS.api.bcUrl+"/optlRiskZone/getOptlZoneCatgEnumList?isAll=true";var oprisk_url=ECS.api.bcUrl+"/optlRiskZone/getAllList?isAll=true";var RiskAnlsObj_url=ECS.api.bcUrl+"/riskAnlsObj/getRiskObjCatgEnumList?isAll=true";var RiskAnlsObjName_url=ECS.api.bcUrl+"/riskAnlsObj/getAllList?isAll=true";var CheckType_url=ECS.api.bcUrl+"/monitorSite/type?isAll=true";var ExportToExcel_url=ECS.api.bcUrl+"/monitorFactor/ExportToExcel";window.pageLoadMode=PageLoadMode.None;var grid=null;var flag=false;var factorList=[];var enterpriseCode="";var drtDeptCode="";var riskAreaID="";var optlRiskZoneID="";$(function(){var a={init:function(){mini.parse();this.bindUI();ECS.sys.RefreshContextFromSYS();$("#searchForm").find("input").val("");a.logic.initTable();a.logic.get_list(orgType_url,$("#enterpriseCode"));a.logic.select_option(riskType_url,$("#riskAreaCatg"));a.logic.select_option(riskType_url2+"&riskAreaCatg=",$("#riskAreaCatgName"),"ww");a.logic.select_option(oprisktype_url,$("#zoneCatg"));a.logic.select_option(RiskAnlsObj_url,$("#riskAnlsObjCatg"));a.logic.select_option(CheckType_url,$("#monitorTypeID"));mini.get("riskAreaCode").disable();mini.get("optlRiskCode").disable();mini.get("riskAnlsObjCode").disable()},table:{},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#btnImp").click(function(){a.logic.imp()});$("#btnExport").click(function(){a.data.param={};a.data.param=ECS.form.getData("searchForm");a.data.param.enterpriseCode=enterpriseCode;a.data.param.drtDeptCode=drtDeptCode;if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){a.data.param.riskAreaCode=mini.get("riskAreaCode").getSelected().riskAreaCode}if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){a.data.param.optlRiskCode=mini.get("optlRiskCode").getSelected().code}if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){a.data.param.riskAnlsObjCode=mini.get("riskAnlsObjCode").getSelected().code}if(mini.get("riskAreaCatgName").getSelectedNode()){var c=mini.get("riskAreaCatgName").getSelectedNode();if(c.categID.indexOf("sm")!=-1){a.data.param.areaSmCatg=c.code}if(c.categID.indexOf("md")!=-1){a.data.param.areaMdCatg=c.code}if(c.categID.indexOf("bg")!=-1){a.data.param.areaBgCatg=c.code}}else{a.data.param.areaSmCatg="";a.data.param.areaMdCatg="";a.data.param.areaBgCatg=""}delete a.data.param.riskAreaCatgName;var b=a.logic.setUrlK(a.data.param);window.open(ExportToExcel_url+"?"+b)});$("#btnQuery").click(function(){a.logic.search()});$("#btnToggle").click(function(){if(flag){flag=!flag;$(this).html('<i class="icon-showMore"></i>');$(".search-unfixed").hide()}else{flag=!flag;$(this).html('<i class="icon-hideMore"></i>');$(".search-unfixed").show()}});mini.get("enterpriseCode").on("nodeclick",function(b){if(b.node.orgCode=="-1"){enterpriseCode=""}else{enterpriseCode=b.node.orgCode}a.logic.get_list(riskorg_url,$("#drtDeptCode"),b.node.orgId)});mini.get("drtDeptCode").on("nodeclick",function(b){if(b.node.orgCode=="-1"){drtDeptCode=""}else{drtDeptCode=b.node.orgCode}a.logic.load_risk_menu()});$("#riskAreaCatg").change(function(){a.logic.select_option(riskType_url2+"&riskAreaCatg="+$("#riskAreaCatg").val(),$("#riskAreaCatgName"),"ww")});mini.get("riskAreaCatgName").on("nodeclick",function(b){a.logic.load_risk_menu()});mini.get("riskAreaCode").on("valuechanged",function(b){if(b.value==""||b.value=="-1"){mini.get("riskAreaCode").setValue("-1");riskAreaID=""}else{riskAreaID=b.selected.riskAreaID}a.logic.load_optrisk_menu()});$("#zoneCatg").change(function(){a.logic.load_optrisk_menu()});mini.get("optlRiskCode").on("valuechanged",function(b){if(b.value==""||b.value=="-1"){mini.get("optlRiskCode").setValue("-1");optlRiskZoneID=""}else{optlRiskZoneID=b.selected.optlRiskZoneID}a.logic.load_rapTypeNameList()});$("#riskAnlsObjCatg").change(function(){a.logic.load_rapTypeNameList()})},data:{param:{}},logic:{setUrlK:function(f){var d="",b,c;for(var e in f){if(f.hasOwnProperty(e)){b=e}c=f[e];d+="&"+b+"="+encodeURIComponent(c)}return d.substring(1,d.length)},initTable:function(){grid=mini.get("datagrid");grid.set({url:searchUrl,ajaxType:"get",dataField:"pageList"})},show_edit:function(b){return ECS.util.editRender(b.row.siteID)},show_zbone:function(b){a.logic.factor(b);return factorList[0]},show_zbtwo:function(b){return factorList[1]},show_zbthree:function(b){return factorList[2]},show_zbfour:function(b){return factorList[3]},show_zbfive:function(b){return factorList[4]},show_zbsix:function(b){return factorList[5]},factor:function(c){factorList=[];for(var b=0;b<c.row.factorEntitys.length;b++){if(c.row.factorEntitys[b].lowLimit==c.row.factorEntitys[b].uppLimit){c.row.factorEntitys[b].inUpper="=";c.row.factorEntitys[b].inLower="="}else{if(c.row.factorEntitys[b].inUpper==1){c.row.factorEntitys[b].inUpper="≤"}if(c.row.factorEntitys[b].inLower==1){c.row.factorEntitys[b].inLower="≤"}if(c.row.factorEntitys[b].inUpper==0){c.row.factorEntitys[b].inUpper="＜"}if(c.row.factorEntitys[b].inLower==0){c.row.factorEntitys[b].inLower="＜"}}factorList.push(c.row.factorEntitys[b].lowLimit+c.row.factorEntitys[b].inLower+"指标"+c.row.factorEntitys[b].inUpper+c.row.factorEntitys[b].uppLimit)}},get_list:function(c,f,e,b){if(e){var d=c+"?isAll=true&orgPID="+e+"&orgLvl=3"}else{var d=c+"?orgLvl=2"}$.ajax({url:d,type:"GET",success:function(h){if(e){mini.get("drtDeptCode").loadList(h,"orgId","orgPID");mini.get("drtDeptCode").setValue("全部");a.logic.load_risk_menu();b&&b()}else{mini.get("enterpriseCode").loadList(h,"orgId","orgPID");if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){enterpriseCode=mini.get("enterpriseCode").data[0].orgCode;mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgSname);a.logic.get_list(riskorg_url,$("#drtDeptCode"),mini.get("enterpriseCode").data[0].orgId)}else{enterpriseCode=ECS.sys.Context.SYS_ENTERPRISE_CODE;mini.get("enterpriseCode").disable();for(var g=0;g<h.length;g++){(function(i){if(i.orgCode==enterpriseCode){mini.get("enterpriseCode").setValue(i.orgSname);a.logic.get_list(riskorg_url,$("#drtDeptCode"),i.orgId)}})(h[g])}}grid.load({enterpriseCode:enterpriseCode});b&&b()}}})},select_option:function(c,d,b){$.ajax({url:c,type:"GET",async:true,success:function(f){if(b&&(typeof b!="function")){mini.get("riskAreaCatgName").loadList(f,"categID","gcategID");a.logic.load_risk_menu()}else{$(d).html("");for(var e=0;e<f.length;e++){(function(h){if(h.key||h.key==""){var g=$('<option title="'+h.value+'" value="'+h.key+'">'+h.value.substring(0,20)+"</option>")}$(d).append(g)})(f[e])}b&&b()}}})},selectCombox:function(b,c){$.ajax({url:b,type:"get",success:function(d){mini.get(c).load(d);mini.get(c).setValue("-1")}})},load_risk_menu:function(){var f=mini.get("riskAreaCatgName").getCheckedNodes(true);var h="";var e="";var b="";if(f.length>0){for(var d=0;d<f.length;d++){(function(i){if(i.categID==""){h="";e="";b=""}else{if(i.categID.indexOf("sm")!=-1){h=i.code}else{if(i.categID.indexOf("md")!=-1){e=i.code}else{if(i.categID.indexOf("bg")!=-1){b=i.code}}}}})(f[d])}}var c=$("#riskAreaCatg").val();if(drtDeptCode){var g=riskAreaName_url+"&enterpriseCode="+enterpriseCode+"&drtDeptCode="+drtDeptCode+"&areaSmCatg="+h+"&areaMdCatg="+e+"&areaBgCatg="+b+"&riskAreaCatg="+c;a.logic.selectCombox(g,"#riskAreaCode");mini.get("riskAreaCode").enable()}else{mini.get("riskAreaCode").disable();mini.get("riskAreaCode").setValue("-1")}mini.get("optlRiskCode").disable();mini.get("optlRiskCode").setValue("-1");mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")},load_optrisk_menu:function(){var c=$("#zoneCatg").val();if(riskAreaID){var b=oprisk_url+"&riskAreaID="+riskAreaID+"&zoneCatg="+c;a.logic.selectCombox(b,"#optlRiskCode");mini.get("optlRiskCode").enable()}else{mini.get("optlRiskCode").disable();mini.get("optlRiskCode").setValue("-1")}mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")},load_rapTypeNameList:function(){var b=$("#riskAnlsObjCatg").val(),c=RiskAnlsObjName_url+"&optlRiskZoneID="+optlRiskZoneID+"&riskAnlsObjCatg="+b;if(optlRiskZoneID){a.logic.selectCombox(c,"#riskAnlsObjCode");mini.get("riskAnlsObjCode").enable()}else{mini.get("riskAnlsObjCode").disable();mini.get("riskAnlsObjCode").setValue("-1")}},edit:function(c){var b=PageModelEnum.Edit;var d="实时监测点指标配置编辑";a.logic.detail(d,c,b)},detail:function(d,c,b){layer.open({type:2,closeBtn:0,area:["1100px","450px"],skin:"new-class",shadeClose:false,title:false,content:"MonitorFactorAddOrEdit.html?"+Math.random(),success:function(f,g){var e=layer.getChildFrame("body",g);var i=window[f.find("iframe")[0]["name"]];var h={pageMode:b,siteID:c,title:d};i.page.logic.setData(h)},end:function(){if(window.pageLoadMode==PageLoadMode.Refresh){a.logic.search(true);window.pageLoadMode=PageLoadMode.None}else{if(window.pageLoadMode==PageLoadMode.Reload){a.logic.search(true);window.pageLoadMode=PageLoadMode.None}}}})},search:function(b){a.data.param={};a.data.param=ECS.form.getData("searchForm");if(b){a.data.param.sortType=1}a.data.param.enterpriseCode=enterpriseCode;a.data.param.drtDeptCode=drtDeptCode;if(mini.get("riskAreaCode").getSelected()&&mini.get("riskAreaCode").getSelected().riskAreaCode!="-1"){a.data.param.riskAreaCode=mini.get("riskAreaCode").getSelected().riskAreaCode}if(mini.get("optlRiskCode").getSelected()&&mini.get("optlRiskCode").getSelected().code!="-1"){a.data.param.optlRiskCode=mini.get("optlRiskCode").getSelected().code}if(mini.get("riskAnlsObjCode").getSelected()&&mini.get("riskAnlsObjCode").getSelected().code!="-1"){a.data.param.riskAnlsObjCode=mini.get("riskAnlsObjCode").getSelected().code}if(mini.get("riskAreaCatgName").getSelectedNode()){var c=mini.get("riskAreaCatgName").getSelectedNode();if(c.categID.indexOf("sm")!=-1){a.data.param.areaSmCatg=c.code}if(c.categID.indexOf("md")!=-1){a.data.param.areaMdCatg=c.code}if(c.categID.indexOf("bg")!=-1){a.data.param.areaBgCatg=c.code}}else{a.data.param.areaSmCatg="";a.data.param.areaMdCatg="";a.data.param.areaBgCatg=""}delete a.data.param.riskAreaCatgName;grid.load(a.data.param)},imp:function(){var c=ECS.api.bcUrl+"/monitorFactor/importExcel";var b=ECS.api.bcUrl+"/monitorFactor/ExportExcel";var e=ECS.api.bcUrl+"/monitorFactor/importAddAll";var d="../UploadFile/UploadFile.html?"+Math.random();ECS.util.importExcel(c,b,e,d)}}};a.init();window.page=a});