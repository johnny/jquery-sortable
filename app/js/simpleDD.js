!function ( $, window, undefined){
  var pluginName = 'simpleDD',
  defaultMethod = 'init',
  document = window.document,
  defaults = {
    itemSelector: "li",
    containerSelector: "ul",
    tolerance: 0.7
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
    return (x+y)/2;
  }

  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  }

  function setDimensions(array, dimensions, offsetMethod) {
    var i = array.length
    offsetMethod = offsetMethod || "position"
    while(i--){
      var el = array[i].el ? array[i].el : $(array[i]),
      // use fitting method
      pos = el[offsetMethod]()
      
      dimensions[i] = [
        pos.left,
        pos.left + el.width(),
        pos.top,
        pos.top + el.height()
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

  function filterClosest(distances) {
    distances = distances.sort(function  (a,b) {
        return a[0] - b[0]
      })
    var minDistance = distances[0][0]
    return distances.filter(function  (item) {
      return item[0] < minDistance
    })
  }

  function getNearestIndex(dimensions, pointer, oldPointer) {
    if(dimensions.length === 0)
      return ;

    pointer = [pointer.left, pointer.top]
    // TODO optimize
    var indexes = filterClosest(dimensions.map( function  (dim,i) {
      return [d(dim, oldPointer), i]
    }))

    if(indexes.length > 1){
      indexes = filterClosest(indexes.map( function  (i) {
        i[0] -= d(dimensions[i[1]], oldPointer)
      }))
      if(indexes.length > 1)
        indexes = indexes.sort(function  (a,b) {
          return a[1] - b[1];
        })
    }

    return indexes[0]
  }
  
  function ContainerGroup(options) {
    this.options = $.extend({},options)
    this.containers = []
    this.childGroups = []
    if(this.options.parentGroup)
      this.options.parentGroup.childGroups.push(this)
    else
      this.placeholder = $('<li class="placeholder"/>')
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
    addContainer: function  (container) {
      this.containers.push(container)
    },
    dragInit: function  (e, itemContainer) {
      $(document).on("mousemove", $.proxy(this.drag, this))
      $(document).on("mouseup", $.proxy(this.drop, this))

      // get item to drag
      this.item = $(e.target).closest(this.options.itemSelector)
      this.itemContainer = itemContainer
      this.itemCildGroup = itemContainer.removeItem(this.item)
      
      this.setPointer(e)
    },
    drag: function  (e) {
      e.preventDefault()

      if(!this.dragging){
        this.item.addClass("dragged")
        this.setupCoordinates()
        this.dragging = true
      }

      this.setPointer(e)

      // place item under the cursor
      this.item.css(getRelativePosition(this.pointer, this.item.offsetParent()))

      this.movePlaceholder(this.placeholder)
    },
    drop: function  (e) {
      e.preventDefault()

      $(document).off("mousemove")

      if(!this.dragging)
        return;

      this.getContainer(this.placeholder).addItem(this.item, this.itemChildGroup)

      this.deleteDimensions()
      
      // replace placeholder with current item
      this.placeholder.before(this.item).detach()
      this.item.removeClass("dragged")

      this.dragging = false
    },
    getContainer: function  (element) {
      return element.closest(this.options.containerSelector).data(pluginName)
    },
    movingUp: function  () {
      return this.lastPointer.top - this.pointer.top > 0
    },
    movingDown: function  () {
      return this.lastPointer.top - this.pointer.top < 0
    },
    movePlaceholder: function  (placeholder, pointer) {
      var containerPointer
      if(!pointer){
        if(this.options.offsetMethodName === "position")
          containerPointer = pointer = this.relativePointer
        else
          pointer = this.pointer
      }
      var indexes = getNearestIndexes(this.getContainerDimensions(),
                                      pointer,
                                      this.options.tolerance)

      if(indexes.length === 1){
        var container = this.containers[indexes[0]]
        if(!containerPointer)
          containerPointer = getRelativePosition(pointer, container.el.offsetParent())
        container.movePlaceholder(containerPointer, placeholder)
      }
    },
    getContainerDimensions: function  () {
      if(!this.containerDimensions)
        setDimensions(this.containers, this.containerDimensions = [], this.options.offsetMethodName)
      return this.containerDimensions
    },
    setPointer: function (e) {
      var pointer = {
        left: e.pageX,
        top: e.pageY
      }

      if(this.offsetParent){
        var relativePointer = getRelativePosition(pointer, this.offsetParent)
        // TODO default: drag everywhere (two options: drag within offsetParent or given element)
        if(relativePointer < this.width && relativePointer.top < this.height){
          return false
        }
        this.relativePointer = relativePointer
      }
      
      this.lastPointer = this.pointer
      this.pointer = pointer
      return true
    },
    setupCoordinates: function  () {
      // If every container has the same offset parent,
      // use position() which is relative to this parent,
      // otherwise use offset()
      var offsetMethodName,
      sameOffsetParent = true,
      i = this.containers.length - 1,
      offsetParent = this.containers[i].el.offsetParent()
      while(i--){
        if(offsetParent[0] != this.containers[i].el.offsetParent()[0]){
          sameOffsetParent = false
          break;
        }
      }
      if(sameOffsetParent){
        offsetMethodName = 'position'
      } else {
        $(window).on("scroll", $.proxy(this.scrolled, this))
        offsetParent = $('body')
        offsetMethodName = 'offset'
      }
      this.offsetParent = offsetParent
      this.options.offsetMethodName = offsetMethodName
      
      this.offset = offsetParent[offsetMethodName]()
      this.height = offsetParent.height()
      this.width = offsetParent.width()
    },
    scrolled: function  () {
      delete this.containerDimensions
    },
    deleteDimensions: function  () {
      console.log("deleting",this.options.group);
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

  function Container( element) {
    this.el = element;
    this.childGroups = []
  }

  Container.prototype = {
    init: function  (options) {
      this.options = $.extend( {}, defaults, options)

      this.group = ContainerGroup.get(this.options)
      this.group.addContainer(this)

      this.rootGroup = this.options.rootGroup = this.options.rootGroup || this.group
      this.parentGroup = this.options.parentGroup = this.options.parentGroup || this.group

      this.el.on("mousedown", this.options.itemSelector, $.proxy(this.dragInit, this))
    },
    dragInit: function  (e) {
      e.preventDefault()
      e.stopPropagation()

      this.getItems()

      this.rootGroup.dragInit(e, this)
    },
    movePlaceholder: function  (pointer, placeholder) {
      if(!this.itemDimensions)
        setDimensions(this.getItems(), this.itemDimensions = [])

      // get Element right below the pointer
      var indexes = getNearestIndexes(this.itemDimensions,
                                      pointer,
                                      this.options.tolerance)
      if(indexes.length > 0){
        if(indexes.length === 1){
          var containerGroup = this.getContainerGroup(indexes[0])
          if(containerGroup){
            console.log("must go deeper");
            containerGroup.movePlaceholder(placeholder, pointer)
          } else {
            var item = $(this.items[indexes[0]])
            this.rootGroup.lastContainer = this
            if(this.rootGroup.movingUp())
              item.before(placeholder)
            else if(this.rootGroup.movingDown())
              item.after(placeholder)
          }
        } else if(this.rootGroup.lastContainer !== this){
          // TODO for nested containers, this has to be moved up
          this.rootGroup.lastContainer = this
          $(this.items[indexes[0]]).after(placeholder)
        }
      } else {
        this.el.append(placeholder)
      }
    },
    getItems: function  () {
      if(!this.items)
        this.items = this.el.find(this.options.itemSelector).toArray()
      return this.items
    },
    getContainerGroup: function  (index) {
      if(this.childGroups[index] === undefined){
        var childContainers = $(this.items[index]).find("> " + this.options.containerSelector)

        if(childContainers[0]){
          var options = $.extend({}, this.options, {
            parentGroup: this.group,
            group: groupCounter ++
          })
          console.log("creating new", childContainers);
          this.childGroups[index] = childContainers[pluginName](options).data(pluginName).group
        } else
          this.childGroups[index] = false
      }
      return this.childGroups[index]
    },
    removeItem: function (item) {
      var i = this.items.indexOf(item[0])

      this.items.remove(i)
      if(this.childGroups.length > i)
        this.childGroups.remove(i)
    },
    addItem: function(item, childGroup) {
      this.items.push(item[0])
      if(childGroup !== undefined)
        this.childGroups[this.items.length - 1] = childGroup
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
      var object = get( $(this), Container, pluginName);
      
      if (!object[method]) {
        method = defaultMethod
      }

      object = object[method](options)
    });
  };

}(jQuery, window)
