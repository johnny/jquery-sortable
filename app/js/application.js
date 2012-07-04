//= require "jquery"
//= require "vendor/bootstrap-switch"
//= require "vendor/jquery.color"
//= require "simpleDD"

$(function  () {
  $("ul.simple").simpleDD({
    group: 'notNested',
    handle: 'i.icon-move'
  }).on("dropItem", function  (e, item, group) {
    item.animate({
      "background-color": "red"
    }, 500, function  () {
      item.animate({
        "background-color": "#fff"
      })
    }
    )
  }
)
  $("ul.no-drop").simpleDD({
    group: 'notNested',
    handle: 'i.icon-move',
    drop: false
  })


  
  $("ul.nested").simpleDD({group: 'nested'})
  $("h1").on("click", ".switch", function  (e) {
    var method = $(this).hasClass("active") ? "enable" : "disable"
    $(e.delegateTarget).next().simpleDD(method)
  })

  
  $("ul.nav").simpleDD({
    group: 'nav',
    nested: false,
    vertical: false
  })
  $("ul.dropdown-menu").simpleDD({group: 'nav'})
}
)
