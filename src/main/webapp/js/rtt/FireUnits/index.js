var fireUnitsUrl = ECS.api.rttUrl + '/relatedFireUnits';
var exportUrl = ECS.api.rttUrl + '/relatedFireUnits/ExportToExcel';  //导出
pageflag =true;
redisKey ='';
//是否启用
var inUseUrl = ECS.api.commonUrl + "/getInUse";

$(function () {
    var page = {
        init: function () {
            mini.parse();                   //初始化miniui框架
            page.logic.initPage();          //初始化表格
            page.logic.search();
            this.bindUI();                  //绑定事件
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                var inputValue = $.trim($(this).val());
                $(this).val(inputValue);
                mini.get(this.name).setValue(inputValue);
            });
            $('#btnAdd').click(function () {
                page.logic.add();
            });
            $('#btnDel').click(function () {
                page.logic.del();
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });

                 // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                var form = new mini.Form('searchForm');
                var data = form.getData();
                var urlParam = page.logic.setUrlK( page.data.param);

				window.open(exportUrl + "?" + urlParam);
              
            });
        },
        data: {
            param: {}
        },
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
            initPage: function () {
                ECS.util.bindCmb({
                    ctrId: 'inUse',
                    url: inUseUrl,
                    data: { isAll: true },
                    idField: 'key',
                    textField: 'value'
                }, function () {
                    mini.get('inUse').select(0);
                });
            },
            search: function () {
                var grid = mini.get("datagrid");
                grid.set({
                    url: fireUnitsUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                var form = new mini.Form('searchForm');
                var data = form.getData();
                grid.load(data);
            },
            reset: function () {
                var form = new mini.Form('searchForm');
                form.reset();
            },
            add: function () {
                ECS.util.detail({
                    url: 'addOrEdit.html',
                    height: 500,
                    data: {
                        title: '新增相关消防单位',
                        pageMode: PageModelEnum.NewAdd
                    }
                });
            },
            edit: function (uid) {
                var row = mini.get('datagrid').getRowByUid(uid);
                ECS.util.detail({
                    url: 'addOrEdit.html',
                    height: 500,
                    data: {
                        title: '编辑相关消防单位',
                        pageMode: PageModelEnum.Edit,
                        id: row.relatedFireUnitsId
                    }
                });
            },
            del: function () {
                ECS.util.del({
                    url: fireUnitsUrl,
                    grid: mini.get('datagrid'),
                    idField: 'relatedFireUnitsId',
                    delArrKey: 'relatedFireUnitsIds'
                }, function (result) {
                    result = $.parseJSON(result);
                    if (result.isSuccess) {
                        layer.msg('操作成功', {
                            time: 1000
                        }, function () {
                            page.logic.search();
                            page.logic.closeLayer(true);
                        });
                    } else {
                        layer.msg(result.message);
                    }
                });
            },
            rendererInUse: function (e) {
                return ECS.util.renderer(e, [{ key: 0, value: '否' }, { key: 1, value: '是' }]);
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/relatedFireUnits/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/relatedFireUnits/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/relatedFireUnits/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);

            }
        }
    };
    page.init();
    window.page = page;
});