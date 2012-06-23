!function ( $, window){
  var pluginName = 'simpleDD',
  defaultMethod = 'init',
  document = window.document,
  defaults = {
    itemSelector: "li"
  }

  function List( element) {
    this.el = element;
  }

  List.prototype = {
    init: function  (options) {
      this.options = $.extend( {}, defaults, options)
      console.log("init");

      this.placeholder = $('<li class="placeholder"/>')

      this.el.on("mousedown", this.options.itemSelector, $.proxy(this.dragInit, this))
      // TODO should probably be on document
      $(document).on("mouseup", $.proxy(this.drop, this))
    },
    dragInit: function  (e) {
      console.log("success");
      e.preventDefault()
      this.el.on("mousemove", $.proxy(this.drag, this))

      // create placeholder
      this.item = $(e.target).closest(this.options.itemSelector)

      this.offset = this.el.offset()
      this.height = this.el.height()
      this.width = this.el.width()
      this.setPointer(e)
    },
    drag: function  (e) {
      console.log("move");
      e.preventDefault()

      if(!this.dragInitDone){
        this.item.addClass("dragged")
        this.getItems()
        this.getItemPositions()
        this.dragInitDone = true
      }
      
      // get position of cursor
      this.setPointer(e)
      this.item.css(this.pointer)

      // get Element right below the pointer
      var underlyingItem = this.getUnderlyingItem()
      if(this.movingUp())
        underlyingItem.before(this.placeholder)
      else if(this.movingDown())
        underlyingItem.after(this.placeholder)

    },
    drop: function  (e) {
      e.preventDefault()
      console.log("stop");

      this.el.off("mousemove")

      if(!this.dragInitDone)
        return;
      
      // replace placeholder with current item
      this.placeholder.before(this.item).detach()
      this.item.removeClass("dragged")
      this.dragInitDone = false
    },
    setPointer: function (e) {
      var pointer = {
        left: e.pageX - this.offset.left,
        top: e.pageY - this.offset.top
      }

      if(pointer.left < this.width && pointer.top < this.height){
        this.lastPointer = this.pointer
        this.pointer = pointer
      }
    },
    getUnderlyingItem: function  () {
      var pos, diff,
      i = this.items.length,
      y = this.pointer.top,
      nearest = this.height,
      nearestIndex = i - 1

      while(i--){
        pos = this.itemPositions[i]
        diff = (pos.top + pos.bottom) / 2
        console.log(diff, y, nearest);
        if(Math.abs(diff - y) < nearest){
          nearest = Math.abs(diff - pos.top)
          nearestIndex = i
        }
      }
      console.log($(this.items[nearestIndex]));
      return $(this.items[nearestIndex]);
    },
    movingUp: function  () {
      return this.lastPointer.top - this.pointer.top > 0
    },
    movingDown: function  () {
      return this.lastPointer.top - this.pointer.top < 0
    },
    getItems: function  () {
      // TODO optimize
      this.items = this.el.find(this.options.itemSelector).filter(function  () {
        var t = $(this)
        return !(t.hasClass("dragged") || t.hasClass("placeholder"))
      })
    },
    getItemPositions: function  () {
      this.itemPositions = $.map(this.items, function  (item, i) {
        var $i = $(item),
        pos = $i.position()
        pos.bottom = pos.top + $i.height()
        pos.right = pos.left + $i.width()
        return pos
      })
      console.log(this.items, this.itemPositions);
    }
  }

  function get($element, constructor, dataField){
    var data = $element.data(dataField);
    if (!data) {
      data = new constructor($element);
      $element.data(dataField, data);
    }
    return data;
  }
  /**
   * Validates forms
   *
   * @memberOf jQuery.isValid.prototype
   *
   * @param {String} [method="check"] The method to call
   */
  $.fn[pluginName] = function(method, options) {
    console.log('here');
    if(typeof method !== "string"){
      options = method
      method = defaultMethod
    }
    
    return this.each(function(){
      var object = get( $(this), List, pluginName);
      
      if (!object[method]) {
        method = defaultMethod
      }

      object = object[method](options)
    });
  };

}(jQuery, window)
