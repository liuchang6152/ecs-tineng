var delUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//删除
var searchUrl = ECS.api.emUrl + '/DispatchDeviceConfig';//查询
var riskArea_url = ECS.api.bcUrl + '/riskArea/allRiskArea'; //树形结构
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            $("#searchForm").find('input').val("");
            // page.logic.load_sidebar(riskArea_url,"tree1");//树形结构
            page.logic.initTable();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //消息类全选
            $("#btnSelectAll").click(function () {
                page.logic.selectAll(grid1,grid2);
            });
            //开关类全选
            $("#turnSelectAll").click(function () {
                page.logic.selectAll(grid3,grid4);
            });
            //消息类全部删除
            $("#btnMoveAll").click(function () {
                page.logic.removeAll(grid2);
            });
            //开关类删除
            $("#turnMoveAll").click(function () {
                page.logic.removeAll(grid4);
            });
            //消息类执行
            $("#btnSave").click(function () {
                page.logic.removeAll(grid2);
            });
            //开关类执行
            $("#btnTurnSave").click(function () {
                page.logic.removeAll(grid4);
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
                    $("#autoNum").show();
                }else{
                    $("#autoNum").hide();
                }
            });
            $( "#autoNum").bind("change", function() {
                if($("#autoNum").val()<11){
                    layer.msg("请输入大于10的正整数");
                }
            });
            //点击左侧树形菜单,查询表格数据
            // mini.get("tree1").on("nodeselect", function (e){
            //     //找到父节点
            //     var navHtml="当前位置：";
            //     var getLssevel = mini.get("tree1").getAncestors(e.node);
            //     for(var i=0;i<getLssevel.length;i++){
            //         navHtml+="<li>"+getLssevel[i].drtDeptName+"</li>";
            //     }
            //     $(".breadcrumb").html(navHtml+"<li class='active'>"+e.node.drtDeptName+"</li>");
            //     if(e.node.riskAreaID==null){
            //         e.node.riskAreaID="";
            //     }
            //     page.logic.initTable(e.node.orgId,e.node.riskAreaID);
            // });
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
                grid4 = mini.get("haveSelectTurn");
                // $.ajax({
                //     url: searchUrl+'?orgId='+orgId+'&riskAreaID='+riskAreaID+'&pageIndex=0&pageSize=10&sortField=&sortOrder=',
                //     type: "GET",
                //     beforeSend: function () {
                //         ECS.showLoading();
                //     },
                //     success: function (data) {

                        // var data = [{
                        //     drtDeptName:"二级单位名称",
                        //     riskAreaName:"安全风险区名称",
                        //     deviceE:{
                        //         deviceTypeName:"设备小类",
                        //         deviceName:"设备名称"
                        //     }
                        // }];
                        var data = {
                            "hasPrePage": false,
                            "hasNextPage": true,
                            "id": null,
                            "status": 0,
                            "total": 11,
                            "totalCount": 11,
                            "pageList": [

                                {
                                    "cfgID": 1205,
                                    "deviceID": 3,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550646579000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1550646579000,
                                        "mntUserId": "ces",
                                        "mntUserName": "ces",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 3,
                                        "deviceName": "播音喇叭1",
                                        "deviceCatgId": 1003,
                                        "deviceCatgName": "消息类",
                                        "deviceTypeId": 1014,
                                        "deviceTypeName": "现场播音喇叭",
                                        "drtDeptName":"常减压-高杆",
                                        "deviceNumber": "33445",
                                        "activationPattern": 0,
                                        "ipAddress": "testadd",
                                        "remark": "remk",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1205,
                                    "deviceID": 3,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550646579000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1550646579000,
                                        "mntUserId": "ces",
                                        "mntUserName": "ces",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 3,
                                        "deviceName": "播音喇叭2",
                                        "deviceCatgId": 1003,
                                        "deviceCatgName": "消息类",
                                        "deviceTypeId": 1014,
                                        "deviceTypeName": "现场播音喇叭",
                                        "drtDeptName":"常减压-高杆",
                                        "deviceNumber": "33445",
                                        "activationPattern": 0,
                                        "ipAddress": "testadd",
                                        "remark": "remk",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },{
                                    "cfgID": 1205,
                                    "deviceID": 3,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550646579000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1550646579000,
                                        "mntUserId": "ces",
                                        "mntUserName": "ces",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 3,
                                        "deviceName": "播音喇叭3",
                                        "deviceCatgId": 1003,
                                        "deviceCatgName": "消息类",
                                        "deviceTypeId": 1014,
                                        "deviceTypeName": "现场播音喇叭",
                                        "drtDeptName":"常减压-高杆",
                                        "deviceNumber": "33445",
                                        "activationPattern": 0,
                                        "ipAddress": "testadd",
                                        "remark": "remk",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1205,
                                    "deviceID": 3,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550646579000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1550646579000,
                                        "mntUserId": "ces",
                                        "mntUserName": "ces",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 3,
                                        "deviceName": "播音喇叭4",
                                        "deviceCatgId": 1003,
                                        "deviceCatgName": "消息类",
                                        "deviceTypeId": 1014,
                                        "deviceTypeName": "现场播音喇叭",
                                        "drtDeptName":"常减压-高杆",
                                        "deviceNumber": "33445",
                                        "activationPattern": 0,
                                        "ipAddress": "testadd",
                                        "remark": "remk",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },{
                                    "cfgID": 1205,
                                    "deviceID": 3,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550646579000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1550646579000,
                                        "mntUserId": "ces",
                                        "mntUserName": "ces",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 3,
                                        "deviceName": "播音喇叭5",
                                        "deviceCatgId": 1003,
                                        "deviceCatgName": "消息类",
                                        "deviceTypeId": 1014,
                                        "deviceTypeName": "现场播音喇叭",
                                        "drtDeptName":"常减压-高杆",
                                        "deviceNumber": "33445",
                                        "activationPattern": 0,
                                        "ipAddress": "testadd",
                                        "remark": "remk",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1204,
                                    "deviceID": 1,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550641931000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1554864140000,
                                        "mntUserId": "ecs006",
                                        "mntUserName": "ecs006",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 1,
                                        "deviceName": "闸门1",
                                        "deviceCatgId": 1002,
                                        "deviceCatgName": "开关类",
                                        "deviceTypeId": 1013,
                                        "deviceTypeName": "闸门",
                                        "drtDeptName":"炼油一厂1号门",
                                        "deviceNumber": "12345",
                                        "activationPattern": 0,
                                        "ipAddress": "172.2.2.2",
                                        "remark": "建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符哈放到的三个五百",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1204,
                                    "deviceID": 1,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550641931000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1554864140000,
                                        "mntUserId": "ecs006",
                                        "mntUserName": "ecs006",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 1,
                                        "deviceName": "闸门2",
                                        "deviceCatgId": 1002,
                                        "deviceCatgName": "开关类",
                                        "deviceTypeId": 1013,
                                        "deviceTypeName": "闸门",
                                        "drtDeptName":"炼油一厂1号门",
                                        "deviceNumber": "12345",
                                        "activationPattern": 0,
                                        "ipAddress": "172.2.2.2",
                                        "remark": "建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符哈放到的三个五百",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1204,
                                    "deviceID": 1,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550641931000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1554864140000,
                                        "mntUserId": "ecs006",
                                        "mntUserName": "ecs006",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 1,
                                        "deviceName": "闸门3",
                                        "deviceCatgId": 1002,
                                        "deviceCatgName": "开关类",
                                        "deviceTypeId": 1013,
                                        "deviceTypeName": "闸门",
                                        "drtDeptName":"炼油一厂1号门",
                                        "deviceNumber": "12345",
                                        "activationPattern": 0,
                                        "ipAddress": "172.2.2.2",
                                        "remark": "建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符哈放到的三个五百",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },{
                                    "cfgID": 1204,
                                    "deviceID": 1,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550641931000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1554864140000,
                                        "mntUserId": "ecs006",
                                        "mntUserName": "ecs006",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 1,
                                        "deviceName": "闸门4",
                                        "deviceCatgId": 1002,
                                        "deviceCatgName": "开关类",
                                        "deviceTypeId": 1013,
                                        "deviceTypeName": "闸门",
                                        "drtDeptName":"炼油一厂1号门",
                                        "deviceNumber": "12345",
                                        "activationPattern": 0,
                                        "ipAddress": "172.2.2.2",
                                        "remark": "建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符哈放到的三个五百",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                },
                                {
                                    "cfgID": 1204,
                                    "deviceID": 1,
                                    "deviceIDList": null,
                                    "deviceE": {
                                        "crtDate": 1550641931000,
                                        "crtUserId": "ecs",
                                        "crtUserName": "ecs",
                                        "mntDate": 1554864140000,
                                        "mntUserId": "ecs006",
                                        "mntUserName": "ecs006",
                                        "inUse": 1,
                                        "inUseShow": "是",
                                        "deviceId": 1,
                                        "deviceName": "闸门5",
                                        "deviceCatgId": 1002,
                                        "deviceCatgName": "开关类",
                                        "deviceTypeId": 1013,
                                        "deviceTypeName": "闸门",
                                        "drtDeptName":"炼油一厂1号门",
                                        "deviceNumber": "12345",
                                        "activationPattern": 0,
                                        "ipAddress": "172.2.2.2",
                                        "remark": "建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字的建设名称字符测试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符测试试建设名称字符哈放到的三个五百",
                                        "enterpriseID": 30650700,
                                        "enterpriseCode": null,
                                        "deviceAssortment": 0,
                                        "deviceAssortmentName": "PLC",
                                        "isDelete": 0,
                                        "sortNum": 0,
                                        "orgName": null,
                                        "baseDataId": null,
                                        "baseModelCategory": null,
                                        "baseDataName": null,
                                        "teamID": null,
                                        "teamName": null,
                                        "deviceOperationPattern": null,
                                        "orgCode": null
                                    },
                                    "deviceMode": 1,
                                    "enterpriseID": 30650700,
                                    "baseDataId": 30650706,
                                    "baseModelCategory": 3,
                                    "teamID": null,
                                    "teamType": null,
                                    "teamTypeName": "",
                                    "teamPID": null,
                                    "teamPIDName": null,
                                    "teamName": null
                                }
                            ],
                            "pageSize": 10,
                            "totalPage": 2,
                            "pageNumber": 1,
                            "pageIndex": 1,
                            "beginIndex": 0,
                            "isBaseZero": false
                        };
                        // console.log("总数据集合：",data.pageList);
                        ECS.hideLoading();
                        var nArr = data.pageList.filter(function(title){
                            return title.deviceE.deviceCatgName === '消息类';
                        });
                        var tArr = data.pageList.filter(function(title){
                            return title.deviceE.deviceCatgName === '开关类';
                        });
                        // console.log("消息类的数据：",nArr);
                        // console.log("开关类的数据：",tArr);
                        grid1.setData(nArr);
                        grid3.setData(tArr);
                    // }
                // });
            },
            //树形菜单
            load_sidebar:function(treeUrl,oPar){
                $.ajax({
                    url: treeUrl,
                    type: "GET",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success: function (data) {
                        mini.get(oPar).loadList(data, "zid", "orgPID");
                        $(".breadcrumb").html("当前位置："+"<li class='active'>"+mini.get(oPar).data[0].drtDeptName+"</li>");
                        if(mini.get(oPar).data[0].riskAreaID==null){
                            mini.get(oPar).data[0].riskAreaID="";
                        }
                        page.logic.initTable();
                        // page.logic.initTable(mini.get(oPar).data[0].orgId,mini.get(oPar).data[0].riskAreaID);
                        ECS.hideLoading();
                    }
                });
            },
            deviceName:function(e){
                return e.row.deviceE.deviceName;
            },
            deviceTypeName:function(e){
                return e.row.deviceE.deviceTypeName;
            },
            drtDeptName:function(e){
                return e.row.deviceE.drtDeptName;
            },
            show_edit:function(e){
                return '<a title="选择" href="javascript:window.page.logic.select(grid1,grid2)">选择</a>';
            },
            show_edits:function(e){
                return '<a title="选择" href="javascript:window.page.logic.select(grid3,grid4)">选择</a>';
            },
            show_del:function(e){
                return '<a title="删除" href="javascript:window.page.logic.removes(grid2)">删除</a>';
            },
            show_dels:function(e){
                return '<a title="删除" href="javascript:window.page.logic.removes(grid4)">删除</a>';
            },

            //根据id判断，去除重复的item
            doAddItems:function(items,editTree){
                items = mini.clone(items);
                for (var i = items.length - 1; i >= 0; i-- ) {
                    var item = items[i];
                    var item2 = editTree.findRow(function (row) {
                        if (row.cfgID == item.cfgID) return true;
                    });
                    if (item2) {
                        items.removeAt(i);
                    }
                }
                editTree.addRows(items);
            },
            select:function(tree,editTree){
                var items = tree.getSelecteds();
                page.logic.doAddItems(items,editTree);
            },
            selectAll:function(tree,editTree){
                var items = tree.getData();
                page.logic.doAddItems(items,editTree);
            },
            removes:function(editTree){
                var items = editTree.getSelecteds();
                editTree.removeRows(items);
            },
            removeAll:function(editTree){
                var items = editTree.getData();
                editTree.removeRows(items);
            },
        }
    };
    page.init();
    window.page = page;
});