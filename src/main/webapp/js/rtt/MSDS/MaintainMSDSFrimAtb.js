var addUrl = ECS.api.rttUrl + '/msds';                                    //保存(新增 or 编辑)
var delUrl = ECS.api.rttUrl + "/msdsFrimAtb";                            //主属性删除
var saveUrl = ECS.api.rttUrl + "/msdsFrimAtb";                           //主属性保存
var childdelUrl = ECS.api.rttUrl + "/msdsSubAtb";                        //子属性删除
var childsaveUrl = ECS.api.rttUrl + "/msdsSubAtb";                       //子属性保存
var getListUrl = ECS.api.rttUrl + "/msdsFrimAtb/getForOrg";             //子属性列表
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName';              //企业名称
var orgId = "";                                                              //企业id的存储
var pageMode = PageModelEnum.NewAdd;                                      //页面模式
window.pageLoadMode = PageLoadMode.None;
var grid = null;                                                                                 //grid对象
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();                    //mini组件初始化
            this.bindUI();                   //绑定事件
            ECS.sys.RefreshContextFromSYS();//获取当前用户
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //点击关闭按钮，关闭弹框；
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            //主属性点击某一项，当前这一项呈选中状态；
            $("#main_attrlist_box").click(function(e){
                console.log(e.target.tagName)
                if(e.target.tagName=="LI"){
                    page.logic.cur_option_checked($(e.target).index());
                    //加载某个主属性对应的子属性列表；
                    page.logic.load_child_list($(e.target).index());
                }else{
                    //若是点击的是“删除”按钮，进行相关删除操作；
                    if(($(e.target).hasClass("btn-danger") && e.target.tagName=="BUTTON") || (e.target.tagName=="SPAN" && $(e.target).parent().hasClass("btn-danger"))){
                        page.logic.cur_option_delete($(e.target).parents("li").index());
                    }else{
                        //点击保存，当前某一项进行保存；
                        if(($(e.target).hasClass("btn-info") && e.target.tagName=="BUTTON") || (e.target.tagName=="SPAN" && $(e.target).parent().hasClass("btn-info"))){
                            page.logic.cur_option_save($(e.target).parents("li").index());       //当前这一项进行保存
                        }else{
                            //加载某个主属性对应的子属性列表；
                            page.logic.load_child_list($(e.target).parents("li").index());
                        }
                        //当前某一项进行选中
                        page.logic.cur_option_checked($(e.target).parents("li").index());    //当前这一项进行选中
                    }
                }
            });
            //子属性点击某一项
            $("#child_attrlist_box").click(function (e) {
                // console.log(e.target.tagName);
                //若是点击的是“删除”按钮，进行相关删除操作；
                if(($(e.target).hasClass("btn-danger") && e.target.tagName=="BUTTON") || (e.target.tagName=="SPAN" && $(e.target).parent().hasClass("btn-danger"))){
                    page.logic.child_option_delete($(e.target).parents("li").index());
                }
                //点击保存，当前某一项进行保存；
                if(($(e.target).hasClass("btn-info") && e.target.tagName=="BUTTON") || (e.target.tagName=="SPAN" && $(e.target).parent().hasClass("btn-info"))){
                    page.logic.child_option_save($(e.target).parents("li").index());       //当前这一项进行保存
                }
            });
        },
        data:{},
        logic: {
            //主属性当前某一项呈选中状态
            cur_option_checked:function(index,cb){
                $("#main_attrlist_box").find("input:radio").each(function(){
                    this.checked = false;
                });
                $("#main_attrlist_box").find("li").eq(index).find("input:radio")[0].checked = true;
                cb && cb(index);
            },
            //主属性——当前这一项删除
            cur_option_delete:function(index){
                var $cur_li = $("#main_attrlist_box").find("li").eq(index);
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    //start delete
                    //删除之前，先判断，是否是新建的一项，若是，那么就不进行删除
                    if($cur_li.attr("orgId") && $cur_li.attr("msdsfirmatbId")){
                        //非客户端新建项
                        $.ajax({
                            url: delUrl+"?id="+$cur_li.attr("msdsfirmatbId"),
                            async: false,
                            dataType: "text",
                            contentType: "application/json;charset=utf-8",
                            type: 'DELETE',
                            success: function (result) {
                                result = JSON.parse(result)
                                if(result.isSuccess){
                                    layer.msg(result.message);
                                    $cur_li.remove();   //将当前这一项进行删除
                                }else{
                                    layer.msg("请优先选择子属性删除！");
                                }
                            },
                            error: function (result) {
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        })
                    }else{
                        //属于客户端新建项，自行删除便可
                        $cur_li.remove();   //将当前这一项进行删除
                    }
                    //end delete
                }, function (index) {
                    layer.close(index)
                });
            },
            //主属性——当前这一项进行保存。（参数表示主属性的某一项的索引值）
            cur_option_save:function(index){
                var $oli = $("#main_attrlist_box").find("li").eq(index);
                //校验数据
                if($.trim($oli.find("input:text").eq(0).val())==""){
                    layer.msg("主属性名称不可为空");
                    return false;
                }
                if($oli.find(".input_number").val()==""){
                    layer.msg("排序不可为空");
                    return false;
                }
                var id = $oli.attr("msdsFirmAtbId")?$oli.attr("msdsFirmAtbId"):"";
                var data = {};
                data["msdsFirmAtbId"] = id;
                data["msdsFrimAtbName"] = $.trim($oli.find("input:text").eq(0).val());
                data["orgId"] = orgId;
                data["sortNum"] = $.trim($oli.find(".input_number").val());
                $.ajax({
                    /*url:saveUrl+"?id="+id+"&name="+$.trim($oli.find("input:text").eq(0).val())+"&orgId="+orgId+"&sort="+$.trim($oli.find(".input_number").val()),*/
                    url:saveUrl,
                    async: false,
                    type: "POST",
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (result) {
                        result = JSON.parse(result)
                        layer.msg(result.message);         //提示当前保存状态
                        if(result.isSuccess){
                            //若保存成功，若当前这一项为新增保存的一项，那么将返回的id值插入；
                            if(id==""){
                                $oli.attr("msdsfirmatbId",result.result);
                                $oli.attr("orgId",orgId);
                            }
                            //若是最后一项，那么并添加一项；
                            if(index==$("#main_attrlist_box").find("li").length-1){
                                var oCreat_oPtion = $("#main_attrlist_box").find("li").eq(index).clone();
                                //将表单置空
                                oCreat_oPtion.find("input:text").val("");
                                oCreat_oPtion.find(".input_number").val("");
                                //删除复制项上的废属性
                                oCreat_oPtion.removeAttr("msdsfirmatbId");
                                //将删除号隐藏
                                oCreat_oPtion.find(".delete_button2").hide();                                      //将创建的一项的删除按钮隐藏；
                                $("#main_attrlist_box").find("li").eq(index).find(".delete_button2").show();    //将已保存的最后一项的删除按钮展示；
                                $("#main_attrlist_box").append(oCreat_oPtion);                                    //将创建的这一项添加进来；
                            }
                        }
                    }
                });
            },
            //对应的子属性列表加载
            load_child_list:function(iN){
                //拼接url,请求子属性列表加载
                var msdsFirmAtbId = $("#main_attrlist_box").find("li").eq(iN).attr("msdsFirmAtbId");
                if(msdsFirmAtbId){
                    //请求子属性列表数据
                    $.ajax({
                        url: getListUrl + "?orgId=" + orgId + "&msdsFirmAtbId="+msdsFirmAtbId+"&now=" + Math.random(),
                        type: "get",
                        async: true,
                        dataType: "json",
                        success: function (data) {
                            $("#child_attrlist_box").html("");
                            //渲染子属性列表
                            if(data[0]["subparams"].length==0){
                                page.logic.append_child_option($("#child_attrlist_box"),true);
                            }else{
                                for(var i=0;i<data[0]["subparams"].length;i++){
                                    (function(cur_dt,index){
                                            //创建每一项，并进行赋值
                                            page.logic.append_child_option($("#child_attrlist_box"),false,function(){
                                                //设置相关属性
                                                page.logic.set_child_attr($("#child_attrlist_box").find("li").eq(index),cur_dt);
                                            });
                                    })(data[0]["subparams"][i],i);
                                }
                                //增加一项空值，用于填写内容
                                page.logic.append_child_option($("#child_attrlist_box"),true);
                            }
                            msdsFirmAtbId = null;                        //释放变量
                        }
                    });
                    //end------------------------
                }else{
                    $("#child_attrlist_box").html("");
                    page.logic.append_child_option($("#child_attrlist_box"),true);
                }
            },
            //子属性——当前这一项进行保存；
            child_option_save:function(index){
                var $oli = $("#child_attrlist_box").find("li").eq(index);
                //start---------------------------------------
                //校验数据
                if($.trim($oli.find("input:text").eq(0).val())==""){
                    layer.msg("子属性名称不可为空");
                    return false;
                }
                if($oli.find(".input_number").val()==""){
                    layer.msg("排序不可为空");
                    return false;
                }
                /*
                参数说明：
                id              //子属性id
                name            //主属性名称
                sort            //排序
                msdsFirmAtbId   //主属性ID
                * */
                var msdsFirmAtbId = $("input:checked").parents("li").attr("msdsFirmAtbId")?$("input:checked").parents("li").attr("msdsFirmAtbId"):"";
                if(msdsFirmAtbId==""){
                    layer.msg("请先保存主属性!");
                    return;
                }
                var data = {};
                data["msdsSubAtbId"] = ($oli.attr("msdssubatbId")?$oli.attr("msdssubatbId"):"");
                data["msdsSubAtbName"] = $.trim($oli.find("input:text").eq(0).val());
                data["sortNum"] = $.trim($oli.find(".input_number").val());
                data["msdsFirmAtbId"] = msdsFirmAtbId;
                $.ajax({
                    url:childsaveUrl,
                    async: false,
                    type: "POST",
                    data:JSON.stringify(data),
                    dataType: "text",
                    contentType: "application/json;charset=utf-8",
                    success: function (result) {
                        result = JSON.parse(result)
                        layer.msg(result.message);         //提示当前保存状态
                        if(result.isSuccess){
                            //若是最后一项，那么并添加一项；
                            $("#child_attrlist_box").find("li").eq(index).attr("msdssubatbId",result.result);
                            $("#child_attrlist_box").find("li").eq(index).attr("msdsfirmatbId",msdsFirmAtbId);
                            if(index==$("#child_attrlist_box").find("li").length-1){
                                var oCreat_oPtion = $("#child_attrlist_box").find("li").eq(index).clone();
                                //将表单置空
                                oCreat_oPtion.find("input:text").val("");
                                oCreat_oPtion.find(".input_number").val("");
                                //删除复制项上的废属性
                                oCreat_oPtion.removeAttr("msdsfirmatbId");
                                oCreat_oPtion.removeAttr("msdssubatbId");
                                //将删除号隐藏
                                oCreat_oPtion.find(".delete_button2").hide();                                      //将创建的一项的删除按钮隐藏；
                                $("#child_attrlist_box").find("li").eq(index).find(".delete_button2").show();    //将已保存的最后一项的删除按钮展示；
                                $("#child_attrlist_box").append(oCreat_oPtion);                                    //将创建的这一项添加进来；
                            }
                        }
                    }
                });
                //end-----------------------------------------

            },
            //子属性——当前这一项进行删除
            child_option_delete:function(index){
               var $cur_li = $("#child_attrlist_box").find("li").eq(index);
                layer.confirm('确定删除吗？', {
                    btn: ['确定', '取消']
                }, function () {
                    //start delete
                    //删除之前，先判断，是否是新建的一项，若是，那么就不进行删除
                    if($cur_li.attr("msdsfirmatbId") && $cur_li.attr("msdssubatbId")){
                        $.ajax({
                            url: childdelUrl+"?id="+$cur_li.attr("msdssubatbId"),
                            async: false,
                            data: JSON.stringify(page.data.param),
                            dataType: "text",
                            contentType: "application/json;charset=utf-8",
                            type: 'DELETE',
                            success: function (result) {
                                result = JSON.parse(result)
                                if(result.isSuccess){
                                    layer.msg(result.message);
                                    $cur_li.remove();   //将当前这一项进行删除
                                }else{
                                    layer.msg(result.message);
                                }
                            },
                            error: function (result) {
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        })
                    }else{
                        //属于客户端新建项，自行删除便可
                        $cur_li.remove();   //将当前这一项进行删除
                    }
                    //end delete
                }, function (index) {
                    layer.close(index)
                });
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                page.logic.select_option(riskAreaTypeNameUrl,function(){
                        $.ajax({
                            url: getListUrl + "?orgId=" +   orgId + "&msdsFirmAtbId=&now=" + Math.random(),
                            type: "get",
                            async: true,
                            dataType: "json",
                            success: function (data) {
                                // console.log(data);
                                //编辑数据塞入；
                                for(var w=0;w<data.length;w++){
                                    (function(cur_dt,index){
                                        // console.log("每一项的主属性名称：",cur_dt["msdsFrimAtbName"]);
                                            switch(cur_dt["msdsFrimAtbName"]){
                                                case "危险性":
                                                    page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(0),cur_dt);
                                                    break;
                                                case "急救措施":
                                                    page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(1),cur_dt);
                                                    break;
                                                case "消防措施":
                                                    page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(2),cur_dt);
                                                    break;
                                                case "泄漏应急处理":
                                                    page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(3),cur_dt);
                                                    break;
                                                default:
                                                    //主属性动态添加项
                                                    page.logic.append_option($("#main_attrlist_box"),false,function(){
                                                        // console.log("单条数据：",cur_dt);
                                                        //动态设置属性；
                                                        // console.log("此处记录的索引值：",index);
                                                         page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(index),cur_dt);
                                                    });
                                            }
                                    })(data[w],w);
                                }
                                //主属性：添加一项空行，用于填值
                                page.logic.append_option($("#main_attrlist_box"),true,function(){
                                    page.logic.set_attr_list($("#main_attrlist_box").find("li").eq(index),{orgId:$("#main_attrlist_box").find("li").eq(0).attr("orgId")});
                                });
                                //默认第一项呈选中状态，并呈现对应的子属性列表
                                page.logic.cur_option_checked(0,function(){
                                    //加载子属性列表
                                    page.logic.load_child_list(0);
                                });
                            },
                            error: function (result) {
                                var errorResult = $.parseJSON(result.responseText);
                                layer.msg(errorResult.collection.error.message);
                            }
                        });
                });
            },
            //设置主属性每一项的相关属性值；
            set_attr_list:function(oLi,cur_dt){
                // console.log("每一条的数据：",cur_dt);
               
                if (cur_dt["msdsFirmAtbId"] != undefined) {
                     oLi.attr({
                         "msdsFirmAtbId": (cur_dt["msdsFirmAtbId"] ? cur_dt["msdsFirmAtbId"] : ""),
                         "orgId": (cur_dt["orgId"] ? cur_dt["orgId"] : "")
                     });
                      console.log(cur_dt["msdsFirmAtbId"])
                }
               
                // console.log("当前这一条的索引值：",$(oLi).index());
                if($(oLi).index()>3){
                    if(cur_dt["msdsFrimAtbName"]){
                        $(oLi).find("input:text").eq(0).val(cur_dt["msdsFrimAtbName"]);
                    }
                    if(cur_dt["sortNum"]){
                        $(oLi).find(".input_number").val(cur_dt["sortNum"]);
                    }
                }
            },
            //动态添加一项
            append_option:function(oPar,isLast,cb){
                var $oLi = $('<li class="mb__5">' +
                    '<input type="radio" style="float:left;" />' +
                    '<input type="text" class="width__150 ml__5 form-control" style="float:left;" />' +
                    '<label class="ml__10">排序：</label>'+
                    '<input type="number" class="mr__10 width__50 input_number" min="1" max="999999" oninput="if(value.length>5)value=value.slice(0,5)" value="" />'+
                    // '<input type="number" class="mr__10 width__50" minValue="0" maxValue="999999" value="" />' +
                    // '<input type="button" value="—" class="delete_button2 mr__10" />' +
                    // '<input type="button" value="保存" class="save_button" />' +
                    '<button class="btn btn-danger delName width__50" style="width: 40px !important;" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button>'+
                    '<button class="btn btn-info ml__10 width__50" style="width: 40px !important;" type="button" title="保存"><span class="glyphicon glyphicon-plus"></span></button>'+
                    '</li>');
                //若是最后一项；
                if(isLast){
                    $oLi.find(".delete_button2").hide();
                    $oLi.find(".input_number").val("");
                }
                $(oPar).append($oLi);      //将创建的这一项添加进来；
                cb && cb();
            },
            //子属性，动态添加一项；
            append_child_option:function(oPar,isLast,cb){
                    var $oLi = $('<li class="mb__5">'+
                        '<input type="text" class="width__150 form-control" maxlength="200" style="float:left;">'+
                        '<label class="ml__10">排序：</label>'+
                        '<input type="number" class="mr__10 width__50 input_number" min="1" max="999999" value="" oninput="if(value.length>5)value=value.slice(0,5)" />'+
                        // '<input type="button" value="—" class="delete_button2 mr__10" />' +
                        '<button class="btn btn-danger delName width__50" style="width: 40px !important;" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button>'+
                        '<button class="btn btn-info ml__10 width__50" style="width: 40px !important;" type="button" title="保存"><span class="glyphicon glyphicon-plus"></span></button>'+
                        // '<input type="button" value="保存" class="save_button" />' +
                        '</li>');
                    //若是最后一项；
                    if(isLast){
                        $oLi.find(".delete_button2").hide();    //隐藏删除
                        $oLi.find(".input_number").val("");     //清空排序的值；
                    }
                    $(oPar).append($oLi);       //将创建的这一项添加进来；
                    cb && cb();
            },
            //子属性，每一项的设置
            set_child_attr:function(oLi,cur_dt){
                //相关设置
                $(oLi).attr({
                    "msdsFirmAtbId":cur_dt["msdsFirmAtbId"],
                    "msdsSubAtbId":cur_dt["msdsSubAtbId"]
                });
                //设置value值
                $(oLi).find("input:text").eq(0).val(cur_dt["msdsSubAtbName"]);
                $(oLi).find(".input_number").val(cur_dt["sortNum"]);
            },
            //企业名称下拉菜单数据的加载
            select_option:function(menu_url,cb){
                $.ajax({
                    url:menu_url,
                    type:"get",
                    success:function (data) {
                        //单条数据重要的参数：orgCode  orgId  orgPID  orgName（全称）  orgSname（简称）
                        //若是企业用户，设置为不可用状态；
                        if(ECS.sys.Context.SYS_IS_HQ){
                            orgId = data[0].orgId;
                        }else{
                            for(var w=0;w<data.length;w++){
                                (function(cur_key){
                                    if(cur_key.orgCode==ECS.sys.Context.SYS_ENTERPRISE_CODE){
                                        orgId = cur_key.orgId;                                      //存储企业的id;
                                    }
                                })(data[w]);
                            }
                        }
                        cb && cb();
                    }
                })
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})