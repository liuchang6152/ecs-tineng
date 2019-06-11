var vm=new Vue({el:".box",data:{taskUrl:ECS.api.apUrl+"/policeProcess/taskSheet",taskConfirmUrl:ECS.api.apWebSocket+"/policeProcess/taskSheetConfirm",teamName:"",mobileOrPhone:"",userName:"",initTime:"",eventAddress:"",eventSummary:"",fireSubstanceName:"",fireLvlName:"",isExplodeName:"",isPersonInName:"",registerTime:"",commandTime:"",vehicleFullPeoples:"",vehicleNumbers:"",vehicleNames:"",alarmNames:"",firemanGoCode:"",printingTime:"",accidentTypeName:"",firemanGoBatch:"",eventId:"",teamId:"",detachmentId:""},mounted:function(){this.initData()},methods:{initData:function(){var c=this.getQueryString("eventId");var e=this.getQueryString("teamId");var d=this.getQueryString("batchId");var b=this.getQueryString("readonly");var a=this;$.ajax({url:this.taskUrl,data:{eventId:c,teamID:e,firemanGoBatch:d},type:"GET",success:function(f){vm.teamName=f.teamName+"任务单";vm.mobileOrPhone=f.mobileOrPhone;vm.userName=f.userName;vm.initTime=ECS.util.timestampToHour(f.initTime);vm.eventAddress=f.eventAddress;vm.eventSummary=f.eventSummary;vm.fireSubstanceName=f.fireSubstanceName;vm.fireLvlName=f.fireLvlName;vm.isExplodeName=f.isExplodeName;vm.isPersonInName=f.isPersonInName;vm.registerTime=ECS.util.timestampToHour(f.registerTime);vm.commandTime=ECS.util.timestampToHour(f.commandTime);vm.vehicleFullPeoples=f.vehicleFullPeoples;vm.vehicleNumbers=f.vehicleNumbers;vm.vehicleNames=f.vehicleNames;vm.alarmNames=f.alarmNames;vm.firemanGoCode=f.firemanGoCode;vm.printingTime=ECS.util.timestampToHour(f.printingTime);vm.accidentTypeName=f.accidentTypeName;vm.firemanGoBatch=f.firemanGoBatch;vm.eventId=c;vm.teamId=e;vm.detachmentId=a.getQueryString("detachmentId");if(!b){a.$nextTick(function(){var h={documents:document,copyrights:"杰创软件拥有版权  www.jatools.com"};var g=getJCP();g.print(h,false)})}else{$("#btnSave").hide()}},error:function(f){console.log(f)}})},save:function(){var a=this;ECS.util.addOrEdit({url:this.taskConfirmUrl,pageMode:PageModelEnum.Edit,data:{eventID:vm.eventId,teamID:vm.teamId,firemanGoBatch:vm.firemanGoBatch,sendTeamId:vm.detachmentId}},function(b){ECS.hideLoading();b=$.parseJSON(b);if(b.isSuccess){parent.sendFeedback(a.getQueryString("detachmentIP"),"")}else{layer.msg(b.message)}})},getQueryString:function(a){var b=new RegExp("(^|&)"+a+"=([^&]*)(&|$)","i");var c=window.location.search.substr(1).match(b);if(c!=null){return decodeURI(c[2])}return null},closeLayer:function(){var a=parent.layer.getFrameIndex(window.name);parent.layer.close(a)}}});