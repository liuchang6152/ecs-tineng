var loadListUrl = ECS.api.rttUrl + "/msdsFrimAtb";               //列表加载
var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";        //根据企业code获取企业id;
var grid = null;                                                    //grid表格对象
var orgId = "";                                                     //企业id

window.pageLoadMode = PageLoadMode.None;                                                                   //页面模式
$(function () {
    var page = {
        //页面初始化
        init: function () {
            mini.parse();                       //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();    //判断是否登录(获取当前用户)
            //根据企业code获取企业id;
            page.logic.GetOrgId(function(){
                page.logic.initTable();             //初始化表格
            });
            this.bindUI();                      //绑定事件
        },
        table: {},
        //绑定事件和逻辑
        bindUI: function () {
            //当点击“维护”按钮的时候，展示“维护属性页面”；
            $("#btnEdit").on("click",function(){
                page.logic.edit();
            });
        },
        data: {
            param: {}
        },
        //定义业务逻辑方法
        logic: {
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({
                    url:loadListUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                page.logic.search(true);    //列表数据渲染
            },
            /**
             * 搜索
             */
            search: function (sort) {
                page.data.param = {};                 //初始化参数对象
                //排序
                if(sort){
                    page.data.param["sortType"]=1;
                }
                page.data.param["orgId"] = orgId;    //企业id
                grid.load(page.data.param);
            },
            /**
             * 编辑
             * @param
             *设置“维护属性”页面的标题
             */
            edit: function () {
                var pageMode = PageModelEnum.Edit,
                    title = "维护属性";
                page.logic.detail(title, "", pageMode);
            },
            /**
             * 危化品信息页面
             */
            detail: function (title, msdsId, pageMode) {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['850px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'MaintainMSDSFrimAtb.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "pageMode": pageMode,
                            "msdsId": msdsId,
                            'title': title
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        page.logic.search(-1);   //刷新页面；
                        window.pageLoadMode = PageLoadMode.None;
                        // if (window.pageLoadMode == PageLoadMode.Refresh) {
                        //     window.pageLoadMode = PageLoadMode.None;
                        // } else if (window.pageLoadMode == PageLoadMode.Reload) {
                        //     window.pageLoadMode = PageLoadMode.None;
                        // }
                    }
                })
            },
            //获取企业id;
            GetOrgId:function(cb){
                $.ajax({
                    url:getOrgIdUrl+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        orgId = Data.orgId;                   //存储企业id;
                        cb && cb();
                    }
                });
            },
        }
    };
    page.init();
    window.page = page;
});