var pageMode = PageModelEnum.Details;
window.pageLoadMode = PageLoadMode.None;
$(function () {
    var index = parent.layer.getFrameIndex(window.name);// 获取子窗口索引
    var page = {
        init: function () {
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        logic: {
            /**
             * 导入错误数据提示
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                $(".panel-body").html(data.errorTip);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    };
    page.init();
    window.page = page;
});