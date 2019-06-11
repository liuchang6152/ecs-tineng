var teamUrl = ECS.api.rttUrl + '/team/getAllSquadron';
var bindTeamUrl = ECS.api.rttUrl + '/team/updateSquadron';

$(function () {
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            this.logic.initPage();
        },
        bindUI: function () {
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
        },
        data: { param: {} },
        logic: {
            initPage: function () {

            },
            loadTeam: function (dutyGrade) {
                $.ajax({
                    url: teamUrl + '?drtDeptId=' + page.data.param.orgId + '&dutyGrade=' + dutyGrade,
                    type: "GET",
                    success: function (data) {
                        mini.get('team').setData(data);
                        mini.get('team').setValue(page.data.param.bindTeamIds);
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            setData: function (data) {
                $('#title-main').text(data.title);
                page.data.param.orgId = data.orgId;
                page.data.param.dutyGrade = data.dutyGrade;
                page.data.param.bindTeamIds = data.bindTeamIds;
                page.logic.loadTeam(data.dutyGrade);
            },
            save: function () {
                var data = {
                    drtDeptId: page.data.param.orgId,
                    teamIds: mini.get('team').getValue().split(',')
                };
                if (page.data.param.dutyGrade == 0) {
                    data.dutyGrade = 0;
                }
                else if (page.data.param.dutyGrade == 1) {
                    data.dutyGrade = 1;
                }
                $.ajax({
                    url: bindTeamUrl,
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        if(data.isSuccess){                    
                            if (page.data.param.dutyGrade == 0) {
                                parent.page.logic.loadDuty(page.data.param.orgId);
                            }
                            else if (page.data.param.dutyGrade == 1) {
                                parent.page.logic.loadJoin(page.data.param.orgId);
                            }
                            page.logic.closeLayer();
                        }
                        else{
                            layer.msg(data.message);
                        }
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            },
            closeLayer: function () {
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});