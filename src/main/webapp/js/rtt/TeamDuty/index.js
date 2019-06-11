var orgUrl = ECS.api.apUrl + '/event/getSecunit';
var dutyUrl = ECS.api.rttUrl + '/team/getTeamDuty?orgId=';
var joinUrl = ECS.api.rttUrl + '/team/getTeamJoint?orgId=';

$(function () {
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            page.logic.initPage();
        },
        table: {},
        bindUI: function () {
            $('#bindDuty').click(function () {
                page.logic.bindDuty();
            });
            $('#bindJoin').click(function () {
                page.logic.bindJoin();
            });
            mini.get("org").on("nodeclick", function (e) {
                var orgId = e.row[this.idField];
                page.logic.loadDuty(orgId);
                page.logic.loadJoin(orgId);
            });
        },
        data: {
            param: {}
        },
        logic: {
            initPage: function () {
                page.logic.loadOrg();
            },
            loadOrg: function () {
                $.ajax({
                    url: orgUrl,
                    type: "GET",
                    success: function (data) {
                        mini.get('org').loadData(data);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            loadDuty: function (orgId) {
                ECS.showLoading();
                $.ajax({
                    url: dutyUrl + orgId,
                    type: "GET",
                    success: function (data) {
                        mini.get('dutyTeam').loadData(data);
                        ECS.hideLoading();
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            loadJoin: function (orgId) {
                ECS.showLoading();
                $.ajax({
                    url: joinUrl + orgId,
                    type: "GET",
                    success: function (data) {
                        mini.get('joinTeam').loadData(data);
                        ECS.hideLoading();
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            bindDuty: function () {
                var node = mini.get('org').getSelectedNode();
                if (node == null || node == undefined) {
                    layer.msg('请选择需要绑定的二级机构');
                    return;
                }
                ECS.util.detail({
                    url: 'team.html',
                    data: {
                        title: '绑定责任队',
                        orgId: node.drtDeptId,
                        dutyGrade: 0,
                        bindTeamIds: page.logic.getbindTeamIds('dutyTeam')
                    }
                });
            },
            bindJoin: function () {
                var node = mini.get('org').getSelectedNode();
                if (node == null || node == undefined) {
                    layer.msg('请选择需要绑定的二级机构');
                    return;
                }
                ECS.util.detail({
                    url: 'team.html',
                    data: {
                        title: '绑定联防队',
                        orgId: node.drtDeptId,
                        dutyGrade: 1,
                        bindTeamIds: page.logic.getbindTeamIds('joinTeam')
                    }
                });
            },
            getbindTeamIds: function (ctrId) {
                var res = '';
                var data = mini.get(ctrId).getData();
                for (var i = 0, len = data.length; i < len; i++) {
                    res += data[i].teamID + ',';
                }
                res = res.substring(0, res.length - 1);
                return res;
            }
        }
    };
    page.init();
    window.page = page;
});