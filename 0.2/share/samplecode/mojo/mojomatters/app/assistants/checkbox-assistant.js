//
//	Simple example of a single checkbox. Changes in its state are printed into an onscreen log while a 
//	button can disable or re-enable the checkbox
//


CheckboxAssistant = Class.create( FLibExample, {
	setup: function(){
		// Setup a viewheader and commandMenu
		this.setupMenus({
			header: 'Checkbox',
			commandMenu:{
				items:[
					{icon: 'delete', command: 'clear'}
			]}
		});
		
		// Attributes and model for the checkbox
		this.attributes = {
			property: "value",
			trueValue: "ON",
			falseValue: "OFF",
			fieldName: 'checkboxstuff'
		};
		this.model = {
			value: "ON",
			disabled: false
		};
		
		// Store references to reduce the use of controller.get()
		this.logger = this.controller.get('dummyLogger');
		
		// Bind references ahead of time
		this.selectorChanged = this.selectorChanged.bind(this);
		this.button = this.button.bind(this);
		
		// Setup Widgets
		this.controller.setupWidget('sample-checkbox', this.attributes, this.model);
		this.controller.setupWidget('BUTTON', {}, {label: 'Enable/disable Checkbox'});
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('sample-checkbox', Mojo.Event.propertyChange, this.selectorChanged);
		this.controller.listen('BUTTON', Mojo.Event.tap, this.button);
	},
	cleanup: function(){
		this.controller.stopListening('sample-checkbox', Mojo.Event.propertyChange, this.selectorChanged);
		this.controller.stopListening('BUTTON', Mojo.Event.tap, this.button);
	},

	selectorChanged : function(e) {
		this.logger.innerHTML = e.property + " : " + e.value + "<br />" + this.logger.innerHTML;
	},
	
	button: function() {
		this.model.disabled = !this.model.disabled;
		this.controller.modelChanged(this.model);
	},
	
	
	// These two are what handles the clicks from the command menu's trash button
	handleCommand: function(event){
		if(event.type == Mojo.Event.command && typeof this[event.command] == 'function'){
			this[event.command]();
		}
	},
	clear: function(){
		this.logger.innerHTML = '';
	}
});
