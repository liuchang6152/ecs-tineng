var addUrl = ECS.api.apUrl + '/AcceptWarningConfig';
var getSingleUrl = ECS.api.apUrl + '/AcceptWarningConfig/getConfigAccept';//查询某一条数据
var baseDataID=null;//配置机构id
var baseModelCategory=null;//配置类型
var enterpriseID="";//企业id
var leng = 1;
var editUserName=[];//接警人
var usernameList=[];
var editCheckName=[];//查看人
var userCheckList=[];
var orgCode="";
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $("input").blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //tab切换
            $('#manageItem .btn').click(function() {
                var i = $(this).index();
                $(this).addClass('btn-danger').siblings().removeClass('btn-danger');
                $('#tabMain .tabItem').eq(i).show().siblings().hide();
            });
            //新增ip
            $("#addNewName").click(function(){
                page.logic.addNewIP("firstCompanyIP","ipList");
            });
             //新增video
             $("#addNewVideo").click(function(){
                page.logic.addNewVideo("firstCompanyVideo","videoList");
            });
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $("#btnClose,.btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //删除角色ip
            $('#tabMain').on('click','.delName',function(){
                leng--;
                $(this).closest('.row').remove();
            });
            //接警人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details);
            });
            //查看人员选择弹窗
            $("#checkOwner").click(function () {
                page.logic.checkOwner("人员选择(多选)",PageModelEnum.Details);
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                orgCode=data.orgCode;
                enterpriseID=data.enterpriseID;
                baseModelCategory=data.baseModelCategory;
                baseDataID=data.baseDataID;
                $("#roleName").append('<option value="'+data.baseDataID +'">'+data.name+'</option>');
                $.ajax({
                    url: getSingleUrl + "?baseModelCategory=" + baseModelCategory + "&baseDataID=" + baseDataID + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (text) {
                        if(text.seatIPEntityList){
                            //ip循环
                            $("#firstCompanyIP").attr("seatIPID",text.seatIPEntityList[0].seatIPID);
                            $("#firstCompanyIP").val(text.seatIPEntityList[0].seatIP);
                            $("#callPhone").val(text.seatIPEntityList[0].callPhone);
                            $("#callPhone2").val(text.seatIPEntityList[0].callPhone2);
                            $("#phoneExchangeAccount").val(text.seatIPEntityList[0].phoneExchangeAccount);
                            $("#phoneExchangePWD").val(text.seatIPEntityList[0].phoneExchangePWD);
                            if(text.seatIPEntityList[0].seatType=="1"){
                                $("#isFire").attr("checked",true);
                            }else{
                                $("#isFire").removeAttr("checked");
                            }
                            for(var i=1;i<text.seatIPEntityList.length;i++){
                                $(".ipList").append('<div class="row newItem">'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="name'+i+'" class="form-control required ipv4" onblur="$(this).val($.trim($(this).val()))" seatIPID="'+text.seatIPEntityList[i].seatIPID+'" value="'+text.seatIPEntityList[i].seatIP+'"/></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="tel'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="'+text.seatIPEntityList[i].callPhone+'" /></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="telt'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="'+text.seatIPEntityList[i].callPhone2+'" /></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="account'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="'+text.seatIPEntityList[i].phoneExchangeAccount+'" /></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="pwd'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="'+text.seatIPEntityList[i].phoneExchangePWD+'" /></div></div></div>'+
                                    '<div class="col-xs-2">'+
                                    '<input type="checkbox" class="isFire" />'+
                                    '<button class="btn btn-danger delName ml__35" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                                if(text.seatIPEntityList[i].seatType=="1"){
                                    $(".isFire").eq(i).attr("checked",true);
                                }
                            }
                            leng=text.seatIPEntityList.length;
                            //接警人员
                            editUserName=[];
                            usernameList=[];
                            editCheckName=[];
                            userCheckList=[];
                            if(text.seatAccountEntityList){
                                for(var i=0;i<text.seatAccountEntityList.length;i++){
                                    if(text.seatAccountEntityList[i].seatAccountType=="0"){
                                        usernameList+=text.seatAccountEntityList[i].userName+"\n";
                                        editUserName.push({"seatAccountID":text.seatAccountEntityList[i].seatAccountID,"userName":text.seatAccountEntityList[i].userName,"userUID":text.seatAccountEntityList[i].userUID})
                                    }
                                    if(text.seatAccountEntityList[i].seatAccountType=="1"){
                                        userCheckList+=text.seatAccountEntityList[i].userName+"\n";
                                        editCheckName.push({"seatAccountID":text.seatAccountEntityList[i].seatAccountID,"userName":text.seatAccountEntityList[i].userName,"userUID":text.seatAccountEntityList[i].userUID})
                                    }
                                }
                                $("#userName").val(usernameList);
                                $("#checker").val(userCheckList);
                            }
                        }

                        if(text.videoList){
                           
                            $("#firstCompanyVideo").attr("videoConfigId",text.videoList[0].videoConfigId);
                            $("#firstCompanyVideo").val(text.videoList[0].videoEndpoint);
                            $("#VideoNumber").val(text.videoList[0].maxCount);
                          
                          
                            for(var i=1;i<text.videoList.length;i++){
                                $(".videoList").append('<div class="row newItem">'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="name'+i+'" class="form-control required " onblur="$(this).val($.trim($(this).val()))" videoConfigId="'+text.videoList[i].videoConfigId+'" value="'+text.videoList[i].videoEndpoint+'"/></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                    '<input type="text" name="tel'+i+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="'+text.videoList[i].maxCount+'" /></div></div></div>'+
                                    '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                                   
    
                                    '<button class="btn btn-danger delName ml__35" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                               
                            }
                        }
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //新增角色ip
            addNewIP:function(firstIP,ipList){
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#"+firstIP).val()!=""){
                    $("."+ipList).append('<div class="row newItem">'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="name'+leng+'" class="form-control required ipv4" onblur="$(this).val($.trim($(this).val()))" seatIPID="" value=""/></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="tel'+leng+'" class="form-control number required" onblur="$(this).val($.trim($(this).val()))" value="" /></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="telt'+leng+'" class="form-control number required" onblur="$(this).val($.trim($(this).val()))" value="" /></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="account'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="" /></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="pwd'+leng+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" value="" /></div></div></div>'+
                        '<div class="col-xs-2">'+
                        '<input type="checkbox" class="isFire" />'+
                        '<button class="btn btn-danger delName ml__35" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                    leng++;
                }
            },

             //新增video
             addNewVideo:function(firstCompanyVideo,videoList){
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#"+firstCompanyVideo).val()!=""){
                    $("."+videoList).append('<div class="row newItem">'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="name'+leng+'" class="form-control required " onblur="$(this).val($.trim($(this).val()))" seatIPID="" value=""/></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+
                        '<input type="text" name="tel'+leng+'" class="form-control number required" onblur="$(this).val($.trim($(this).val()))" value="" /></div></div></div>'+
                        '<div class="col-xs-2"><div class="form-group"><div class="col-xs-12">'+

                     
                        '<button class="btn btn-danger delName ml__35" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div></div>');
                    leng++;
                }
            },
            //接警人员选择
            selectOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "userName":editUserName,
                            "orgCode":orgCode
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        editUserName=[];
                        usernameList=[];
                        for(var i=0;i<window.ownDetail.length;i++){
                            usernameList+=window.ownDetail[i].userName+'\n';
                            editUserName=window.ownDetail;
                        }
                        $("#userName").val(usernameList);
                    }
                });
            },
            //查看人员选择
            checkOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "userName":editCheckName,
                            "orgCode":orgCode
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        editCheckName=[];
                        userCheckList=[];
                        for(var i=0;i<window.ownDetail.length;i++){
                            userCheckList+=window.ownDetail[i].userName+'\n';
                            editCheckName=window.ownDetail;
                        }
                        $("#checker").val(userCheckList);
                    }
                });
            },
            /**
             * 保存
             */
            save: function () {
                  
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                if($("#userName").val()==""){
                    layer.msg("请选择接警人员！");
                    $("#userName").parents(".form-group").addClass("has-error");
                    return;
                }else{
                    $("#userName").parents(".form-group").removeClass("has-error");
                }
                //ip
                var ipList=[];
                $(".ipList").find(".row").each(function(){
                    if($(this).find("input").eq(0).val()){
                        var seatType=0;
                        if($(this).find("input").eq(5).is(":checked")){
                            seatType=1;
                        }else{
                            seatType=0;
                        }
                        ipList.push({
                            "seatIPID":$(this).find("input").eq(0).attr("seatIPID"),"seatIP":$(this).find("input").eq(0).val(),
                            "baseModelCategory":baseModelCategory,"callPhone":$(this).find("input").eq(1).val(),"callPhone2":$(this).find("input").eq(2).val(),
                            "phoneExchangeAccount":$(this).find("input").eq(3).val(),"phoneExchangePWD":$(this).find("input").eq(4).val(),
                            "seatType":seatType,"baseDataID":baseDataID,"enterpriseID":enterpriseID,"sortNum":0,"isDelete":0});
                    }
                });
                var seatList=[];
                //接警人员
                for(var jj=0;jj<editUserName.length;jj++){
                    seatList.push({
                        "seatAccountID":editUserName[jj].seatAccountID,"userName":editUserName[jj].userName,"baseDataID":baseDataID,
                        "userUID":editUserName[jj].userUID,"seatAccountType":"0","baseModelCategory":baseModelCategory,
                        "enterpriseID":enterpriseID,"sortNum":0,"isDelete":0});
                }
                //查看人员
                for(var ck=0;ck<editCheckName.length;ck++){
                    seatList.push({
                        "seatAccountID":editCheckName[ck].seatAccountID,"userName":editCheckName[ck].userName,"baseDataID":baseDataID,
                        "userUID":editCheckName[ck].userUID,"seatAccountType":"1","baseModelCategory":baseModelCategory,
                        "enterpriseID":enterpriseID,"sortNum":0,"isDelete":0});
                }

                   //video
                   var videoList=[];
                   $(".videoList").find(".row").each(function(){
                       if($(this).find("input").eq(0).val()){
                          
                          videoList.push({
                              "videoConfigId":$(this).find("input").eq(0).attr("videoConfigId"),
                               "videoEndpoint":$(this).find("input").eq(0).val(),"maxCount":$(this).find("input").eq(1).val(),
                          "baseModelCategory":baseModelCategory,
                           
                              "baseDataId":baseDataID,"enterpriseId":enterpriseID});
                       }
                   });
            
                var data={};
                data["seatIPEntityList"]=ipList;
                data["seatAccountEntityList"]=seatList;
                data["videoList"]=videoList;
                //处理提交类型
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: "POST",
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.indexOf('collection') < 0) {
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message);
                        }
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal',{
                    rules: {
                        firstCompanyIP: {
                            required: true,
                            ipv4:true
                        },
                        callPhone: {
                            required: true,
                            number:true
                        },
                        callPhone2: {
                            required: true,
                            number:true
                        },
                        phoneExchangeAccount: {
                            required: true
                        },
                        phoneExchangePWD: {
                            required: true
                        },
                        firstCompanyVideo: {
                            required: true,
                      
                        },
                        VideoNumber: {
                            required: true,
                            number:true
                        },
                    },
                });
            }
        }
    };
    page.init();
    window.page = page;
});