!function ($) {

  "use strict"; // jshint ;_;


  /* SWITCH PUBLIC CLASS DEFINITION
   * ============================== */

  var Switch = function (element, options) {
    this.init(element, options)
  }
  
  Switch.prototype = {
    
    constructor: Switch

    , init: function (element, options) {
      this.$element = $(element)
      this.options = $.extend({}, $.fn.switchbtn.defaults, options)

      this.addChildren()

      this.$element.on('click.switch.data-api', $.proxy(this.toggle, this))
    }

    , toggle: function (e) {
      var $el = this.$element
      , disabled = 'disabled'
      , active = 'active'

      if ($el.attr(disabled) || $el.hasClass(disabled)) return
      
      $el.toggleClass(active)
      this.$checkbox && this.$checkbox.attr('checked', $el.hasClass(active))
    }

    , addChildren: function () {
      var $el = this.$element
      , options = this.options

      $el.empty()

      this.$checkbox = options.checkbox
        && $('<input type="checkbox"/>')
        .attr('name', options.checkbox)
        .attr('checked', $el.hasClass('active'))
        .appendTo($el)

      $('<span/>')
        .addClass('switch-track')
        .appendTo($el)
      $('<span/>').addClass('switch-thumb')
        .attr('data-on', options.on)
        .attr('data-off', options.off)
        .appendTo($el)
    }

  }


  /* SWITCH PLUGIN DEFINITION
   * ======================== */

  // IE8- incorrectly treat the 'switch' in '$.fn.switch' as a reserved word so we'll use '$.fn.switchbtn' instead
  $.fn.switchbtn = function (option) {
    return this.each(function () {
      var $this = $(this)
      , data = $this.data('switch')
      , options = typeof option == 'object' && option
      data || $this.data('switch', (data = new Switch(this, options)))
      option == 'toggle' && data.toggle()
    })
      }

  $.fn.switchbtn.defaults = {
    on: 'ON'
    , off: 'OFF'
    , checkbox: false
  }

  $.fn.switchbtn.Constructor = Switch


  /* SWITCH DATA-API
   * =============== */

  $(function () {
    $('[data-toggle="switch"]').each(function () {
      var $switch = $(this)
      $switch.switchbtn($switch.data())
    })
      })

}(window.jQuery);

