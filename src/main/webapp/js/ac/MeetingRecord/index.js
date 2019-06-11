var meetingRecordUrl = ECS.api.emUrl + '/meetingRecord';
var orgUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=1';
$(function () {
    var page = {
        init: function () {
            mini.parse();
            page.bindUI();
            page.logic.initOrg();
            page.logic.search();
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });
        },
        data: {
            param: {
            }
        },
        logic: {
            initOrg: function () {
                ECS.sys.RefreshContextFromSYS();
                $.ajax({
                    async:false,
                    url: orgUrl,
                    type: "GET",
                    success: function (data) {
                        mini.get('orgCode').loadList(data, "orgCode", "porgCode");
                        if (ECS.sys.Context.SYS_IS_HQ) {
                            mini.get('orgCode').setValue(data[0].orgCode);
                        } else {
                            enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                            mini.get("orgCode").disable();
                            for (var w = 0; w < data.length; w++) {
                                (function (cur_key) {
                                    if (cur_key.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE) {
                                        mini.get("orgCode").setValue(cur_key.orgCode);
                                    }
                                })(data[w]);
                            }
                        }
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
            },
            search: function () {
                var form = new mini.Form('searchForm');
                var data = form.getData();
                if (data.startTime > data.endTime) {
                    layer.msg('开始时间不能大于结束时间');
                    return;
                }
                var grid = mini.get("datagrid");
                grid.set({
                    url: meetingRecordUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                data.startTime = mini.formatDate(data.startTime, 'yyyy-MM-dd HH:mm:ss');
                data.endTime = mini.formatDate(data.endTime, 'yyyy-MM-dd HH:mm:ss');
                grid.load(data);
            },
            rendererOperate: function (e) {
                var id = e.record.meetingRecordId;
                var attachmentR = '<a href="javascript:ECS.util.renderUploader_Page(\'' 
                + mini.get('orgCode').getSelectedNode().orgCode
                + '\',\'' + e.row.meetingRecordId
                + '\',\'' + e.row.meetingTheme
                + '\',\'' + '17' 
                + '\',\'' + '音频会议附件上传' + '\')"><i class="icon-details edit mr__5"></i></a>'
                var operate = attachmentR + '<a href="javascript:window.page.logic.detail(' + id + ')"><i class="icon-edit edit"></i></a>';
                return operate;
            },
            detail: function (id) {
                ECS.util.detail({
                    url: 'detail.html',
                    height: 500,
                    data: {
                        title: '会议详情',
                        meetingRecordId: id,
                        pageMode: PageModelEnum.Details
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});