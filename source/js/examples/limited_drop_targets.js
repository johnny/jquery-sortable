$(function  () {
  $("ol.limited_drop_targets").sortable({
    group: 'limited_drop_targets',
    isValidTarget: function  (item, container) {
      if(item.is(".highlight"))
        return true
      else {
        return item.parent("ol")[0] == container.el[0]
      }
    }
  })
})
