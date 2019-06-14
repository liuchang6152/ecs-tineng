var addUrl = ECS.api.bcUrl + '/org';                      //新增、编辑
var getSingleUrl = ECS.api.bcUrl + '/org';                //查询单条数据
var porg_url = ECS.api.bcUrl + '/org/porgName';         //上层名称
var orgType_url = ECS.api.bcUrl + '/org/orgType';       //机构类型
var orgLvl_url = ECS.api.bcUrl + '/org/orgLvl';         //机构级别
var orgNature_url = ECS.api.bcUrl + '/org/orgNature';   //机构性质
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var orgPid = "";     //节点父级ID(编辑状态下)
var porgCode = "";   //上层名称编码
var editUserName=[];//选择联系人
var usernameList=[];//选择联系人
var userIDList=[];//选择联系人
var selectCode="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();

        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //点击保存按钮，进行保存；
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，进行关闭；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //监听tree菜单点击
            mini.get("porgCode").on("nodeclick",function(e){
                mini.get("isnode_root").setChecked(false);
            });
            //人员选择弹窗
            $("#selectOwner").click(function () {
                page.logic.selectOwner("人员选择(多选)",PageModelEnum.Details)
            });
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                //处理提交类型
                var ajaxType = "POST";
                if (pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                    if(mini.get("porgCode").getSelectedNode()){
                        data.orgPID = mini.get("porgCode").getSelectedNode().orgId;    //上层名称节点id
                    }else{
                        data.orgPID = orgPid;       //上层名称父级ID
                    }
                }else if (pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                    if(mini.get("porgCode").getSelectedNode()){
                        data.orgPID = mini.get("porgCode").getSelectedNode().orgId;    //上层名称节点id
                    }else{
                        data.orgPID = orgPid;       //上层名称父级ID
                    }
                }
                if(data.userID){
                    var userEntity=[];
                    for(var i=0;i<data.userID.split(",").length;i++){
                        userEntity.push({"userID":data.userID.split(",")[i]});
                    }
                    data["userEntity"]=userEntity;
                }
                delete data.userID;
                delete data.userName;
                delete data.isnode_root;
                // $.ajax({
                //     url: addUrl,
                //     async: true,
                //     type: ajaxType,
                //     data:JSON.stringify(data),
                //     dataType: "text",
                //     contentType: "application/json;charset=utf-8",
                //     success: function (result) {
                //         console.log(result)
                //         if (result.isSuccess) {
                //             layer.msg("保存成功！",{
                //                 time: 1000
                //             },function() {
                //                 page.logic.closeLayer(true);
                //             });
                //         } else {
                //             layer.msg(result.collection.error.message)
                //         }
                //     }, error: function (result) {
                //         var errorResult = $.parseJSON(result.responseText);
                //         layer.msg(errorResult.collection.error.message);
                //     }
                // })
                $.ajax({
                    url: addUrl,
                    type: ajaxType,
                    async: false,
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    success: function (res) {
                        console.log(res)
                        if (res.isSuccess) {
                            layer.msg(res.message, {
                                time: 1000
                            }, function () {
                                page.logic.closeLayer(true);
                            });
                        }
                    },
                    error: function (result) {
                        console.log(result)
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                console.log(data)
                selectCode=data.selectCode;
                orgPid = data.orgPID?data.orgPID:"";    //节点父级id;
                console.log(orgPid)
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                //若父级ID存在，那么说明当前不属于根节点，应当设置为不可选中状态；
                if(data.orgPID){
                    mini.get("isnode_root").setChecked(false);
                }else{
                    //若父级ID不存在，那么说明当前属于根节点，应当设置为可选中状态；
                    mini.get("isnode_root").setChecked(true);
                }
                mini.get("isnode_root").disable();   //设置为不可用状态；
                if (pageMode == PageModelEnum.NewAdd) {
                    //是否启用
                    $('#inUse').attr('disabled', 'disabled');
                    $('#inUse').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey'
                    });
                      ECS.form.setData('AddOrEditModal', data);
                      //机构类型
                      page.logic.select_option(orgType_url, $("#AddOrEditModal #orgTypeID"), function () {
                          //机构类型，相应的选中
                          $("#AddOrEditModal #orgTypeID").val(data.orgTypeID);
                      });
                      //机构性质
                      page.logic.select_option(orgNature_url, $("#AddOrEditModal #orgNatureID"), function () {
                          //机构性质，相应的选中
                          $("#AddOrEditModal #orgNatureID").val(data.orgNatureID);
                      });
                      //机构级别
                      page.logic.select_option(orgLvl_url, $("#AddOrEditModal #orgLvlID"), function () {
                          //机构级别，相应的选中
                          $("#AddOrEditModal #orgLvlID").val(data.orgLvlID);
                      });
                      //上层名称
                      debugger
                      console.log(data)
                      if (data.name) {
                        mini.get("#porgCode").setValue(data.name);
                      }else{
                        mini.get("#porgCode").setValue('上层名称为空');
                      }
                      mini.get("porgCode").disable();
                      
                    //填充下拉框的数据；
                    //上层名称 下面暂时注释
                    // page.logic.select_option(porg_url,$("#AddOrEditModal #porgCode"),"ww");
                    //机构类型
                    // page.logic.select_option(orgType_url,$("#AddOrEditModal #orgTypeID"));
                    //机构性质
                    // page.logic.select_option(orgNature_url,$("#AddOrEditModal #orgNatureID"));
                    //机构级别
                    // page.logic.select_option(orgLvl_url,$("#AddOrEditModal #orgLvlID"));
                    // return;
                }else if (pageMode == PageModelEnum.Edit) {
                    $.ajax({
                        url: getSingleUrl + "/" + data.OrgId + '?' + Math.random(),
                        type: "get",
                        async: true,
                        dataType: "json",
                        success: function (data) {
                            console.log(data)
                            ECS.form.setData('AddOrEditModal', data);
                            //机构类型
                            page.logic.select_option(orgType_url, $("#AddOrEditModal #orgTypeID"), function () {
                                //机构类型，相应的选中
                                $("#AddOrEditModal #orgTypeID").val(data.orgTypeID);
                            });
                            //机构性质
                            page.logic.select_option(orgNature_url, $("#AddOrEditModal #orgNatureID"), function () {
                                //机构性质，相应的选中
                                $("#AddOrEditModal #orgNatureID").val(data.orgNatureID);
                            });
                            //机构级别
                            page.logic.select_option(orgLvl_url, $("#AddOrEditModal #orgLvlID"), function () {
                                //机构级别，相应的选中
                                $("#AddOrEditModal #orgLvlID").val(data.orgLvlID);
                            });
                            //上层名称
                            mini.get("#porgCode").setValue(data.orgPidSname);
                            //联系人
                            editUserName = [];
                            usernameList = [];
                            userIDList = [];
                            if (data.userEntity) {
                                for (var i = 0; i < data.userEntity.length; i++) {
                                    usernameList += data.userEntity[i].userName + '<br/>';
                                    userIDList.push(data.userEntity[i].userID);
                                    editUserName.push(data.userEntity[i].userName);
                                }
                                // $("#userName").val(usernameList);
                                $("#userName").html(usernameList);
                                $("#userID").val(userIDList);
                            }
                            //是否启用
                            $("#inUse").iCheck('update');
                            if (data.orgPID) {
                                mini.get("isnode_root").setChecked(false);
                            } else {
                                mini.get("isnode_root").setChecked(true);
                            }
                            orgPid = data.orgPID ? data.orgPID : ""; //节点父级id;
                        },
                        error: function (result) {
                            console.log(result)
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                    //当弹框为编辑状态时，将上层名称设置为不可编辑状态；
                    mini.get("porgCode").disable();
                }
                
            },
            //人员选择
            selectOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: '../RiskAnalysisPoint/SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title,
                            "userId":$("#userID").val(),
                            "orgCode":selectCode,
                            "userName":editUserName
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        editUserName=[];
                        usernameList=[];
                        userIDList=[];
                        for(var obj in window.ownDetail){
                            usernameList+=window.ownDetail[obj]+'<br/>';
                        }
                        for (var i in window.ownDetail){
                            editUserName.push(window.ownDetail[i]);
                        }
                        for (var i in window.ownDetail){
                            userIDList.push(i);
                        }
                        $("#userName").html(usernameList);
                        $("#userID").val(userIDList);
                    }
                })
            },
            //下拉框
            select_option:function(menu_url,oPar,cb){
                $.ajax({
                    url:menu_url,
                    type:"GET",
                    success:function (Data) {
                        if(cb && (typeof cb=="string")){
                            mini.get("porgCode").loadList(Data, "orgId", "orgPID");
                            //判断当前的某一项是否呈选中状态；（设置表单默认值）
                            var sDefault_val = "";
                            for(var w=0;w<Data.length;w++){
                                if(Data[w].orgId==orgPid){
                                    sDefault_val = Data[w].orgSname;
                                }
                            }
                            mini.get("porgCode").setValue(sDefault_val);   //设置默认值
                            mini.get("porgCode").disable();
                        }else{
                            for(var i=0;i<Data.length;i++){
                                (function(cur_key){
                                    if(cur_key.value){
                                        var $oPtion = $('<option value="'+cur_key.key+'">'+cur_key.value+'</option>');
                                    }if(cur_key.orgSname){
                                        var $oPtion = $('<option value="'+(cur_key.orgPID?cur_key.orgPID:'')+'">'+cur_key.orgSname+'</option>');
                                    }
                                    $(oPar).append($oPtion);
                                })(Data[i]);
                            }
                            cb && cb();
                        }
                    },
                    error: function(error){
                        console.log(error)
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
                jQuery.validator.addMethod("ucode",
                    function(value,element,params){
                        var exp = new RegExp(params);
                        return exp.test(value);
                    },"只能输入字母和数字!");
                ECS.form.formValidate('AddOrEditModal',{
                    rules: {
                        orgCode: {
                            required: true,
                            rangelength: [0, 200],
                            ucode:/^[A-Za-z0-9]+$/
                        },
                        orgName: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        orgSname: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        orgTypeID: {
                            required: true
                        },
                        orgNatureID:{
                            required: true
                        },
                        orgLvlID: {
                            required: true
                        },
                        porgCode$text: {
                            required: true,
                            rangelength: [0, 200]
                        },
                        sortNum: {
                            required: true,
                            digits: true,
                            min: 0
                        }
                    }
                })
            }
        }
    };
    page.init();
    window.page = page;
});