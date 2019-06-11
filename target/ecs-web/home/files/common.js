var facehttp="/cas/face/";
var employeeNumHttp="/cas/face/";
var project="001";
function data(){
	var mydate = new Date();
	var month=(mydate.getMonth()+1)+"月"+mydate.getDate()+"日";
	var year=mydate.getFullYear();
	var xinqi=mydate.getDay();
	switch(xinqi){
		case 0:xinqi="星期日";break;
		case 1:xinqi="星期一";break;
		case 2:xinqi="星期二";break;
		case 3:xinqi="星期三";break;
		case 4:xinqi="星期四";break;
		case 5:xinqi="星期五";break;
		case 6:xinqi="星期六";break;
	}
	var shi=mydate.getHours();
	var fen=mydate.getMinutes();
	var dat=xinqi+"&nbsp;&nbsp;&nbsp;&nbsp;";
	var noon="&nbsp;&nbsp;上午";
	if(shi>12){
		shi-=12;
		noon="&nbsp;&nbsp;下午";
	}
	if(shi<10) {
		dat+="0"+shi+":";
	} else {
		dat+=shi+":";
	}
	if(fen<10) {
		dat+="0"+fen;
	} else {
		dat+=fen;
	}
	dat+=noon;

	$(".leftMonth").html(month);
	$(".leftYear").html(year);
	$(".leftDate").html(dat);
}
setInterval("data()",30000)