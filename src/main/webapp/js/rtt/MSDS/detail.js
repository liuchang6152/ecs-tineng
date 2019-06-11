var getSingleUrl = ECS.api.rttUrl + '/msds/findOne';                            //获取当前的编辑数据展示
var FileDownLoadUrl = ECS.api.rttUrl + "/structuredplanfile/downloadFile";   //下载接口
var msdsId;
var structuredPlanCategoryId;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            //确认
            $("#btnSave").click(function () {
                page.logic.closeLayer(PageLoadMode.Refresh);
            });
            //关闭
            $("#btnClose,#btnClose2").click(function () {
                page.logic.closeLayer(PageLoadMode.None);
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);         //弹框标题设置；
                msdsId = data.msdsId;                       //危化品详情id存储；
                $("#MsDsPlanName").html(data.pagename);    //页面标题设置；

                //设置页面内容的高度；
                // console.log("动态计算页面高度：",$("body").outerHeight()-$("#head_title").height());
                $("#main-content").css("height",($("body").outerHeight()-$("#head_title").height()-10)+"px");
                //“确认”按钮是否显示问题；
                if(data.ishidden=="true"){
                    $("#btnSave").show();      //显示“确认”按钮
                    $("#btnClose").show();     //显示“取消”按钮
                    $("#btnClose2").hide();    //隐藏“关闭”按钮
                }else{
                    $("#btnSave").hide();     //隐藏“确认”按钮
                    $("#btnClose").hide();    //隐藏“取消”按钮
                    $("#btnClose2").show();    //展示“关闭”按钮
                }
                $.ajax({
                    url: getSingleUrl + "?msdsId=" + data.msdsId + "&now=" + Math.random(),
                    type: "get",
                    async: true,
                    dataType: "json",
                    success: function (data) {
                        $("#orgSname").html(data.orgSname);//填充企业名称
                        // 危化品中文名
                        $("#msdsChineseName").html(data.msdsChineseName);
                        // 危化品英文名
                        $("#msdsEnglishName").html(data.msdsEnglishName);
                        // 化学品别名
                        $("#msdsAliasName").html(data.msdsAliasName);
                        // CAS No
                        $("#casno").html(data.casno);
                        // 物料编码
                        $("#materialCode").html(data.materialCode);
                        //危险性类别
                        var category_default_val = "";
                        for(var x=0;x<data["riskTypeEntityList"].length;x++){
                            (function(cur_dt){
                                if(x==data.riskTypeEntityList.length-1){
                                    category_default_val+=cur_dt.riskTypeName;
                                }else{
                                    category_default_val+=cur_dt.riskTypeName+",";
                                }
                            })(data.riskTypeEntityList[x]);
                        }
                        $("#riskTypeName").html(category_default_val);
                        //子属性列表渲染
                        page.logic.render_childAttr_list(data["msdsTotalTypeValueForEdit"]);
                        //附件列表-------------------------------------
                        if(data.attachmentEntities){
                            //附件的数据处理
                            var aFile_list = [];
                            for(var n=0;n<data.attachmentEntities.length;n++){
                                $("#fileList").append(
                                    '<a style="display: inline-block;width: 50%;float:left;margin-top:10px;" title="'+data.attachmentEntities[n].atchName+'" href="'+FileDownLoadUrl+'?atchPath='+data.attachmentEntities[n].atchPath+'&atchName='+data.attachmentEntities[n].atchName+'">'+data.attachmentEntities[n].atchName+'</a>'
                                )
                            }
                        }
                    },
                    error: function (result) {
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //动态加载主属性列表结构
            render_childAttr_list:function(data,cb){
                $("#dymic_data").html("");      //清空属性列表
                for(var i=0;i<data.length;i++){
                    if(data[i]["subparams"].length==0){
                        continue;
                    }
                    (function(cur_dt){
                        //创建盒子
                        var oPar_box = $('<div class="one_attr" style="margin-left:15px;"></div>');
                        $("#dymic_data").append(oPar_box);

                        //添加标题线；
                        var oLine = $('<div class="split-line"></div>');
                        $(oPar_box).append(oLine);

                        //创建某一父属性一级标题盒子
                        var oPar_title = $('<div class="one_title" style="font-size:14px;color:#505050;font-weight: bold;">'+cur_dt["mainParam"]+'：</div>');
                        $(oPar_box).append(oPar_title);      //加载进来标题

                        //创建某一父属性下的子属性列表
                        var att_list = cur_dt["subparams"];
                        var oRow_one = null;
                        for(var w=0;w<att_list.length;w++){
                            oRow_one = $('<div class="mt__15"></div>');     //重建属性父盒子变量
                            oPar_box.append(oRow_one);
                            //每行显示单条信息；
                            var oLeft_att_box = $('<div class="control-label" style="color:#a5aaae;">'+(att_list[w]["k"]?att_list[w]["k"]:"无")+'</div>'+
                                '<div id="materialCode" style="color:#505050;">'+(att_list[w]["v"]?att_list[w]["v"]:"无")+'</div>');
                                oRow_one.append(oLeft_att_box);
                        }
                    })(data[i]);
                }
                cb && cb();
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (pageLoadMode) {
                window.parent.pageLoadMode = pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});