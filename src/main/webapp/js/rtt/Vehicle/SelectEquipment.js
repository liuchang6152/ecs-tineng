var searchTypeUrl = ECS.api.apUrl + '/event/getconfimPlanDefinition'; //预案类型
var smallTypeUrl = ECS.api.apUrl + '/event/getAccidentCategory'; //事故小类
var searchUrl = ECS.api.rttUrl + '/emergencyEquipment'; //查询、列表初始化
var exportUrl = ECS.api.rttUrl + '/emergencyEquipment/ExportToExcel';   //导出
var dept_url = ECS.api.apUrl + '/event/getSecunit';         //企业、二级单位
var riskType_url = ECS.api.apUrl + '/event/getRiskArea';  //安全风险区类型
var OptRisk_url = ECS.api.apUrl + '/event/getOptRisk';  //作业风险区类型
var RiskAnlsObj_url = ECS.api.apUrl + '/event/getRiskAnlsObj';  //安全风险区类型
var delUrl = ECS.api.rttUrl + '/emergencyEquipment'; //删除
var Enterprise_url = ECS.api.rttUrl +'/expert/getExpertTypeEnumList';                //企业内/外
var inUseUrl = ECS.api.commonUrl + "/getInUse";//是否启用
var bigUrl = ECS.api.bcUrl + '/busiBgCateg/getListByModelID?businessModelId=32'; //大类
var mUrl = ECS.api.bcUrl + '/busiBgCateg/getListByBgCode'; //中类
var stockpilePointTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getStoreTypeEnumList'; //   存放点类型
var stockpileTypeUrl = ECS.api.rttUrl + '/mtrlStorage/getRepoTypeEnumList'; //存储库类型
var grid = null;   //全局变量
var flag = false;
var enterpriseCode = "";    //企业节点编码；
var drtDeptCode = "";       //二级单位节点编码；
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
	var page = {
		//页面初始化
		init: function () {
			mini.parse();                      //初始化miniui框架
			this.bindUI();                     //绑定事件
			page.logic.loadType();
			$("#searchForm")[0].reset();      //初始化查询条件
			page.logic.initTable();            //初始化表格
		},
		table: {},
		//绑定事件和逻辑
		bindUI: function () {
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

			$(".btnClose").click(function () {
				window.pageLoadMode = PageLoadMode.None;
				page.logic.closeLayer(false);
            });
            
            //保存
			$("#btnSave").click(function() {
				page.logic.save();
            });
            

			//搜索栏中input不允许输入空格
			$('input').blur(function () {
				$(this).val($.trim($(this).val()))
			});
		
			//查询
			$('#btnQuery').click(function () {
				page.logic.search();
			});
		
			$("#businessBgCategID").change(function(e){
					page.logic.loadmodelType($("#businessBgCategID").val());
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
		
			getEnterpriseType :function(){
				$("#equIpOwner").html('<option value="" selected="selected">可输入</option>');
				var datalist = [{"text":"队伍","id":1},{"text":"企业","id":2}];
				$('#equIpOwner').select2({
					tags: false,
					data: datalist,
					language: {
						noResults: function (params) {
							return "没有匹配项";
						}
					},
				});
			},
			loadType: function (enterpriseCode) {
				page.logic.getEnterpriseType();
				ECS.ui.getComboSelects(searchTypeUrl, "planDefinition", "id", "name", false);
				ECS.ui.getComboSelects(smallTypeUrl, "smallIds", "accidentTypeID", "accidentTypeName", false);
				ECS.ui.getComboSelects(dept_url,"enterpriseCode","drtDeptCode","drtDeptName",false);
				ECS.ui.getComboSelects(bigUrl,"businessBgCategID","businessBgCategCode","businessBgCategName",false);
				ECS.ui.getComboSelects(stockpilePointTypeUrl,"stockpilePointType","key","value",false);
				ECS.ui.getComboSelects(stockpileTypeUrl,"stockpileType","key","value",false);
				ECS.ui.getComboSelects('',"businessMdCategID","businessMdCategCode","businessMdCategName",false);
				ECS.ui.getCombobox("inUse", inUseUrl, {
                    selectValue: "-1",
                    data: {
                        'isAll': true
                    }
                }, null);
			},
			loadmodelType :function(value){
				ECS.ui.getComboSelects(mUrl+"?businessBgCategCode="+value,"businessMdCategID","businessMdCategCode","businessMdCategName",false);
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
			 * 保存
			 */
			save: function() {
				var selectRow  = mini.get("datagrid").getSelecteds();
                parent.ownDetail = selectRow;
                page.logic.closeLayer(true);
			},

		
		
			/**
			 * 关闭弹出层
			 */
			closeLayer: function (isRefresh) {
				window.parent.pageLoadMode = window.pageLoadMode;
				parent.layer.close(index);
			},
			

		}
	};
	page.init();
	window.page = page;
});