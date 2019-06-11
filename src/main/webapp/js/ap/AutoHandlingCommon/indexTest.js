//应急预案接口----------------：
var Category_url = ECS.api.bcUrl+"/accidentCategory/list";                                               //预案分类(事故大类)
var Category_url2 = ECS.api.bcUrl+"/accidentCategory/accidentType";                                     //预案类型（事故小类）
var riskRank_url=ECS.api.bcUrl+"/riskRank/getListRiskRank";                                             //预警等级
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";                                                //根据企业code获取企业id;
//处警页面接口----------------：
var getAlarmUrl = ECS.api.apUrl+"/AutomaticMonitoring";                         //获取报警信息
var saveAlarmUrl = ECS.api.apUrl+"/DisposeWarning";                              //保存报警信息
var getCaseUrl =  ECS.api.apUrl+"/DisposeWarning/RelatedPlan";                 //预案列表接口（已启动、未启动：【综合预案、专项预案、现场处置预案】）
var saveCaseUrl = ECS.api.apUrl+"/DisposeWarning/RelatedPlan";                 //“启动预案”点击 进行保存；
var dangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";                   //危化品加载；
var saveDangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";              //危化品保存
var delDangerUrl = ECS.api.apUrl+"/DisposeWarning/RelatedMSDS";               //危化品删除
var warnEndUrl = ECS.api.apUrl+"/DisposeWarning/complete";                    //报警事件结束
var InsertDangerUrl = ECS.api.apUrl+"/DisposeWarning/MSDS";                   //危化品--从工厂模型里取数据，插入表里
var InsertCaseUrl = ECS.api.apUrl+"/DisposeWarning/emergencyPlan";           //预案--从工厂模型里取数据，插入表里
var InsertAllUrl = ECS.api.apUrl+"/DisposeWarning/gis";                        //当地图发生改变时，插入预案和危化品的数据到表里去；
var FinishedUrl = ECS.api.apIpVerify+"/status";                //报警结束
var EventId = "";                                                 //报警事件id;
var IpAdress = "";                                                //机器ip地址
var grid = null;                                                    //grid表格对象
//与gis相关的层级范围的id;----------------------------
var enterpriseId = null;            /*企业ID*/
var drtDeptId = null;               /*二级单位ID*/
var riskAreaId = null;              /*安全风险区ID*/
var optlRiskSoneId = null;         /*作业风险区ID*/
var riskAnlsObjId = null;          /*风险分析对象ID*/
var pointId = null;                 /*风险分析点ID*/
var map_posi = null;                //全局变量，捕获地图页的位置
var mapchanged = false;             //地址是否改变，若改变，那么设置为true；若未改变，那么设置为false；
var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引

$(function () {
    var testLog="测试发布页面";
    console.log(testLog);
})