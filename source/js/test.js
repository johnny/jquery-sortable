$(function () {
  var container = $('ol.test').sortable().data("sortable"),
  group = container.group
  group.relativePointer = $('ol.test li:eq(2)').position()
  if (window.console && window.console.profile) {
    console.profile("label for profile");
    console.time("processMove")
    group.processMove()
    console.timeEnd("processMove")
    console.profileEnd();
  }
})
