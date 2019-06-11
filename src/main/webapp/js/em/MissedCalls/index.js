var phone;
var page = {
    bindUI: function(){

    },
    logic: {
        setData:function() {},
        phone: function(item){
            phone = item.ringUpNumber;
        },
        dialPhone: function(){
            console.log(phone)
            if (phone) {
               parent.callNs(phone);
            }else{
                layer.msg('请选呼叫对象');
            }
        }
    }
}
var vm = new Vue({
	el: '#main',
	data: {
        items: '',//未接来电
        itemAll:'',//未接来电历史记录
        total : 0 ,
        untotal : 0
        
		
	},
	mounted: function () {
		
	},

	methods: {
		
	},


});







// tab切换请求
var callsUrl = ECS.api.apUrl + '/fileAlarmChild/getMissedCalls?r='+ Math.random();;
getList();

function getList(){
    $.get(callsUrl,function(res){
        vm.items = res.newList;
        vm.itemAll = res.list;
        vm.total =vm.items.length;
        vm.untotal =vm.itemAll.length;
        console.log(res)
        console.log(res.list)
        // if(promiss == 'new'){
            
        //     // $('#missed_numbers').html('('+ data.length+ ')');
        // }else{
            
        //     // $('#missed_number').html('('+ data.length+ ')');
        // }
        // console.log(data.length)

    });
}

