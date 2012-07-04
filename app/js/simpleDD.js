!function ( $, window, undefined){
  var pluginName = 'simpleDD',
  document = window.document,
  $document = $(document),
  defaults = {
    itemSelector: "li",
    containerSelector: "ul",
    nested: true,
    vertical: true,
    drop: true,
    placeholder: '<li class="placeholder"/>'
  },
  containerGroups = {},
  groupCounter = 0

  /*
   * a is Array [left, right, top, bottom]
   * b is array [left, top]
   */
  function d(a,b) {
    var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
    y = Math.max(0, a[2] - b[1], b[1] - a[3])
    return x+y;
  }

  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  }

  function setDimensions(array, dimensions, useOffset) {
    var i = array.length,
    offsetMethod = useOffset ? "offset" : "position"
    while(i--){
      var el = array[i].el ? array[i].el : $(array[i]),
      // use fitting method
      pos = el[offsetMethod]()
      dimensions[i] = [
        pos.left,
        pos.left + el.outerWidth(true),
        pos.top,
        pos.top + el.outerHeight(true)
      ]
    }
  }

  function getRelativePosition(pointer, element) {
    var offset = element.offset()
    return {
      left: pointer.left - offset.left,
      top: pointer.top - offset.top
    }
  }

  function getNearest(dimensions, pointer, lastPointer) {
    pointer = [pointer.left, pointer.top]
    lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

    var dim,
    i = dimensions.length,
    distances = []

    while(i--){
      dim = dimensions[i]
      distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
    }
    distances = distances.sort(function  (a,b) {
      return a[1] - b[1] || a[2] - b[2] || a[0] - b[0]
    })

    return distances[0]
  }

  function ContainerGroup(options) {
    this.options = $.extend({},options)
    this.containers = []
    this.childGroups = []
    this.scrollProxy = $.proxy(this.scrolled, this)
    this.dragProxy = $.proxy(this.drag, this)
    this.dropProxy = $.proxy(this.drop, this)
    if(this.options.parentGroup)
      this.options.parentGroup.childGroups.push(this)
    else
      this.placeholder = $(this.options.placeholder)
  }

  ContainerGroup.get = function  (options) {
    if( !containerGroups[options.group]) {
      if(!options.group)
        options.group = groupCounter ++
      containerGroups[options.group] = new ContainerGroup(options)
    }
    return containerGroups[options.group]
  }

  ContainerGroup.prototype = {
    dragInit: function  (e, itemContainer) {
      $document.on("mousemove", this.dragProxy)
      $document.on("mouseup", this.dropProxy)

      // get item to drag
      this.item = $(e.target).closest(this.options.itemSelector)

      this.setPointer(e)
    },
    drag: function  (e) {
      e.preventDefault()

      if(!this.dragging){
        this.item.css({
          height: this.item.height(),
          width: this.item.width()
        })
        this.item.addClass("dragged")
        this.childContainers(this.item, "disable")
        this.dragging = true
      }

      if(!this.setPointer(e))
        return;

      // place item under the cursor
      this.item.css(getRelativePosition(this.pointer, this.item.offsetParent()))

      var x = e.pageX,
      y = e.pageY,
      box = this.sameResultBox
      if(!box || box.top > y || box.bottom < y || box.left > x || box.right < x)
        this.processMove()
    },
    drop: function  (e) {
      e.preventDefault()

      $document.off("mousemove", this.dragProxy)
      $document.off("mouseup", this.dropProxy)

      if(!this.dragging)
        return;

      var container = this.getContainer(this.placeholder)
      container.addItem(this.item, this.itemChildGroup);
      delete this.itemChildGroup

      this.deleteDimensions()

      // replace placeholder with current item
      this.placeholder.before(this.item).detach()
      this.item.removeClass("dragged").attr("style","")
      this.childContainers(this.item, "enable")

      this.dragging = false
      container.el.trigger("dropItem", [this.item, this])
    },
    processMove: function  (pointer, lastPointer) {
      if(!pointer){
        pointer = this.relativePointer || this.pointer
        lastPointer = this.lastRelativePointer || this.lastPointer
      }

      var nearest = getNearest(this.getContainerDimensions(),
                               pointer,
                               lastPointer)
      if(nearest){
        var index = nearest[0],
        container = this.containers[index]
        if(!this.getOffsetParent()){
          var offsetParent = container.getItemOffsetParent()
          pointer = getRelativePosition(pointer, offsetParent)
          lastPointer = getRelativePosition(lastPointer, offsetParent)
        }
        container.processMove(pointer, lastPointer)
      }
    },
    movePlaceholder: function  (item, method, sameResultBox) {
      var lastAppendedItem = this.lastAppendedItem
      if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
        return;

      item[method](this.placeholder)
      this.lastAppendedItem = item
      this.sameResultBox = sameResultBox
    },
    getContainerDimensions: function  () {
      if(!this.containerDimensions)
        setDimensions(this.containers, this.containerDimensions = [], !this.getOffsetParent())
      return this.containerDimensions
    },
    getContainer: function  (element) {
      return element.closest(this.options.containerSelector).data(pluginName)
    },
    getOffsetParent: function  () {
      if(this.offsetParent === undefined){
        var i = this.containers.length - 1,
        offsetParent = this.containers[i].getItemOffsetParent()

        while(i--){
          if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
            // If every container has the same offset parent,
            // use position() which is relative to this parent,
            // otherwise use offset()
            $document.on("scroll", this.scrolledProxy)
            offsetParent = false
            break;
          }
        }
        this.offsetParent = offsetParent
      }
      return this.offsetParent
    },
    setPointer: function (e) {
      var pointer = {
        left: e.pageX,
        top: e.pageY
      }

      if(this.getOffsetParent()){
        var relativePointer = getRelativePosition(pointer, this.getOffsetParent())
        this.lastRelativePointer = this.relativePointer
        this.relativePointer = relativePointer
      }

      this.lastPointer = this.pointer
      this.pointer = pointer
      return true
    },
    addContainer: function  (container) {
      this.containers.push(container);
      delete this.containerDimensions
    },
    removeContainer: function (container) {
      var i = this.containers.indexOf(container)
      this.containers.remove(i);
      delete this.containerDimensions
    },
    childContainers: function  (item, method) {
      var childContainers = item.find(this.options.containerSelector),
      i = childContainers.length

      // disable containers, that are not proper childContainers
      while(i--){
        var container = childContainers.eq(i).data(pluginName)
        if(container && container.parentGroup == container.rootGroup)
          container[method]()
      }

    },
    scrolled: function  (e) {
      delete this.containerDimensions
    },
    deleteDimensions: function  () {
      // delete centers in every container and containergroup
      delete this.containerDimensions
      var i = this.containers.length
      while(i--){
        delete this.containers[i].itemDimensions
      }
      i = this.childGroups.length
      while(i--){
        this.childGroups[i].deleteDimensions()
      }
    }
  }

  function Container(element, options) {
    this.el = element
    this.childGroups = []
    this.floatRight = false
    this.dragInitProxy = $.proxy(this.dragInit, this)
    this.options = $.extend( {}, defaults, options)

    this.group = ContainerGroup.get(this.options)
    this.rootGroup = this.options.rootGroup = this.options.rootGroup || this.group
    this.parentGroup = this.options.parentGroup = this.options.parentGroup || this.group
    this.handle = this.options.handle || this.options.itemSelector

    this.enable()
  }

  Container.prototype = {
    dragInit: function  (e) {
      if(e.button !== 0)
        return;
      
      e.preventDefault()
      e.stopPropagation()

      this.getItems()

      this.rootGroup.dragInit(e, this)
    },
    processMove: function  (pointer, lastPointer) {
      // get Element right below the pointer
      var nearest = getNearest(this.getItemDimensions(),
                               pointer,
                               lastPointer),
      rootGroup = this.rootGroup
      if(!nearest)
        rootGroup.movePlaceholder(this.el, "append")
      else {
        var index = nearest[0],
        distance = nearest[1]
        
        if(rootGroup.itemChildGroup === undefined &&
           this.items[index] === rootGroup.item[0]){
          // remove dragged item from the group
          rootGroup.itemChildGroup = this.removeItem(rootGroup.item);
          
          this.processMove(pointer, lastPointer)
        } else if(!distance && this.options.nested && this.getContainerGroup(index))
          this.getContainerGroup(index).processMove(pointer, lastPointer)
        else
          this.movePlaceholder(index, pointer)
      }
    },
    movePlaceholder: function  (index, pointer) {
      var item = $(this.items[index]),
      dim = this.itemDimensions[index],
      method = "after",
      width = item.outerWidth(),
      height = item.outerHeight(),
      offset = item.offset(),
      sameResultBox = {
        left: offset.left,
        right: offset.left + width,
        top: offset.top,
        bottom: offset.top + height
      }
      if(this.options.vertical){
        var yCenter = (dim[2] + dim[3]) / 2,
        inUpperHalf = pointer.top <= yCenter
        if(inUpperHalf){
          method = "before"
          sameResultBox.bottom -= height / 2
        } else
          sameResultBox.top += height / 2
      } else {
        var xCenter = (dim[0] + dim[1]) / 2,
        inLeftHalf = pointer.left <= xCenter
        if(inLeftHalf != this.floatRight){
          method = "before"
          sameResultBox.right -= width / 2
        } else
          sameResultBox.left += width / 2
      }
      this.rootGroup.movePlaceholder(item, method, sameResultBox)
    },
    getItems: function  () {
      if(!this.items)
        this.items = this.el.children(this.options.itemSelector).toArray()
      return this.items
    },
    getItemDimensions: function  () {
      if(!this.itemDimensions)
        setDimensions(this.getItems(), this.itemDimensions = [])
      return this.itemDimensions
    },
    getItemOffsetParent: function  () {
      var offsetParent,
      el = this.el
      // Since el might be empty we have to check el itself and
      // can not do something like el.children().first().offsetParent()
      if(el.css("position") === "relative" || el.css("position") === "absolute")
        offsetParent = el
      else
        offsetParent = el.offsetParent()
      return offsetParent
    },
    getContainerGroup: function  (index) {
      if(this.childGroups[index] === undefined){
        var childContainers = $(this.items[index]).children(this.options.containerSelector)

        if(childContainers[0]){
          var options = $.extend({}, this.options, {
            parentGroup: this.group,
            group: groupCounter ++
          })
          var childGroup = childContainers[pluginName](options).data(pluginName).group
          this.childGroups[index] = childGroup
        } else
          this.childGroups[index] = false
      }
      return this.childGroups[index]
    },
    addItem: function(item, childGroup) {
      this.items.push(item[0])
      if(childGroup)
        this.childGroups[this.items.length - 1] = childGroup
    },
    removeItem: function (item) {
      var i = this.items.indexOf(item[0]),
      childGroup = this.childGroups[i]

      this.items.remove(i)
      if(this.childGroups.length > i)
        this.childGroups.remove(i);
      delete this.itemDimensions

      return childGroup || false
    }
  }

  var API = {
    enable: function  () {
      if(this.options.drop)
        this.group.addContainer(this)
      this.el.on("mousedown", this.handle, this.dragInitProxy)
    },
    disable: function  () {
      if(this.options.drop)
        this.group.removeContainer(this)

      this.el.off("mousedown", this.handle, this.dragInitProxy)
    }
  }

  $.extend(Container.prototype, API)
  
  /**
   * jQuery API
   *
   * Parameters are
   *   either options on init
   *   or a method name followed by arguments to pass to the method
   */
  $.fn[pluginName] = function(methodOrOptions) {
    var args = Array.prototype.slice.call(arguments, 1)

    return this.each(function(){
      var $t = $(this),
      object = $t.data(pluginName)
      if(!object)
        $t.data(pluginName, new Container($t, methodOrOptions))
      else if (API[methodOrOptions])
        API[methodOrOptions].apply(object, args)
    });
  };

}(jQuery, window)
