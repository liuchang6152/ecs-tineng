var delUrl=ECS.api.apUrl+"/AcceptWarningConfig";var searchUrl=ECS.api.apUrl+"/AcceptWarningConfig";var roleListOrg=ECS.api.bcUrl+"/org/gettorgName?orgLvl=3&isAll=true";var roleListArea=ECS.api.bcUrl+"/riskArea/zmyRiskArea";var equalLvl=null;var initOrgID="";var initOrgName="";var baseDataID=null;var baseModelCategory=null;var isAllTrue=true;var orgCode="";window.pageLoadMode=PageLoadMode.None;$(function(){var a=parent.layer.getFrameIndex(window.name);var b={init:function(){mini.parse();this.bindUI()},table:{},bindUI:function(){mini.get("roleAreaName").on("valuechanged",function(c){if(c.value==""||c.value=="-1"){isAllTrue=true;baseModelCategory="";baseDataID=""}else{isAllTrue=false}});mini.get("roleAreaName").on("nodeclick",function(c){if(c.node.orgId==null){isAllTrue=true}else{if(c.node._level=="0"){baseModelCategory="2";baseDataID=c.node.orgId}else{if(c.node._level=="1"){baseModelCategory="3";baseDataID=c.node.orgId}else{if(c.node._level=="2"){baseModelCategory="4";baseDataID=c.node.riskAreaID}}}isAllTrue=false}});mini.get("roleOrgName").on("valuechanged",function(c){if(c.value==""||c.value=="-1"){isAllTrue=true;baseModelCategory="";baseDataID=""}else{isAllTrue=false}});mini.get("roleOrgName").on("nodeclick",function(c){if(c.node.orgId=="-1"){isAllTrue=true}else{if(c.node._level=="0"){baseModelCategory="2";baseDataID=c.node.orgId}else{if(c.node._level=="1"){baseModelCategory="3";baseDataID=c.node.orgId}else{if(c.node._level=="2"){baseModelCategory="4";baseDataID=c.node.riskAreaID}}}isAllTrue=false}});$(".btnClose").click(function(){b.logic.closeLayer()});$("#btnAdd").click(function(){if(baseDataID){b.logic.add()}else{layer.msg("请选择配置机构！")}});$("#btnDel").click(function(){b.logic.delAll()});$("#btnQuery").click(function(){b.logic.search()})},data:{param:{}},logic:{setData:function(c){pageMode=c.pageMode;orgCode=c.orgCode;initOrgID=c.orgID;equalLvl=c.equalLvl;initOrgName=c.orgName;b.logic.cbxroleOrgName(c.orgID,c.equalLvl);b.logic.initTable()},initTable:function(){grid=mini.get("datagrid");grid.set({url:searchUrl,ajaxType:"get",dataField:"pageList"});grid.load({orgId:initOrgID})},show_edit:function(c){return'<a title="编辑" href="javascript:window.page.logic.edit(\''+c.row.baseDataName+"',"+c.row.baseModelCategory+","+c.row.baseDataID+')">编辑</a>'},show_ip:function(c){return"总数[ "+c.row.ipCount+" ]"},show_user:function(c){return"接警[ "+c.row.jjCount+" ]  查看[ "+c.row.ckCount+" ]"},cbxroleOrgName:function(c,d){switch(d){case 2:baseModelCategory="2";baseDataID=initOrgID;$("#orgId").attr("disabled",true);$("#orgId").append('<option value="'+initOrgID+'" selected>'+initOrgName+"</option>");$("#orgName").hide();$("#areaName").hide();break;case 3:$("#enterpriseId").hide();$("#orgName").show();$("#areaName").hide();$.ajax({url:roleListOrg+"&orgPID="+c+"&isAll=true",type:"get",async:false,success:function(e){mini.get("roleOrgName").loadList(e,"orgId","orgPID")}});break;case 4:$("#enterpriseId").hide();$("#orgName").hide();$("#areaName").show();$.ajax({url:roleListArea+"?orgID="+c+"&isAll=true",type:"get",async:false,success:function(e){mini.get("roleAreaName").loadList(e,"zid","orgPID")}});break}},delAll:function(){var c=[];var d=grid.getSelecteds();$.each(d,function(e,f){c.push({baseModelCategory:f.baseModelCategory,baseDataID:f.baseDataID})});if(c.length==0){layer.msg("请选择要删除的数据!");return}layer.confirm("确定删除吗？",{btn:["确定","取消"]},function(){$.ajax({url:delUrl,async:true,data:JSON.stringify(c),dataType:"text",contentType:"application/json;charset=utf-8",type:"DELETE",beforeSend:function(){layer.closeAll();ECS.showLoading()},success:function(e){ECS.hideLoading();if(e.indexOf("collection")<0){layer.msg("删除成功！",{time:1000},function(){grid.reload({pageIndex:0})})}else{e=JSON.parse(e);layer.msg(e.collection.error.message)}},error:function(e){ECS.hideLoading();var f=$.parseJSON(e.responseText);layer.msg(f.collection.error.message)}})},function(e){layer.close(e)})},add:function(){var c=PageModelEnum.NewAdd;if(equalLvl==2){b.logic.detail(c,initOrgName,baseModelCategory,baseDataID)}else{if(equalLvl==3){b.logic.detail(c,mini.get("roleOrgName").getSelectedNode().orgSname,baseModelCategory,baseDataID)}else{b.logic.detail(c,mini.get("roleAreaName").getSelectedNode().showStr,baseModelCategory,baseDataID)}}},edit:function(f,e,c){var d=PageModelEnum.Edit;b.logic.detail(d,f,e,c)},detail:function(e,f,d,c){layer.open({type:2,closeBtn:0,area:["900px","530px"],skin:"new-class",shadeClose:false,title:false,content:"AcceptWarningConfigEdit.html?"+Math.random(),success:function(h,i){var g=layer.getChildFrame("body",i);var k=window[h.find("iframe")[0]["name"]];var j={pageMode:e,name:f,baseModelCategory:d,baseDataID:c,enterpriseID:initOrgID,orgCode:orgCode};k.page.logic.setData(j)},end:function(){b.logic.search()}})},closeLayer:function(){window.parent.pageLoadMode=PageLoadMode.Reload;parent.layer.close(a)},search:function(){if(isAllTrue){grid.load({orgId:initOrgID});return}grid.load({baseDataID:baseDataID,baseModelCategory:baseModelCategory})}}};b.init();window.page=b});