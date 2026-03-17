/*
	If you listen for events on the sceneElement instead of the document, Mojo will automatically
	stop you from getting events while dialogs are open on top of scene. How handy!
*/

SceneeventsAssistant = Class.create( FLibExample, {
	setup: function() {
		// Set up view menu as scene header
		this.setupMenus({
			header: 'Key-press Events'
		});
		
		// Store references for later
		this.div = this.controller.get('echo');
		this.dialogButton = this.controller.get('dialogButton');
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.handleKeyUpEvent = this.handleKeyUpEvent.bind(this);
		this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this);
		this.handleKeyPressEvent = this.handleKeyPressEvent.bind(this);
		this.openDialog = this.openDialog.bind(this);
		
		// Setup the button widget
		this.controller.setupWidget('dialogButton', {label: "Open Dialog"}, {});
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent);
		this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent);
		this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent);
		this.controller.listen(this.dialogButton, Mojo.Event.tap, this.openDialog);
	},
	
	cleanup: function(){
		this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent);
		this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent);
		this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent);
	},
	
	handleKeyUpEvent: function(event) {
		var eventModel = Mojo.Model.decorate(event.originalEvent, {
			eventType: event.type,
			eventKeyCode: event.originalEvent.keyCode,
			eventChar: String.fromCharCode(event.originalEvent.keyCode)
		});
		var content = Mojo.View.render({template: "sceneevents/evententry", object: eventModel});
		this.div.insert({top: content});
	},
	handleKeyDownEvent: function(event) {
		var eventModel = Mojo.Model.decorate(event.originalEvent, {
			eventType: event.type,
			eventKeyCode: event.originalEvent.keyCode,
			eventChar: String.fromCharCode(event.originalEvent.keyCode)
		});
		var content = Mojo.View.render({template: "sceneevents/evententry", object: eventModel});
		this.div.insert({top: content});
	},
	handleKeyPressEvent: function(event) {
		var eventModel = Mojo.Model.decorate(event.originalEvent, {
			eventType: event.type,
			eventKeyCode: event.originalEvent.keyCode,
			eventChar: String.fromCharCode(event.originalEvent.keyCode)
		});
		var content = Mojo.View.render({template: "sceneevents/evententry", object: eventModel});	
		this.div.insert({top: content});
	},
	
	openDialog: function(){
		this.controller.showDialog({
			template: 'sceneevents/sample-dialog',
			assistant: new DialogAssistant(this),
		});
	}
});


var DialogAssistant = Class.create({
	
	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
	},
	
	setup : function(widget) {
		this.widget = widget;
		this.controller.get('closeButton').addEventListener(Mojo.Event.tap, this.handleClose.bind(this));
	},
	
	handleClose: function() {
		this.widget.mojo.close();
	}
	
	
});
