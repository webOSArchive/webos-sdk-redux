FormAssistant = Class.create({
	setup: function() {
		
		// Bind event handlers once, ahead of time
		this.formAttributes.assistant.errorAction = this.errorAction.bind(this);
		this.formAttributes.assistant.defaultAction = this.defaultAction.bind(this);
		this.formAttributes.assistant.validate = this.validate.bind(this);
		
		// Store references for later, reducing the number of calls to controller.get()
		this.myForm = this.controller.get('myForm');
		this.button = this.controller.get('button');
		
		// Set up some widgets in the form
		this.controller.setupWidget('myForm', this.formAttributes, this.formModel);
		this.controller.setupWidget('button', this.buttonAttributes, this.buttonModel);
		this.controller.setupWidget('required1', {changeOnKeyPress: true}, {});
		this.controller.setupWidget('required2', {changeOnKeyPress: true, requiresEnterKey: true}, {});
	},
	
	// validate, error and submit are used by the form assistant 
	validate: function( inputs, callback ){
		
	},
	errorAction: function() {
		Mojo.Log.info("ERRORED");
		var failures = this.myForm.mojo.getFailedItems();
		Mojo.Log.info("failures " + Object.toJSON(failures));
	},
	defaultAction: function() {
		Mojo.Log.info("SUBMITTING FORM");
		this.buttonModel.disabled = true;
		this.controller.modelChanged(this.buttonModel);
		this.button.mojo.activate();
	},
	
	formAttributes: {
		assistant: {},
		label: 'Blast Off'
	},
	formModel: {requiredItems: ["required1", "required2"]},
	buttonModel: {},
	buttonAttributes: {
		submitLabel: 'Submit',
		type: Mojo.Widget.activityButton
	},
});