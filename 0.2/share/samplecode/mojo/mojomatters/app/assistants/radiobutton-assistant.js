// Radiobuttons are an extension of the toggle widget, which presents the user with a button much
// in the same way HTML radio buttons work.
//
// In this example we have two radio buttons. A checkbox controlls the disabled state of the first
// while the second uses response handlers to echo state changes and new values into the DOM

RadiobuttonAssistant = Class.create( FLibExample, {
	setup: function(){
		
		// Bind response handlers in advance
		this.toggleChanged = this.toggleChanged.bind(this);
		this.enableChanged = this.enableChanged.bind(this);
		
		// Setup widgets
		this.controller.setupWidget('firstToggle', this.firstAttributes, this.firstModel);
		this.controller.setupWidget('secondToggle', this.secondAttributes, this.secondModel);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('secondToggle', Mojo.Event.propertyChange, this.toggleChanged);
		this.controller.listen('enableCheckBox', 'change', this.enableChanged);
		
		this.controller.get('enableCheckBox').checked= !this.firstModel.disabled;
	},
	cleanup: function(){
		// Manually unlisten from each event until the framework is updated to do it on its own
		this.controller.stopListening('secondToggle', Mojo.Event.propertyChange, this.toggleChanged);
		this.controller.stopListening('enableCheckBox', 'change', this.enableChanged);
	},

	toggleChanged : function(e) {
		var dummyLogger = this.controller.get('onScreenLogger');
		Element.insert(dummyLogger, e.property + " : " + e.value + "<br />",{content:'top'});
	},

	enableChanged : function(e) {
		this.firstModel.disabled = !(e.target.value);
		this.secondModel.disabled = !(e.target.value);
		
		this.controller.modelChanged(this.firstModel);
		this.controller.modelChanged(this.secondModel);
	},

	firstAttributes : {
		modelProperty : 'toggleOpt',
		disabledProperty: 'disabled',
		choices : [
		{label : 'true', value : true},
		{label : 'false', value : false}
		]
	},

	firstModel : {
		toggleOpt : true,	// this widget starts out with toggleOpt (what it uses instead of the default 'value' property)
							// of true, making the list selector start out with a default selection of whatever option has
							// the value of true
		disabled:false
	},

	secondAttributes : {
		modelProperty : 'toggleOpt',
		disabledProperty: 'disabled',
		choices : [
		{label : 'First', value : 1},
		{label : 'Second', value : 2},
		{label : 'Third', value : 3},
		]
	},

	secondModel : {
		toggleOpt : 2, 	// this widget starts out with a value of '2', so the default selection will
						// be the option with the value of 2
		disabled:false
	}

});
