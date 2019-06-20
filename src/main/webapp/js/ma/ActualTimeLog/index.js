var searchUrl = ECS.api.maUrl + "/alertsLog"; //查询、列表初始化
var riskAreaTypeNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业
var drtDeptCodeUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=3&isAll=true'; //二级单位
var riskAreaName_url = ECS.api.maUrl + '/alertsLog/getListByParam?param=RISK_AREA_NAME'; //安全风险区
var optlRiskZoneName_url = ECS.api.maUrl + '/alertsLog/getListByParam?param=OPTL_RISK_ZONE_NAME'; //作业风险区
var riskAnlsobjName_url = ECS.api.maUrl + '/alertsLog/getListByParam?param=RISK_ANLS_OBJ_NAME'; //风险分析对象
var rapName_url = ECS.api.maUrl + '/alertsLog/getListByParam?param=RAP_NAME'; //风险分析点
var siteName_url = ECS.api.maUrl + '/alertsLog/getListByParam?param=SITE_NAME'; //实时监测点
var direction_url = ECS.api.maUrl + '/alertsLog/getLogDirectionEnumList'; //检测值方向
var inUseUrl = ECS.api.commonUrl + "/getInUse"; //是否消防
var exportUrl = ECS.api.maUrl + '/alertsLog/ExportToExcel'; //导出
window.pageLoadMode = PageLoadMode.None;
var flag = false;
//联动需要的参数
var enterpriseLink = ""; //企业名称
var deptLink = ""; //二级单位名称
var riskAreaLink = ""; //安全风险区名称
var optlRiskZoneLink = ""; //作业风险区名称
var riskAnlsObjLink = ""; //风险分析对象名称
var rapLink = ""; //风险分析点名称
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();
            ECS.sys.RefreshContextFromSYS();
            this.bindUI();
            $("#searchForms").find('input').val("");
            page.logic.initTable(); //表格
            page.logic.cbxDrtDept(); //企业名称
            page.logic.cbxDrtDeptCode(); //二级单位
            page.logic.cbxRiskAreaName(); //安全风险区
            page.logic.cbxOptlRiskZoneName(); //作业风险区
            page.logic.cbxRiskAnlsobjName(); //风险分析对象
            page.logic.cbxRapName(); //风险分析点
            page.logic.cbxSiteName(); //实时监测点
            page.logic.initLogDirection(); //检测值方向
            page.logic.initInFire(); //是否消防
            page.logic.search(""); //搜索
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //初始化时时间范围为当前日期前三个月（测试临时修改为一天）
            var now = new Date();
            var endTime = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            var beginTime = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
            // var beginTime = now.getFullYear() + "-" +((now.getMonth()-2)<10?"0":"")+(now.getMonth()-2)+"-"+(now.getDate()<10?"0":"")+now.getDate();
            mini.get("alertsLogStartTime").setValue(beginTime);
            mini.get("alertsLogEndTime").setValue(endTime);
            //搜索框中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //展示收缩
            $('#btnToggle').click(function () {
                if (flag) {
                    flag = !flag;
                    $(this).html('<i class="icon-showMore"></i>');
                    $(".search-unfixed").hide();
                } else {
                    flag = !flag;
                    $(this).html('<i class="icon-hideMore"></i>');
                    $(".search-unfixed").show();
                }
            });
            //查询
            $("#btnQuery").click(function () {
                page.logic.search();
            });
            //开始时间
            mini.get("alertsLogStartTime").on("valuechanged", function () {
                var beginDate = new Date($("input[name=alertsLogStartTime]").val().replace(/\-/g, "\/"));
                var endDate = new Date($("input[name=alertsLogEndTime]").val().replace(/\-/g, "\/"));
                if (beginDate > endDate) {
                    mini.get("alertsLogStartTime").setValue(beginTime);
                    layer.msg("开始束时间需早于结束时间！");
                    return false;
                }
            });
            //结束时间
            mini.get("alertsLogEndTime").on("valuechanged", function () {
                var beginDate = new Date($("input[name=alertsLogStartTime]").val().replace(/\-/g, "\/"));
                var endDate = new Date($("input[name=alertsLogEndTime]").val().replace(/\-/g, "\/"));
                if (beginDate > endDate) {
                    mini.get("alertsLogEndTime").setValue(endTime);
                    layer.msg("结束时间需晚于开始时间！");
                    return false;
                }
            });
            //导出
            $("#btnExport").click(function () {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForms");
                page.data.param.alertsLogStartTime = mini.get("alertsLogStartTime").getFormValue();
                page.data.param.alertsLogEndTime = mini.get("alertsLogEndTime").getFormValue();
                if (page.data.param["isFireAlarm"] == "-1") {
                    page.data.param["isFireAlarm"] = "";
                }
                page.data.param["orgName"] = $("#orgName").find("option:selected").attr("values");
                page.data.param["orgNameLvl2"] = $("#orgNameLvl2").find("option:selected").attr("title");
                var urlParam = page.logic.setUrlK(page.data.param);

                window.open(exportUrl + "?" + urlParam);
            });
        },
        data: { //定义参数
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            setUrlK: function (ojson) {
                var s = '',
                    name, key;
                for (var p in ojson) {
                    // if(!ojson[p]) {return null;} 
                    if (ojson.hasOwnProperty(p)) {
                        name = p
                    };
                    key = ojson[p];
                    s += "&" + name + "=" + encodeURIComponent(key);
                };
                return s.substring(1, s.length);
            },
            //初始化表格
            initTable: function () {
                mini.parse();
                grid = mini.get("datagrid");
                grid.set({
                    url: searchUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
            },
            show_details: function (e) {
                return '<a title="查看相关数据" href="javascript:window.page.logic.edit(' + e.row.alertsLogID + ')">查看相关数据</a>';
            },
            edit: function (alertsLogID) {
                var pageMode = PageModelEnum.Edit;
                var title = "报警日志相关数据";
                page.logic.detail(title, alertsLogID, pageMode);
            },
            detail: function (title, alertsLogID, pageMode, orgId) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['850px', '500px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'ActualTimeLogInfo.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "alertsLogID": alertsLogID,
                            'title': title,
                            "orgId": orgId
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if (window.pageLoadMode == PageLoadMode.Refresh) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        } else if (window.pageLoadMode == PageLoadMode.Reload) {
                            page.logic.search(true);
                            window.pageLoadMode = PageLoadMode.None;
                        }
                    }
                })
            },
            //不可选择之前的日期
            onDrawDate: function (e) {
                var date = e.date;
                var d = new Date();
                if (date > d) {
                    e.allowSelect = false;
                }
            },
            //企业名称
            cbxDrtDept: function () {
                if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
                    $("#orgName").attr("disabled", false);
                    ECS.ui.getCombobox("orgName", riskAreaTypeNameUrl, {
                        selectFirstRecord: true,
                        keyField: "orgCode",
                        codeField: "orgId",
                        valueField: "orgSname",
                        valueSField: "orgSname",
                        async: false
                    }, null, page.logic.cbxDrtDeptCode);
                } else {
                    $("#orgName").attr("disabled", true);
                    ECS.ui.getCombobox("orgName", riskAreaTypeNameUrl, {
                        selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
                        keyField: "orgCode",
                        codeField: "orgId",
                        valueField: "orgSname",
                        valueSField: "orgSname",
                        async: false
                    }, null, page.logic.cbxDrtDeptCode);
                }
            },
            //二级单位
            cbxDrtDeptCode: function () {
                $("#riskAreaName").attr("disabled", true);
                $("#riskAreaName option:first").prop("selected", 'selected');
                $("#optlRiskZoneName").attr("disabled", true);
                $("#optlRiskZoneName option:first").prop("selected", 'selected');
                $("#riskAnlsobjName").attr("disabled", true);
                $("#riskAnlsobjName option:first").prop("selected", 'selected');
                $("#rapName").attr("disabled", true);
                $("#rapName option:first").prop("selected", 'selected');
                $("#siteName").attr("disabled", true);
                $("#siteName option:first").prop("selected", 'selected');
                deptLink = $("#orgNameLvl2").find("option:selected").text();
                var pid = $("#orgName").find("option:selected").attr("code"); //获取的是id
                enterpriseLink = $("#orgName").find("option:selected").text(); //企业名称
                if (pid == "-1") {
                    pid = "";
                }
                ECS.ui.getCombobox("orgNameLvl2", drtDeptCodeUrl, {
                    selectValue: "-1",
                    keyField: "orgId",
                    valueField: "orgSname",
                    async: false,
                    data: {
                        'orgPID': pid
                    }
                }, null, page.logic.cbxRiskAreaName);
            },
            //安全风险区
            cbxRiskAreaName: function () {
                //禁用下拉框并默认选中全部
                $("#optlRiskZoneName").attr("disabled", true);
                $("#optlRiskZoneName option:first").prop("selected", 'selected');
                $("#riskAnlsobjName").attr("disabled", true);
                $("#riskAnlsobjName option:first").prop("selected", 'selected');
                $("#rapName").attr("disabled", true);
                $("#rapName option:first").prop("selected", 'selected');
                $("#siteName").attr("disabled", true);
                $("#siteName option:first").prop("selected", 'selected');
                deptLink = $("#orgNameLvl2").find("option:selected").text();
                if (deptLink == "全部") {
                    $("#riskAreaName").attr("disabled", true);
                } else {
                    $("#riskAreaName").attr("disabled", false);
                }
                ECS.ui.getCombobox("riskAreaName", riskAreaName_url, {
                    selectValue: "全部",
                    keyField: "RISK_AREA_NAME",
                    valueField: "RISK_AREA_NAME",
                    async: false,
                    data: {
                        'enterprise': enterpriseLink,
                        'dept': deptLink,
                        'isAll': true
                    }
                }, null, page.logic.cbxOptlRiskZoneName);
            },
            //作业风险区
            cbxOptlRiskZoneName: function () {
                $("#riskAnlsobjName").attr("disabled", true);
                $("#riskAnlsobjName option:first").prop("selected", 'selected');
                $("#rapName").attr("disabled", true);
                $("#rapName option:first").prop("selected", 'selected');
                $("#siteName").attr("disabled", true);
                $("#siteName option:first").prop("selected", 'selected');
                riskAreaLink = $("#riskAreaName").find("option:selected").text();
                if (riskAreaLink == "全部") {
                    $("#optlRiskZoneName").attr("disabled", true);
                } else {
                    $("#optlRiskZoneName").attr("disabled", false);
                }
                ECS.ui.getCombobox("optlRiskZoneName", optlRiskZoneName_url, {
                    selectValue: "全部",
                    keyField: "OPTL_RISK_ZONE_NAME",
                    valueField: "OPTL_RISK_ZONE_NAME",
                    async: false,
                    data: {
                        'enterprise': enterpriseLink,
                        'dept': deptLink,
                        'riskArea': riskAreaLink,
                        'isAll': true
                    }
                }, null, page.logic.cbxRiskAnlsobjName);
            },
            //风险分析对象
            cbxRiskAnlsobjName: function () {
                $("#rapName").attr("disabled", true);
                $("#rapName option:first").prop("selected", 'selected');
                $("#siteName").attr("disabled", true);
                $("#siteName option:first").prop("selected", 'selected');
                optlRiskZoneLink = $("#optlRiskZoneName").find("option:selected").text();
                if (optlRiskZoneLink == "全部") {
                    $("#riskAnlsobjName").attr("disabled", true);
                } else {
                    $("#riskAnlsobjName").attr("disabled", false);
                }
                ECS.ui.getCombobox("riskAnlsobjName", riskAnlsobjName_url, {
                    selectValue: "全部",
                    keyField: "RISK_ANLS_OBJ_NAME",
                    valueField: "RISK_ANLS_OBJ_NAME",
                    async: false,
                    data: {
                        'enterprise': enterpriseLink,
                        'dept': deptLink,
                        'riskArea': riskAreaLink,
                        'optlRiskZone': optlRiskZoneLink,
                        'isAll': true
                    }
                }, null, page.logic.cbxRapName);
            },
            //风险分析点
            cbxRapName: function () {
                $("#siteName").attr("disabled", true);
                $("#siteName option:first").prop("selected", 'selected');
                riskAnlsObjLink = $("#riskAnlsobjName").find("option:selected").text();
                if (riskAnlsObjLink == "全部") {
                    $("#rapName").attr("disabled", true);
                } else {
                    $("#rapName").attr("disabled", false);
                }
                ECS.ui.getCombobox("rapName", rapName_url, {
                    selectValue: "全部",
                    keyField: "RAP_NAME",
                    valueField: "RAP_NAME",
                    async: false,
                    data: {
                        'enterprise': enterpriseLink,
                        'dept': deptLink,
                        'riskArea': riskAreaLink,
                        'optlRiskZone': optlRiskZoneLink,
                        'riskAnlsObj': riskAnlsObjLink,
                        'isAll': true
                    }
                }, null, page.logic.cbxSiteName);
            },
            //实时监测点
            cbxSiteName: function () {
                rapLink = $("#rapName").find("option:selected").text();
                if (rapLink == "全部") {
                    $("#siteName").attr("disabled", true);
                } else {
                    $("#siteName").attr("disabled", false);
                }
                ECS.ui.getCombobox("siteName", siteName_url, {
                    selectValue: "全部",
                    keyField: "SITE_NAME",
                    valueField: "SITE_NAME",
                    data: {
                        'enterprise': enterpriseLink,
                        'dept': deptLink,
                        'riskArea': riskAreaLink,
                        'optlRiskZone': optlRiskZoneLink,
                        'riskAnlsObj': riskAnlsObjLink,
                        'rap': rapLink,
                        'isAll': true
                    }
                });
            },
            //是否消防
            initInFire: function () {
                ECS.ui.getCombobox("isFireAlarm", inUseUrl, {
                    selectValue: -1,
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            //监测值方向
            initLogDirection: function () {
                ECS.ui.getCombobox("alertsLogDirection", direction_url, {
                    selectValue: "",
                    data: {
                        'isAll': true
                    }
                }, null);
            },
            //搜索
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForms");
                page.data.param.alertsLogStartTime = mini.get("alertsLogStartTime").getFormValue();
                page.data.param.alertsLogEndTime = mini.get("alertsLogEndTime").getFormValue();
                if (page.data.param["isFireAlarm"] == "-1") {
                    page.data.param["isFireAlarm"] = "";
                }
                // if (!ECS.util.timestampToTimes(mini.get("alertsLogStartTime").getValue())) {
                //     page.data.param['alertsLogStartTime'] = '';
                // }else{
                //     page.data.param['alertsLogStartTime'] = ECS.util.timestampToTimes(mini.get("alertsLogStartTime").getValue());
                // }
                // if (!ECS.util.timestampToTimes(mini.get("alertsLogEndTime").getValue())) {
                //     page.data.param['alertsLogEndTime'] = '';
                // }else{
                //     page.data.param['alertsLogEndTime'] = ECS.util.timestampToTimes(mini.get("alertsLogEndTime").getValue());
                // }


                page.data.param["orgName"] = $("#orgName").find("option:selected").attr("values");
                page.data.param["orgNameLvl2"] = $("#orgNameLvl2").find("option:selected").attr("title");
                if (page.data.param["isFireAlarm"] == "全部") {
                    page.data.param["isFireAlarm"] = "";
                }
                if (page.data.param["alertsLogMaxLvl"] == "全部") {
                    page.data.param["alertsLogMaxLvl"] = "";
                }
                if (page.data.param["alertsLogDirection"] == "全部") {
                    page.data.param["alertsLogDirection"] = "";
                }
                if (showSort) {
                    page.data.param["sortType"] = 1;
                }
                grid.load(page.data.param);
            }
        }
    };
    page.init();
    window.page = page;
});
