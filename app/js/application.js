//= require "jquery"
//= require "simpleDD"

$(function  () {
  $("ul.simpleDD").simpleDD({group: 'notNested'})
  $("ul.simpleDD2").simpleDD({group: 'nested'})
  $("ul.nav").simpleDD({group: 'nav',
                        nested: false})
  $("ul.dropdown-menu").simpleDD({group: 'nav'})
}
)
