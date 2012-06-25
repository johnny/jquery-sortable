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

  function d(a,b) {
    return Math.sqrt(Math.pow(a[0]-b[0],2) + Math.pow(a[1] - b[1],2))
  }

  function setCenters(array, centers, offsetMethod) {
    var i = array.length
    while(i--){
      var el = array[i].el ? array[i].el : array.eq(i),
      // use fitting method
      pos = el[offsetMethod]()
      
      centers[i] = [ pos.left + el.width()/2, pos.top + el.height() / 2]
    }
  }

  function getRelativePosition(pointer, element) {
    var offset = element.offset()
    return {
      left: pointer.left - offset.left,
      top: pointer.top - offset.top
    }
  }

  function  getNearestIndexes(centers, pointer, tolerance) {
    pointer = [pointer.left, pointer.top]
    // TODO optimize
    var distances = centers.map( function  (pos,i) {
      return [d(pointer, pos), i]
    })
    distances = distances.sort(function  (a,b) {
      return a[0] - b[0]
    }),
    minDistance = distances[0][0] + tolerance

    var indexes = distances.filter(function  (item) {
      return item[0] < minDistance
    }).map(function (item) {
      return item[1]
    })

    return indexes
  }
  
  function ContainerGroup(options) {
    this.options = options
    this.containers = []
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
    dragInit: function  (e) {
      e.preventDefault()
      $(document).on("mousemove", $.proxy(this.drag, this))

      // get item to drag
      this.item = $(e.target).closest(this.options.itemSelector)
      this.itemContainer = this.getContainer(this.item)
      
      this.setPointer(e)
    },
    drag: function  (e) {
      e.preventDefault()

      if(!this.dragInitDone){
        this.item.addClass("dragged")
        this.setupCoordinates()
        this.dragInitDone = true
      }

      this.setPointer(e)

      // place item under the cursor
      this.item.css(getRelativePosition(this.pointer, this.item.offsetParent()))

      this.movePlaceholder(this.placeholder)
    },
    drop: function  (e) {
      e.preventDefault()

      $(document).off("mousemove")

      if(!this.dragInitDone)
        return;

      // delete cached items and centers
      this.resetCache()

      // replace placeholder with current item
      this.placeholder.before(this.item).detach()
      this.item.removeClass("dragged")

      this.dragInitDone = false
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
      var indexes = getNearestIndexes(this.getContainerCenters(),
                                      pointer,
                                      this.options.tolerance)

      if(indexes.length === 1){
        var container = this.containers[indexes[0]]
        if(!containerPointer)
          containerPointer = getRelativePosition(pointer, container.el.offsetParent())
        container.movePlaceholder(containerPointer, placeholder)
      }
    },
    getContainerCenters: function  () {
      if(!this.containerCenters)
        setCenters(this.containers, this.containerCenters = [], this.options.offsetMethodName)
      return this.containerCenters
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
      delete this.containerCenters
    },
    resetCache: function  () {
      // delete cached items 
      delete this.itemContainer.items
      delete this.getContainer(this.placeholder).items

      this.deleteCenters()

    },
    deleteCenters: function  () {
      // delete centers in every container and containergroup
      // TODO delete centers of every child containergroup
      delete this.containerCenters
      var i = this.containers.length
      while(i--){
        delete this.containers[i].itemCenters
      }
    }
  }

  function Container( element) {
    this.el = element;
  }

  Container.prototype = {
    init: function  (options) {
      this.options = $.extend( {}, defaults, options)

      this.group = ContainerGroup.get(this.options)
      this.group.addContainer(this)

      // TODO use rootgroup
      this.el.on("mousedown", this.options.itemSelector, $.proxy(this.group.dragInit, this.group))

      // TODO on scroll inside this container delete itemCenters (triggers recalculation)

      $(document).on("mouseup", $.proxy(this.group.drop, this.group))
    },
    movePlaceholder: function  (pointer, placeholder) {
      if(!this.itemCenters){
        console.log('recalculate Centers');
        setCenters(this.getItems(), this.itemCenters = [], "position")
      }

      // get Element right below the pointer
      var indexes = getNearestIndexes(this.itemCenters,
                                      pointer,
                                      this.options.tolerance)
      if(indexes.length === 1){
        var containerGroup = this.getContainerGroup(indexes[0])
        if(containerGroup){
          containerGroup.movePlaceholder(pointer, placeholder)
        } else {
          var item = this.items.eq(indexes[0])
          if(this.group.movingUp())
            item.before(placeholder)
          else if(this.group.movingDown())
            item.after(placeholder)
        }
      } else if(!this.items[0]) {
        this.el.append(placeholder)
      } else if(this.group.itemContainer !== this){
        // TODO rootgroup
        // TODO for nested containers, this has to be moved up
        this.items.eq(indexes[0]).after(placeholder)
      }
    },
    getItems: function  () {
      // TODO optimize
      if(!this.items)
        this.items = this.el.find(this.options.itemSelector).filter(function  () {
          var t = $(this)
          return !(t.hasClass("dragged") || t.hasClass("placeholder"))
        })
      return this.items
    },
    getContainerGroup: function  (index) {
      
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
