var professionNameUrl = ECS.api.rttUrl + '/expert/expertProfession'; //专业分类
var industryNameUrl = ECS.api.rttUrl + '/expert/expertIndustry';//行业领域
var enjoyWorksUrl = ECS.api.rttUrl + '/expert/expertEnjoyWorks'; //擅长工作类型
var pageMode = PageModelEnum.Details;
window.pageLoadMode = PageLoadMode.None;
var initUserInfo={};
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
        },
        bindUI: function () {
            //input不允许输入空格
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                var ownDetail={};
                if($("#grid2 p").length>0){
                    for(var i=0;i<$("#grid2 p").length;i++){
                        ownDetail[$("#grid2 p").eq(i).attr("id")]=$("#grid2 p").eq(i).attr("name");
                    }
                }
                parent.ownDetail=ownDetail;
                window.pageLoadMode = PageLoadMode.None;
                page.logic.closeLayer(false);
            });
            $("#add").click(function () {
                page.logic.moveAdd();
            });
            $("#remove").click(function () {
                page.logic.moveRemove();
            });
        },
        logic: {
            /**
             * 初始化编辑数据
             */
            setData: function (data) {
                $('#title-main').text(data.title);
                pageMode = data.pageMode;
                // if(data.userName.length>0){
                //     var editUserId=data.userId.split(",");
                //     for(var i=0;i<data.userName.length;i++){
                //         $("#grid2").append("<p name='"+data.userName[i]+"' id='"+editUserId[i]+"'>"+data.userName[i]+"</p>");
                //         initUserInfo={};
                //         initUserInfo[editUserId[i]]=data.userName[i];
                //     }
                // }
                $("#grid2 p").click(function() {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
                if (data.isList == '1') {
                    page.logic.expertProfessionID(professionNameUrl + "?isAll=" + 'false', "#tree1"); //专业分类
                } 
                if (data.isList == '2'){
                     page.logic.expertProfessionID(industryNameUrl + "?isAll=" + 'false', "#tree1"); //行业领域
                }
                if (data.isList == '3'){
                     page.logic.expertProfessionID(enjoyWorksUrl + "?isAll=" + 'false', "#tree1"); //擅长工作类型
                }
                
            },
            //专业分类列表
            expertProfessionID: function (menu_url, oPar) {
                $.ajax({
                    url:menu_url,
                    type:"get",
                    beforeSend: function () {
                        ECS.showLoading();
                    },
                    success:function (data) {
                        ECS.hideLoading();
                        mini.get(oPar).loadList(data, "key", "value");
                    },
                    error: function (result) {
                        ECS.hideLoading();
                        var errorResult = $.parseJSON(result.responseText);
                        layer.msg(errorResult.collection.error.message);
                    }
                });
            },
            //选中
            moveAdd:function(){
                var items = mini.get("tree1").getSelectedNode();
                var hasitem=false;
                var this_id=$("#grid2 p");
                for(var i=0;i<$("#grid2 p").length;i++){
                    if(items.userID==this_id[i].id){
                        hasitem=true;
                    }
                }
                if(!hasitem){
                    $("#grid2").append("<p name='"+items.value+"' id='"+items.key+"'>"+items.value+"</p>");
                }
                $("#grid2 p").click(function() {
                    $(this).siblings('p').removeClass('selected');
                    $(this).addClass('selected');
                });
            },
            //移除
            moveRemove:function(){
                $(".selected").remove();
            },
            //判断是组织机构还是人员
            onDrawNode:function(e){
                console.log(e)
                var tree = e.node;
                var node = e.node.key;
                if(node==null){
                    e.iconCls = "mini-tree-folder";
                }else{
                    e.iconCls = "mini-tree-user";
                }
            },
            //禁止选中组织机构
            beforenodeselect:function(e){
                console.log(e)
                var node = e.node.key;
                if (e.node.key == null) e.cancel = true;
            },
            //查询
            search:function(){
                var key = mini.get("key").getValue();
                if (key == "") {
                    mini.get("tree1").clearFilter();
                } else {
                    key = key.toLowerCase();
                    mini.get("tree1").filter(function (node) {
                        var text = node.value ? node.value : "";
                        if (text.indexOf(key) != -1) {
                            return true;
                        }
                    });
                }
            },
            /**
             * 保存
             */
            save: function () {
                var ownDetail={};
                if($("#grid2 p").length>0){
                    for(var i=0;i<$("#grid2 p").length;i++){
                        ownDetail[$("#grid2 p").eq(i).attr("id")]=$("#grid2 p").eq(i).attr("name");
                    }
                }
                parent.ownDetail=ownDetail;
                page.logic.closeLayer(true);
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