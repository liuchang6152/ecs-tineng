var addUrl = ECS.api.bodyUrl + '/projectform';
var getSingleUrl = ECS.api.bcUrl + '/accidentCategory';
var pageMode = PageModelEnum.NewAdd;
var bodyUrl = ECS.api.bodyUrl + '/projectform/getUnit';
var getId = ECS.api.bodyUrl + '/projectform/getProjectById?projectFormId='
var nsKey;
var nsData;
var nsObj;
window.pageLoadMode = PageLoadMode.None;
$(function () {
  var index = parent.layer.getFrameIndex(window.name); //获取子窗口索引
  var page = {
    init: function () {
      this.bindUI();
      //单位下拉框
      page.logic.select_option(bodyUrl, $("#projectCompany"));
      page.logic.newLeft();
    },
    bindUI: function () {

      $('#select_base_cityname').change(function(){
        alert('改变了')
      });
      //搜索栏中input不允许输入空格
      $("input").blur(function () {
        $(this).val($.trim($(this).val()));
      });
      $('body').on('blur', '.input', function () {
        $(this).closest('.form-groups').remove();
      });
      $('#btnSave').click(function () {
        // if ($("#firstName").val().length > 0) {
        //     layer.msg('您的“子类名称”输入区的最下边输入框存在内容，如需增加请点击加号，否则请清空后保存！！', {
        //         time: 4000
        //     });
        //     return;
        // }
        page.logic.save();
      });
      //单位
      $('#projectCompany').change(function () {
        nsKey = $('#projectCompany option:selected').attr('key');
        console.log(nsKey);
      });
      $(".btnClose").click(function () {
        window.pageLoadMode = PageLoadMode.None;
        page.logic.closeLayer(false);
      });
        $('body').on('click', '#addNewName', function (e) {
          
          console.log($('#list .form-group:last').html());
          console.log($('#list .form-group:last').html());
          if ($("#firstName").val() != "") {
            $("#list").append(
              '<div class="form-group">' +
              // '<div class="col-xs-12">' + 
              '<input type="number" class="form-control required projectName" maxlength="200"/> 一 ' +
              '<input type="number" class="form-control required projectCompany" maxlength="200"/> 秒 ' +
              '<input type="number" class="form-control required total" maxlength="200"/>' +
              '<button class="btn btn-danger delName" type="button" title="删除"><span class = "glyphicon glyphicon-minus"> </span></button>' +
              '</div>'
            );
           

            // $("#firstName").val("");
          } else {
            layer.msg("新增成绩区间分数！");
          }
        });
      $('body').on('click', '.delName', function () {
        $(this).closest('.form-group').remove();
      });
      
      $('body').on('click', ' #ulList li', function () {
       console.log($(this).attr('key'))
         $.ajax({
           url: ECS.api.bodyUrl + '/scoreConfigure/' + $(this).attr('key'),
           type: "get",
           async: false,
           dataType: "json",
           beforeSend: function () {
             ECS.showLoading();
           },
           success: function (res) {
              $("#list").html('');
             ECS.hideLoading();
             console.log(res)
             for (var i = 0, l = res.length; i < l; i++) {
               if (res.length != 0) {
                 if (i == 0) {
                   $("#list").append(
                     '<div class="form-group">' +
                     // '<div class="col-xs-12">' + 
                     '<input type="number" class="form-control required projectName" maxlength="200" value="' + res[i].scoreconfigureLow + '"/> 一 ' +
                     '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + res[i].scoreconfigureHigh + '" /> 秒 ' +
                     '<input type="number" class="form-control required total" maxlength="200" value="' + res[i].scoreconfigureFraction + '" />' +
                     '<button class="btn btn-info ml__10" type="button" title="新增" id="addNewName"><span class="glyphicon glyphicon-plus"></span></button>' +
                     '</div>'
                   );
                 } else {
                   $("#list").append(
                     '<div class="form-group">' +
                     '<input type="number" class="form-control required projectName" maxlength="200" value="' + res[i].scoreconfigureLow + '"/> 一 ' +
                     '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + res[i].scoreconfigureHigh + '" /> 秒 ' +
                     '<input type="number" class="form-control required total" maxlength="200" value="' + res[i].scoreconfigureFraction + '" />' +
                     '<button class="btn btn-danger delName" type="button" title="删除"><span class = "glyphicon glyphicon-minus"> </span></button>' +
                     '</div>'
                   );
                 };

               } else {
                 layer.msg("暂无数据");
               }
             }

            // for(var i = 0,l=res.length;i < l;i++){
            //   console.log(res[i].scoreConfigurePojos);
            //   // for (var j = 0, k = res[i].scoreConfigurePojos.length; j < k; j++) {
            //   //   console.log(res[i].scoreConfigurePojos[j].scoreconfigureLow);
            //   //   if (i == 0) {
            //   //     $("#list").append(
            //   //       '<div class="form-group">' +
            //   //       // '<div class="col-xs-12">' + 
            //   //       '<input type="number" class="form-control required projectName" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureLow + '"/> 一 ' +
            //   //       '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureHigh + '" /> 秒 ' +
            //   //       '<input type="number" class="form-control required total" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureFraction + '" />' +
            //   //       '<button class="btn btn-info ml__10" type="button" title="新增" id="addNewName"><span class="glyphicon glyphicon-plus"></span></button>' +
            //   //       '</div>'
            //   //     );
            //   //   } else {
            //   //     $("#list").append(
            //   //       '<div class="form-group">' +
            //   //       '<input type="number" class="form-control required projectName" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureLow + '"/> 一 ' +
            //   //       '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureHigh + '" /> 秒 ' +
            //   //       '<input type="number" class="form-control required total" maxlength="200" value="' + res[i].scoreConfigurePojos[j].scoreconfigureFraction + '" />' +
            //   //       '<button class="btn btn-danger delName" type="button" title="删除"><span class = "glyphicon glyphicon-minus"> </span></button>' +
            //   //       '</div>'
            //   //     );
            //   //   };
            //   // };
            //   };
           },
           error: function (result) {
             ECS.hideLoading();
             var errorResult = $.parseJSON(result.responseText);
             layer.msg(errorResult.collection.error.message);
           }
         });
        
      });
      
      

    },
    logic: {
      newLeft: function () {
        $.ajax({
          url: ECS.api.bodyUrl + '/projectform/getProjectSetting',
          type: "get",
          async: true,
          dataType: "json",
          beforeSend: function () {
            ECS.showLoading();
          },
          success: function (res) {
            ECS.hideLoading();
            console.log(res);
            nsObj = {};
            for(var i = 0,l = res.length;i < l;i++){
              console.log(res[i])
              var li = '<li class="nsList" key=' + res[i].projectformId + '>' + res[i].projectName + '</li>';
              nsObj = res[i].scoreConfigurePojos;
              $('#ulList').append(li);
            }
            page.logic.loopList();

            // for (var i = 0; i < res.result.accidentTypeEntityList.length; i++) {
            //     $("#nameList").append('<div class="form-groups">' +
            //         '<div class="col-xs-9">' +
            //         '<input type="text" class="form-control required" onblur="$(this).val($.trim($(this).val()))" id="' + data.accidentTypeEntityList[i].accidentTypeID + '" maxlength="200" value="' + data.accidentTypeEntityList[i].accidentTypeName + '" /></div>' +
            //         '<span class="span-required">*</span>' +
            //         '<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
            // }
          },
          error: function (result) {
            ECS.hideLoading();
            var errorResult = $.parseJSON(result.responseText);
            layer.msg(errorResult.collection.error.message);
          }
        });
      },
      //动态循环
      loopList: function () {
        for (var i = 0, l = nsObj.length; i < l; i++) {
          console.log(nsObj[i])
          if (i == 0) {
            $("#list").append(
              '<div class="form-group">' +
              // '<div class="col-xs-12">' + 
              '<input type="number" class="form-control required projectName" maxlength="200" value="' + nsObj[i].scoreconfigureLow + '"/> 一 ' +
              '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + nsObj[i].scoreconfigureHigh + '" /> 秒 ' +
              '<input type="number" class="form-control required total" maxlength="200" value="' + nsObj[i].scoreconfigureFraction + '" />' +
              '<button class="btn btn-info ml__10" type="button" title="新增" id="addNewName"><span class="glyphicon glyphicon-plus"></span></button>' +
              '</div>'
            );
          } else {
            $("#list").append(
              '<div class="form-group">' +
              // '<div class="col-xs-12">' + 
              '<input type="number" class="form-control required projectName" maxlength="200" value="' + nsObj[i].scoreconfigureLow + '"/> 一 ' +
              '<input type="number" class="form-control required projectCompany" maxlength="200" value="' + nsObj[i].scoreconfigureHigh + '" /> 秒 ' +
              '<input type="number" class="form-control required total" maxlength="200" value="' + nsObj[i].scoreconfigureFraction + '" />' +
              '<button class="btn btn-danger delName" type="button" title="删除"><span class = "glyphicon glyphicon-minus"> </span></button>' +
              '</div>'
            );
          }
        }
      },
      /**
       * 初始化编辑数据
       */
      setData: function (data) {
        console.log(data)
        $('#title-main').text(data.title);
        pageMode = data.pageMode;
        if (pageMode == PageModelEnum.NewAdd) {
          return;
        }
        $.ajax({
          url: getId + data.projectformId,
          type: "get",
          async: true,
          dataType: "json",
          beforeSend: function () {
            ECS.showLoading();
          },
          success: function (res) {
            ECS.hideLoading();
            console.log(res.result)
            nsData = res.result;
            ECS.form.setData('AddOrEditModal', res.result);
            $('#projectCompany').val(res.result.projectCompanyName)
            // for (var i = 0; i < res.result.accidentTypeEntityList.length; i++) {
            //     $("#nameList").append('<div class="form-groups">' +
            //         '<div class="col-xs-9">' +
            //         '<input type="text" class="form-control required" onblur="$(this).val($.trim($(this).val()))" id="' + data.accidentTypeEntityList[i].accidentTypeID + '" maxlength="200" value="' + data.accidentTypeEntityList[i].accidentTypeName + '" /></div>' +
            //         '<span class="span-required">*</span>' +
            //         '<button class="btn btn-danger delName" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button></div>');
            // }
          },
          error: function (result) {
            ECS.hideLoading();
            var errorResult = $.parseJSON(result.responseText);
            layer.msg(errorResult.collection.error.message);
          }
        });
      },
      // 保存
      save: function () {
        // page.logic.formValidate();
        if (!$('#projectName').val()) {
          layer.msg('请输入项目名称！');
          return;
        };
        if (!$('#abroadNameCode').val()) {
          layer.msg('请输入别名！');
          return;
        };
        if (!$('#projectCompanyName').val()) {
          layer.msg('请选择单位！');
          return;
        };
        var numArr = [];
        //处理提交类型
        var ajaxType = "POST";
        var data = {
          projectName: $('#projectName').val(),
          abroadNameCode: $('#abroadNameCode').val(),
          projectCompany: nsKey
        }
        if (pageMode == PageModelEnum.NewAdd) {

          data = {
            projectName: $('#projectName').val(),
            abroadNameCode: $('#abroadNameCode').val(),
            projectCompany: nsKey
          }
          window.pageLoadMode = PageLoadMode.Reload;
        } else if (pageMode == PageModelEnum.Edit) {
          console.log(nsData);
          data = {
            projectName: $('#projectName').val() || nsData.projectName,
            abroadNameCode: $('#abroadNameCode').val() || nsData.abroadNameCode,
            projectCompany: nsKey || nsData.projectCompany,
            projectformId: nsData.projectformId
          }

          ajaxType = "PUT";
          window.pageLoadMode = PageLoadMode.Refresh;
        };
        $("#accidentTypeEntityList").val(JSON.stringify(numArr));
        // var data = ECS.form.getData('AddOrEditModal');
        // var ob = JSON.parse(data.accidentTypeEntityList); //去掉数组中对象属性的双引号
        // data.accidentTypeEntityList = ob;
        // delete data["firstName"];
        console.log(data);

        $.ajax({
          // url: ECS.api.bodyUrl + '/projectform',
          url: addUrl,
          async: false,
          type: ajaxType,
          data: JSON.stringify(data),
          dataType: "text",
          contentType: "application/json;charset=utf-8",
          // beforeSend: function () {
          //     $('#btnSave').attr('disabled', 'disabled');
          //     ECS.showLoading();
          // },
          success: function (result) {
            ECS.hideLoading();
            var res = JSON.parse(result)
            if (res.isSuccess) {
              layer.msg(res.message, {
                time: 1000
              }, function () {
                page.logic.closeLayer(true);
              });
            } else {
              layer.msg(res.message);
            }
          },
          error: function (res) {
            console.log(res)
            ECS.hideLoading();

          }
        });
      },
      // 下拉框
      select_option: function (menu_url, oPar, cb) {
        $.ajax({
          url: menu_url,
          type: "GET",
          success: function (res) {
            if (cb && (typeof cb != "function")) {
              //安全风险区分类

              //   mini.get("ranks").loadList(res, "teamID", "teamName");
              //   page.logic.load_risk_menus();
              console.log('传递的参数不对')
            } else {
              //清空下拉框
              $(oPar).html("");
              //下拉框数据填充
              for (var i = 0; i < res.length; i++) {
                (function (cur_key) {
                  //安全风险区类型、风险分析对象类型、作业风险区类型、存放点类型、储备库分类；
                  if (cur_key.value != '') {
                    var $oPtion = $('<option value="' + cur_key.value + '" key="' + cur_key.key + '">' + cur_key.value + '</option>');
                  }
                  $(oPar).append($oPtion);
                })(res[i]);
              }
              cb && cb();
            }
            //应急队伍
            //   mini.get("ranks").setValue("请选择");
            //   mini.get("ranks").setValue(teamId);


          }
        })
      },
      /**
       * 关闭弹出层
       */
      closeLayer: function (isRefresh) {
        window.parent.pageLoadMode = window.pageLoadMode;
        parent.layer.close(index);
      },
      formValidate: function () {
        ECS.form.formValidate('AddOrEditModal', {
          rules: {
            projectName: {
              required: true,
              maxlength: 200
            },
            abroadNameCode: {
              required: true,
              maxlength: 200
            },
            projectCompany: {
              required: true,
              maxlength: 200
            }
          }
        });

      }

    }
  };
  page.init();
  window.page = page;
});