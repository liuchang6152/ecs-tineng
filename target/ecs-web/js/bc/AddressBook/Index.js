var searchUrl=ECS.api.bcUrl+"/addressBook/getOrgUserByOrgId";var porg_url=ECS.api.bcUrl+"/org/porgNames?isAll=true";var reutnName="";var vm=new Vue({el:"#main",data:{items:[]},methods:{isShow:function(a){if(a&&a.length>0){return true}return false}}});$(function(){var a={init:function(){mini.parse();this.bindUI();ECS.sys.RefreshContextFromSYS();a.logic.initTable()},table:{},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});mini.get("tree1").on("nodeselect",function(){a.logic.typelist_dt()});$("#btnQuery2").click(function(){var c=$.trim($("#tree_val").find("input").val());if(c==""||c=="全部"){mini.get("tree1").clearFilter()}else{c=c.toLowerCase();mini.get("tree1").filter(function(d){var e=d.orgSname?d.orgSname.toLowerCase():"";if(e.indexOf(c)!=-1){return true}})}});var b=true;$(".btn-toggle").click(function(){if(b){$(".leftNav-body").hide();$(".box-body").css("margin-left","0");$(this).css({left:"0",transform:"rotate(180deg)"})}else{$(".leftNav-body").show();$(".box-body").css("margin-left","280px");$(this).css({left:"263px",transform:"rotate(0deg)"})}b=!b});$("#treeMenu2 li").click(function(){a.logic.onAddNode2()})},data:{param:{}},template:function(e,b){var d=mini.get("tree1").getSelectedNode();var c=b==1?e.userMobile:e.userPhone;parent.call(c)},logic:{callMobile:function(b){a.template(b,1)},callPhone:function(b){a.template(b,2)},sendMsg:function(c){var b="auto";layer.open({type:2,area:["30%","45%"],offset:b,id:"layerDemo"+b,content:"SenderMsg.html?"+Math.random(),btnAlign:"c",shade:0,yes:function(){layer.closeAll()},title:"短信编辑",success:function(e,f){var d=layer.getChildFrame("body",f);var h=window[e.find("iframe")[0]["name"]];var g={phone:c.userMobile};h.page.logic.setData(g)},end:function(){}})},initTable:function(){a.logic.load_sidebar(porg_url)},load_sidebar:function(c,b){$.ajax({url:c,type:"GET",success:function(d){if(d.length>0){mini.get("tree1").loadList(d,"orgId","orgPID");mini.get("tree1").setValue("-1")}else{}b&&b()},error:function(){}})},getLevenName:function(d,b){var c=mini.get("tree1").getParentNode(d);if(c._level>-1){b+="$$"+c.orgSname;a.logic.getLevenName(c,b)}else{reutnName=b}return reutnName},typelist_dt:function(){a.data.param={};if(mini.get("tree1").getSelectedNode()){var f=mini.get("tree1").getSelectedNode();var d=f.orgSname;var b=a.logic.getLevenName(f,d);var e=b.split("$$");var g="";for(var c=e.length;c>0;c--){g+=e[c-1]+(c==1?"":"  >  ")}$("#sp_position").text(""+g);a.data.param.orgId=mini.get("tree1").getSelectedNode().orgId}$.ajax({url:searchUrl+"/"+mini.get("tree1").getSelectedNode().orgId,type:"get",success:function(h){vm.items=h},error:function(h){}})}}};a.init();window.page=a});