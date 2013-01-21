$(function() {
  $("ol.simple_with_drop").sortable({
    group: 'no-drop',
    handle: 'i.icon-move',
    onDragStart: function (item, container, _super) {
      // Duplicate items of the no drop area
      if(!container.options.drop)
        item.clone().insertAfter(item)
      _super(item)
    }
  })
  $("ol.simple_with_no_drop").sortable({
    group: 'no-drop',
    drop: false
  })
  $("ol.simple_with_no_drag").sortable({
    group: 'no-drop',
    drag: false
  })
})
