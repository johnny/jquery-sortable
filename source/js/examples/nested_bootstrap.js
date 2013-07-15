$(function  () {
  $("ol.nav").sortable({
    group: 'nav',
    nested: false,
    vertical: false,
    exclude: '.divider-vertical',
    onDragStart: function($item, container, _super) {
      $item.find('ol.dropdown-menu').sortable('disable')
      _super($item, container)
    },
    onDrop: function($item, container, _super) {
      $item.find('ol.dropdown-menu').sortable('enable')
      _super($item, container)
    }
  })
  $("ol.dropdown-menu").sortable({
    group: 'nav'
  })
})
