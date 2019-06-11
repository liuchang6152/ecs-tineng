var addUrl = ECS.api.bcUrl+ '/monitorFactor';
var getSingleUrl =ECS.api.bcUrl + '/monitorSite';
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        //页面初始化
        init: function () {
            $('#inUse').iCheck({
                checkboxClass: 'icheckbox_minimal-blue'
            });
            this.bindUI();
        },
        bindUI: function () {
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //保存
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //关闭
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        logic: {
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                $.ajax({
                    url: getSingleUrl + "/" + data.siteID + "?now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        ECS.form.setData('AddOrEditModal',data);
                        for(var i=0;i<data.factorEntitys.length;i++){
                            if(data.factorEntitys[i].lowLimit==data.factorEntitys[i].uppLimit){
                                data.factorEntitys[i].inUpper="3";
                                data.factorEntitys[i].inLower="3";
                            }else{
                                if(data.factorEntitys[i].inUpper==1){
                                    data.factorEntitys[i].inUpper="2";
                                }
                                if(data.factorEntitys[i].inLower==1){
                                    data.factorEntitys[i].inLower="2";
                                }
                                if(data.factorEntitys[i].inUpper==0){
                                    data.factorEntitys[i].inUpper="1";
                                }
                                if(data.factorEntitys[i].inLower==0){
                                    data.factorEntitys[i].inLower="1";
                                }
                            }
                            $(".factorList").eq(i).find(".leftInput").eq(0).val(data.factorEntitys[i].lowLimit);
                            $(".factorList").eq(i).find(".rightInput").eq(1).val(data.factorEntitys[i].uppLimit);
                            $(".factorList").eq(i).find(".rightInput").eq(0).find("option:eq("+parseInt(data.factorEntitys[i].inLower)+")").attr('selected', true);
                            $(".factorList").eq(i).find(".leftInput").eq(1).find("option:eq("+parseInt(data.factorEntitys[i].inUpper)+")").attr('selected', true);
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
             * 保存
             */
            save: function () {
                var zbarry=[];
                var narry=[];
                for(var i=0;i<$(".factorList").length;i++){
                    var min=$(".factorList").eq(i).find(".leftInput").eq(0).val();
                    var mins=$(".factorList").eq(i).find(".rightInput").eq(0).find("option:selected").val();
                    var minss=$(".factorList").eq(i).find(".rightInput").eq(0).find("option:selected").attr("name");
                    var maxs=$(".factorList").eq(i).find(".leftInput").eq(1).find("option:selected").val();
                    var maxss=$(".factorList").eq(i).find(".leftInput").eq(1).find("option:selected").attr("name");
                    var max=$(".factorList").eq(i).find(".rightInput").eq(1).val();
                    if(min!=""&&max!=""&&(maxss==2||minss==2)&&min!=max){
                        layer.msg("指标相等时，上标和下标需一致！");
                        return false;
                    }
                    if(min!=""&&max!=""&&min==max&&(maxss!=2||minss!=2)){
                        layer.msg("上标和下标一致时，指标需选择等于号！");
                        return false;
                    }
                    if((min&&mins)||(max&&maxs)){
                        if(zbarry.length==0){
                            if(max&&maxs){
                                zbarry.push({sortNum:0,siteID:$("#siteID").val(),lowLimit:min,inLower:mins,uppLimit:max,inUpper:maxs,factorID:$("#factorID").val()});
                            }
                        }else if(zbarry.length==zbarry.length){
                            if(min&&mins){
                                zbarry.push({sortNum:0,siteID:$("#siteID").val(),lowLimit:min,inLower:mins,uppLimit:max,inUpper:maxs,factorID:$("#factorID").val()});
                            }
                        }else{
                            if(max&&maxs&&min&&mins){
                                zbarry.push({sortNum:0,siteID:$("#siteID").val(),lowLimit:min,inLower:mins,uppLimit:max,inUpper:maxs,factorID:$("#factorID").val()});
                            }
                        }
                    }
                }
                if(zbarry&&zbarry.length>0){
                    for(var i=0;i<zbarry.length;i++){
                        var obj=zbarry[i];
                        if(i==0||i==zbarry.length-1){
                            narry.push(obj);
                        }else{
                            if(obj.lowLimit&&obj.uppLimit){
                                narry.push(obj);
                            }
                        }
                    }
                }
                if(narry&&narry.length>0){
                    if(narry.length%2!=0){
                        layer.msg("指标需要成对填写！");
                        return false;
                    }
                    if(narry[0].lowLimit>999999.999999||narry[0].lowLimit<-999999.999999||narry[narry.length-1].uppLimit>999999.999999||narry[narry.length-1].uppLimit<-999999.999999){
                        layer.msg('指标区间范围为["-999999.999999","999999.999999"]！');
                        return false;
                    }
                    for(var i=0;i<narry.length;i++){
                        var obj=narry[i];
                        var lengs=narry.length/2;
                        if(i<lengs){
                            zbarry[i].factorDirection = "0";
                        }else{
                            zbarry[i].factorDirection = "1";
                        }
                        if(obj.lowLimit&&obj.uppLimit){
                            if(obj.uppLimit*1<obj.lowLimit*1){
                                layer.msg("指标下限不能大于指标上限！");
                                return false;
                            }
                        }
                        if(i>0){
                            var pobj=narry[i-1];
                            if(obj.lowLimit*1<=pobj.uppLimit*1){
                                layer.msg("指标下限需大于上一指标上限！");
                                return false;
                            }
                        }
                    }
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
                    data:JSON.stringify(narry),
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
            }
        }
    };
    page.init();
    window.page = page;
});