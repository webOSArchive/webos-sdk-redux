ColorlistAssistant = Class.create({
  initialize : function() {
  },
  
  setup: function() {
    Mojo.Log.info("ColorlistAssistant#setup")
    this.dataSource = new ColorlistDataSource();
    this.listController = new Mojo.Controller.List('list-of-colors', 'colorlist/color-bar', this.dataSource, 28)
    this.listController.setup();
  },
  
  cleanup: function() {
    this.dataSource.cleanup();
  },
  
  moved: function() {
   this.listController.moved();
  }
  
});

ColorlistDataSource = Class.create({
  initialize : function() {
    this.changeHandler = this.change.bind(this);
    this.change();
  },
  
  kMaxColorIndex: 256 - 64 - 1,
  kMinColorIndex: 32,
  
  updateColors: function(offset, limit) {
    var colors = []
    var minIndex = offset + this.kMinColorIndex;
    var maxIndex = minIndex + limit;
    if (maxIndex > this.kMaxColorIndex) {
      maxIndex = this.kMaxColorIndex;
    }
    for (i = minIndex; i <= maxIndex; ++i) {
      var c = {red: 0, green: 0, blue: 0, inverseIndex: maxIndex-i};
      c[this.colorThisTime] = i;
      colors[i-minIndex] = c;
    }
    var resultSet = {limit: limit, offset: offset, total: this.kMaxColorIndex - this.kMinColorIndex, list: colors}
    return resultSet;
  },
  
  updateOffsetAndLimit: function(offset, limit) {
    this.offset = offset;
    this.limit = limit;
    Mojo.assertDefined(this.controller)
    var resultSet = this.updateColors(offset, limit)
    this.controller.handleNewData.bind(this.controller).defer(resultSet)
  },
  
  change: function(event) {
    var colorNames = ["red", "green", "blue"]
    this.colorThisTime = colorNames[Math.floor(Math.random() * 3)]
    if (this.controller) {
      var resultSet = this.updateColors(this.offset, this.limit);
      this.controller.handleNewData(resultSet);
    }
    this.updateTimer = window.setTimeout(this.changeHandler, 2000);    
  },
  
  cleanup: function() {
    // halt periodic timeout once our scene is gone.
    window.clearTimeout(this.updateTimer);
  }
  
});

