jQuery.fn.putCursorAtEnd = function() {
    return this.each(function() {
        // If this function exists...
        if (this.setSelectionRange) {
            // ... then use it (Doesn't work in IE)
            // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
            var len = $(this).val().length * 2;
            this.setSelectionRange(len, len);
        } else {
            // ... otherwise replace the contents with itself
            // (Doesn't work in Google Chrome)
            $(this).val($(this).val());
        }
    });
};
function btnsmiao(){
	var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	video = document.getElementById("video");
	$("#snap").click(function(){
		var action=$(this).attr("data-action");
		if(action=='first'){
			$(this).attr("data-action",'second');
			$(".smiao-title").find(".widshow").addClass("bgshow").removeClass("widshow");
			$(".smiao-title").find("li").eq(1).addClass("widshow");
			$(this).html("拍照");
			vido();			
		}else if(action=="second"){
			video.pause();
			$(this).html("点击上传");
			$(".smiao-title").find(".widshow").addClass("bgshow").removeClass("widshow");
			$(".smiao-title").find("li").eq(2).addClass("widshow");
			$(this).attr("data-action",'three');
			//location.reload(true); 
		}else if(action=="three"){
			$(this).attr("data-action",'');
			$(".smiao-title").find(".widshow").addClass("bgshow");
			$(this).html("正在上传...");
			var that=this;
				context.drawImage(video, 0, 0, 329, 243);						
				var imgData = canvas.toDataURL("image/jpeg", 1.0).split(',')[1];//获取图片的base64格式的数据
		
		//      var data = imgData.substr(23);
		//      var jsonVal = {
		//          imgData: data,
		//          r: (new Date()).getTime()
		//      };
		//      var name = "name";
		//      var lgname;
		//      var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		//      if (arr = document.cookie.match(reg)) {
		//          lgname = unescape(arr[2]);
		//      }
										
				//根据人脸识别API获取用户编号（人脸识别开发提供）
				var datas = {
		            base64String: imgData, 
		            projectNumber: project
		        };
				$.ajax({
					type: "post",
					url:facehttp+"GetAccount",
					data: JSON.stringify(datas),
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					async: true,
					success: function(data) {					
						var msg = data ? "识别成功： " + data.replace(",", "") : "识别失败，请点击该区域重试或脸部特征库未录入您的信息，请及时联系工作人员";						
						if(data!=null&&data!=''){
							$(that).html("上传完成");
							data=data.replace(",", "");
							var arr= new Array(); //定义一数组 
							arr=data.split("&&"); //字符分割
							employeeNumber=arr[0];
							//对密码进行加密
							var timestamp = Date.parse( new Date());
							var pass1="EMN_"+employeeNumber+"_"+timestamp;
							//模拟登录
							$.ajax({
								type: "get",
								url:employeeNumHttp+"users?employeeNum="+employeeNumber,
								data:{},
								contentType: "application/json;charset=utf-8",
								dataType: "json",
								async: true,
								success: function(res) {
									console.log(res);
									if(res){
										var info=$.ET.toObjectArr(res);	
										var userCode=info[0].userCode;
										$("#username").val(userCode);
										$("#password").val(pass1+"_"+md5(userCode+employeeNumber+timestamp));
										$('#sub').click();	
									}																			
								},
								error: function(XMLHttpRequest, textStatus, errorThrown) {
									layer.msg("获取用户信息网络出错了");
								}
							});											
						}else{
							$(".smiao-title").find(".widshow").removeClass("bgshow widshow");
							$(".smiao-title").find("li").eq(1).removeClass("bgshow").addClass("widshow");
							video.play();
							$(that).attr("data-action",'second');							
							$(that).html("重新拍照");
							layer.msg(msg);
						}
						
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						layer.msg("人脸扫描网络出错了");
					}
				});
		}
	})
}
function vido(){
	var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	video = document.getElementById("video"),
	videoObj = { "video": true },
	errBack = function (error) {
		//console.log("Video capture error: ", error.code);
	};
	//navigator.getUserMedia这个写法在Opera中好像是navigator.getUserMedianow
	if (navigator.getUserMedia) {
		navigator.getUserMedia(videoObj, function (stream) {
			vsrc=stream;
			video.srcObject = stream;
			video.play();
		}, errBack);
	} else if (navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia(videoObj, function (stream) {
			vsrc=stream;
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, errBack);
	}else if(navigator.mozGetUserMedia){
		vsrc=stream;
		navigator.mozGetUserMedia(videoObj, function(stream) {
       	video.mozSrcObject = stream;
       	video.play();
      }, errBack);
	}else{
		layer.msg("您的设备不支持调用摄像，请跟换您的设备");
	}
}


function cavClick(){
	$("#videomos").click(function(){
		if($("#snap").attr("data-action")=="three"){
			$(".smiao-title").find(".widshow").removeClass("bgshow widshow");
			$(".smiao-title").find("li").eq(1).removeClass("bgshow").addClass("widshow");
			video.play();
			$("#snap").attr("data-action",'second');							
			$("#snap").html("重新拍照");
		}	
	})
}
