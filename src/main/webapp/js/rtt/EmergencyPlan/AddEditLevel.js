//树操作相关的接口---------------------------
var addUrl =  ECS.api.rttUrl + "/structuredplancategory";     //新增 or 编辑 保存
var getSingleUrl =  ECS.api.rttUrl + "/structuredplancategory/findOne";   //查询单条节点的相关信息
var structuredPlanCategoryId = null;     //当前树节点的id;
var structuredPlanCategoryPid = null;    //当前树节点的父级节点id;
var ParentName = null;                     //当前树节点的父级节点名称
var emergencyPlanID = null;               //当前预案的id;
var emergencyPlanName = null;             //当前预案的名称;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function() {
    var index = parent.layer.getFrameIndex(window.name); // 获取子窗口索引
    var page = {
        //页面初始化
        init: function() {
            mini.parse();
            this.bindUI();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function() {
            $(".btnClose").click(function() {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $('input').blur(function() {
                $(this).val($.trim($(this).val()))
            });
            //保存
            $("#btnSave").click(function() {
                page.logic.save();
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function(data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                structuredPlanCategoryId = data.Id;      //当前树节点的id;
                structuredPlanCategoryPid = data.PID;    //当前树节点的父级节点id;
                emergencyPlanID = data.emergencyPlanID;  //当前预案的id;
                ParentName = data.ParentName;             //当前树节点的父级节点名称
                emergencyPlanName = data.Name;   //当前预案的名称
                // console.log("编辑情况下得到的数据：",data);
                $("#structuredPlanCategoryPidName").attr("disabled","disabled");          //上级名称不可用
                //若是编辑模式下，填充数据；
                if(pageMode == PageModelEnum.Edit) {
                    $.ajax({
                        url: getSingleUrl+"?structuredPlanCategoryId="+structuredPlanCategoryId,
                        async: false,
                        type: "GET",
                        data: JSON.stringify({}),
                        dataType: "json",
                        contentType: "application/json;charset=utf-8",
                        success: function(result) {
                            // ECS.hideLoading();
                            // console.log("节点编辑得到的返回来的数据：",result);
                            ECS.form.setData('AddOrEditModal',result);
                            //填充其它数据；
                        },
                        error: function(result) {
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    })
                }
                //若是新增模式下
                if(pageMode == PageModelEnum.NewAdd) {
                    //若有pid,那么填充上级名称；
                    if(structuredPlanCategoryPid){
                        $("#structuredPlanCategoryPidName").val(ParentName);
                    }else{
                        //若没有pid，代表增加的是根节点，那么上级名称不可用；
                        $("#structuredPlanCategoryPidName").val(ParentName?ParentName:"");      //设置父级节点的名字
                        if(emergencyPlanName){
                            $("#emergencyPlanName").val(emergencyPlanName);                           //当前节点的名称；
                            $("#emergencyPlanName").attr("disabled","disabled");                      //当前节点的名称表单设置为不可用；
                        }

                    }
                }
            },
            /**
             * 保存
             */
            save: function() {
                //校验表单数据
                page.logic.formValidate();
                if(!$('#AddOrEditModal').valid()) {
                	return;
                }
                var data = ECS.form.getData('AddOrEditModal');
                //处理提交类型
                var ajaxType = "POST";
                if(pageMode == PageModelEnum.NewAdd) {
                    window.pageLoadMode = PageLoadMode.Reload;
                } else if(pageMode == PageModelEnum.Edit) {
                    ajaxType = "PUT";
                    window.pageLoadMode = PageLoadMode.Refresh;
                }
                // console.log("保存节点前提交的数据：",JSON.stringify(data));
                //拼接数据
                data.structuredPlanCategoryId = structuredPlanCategoryId?structuredPlanCategoryId:null;       //结构化预案类别id;
                data.emergencyPlanId = emergencyPlanID;                                                            //预案id;
                data.structuredPlanCategoryPid = structuredPlanCategoryPid?structuredPlanCategoryPid:null;   //上级级别id;
                data.inUse = 1;                             //是否启用
                data.sortNum = $("#sortNum").val()?$("#sortNum").val():1;        //排序
                //删除多余的字段
                delete data.structuredPlanCategoryPidName;
                $.ajax({
                    url: addUrl,
                    async: false,
                    type: ajaxType,
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function() {
                        $('#btnSave').attr('disabled', 'disabled');
                        ECS.showLoading();
                    },
                    success: function(result) {
                        ECS.hideLoading();
                        if(result.isSuccess) {
                            layer.msg("保存成功！", {
                                time: 1000
                            }, function(){
                                page.logic.closeLayer(true);
                            });
                        } else {
                            layer.msg(result.message);
                        }
                    },
                    error: function(result) {
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
            closeLayer: function(isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            },
            formValidate: function() {
                ECS.form.formValidate('AddOrEditModal', {
                    rules: {
                        emergencyPlanName: {
                            required: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});