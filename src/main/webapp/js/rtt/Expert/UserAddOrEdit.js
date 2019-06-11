var addUrl = ECS.api.rttUrl + '/expert';
var getSingleUrl = ECS.api.rttUrl + '/expert';
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var expertTypeUrl = ECS.api.rttUrl + '/expert/getExpertTypeEnumList';  //专家类别
var sexUrl = ECS.api.rttUrl + '/expert/getExpertSexEnumList';  //性别
var titleNameUrl = ECS.api.rttUrl + '/expert/getExpertTitleEnumList';  //职称
var educationUrl = ECS.api.rttUrl + '/expert/getExpertEducationEnumList';  //学历
var guardUrl = ECS.api.rttUrl + '/expert/getExpertGuardEnumList';  //在岗情况
var hireUrl = ECS.api.rttUrl + '/expert/getExpertHireEnumList';  //聘用状态
var industryNameUrl = ECS.api.rttUrl + '/expert/expertIndustry';  //行业领域
var professionNameUrl = ECS.api.rttUrl + '/expert/expertProfession';  //专业分类
var enjoyWorksUrl = ECS.api.rttUrl + '/expert/expertEnjoyWorks';  //擅长工作类型
var pageMode = PageModelEnum.NewAdd;
var expertCode;
var industryIDs,professionIDs,enjoyWorksIDs;

window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            page.logic.initExpertType();
            page.logic.cbxDrtDept(); //企业名称
            page.logic.initSex();
            page.logic.initTitleName();
            page.logic.initEducation();
            page.logic.initGuard();
            page.logic.initHire();
            // page.logic.initEnjoyWorks();
            // page.logic.initIndustryName();
            // page.logic.initProfessionName();//专业分类
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#classList").click(function () {
               page.logic.selectOwner("专业分类(多选)", PageModelEnum.Details,1);
            });
            $("#classField").click(function () {
               page.logic.selectOwner("行业领域(多选)", PageModelEnum.Details,2);
            });
            $("#goodList").click(function () {
               page.logic.selectOwner("擅长工作类型(多选)", PageModelEnum.Details,3);
            });
            
        },
        logic: {
            //多选赋值
            many: function(item,arr){
                for (var i = 0, l = arr.length; i < l; i++) {
                    $(item).append(
                        '<p class="nstext">' + arr[i] + '</p>'
                    );
                }
            },
            //专业分类多选
            selectOwner: function (title, pageMode,isList) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    // content: '../RiskAnalysisPoint/SelectOwner.html?' + Math.random(),
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            'isList': isList
                            // "orgCode": enterpriseCode,
                            // "userName": editUserName
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        editUserName = [];
                        usernameList = [];
                        userIDList = [];
                        for (var obj in window.ownDetail) {
                            usernameList += window.ownDetail[obj] + '<br/>';
                        }
                        for (var i in window.ownDetail) {
                            editUserName.push(window.ownDetail[i]);
                        }
                        for (var i in window.ownDetail) {
                            userIDList.push(i);
                        }
                        if (isList == '1') {
                            $("#expertProfession").html(usernameList);
                            $("#expertProfessionID").val(userIDList);
                        } 
                        if (isList == '2') {
                            $("#expertIndustry").html(usernameList);
                            $("#expertIndustryID").val(userIDList);
                        }
                        if (isList == '3') {
                            $("#expertEnjoyWorks").html(usernameList);
                            $("#expertEnjoyWorksID").val(userIDList);
                        }
                        
                    }
                });
            },


            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                    $("#crtUserName").val(ECS.sys.Context.SYS_USER_NAME);
                    $("#crtUserDept").val(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                    var myDate = new Date;
                    $("#crtDate").val(ECS.util.DateTimeRender(myDate));
                    return;
                }else if (pageMode == PageModelEnum.Edit) {
                    $("#orgCode").attr("disabled",true);
                    $('#expertMobile').after('<input name="sortNum" type="hidden" id="sortNum" />');
                }
                $.ajax({
                    url: getSingleUrl + "/" + data.expertID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        console.log(data)
                        ECS.form.setData('AddOrEditModal', data);
                        $("#crtDate").val(ECS.util.timestampToTime(data.crtDate));
                        $("#inUse").iCheck('update');
                        var expertProfessionName = data.expertProfessionName.split(','); //专业分类
                        var expertIndustry = data.expertIndustryName.split(',');//行业领域
                        var expertEnjoyWorksName = data.expertEnjoyWorksName.split(',');//擅长工作
                        expertCode = data.expertCode;
                         industryIDs = data.industryIDs; //行业领域
                         professionIDs = data.professionIDs;//专业分类
                         enjoyWorksIDs = data.enjoyWorksIDs;//擅长类型
                        if (data.expertProfessionName) {//行业分类
                            page.logic.many('#expertProfession', expertProfessionName);
                        }
                        if (data.expertIndustryName) { //行业领域
                            // for (var i = 0; i < expertIndustry.length; i++) {
                            //     console.log(name[i])
                            // }
                            page.logic.many('#expertIndustry', expertIndustry);
                        }
                        if (data.expertProfessionName) {
                            // for (var i = 0; i < expertEnjoyWorksName.length; i++) {
                            //     console.log(name[i])
                            // }
                            page.logic.many('#expertEnjoyWorks', expertEnjoyWorksName);
                        }

                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //企业名称
            cbxDrtDept:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    $("#orgCode").attr("disabled",false);
                    ECS.ui.getCombobox("orgCode", riskAreaTypeNameUrl, {
                        selectFirstRecord:true,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname",
                        async:false
                    });
                }else{
                    $("#orgCode").attr("disabled",true);
                    ECS.ui.getCombobox("orgCode", riskAreaTypeNameUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        codeField:"orgId",
                        valueField: "orgSname",
                        async:false
                    });
                }
						},
						    				    			
            // //行业领域
            // initIndustryName: function () {
            //     page.logic.selectOwner("行业领域(多选)", PageModelEnum.Details, 2);
            // },
            // //专业分类
            // initProfessionName: function () {
            //       page.logic.selectOwner("专业分类(多选)", PageModelEnum.Details, 1);
            // },
            // //擅长工作类型
            // initEnjoyWorks: function () {
            //     page.logic.selectOwner("擅长工作类型(多选)", PageModelEnum.Details, 3);
            // },
            /**
             * 专家类别
             */
            initExpertType: function () {
                ECS.ui.getCombobox("expertType", expertTypeUrl, {
                    selectValue: 0
                }, null);
            },
            /**
             * 性别
             */
            initSex: function () {
                ECS.ui.getCombobox("expertSex", sexUrl, {
                    selectValue: 1
                }, null);
            },
            /**
             * 职称
             */
            initTitleName: function () {
                ECS.ui.getCombobox("expertTitle", titleNameUrl, {
                    selectValue: 0
                }, null);
            },
            /**
             * 学历
             */
            initEducation: function () {
                ECS.ui.getCombobox("expertEducation", educationUrl, {
                    selectValue: 0
                }, null);
            },
            /**
             * 在岗情况
             */
            initGuard: function () {
                ECS.ui.getCombobox("expertMountGuard", guardUrl, {
                    selectValue: 1
                }, null);
            },
            /**
             * 聘用状态
             */
            initHire: function () {
                ECS.ui.getCombobox("isEmploy", hireUrl, {
                    selectValue: 1
                }, null);
            },
         
          
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                data.expertCode = expertCode;
                console.log(data)
                data["orgIds"]=$("#orgCode").find("option:selected").attr("code");
                delete data["crtDate"];
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                }
                else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                    // var IndustryIDs, ProfessionIDs, EnjoyWorksIDs;
                    if (data.expertIndustryID == ''){//行业领域
                        data.expertIndustryID = industryIDs;
                    };
                    if (data.expertProfessionID == '') {//专业分类
                        data.expertProfessionID = professionIDs;
                    };
                    console.log(enjoyWorksIDs);
                    if (data.expertEnjoyWorksID == '') {//擅长
                        data.expertEnjoyWorksID = enjoyWorksIDs;
                    };
                }
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data:$.param(data),
                    dataType: "text",
                    contentType:"application/x-www-form-urlencoded;charset=UTF-8",
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
                        orgCode: {
                            required: true
                        },
                        // expertIndustryID: {
                        //     required: true
                        // },
                        expertType: {
                            required: true
                        },
                        expertName: {
                            required: true,
                            maxlength: 200
                        },
                        expertAge: {
                            required: true,
                            maxlength: 200,
                            digits:true
                        },
                        expertSex: {
                            required: true
                        },
                        expertJob: {
                            maxlength: 200
                        },
                        expertTitle: {
                            required: true
                        },
                        expertEducation: {
                            required: true
                        },
                        expertMountGuard: {
                            required: true
                        },
                        // expertProfessionID: {
                        //     required: true
                        // },
                        // expertEnjoyWorksID: {
                        //     required: true
                        // },
                        isEmploy: {
                            required: true
                        },
                        expertMobile: {
                            required: true,
                            mobile:true,
                            maxlength: 200
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});