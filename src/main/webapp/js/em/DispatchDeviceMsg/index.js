var delUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//删除
var searchUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//查询
var enterpriseUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var riskArea_url = ECS.api.emUrl + '/DispatchDeviceConfig/getTreeList'; //树形结构
window.pageLoadMode = PageLoadMode.None;
var orgId="";
var flag=false;
var addObj;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();
            $("#searchForm").find('input').val("");
            page.logic.cbxEnterprise();//企业
            page.logic.initTable("","");//表格
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //消息类执行
            $("#btnSave").click(function () {
                page.logic.removeAll(grid2);
            });
            //快播广告语点击后直接赋值到消息内容里面
            $("#msg").change(function () {
                var msg=$("#autoMsg").val()+"　";
                if(this.value!=0){
                    msg+=$("#msg").find("option:selected").text()+"　";
                }
                $(this).find("option:first").attr("selected","selected");
                $("#autoMsg").val(msg)
            });
            //自定义播放次数
            $("#nums").change(function () {
                if(this.value==0){
                    $("#custom").show();
                }else{
                    $("#custom").hide();
                }
            });
            $( "#autoNum").bind("change", function() {
                if($("#autoNum").val()<11){
                    layer.msg("请输入大于10的正整数");
                    $("#autoNum").val("11");
                }
            });
            //点击左侧树形菜单,查询表格数据
            mini.get("tree1").on("nodeselect", function (e){
                $("#searchForm")[0].reset();
                addObj={"baseModelCategory":e.node.obj ,"baseDataId":e.node.tid,"enterpriseID": orgId , "deviceMode":"1"};
                flag=true;
                grid.load({ "baseModelCategory":e.node.obj ,"baseDataId":e.node.tid,"enterpriseID": orgId , "deviceMode":"1"});
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化表格
             */
            initTable: function (orgId,riskAreaID) {
                grid1 = mini.get("noSelect");
                grid2 = mini.get("haveSelect");
                grid3 = mini.get("turnSelect");
                $.ajax({
                    url: searchUrl+'?orgId='+orgId+'&riskAreaID='+riskAreaID+'&pageIndex=0&pageSize=10&sortField=&sortOrder=',
                    type: "GET",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        ECS.hideLoading();
                        var nArr = data.pageList.filter(function(title){
                            return title.deviceE.deviceCatgName === '消息类';
                        });
                        var tArr = data.pageList.filter(function(title){
                            return title.deviceE.deviceCatgName === '开关类';
                        });
                        grid1.setData(nArr);
                        grid3.setData(tArr);
                    }
                });
            },
            /**
             * 企业
             */
            cbxEnterprise:function(){
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        async:false
                    },null,page.logic.load_sidebar);
                }else{
                    ECS.ui.getCombobox("enterpriseCode", enterpriseUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        valueField: "orgSname",
                        codeField:"orgId",
                        async:false
                    },null,page.logic.load_sidebar);
                    $("#enterpriseCode").attr("disabled",true);
                }
                page.logic.load_sidebar();//左侧树形结构
            },
            //树形菜单
            load_sidebar:function(){
                orgId=$("#enterpriseCode").find("option:selected").attr("code");
                var orgCode=$("#enterpriseCode").val();
                if(orgCode){
                    $.ajax({
                        url: riskArea_url+"?orgCode="+orgCode+"&treeID="+orgId,
                        type: "GET",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            mini.get("tree1").loadList(data, "id", "pid");
                            ECS.hideLoading();
                        }
                    });
                }
            },
            curStatus:function(e){
                return '<a title="选择" href="javascript:window.page.logic.select()">选择</a>';
            },
        }
    };
    page.init();
    window.page = page;
});