var leftMenuUrl=ECS.api.rttUrl+"/msds/getTreeList";var checkListUrl=ECS.api.rttUrl+"/msds/getRightList";var delLinkAll=ECS.api.rttUrl+"/msds/reset";var riskAreaTypeNameUrl=ECS.api.bcUrl+"/org/porgName?orgLvl=2";var loadUnitsUrl=ECS.api.rttUrl+"/msds/secunit";window.pageLoadMode=PageLoadMode.None;$(function(){var a={init:function(){mini.parse();ECS.sys.RefreshContextFromSYS();this.bindUI();a.logic.initTable()},table:{},bindUI:function(){mini.get("tree1").on("nodeselect",function(b){a.logic.onenode_load_dt()});mini.get("orgId").on("valuechanged",function(){a.logic.load_units()});mini.get("deptcoder").on("valuechanged",function(){a.logic.load_sidebar(function(){a.logic.onenode_load_dt()})});$("#btnAdd").on("click",function(){a.logic.add()});$("#btnDel").on("click",function(){a.logic.del_option_checked()})},data:{param:{}},logic:{initTable:function(){a.logic.load_enterprise(function(){a.logic.load_units(function(){a.logic.load_sidebar()})})},del_option_checked:function(){if(mini.get("acheck_list").getValue()==""){layer.msg("请选择需要删除的危化品数据！");return false}var b=[];b=mini.get("acheck_list").getValue().split(",");$.ajax({url:delLinkAll+"?treeId="+mini.get("tree1").getSelectedNode().id+"&applicationLevel="+mini.get("tree1").getSelectedNode().obj+"&now="+Math.random(),type:"DELETE",data:JSON.stringify(b),dataType:"text",contentType:"application/json;charset=utf-8",success:function(c){c=JSON.parse(c);if(c.isSuccess){layer.msg(c.message);a.logic.load_sidebar(function(){a.logic.onenode_load_dt()})}else{layer.msg(c.message)}}})},onenode_load_dt:function(b){ECS.showLoading();if(!mini.get("tree1").getSelectedNode()){ECS.hideLoading();return false}$.ajax({url:checkListUrl+"?treeId="+mini.get("tree1").getSelectedNode().id+"&now="+Math.random(),type:"GET",timeout:5000,success:function(c){ECS.hideLoading();mini.get("acheck_list").load(c);b&&b(c)},error:function(c){ECS.hideLoading();if(c){layer.msg(c,{time:1000})}}})},load_enterprise:function(b){$.ajax({url:riskAreaTypeNameUrl,type:"get",timeout:5000,success:function(d){mini.get("orgId").load(d);if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){mini.get("orgId").setValue(d[0].orgId)}else{mini.get("orgId").disable();for(var c=0;c<d.length;c++){(function(e){if(e.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){mini.get("orgId").setValue(e.orgId)}})(d[c])}}b&&b()},error:function(c){if(c){layer.msg(c,{time:1000})}}})},load_units:function(b){$.ajax({url:loadUnitsUrl+"?orgId="+mini.get("orgId").getValue(),type:"get",timeout:5000,success:function(d){mini.get("deptcoder").load(d);for(var c=0;c<d.length;c++){if(d[c].id){mini.get("deptcoder").setValue(d[c].id);break}}b&&b()}})},add:function(){var b=PageModelEnum.NewAdd;var c="危化品信息";a.logic.detail(c,"",b)},detail:function(d,b,c){a.logic.onenode_load_dt(function(g){var f=[];for(var e=0;e<g.length;e++){f.push(g[e]["id"])}layer.open({type:2,closeBtn:0,area:["850px","450px"],skin:"new-class",shadeClose:false,title:false,content:"MSDSModule.html?"+Math.random(),success:function(i,j){var h=layer.getChildFrame("body",j);var l=window[i.find("iframe")[0]["name"]];var k={pageMode:c,IdList:f,applicationLevel:mini.get("tree1").getSelectedNode().obj,treeId:mini.get("tree1").getSelectedNode().id,orgId:mini.get("orgId").getSelected().orgId,title:d};l.page.logic.setData(k)},end:function(){a.logic.load_sidebar(function(){a.logic.onenode_load_dt()});window.pageLoadMode=PageLoadMode.None}})})},load_sidebar:function(c){var b=null;if(mini.get("tree1").getSelected()){b=mini.get("tree1").getSelected()}if(!mini.get("orgId").getSelected()){return false}$.ajax({url:leftMenuUrl+"?orgCode="+mini.get("orgId").getSelected().orgCode+"&treeID="+mini.get("deptcoder").getValue()+"&now="+Math.random(),type:"GET",timeout:5000,success:function(d){mini.get("tree1").loadList(d,"id","pid");if(b){mini.get("tree1").selectNode(b);if(!mini.get("tree1").getSelected()){mini.get("tree1").selectNode(d[0])}}else{mini.get("tree1").selectNode(d[0])}mini.get("acheck_list").load([]);$("#tree1").parent().css("overflow-y","auto");c&&c()},error:function(d){ECS.hideLoading();if(d){layer.msg(d,{time:1000})}}})},select_option:function(c,d,b){$.ajax({url:c,type:"get",timeout:5000,success:function(e){mini.get(d).loadList(e,"orgId","orgPID");if(b!=undefined){mini.get(d).setValue(b,false)}},error:function(e){if(e){layer.msg(e,{time:1000})}}})}}};a.init();window.page=a});