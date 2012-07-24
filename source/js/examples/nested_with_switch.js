$(function () {
  var oldContainer
  $("ol.nested_with_switch").sortable({
    group: 'nested',
    afterMove: function (placeholder, container) {
      if(oldContainer != container){
        if(oldContainer)
          oldContainer.el.removeClass("active")
        container.el.addClass("active")
        
        oldContainer = container
      }
    },
    onDrop: function (item, container, _super) {
      container.el.removeClass("active")
      _super(item)
    }
  })
  
  $(".switch-container").on("click", ".switch", function  (e) {
    var method = $(this).hasClass("active") ? "enable" : "disable"
    $(e.delegateTarget).next().sortable(method)
  })
})
