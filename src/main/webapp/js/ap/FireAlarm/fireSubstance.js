var vm = new Vue({
    el: '.main-content__dialog',
    data: {
        fireSubstanceUrl: ECS.api.apUrl + '/fileAlarmChild/getFileSubstance',
        index: parent.layer.getFrameIndex(window.name),
        items: []
    },
    mounted: function () {
        this.initData();
    },
    methods: {
        initData: function () {
            var self = this;
            $.ajax({
                url: this.fireSubstanceUrl,
                type: "GET",
                success: function (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        for (var j = 0, l = data[i].list.length; j < l; j++) {
                            data[i].list[j].checked = false;
                        }
                    }
                    self.items = data;
                },
                error: function (e) {
                    console.log(e);
                }
            })
        },
        selectFireSubstance: function (substance) {
            substance.checked = !substance.checked;
        },
        save: function () {
            var names = ids = '';
            for (var i = 0, len = this.items.length; i < len; i++) {
                for (var j = 0, l = this.items[i].list.length; j < l; j++) {
                    if (this.items[i].list[j].checked) {
                        names += this.items[i].list[j].substanceName + ',';
                        ids += this.items[i].list[j].fireSubstanceId + ',';
                    }
                }
            }
            parent.$('#fireSubstanceTypeNames').val(names.substring(0, names.length - 1));
            parent.$('#fireSubstanceTypeIds').val(ids.substring(0, ids.length - 1));
            this.closePage();
        },
        closePage: function () {
            parent.layer.close(this.index);
        }
    }
});