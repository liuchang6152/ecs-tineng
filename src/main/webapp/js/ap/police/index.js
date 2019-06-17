var tempPersonUrl = ECS.api.emUrl + '/msg/getTemporaryStaff';
var delTempPersonUrl = ECS.api.emUrl + '/msg/deleteTemporaryStaff';
var weatherUrl = ECS.api.emUrl + '/msg/getWeatherForecast';
var orgNameUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=2'; //企业名称
var riskRankUrl = ECS.api.apUrl + '/DirectAlarm/eventLvl'; //预警等级
// var eventLvlIdUrl = ECS.api.apUrl + '/DirectAlarm/eventLvl'; //事故等级
var saveUrl = ECS.api.apUrl + "/EventRegistration/addEventRegistration"; //接警
var listUrl = ECS.api.apUrl + "/EventRegistration/getUserList"; //列表
var accCategoryUrl = ECS.api.bcUrl + "/accidentCategory/list"; //事故大类
var accTypeUrl = ECS.api.bcUrl + "/accidentCategory/accidentType"; //事故小类
var systemUrl = ECS.api.apUrl + '/EventRegistration/getRiskAreaList' + '?orgCode='; //安全风险区
var dataSource = null;
var nsLeavel = [];
var nsArr = [];

$(function () {
  var page = {
    orgUrl: ECS.api.bcUrl + '/org/porgName', //企业
    commGroupsTypeUrl: ECS.api.emUrl + '/CommGroupsType', //树形结构
    // personGroupsUrl: ECS.api.emUrl + '/CommonGroupOwer',//通讯组
    personGroupsUrl: ECS.api.apUrl + '/EventRegistration',
    // searchUrl: ECS.api.emUrl + '/PersonInCommGroup', //点击左侧树形菜单,查询表格数据
    searchUrl: ECS.api.apUrl + '/EventRegistration', //点击左侧树形菜单,查询表格数据
    emEventUrl: ECS.api.emUrl + '/msg/event',
    groupPerson: ECS.api.emUrl + '/PersonInCommGroup/search',
    sendMsg: ECS.api.emUrl + '/msg',
    feedbackTypeUrl: ECS.api.emUrl + '/msg/feedbackTypeList',
    //页面初始化
    init: function () {
      mini.parse();
      $('[tabindex="2"],[tabindex="3"],[tabindex="4"]').hide();
      ECS.sys.RefreshContextFromSYS();
      page.logic.get_list(page.orgUrl, $("#enterpriseCode"));
      page.logic.initData();
      this.bindUI();
      page.logic.initPage();
      page.logic.cbxAccidentCategory(); //事故大类
      page.logic.cbxOrgName();
      page.logic.userName(orgNameUrl, "orgId"); //企业名称
    },
    table: {},
    //绑定事件和逻辑
    bindUI: function () {
    
    
      $('input').blur(function () {
        $(this).val($.trim($(this).val()))
      });
      $('#btnNewMsg').click(function () {
        page.logic.sendMsg();
      });
      $('#btnMsgTrack').click(function () {//取消
        // window.location = '../MsgTrack/index.html' + location.search;
         page.logic.closeLayer(PageLoadMode.None);
      });
      $('#voice').change(function () {//选择选择
        $('#inputs').hide();
        $('#selects').show();
        $('#userName').val('');
      });
      $('#msg').change(function(){//选择输入
         $('#inputs').show();
         $('#selects').hide();
      });
      $('#btnDel').click(function () {
        var grid = mini.get('datagrid');
        var rows = grid.getSelecteds();
        if (rows.length == 0) {
          layer.msg('请选择要删除的数据');
        }
        grid.removeRows(rows);
      });
      $('#btnQuery').click(function () {
        page.logic.searchPerson();
      });
      $('#btnTempQuery').click(function () {
        page.logic.searchTempPerson();
      });
      $('#btnSave').click(function () {
        page.logic.savePersonGroup();
      });
      $('#btnAdd').click(function () {
        page.logic.addPerson();
      });
      $('#btnSend').click(function () {
        page.logic.sendMsg();
      });
      $('#btnTempAdd').click(function () {
        page.logic.tempAdd();
      });
     
      //下拉框
      // mini.get("enterpriseCode").on("nodeclick", function (e) {
      //   page.logic.load_sidebar(page.commGroupsTypeUrl, "commGroupsType", e.node.orgCode); //树形菜单
      // });
    
      //公共组
      // mini.get("commGroupsType").on("nodedblclick", function (e) {
      //   page.logic.addPersonToTable(e.row[this.idField]); //表格
      // });
      //个人组
      mini.get("userGroups").on("nodecheck", function (e) { //点击事件
        page.logic.initTable(e.node.key); //表格
      });
      $('[tabindex="1"]').click(function () {
        $.ajax({
          url: weatherUrl,
          type: 'GET',
          dataType: 'text',
          success: function (data) {
            $('#autoMsg').val($('#autoMsg').val() + data);
          },
          error: function (data) {
            console.log(data);
          }
        });
      });
       //企业改变事件
        $("#orgId").on("select2:select", function () {
          //  page.logic.tempAdd();
          $('.orgId').html($('#orgId option:selected').text());
           page.logic.cbxRiskRank(); //预警等级
            page.logic.select_options(systemUrl, "systemId"); //安全风险区域
        });
         $('#userName').blur(function () { //安全风险区输入
            $('.systemId').html($('#userName').val());
         });
         $("#systemId").on("select2:select", function () {//安全风险区选择
          $('.systemId').html('');
          if ($('#systemId option:selected').text() != '可搜索') {
             $('.systemId').html($('#systemId option:selected').text());
             ;
          }
         })
         $("#accidentTypeId").blur(function () { //事故小类选择
          if ($('#accidentTypeId option:selected').text() != '可搜索') {
             $('.accidentTypeId').html($('#accidentTypeId option:selected').text());
          }
         })
    },
    data: {
      param: {}
    },
    //定义业务逻辑方法
    logic: {
      setdata: function (data) {

      },
      userName: function (menu_url, oPar) { //企业名称
        page.logic.getComboSelect_s(menu_url, oPar, "orgCode", "orgSname");
      },
      select_options: function (menu_url, oPar) { //安全风险区域
        page.logic.getComboSelect_s(menu_url, oPar, "riskCode", "riskName");
      },
      getComboSelect_s: function (url, ctrlId, key, value, tags) { //安全风险区域
        $("#" + ctrlId).html('<option value="" selected="selected">可搜索</option>');
        $.ajax({
          url: url + $('#orgId').val(),
          async: false,
          dataType: "json",
          success: function (data) {
            var datalist = [];
            $.each(data, function (i, el) {
              datalist.push({
                id: el[key],
                text: el[value]
              });
            });
            $('#' + ctrlId).select2({
              tags: tags,
              data: datalist,
              language: {
                noResults: function (params) {
                  return "没有匹配项";
                }
              },
            });


          },
        })
      },
      userNameFun: function (url, ctrlId, key, value, tags) { //安全风险区域
        $("#" + ctrlId).html('<option value="" selected="selected">可搜索</option>');
        $.ajax({
          url: url,
          async: false,
          dataType: "json",
          success: function (data) {
            var datalist = [];
            $.each(data, function (i, el) {
              datalist.push({
                id: el[key],
                text: el[value]
              });
            });
            $('#' + ctrlId).select2({
              tags: tags,
              data: datalist,
              language: {
                noResults: function (params) {
                  return "没有匹配项";
                }
              },
            });


          },
        })
      },

      //事故大类
      cbxAccidentCategory: function () {
        ECS.ui.getCombobox("accidentCategoryId", accCategoryUrl, {
          selectValue: "-1",
          keyField: "accidentCategoryID",
          valueField: "accidentCategoryName",
          async: false
        }, null, page.logic.cbxAccidentType);
      },
      //事故小类
      cbxAccidentType: function (pid) {
        ECS.ui.getCombobox("accidentTypeId", accTypeUrl, {
          selectValue: "-1",
          keyField: "accidentTypeID",
          valueField: "accidentTypeName",
          async: false,
          data: {
            "accidentCategoryID": pid
          }
        }, null, page.logic.cbxInfo);
      },
      /**
       * 事故等级
       */
      cbxRiskRank: function (pid) {
        ECS.ui.getCombobox("riskRankId", riskRankUrl + "?orgCode=" + $('#orgId').val(), {
          selectValue: "-1",
          keyField: "eventLvlId",
          valueField: "eventLvlName",
          async: false
        }, null);
      },
      //企业名称
      cbxOrgName: function () {
        if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
          ECS.ui.getCombobox("orgId", orgNameUrl, {
            selectFirstRecord: true,
            keyField: "orgId",
            valueField: "orgSname",
            codeField: "orgId",
            valueSField: "orgSname",
            async: false,
          }, null);
          // $("#orgId").attr("disabled", false);//企业名称
        } else {
          ECS.ui.getCombobox("orgId", orgNameUrl, {
            selectValue: ECS.sys.Context.SYS_ENTERPRISE_CODE,
            async: false,
            keyField: "orgCode",
            valueField: "orgSname",
            codeField: "orgId",
            valueSField: "orgSname"
          }, null);
          // $("#orgId").attr("disabled", true);//企业名称
        }
      },
      initPage: function () {
        //0、日常调度；1、应急事件；
        var model = page.logic.getQueryString('PageModel');
        if (model == 1) {
          $('#em').attr('checked', 'checked');
          $('[tabindex="2"],[tabindex="3"],[tabindex="4"]').show();
          $.ajax({
            url: page.emEventUrl + '?eventId=' + page.logic.getQueryString('eventId'),
            type: "get",
            success: function (data) {
              $('#event').text(data.eventSummary);
            },
            error: function (e) {
              console.log(e);
            }
          })
        } else {
          $('#day').attr('checked', 'checked');
        }

        page.logic.initTempTable();
      },
      get_list: function (url, oPar, Pid, cb) {
        if (Pid) {
          //二级单位
          var cur_url = url + "?isAll=true&orgPID=" + Pid + "&orgLvl=3";
        } else {
          //企业
          var cur_url = url + "?orgLvl=2";
        }
        $.ajax({
          url: cur_url,
          type: "GET",
          success: function (Data) {
            if (Pid) {
              //二级单位
              mini.get("drtDeptCode").loadList(Data, "orgId", "orgPID");
              mini.get("drtDeptCode").setValue("全部");
              page.logic.load_risk_menu();
              cb && cb();
            } else {
              //企业
              // mini.get("enterpriseCode").loadList(Data, "orgId", "orgPID");
              // if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
              //   enterpriseCode = mini.get("enterpriseCode").data[0].orgCode;
              //   mini.get("enterpriseCode").setValue(mini.get("enterpriseCode").data[0].orgCode);
              //   // page.logic.get_list(riskorg_url, $("#drtDeptCode"), mini.get("#enterpriseCode").data[0].orgId);
              // } else {
              //   enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
              //   mini.get("enterpriseCode").disable();
              //   for (var w = 0; w < Data.length; w++) {
              //     (function (cur_key) {
              //       if (cur_key.orgCode == enterpriseCode) {
              //         mini.get("enterpriseCode").setValue(cur_key.orgCode);
              //         // page.logic.get_list(riskorg_url, $("#drtDeptCode"), cur_key.orgId);
              //       }
              //     })(Data[w]);
              //   }
              // }
              // page.logic.load_sidebar(page.commGroupsTypeUrl, "commGroupsType", enterpriseCode); //树形菜单
              cb && cb();
            }
          }
        });
      },
      //公共组
      load_sidebar: function (treeUrl, oPar, pid) {
        $.ajax({
          url: treeUrl + "?enterpriseCode=" + pid,
          type: "get",
          success: function (data) {
            mini.get(oPar).loadData(data);
          },
          error: function (e) {
            console.log(e);
          }
        });
      },
      //个人组
      initData: function () {
        $.ajax({
          url: page.personGroupsUrl,
          type: "get",
          success: function (data) {
            if (data == null || data == undefined || data.length == 0) {
              return;
            }
            mini.get('userGroups').loadData(data);
            mini.get('userGroups').select(0);
            page.logic.initTable(mini.get('userGroups').getValue()); //表格
          },
          error: function (e) {
            console.log(e);
          }
        });
        // ECS.util.bindCmb({
        //   ctrId: 'feedbackType',
        //   url: page.feedbackTypeUrl
        // }, function () {
        //   mini.get('feedbackType').select(0);
        // });
      },
      searchPerson: function () {
        var userName = $.trim($('#userName').val());
        var grid = mini.get("datagrid");
        if (dataSource == null) {
          dataSource = grid.data;
        }
        var result = [];
        for (var i = 0, len = dataSource.length; i < len; i++) {
          if (dataSource[i].userName.indexOf(userName) > -1) {
            result.push(dataSource[i]);
          }
        }
        grid.setData(result);
      },
      searchTempPerson: function () {
        var userName = $.trim($('#tempUserName').val());
        $.ajax({
          url: tempPersonUrl,
          type: 'GET',
          success: function (result) {
            var grid = mini.get("tempDatagrid");
            var data = [];
            for (var i = 0, len = result.length; i < len; i++) {
              if (result[i].privatePersonName.indexOf(userName) > -1) {
                data.push(result[i]);
              }
            }
            grid.setData(data);
          }
        });
      },
      savePersonGroup: function () {
        var gridData = mini.get('datagrid').getSelecteds();
        if (gridData.length == 0) {
          layer.msg('请先选择人员');
          return;
        }
        layer.open({
          type: 2,
          closeBtn: 0,
          area: ['400px;', '300px'],
          skin: 'new-class',
          shadeClose: false,
          title: false,
          content: 'addPersonGroup.html?r=' + Math.random(),
          success: function (layero, index) {
            var body = layer.getChildFrame('body', index);
            var iframeWin = window[layero.find('iframe')[0]['name']];
            var selecteds = mini.get('datagrid').getSelecteds();
            var ids = '';
            for (var i = 0, len = selecteds.length; i < len; i++) {
              ids += selecteds[i].userID + ',';
            }
            ids = ids.substring(0, ids.length - 1);
            personGroupArr = mini.get('userGroups').data;
            var data = {
              title: '添加个人通讯组',
              personIds: ids,
              personGroupArr: personGroupArr
            };
            iframeWin.page.logic.setData(data);
          },
          end: function () {

          }
        })
      },
      addPerson: function () {
        var selectedNode = mini.get('userGroups').getSelectedNode();
        if (!selectedNode) {
          layer.confirm('请先选择个人通讯组', {
            btn: ['关闭']
          }, function (index) {
            layer.close(index)
          })
          return;
        }
        layer.open({
          type: 2,
          closeBtn: 0,
          area: ['700px', '450px'],
          skin: 'new-class',
          shadeClose: false,
          title: false,
          content: '../../bc/RiskAnalysisPoint/SelectOwner.html?' + Math.random(),
          success: function (layero, index) {
            var body = layer.getChildFrame('body', index);
            var iframeWin = window[layero.find('iframe')[0]['name']];
            var data = {
              title: '选择人员',
              userName: '',
              orgCode: mini.get('enterpriseCode').getValue()
            };
            iframeWin.page.logic.setData(data);
          },
          end: function () {
            var data = [];
            for (var i in window.ownDetail) {
              var obj = {
                userId: i,
                commGroupId: selectedNode.commGroupid
              };
              data.push(obj);
            }
            if (data.length == 0) {
              return;
            }
            $.ajax({
              url: page.searchUrl,
              async: false,
              type: 'POST',
              data: JSON.stringify(data),
              dataType: "text",
              contentType: "application/json;charset=utf-8",
              beforeSend: function () {
                ECS.showLoading();
              },
              success: function (result) {
                ECS.hideLoading();
                result = $.parseJSON(result);
                if (result.isSuccess) {
                  layer.msg(result.message, {
                    time: 1000
                  }, function () {
                    page.logic.initTable(selectedNode.commGroupid);
                  });
                } else {
                  layer.msg(result.message);
                }
              },
              error: function (result) {
                ECS.hideLoading();
                layer.msg(result.message);
              }
            })
          }
        })
      },
      tempAdd: function () {
        ECS.util.detail({
          url: 'addTempPerson.html',
          width: 500,
          height: 300,
          data: {
            title: '新增临时人员'
          }
        });
      },
      //人员列表
      initTable: function (id) {
        console.log(mini.get('#userGroups').getCheckedNodes(false))
        var datas = [];
        for (var i = 0, l = mini.get('#userGroups').getCheckedNodes(false).length;i < l;i++) {
          datas.push(mini.get('#userGroups').getCheckedNodes(false)[i].key)
        }
        console.log(datas.join(','))
        mini.mask({
          cls: 'mini-mask-loading',
          html: '努力加载中...'
        });
        $.ajax({
          async: true,
          url: listUrl + '?commGroupids=' + (datas || '') + '&pageIndex=0&&pageSize=5',
          type: 'get',
          data: datas,
          success: function (result) {
            var grid = mini.get("datagrid");
            grid.setData(result.pageList);
            mini.unmask();
            $('.mini-grid-checkbox').removeClass('mini-grid-checkbox-checked');
          },
          error: function (e) {
            mini.unmask();
            console.log(e);
          }
        });
      },
      initTempTable: function () {
        $.ajax({
          url: tempPersonUrl,
          type: 'GET',
          success: function (result) {
            var grid = mini.get("tempDatagrid");
            // grid.setData(result);
          }
        });
      },
      addPersonToTable: function (id) {
        mini.mask({
          cls: 'mini-mask-loading',
          html: '努力加载中...'
        });
        var grid = mini.get("datagrid");
        var dataSource = grid.getData();
        $.ajax({
          url: page.searchUrl,
          type: 'GET',
          success: function (result) {
            var len = result.pageList.length;
            while (len > 0) {
              var user = result.pageList[len - 1];
              var userId = user.userID;
              var dlen = dataSource.length;
              var flag = true;
              while (dlen > 0) {
                if (userId == dataSource[dlen - 1].userID) {
                  flag = false;
                }
                dlen--;
              }
              if (flag) {
                grid.addRow(user);
              }
              len--;
            }
            mini.unmask();
          },
          error: function (result) {
            mini.unmask();
            console.log(result);
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
      onBeforeOpen: function (e) {
        var menu = e.sender;
        var tree = mini.get("userGroups");
        var node = tree.getSelectedNode();
        if (!node) {
          e.cancel = true;
          return;
        }
        if (node && node.text == "Base") {
          e.cancel = true;
          e.htmlEvent.preventDefault();
          return;
        }
        var Event = e || window.event;
        if (Event.stopPropagation) { //W3C阻止冒泡方法
          Event.stopPropagation();
        } else {
          Event.cancelBubble = true; //IE阻止冒泡方法
        }
      },
      onRemoveNode: function (e) {
        var id = mini.get("userGroups").getSelectedNode().personGroupId;
        layer.confirm('确定删除选中的通讯组？', {
          btn: ['确定', '取消']
        }, function () {
          $.ajax({
            url: page.personGroupsUrl,
            async: false,
            data: JSON.stringify({
              personGroupId: id
            }),
            contentType: "application/json;charset=utf-8",
            type: 'DELETE',
            success: function (result) {
              if (result.isSuccess) {
                layer.msg("删除成功！", {
                  time: 1000
                }, function () {
                  page.logic.initData();
                })
              } else {
                layer.msg(result.message);
              }
            },
            error: function (result) {
              var errorResult = $.parseJSON(result.responseText);
              layer.msg(errorResult.collection.error.message);
            }
          })
        }, function (index) {
          layer.close(index)
        });
      },
      sendMsg: function () {
        // if ($('[name=sendType]:checked').length == 0) {
        //   alert('请选择发送类型');
        //   return;
        // }
        var gridData = mini.get('datagrid').data;
        var tempGridData = mini.get('datagrid').getSelecteds(false);
        console.log(tempGridData)
        var recevieCount = gridData.length + tempGridData.length;
        console.log($('#systemId').is(":hidden"))
        if ($('#orgId').val() == '') {
          layer.msg('请选择企业名称');
          return false;
        }
        if ($('#systemId').is(":hidden")){
          if ($('#userName').val() == '') {
            layer.msg('请输入安全风险区域');
            return false;
          }
        }
        if ($('#userName').is(":hidden")) {
          if ($('#systemId').val() == '') {
            layer.msg('请选择安全风险区域');
            return false;
          }
        }
         if ($('#accidentCategoryId').val() == -1) {
           layer.msg('请选择事故大类！');
           return false;
         }
         if ($('#accidentTypeId').val() == -1) {
           layer.msg('请选择事故小类！');
           return false;
         }
        //  if ($('#riskRankId').val() == '' || $('#riskRankId').val() == null) {
        //    layer.msg('请选择事故等级！');
        //    return false;
        //  }
        if (tempGridData.length == 0) {
          layer.msg('请选择接收人');
          return false;
        }
        // if ($.trim($('#autoMsg').val()) == '') {
        //   alert('请填写发送内容');
        //   return;
        // }
        var sendType = -1;
        if ($('[name=sendType]:checked').length == 2) {
          sendType = 3;
        } else if ($('#msg').is(':checked')) {
          sendType = 1;
        } else if ($('#voice').is(':checked')) {
          sendType = 2;
        }
        var arr = [];
        var commGroupIds = mini.get('userGroups').getCheckedNodes(false);
        for (var i = 0, len = commGroupIds.length;i < len;i++) {
          arr.push(commGroupIds[i].key)
        }
        var data = {
          'accidentCategoryId': $('#accidentCategoryId').val(), //事故大类id
          'accidentTypeId': $('#accidentTypeId').val(), //事故小类id 
          'eventLvlId': $('#riskRankId').val() || '', //事故等级id 
          'riskArea': $('#systemId').val() || $('#userName').val(), //安全风险区
          'eventSummary': $('#eventAddress').val(), //警情概要
          'userUid': $('#eventSummary').val(), //接警账号
          'commGroupIds': arr, //通讯组id
          infoRecordEntity: []
        }
        var phoneNums = [];
        console.log($('.col-xs-10 span').text())
        // for (var i = 0, len = gridData.length; i < len; i++) {
        //   var obj = {
        //     answerName: gridData[i].userName,
        //     answerPhoneNumber: gridData[i].userMobile,
        //     remarks: $('.col-xs-10 span').text()
        //   }
        //   data.infoRecordEntity.push(obj);
        //   if (gridData[i].mark == 1) {
        //     phoneNums.push(gridData[i].userPhone);
        //   } else {
        //     phoneNums.push(gridData[i].userMobile);
        //   }
        // }
        var tempPersonData = mini.get('datagrid').getSelecteds(false);
        console.log(tempPersonData)
        for (var i = 0, len = tempPersonData.length; i < len; i++) {
          var obj = {
            answerName: tempPersonData[i].userName,
            answerPhoneNumber: tempPersonData[i].userMobile,
            remarks: $('.col-xs-10 span').text()
          }
          data.infoRecordEntity.push(obj);
          if (tempPersonData[i].mark == 1) {
            phoneNums.push(tempPersonData[i].privatePersonPhone);
          } else {
            phoneNums.push(tempPersonData[i].userMobile);
          }
        }
        if (sendType == 2 || sendType == 3) {
          if (page.logic.isExists(phoneNums)) {
            return;
          }
        }
        $.ajax({
          url: saveUrl,
          async: false,
          type: 'POST',
          data: JSON.stringify(data),
          dataType: "json",
          contentType: "application/json;charset=utf-8",
          beforeSend: function () {
            $('#btnSend').attr('disabled', 'disabled');
            ECS.showLoading();
          },
          success: function (result) {
            ECS.hideLoading();
            console.log(result); 
            if (result.isSuccess) {
              layer.msg(result.message, {
                time: 1000
              }, function () {
                location.reload();
              });
            } else{
              layer.msg(result.message);
            }        
            if (sendType == 2 || sendType == 3) {
              var res = parent.sendvox(phoneNums, $.trim($('#autoMsg').val()));
              //alert(res);
            }
          },
          error: function (result) {
            $('#btnSend').attr('disabled', false);
            ECS.hideLoading();
            layer.msg(result);
          }
        })
      },
      rendererOperate: function (e) {
        var id = e.record.privatePersonId;
        return '<a href="javascript:page.logic.del(' + id + ')">删除</a>';
      },
      del: function (id) {
        layer.confirm('确定删除吗？', {
          btn: ['确定', '取消']
        }, function () {
          $.ajax({
            url: delTempPersonUrl,
            data: JSON.stringify(id),
            dataType: "text",
            timeout: 1000,
            contentType: "application/json;charset=utf-8",
            type: 'DELETE',
            beforeSend: function () {
              ECS.showLoading();
            },
            success: function (result) {
              result = $.parseJSON(result);
              if (result.isSuccess) {
                layer.msg('删除成功', {
                  time: 1000
                }, function () {
                  page.logic.initTempTable();
                });
              } else {
                layer.msg(result.message, {
                  time: 1000
                });
              }
              ECS.hideLoading();
            }
          })
        }, function (index) {
          layer.close(index)
        });
      },
      onDrawcell: function (e) {
        if (e.field == 'mark' && e.record.userPhone == '') {
          e.cellHtml = '';
        } else if (e.field == 'mark' && e.record.privatePersonPhone == '') {
          e.cellHtml = '';
        }
      },
      isExists: function (arr) {
        var hash = {};
        for (var i = 0, len = arr.length; i < len; i++) {
          if (hash[arr[i]]) {
            layer.msg(arr[i] + '存在重复');
            return true;
          }
          hash[arr[i]] = true;
        }
        return false;
      }
    }
  };
  page.init();
  window.page = page;
});