//接处警首页接口
var loginInfoUrl = ECS.api.apUrl + '/event/getIPInfo';//登录信息
var EventListUrl = ECS.api.apUrl + '/selectEvents?isFinished=0&eventType=0';    //“处理中事件”列表
var CheckEventListUrl = ECS.api.apUrl + '/selectEvents?eventType=0';             //“可查看事件”列表
var pcStatus = ECS.api.apIpVerify+'/getThisIPstatus';
//页面所需全局变量
var map = {};
var strIp = [];
// var strIp = "10.163.225.58";    //用作测试
var ipReader=null;
var hasArlamId={};
var callStatus=0;
var firelayer;
var number = parseInt(Math.random() * 1000000000);
var lockReconnect = false;
var time = null;
$(function () {
    var page = {
        init: function () {
            mini.parse();     //列表初始化
            this.bindUI();    //绑定事件
            //获取用户的相关数据
            ECS.sys.RefreshContextFromSYS();
            $("#userUid").val(ECS.sys.Context.SYS_USER_CODE);
            ECS.showLoading();
            page.logic.tryGetIP(0);
            page.logic.initPage();   //初始化
            page.logic.search();    //我的处理中事件
            page.logic.search2();   //可查看的事件
            setInterval(function(){
                $.ajax({
                    url:pcStatus+"?orgCode="+ECS.sys.Context.SYS_ENTERPRISE_CODE+"&ip="+strIp,
                    dataType:"text",
                    type:"GET",
                    success:function(result){
                        if(result==1){
                            $("#pcStatus").text("正忙");
                        }else{
                            $("#pcStatus").text("空闲");
                        }
                    }
                });
            },5000);
        },
        table: {},
        bindUI: function () {
            $('input').blur(function () {
                $(this).val($.trim($(this).val()));
            });
            //当tab切换时，加载内容；
            $('#nav_tabs li').click(function (e) {
                var isTab_btn = false;    //判断当前是否为tab标题；
                var tab_index = 0;         //当前点击的tab标题的索引值；
                setTimeout(function(){
                    //当前若点击的是a元素：
                    if(e.target.tagName=="A"){
                        if($(e.target).parent().hasClass("active")){
                            isTab_btn = true;
                            tab_index = $(e.target).parent().index();    //tab标题的索引值
                        }
                    }
                    //当前若点击的是li元素：
                    if(e.target.tagName=="LI"){
                        if($(e.target).hasClass("active")){
                            isTab_btn = true;
                            tab_index = $(e.target).index();    //tab标题的索引值
                        }
                    }
                    if(isTab_btn){
                        //进行加载当前的列表数据；
                        //我的处理中事件
                        if(tab_index==0){
                            page.logic.search();
                        }
                        //可查看的事件
                        if(tab_index==1){
                            page.logic.search2();
                        }
                    }
                },100);
            });
            //"手动接警"按钮，鼠标滑入滑出效果设置；
            $("#call_btn").hover(function(){
                $(this).css("background","#0b93d9");
            },function(){
                $(this).css("background","#45c8dc");
            });
            //查询
            $('#btnQuery').click(function() {
                page.logic.search();
            });
            //查询
            $('#btnQuery2').click(function() {
                page.logic.search2();
            });
            //释放
            $("#loginOut").click(function () {
                ipReader.pbx_Logout();
                ipReader.pbx_cleanup();
            });
            //手动接警
            $("#call_btn").click(function () {
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['100%', '100%'],
                    skin: 'new-class',
                    title: "<i class='title-vertical'></i><span class='box-title text-color'>手动接警</span>",
                    move: ".layui-layer-title",
                    offset: [
                        y=0
                    ],
                    shadeClose: false,
                    content: '../DirectAlarm/ManualAlarm.html?' + Math.random(),
                    zIndex: layer.zIndex,
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {"curIP":strIp};
                        iframeWin.page.logic.setData(data);
                    },
                    end: function () {
                        if(hasArlamId.isAlram){
                            hasArlamId.isAlram={};
                            layer.open({
                                type: 2,
                                closeBtn: 1,
                                area: ['100%', '100%'],
                                skin: 'new-class',
                                shadeClose: false,
                                title:false,
                                content: '../AutoHandlingCommon/index.html?eventId=' +hasArlamId.eventId+"&ip="+strIp+"&n="+ Math.random(),
                                success: function (layero, index) {
                                    var body = layer.getChildFrame('body', index);
                                    var iframeWin = window[layero.find('iframe')[0]['name']];
                                    hasArlamId.title="手动处警";
                                    iframeWin.page.logic.setData(hasArlamId);
                                },
                                end:function () {
                                    page.logic.search();    //我的处理中事件
                                    page.logic.search2();   //可查看的事件
                                }
                            });
                        }
                    }
                });
            });
        },
        data: {
            param: {}
        },
        logic: {
            tryGetIP: function(i){
                // 尝试获得当前ip
                try {
                    ipReader = document.getElementById("ipReader");
                    if(!ipReader) {
                        console.log("没有找到ip reader ocx");
                    }
                    var strIpMore = ipReader.readLocalIp();
                    strIp = strIpMore.split("|");//以|号作为多个IP的分隔字符串
                    if(strIp[i]!=null&&strIp[i]!=undefined){
                        strIp = strIp[i];
                        page.logic.register(strIp);
                        // page.logic.getLoginInfo(strIp);
                    }else{
                        $('#showInfo').text("本机IP地址："+strIp+"，未配置接警单元，无法执行接警操作");
                        alert("接警单元未注册本机IP，请联系管理员注册");
                        ECS.hideLoading();
                    }
                } catch (e) {
                    alert("ocx插件获取本机IP失败，请检查：\n1、浏览器是否为IE11；\n2、浏览器安全设置中是否信任本站点；\n3、浏览器安全设置中是否允许未经签名的ActiveX插件执行。\n如仍有问题请联系管理员。");
                    $('#showInfo').text("抓取本机IP地址失败，请联系管理员");
                    // page.logic.register(strIp);
                    ECS.hideLoading();
                    // console.log("无法获取IP地址,错误原因：" + e);
                }
            },
            //获取登录信息
            getLoginInfo:function(ip) {
                var res;
                $.ajax({
                    url: loginInfoUrl,
                    type: 'GET',
                    async: false,
                    data: { 'seatIp': ip },
                    success: function (loginInfo) {
                        if (loginInfo == null || loginInfo == undefined || !loginInfo.isSuccess) {
                            layer.msg('获取坐席信息失败，请联系系统管理员!');
                            return;
                        }
                        var init = ipReader.pbx_init();
                        ipReader.pbx_setNumber(loginInfo.result.callPhone);
                        ipReader.pbx_setLocalNumber(loginInfo.result.callPhone2);
                        var login = ipReader.pbx_login(loginInfo.result.phoneExchangeAccount,loginInfo.result.phoneExchangePWD, "192.168.20.10", "9800");
                        if (login == '200') {
                            layer.msg('ocx登录成功', {
                                time: 5000
                            });
                        } else {
                            layer.msg('ocx登录失败' + login, {
                                time: 5000
                            });
                        }
                    },
                    error: function (err) {
                        layer.msg("登陆失败，请联系系统管理员！");
                    }
                });
            },
            //注册ip
            register: function (ip) {
                $.ajax({
                    type: "GET",
                    url: ECS.api.apIpVerify + "/" + ECS.sys.Context.SYS_USER_CODE + "/" + number,
                    data: {"ip": ip },
                    dataType: "json",
                    async: false,
                    error: function (obj) {
                        alert(obj.message);
                        console.info(obj.message);
                        ECS.hideLoading();
                        return -1;
                    },
                    success: function (obj) {
                        alert(obj.message);
                        if(obj.isSuccess){
                            ECS.hideLoading();
                            $('#showInfo').text(obj.message.substring(5));
                            page.logic.ws_conn(obj);
                        }else{
                            ECS.hideLoading();
                            page.logic.tryGetIP(++ i);
                        }
                        return 0;
                    }
                })
            },
            ws_conn: function(obj) {
                var ws = new WebSocket(ECS.api.webSocket + "/websocket/" + number);
                // 建立 web socket 连接成功触发事件
                ws.onopen = function () {
                    clearTimeout(time);
                    // 使用 send() 方法发送数据
                    ws.send("注册完毕");
                };
                // 接收服务端数据时触发事件
                ws.onmessage = function (evt) {
                    //JSON字符串
                    var received_msg = JSON.parse(evt.data);
                    if(received_msg.alertStatus==4){
                        console.log(received_msg.time);
                        ws.send(new Date());
                    }else if (received_msg.alertStatus === 1) {
                        layer.open({
                            type: 2,
                            closeBtn: 0,
                            offset: [
                                y=0
                            ],
                            title: "<i class='title-vertical'></i><span class='box-title text-color'>自动接警</span>",
                            move: ".layui-layer-title",
                            area: ['100%', '100%'],
                            skin: 'new-class',
                            shadeClose: false,
                            content: '../AutomaticMonitoring/index.html?' + Math.random(),
                            success: function (layero, index) {
                                map[received_msg.uuid] = index;
                                var body = layer.getChildFrame('body', index);
                                var iframeWin = window[layero.find('iframe')[0]['name']];
                                var data = JSON.parse(evt.data);
                                data["curIP"] = strIp;
                                iframeWin.page.logic.setData(data);
                            },
                            end: function () {
                                if(hasArlamId.isAlram){
                                    hasArlamId.isAlram={};
                                    layer.open({
                                        type: 2,
                                        closeBtn: 1,
                                        area: ['100%', '100%'],
                                        skin: 'new-class',
                                        shadeClose: false,
                                        title:false,
                                        content: '../AutoHandlingCommon/index.html?eventId='+hasArlamId.eventId +"&ip="+strIp+"&n="+ Math.random(),
                                        success: function (layero, index) {
                                            var body = layer.getChildFrame('body', index);
                                            var iframeWin = window[layero.find('iframe')[0]['name']];
                                            hasArlamId.title="自动处警";
                                            iframeWin.page.logic.setData(hasArlamId);
                                        },
                                        end:function () {
                                            page.logic.search();    //我的处理中事件
                                            page.logic.search2();   //可查看的事件
                                        }
                                    });
                                }
                            }
                        });
                    } else if (received_msg.alertStatus === 2) {
                        layer.close(map[received_msg.uuid]);
                    }
                };
                // 断开 web socket 连接成功触发事件
                ws.onclose = function (e) {
                    console.log(e);
                    if (lockReconnect) return;
                    lockReconnect = true;
                    time = setTimeout(function() { //没连接上会一直重连，设置延迟避免请求过多
                        ws = new WebSocket(ECS.api.webSocket + "/websocket/" + number);
                        lockReconnect = false;
                    }, 2000);
                };
                ws.onerror = function (e) {
                    console.log(e);
                };
            },
            //电话报警
            phoneAlarmEven:function(alarm,answer){
                if(callStatus==0){
                    firelayer=layer.open({
                        type: 2,
                        closeBtn: 0,
                        area: ['100%', '100%'],
                        skin: 'new-class',
                        shadeClose: false,
                        offset: [
                            y=0
                        ],
                        title: "<i class='title-vertical'></i><span class='box-title text-color'>电话接警</span>",
                        move: ".layui-layer-title",
                        content: '../DirectAlarm/PhoneAlarm.html?' + Math.random(),
                        zIndex: layer.zIndex,
                        success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            var data = {"curIP":strIp,"mode":false,"alarmNum":alarm,"answerNum":answer};
                            iframeWin.page.logic.setData(data);
                        },
                        end: function () {
                            if(hasArlamId.isAlram){
                                hasArlamId.isAlram={};
                                layer.open({
                                    type: 2,
                                    closeBtn: 1,
                                    area: ['100%', '100%'],
                                    skin: 'new-class',
                                    shadeClose: false,
                                    title:false,
                                    content: '../AutoHandlingCommon/index.html?eventId='+hasArlamId.eventId +"&ip="+strIp+"&n="+ Math.random(),
                                    success: function (layero, index) {
                                        var body = layer.getChildFrame('body', index);
                                        var iframeWin = window[layero.find('iframe')[0]['name']];
                                        hasArlamId.title="电话处警";
                                        iframeWin.page.logic.setData(hasArlamId);
                                    },
                                    end:function () {
                                        callStatus = 0;
                                        page.logic.search();    //我的处理中事件
                                        page.logic.search2();   //可查看的事件
                                    }
                                });
                            }
                        }
                    });
                }
            },
            //已接电话
            answer:function() {
                callStatus = 1;
                ipReader.sp_answer();
            },
            initPage: function () {
                //“我的处理中事件”加载
                var isorgCode;
                if(ECS.sys.isHQ(ECS.sys.Context.SYS_ENTERPRISE_CODE)){
                    isorgCode="";
                }else{
                    isorgCode=ECS.sys.Context.SYS_ENTERPRISE_CODE;
                }
                var eventGrid = mini.get('eventDatagrid');
                eventGrid.set({
                    url: EventListUrl+"&orgCode="+isorgCode+"&ip="+strIp,
                    ajaxType: 'GET',
                    dataField: 'result.pageList',
                    totalField:'result.total'
                });
                // “可查看的事件”加载
                var historyGrid = mini.get('historyDatagrid');
                historyGrid.set({
                    url: CheckEventListUrl+"&orgCode="+isorgCode+"&ip="+strIp,
                    ajaxType: 'GET',
                    dataField: 'result.pageList',
                    totalField:'result.total'
                });
            },
            search: function () {
                //“我的处理中事件”查询
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm");
                var eventGrid = mini.get('eventDatagrid');
                eventGrid.load(page.data.param,function(sender){
                    if(sender.result.isSuccess){
                        $("#total_num").html(sender.result.result.total);
                    }else{
                        layer.msg(sender.result.message);
                        $("#total_num").html(0);
                        ECS.hideLoading();
                    }
                });
            },
            search2: function () {
                //“可查看的事件”查询
                page.data.param = {};
                page.data.param = ECS.form.getData("searchForm2");
                var historyGrid = mini.get('historyDatagrid');
                historyGrid.load(page.data.param,function(sender){
                    if(!sender.result.isSuccess){
                        layer.msg(sender.result.message);
                    }
                });
            },
            //流程回顾---链接添加；
            lookdetail:function(e){
                if(e.row.eventCode=="结束" || e.row.eventCode=="取消"){
                    return '<a href="javascript:window.page.logic.gotodetail('+e.row.eventId+');">查看</a>';
                }else{
                    return '<a href="javascript:window.page.logic.detail(\''+e.row.eventSource+'\',\''+e.row.eventId+'\',\''+e.row.eventCode+'\')">查看</a>';
                }
            },
            show_Detail:function(e){
                return '<a href="javascript:window.page.logic.detail(\''+e.row.eventSource+'\',\''+e.row.eventId+'\',\''+e.row.eventCode+'\')">'+e.value+'</a>';
            },
            //警情回顾记录-------
            gotodetail:function(EventId){
                layer.open({
                    type: 2,
                    closeBtn: 0,
                    area: ['80%', '80%'],
                    skin: 'new-class',
                    shadeClose: false,
                    title: false,
                    content: './EventFlow.html?' + Math.random(),
                    success: function (layero, index) {
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']];
                        var data = {
                            "EventId": EventId
                        };
                        iframeWin.page.logic.setData(data);
                    }
                });
            },
            detail: function (type,eventId,eventCode) {
                var pageUrl = "";     //跳转的页面路径
                if(eventCode=="接警"){
                    switch(type){
                        case "自动":
                            pageUrl = "../AutomaticMonitoring/index.html";
                            break;
                        case "手动":
                            pageUrl = "./../DirectAlarm/ManualAlarm.html";
                            break;
                        case "电话":
                            pageUrl = "../DirectAlarm/PhoneAlarm.html";
                            break;
                    }
                    layer.open({
                        type: 2,
                        closeBtn: 0,
                        area: ['100%', '100%'],
                        shadeClose: false,
                        skin: 'new-class',
                        title: "<i class='title-vertical'></i><span class='box-title text-color'>"+type+eventCode+"</span>",
                        content: pageUrl+"?r=" + Math.random(),
                        success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            var data = {"eventId":eventId,"mode":true,"curIP":strIp};
                            iframeWin.page.logic.setData(data);
                        },
                        end: function () {
                            page.logic.search();    //我的处理中事件
                            page.logic.search2();   //可查看的事件
                            if(hasArlamId.isAlram){
                                hasArlamId.isAlram={};
                                layer.open({
                                    type: 2,
                                    closeBtn: 1,
                                    area: ['100%', '100%'],
                                    skin: 'new-class',
                                    shadeClose: false,
                                    title:false,
                                    content: '../AutoHandlingCommon/index.html?eventId='+hasArlamId.eventId+"&ip="+strIp + "&n="+Math.random(),
                                    success: function (layero, index) {
                                        var body = layer.getChildFrame('body', index);
                                        var iframeWin = window[layero.find('iframe')[0]['name']];
                                        hasArlamId.title="自动处警";
                                        iframeWin.page.logic.setData(hasArlamId);
                                    },
                                    end:function () {
                                        page.logic.search();    //我的处理中事件
                                        page.logic.search2();   //可查看的事件
                                    }
                                });
                            }
                        }
                    })
                }else if(eventCode=="处警"){
                    pageUrl = './../AutoHandlingCommon/index.html?eventId='+eventId+"&ip="+strIp;
                    layer.open({
                        type: 2,
                        closeBtn: 0,
                        area: ['100%', '100%'],
                        shadeClose: false,
                        skin: 'new-class',
                        title:false,
                        content: pageUrl+"&n=" + Math.random(),
                        success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            var data = {"eventId":eventId,"ip":hasArlamId.curIP,"title":type+eventCode};
                            iframeWin.page.logic.setData(data);
                        },
                        end: function () {
                            page.logic.search();    //我的处理中事件
                            page.logic.search2();   //可查看的事件
                        }
                    })
                }
            }
        }
    };
    page.init();
    window.page = page;
});