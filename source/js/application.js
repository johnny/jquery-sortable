//= require "vendor/jquery"
//= require "vendor/jquery.color"
//= require "vendor/bootstrap-switch"
//= require "vendor/bootstrap-scrollspy"
//= require "vendor/bootstrap-dropdown"
//= require "vendor/bootstrap-button"
//= require "jquery-sortable"
//= require_directory "./examples/"

$(function  () {
  if(!/test/.test(window.location.pathname))
    $('body').scrollspy()
  $('.show-code').on('click', function  () {
    $(this).closest('.row').children('.example').slideToggle()
  })
  $('ol.default').sortable()
})
