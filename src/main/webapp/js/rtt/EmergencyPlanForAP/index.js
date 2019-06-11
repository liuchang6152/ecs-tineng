var searchTypeUrl = ECS.api.apUrl + '/event/getconfimPlanDefinition'; //预案类型
var smallTypeUrl = ECS.api.apUrl + '/event/getAccidentCategory'; //事故小类
var searchUrl = ECS.api.apUrl + '/event/getEmergencyPlanByCondition'; //查询、列表初始化
var exportUrl = ECS.api.apUrl + '/event/ExportToExcel';   //导出
var dept_url = ECS.api.rttUrl + '/msds/secunit';         //企业、二级单位
var riskType_url = ECS.api.apUrl + '/event/getRiskArea';  //安全风险区类型
var OptRisk_url = ECS.api.apUrl + '/event/getOptRisk';  //作业风险区类型
var RiskAnlsObj_url = ECS.api.apUrl + '/event/getRiskAnlsObj';  //安全风险区类型

var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";    //企业节点编码；
var drtDeptCode = "";       //二级单位节点编码；
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                      //初始化miniui框架
            this.bindUI();                     //绑定事件
            page.logic.loadType();

            //  page.logic.initDept();
            $("#searchForm")[0].reset();      //初始化查询条件
            page.logic.initTable();            //初始化表格
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //搜索栏中input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
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
            // 新增
            $('#btnAdd').click(function () {
                var param = ECS.form.getData("searchForm");
                if(!param.riskAreaId){
                    param.riskAreaId = "";
                }
                if(!param.optlRiskZoneId){
                    param.optlRiskZoneId = "";
                }
                if(!param.riskAnlsObjId){
                    param.riskAnlsObjId = "";
                }
                var urlParam = page.logic.setUrlK(param);

                window.open(exportUrl + "?" + urlParam);
            });

            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });

            // 二级单位取值；
            $("#drtDeptCode").change(function (e) {
                page.logic.drtDeptCodeChange($("#drtDeptCode").val());
            });
            //当“安全风险区板块”的值发生改变的时候，加载“安全风险区分类”的数据；

            $("#riskAreaId").change(function (e) {
                page.logic.riskAreaIdChange($("#riskAreaId").val());
            });

            $("#optlRiskZoneId").change(function (e) {
                page.logic.optlRiskZoneIdChange($("#optlRiskZoneId").val());
            });

        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {

            setUrlK: function (ojson) {

                var s = '', name, key;

                for (var p in ojson) {

                    // if(!ojson[p]) {return null;} 

                    if (ojson.hasOwnProperty(p)) { name = p };

                    key = ojson[p];

                    s += "&" + name + "=" + encodeURIComponent(key);

                };

                return s.substring(1, s.length);

            },
            show_Detail: function (e) {
                return '<a href="' + ECS.api.bcUrl + '/attachment/downloadFile?atchPath=' + e.row.acthPath + '&atchName=' + e.row.acthName + '">' + e.value + '</a>';

            },
            loadType: function (enterpriseCode) {
                ECS.ui.getComboSelects(searchTypeUrl, "planDefinition", "id", "name", false);
                ECS.ui.getComboSelects(smallTypeUrl, "smallIds", "accidentTypeID", "accidentTypeName", false);
                ECS.ui.getComboSelects(dept_url, "drtDeptCode", "id", "name", false);
            },
            /**
             * 初始化表格
             */
            initTable: function () {
                page.logic.search();
            },

            /**
             * 搜索
             */
            search: function (showSort) {
                page.data.param = ECS.form.getData("searchForm");
                grid = mini.get("datagrid");
                grid.set({
                    url: searchUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                grid.load(page.data.param);
              
            },


            /**
             * 车间
             */
            drtDeptCodeChange: function (id) {
                ECS.ui.getComboSelects(riskType_url + "?drtDeptId=" + id, "riskAreaId", "riskAreaId", "riskAreaName", false);
            },
            /**
          * 装置
          */
            riskAreaIdChange: function (id) {
                ECS.ui.getComboSelects(OptRisk_url + "?riskAreaId=" + id, "optlRiskZoneId", "optRiskId", "optRiskName", false);
            },
            /**
          * 设备
          */
            optlRiskZoneIdChange: function (id) {
                ECS.ui.getComboSelects(RiskAnlsObj_url + "?optRiskId=" + id, "riskAnlsObjId", "optAnlsObjId", "optAnlsObjName", false);
            }

        }
    };
    page.init();
    window.page = page;
});