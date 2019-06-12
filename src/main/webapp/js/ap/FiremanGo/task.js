var vm = new Vue({
    el: '.box',
    data: {
        taskUrl: ECS.api.apUrl + '/policeProcess/taskSheet',
        taskConfirmUrl: ECS.api.apWebSocket + '/policeProcess/taskSheetConfirm',
        teamName: '',
        mobileOrPhone: '',
        userName: '',
        initTime: '',
        eventAddress: '',
        eventSummary: '',
        fireSubstanceName: '',
        fireLvlName: '',
        isExplodeName: '',
        isPersonInName: '',
        registerTime: '',
        commandTime: '',
        vehicleFullPeoples: '',
        vehicleNumbers: '',
        vehicleNames: '',
        alarmNames: '',
        firemanGoCode: '',
        printingTime: '',
        accidentTypeName: '',
        firemanGoBatch: '',
        eventId: '',
        teamId: '',
        detachmentId: ''
    },
    mounted: function () {
        this.initData();
    },
    methods: {
        initData: function () {
            var eventId = this.getQueryString('eventId');
            var teamId = this.getQueryString('teamId');
            var firemanGoBatch = this.getQueryString('batchId');
            var readonly = this.getQueryString('readonly');
            var self = this;
            $.ajax({
                url: this.taskUrl,
                data: { 'eventId': eventId, 'teamID': teamId, 'firemanGoBatch': firemanGoBatch },
                type: "GET",
                success: function (data) {
                    vm.teamName = data.teamName + '任务单';
                    vm.mobileOrPhone = data.mobileOrPhone;
                    vm.userName = data.userName;
                    vm.initTime = ECS.util.timestampToHour(data.initTime);
                    vm.eventAddress = data.eventAddress;
                    vm.eventSummary = data.eventSummary;
                    vm.fireSubstanceName = data.fireSubstanceName;
                    vm.fireLvlName = data.fireLvlName;
                    vm.isExplodeName = data.isExplodeName;
                    vm.isPersonInName = data.isPersonInName;
                    vm.registerTime = ECS.util.timestampToHour(data.registerTime);
                    vm.commandTime = ECS.util.timestampToHour(data.commandTime);
                    vm.vehicleFullPeoples = data.vehicleFullPeoples;
                    vm.vehicleNumbers = data.vehicleNumbers;
                    vm.vehicleNames = data.vehicleNames;
                    vm.alarmNames = data.alarmNames;
                    vm.firemanGoCode = data.firemanGoCode;
                    vm.printingTime = ECS.util.timestampToHour(data.printingTime);
                    vm.accidentTypeName = data.accidentTypeName;
                    vm.firemanGoBatch = data.firemanGoBatch;
                    vm.eventId = eventId;
                    vm.teamId = teamId;
                    vm.detachmentId = self.getQueryString('detachmentId');

                    if (!readonly) {
                        self.$nextTick(function () {
                            var myDoc = {
                                documents: document,
                                copyrights: '杰创软件拥有版权  www.jatools.com'
                            };
                            var jcp = getJCP();
                            jcp.print(myDoc, false);
                        })
                    } else {
                        $("#btnSave").hide();
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            })
        },
        save: function () {
            var self = this;
            ECS.util.addOrEdit({
                url: this.taskConfirmUrl,
                pageMode: PageModelEnum.Edit,
                data: {
                    eventID: vm.eventId,
                    teamID: vm.teamId,
                    firemanGoBatch: vm.firemanGoBatch,
                    sendTeamId: vm.detachmentId
                }
            }, function (result) {
                ECS.hideLoading();
                result = $.parseJSON(result);
                if (result.isSuccess) {
                    parent.sendFeedback(self.getQueryString('detachmentIP'),'');
                    self.closeLayer();
                } else {
                    layer.msg(result.message);
                }
            });
        },
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURI(r[2]);
            return null;
        },
        closeLayer: function () {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        }
    }
});