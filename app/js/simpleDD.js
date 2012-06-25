!function ( $, window){
  var pluginName = 'simpleDD',
  defaultMethod = 'init',
  document = window.document,
  defaults = {
    itemSelector: "li",
    tolerance: 0.7
  }

  function d(a,b) {
    return Math.sqrt(Math.pow(a[0]-b[0],2) + Math.pow(a[1] - b[1],2))
  }

  function List( element) {
    this.el = element;
  }

  List.prototype = {
    init: function  (options) {
      this.options = $.extend( {}, defaults, options)

      this.placeholder = $('<li class="placeholder"/>')

      this.el.on("mousedown", this.options.itemSelector, $.proxy(this.dragInit, this))
      // TODO should probably be on document
      $(document).on("mouseup", $.proxy(this.drop, this))
    },
    dragInit: function  (e) {
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
      e.preventDefault()

      if(!this.dragInitDone){
        this.item.addClass("dragged")
        this.getItems()
        this.setItemCenters()
        this.dragInitDone = true
      }
      
      // get position of cursor
      this.setPointer(e)
      this.item.css(this.pointer)

      // get Element right below the pointer
      var item = this.getNearestItem()
      if(item){
        if(this.movingUp())
          item.before(this.placeholder)
        else if(this.movingDown())
          item.after(this.placeholder)
      }

    },
    drop: function  (e) {
      e.preventDefault()

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
    getNearestItem: function  () {
      var pointerCord = [this.pointer.left,this.pointer.top],
      distances = this.itemCenters.map( function  (pos,i) {
        return [d(pointerCord, pos), i]
      }).sort(function  (a,b) {
        return a[0] - b[0]
      }),
      minDistance = distances[0][0] + this.options.tolerance

      var indexes = distances.filter(function  (item) {
        return item[0] < minDistance
      }).map(function (item) {
        return item[1]
      })

      if(indexes.length == 1 )
        return $(this.items[indexes[0]])
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
    setItemCenters: function  () {
      this.itemCenters = []
      var i = this.items.length
      while(i--){
        var $i = $(this.items[i]),
        pos = $i.position()
        this.itemCenters[i] = [ pos.left + $i.width()/2, pos.top + $i.height() / 2]
      }
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
