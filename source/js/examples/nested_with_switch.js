$(function () {
  $("ol.nested_with_switch").sortable({
    group: 'nested'
  })
  
  $(".switch-container").on("click", ".switch", function  (e) {
    var method = $(this).hasClass("active") ? "enable" : "disable"
    $(e.delegateTarget).next().sortable(method)
  })
})
