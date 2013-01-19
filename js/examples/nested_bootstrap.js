$(function  () {
  $("ol.nav").sortable({
    group: 'nav',
    nested: false,
    vertical: false,
    exclude: '.divider-vertical'
  })
  $("ol.dropdown-menu").sortable({
    group: 'nav'
  })
})
;
