var getOrgIdUrl = ECS.api.bcUrl + "/org/getOrgIdByCode";        //根据企业code获取企业id;
var orgId = null;                                                   //企业id
var grid = null;                                                    //grid表格对象
var dutyTypeUrl =  ECS.api.bcUrl + '/duty/type';              //职务类型
var dutyLevelUrl = ECS.api.bcUrl +'/duty/level' ;             //职务级别
var searchUrl =  ECS.api.rttUrl + "/emergencyduties/duty";   //职位选择 查询
window.ownDetail;
var pageMode = PageModelEnum.NewAdd;
window.pageLoadMode = PageLoadMode.None;                         //页面模式

$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            //查询
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            //预案分类选择以后，联动预案类型；
            $("#accidentCategoryID").on("change",function(){
                //联动预案类型----
                page.logic.category_menu2();                                     //预案类型（事故小类）
            });
            //点击保存按钮，保存相关数据
            $('#btnSave').click(function () {
                page.logic.save();
            });
            //点击关闭按钮，关闭该弹框
            $(".btnClose").click(function () {
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
        },
        data: {
            param: {}
        },
        logic: {
            /**
             * 保存
             */
            save: function () {
                // window.pageLoadMode = PageLoadMode.Reload;    //设置页面模式为重新加载；
                var idsArray = new Array();     //职务id选择集合
                var NameList = new Array();     //职务名称选择集合
                var rowsArray = grid.getSelecteds();
                if(rowsArray.length==0){
                    layer.msg("请选择对应职位的责任人！");
                    return false;
                }else{
                    $.each(rowsArray, function (i, el) {
                        var oSpace_dt = {};
                        oSpace_dt["dutyID"] = el.dutyID;         //职务id;
                        oSpace_dt["dutyName"] = el.dutyName+"("+(el.userNames?el.userNames:"")+")";    //职务名称;
                        idsArray.push(oSpace_dt);
                    });
                    parent.aPositionList = [];                   //职位选择，清空缓存；
                    parent.aPositionList = idsArray;             //职位选择，存储已选择的；
                    window.pageLoadMode = PageLoadMode.None;   //设置页面模式
                    page.logic.closeLayer(false);                 //关闭当前页面
                }
            },
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                page.logic.initDutyType();                   //职务类型
                page.logic.initDutyLevel();                  //职务级别
                ECS.sys.RefreshContextFromSYS();          //判断是否登录(获取当前用户)
                parent.aPositionList = [];                 //职位选择，清空缓存；
                //根据企业code获取企业id;
                page.logic.GetOrgId(function(){
                    page.logic.initTable();             //初始化表格
                });

            },
            /**
             * 职务类型
             */
            initDutyType:function(){
                $.ajax({
                    url:dutyTypeUrl,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        var one_init_option = '<option value="">全部</option>';
                        $("#dutyTypeID").append(one_init_option);
                        for(var w=0;w<Data.length;w++){
                            (function(cur_dt){
                                var one_option = '<option value="'+cur_dt["dutyTypeID"]+'">'+cur_dt["dutyTypeName"]+'</option>';
                                $("#dutyTypeID").append(one_option);
                            })(Data[w]);
                        }
                    }
                });
            },
            /**
             * 职务级别
             */
            initDutyLevel:function(){
                $.ajax({
                    url:dutyLevelUrl,
                    type: "GET",
                    timeout:5000,
                    success: function (Data) {
                        var one_init_option = '<option value="">全部</option>';
                        $("#dutyLevelID").append(one_init_option);
                        for(var w=0;w<Data.length;w++){
                            (function(cur_dt){
                                var one_option = '<option value="'+cur_dt["dutyLevelID"]+'">'+cur_dt["dutyLevelName"]+'</option>';
                                $("#dutyLevelID").append(one_option);
                            })(Data[w]);
                        }
                    }
                });
            },
            /**
             * 初始化表格
             */
            initTable: function () {
                grid = mini.get("datagrid");
                grid.set({
                    url:searchUrl,
                    ajaxType:"get",
                    dataField:"pageList"
                });
                page.logic.search(true);
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
            /**
             * 搜索
             */
            search: function (sort) {
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                //排序
                if(sort){
                    page.data.param["sortType"]=1;
                }
                page.data.param["orgID"] = orgId;          //企业id;
                grid.load(page.data.param);
            },
            /**
             * 关闭弹出层
             */
            closeLayer: function (isRefresh) {
                window.parent.pageLoadMode = window.pageLoadMode;
                parent.layer.close(index);
            }
        }
    }
    page.init();
    window.page = page;
})