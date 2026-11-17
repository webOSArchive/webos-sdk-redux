
// Sliders let the user indicate a value between a predetermined minimum and maximum
//
// In this example, there are two sliders to play with, but they share the same model (this.model)
// This is possible becuse at least one (both in this case) of the slider widgets was set up
// with the 'modelProperty' attribute which specifies what property in the model object will hold
// the widget's value. The first stores its value in model.firstValue, the second in model.secondValue

SliderAssistant = Class.create( FLibExample, {
    setup: function(){
		
		this.setupMenus({
			header: 'Sliders'
		});
	
		//	References
		// Store references to reduce the usage of controller.get()
		this.firstSliderResults = this.controller.get('firstSliderResults');
		this.secondSliderResults = this.controller.get('secondSliderResults');
	
		//	Binds
		// Bind callbacks in one place, so that you have references to stop listening with
		// during cleanup(). Also reduces the number of times you need to bind() in case you
		// use the same listener in more than one listen()
		this.firstSliderChanged	= this.firstSliderChanged.bind(this);
		this.secondSliderChanged = this.secondSliderChanged.bind(this);
		this.maxOutSliders = this.maxOutSliders.bind(this);
		
		//	Setup sliders
    	this.controller.setupWidget('firstSlider', this.firstAttributes, this.model);
	    this.controller.setupWidget('secondSlider', this.secondAttributes, this.model);
	    this.controller.setupWidget('maxButton', this.buttonAttributes, {});
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('firstSlider', Mojo.Event.propertyChanged, this.firstSliderChanged);
		this.controller.listen('secondSlider', Mojo.Event.propertyChanged, this.secondSliderChanged);
		this.controller.listen('maxButton', Mojo.Event.tap, this.maxOutSliders);
    },

	cleanup: function(){
		//	Cleanup
		// Until the framework automatically stops listening to objects in a just-pushed scene
		// we need to help it out by manually stopping the listen()'s that we started for this scene
		// during setup()
		this.controller.stopListening('firstSlider', Mojo.Event.propertyChanged, this.firstSliderChanged);
		this.controller.stopListening('secondSlider', Mojo.Event.propertyChanged, this.secondSliderChanged);
		this.controller.stopListening('maxButton', Mojo.Event.tap, this.maxOutSliders);
	},

	//	Basic eventHandlers update a div with the new value
	firstSliderChanged: function() {
		this.firstSliderResults.innerHTML = 'New value is: ' + this.model.firstValue;
	},
	secondSliderChanged: function() {
		this.secondSliderResults.innerHTML = 'New value is: ' + this.model.secondValue;
	},
	maxOutSliders: function() {
		//	Update models
		this.model.firstValue = this.firstAttributes.maxValue;
		this.model.secondValue = this.secondAttributes.maxValue;
		
		// 	Broadcast changes
		this.controller.modelChanged(this.model);
		
		// modelChanged updates the widget, but doesn't send a propertyChanged event
		// You need to call the response handlers manually if appropriate
		this.firstSliderChanged();
		this.secondSliderChanged();
	},
	
	buttonAttributes: {
		label: $L('Max Out The Sliders')
	},
	
	firstAttributes: {
		// Must Round
		//	At the moment, there is a bug in widget_slider.js that will cause the widget to never fire
		//	a propertyChange event if you don't use round. Interim solution: Round. 
		round: true,
		modelProperty: 'firstValue', // Default is 'value'
		maxValue: 10,
		minValue: 0,
		
	},
	
	secondAttributes: {
		// updateInterval
		//	Causes the widget to update every __ seconds while it's being dragged, 
		//	instead of waiting until the user puts it down to do that
		updateInterval: .2,
		modelProperty: 'secondValue',
		maxValue: 10,
		minValue: 0,
		round: true,
	},
	model: {
		firstValue: 1,
		secondValue: 5
	}
});
