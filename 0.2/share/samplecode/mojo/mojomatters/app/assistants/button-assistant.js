//
//	It's a button. This example uses one and shows how you can use callbacks and the built in activity indicators
//	to start, and provide feedback for, ongoing background actions.
//

ButtonAssistant = Class.create( FLibExample, {
	initialize : function() {	
		// Nothing necessary here
	},

	setup: function() {
		// location for storing disabled state
		this.disabled = false;
		
		this.setupMenus({
			header: 'Buttons'
		});

		//	Store reference to button element for later/other scopes
		this.button = this.controller.get('activityButton'); //	Use controller.get() instead of prototypes $()
		
		// Bind event listener once, before its used in one or more listeners
		this.tapped = this.tapped.bind(this);
		this.stopButton = this.stopButton.bind(this);
		
		// 	Instantiate and listen to widget
		this.controller.setupWidget('activityButton', this.spinButtonAttributes, this.spinButtonModel);
		this.controller.listen('activityButton', Mojo.Event.tap, this.tapped);
		
		
		
		/*
			The following sets up a second, very basic button used in this example to force an activation
			on the first button without it being tapped.
		*/
		this.otherTap = this.otherTap.bind(this);
		this.controller.setupWidget('defaultButton', this.defaultButtonAttributes, {});
		this.controller.listen('defaultButton', Mojo.Event.tap, this.otherTap);
		
	},
	
	// Construct attributes and model for button widget
	spinButtonAttributes: {
		disabledProperty: 'disabled',	// the disabled state for this button can be found in its model's 'disabled' property
		labelProperty: 'label',			// the label for this button is stored in the model's 'label' property
		classProperty: 'buttonClass',	// CSS Selectors can be applied or modified from the model using this property
		type: Mojo.Widget.activityButton
	},
	spinButtonModel: {
		label : "Spinning Button",
		buttonClass: 'affirmative',
		disabled: this.disabled
	},
	defaultButtonAttributes: {label: $L('Makes other button spin')},
	defaultButtonModel: {buttonClass: 'dismiss'},
	
	tapped: function(event) {
		
		//	Cycle disabled state
		this.disabled = !this.disabled;
		
		// Update model on the fly:
		//	In this case we disable and change the label
		this.spinButtonModel.disabled = this.disabled;
		this.spinButtonModel.buttonClass = (this.disabled) ? 'negative' : 'affirmative';
		this.spinButtonModel.label = (this.disabled) ? "You spin me right round" : 'Spinning Button';
		this.controller.modelChanged(this.spinButtonModel);
		
		// Be sure to stop spinner at some point, usually when some asynchronous results are returned
		if(this.disabled) {
			this.stopButton.delay(1);
		}
	},
	
	stopButton: function(){
		this.button.mojo.deactivate();
		this.tapped();
	},
	
	otherTap: function(){
		
		// Starts spinner without button having been clicked on
		this.button.mojo.activate();
		
		// Stops spinner after a second
		this.button.mojo.deactivate.delay(1);
	}
	
	
});
