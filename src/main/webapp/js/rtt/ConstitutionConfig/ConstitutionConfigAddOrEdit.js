var addUrl = ECS.api.rttUrl + '/constitutionType';
var deleteSubUrl = ECS.api.rttUrl + '/constitutionType/constitution';
var getSingleUrl = ECS.api.rttUrl + '/constitutionType/getSingleConstitutionType';
var enterpriseCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var constitutionTypeUrl=ECS.api.rttUrl+'/constitutionType/constitutionType';//建制
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var listLength=$("#nameList .form-group").length;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            page.logic.initOrgCode(enterpriseCodeUrl,$("#enterpriseCode"));//企业
            page.logic.initConstitutionType();//建制
        },
        bindUI: function () {
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#addNewName").click(function () {
                if(listLength < 4) {
                    $("#nameList").append('<div class="form-group">'+
                        '<div class="col-xs-7 col-xs-offset-3">'+
                        '<input type="text" name="list'+listLength+'" class="form-control required" onblur="$(this).val($.trim($(this).val()))" maxlength="200" /></div>'+
                        '<span class="span-required">*</span>'+
                        '<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
                    listLength++;
                }else{
                    layer.msg("最多只能添加四个!");
                }
            });
            $('#nameList').on('click','.delName',function(){
                $(this).closest('.form-group').remove();
                listLength--;
                return false;
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    return;
                }
                if (pageMode == PageModelEnum.Edit) {
                    $('#enterpriseCode-text').html('<input name="orgName" type="text" class="form-control" id="orgName" /><input name="orgID" type="hidden" id="orgID" />');
                    $("#orgName").attr('disabled','disabled');
                    $("#constitutionTypeID").attr('disabled','disabled');
                }
                $.ajax({
                    url: getSingleUrl + "?constitutionTypeId=" + data.constitutionTypeID + "&orgID="+data.orgID,
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal', data);
                        $("#firstName").val(data.nameEntitys[0].constitutionName);
                        $("#firstName").attr("nameid",data.nameEntitys[0].constitutionNameID);
                        $("#firstName").attr("pid",data.nameEntitys[0].constitutionNamePID);
                        for(var i=1;i<data.nameEntitys.length;i++){
                            var str = '<div class="form-group">'+
                                '<div class="col-xs-7 col-xs-offset-3">'+
                                '<input type="text" pid="'+data.nameEntitys[i].constitutionNamePID+'" nameid="'+data.nameEntitys[i].constitutionNameID+'" name="list'+i+'" class="form-control required" maxlength="200" value="'+data.nameEntitys[i].constitutionName+'" onblur="this.value=this.value.replace(/\\s+/g,\'\')" /></div>'+
                                '<span class="span-required">*</span>';
                            if(i==data.nameEntitys.length-1){
                                str += '<button class="btn btn-danger delName2" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>';
                            }
                            str += '</div>';
                            $("#nameList").append(str);
                        }
                        $('#nameList').on('click','.delName2',function(){
                            if(listLength>2){
                                $(this).parent().prev().html($(this).parent().prev().html()+'<button class="btn btn-danger delName2" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
                            }
                            $(this).closest('.form-group').remove();
                            $.ajax({
                                url: deleteSubUrl+"?id="+ $(this).prev().prev().find("input").attr("nameid"),
                                async: false,
                                type: "DELETE",
                                data:{},
                                dataType: "text",
                                contentType: "application/json;charset=utf-8",
                                beforeSend: function () {
                                    ECS.showLoading();
                                },
                                success: function (result) {
                                    ECS.hideLoading();
                                    if (result.indexOf('collection') < 0) {
                                        layer.msg("删除成功！",{
                                            time: 1000
                                        });
                                    } else {
                                        layer.msg(result.collection.error.message)
                                    }
                                },
                                error: function (result) {
                                    $('#btnSave').attr('disabled', false);
                                    ECS.hideLoading();
                                    var errorResult = $.parseJSON(result.responseText);
                                    layer.msg(errorResult.collection.error.message);
                                }
                            })
                            listLength--;
                            return false;
                        });
                        listLength=$("#nameList .form-group").length;
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 企业
             */
            initOrgCode:function(menu_url){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    async:false,
                    success:function (data) {
                        mini.get("orgID").loadList(data, "orgId", "orgPID");
                        if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                            mini.get("orgID").setValue(mini.get("orgID").data[0].orgId);
                        }else{
                            mini.get("orgID").disable();
                            for(var w=0;w<data.length;w++){
                                (function(menu_url){
                                    if(menu_url.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        mini.get("orgID").setValue(menu_url.orgId);
                                    }
                                })(data[w]);
                            }
                        }
                    }
                })
            },
            /**
             * 建制
             */
            initConstitutionType:function(){
                ECS.ui.getCombobox("constitutionTypeID", constitutionTypeUrl, {
                    async:false,
                    keyField: "constitutionTypeID",
                    valueField: "constitutionType",
                }, null);
            },
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                var numArr=[];
                $("#nameList").find(".form-control").each(function(i){
                    $(this).val($.trim($(this).val()));
                    if($(this).val()!=""){
                        numArr.push({orgID:$("input[name=orgID]").val(),constitutionNamePID:$(this).attr("pid"),constitutionNameID:$(this).attr("nameid"),constitutionName:$(this).val(),constitutionTypeID:$("#constitutionTypeID").val(),inUse:"1",sortNum:i});
                    }
                });
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                $("#nameEntitys").val(JSON.stringify(numArr));
                var data = ECS.form.getData('AddOrEditModal');
                var ob=JSON.parse(data.nameEntitys);//去掉数组中对象属性的双引号
                data.nameEntitys=ob;
                delete data["list1"];
                delete data["list2"];
                delete data["list3"];
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
                            layer.msg("保存成功！",{
                                time: 1000
                            },function() {
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.collection.error.message)
                        }
                    },
                    error: function (result) {
                        $('#btnSave').attr('disabled', false);
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                })
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
                    ignore:"",
                    rules: {
                        orgID:{
                            required: true
                        },
                        constitutionTypeID: {
                            required: true
                        }
                    }
                });
            }
        }
    }
    page.init();
    window.page = page;
})