// var delUrl = ECS.api.bcUrl + '/accidentCategory';
var delUrl = ECS.api.bodyUrl + '/projectform';
// var searchUrl = ECS.api.bcUrl + '/accidentCategory';
var searchUrl = ECS.api.bodyUrl + '/projectform';
// var searchUrl = 'http://localhost:8080/api/fpt/projectform';
window.pageLoadMode = PageLoadMode.None;
$(function () {
  var page = {
    //页面初始化
    init: function () {
      this.bindUI();
      page.logic.initTable();
      page.logic.search();
    },
    table: {},
    //绑定事件和逻辑
    bindUI: function () {
      // 新增
      $('#btnAdd').click(function () {
        page.logic.add('新增', "", PageModelEnum.NewAdd);
      });
      //批量删除
      $('#btnDel').click(function () {
        page.logic.delAll();
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
        mini.parse();
        grid = mini.get("datagrid");
        console.log(searchUrl)
        grid.set({
          url: searchUrl,
          ajaxType: "get",
          dataField: "pageList"
        });
      },
      show_edit: function (e) {
        console.log(e);
        return ECS.util.editRender(e.row.projectformId);
      },
      /**
       * 搜索
       */
      search: function () {
        page.data.param = {};
        grid.load(page.data.param);
      },
      /**
       * 批量删除
       */
      delAll: function () {
        var idsArray = [];
        var rowsArray = grid.getSelecteds();
        $.each(rowsArray, function (i, el) {
          idsArray.push(el.projectformId);
        });
        if (idsArray.length == 0) {
          layer.msg("请选择要删除的数据!");
          return;
        }
        layer.confirm('确定删除吗？', {
          btn: ['确定', '取消']
        }, function () {
          $.ajax({
            url: delUrl + '?projectFormIds=' + idsArray.join(''),
            async: true,
            // data: JSON.stringify(idsArray),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            type: 'DELETE',
            beforeSend: function () {
              layer.closeAll();
              ECS.showLoading();
            },
            success: function (res) {
              ECS.hideLoading();
              if (res.isSuccess){
                layer.msg(res.message, {
                  time: 1000
                }, function () {
                  grid.reload();
                });
              }else{
                layer.msg(res.message)
              }
              // if (result.indexOf('collection') < 0) {
                
              // } else {
              //   result = JSON.parse(result)
              //   layer.msg(result.collection.error.message)
              // }
            },
            error: function (result) {
              ECS.hideLoading();
              var errorResult = $.parseJSON(result.responseText);
              layer.msg(errorResult.collection.error.message);
            }
          })
        }, function (index) {
          layer.close(index)
        });
      },
      /**
       * 新增
       */
      add: function () {
        var pageMode = PageModelEnum.NewAdd;
        var title = "体能测试评分配置";
        page.logic.detail(title, "", pageMode);
      },
      /**
       * 编辑
       * @param projectformId
       */
      edit: function (projectformId) {
        var pageMode = PageModelEnum.Edit;
        var title = "体能测试评分配置";
        page.logic.detail(title, projectformId, pageMode);
      },
      /**
       * 装置新增或者编辑详细页面
       */
      detail: function (title, projectformId, pageMode) {
        layer.open({
          type: 2,
          closeBtn: 0,
          area: ['400px', '400px'],
          skin: 'new-class',
          shadeClose: false,
          title: false,
          content: 'detail.html?' + Math.random(),
          success: function (layero, index) {
            var body = layer.getChildFrame('body', index);
            var iframeWin = window[layero.find('iframe')[0]['name']];
            var data = {
              "pageMode": pageMode,
              "projectformId": projectformId,
              'title': title
            };
            iframeWin.page.logic.setData(data);
          },
          end: function () {
            if (window.pageLoadMode == PageLoadMode.Refresh) {
              page.logic.search();
              window.pageLoadMode = PageLoadMode.None;
            } else if (window.pageLoadMode == PageLoadMode.Reload) {
              page.logic.search();
              window.pageLoadMode = PageLoadMode.None;
            }
          }
        })
      }
    }
  };
  page.init();
  window.page = page;
});