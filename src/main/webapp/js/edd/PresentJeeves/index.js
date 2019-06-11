var exportUrl = ECS.api.eddUrl +'/EDDPresentJeeves/ExportToExcel';   //导出
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        presentJeevesUrl: ECS.api.eddUrl + '/EDDPresentJeeves',
        typeUrl: ECS.api.rttUrl + '/vehicle/vehicleTypeList',
        typeData: [],
        //页面初始化
        init: function () {
            mini.parse();
            page.bindUI();
            page.logic.initType();
            page.logic.search();
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            $('#btnAdd').click(function () {
                page.logic.add();
            });
            $('#btnDel').click(function () {
                page.logic.del();
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            $('#btnReset').click(function () {
                page.logic.reset();
            });
             // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                var form = new mini.Form('searchForm');
                var data = form.getData();
                if (data.startDate > data.endDate) {
                    layer.msg('开始时间不能大于结束时间');
                    return;
                }
        
            
                data.startDate = mini.formatDate(data.startDate, 'yyyy-MM-dd');
                data.endDate = mini.formatDate(data.endDate, 'yyyy-MM-dd');
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
              
            });
        },
        data: {
            param: {
            }
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
            initType: function () {
                $.ajax({
                    async: false,
                    url: page.typeUrl,
                    type: "get",
                    success: function (data) {
                        page.typeData = data;
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
                page.typeData.insert(0, { "key": -1, "value": "请选择" });
                mini.get('mtrlType').setData(page.typeData);
                mini.get('mtrlType').select(0);
            },
            search: function () {
                var form = new mini.Form('searchForm');
                var data = form.getData();
                if (data.startDate > data.endDate) {
                    layer.msg('开始时间不能大于结束时间');
                    return;
                }
                var grid = mini.get('datagrid');
                grid.set({
                    url: page.presentJeevesUrl,
                    ajaxType: 'get',
                    dataField: 'pageList'
                });
                data.startDate = mini.formatDate(data.startDate, 'yyyy-MM-dd');
                data.endDate = mini.formatDate(data.endDate, 'yyyy-MM-dd');
                grid.load(data);
            },
            add: function () {
                ECS.util.detail({
                    url: 'addOrEdit.html',
                    data: {
                        title: '新增占道维护',
                        pageMode: PageModelEnum.NewAdd,
                        typeData: page.typeData
                    }
                });
            },
            edit: function (uid) {
                var row = mini.get('datagrid').getRowByUid(uid);
                ECS.util.detail({
                    url: 'addOrEdit.html',
                    data: {
                        title: '编辑占道维护',
                        pageMode: PageModelEnum.Edit,
                        typeData: page.typeData,
                        id: row.presentJeevesId
                    }
                });
            },
            del: function () {
                ECS.util.del({
                    url: page.presentJeevesUrl,
                    grid: mini.get('datagrid'),
                    idField: 'presentJeevesId'
                });
            },
            reset: function () {
                mini.get('startDate').setValue('');
                mini.get('endDate').setValue('');
                mini.get('mtrlType').select(0);
            },
            renderer_mtrlType: function (e) {
                var data = page.typeData;
                return ECS.util.renderer(e, data);
            },
            
			imp: function () {
                var impUrl = ECS.api.eddUrl +'/EDDPresentJeeves/importExcel'; 
                var exportUrl =  ECS.api.eddUrl +'/EDDPresentJeeves/ExportExcel'; 
                var confirmUrl =  ECS.api.eddUrl +'/EDDPresentJeeves/importAddAll'; 
				var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
			}
        }
    };
    page.init();
    window.page = page;
});