var enterpriseCodeUrl=ECS.api.bcUrl+"/org/porgName";var commGroupsType_url=ECS.api.emUrl+"/CommGroupsType";var addType_url=ECS.api.emUrl+"/CommGroupsType";var delType=ECS.api.emUrl+"/CommGroupsType";var delGroup=ECS.api.emUrl+"/CommGroups";var searchUrl=ECS.api.emUrl+"/PersonInCommGroup";var exportUrl=ECS.api.emUrl+"/CommGroups/ExportToExcel";window.pageLoadMode=PageLoadMode.None;pageflag=true;redisKey="";$(function(){var a={init:function(){mini.parse();this.bindUI();$("#searchForm").find("input").val("");ECS.sys.RefreshContextFromSYS();a.logic.get_list(enterpriseCodeUrl,$("#enterpriseCode"))},table:{},bindUI:function(){mini.get("enterpriseCode").on("nodeclick",function(b){a.logic.load_sidebar(commGroupsType_url,"commGroupsType",b.node.orgCode)});mini.get("commGroupsType").on("nodeclick",function(d){var b=mini.get("commGroupsType");var c=b.getSelectedNode();if(c.children){return}a.logic.search()});$("#btnQuery").click(function(){a.logic.search()});$("#btnDel").click(function(){var b=mini.get("commGroupsType");var c=b.getSelectedNode();a.logic.delAll(c.id,c)});$("#btnImp").click(function(){a.logic.imp()});$("#btnExport").click(function(){window.open(exportUrl+"?enterpriseCode="+mini.get("enterpriseCode").value)});$("#btnAdd").click(function(){var b=mini.get("commGroupsType");var d=b.getSelectedNode();var c=mini.get("enterpriseCode").getValue();if(d.children){layer.msg("请选择组！",{time:1000},function(){})}else{var e=d.id;a.logic.selectOwner("人员选择",e,d,PageModelEnum.NewAdd,c)}})},data:{param:{}},logic:{get_list:function(c,f,e,b){if(e){var d=c+"?isAll=true&orgPID="+e+"&orgLvl=3"}else{var d=c+"?orgLvl=2"}$.ajax({async:false,url:d,type:"GET",success:function(h){if(e){mini.get("drtDeptCode").loadList(h,"orgId","orgPID");mini.get("drtDeptCode").setValue("全部");a.logic.load_risk_menu();b&&b()}else{mini.get("enterpriseCode").loadList(h,"orgId","orgPID");if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){enterpriseCode=mini.get("enterpriseCode").data[0].orgCode;mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode)}else{enterpriseCode=ECS.sys.Context.SYS_ENTERPRISE_CODE;mini.get("enterpriseCode").disable();for(var g=0;g<h.length;g++){(function(i){if(i.orgCode==enterpriseCode){mini.get("enterpriseCode").setValue(i.orgCode)}})(h[g])}}mini.get("enterpriseCode").doValueChanged();a.logic.load_sidebar(commGroupsType_url,"commGroupsType",enterpriseCode);b&&b()}}})},load_sidebar:function(b,d,c){$.ajax({url:b+"?enterpriseCode="+c,type:"get",success:function(e){if(e.length==0){$("#add").hide();$("#edit").hide();$("#remove").hide();e.push({id:0,name:"无",children:[]})}else{$("#add").show();$("#edit").show();$("#remove").show()}mini.get(d).loadData(e)},error:function(f){}})},search:function(){var b=mini.get("commGroupsType");var c=b.getSelectedNode();if(c.children){return}grid=mini.get("datagrid");grid.set({url:searchUrl+"/search",ajaxType:"get",dataField:"pageList"});grid.load({commGroupId:c.id,userName:$.trim(mini.get("key_words").value)})},initTable:function(b){grid=mini.get("datagrid")},onManage:function(g){var f=mini.get("enterpriseCode");var b=mini.get("commGroupsType");var d=b.getSelectedNode();console.log(d);var c=PageModelEnum.NewAdd;layer.open({type:2,closeBtn:0,area:["90%","80%"],skin:"new-class",shadeClose:false,scrollbar:false,title:false,content:"CommGroupType.html?"+Math.random(),success:function(h,i){var e=layer.getChildFrame("body",i);var k=window[h.find("iframe")[0]["name"]];var j={pageMode:c,title:"通讯组类型维护",enterpriseCode:f.value,enterpriseName:f.text};k.page.logic.setData(j)},end:function(){a.logic.load_sidebar(commGroupsType_url,"commGroupsType",f.value)}})},onAddNode:function(h){var g=mini.get("enterpriseCode");var c=mini.get("commGroupsType");var f=c.getSelectedNode();var d=PageModelEnum.NewAdd;var i="新增通讯组";var b=c.getParentNode(f);if(b._level==-1){a.logic.detail(i,g.value,g.text,f.id,f.name,d)}else{layer.msg("请选择组类型！",{time:1000},function(){})}},onEditNode:function(h){var c=mini.get("commGroupsType");var f=c.getSelectedNode();var b=c.getParentNode(f);var g=mini.get("enterpriseCode");var i="编辑通讯组";var d=PageModelEnum.Edit;if(!f.children){a.logic.detail(i,g.value,g.text,f.id,f.name,b.id,b.name,d)}else{layer.msg("请选择组！",{time:1000},function(){})}},onRemoveNode:function(g){var f=mini.get("enterpriseCode");var b=mini.get("commGroupsType");var c=b.getSelectedNode();if(c.children){layer.msg("请选择组！",{time:1000},function(){});return}if(c){var d={commGroupid:c.id};layer.confirm("确定删除选中通讯组？",{btn:["确定","取消"]},function(){$.ajax({url:delGroup,async:false,data:JSON.stringify(d),dataType:"json",contentType:"application/json;charset=utf-8",type:"DELETE",success:function(e){if(e.isSuccess){layer.msg(e.message,{time:1000},function(){a.logic.load_sidebar(commGroupsType_url,"commGroupsType",f.value)})}else{layer.msg(e.message)}},error:function(e){var h=$.parseJSON(e.responseText);layer.msg(h.collection.error.message)}})},function(e){layer.close(e)})}},onBeforeOpen:function(f){var b=f.sender;var k=mini.get("commGroupsType");var c=k.getSelectedNode();if(!c){f.cancel=true;return}if(c&&c.text=="Base"){f.cancel=true;f.htmlEvent.preventDefault();return}var g=mini.getbyName("manage",b);var i=mini.getbyName("add",b);var d=mini.getbyName("edit",b);var j=mini.getbyName("remove",b);if(c.id=="forms"){g.show();i.show();d.hide();j.hide()}if(c.id=="lists"){g.hide();i.hide();d.show();j.show()}var h=f||window.event;if(h.stopPropagation){h.stopPropagation()}else{h.cancelBubble=true}},delAll:function(e,c){var d=mini.get("enterpriseCode");var b=new Array();var f=grid.getSelecteds();$.each(f,function(h,j){var g={userId:j.userID,commGroupId:e};b.push(g)});if(b.length==0){layer.msg("请选择要删除的数据!");return}layer.confirm("确定删除吗？",{btn:["确定","取消"]},function(){$.ajax({url:searchUrl,async:false,data:JSON.stringify(b),dataType:"json",contentType:"application/json;charset=utf-8",type:"DELETE",success:function(g){if(g.isSuccess){layer.msg("删除成功！",{time:1000},function(){var i=c.name+"("+Number(c.personCount-b.length)+")";var h=Number(c.personCount-b.length);mini.get("commGroupsType").updateNode(c,{groupNameAndCount:i,personCount:h});a.logic.search()})}else{layer.msg(g.message)}},error:function(g){var h=$.parseJSON(g.responseText);layer.msg(h.collection.error.message)}})},function(g){layer.close(g)})},selectOwner:function(f,e,d,c,b){layer.open({type:2,closeBtn:0,area:["80%","90%"],skin:"new-class",shadeClose:false,scrollbar:false,title:false,content:"SelectPersons.html?"+Math.random(),success:function(h,i){var g=layer.getChildFrame("body",i);var k=window[h.find("iframe")[0]["name"]];var j={pageMode:c,title:f,orgCode:b};k.page.logic.setData(j)},end:function(){var m=[];function k(q){var o=grid.getList();for(var n=0;n<o.length;n++){var p=o[n];if(p.userID==q.userId){m.push(q.userName);return true}}return false}var g=[];for(var j=0;j<window.ownDetail.length;j++){var l=window.ownDetail[j];if(!k(l)){var h={userId:l.userId,commGroupId:e};g.push(h)}else{if(window.ownDetail.length>0){layer.msg("该人员已存在！"+m.toString(","),{time:1000})}}}if(g.length==0){return}$.ajax({url:searchUrl,async:false,type:"POST",data:JSON.stringify(g),dataType:"json",contentType:"application/json;charset=utf-8",beforeSend:function(){$("#btnSave").attr("disabled","disabled");ECS.showLoading()},success:function(i){ECS.hideLoading();if(i.isSuccess){var o=d.name+"("+Number(d.personCount+g.length)+")";var n=Number(d.personCount+g.length);mini.get("commGroupsType").updateNode(d,{groupNameAndCount:o,personCount:n});a.logic.search();layer.msg("保存成功！",{time:1000},function(){})}else{layer.msg(i.message)}},error:function(i){$("#btnSave").attr("disabled",false);ECS.hideLoading();var n=$.parseJSON(i.responseText);layer.msg(n.collection.error.message)}})}})},detail:function(i,g,d,f,h,b,c,e){layer.open({type:2,closeBtn:0,area:["400px","400px"],skin:"new-class",shadeClose:false,title:false,content:"CommGroupAddOrEdit.html?"+Math.random(),success:function(k,l){var j=layer.getChildFrame("body",l);var n=window[k.find("iframe")[0]["name"]];var m={pageMode:e,commGroupTypeId:f,commGroupTypeName:h,enterpriseCode:g,enterpriseName:d,title:i};if(e==PageModelEnum.NewAdd){}if(e==PageModelEnum.Edit){m.commGroupTypeId=b;m.commGroupTypeName=c;m.groupName=h;m.groupId=f}n.page.logic.setData(m)},end:function(){a.logic.load_sidebar(commGroupsType_url,"commGroupsType",g)}})},imp:function(){var c=ECS.api.emUrl+"/CommGroups/importExcel";var b=ECS.api.emUrl+"/CommGroups/ExportExcel";var e=ECS.api.emUrl+"/CommGroups/importAddAll";var d="../../bc/UploadFile/UploadFile.html?"+Math.random();ECS.util.importExcel(c,b,e,d)}}};a.init();window.page=a});