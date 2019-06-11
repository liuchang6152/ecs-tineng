var addUrl = ECS.api.bcUrl+ '/alarmLine';
var getSingleUrl =ECS.api.bcUrl + '/alarmLine';
var orgCodeUrl = ECS.api.bcUrl + "/org/orgCodeAndName";
var riskAreaNameUrl = ECS.api.bcUrl + "/riskArea/getListByName";
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var selectValue="";
var selectCode=[];
var selectRight="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        init: function () {
            this.bindUI();
            page.logic.initOrgCode();//组织机构
        },
        bindUI: function () {
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //风险区域
            $("#riskAreaNames").focus(function () {
                $(this).val("");
                $(".mainSelect").show();
                page.logic.saveRiskAreaList();
                page.logic.initRiskAreaList("");
            });
            $('#riskAreaNames').bind('input propertychange', function() {
                page.logic.initRiskAreaList($(this).val());
            });
            $('#equipmentUid,#officePhone,#ipAddress').bind('input propertychange', function() {
                if($("#officePhone").val()!==""||$("#ipAddress").val()!==""||$("#equipmentUid").val()!==""){
                    $(".list").removeClass('required').next(".has-error").remove();
                    $(".list").parents(".form-group").removeClass('has-error');
                } else{
                    $("#officePhone").addClass('required');
                    $("#ipAddress").addClass('required');
                    $("#equipmentUid").addClass('required');

                }
            });
        },
        logic: {
            /**
             * 获取组织机构
             */
            initOrgCode: function () {
                ECS.ui.getCombobox("orgCode", orgCodeUrl, {
                    selectFirstRecord:true,
                    keyField: "key",
                    valueField: "value",
                }, null);
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                $("#alarmLineTypeName").val(data.typeName);
                if (pageMode == PageModelEnum.NewAdd) {
                    if(data.typeName=='扩音设备'){
                        $("#alarmLineType").val('1');
                    }else{
                        $("#alarmLineType").val('2');
                    }
                    return;
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.alarmLineID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal',data);
                        if (pageMode == PageModelEnum.Edit) {
                            page.logic.editRiskArea(data);
                        }
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 编辑时填入风险区域数据
             */
            editRiskArea:function(data){
                var riskAreaList='';
                var hasSelectList='';
                var riskArea=[];
                for(var i=0;i<data.alarmLineRiskArea.length;i++){
                    riskAreaList+=data.alarmLineRiskArea[i].riskAreaEntity.riskAreaName+'、';
                    hasSelectList+="<p id='"+data.alarmLineRiskArea[i].riskAreaEntity.riskAreaID+"' areaId='"+data.alarmLineRiskArea[i].alarmLineRiskAreaID+"' code='"+data.alarmLineRiskArea[i].code+"' title='"+data.alarmLineRiskArea[i].riskAreaEntity.riskAreaName+"'><span>"+data.alarmLineRiskArea[i].riskAreaEntity.riskAreaName+"</span><i class='icon-close del fr' style='width: 12px;;'></i></p>";
                    riskArea.push({alarmLineID:$("#alarmLineID").val(),alarmLineRiskAreaID:data.alarmLineRiskArea[i].alarmLineRiskAreaID,code:data.alarmLineRiskArea[i].code});
                }
                riskAreaList.substring(riskAreaList.length-1);
                $("#riskAreaNames").val(riskAreaList);
                $(".main-right").append(hasSelectList);
                $("#alarmLineRiskArea").val(JSON.stringify(riskArea));
                $(".icon-close").click(function () {
                    $(this).parent().remove("p");
                    $(".main-left").find("#"+$(this).parent().attr('id')).removeClass("active");
                });
                page.logic.saveRiskAreaList();
            },
            /**
             * 风险区域数据
             */
            initRiskAreaList:function(searchWord){
                var shtml="";
                $.ajax({
                    url: riskAreaNameUrl+'?riskAreaName='+searchWord,
                    type: "get",
                    dataType: "json",
                    success: function (data) {
                        for(var i=0;i<data.length;i++){
                            shtml+="<p id='"+data[i].riskAreaID+"' code='"+data[i].riskAreaCode+"'>"+data[i].riskAreaName+"</p>";
                        }
                        $(".main-left").html(shtml);
                        $(".main-right p").each(function(){
                            $(".main-left").find("#"+$(this).attr("id")).addClass("active");
                        });
                        page.logic.initRiskArea();
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            initRiskArea:function(){
                $(".main-left p").click(function(event) {
                    event.stopPropagation();
                    var clone="<p id='"+$(this).attr('id')+"' title='"+$(this).text()+"' code='"+$(this).attr('code')+"'><span>"+$(this).text()+"</span><i class='icon-close del fr'></i></p>";
                    var curId=$(this).attr('id');
                    var hasitem=false;
                    $(".main-right p").each(function(){
                        var hasId = $(this).attr("id");
                        if( curId ==hasId){
                            hasitem=true;
                            return false
                        }else{
                            hasitem=false;
                        }
                    });
                    if(!hasitem){
                        $(this).addClass("active");
                        $(".main-right").append(clone);
                    }
                    $(".icon-close").click(function () {
                        $(this).parent().remove("p");
                        $(".main-left").find("#"+$(this).parent().attr('id')).removeClass("active");
                    });
                });
                page.logic.saveRiskAreaList();
            },
            /**
             * 保存风险区域数据
             */
            saveRiskAreaList:function(){
                $(".saveSelect").click(function () {
                    $("#alarmLineRiskArea").val("");
                    selectValue='';
                    selectCode=[];
                    if($(".main-right p").length>0){
                        selectRight=$(".main-right").html();
                        $(".main-right p").each(function(){
                            selectValue+=$(this).text()+'、';
                            selectCode.push({alarmLineID:$("#alarmLineID").val(),alarmLineRiskAreaID:$(this).attr("areaId"),code:$(this).attr("code")});
                        });
                        $("#riskAreaNames").val(selectValue);
                        $("#alarmLineRiskArea").val(JSON.stringify(selectCode));
                        $("#riskAreaNames").removeClass('required').next(".has-error").remove();
                        $("#riskAreaNames").parents(".form-group").removeClass('has-error');
                        $(".mainSelect").hide();
                    }else{
                        layer.msg("请选择风险区域！");
                    }
                });
                $(".closeSelect").click(function(){
                    $("#riskAreaNames").val(selectValue);
                    $("#alarmLineRiskArea").val(JSON.stringify(selectCode));
                    $(".mainSelect").hide();
                });
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                $("#AddOrEditModal").find("input[class*=form-control]").each(function () {
                    $(this).val($.trim($(this).val()));
                });
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                if(data.alarmLineRiskArea=="[]"||!data.alarmLineRiskArea||!data.riskAreaNames){
                    layer.msg("请选择正确的风险区域数据!");
                    return
                }
                var ob=JSON.parse(data.alarmLineRiskArea);
                data.alarmLineRiskArea=ob;
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
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
                            layer.msg("保存成功！",{time: 1000},function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    }, error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
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
                        alarmLineName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        orgCode: {
                            required: true
                        },
                        riskArea: {
                            required: true
                        },
                        officePhone: {
                            simplePhone:true
                        },
                        ipAddress: {
                            ipv4:true
                        },
                        alarmLineDes:{
                            rangelength: [0, 200]
                        }
                    }
                });
                if($("#officePhone").val()!==""||$("#ipAddress").val()!==""||$("#equipmentUid").val()!==""){
                    $(".list").removeClass('required');
                } else{
                    $("#officePhone").addClass('required');
                    $("#ipAddress").addClass('required');
                    $("#equipmentUid").addClass('required');
                }
            }
        }
    };
    page.init();
    window.page = page;
});