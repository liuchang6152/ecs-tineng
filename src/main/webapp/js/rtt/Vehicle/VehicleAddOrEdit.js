var vehicleUrl = ECS.api.rttUrl + '/vehicle';
//企业                      
var orgUrl = ECS.api.bcUrl + '/org/porgName?orgLvl=1';
//应急救援队伍             
var rescueTeamUrl = ECS.api.rttUrl + "/vehicle/getTeamByOrgCode";
//导出  
var exportFileUrl = ECS.api.rttUrl + "/vehicle/ExportToExcel";
//车辆大类
var vehicleBigTypeUrl = ECS.api.rttUrl + '/vehicleMaintain/getVehicleBigInfoList';
//车辆小类
var vehicleSmallTypeUrl = ECS.api.rttUrl + '/vehicleMaintain/';
//企业类别
var orgTypeUrl = ECS.api.rttUrl + '/vehicle/vehicleTypeList';
//出警状态
var poactionStatusUrl = ECS.api.rttUrl + '/vehicle/poactionStatus';
//灭火剂类型
var exAgentUrl = ECS.api.rttUrl + '/vehicle/exAgent';
var listLength = 1;
var vehicleSmallAttributeLength = 0;
var attrsData = '';
var vehicleSmallID = '';
$(function () {
    var index = parent.layer.getFrameIndex(window.name);//获取子窗口索引
    var page = {
        init: function () {
            mini.parse();
            this.bindUI();
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            this.logic.initPage();
        },
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()))
            });
            $('#btnSave').click(function () {
                page.logic.save();
            });
            $(".btnClose").click(function () {
                page.logic.closeLayer(false);
            });
            $('#selectOwner').click(function () {
                page.logic.selectOwner();
            });
            $("#addNewName").click(function () {
                page.logic.generateMonitorCfg();
            });
            $(document).on('click', '.delName', function () {
                var row = $(this).closest('.row');
                var name = row.find('input[name^=cfgName]').val();
                var value = row.find('input[name^=cfgValue]').val();
                if (name != '' || value != '') {
                    layer.confirm('确定删除吗？', {
                        btn: ['确定', '取消']
                    }, function (index) {
                        row.remove();
                        listLength--;
                        layer.close(index);
                    }, function (index) {
                        layer.close(index);
                    });
                }
                else {
                    row.remove();
                    listLength--;
                }
                return false;
            });
            mini.get('orgCode').on('valuechanged', function (e) {
                var oid = e.value;
                ECS.util.bindCmb({
                    async: false,
                    ctrId: 'vehiclebigID',
                    url: vehicleBigTypeUrl,
                    data: { orgCode: oid },
                    idField: 'vehicleBigID',
                    textField: 'vehicleBigName'
                });
                ECS.util.bindCmb({
                    ctrId: 'teamID',
                    url: rescueTeamUrl,
                    data: { orgCode: oid },
                    idField: 'teamID',
                    textField: 'teamName'
                });
            });
            mini.get('vehiclebigID').on('valuechanged', function () {
                var bigId = mini.get('vehiclebigID').getValue();
                page.logic.bindSmallType(bigId);
                mini.get('vehicleSmallID').doValueChanged();
            });
            mini.get('vehicleSmallID').on('valuechanged', function (e) {
                page.logic.generateTypeCfg(e, attrsData);
            });
        },
        data: {
            param: {

            }
        },
        logic: {
            bindSmallType: function (bigTypeId) {
                ECS.util.bindCmb({
                    async: false,
                    ctrId: 'vehicleSmallID',
                    url: vehicleSmallTypeUrl + bigTypeId,
                    idField: 'vehicleSmallId',
                    textField: 'vehicleSmallName'
                }, function (result) {
                    mini.get('vehicleSmallID').setData(result.result);
                });
            },
            initPage: function () {
                page.logic.initOrg();

                $('#attrs').html('');

                ECS.util.bindCmb({
                    ctrId: 'vehicleType',
                    url: orgTypeUrl
                });

                ECS.util.bindCmb({
                    ctrId: 'poactionStatus',
                    url: poactionStatusUrl
                });

                ECS.util.bindCmb({
                    ctrId: 'exagentID',
                    url: exAgentUrl,
                    idField: 'exagentID',
                    textField: 'exAgentName'
                });

                mini.get('crtUserName').setValue(ECS.sys.Context.SYS_USER_NAME);
                mini.get('crtUserDept').setValue(ECS.sys.Context.SYS_ORG_UNIT_NAME);
                var myDate = new Date;
                var year = myDate.getFullYear();//获取当前年
                var yue = myDate.getMonth() + 1;//获取当前月
                var date = myDate.getDate();//获取当前日
                mini.get('crtDate').setValue(year + "-" + yue + "-" + date);
            },
            initOrg: function () {
                $.ajax({
                    url: orgUrl,
                    type: "GET",
                    success: function (data) {
                        mini.get('orgCode').loadList(data, "orgCode", "porgCode");
                        //若是企业用户，设置为不可用状态；
                        if (ECS.sys.Context.SYS_IS_HQ) {
                            mini.get('orgCode').setValue(data[0].orgCode);
                        } else {
                            enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                            mini.get("orgCode").disable();
                            for (var w = 0; w < data.length; w++) {
                                (function (cur_key) {
                                    if (cur_key.orgCode == ECS.sys.Context.SYS_ENTERPRISE_CODE) {
                                        mini.get("orgCode").setValue(cur_key.orgCode);
                                    }
                                })(data[w]);
                            }
                        }
                        mini.get('orgCode').doValueChanged();
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
            },
            generateTypeCfg: function (e, attrsData) {
                $('#attrs').html('');
                if (e.selected == null || e.selected == undefined || e.selected.vehicleSmallAttribute == null || e.selected.vehicleSmallAttribute.length == 0) {
                    return;
                }

                var attrs = e.selected.vehicleSmallAttribute.split(',');
                vehicleSmallAttributeLength = attrs.length;
                var datasource = [];
                if (vehicleSmallID == e.value) {
                    var arr = attrsData.split(',');
                    for (var i = 0, len = arr.length; i < len; i++) {
                        var kv = arr[i].split(':');
                        var k = kv[0];
                        var v = '';
                        if (kv.length == 2) {
                            v = kv[1];
                        }
                        var obj = {
                            key: k,
                            value: v
                        };
                        datasource.push(obj);
                    }
                }
                else {
                    for (var i = 0, len = attrs.length; i < len; i++) {
                        var obj = {
                            key: attrs[i],
                            value: ''
                        };
                        datasource.push(obj);
                    }
                }

                var str = '';
                for (var i = 0, len = datasource.length; i < len; i++) {
                    str += '<div class="row">' +
                        '<div class="col-xs-6">' +
                        '<div class="form-group">' +
                        '<label class="control-label col-xs-4">技术属性：</label>' +
                        '<div class="col-xs-8">' +
                        '<input name="vehicleSmallAttribute' + i + '" id="vehicleSmallAttribute' + i + '" class="mini-textbox" value="' + datasource[i].key + '" enabled="false" />' +
                        '</div>' +
                        '<span class="span-required">*</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col-xs-6">' +
                        '<div class="form-group">' +
                        '<label class="control-label col-xs-4">属性值：</label>' +
                        '<div class="col-xs-8">' +
                        '<input name="vehicleSmallAttributeValue' + i + '" id="vehicleSmallAttributeValue' + i + '" maxlength="200" class="mini-textbox" value="' + datasource[i].value + '" />' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                $('#attrs').append(str);
                mini.parse();
            },
            generateHTML:function(listLength,id,name,value){
             
                var str =
                ' <div class="row cfg">' +
                '<div class="col-xs-6  ">' +
                '<div class="form-group">' +
                '<label class="control-label col-xs-4">装备名称：</label>' +
                '<div class="col-xs-8">' +
                '<input name="cfgID' + listLength + '" id="cfgID' + listLength + '" class="mini-hidden" value="' + id + '" />' +
                '<input name="cfgName' + listLength + '" id="cfgName' + listLength + '" class="mini-textbox" value="' + name + '"/>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="col-xs-6">' +
                '<div class="form-group">' +
                '<label class="control-label col-xs-4">装备数量：</label>' +
                '<div class="col-xs-6">' +

                '<input name="cfgValue' + listLength + '" id="cfgValue' + listLength + '" class="mini-spinner" minValue="0" maxValue="999999" value="' + value + '"/>' +
                '</div>' +
                '<button class="btn btn-danger delName ml__10" style="width:auto;" type="button" title="删除"><span class="glyphicon glyphicon-minus"></span></button>' +
                '</div>' +
                '</div>' +
                '</div>';
                return str;
            },

            generateMonitorCfg: function (data) {
                var id = name = value = '';
                if (data != null && data != undefined) {
                    id = data.emrgequipId;
                    name = data.emrgequipName;
                    value = data.getEmrgequipAmount;
                }
              
                if(data){
                 
                    var str =   page.logic.generateHTML(listLength,id,name,value);
                    $("#nameList").before(str);
                    mini.parse();
                }else{
                    layer.open({
                        type: 2,
                        closeBtn: 1,
                        area: ['100%', '100%'],
                        skin: 'new-class',
                        shadeClose: false,
                        title: "装备选择组件",
                        content: 'SelectEquipment.html?' + Math.random(),
                        success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            
                            //iframeWin.page.logic.setData();
                        },
                        end: function () {
                            var emrgequips = [];

                            //cfg
                            $('.cfg').each(function (i) {
                              var id = $(this).find('input[name^=cfgID]').val();
                            
                              if (id != '') {
                                  emrgequips.push({
                                      emrgequipId: id
                                  });
                              }
                          });

                          var existPerson = [];
                          function isRepeat(params,list) {
                           
                              for (var i = 0; i < list.length; i++) {
                                  var obj = list[i];
                                  if (obj.emrgequipId == params.emrgEquipID) {
                                      existPerson.push(params.emrgEquipName);
                                      return true;
                                  }
                              }
                              return false;
                          }

                          for (var i = 0; i < window.ownDetail.length; i++) {
							var obj = window.ownDetail[i];
							if (!isRepeat(obj,emrgequips)) {
                                var str = page.logic.generateHTML(listLength,obj.emrgEquipID,obj.emrgEquipName,"");
                                var list =  $(".first");
                                if(list.length==1 && !mini.get("cfgID0").getValue()){
                                      mini.get("cfgID0").setValue(obj.emrgEquipID);
                                       mini.get("cfgName0").setValue(obj.emrgEquipName);
                                    
                                    
                                }else{
                                  $(".first").before(str);
                                  mini.parse();
                                }
  
                                mini.parse();
							} else {
								if (window.ownDetail.length > 0) {
									layer.msg("该装备已存在！" + existPerson.toString(','), {
										time: 1000
									});
									//	return false;
								}
							}

						}
                      
                            
                           
                          
                        }
                    })
                  



              
             
                mini.parse();
                listLength++;
            }
            },
            setData: function (data) {
                $('#title-main').text(data.title);
                page.data.param.pageMode = data.pageMode;
                page.data.param.id = data.id;
                if (data.pageMode != PageModelEnum.NewAdd) {
                    var form = new mini.Form('AddOrEditModal');
                    mini.get('inUse').setEnabled(true);
                    $.ajax({
                        url: vehicleUrl + '/' + data.id,
                        type: "get",
                        dataType: "json",
                        beforeSend: function () {
                            ECS.showLoading();
                        },
                        success: function (data) {
                            data.crtDate = ECS.util.DateRender(data.crtDate);
                            form.setData(data);
                            attrsData = data.vehicleAllattributes;
                            vehicleSmallID = data.vehicleSmallID;


                            var gridList = data.emrgequips;
                            // if (gridList.length == 1) {
                            //     mini.get('cfgID0').setValue(gridList[0].emrgequipId);
                            //     mini.get('cfgName0').setValue(gridList[0].emrgequipName);
                            //     mini.get('cfgValue0').setValue(gridList[0].getEmrgequipAmount);
                            // }
                    //  debugger;
                    //         for (var i = 1, len = gridList.length; i < len; i++) {
                    //             page.logic.generateMonitorCfg(gridList[i]);
                    //         }

                            for (var index = 0; index < gridList.length; index++) {
                              
                                page.logic.generateMonitorCfg(gridList[index]);
                            }
                         

                            page.logic.bindSmallType(data.vehiclebigID);
                            mini.get('vehicleSmallID').setValue(data.vehicleSmallID);
                            mini.get('vehicleSmallID').doValueChanged();
                            ECS.hideLoading();
                        },
                        error: function (result) {
                            ECS.hideLoading();
                            var errorResult = $.parseJSON(result.responseText);
                            layer.msg(errorResult.collection.error.message);
                        }
                    });
                }
            },
            save: function () {
                

                page.logic.formValidate();
                if (!$('#AddOrEditModal').valid()) {
                    return;
                }

                var data = ECS.form.getData('AddOrEditModal');
                var vehicleAllattributes = '';
                for (var i = 0; i < vehicleSmallAttributeLength; i++) {
                    vehicleAllattributes += data['vehicleSmallAttribute' + i] + ':' + data['vehicleSmallAttributeValue' + i] + ',';
                    delete data['vehicleSmallAttribute' + i];
                    delete data['vehicleSmallAttributeValue' + i];
                }
                data.vehicleAllattributes = vehicleAllattributes.substring(0, vehicleAllattributes.length - 1);

                data.vehicleCooToPojos = {
                    vehicleCooToAddress: data.vehicleCooToAddress,
                    vehicleCooToID: data.vehicleCooToID
                };
                delete data['vehicleCooToAddress'];
                delete data['vehicleCooToID'];

                data.emrgequips = [];

                                  //cfg
                                  $('.cfg').each(function (i) {
                                    var id = $(this).find('input[name^=cfgID]').val();
                                    var name = $(this).find('input[name^=cfgName]').val();
                                    var value =$(this).find('input[name^=cfgValue]').val();
                                    if (id != '' || name != '' || value != '') {
                                        data.emrgequips.push({
                                            emrgequipId: id,
                                          
                                            getEmrgequipAmount: value
                                        });
                                    }
                                });

                for (var i in data) {
                    if (i.indexOf('cfgID') > -1 || i.indexOf('cfgName') > -1 || i.indexOf('cfgValue') > -1) {
                        delete data[i];
                    }
                }

                ECS.util.addOrEdit({
                    url: vehicleUrl,
                    data: data,
                    pageMode: page.data.param.pageMode
                }, function (result) {
                    if (result.indexOf('collection') < 0) {
                        layer.msg(result, {
                            time: 1000
                        }, function () {
                            parent.page.logic.search();
                            page.logic.closeLayer(true);
                        });
                    } else {
                        layer.msg(result.collection.error.message);
                    }
                });
            },
            selectOwner: function () {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['700px', '450px'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: 'SelectOwner.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            pageMode: PageModelEnum.Details,
                            title: '人员选择',
                            orgCode: mini.get("orgCode").getValue()
                        };
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        mini.get('vehicleMobile').setValue(window.ownDetail.ownerContact);
                        mini.get('vehicleManager').setValue(window.ownDetail.userName);
                        mini.get('userID').setValue(window.ownDetail.userID);
                    }
                })
            },
            closeLayer: function (isRefresh) {
                parent.layer.close(index);
            },
            formValidate: function () {
                ECS.form.formValidate('AddOrEditModal', {
                    ignore: "",
                    rules: {
                        orgCode: {
                            required: true
                        },
                        teamID: {
                            required: true
                        },
                        vehicleName: {
                            required: true
                        },
                        vehicleCode: {
                            required: true
                        },
                        vehicleType: {
                            required: true
                        },
                        exagentID: {
                            required: true
                        },
                        poactionStatus: {
                            required: true
                        },
                        vehicleFullPeople: {
                            required: true,
                            number: true
                        },
                        vehicleManager: {
                            required: true
                        },
                        vehicleMobile: {
                            required: true
                        },
                        vehiclebigID: {
                            required: true
                        },
                        vehicleSmallID: {
                            required: true
                        }
                    }
                });
            }
        }
    };
    page.init();
    window.page = page;
});