var orgNameUrl=ECS.api.bcUrl+"/user/orgName";var pageMode=PageModelEnum.Details;var items;window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){mini.parse();this.bindUI()},bindUI:function(){$("input").blur(function(){$(this).val($.trim($(this).val()))});$("#btnSave").click(function(){b.logic.save()});$(".btnClose").click(function(){window.pageLoadMode=PageLoadMode.None;b.logic.closeLayer(false)});$("#add").click(function(){b.logic.moveAdd()});$("#remove").click(function(){b.logic.moveRemove()})},logic:{select_option:function(c,d){$.ajax({url:c,type:"get",beforeSend:function(){ECS.showLoading()},success:function(e){ECS.hideLoading();mini.get(d).loadList(e,"zid","orgPID")},error:function(e){ECS.hideLoading()}})},moveAdd:function(){items=mini.get("tree1").getSelectedNode();$("#grid2 p").text(items.showStr);$("#grid2 p").attr("id",items.userID);$("#grid2 p").click(function(){$(this).siblings("p").removeClass("selected");$(this).addClass("selected")})},moveRemove:function(){$(".selected").html("");selectUser={}},onDrawNode:function(f){var c=f.sender;var d=f.node.userID;if(d==null){f.iconCls="mini-tree-folder"}else{f.iconCls="mini-tree-user"}},beforenodeselect:function(d){var c=d.node.userID;if(d.node.userID==null){d.cancel=true}},search:function(){mini.parse();var c=mini.get("key").getValue();if(c==""){mini.get("tree1").clearFilter()}else{c=c.toLowerCase();mini.get("tree1").filter(function(d){var e=d.userName?d.userName:"";if(e.indexOf(c)!=-1){return true}})}},setData:function(c){$("#title-main").text(c.title);pageMode=c.pageMode;if(c.userInfo){$("#grid2 p").text(c.userInfo.userName);$("#grid2 p").attr("id",c.userInfo.userID);$("#grid2 p").click(function(){$(this).siblings("p").removeClass("selected");$(this).addClass("selected")})}b.logic.select_option(orgNameUrl+"?orgCode="+c.orgCode,"#tree1")},save:function(){if(items){parent.ownDetail=items.userID}b.logic.closeLayer(true)},closeLayer:function(c){window.parent.pageLoadMode=window.pageLoadMode;parent.layer.close(a)}}};b.init();window.page=b});