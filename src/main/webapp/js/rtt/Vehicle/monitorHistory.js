
var historyUrl = ECS.api.rttUrl + '/vehicle/getVehicleMalfunction';
var systemNameUrl = ECS.api.rttUrl + '/vehicle/getSystemName';
var leLevelUrl = ECS.api.rttUrl + '/vehicle/getVehicleLevel';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.logic.initPage();
            this.bindUI();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            $('#btnReset').click(function () {
                page.logic.reset();
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
        },
        data: {
            param: {

            }
        },
        logic: {
            initPage: function () {
             
                ECS.util.bindCmb({
                    ctrId: 'systemId',
                    url: systemNameUrl,
                    idField: 'id',
                    textField: 'name'
                });

                ECS.util.bindCmb({
                    ctrId: 'priority',
                    url: leLevelUrl,
                    idField: 'key',
                    textField: 'value'
                });
            },
            setData: function (data) {
                $('#title-main').text(data.title);
                mini.get('vehicleId').setValue(data.id);
                mini.get('vehicleName').setValue(data.vehicleName);
                page.logic.search();
            },
            search: function () {
                var grid = mini.get('datagrid');
                grid.set({
                    url: historyUrl,
                    ajaxType: 'GET'
                });
                var form = new mini.Form('searchForm');
                var data = form.getData();
                data.startTime = mini.formatDate(data.startTime, 'yyyy-MM-dd');
                data.endTime = mini.formatDate(data.endTime, 'yyyy-MM-dd');
                grid.load(data);
            },
            reset: function () {
                mini.get('systemId').setValue('');
                mini.get('priority').setValue('');
                mini.get('relevantModuleCh').setValue('');
                mini.get('startTime').setValue('');
                mini.get('endTime').setValue('');
            },
            render_picPath:function(){
                return '<a title="图片">图片</a>';
            },
            closeLayer: function (isRefresh) {
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})