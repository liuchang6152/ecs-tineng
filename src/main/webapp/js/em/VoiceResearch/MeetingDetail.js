$(document).ready(function(){
	
	context.init({preventDoubleContext: false});

	context.attach('html', [
		{header: '操作'},
	
		{text: '请离场', action: function(e){
		
			alert('html contextual menu destroyed!');
		}},
		{text: '静音', action: function(e){
		
		}},{text: '全员静音', action: function(e){
          var select =  $(".selectorDiv li input:checked")

		}}
	]);
	
	
	$(document).on('mouseover', '.me-codesta', function(){
		$('.finale h1:first').css({opacity:0});
		$('.finale h1:last').css({opacity:1});
	});
	
	$(document).on('mouseout', '.me-codesta', function(){
		$('.finale h1:last').css({opacity:0});
		$('.finale h1:first').css({opacity:1});
	});
	
});