var searchTypeUrl=ECS.api.apUrl+"/event/getconfimPlanDefinition";var smallTypeUrl=ECS.api.apUrl+"/event/getAccidentCategory";var searchUrl=ECS.api.apUrl+"/event/getEmergencyPlanByCondition";var exportUrl=ECS.api.apUrl+"/event/ExportToExcel";var dept_url=ECS.api.rttUrl+"/msds/secunit";var riskType_url=ECS.api.apUrl+"/event/getRiskArea";var OptRisk_url=ECS.api.apUrl+"/event/getOptRisk";var RiskAnlsObj_url=ECS.api.apUrl+"/event/getRiskAnlsObj";var grid=null;var flag=false;var enterpriseCode="";var drtDeptCode="";window.pageLoadMode=PageLoadMode.None;$(function(){var a={init:function(){mini.parse();this.bindUI();a.logic.loadType();$("#searchForm")[0].reset();a.logic.initTable()},table:{},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#btnToggle").click(function(){if(flag){flag=!flag;$(this).html('<i class="icon-showMore"></i>');$(".search-unfixed").hide()}else{flag=!flag;$(this).html('<i class="icon-hideMore"></i>');$(".search-unfixed").show()}});$("#btnAdd").click(function(){var c=ECS.form.getData("searchForm");if(!c.riskAreaId){c.riskAreaId=""}if(!c.optlRiskZoneId){c.optlRiskZoneId=""}if(!c.riskAnlsObjId){c.riskAnlsObjId=""}var b=a.logic.setUrlK(c);window.open(exportUrl+"?"+b)});$("#btnQuery").click(function(){a.logic.search()});$("#drtDeptCode").change(function(b){a.logic.drtDeptCodeChange($("#drtDeptCode").val())});$("#riskAreaId").change(function(b){a.logic.riskAreaIdChange($("#riskAreaId").val())});$("#optlRiskZoneId").change(function(b){a.logic.optlRiskZoneIdChange($("#optlRiskZoneId").val())})},data:{param:{}},logic:{setUrlK:function(f){var d="",b,c;for(var e in f){if(f.hasOwnProperty(e)){b=e}c=f[e];d+="&"+b+"="+encodeURIComponent(c)}return d.substring(1,d.length)},show_Detail:function(b){return'<a href="'+ECS.api.bcUrl+"/attachment/downloadFile?atchPath="+b.row.acthPath+"&atchName="+b.row.acthName+'">'+b.value+"</a>"},loadType:function(b){ECS.ui.getComboSelects(searchTypeUrl,"planDefinition","id","name",false);ECS.ui.getComboSelects(smallTypeUrl,"smallIds","accidentTypeID","accidentTypeName",false);ECS.ui.getComboSelects(dept_url,"drtDeptCode","id","name",false)},initTable:function(){a.logic.search()},search:function(b){a.data.param=ECS.form.getData("searchForm");grid=mini.get("datagrid");grid.set({url:searchUrl,ajaxType:"get",dataField:"pageList"});grid.load(a.data.param)},drtDeptCodeChange:function(b){ECS.ui.getComboSelects(riskType_url+"?drtDeptId="+b,"riskAreaId","riskAreaId","riskAreaName",false)},riskAreaIdChange:function(b){ECS.ui.getComboSelects(OptRisk_url+"?riskAreaId="+b,"optlRiskZoneId","optRiskId","optRiskName",false)},optlRiskZoneIdChange:function(b){ECS.ui.getComboSelects(RiskAnlsObj_url+"?optRiskId="+b,"riskAnlsObjId","optAnlsObjId","optAnlsObjName",false)}}};a.init();window.page=a});