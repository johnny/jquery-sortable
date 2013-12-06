//= require "vendor/jquery"
//= require "jquery-sortable"

$(function () {
	$('#root.region').sortable({
		group: 'nested',
		itemSelector: '.part, .layout',
    containerSelector: '.region',
		nested: true,
		placeholder: '<div class="placeholder">Drop here</div>',
	});
})
