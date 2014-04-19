$(function  () {
  var group = $("ol.serialization").sortable({
    group: 'serialization',
    delay: 500,
    onDrop: function (item, container, _super) {
      var data = group.sortable("serialize").get();

      var jsonString = JSON.stringify(data, null, ' ');

      $('#serialize_output2').text(jsonString);
      _super(item, container)
    }
  })
})
