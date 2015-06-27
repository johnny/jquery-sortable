$(function () {
  // Sortable rows
  $('.sorted_table').sortable({
    containerSelector: 'table',
    itemPath: '> tbody',
    itemSelector: 'tr',
    placeholder: '<tr class="placeholder"/>'
  });

  // Sortable column heads
  var oldIndex;
  $('.sorted_head tr').sortable({
    containerSelector: 'tr',
    itemSelector: 'th',
    placeholder: '<th class="placeholder"/>',
    vertical: false,
    onDragStart: function ($item, container, _super) {
      oldIndex = $item.index();
      $item.appendTo($item.parent());
      _super($item, container);
    },
    onDrop: function  ($item, container, _super) {
      var field,
          newIndex = $item.index();

      if(newIndex != oldIndex) {
        $item.closest('table').find('tbody tr').each(function (i, row) {
          row = $(row);
          if(newIndex < oldIndex) {
            row.children().eq(newIndex).before(row.children()[oldIndex]);
          } else if (newIndex > oldIndex) {
            row.children().eq(newIndex).after(row.children()[oldIndex]);
          }
        });
      }

      _super($item, container);
    }
  });
});
