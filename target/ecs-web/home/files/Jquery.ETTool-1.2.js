/*
 * 智能工厂ET转换工具V1.0版本
 * 作者：智能工厂平台组件组
 * 时间：2017/4/24 14:20
 * toObjectArr()方法：将collection+json格式转换成对象
 * toCollectionJson()方法：将对象转换成collection+json格式，适用于数据修改
 * getObjectTemplate()方法：获取template
 *****************************************************************************
 * 智能工厂ET转换工具V1.1版本
 * 作者：智能工厂平台组件组
 * 时间：2017/6/12 14:20
 * 有关template BUG修复
 * *****************************************************************************
 * 智能工厂ET转换工具V1.2版本
 * 作者：智能工厂平台组件组
 * 时间：2017/6/30 10:20
 * 增加获取分页信息的方法getPageInfo()
*/
jQuery.ET = {
	collection: {},
	Init: function(params) {
		var json;
		if(typeof(params) == "object") {
			if(Object.prototype.toString.call(params).toLowerCase() != "[object object]" && params.length) {
				return [];
			}
			json = params;
		} else if(typeof(params) == "string") {
			json = JSON.parse(params);
			if(!json) return [];
		}
		this.collection = json.collection;
	},
	toObjectArr: function(params) {
		this.Init(params);
		var returnArr = [];
		$(this.collection.items).each(function() {
			var o = {};
			$(this.data).each(function() {
				if($.trim(this.name).length > 0)
					o[this.name] = this.value;
			});
			$(this.links).each(function() {
				if($.trim(this.rel).length > 0) o[this.rel] = this.href;
			});
			returnArr.push(o);
		});
		return returnArr;
	},
	getPageInfo:function(params){
		this.Init(params);
		var returnArr=[];
		$(this.collection.page).each(function() {
			var o = {};
			$(this.data).each(function() {
				if($.trim(this.name).length > 0)
					o[this.name] = this.value;
			});
			returnArr.push(o);
		});
		return returnArr;
	},
	toCollectionJson: function(_object) {
		var json={
			"collection":{
				"templates":[{
					"data":[]
				}]
			}
		};
		for(var item in _object)
		{			
			json.collection.templates[0].data.push({"name":item,"value":_object[item]});
		}
		return json;
	},
	getObjectTemplate: function(params) {
		var o = {};
		if(this.collection.hasOwnProperty("templates")) {
			$(this.collection.templates[0].data).each(function() {
				if($.trim(this.name).length > 0)
					o[this.name] = this.value;
			});
			return o;
		}
		this.Init(params);
		return this.getObjectTemplate();
	}
};