var searchUrl=ECS.api.maUrl+"/alertsLog";
var getSingleUrl = ECS.api.maUrl + '/alertsLog';
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;
var alertsLogID="";
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page={
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI:function () {
            //关闭窗口
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#btnQuery").click(function () {
                page.logic.initEcharts(alertsLogID);
            });
            //初始化时时间范围为当前日期前一个小时
            var beginTime = new Date(new Date().getTime() - 60 * 60 * 1000);
            var endTime=ECS.util.timestampToHour(new Date());
            mini.get("startTime").setValue(ECS.util.timestampToHour(beginTime));
            mini.get("endTime").setValue(endTime);
            //开始时间
            mini.get("startTime").on("valuechanged",function(){
                var beginDate = new Date($("input[name=startTime]").val().replace(/\-/g, "\/"));
                var endDate = new Date($("input[name=endTime]").val().replace(/\-/g, "\/"));
                if(beginDate>endDate){
                    mini.get("startTime").setValue(beginTime);
                    layer.msg("开始束时间需早于结束时间！");
                    return false;
                }
            });
            //结束时间
            mini.get("endTime").on("valuechanged",function(){
                var beginDate = new Date($("input[name=startTime]").val().replace(/\-/g, "\/"));
                var endDate = new Date($("input[name=endTime]").val().replace(/\-/g, "\/"));
                if(beginDate>endDate){
                    mini.get("endTime").setValue(endTime);
                    layer.msg("结束时间需晚于开始时间！");
                    return false;
                }
            });
        },
        data:{//定义参数
            param:{}
        },
        logic:{
            //初始化
            setData: function (data) {
                $('#title-main').text(data.title);
                alertsLogID=data.alertsLogID;
                page.logic.initEcharts(data.alertsLogID);
            },
            onDrawDate:function(e){
                var date = e.date;
                var d = new Date();
                if (date > d) {
                    e.allowSelect = false;
                }
            },
            //图表
            initEcharts:function(alertsLogID){
                var myChart = echarts.init(document.getElementById('main'));
                myChart.setOption({
                    title: {
                        y:"30px",
                        text: '指标区间',
                        textStyle:{
                            color:'#7689aa',
                            fontWeight:500,
                            fontSize:14
                        }
                    },
                    grid:{
                        left:150,
                        bottom:30
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        showDataShadow:false,
                        xAxisIndex: [0],
                        left: 150,
                        bottom: 0,
                        start: 0,
                        end: 100 //初始化滚动条
                    }],
                    xAxis: {
                        data: [],
                        show:false
                    },
                    yAxis: {
                        splitLine:{
                            show:true
                        },
                        data:[]
                    },
                    series: [{
                        type: 'scatter',
                        label: {
                            normal: {
                                show: true,
                                position: 'inside',
                                formatter: function (param) {
                                    return param.data[0]+"\n\n"+param.data[2];
                                },
                                textStyle: {
                                    color: '#768a99'
                                }
                            }
                        },
                        color:'#45c8dc',
                        data: []
                    }]
                });
                var xtime=[];//去重排序的时间
                var xtimes=[];//没去重的时间
                var ynum=[];//排序后的刻度
                var lists=[];//真正返回的数值
                var nums=[];
                $.ajax({
                    type : "get",
                    async : true,
                    url : getSingleUrl + "/" + alertsLogID + "?startTime="+ECS.util.timestampToHour(mini.get("startTime").getValue())
                        +"&endTime="+ECS.util.timestampToHour(mini.get("endTime").getValue())+"&now=" + Math.random(),
                    dataType : "json",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success : function(result) {
                        ECS.hideLoading();
                        if (result) {
                            mini.get("datagrid").setData(result.sendMap);
                            for(var i=0;i<result.monitorValueMap.length;i++){
                                nums.push(result.monitorValueMap[i].monitorValueLvl);//需要展示的所有的值
                                xtimes.push(result.monitorValueMap[i].monitorValueTime);//需要展示的所有的时间
                                for(var j=0;j<result.factorEntitys.length;j++){
                                    var list=[];
                                    if(nums[i]==result.factorEntitys[j].monitorLvl){
                                        if(result.factorEntitys[j].lowLimit==result.factorEntitys[j].uppLimit){
                                            result.factorEntitys[j].inUpper="=";
                                            result.factorEntitys[j].inLower="=";
                                        }else{
                                            if(result.factorEntitys[j].inUpper==1){
                                                result.factorEntitys[j].inUpper="≤";
                                            }
                                            if(result.factorEntitys[j].inLower==1){
                                                result.factorEntitys[j].inLower="≤";
                                            }
                                            if(result.factorEntitys[j].inUpper==0){
                                                result.factorEntitys[j].inUpper="＜";
                                            }
                                            if(result.factorEntitys[j].inLower==0){
                                                result.factorEntitys[j].inLower="＜";
                                            }
                                        }
                                        if(result.factorEntitys[j].uppLimit=="999999.999999"){
                                            list.push(ECS.util.DateTimeRendesr(result.monitorValueMap[i].monitorValueTime),nums[i]+": "+result.factorEntitys[j].lowLimit+result.factorEntitys[j].inLower+"值",result.monitorValueMap[i].monitorValue);
                                        }else if(result.factorEntitys[j].lowLimit=="-999999.999999"){
                                            list.push(ECS.util.DateTimeRendesr(result.monitorValueMap[i].monitorValueTime),nums[i]+": "+"值"+result.factorEntitys[j].inUpper+result.factorEntitys[j].uppLimit,result.monitorValueMap[i].monitorValue);
                                        }else{
                                            list.push(ECS.util.DateTimeRendesr(result.monitorValueMap[i].monitorValueTime),nums[i]+": "+result.factorEntitys[j].lowLimit+result.factorEntitys[j].inLower+"值"+result.factorEntitys[j].inUpper+result.factorEntitys[j].uppLimit,result.monitorValueMap[i].monitorValue);
                                        }
                                        lists.push(list);
                                    }
                                }
                            }
                            //去重排序
                            var xtime=[];
                            for(var i=0;i<xtimes.length;i++){
                                if(xtime.indexOf(xtimes[i])==-1){
                                    xtime.push(ECS.util.DateTimeRendesr(xtimes[i]));
                                    xtime.sort();
                                }
                            }
                            //排序  y轴 刻度
                            var ynums=[];
                            for(var j=0;j<result.factorEntitys.length;j++){
                                ynums.push(result.factorEntitys[j].monitorLvl);
                            }
                            for(var i=0;i<ynums.length;i++){
                                for(var j=0;j<result.factorEntitys.length;j++){
                                    if(ynums[i]==result.factorEntitys[j].monitorLvl){
                                        if(result.factorEntitys[j].lowLimit==result.factorEntitys[j].uppLimit){
                                            result.factorEntitys[j].inUpper="=";
                                            result.factorEntitys[j].inLower="=";
                                        }else{
                                            if(result.factorEntitys[j].inUpper==1){
                                                result.factorEntitys[j].inUpper="≤";
                                            }
                                            if(result.factorEntitys[j].inLower==1){
                                                result.factorEntitys[j].inLower="≤";
                                            }
                                            if(result.factorEntitys[j].inUpper==0){
                                                result.factorEntitys[j].inUpper="＜";
                                            }
                                            if(result.factorEntitys[j].inLower==0){
                                                result.factorEntitys[j].inLower="＜";
                                            }
                                            if(result.factorEntitys[j].uppLimit=="999999.999999"){
                                                result.factorEntitys[j].uppLimit="";
                                                result.factorEntitys[j].inUpper="";
                                            }
                                            if(result.factorEntitys[j].lowLimit=="-999999.999999"){
                                                result.factorEntitys[j].inLower="";
                                                result.factorEntitys[j].lowLimit="";
                                            }
                                        }
                                        if(result.factorEntitys[j].uppLimit=="999999.999999"){
                                            ynum.push(ynums[i]+": "+result.factorEntitys[j].lowLimit+result.factorEntitys[j].inLower+"值");
                                        }else if(result.factorEntitys[j].lowLimit=="-999999.999999"){
                                            ynum.push(ynums[i]+": "+"值"+result.factorEntitys[j].inUpper+result.factorEntitys[j].uppLimit);
                                        }else{
                                            ynum.push(ynums[i]+": "+result.factorEntitys[j].lowLimit+result.factorEntitys[j].inLower+"值"+result.factorEntitys[j].inUpper+result.factorEntitys[j].uppLimit);
                                        }
                                    }
                                }
                            }
                            myChart.setOption({
                                xAxis: {
                                    data: xtime
                                },
                                yAxis:{
                                    data:ynum
                                },
                                series: [{
                                    data:lists
                                }]
                            });
                        }
                    },
                    error : function(errorMsg) {
                        ECS.hideLoading();
                        layer.msg("图表请求数据失败!");
                    }
                })

            },
            //关闭弹出层
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});
