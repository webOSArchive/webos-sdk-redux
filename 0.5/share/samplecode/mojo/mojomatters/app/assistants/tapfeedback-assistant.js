TapfeedbackAssistant = Class.create({
	initialize : function() {	
	},
	
	setup: function() {
		// Store references for later, reducing the number of calls to controller.get()
		this.immediateButton = this.controller.get('immediateButton');
		this.delayedButton = this.controller.get('delayedButton');
		this.clearButton = this.controller.get('clearButton');
		this.clearAnyButton = this.controller.get('clearAnyButton');
		this.immediateRow = this.controller.get('immediateRow');
		this.delayedRow = this.controller.get('delayedRow');
		
		// Bind event listeners and callbacks once, ahead of time
		this.addImmediate = this.addImmediate.bind(this);
		this.addDelayed = this.addDelayed.bind(this);
		this.clearAll = this.clearAll.bind(this);
		this.clearAny = this.clearAny.bind(this);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.immediateButton, Mojo.Event.tap, this.addImmediate);
		this.controller.listen(this.delayedButton, Mojo.Event.tap, this.addDelayed);
		this.controller.listen(this.clearButton, Mojo.Event.tap, this.clearAll);
		this.controller.listen(this.clearAnyButton, Mojo.Event.tap, this.clearAny);
	},
	
	cleanup: function() {
		this.controller.stopListening(this.immediateButton, Mojo.Event.tap, this.addImmediate);
		this.controller.stopListening(this.delayedButton, Mojo.Event.tap, this.addDelayed);
		this.controller.stopListening(this.clearButton, Mojo.Event.tap, this.clearAll);
		this.controller.stopListening(this.clearAnyButton, Mojo.Event.tap, this.clearAny);
	},
	
	addImmediate: function() {
		Mojo.View.addTouchFeedback(this.immediateRow);
		this.activeRow = this.immediateRow;
	},
	
	addDelayed: function() {
		Mojo.View.addTouchFeedback(this.delayedRow);
		this.activeRow = this.delayedRow;
	},
	
	clearAll: function() {
		Mojo.View.removeTouchFeedback(this.activeRow);
	},
	
	clearAny: function() {
		Mojo.View.clearTouchFeedback(this.controller.sceneElement);
	}
});
