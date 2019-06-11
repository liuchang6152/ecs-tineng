var detailUrl = ECS.api.apUrl + '/DisposeWarning/FlowRecord';  //案件详情   ?eventId=24675
var vm = new Vue({
    el: '#main',
    data: {
        items: [],
        selectedItem: [],
        eventId: '',
        detail: {}
    },
    methods: {
        returnJson: function (d) {
            return JSON.stringify(d);
        }
    }
});
var EventId = null;   //事件id;

$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            this.bindUI();
            // page.logic.initPage();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        data: {
            source_type:{"0":"手动","1":"电话","2":"自动"},    //来源类型
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            setData: function (data) {
                 EventId = data.EventId;
                // vm.eventId = eventId;
                page.logic.initPage();
            },
            initPage: function () {
                $.ajax({
                     url: detailUrl + "?eventId="+ EventId,
                    // url: detailUrl + "?eventId=23855",
                    type: "get",
                    success: function (data) {
                        // console.log("响应，返回的信息：",data);
                        //警情记录------开始
                        if(data[0].executedTime){
                            $("#start_time").html(ECS.util.DateTimeRender(data[0].executedTime));  //时间
                        }
                        $("#accidentCategoryName").html(data[0].accidentCategoryName?data[0].accidentCategoryName:"");        //事故大类
                        $("#accidentTypeName").html(data[0].accidentTypeName?data[0].accidentTypeName:"");                     //事故小类
                        if(data[0].eventSource==1){
                            //电话
                            $("#eventSource").html(data[0].callPhone?data[0].callPhone:"");   //来源
                        }else if(data[0].eventSource==2){
                            //自动
                            var sCur_address = "";
                            sCur_address+=data[0].enterpriseName?data[0].enterpriseName:"";  //企业
                            sCur_address+=data[0].drtDeptName?data[0].drtDeptName:"";        //二级单位
                            sCur_address+=data[0].riskAreaName?data[0].riskAreaName:"";      //安全风险区
                            sCur_address+=data[0].optlRiskSoneName?data[0].optlRiskSoneName:""; //作业风险区
                            sCur_address+=data[0].riskAnlsObjName?data[0].riskAnlsObjName:"";//风险分析对象
                            sCur_address+=data[0].pointName?data[0].pointName:"";                //风险分析点
                            $("#eventSource").html(sCur_address);
                        }else{
                            //手动
                            $("#eventSource").html(page.data.source_type[data[0].eventSource]);   //来源
                        }
                        $("#riskRankName").html(data[0].riskRankName?data[0].riskRankName:"");                           //预警等级
                        $("#eventLvlName").html(data[0].eventLvlName?data[0].eventLvlName:"");                           //事故等级
                        $("#eventAddress").html(data[0].eventAddress?data[0].eventAddress:"");                        //案发位置
                        //警情记录----------开始受理
                        if(data[1].executedTime){
                            $("#receive_time").html(ECS.util.DateTimeRender(data[1].executedTime));                         //时间
                        }
                        //警情记录----------接警
                        if(data[2].executedTime){
                            $("#getcall_time").html(ECS.util.DateTimeRender(data[2].executedTime));                         //时间
                        }
                        $("#dieCount").html(data[2].dieCount?data[2].dieCount:"无");                                   //人员受伤
                        $("#casualtyCount").html(data[2].casualtyCount?data[2].casualtyCount:"无");                  //人员死亡
                        $("#propertyLossCount").html(data[2].propertyLossCount?data[2].propertyLossCount:"无");    //财产损失

                        //警情记录----------处警
                        if(data[3].executedTime){
                            $("#dealcall_time").html(ECS.util.DateTimeRender(data[3].executedTime));                       //时间
                        }
                        //启动预案名称列表展示
                        var aCase_list_dom = "";
                        if(data[3].relatedPlanEntityList){
                            for(var w=0;w<data[3].relatedPlanEntityList.length;w++){
                                (function(cur_dt){
                                    //进行处理--------------
                                    aCase_list_dom+='<tr>'+
                                        '<td class="mini-grid-cell" style="text-align:center;">'+
                                        '<div class="mini-grid-cell-inner  mini-grid-cell-nowrap">'+cur_dt.emergencyPlanName+'</div>'+
                                        '</td>'+
                                        '<td class="mini-grid-cell" style="text-align:center;">'+
                                        '<div class="mini-grid-cell-inner  mini-grid-cell-nowrap">'+ECS.util.DateTimeRender(cur_dt.usedDate)+'</div>'+
                                        '</td>'+
                                        '</tr>';
                                })(data[3].relatedPlanEntityList[w]);
                            }
                            $("#case_list").html(aCase_list_dom);
                        }
                        //相关危化品
                        var aDanger_list_dom = "";
                        if(data[3].relatedMSDSEntityList){
                            for(var i=0;i<data[3].relatedMSDSEntityList.length;i++){
                                (function(cur_dt){
                                    //进行处理-------------
                                    aDanger_list_dom+='<tr>'+
                                                        '<td class="mini-grid-cell" style="text-align:center;">'+
                                                             '<div class="mini-grid-cell-inner  mini-grid-cell-nowrap">'+cur_dt.msdsChineseName+'</div>'+
                                                         '</td>'+
                                                  '</tr>';
                                })(data[3].relatedMSDSEntityList[i]);
                            }
                            $("#danger_list").html(aDanger_list_dom);
                        }
                        //警情记录-----------处置完成
                        if(data[4].executedTime){
                            $("#complete_time").html(ECS.util.DateTimeRender(data[4].executedTime));   //时间
                        }

                        if(data[4].alarmTelStatusName){
                            $("#case_status").html(data[4].alarmTelStatusName);                         //处警状态
                        }
                    },
                    error: function (e) {
                        //	alert(e);
                    }
                });
            },
            WFDetail: function () {
                var type = 'auto';
                var msg = vm.detail.eventSummary;
                layer.open({
                    type: 1
                    ,area: ['40%', '30%']
                    , offset: type //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                    , id: 'layerDemo' + type //防止重复弹出
                    , content: '<div style="padding: 20px 100px;">' + msg + '</div>'
                    , btn: '关闭'
                    , btnAlign: 'c' //按钮居中
                    , shade: 0 //不显示遮罩
                    , yes: function () {
                        layer.closeAll();
                    }
                });
            },
            Detail: function (item) {
                layer.open({
                    type: 2,
                    closeBtn: 1,
                    area: ['80%', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: '详情',
                    content: '../FiremanGo/task.html?eventId='+ item.eventID + '&teamId=' + item.teamID + '&batchId=' + item.firemanGoBatch +'&readonly=true' + '&r=' + Math.random() ,
                    success: function (layero, index) {

                    },
                    end: function () {

                    }
                })
            },

            Convert: function (item) {

                if (item.alarmTime) {
                    item.alarmTime = moment(item.alarmTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.initTime) {
                    item.initTime = moment(item.initTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.commandTime) {
                    item.commandTime = moment(item.commandTime).format('YYYY-MM-DD HH:mm:ss');
                }

                if (item.registerTime) {
                    item.registerTime = moment(item.registerTime).format('YYYY-MM-DD HH:mm:ss');
                }

                if (item.completeTime) {
                    item.completeTime = moment(item.completeTime).format('YYYY-MM-DD HH:mm:ss');
                }

                return item;
            },

            closeLayer: function (isRefresh) {
                // parent.resetAnswerStatus();
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            },
        }
    };
    page.init();
    window.page = page;
});