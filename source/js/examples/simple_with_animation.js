$(function  () {
  $("ol.simple_with_animation").sortable({
    group: 'simple_with_animation',
    pullPlaceholder: false,
    onDrop: function  (item, targetContainer, _super) {
      var clonedItem = $('<li/>').css({height: 0})
      item.before(clonedItem)
      clonedItem.animate({'height': item.height()})
      
      item.animate(clonedItem.position(), function  () {
        clonedItem.detach()
        _super(item)
      })
    }
  })
})
