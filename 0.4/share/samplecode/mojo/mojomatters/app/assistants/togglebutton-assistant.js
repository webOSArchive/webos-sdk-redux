// Toggle switches are like checkboxes, but can display custom states instead of just showing or hiding a check
//
// This example has two. The first is disabled/enabled on the fly by the second. 

TogglebuttonAssistant = Class.create( FLibExample, {
	setup: function(){
		
		this.setupMenus({
			header: 'Toggle Switches'
		});
		
		//	Binds
		// Bind callbacks in one place, so that you have references to stop listening with
		// during cleanup(). Also reduces the number of times you need to bind() in case you
		// use the same listener in more than one listen()
		this.throwSafety = this.throwSafety.bind(this);
		
		//	Setup Toggles
		this.controller.setupWidget('realityToggle', this.distortionAttributes, this.distortionModel);
    	this.controller.setupWidget('lockToggle', this.lockAttributes, this.lockModel);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('lockToggle', Mojo.Event.propertyChanged, this.throwSafety);
	},
	
	cleanup: function(){
		//	Cleanup
		// Until the framework automatically stops listening to objects in a just-pushed scene
		// we need to help it out by manually stopping the listen()'s that we started for this scene
		// during setup()
		this.controller.stopListening('lockToggle', Mojo.Event.propertyChanged, this.throwSafety);
	},
	
	throwSafety: function(event) {
		//	Catching results
		// Use event.value 
		//
		// this.lockModel[this.lockAttributes.modelProperty] also works
		console.log("event is "+Object.toJSON(event));
		this.distortionModel.disabled = event.value;
		this.controller.modelChanged(this.distortionModel);
	},

	lockAttributes: {
		modelProperty: "safetyIsOn",
		
		//	Labels and Values
		// trueLabel is shown when the switch is on. It passes the trueValue to the eventHandler
		// as .value and the value of whatever property is specified in modelProperty
		trueLabel: 'Locked',
		trueValue: true,
		falseLabel: 'Open',
		falseValue: false
	},
	lockModel: {
		//	modelProperty
		// We use safetyIsOn here because that's what we specified as the property name for the 
		// value of this toggle
		safetyIsOn: true
	},

	distortionAttributes: {
		modelProperty: "value"
	},
	distortionModel: {
		value: true,
		disabled: true 	// because safetyIsOn
	}
});
