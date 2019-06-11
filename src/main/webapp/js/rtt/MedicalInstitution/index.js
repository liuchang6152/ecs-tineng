var madicalUrl = ECS.api.rttUrl + '/medicalInstitutio';
var madicalTypeUrl = ECS.api.rttUrl + '/medicalInstitutio/getAllMediInstitutionType';
//是否启用
var inUseUrl = ECS.api.commonUrl + "/getInUse";

$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.logic.initPage();
            page.logic.search();
            this.bindUI();
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
        },
        data: {
            param: {}
        },
        logic: {
            initPage: function () {
                ECS.util.bindCmb({
                    ctrId: 'typeID',
                    url: madicalTypeUrl,
                    idField: 'typeID',
                    textField: 'typeName'
                });

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
                    url: madicalUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                var form = new mini.Form('searchForm');
                var data = form.getData();
                grid.load(data);
            },
            add: function () {
                ECS.util.detail({
                    url: 'addOrEdit.html',
                    height: 500,
                    data: {
                        title: '新增医疗机构',
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
                        title: '编辑医疗机构',
                        pageMode: PageModelEnum.Edit,
                        id: row.institutionId
                    }
                });
            },
            del: function () {
                ECS.util.del({
                    url: madicalUrl,
                    grid: mini.get('datagrid'),
                    idField: 'institutionId',
                    delArrKey: 'institutionIds'
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
            }
        }
    };
    page.init();
    window.page = page;
});