var vehicleUrl = ECS.api.rttUrl + '/vehicle';
//企业
var orgUrl = ECS.api.bcUrl + '/org/porgName';
//应急救援队伍
var rescueTeamUrl = ECS.api.rttUrl + "/vehicle/getTeamByOrgCode";
//导出
var exportFileUrl = ECS.api.rttUrl + "/vehicle/ExportToExcel";
//车辆大类
var vehicleBigTypeUrl = ECS.api.rttUrl + '/vehicleMaintain/getVehicleBigInfoList';
//车辆小类
var vehicleSmallTypeUrl = ECS.api.rttUrl + '/vehicleMaintain/';
//是否启用
var inUseUrl = ECS.api.commonUrl + "/getInUse";
pageflag =true;
redisKey ='';
$(function () {
    var page = {
        init: function () {
            mini.parse();                   //初始化miniui框架
            ECS.sys.RefreshContextFromSYS();//获取当前用户
            this.logic.initPage();
            page.logic.get_list(orgUrl, $("#orgCode"));
            this.logic.search();
            this.bindUI();                  //绑定事件
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                var inputValue = $.trim($(this).val());
                if (this.name != null && this.name != undefined && this.name != '') {
                    $(this).val(inputValue);
                    mini.get(this.name).setValue(inputValue);
                }
            });
            $('#btnAdd').click(function () {
                page.logic.add();
            });
            $('#btnDel').click(function () {
                page.logic.del();
            });
            $('#btnQuery').click(function () {
                page.logic.search();
            });
            $("#btnReset").click(function () {
                page.logic.reset();
            });
           // 导入
			$('#btnImp').click(function() {
				page.logic.imp();
            });
            //导出
            $("#btnExport").click(function () {
                var form = new mini.Form('searchForm');
                var data = form.getData();
                var urlParam = page.logic.setUrlK( data);

				window.open(exportFileUrl + "?" + urlParam);
              
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
                }, function (result) {
                    //mini.get('vehiclebigID').select(0);
                    //mini.get('vehiclebigID').doValueChanged();
                });
                ECS.util.bindCmb({
                    ctrId: 'teamID',
                    url: rescueTeamUrl,
                    data: { orgCode: oid },
                    idField: 'teamID',
                    textField: 'teamName'
                }, function () {
                    //mini.get('teamID').select(0);
                });
            });
            mini.get('vehiclebigID').on('valuechanged', function () {
                var bigId = mini.get('vehiclebigID').getValue();
                ECS.util.bindCmb({
                    async: false,
                    ctrId: 'vehicleSmallID',
                    url: vehicleSmallTypeUrl + bigId,
                    idField: 'vehicleSmallId',
                    textField: 'vehicleSmallName'
                }, function (result) {
                    mini.get('vehicleSmallID').setData(result.result);
                    //mini.get('vehicleSmallID').select(0);
                    //mini.get('vehicleSmallID').doValueChanged();
                });
            });
        },
        data: {
            param: {}
        },
        logic: {
            setUrlK: function (ojson) {

				var s = '', name, key;

				for (var p in ojson) {

					// if(!ojson[p]) {return null;} 

					if (ojson.hasOwnProperty(p)) { name = p };

					key = ojson[p];

					s += "&" + name + "=" + encodeURIComponent(key);

				};

				return s.substring(1, s.length);

			},
            initPage: function () {
                ECS.util.bindCmb({
                    ctrId: 'inUse',
                    url: inUseUrl,
                    data: { isAll: true },
                    idField: 'key',
                    textField: 'value'
                }, function () {
                    mini.get('inUse').select(0);
                });
            },
            //企业、二级单位的联动菜单
            get_list: function (url, oPar, Pid, cb) {
                if (Pid) {
                    //二级单位
                    var cur_url = url + "?isAll=true&orgPID=" + Pid + "&orgLvl=3";
                } else {
                    //企业
                    var cur_url = url + "?orgLvl=2";
                }
                $.ajax({
                    async: false,
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
                            mini.get("orgCode").loadList(Data, "orgId", "orgPID");
                            if (ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)) {
                                enterpriseCode = mini.get("orgCode").data[0].orgCode;
                                mini.get("orgCode").setValue(mini.get("orgCode").data[0].orgCode);
                            } else {
                                enterpriseCode = ECS.sys.Context.SYS_ENTERPRISE_CODE;
                                mini.get("orgCode").disable();
                                for (var w = 0; w < Data.length; w++) {
                                    (function (cur_key) {
                                        if (cur_key.orgCode == enterpriseCode) {
                                            mini.get("orgCode").setValue(cur_key.orgCode);
                                        }
                                    })(Data[w]);
                                }
                            }
                            if(mini.get('orgCode').value){
                                ECS.util.bindCmb({
                                    ctrId: 'teamID',
                                    url: rescueTeamUrl,
                                    data: { orgCode: mini.get('orgCode').value },
                                    idField: 'teamID',
                                    textField: 'teamName'
                                }, function () {
                                    //mini.get('teamID').select(0);
                                });

                               
                                ECS.util.bindCmb({
                                    async: false,
                                    ctrId: 'vehiclebigID',
                                    url: vehicleBigTypeUrl,
                                    data: { orgCode: mini.get('orgCode').value },
                                    idField: 'vehicleBigID',
                                    textField: 'vehicleBigName'
                                }, function (result) {
                                    //mini.get('vehiclebigID').select(0);
                                    //mini.get('vehiclebigID').doValueChanged();
                                });
                            }
                            mini.get('orgCode').doValueChanged();
                            cb && cb();
                        }
                    }
                });
            },
            search: function () {
                var grid = mini.get("datagrid");
                grid.set({
                    url: vehicleUrl,
                    ajaxType: "get",
                    dataField: "pageList"
                });
                var form = new mini.Form('searchForm');
                var data = form.getData();
                if (data.inUse == "-1") {
                    data.inUse = "";
                }
                grid.load(data);
            },
            reset: function () {
                var form = new mini.Form('searchForm');
                form.reset();
                page.logic.get_list(orgUrl, $("#orgCode"));
            },
            add: function () {
                ECS.util.detail({
                    url: 'VehicleAddOrEdit.html',
                    height: 500,
                    width: 900,
                    data: {
                        title: '新增应急车辆',
                        pageMode: PageModelEnum.NewAdd
                    }
                });
            },
            edit: function (uid) {
                var row = mini.get('datagrid').getRowByUid(uid);
                ECS.util.detail({
                    url: 'VehicleAddOrEdit.html',
                    height: 500,
                    width: 850,
                    data: {
                        title: '编辑应急车辆',
                        pageMode: PageModelEnum.Edit,
                        id: row.vehicleID
                    }
                });
            },
            del: function () {
                ECS.util.del({
                    url: vehicleUrl,
                    grid: mini.get('datagrid'),
                    idField: 'vehicleID'
                });
            },
            imp: function () {
                var impUrl = ECS.api.rttUrl +'/vehicle/importExcel'; 
                var exportUrl =  ECS.api.rttUrl +'/vehicle/ExportExcel'; 
                var confirmUrl =  ECS.api.rttUrl +'/vehicle/importAddAll'; 
                var pageUrl = '../../bc/UploadFile/UploadFile.html?' + Math.random();
                ECS.util.importExcel(impUrl,exportUrl,confirmUrl,pageUrl);
			
            },
          
            monitorHistory: function (uid) {
                var row = mini.get('datagrid').getRowByUid(uid);
                ECS.util.detail({
                    url: 'MonitorHistory.html',
                    height: 500,
                    width: 950,
                    data: {
                        title: '应急车辆检测状态历史记录',
                        pageMode: PageModelEnum.Edit,
                        id: row.vehicleID,
                        vehicleName: row.vehicleName
                    }
                });
            },
            rendererOperate: function (e) {
                var uid = e.record._uid;
                var edit = ECS.util.editRenderer(e);
                return edit + '<a href="javascript:window.page.logic.monitorHistory(' + uid + ')" class="ml__10" title="历史记录"><i class="icon-history edit"></i></a>';
            },

            showEquipmentEdit: function (e) {
                return '<a title="查看" href="javascript:window.page.logic.showEquipment()"><i class="icon-edit edit"></i></a>';
            },
            showEquipment: function () {
                var row  =mini.get("datagrid").getSelected();
                layer.open({
					type: 2,
					closeBtn: 1,
					area: ['80%', '60%'],
					skin: 'new-class',
					shadeClose: false,
					title: "车辆装备配置",
					content: 'EquipmentNumber.html?' + Math.random(),
					success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
						var iframeWin = window[layero.find('iframe')[0]['name']];
						
						iframeWin.page.logic.setData(row.emrgequips);
					
						
					},
					end: function () {
                      
                     
					}
				})
            },
        }
    };
    page.init();
    window.page = page;
});