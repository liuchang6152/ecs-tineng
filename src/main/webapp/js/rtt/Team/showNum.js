var vehicleNumUrl = ECS.api.rttUrl + '/team/getVehicle';  //展示具体车辆
var personnelNumUrl = ECS.api.rttUrl + '/team/getPersonnel';  //展示具体人员
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            //关闭
            $(".btnClose").click(function () {
                parent.layer.close(index);
            });
        },
        data: {
            param: {
            }
        },
        logic: {
            setData: function (data) {
                $("#title-main").html(data.title);
                if(data.type=="1"){
                    $("#vehicleNum").hide();
                    $("#personnel").show();
                    grid1 = mini.get("personnel");
                    grid1.set({url:personnelNumUrl + '?orgID=' + data.orgID +'&teamID='+ data.teamID+ "&inUse=1",
                        ajaxType:"get",
                        dataField:"pageList"
                    });
                    grid1.load();
                }else{
                    $("#personnel").hide();
                    $("#vehicleNum").show();
                    grid = mini.get("vehicleNum");
                    grid.set({url:vehicleNumUrl + '?orgID=' + data.orgID +'&teamID='+ data.teamID + "&inUse=1",
                        ajaxType:"get",
                        dataField:"pageList"
                    });
                    grid.load();
                }
            },
            //职务循环展示
            show_job:function(e){
                var jobs="";
                for(var i=0;i<e.row.personnelJobList.length;i++){
                    if(i==0){
                        jobs+= e.row.personnelJobList[i];
                    }else{
                        jobs+=","+ e.row.personnelJobList[i];
                    }
                }
                return jobs;
            },
        }
    };
    page.init();
    window.page = page;
});