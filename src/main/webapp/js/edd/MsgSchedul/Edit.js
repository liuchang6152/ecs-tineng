var addUrl = ECS.api.eddUrl + '/eddSchedul';

var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName';  //企业名称
var constitutionUrl = ECS.api.rttUrl + '/team/getListByParam?param=constitutionName'; //建制
var teamPIDNameUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamPIDName';  //所属应急队伍
var teamTypeIDUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamType&isAll=true';  //队伍类型
var teamLvlUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamLvl&isAll=true';  //队伍级别
var teamSpecialityUrl = ECS.api.rttUrl + '/team/getListByParam?param=teamSpeciality&isAll=true';  //救援专业
var teamTypeUrl = ECS.api.rttUrl + '/expert/getExpertTypeEnumList';  //队伍类别
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var oid="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            $('#teamBaseLvl').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
      
          
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);    
            });
       
         
            $("#selectOwner").click(function () {
                page.logic.selectOwner("应急处置人员选择",PageModelEnum.Details)
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data,gridList) {
                ECS.form.setData('AddOrEditModal', gridList);
                var form = new mini.Form("AddOrEditModal");
                form.setData(gridList, false);

                mini.get("selfId").setValue(gridList.personnelId);
                mini.get("startTime").setEnabled(false);
                mini.get("endTime").setEnabled(false);
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                if (pageMode == PageModelEnum.NewAdd) {
                  
                }else{
                   
                }
              
            },
           
           
            //人员选择
            selectOwner:function(title, pageMode){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '100%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectPersons.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            'title': title+"(单选)",
                            'multiSelect':false
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if(window.ownDetail){
                        var returnObj  = JSON.parse(window.ownDetail[0].data);
                        $("#personnelName").val(returnObj.name);
                        $("#dutyName").val(returnObj.dutyType);
                        $("#userMobile").val(returnObj.userMobile);
                        $("#userPhone").val(returnObj.userPhone);
                        $("#teamName").val(returnObj.teamName);
                        $("#selfId").val(returnObj.selfId);
                        }
                    }
                })
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

                var submitData = {
                    schedulId: $("#schedulId").val(),
                    personnelId :  $("#selfId").val()
                }
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
                    data:JSON.stringify(submitData),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function (result) {
                        ECS.hideLoading();
                        if (result.isSuccess) {
							layer.msg("保存成功！", {
								time: 1000
							}, function() {
								page.logic.closeLayer(true);
							});
						} else {
							layer.msg(result.message);
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
                    rules: {
                      
                    }
                });
             
            }
        }
    }
    page.init();
    window.page = page;
})