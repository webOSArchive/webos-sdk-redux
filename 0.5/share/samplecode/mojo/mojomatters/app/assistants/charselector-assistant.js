//
//	This is a privately used widget. It's used when you press 'sym' 
//	but doesn't have any real use other than that. I guess you could
// 	use it if you really wanted to. 
//

CharselectorAssistant = Class.create({
  initialize : function() {
  },
  
  setupViews: function() {
  },
  
  setup: function() {
  	//create a mojo combo box widget
	this.attributes = {
		target: 'testInput'
	};
	
	this.model = {
	  char: ''
	};
	
	 this.controller.setupWidget('charSelector', this.attributes, this.model);
	 this.controller.listen('testInput', 'keydown', this.handleKeyDown.bind(this));
  },
  
  cleanup: function() {
    Mojo.Log.info("cleanup called");
  },
  
  deactivate: function() {
    Mojo.Log.info("deactivate called");
  },
  
  handleKeyDown: function(e) {
    if (event.shiftKey) {
      this.model.modifier = Mojo.Char.shift; //see if we have a shift key
    };
    this.model.character = event.keyCode;
    this.controller.modelChanged(this.model);
    Event.stop(e);
  }
  
});
