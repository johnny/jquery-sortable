$(function  () {
  var group = $("ol.serialization").sortable({
    group: 'serialization',
    delay: 1000,
    onDrop: function (item, container, _super) {
      $('#serialize_output2').text(group.sortable("serialize").get().join("\n"))
      _super(item, container)
    }
  })
})
