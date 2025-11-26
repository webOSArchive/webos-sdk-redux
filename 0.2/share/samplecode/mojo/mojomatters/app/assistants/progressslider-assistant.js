
/*
	A shortcut widget that sets up a progress widget and a slider widget at once.
*/

ProgresssliderAssistant = Class.create( FLibExample, {
    initialize: function(){
    
    },
    
    setup: function(){
		this.setupMenus({
			header: 'Progress Slider'
		});
		
		// Bind event handlers once, ahead of time
		this.propertyChanged = this.propertyChanged.bind(this);
		this.updateProgress = this.updateProgress.bind(this);
		
		// Store references for later, reducing the use of controller.get()
		this.slider = this.controller.get('sliderdiv');
		this.pill = this.controller.get('sliderdiv');
		
     	this.controller.setupWidget('sliderdiv', this.attributes, this.progressSliderModel);
     	this.controller.setupWidget('setButton', {}, {label: 'Update Progress'});
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('sliderdiv',Mojo.Event.propertyChange, this.propertyChanged);
		this.controller.listen('setButton', Mojo.Event.tap, this.updateProgress);
		
	},
	progressSliderModel: {
		progressVal: .60,	// position of the background animation as a percent of the whole 
							// This is chosen by attributes.progressProperty
		
		sliderVal: .8,		// position of the slider, chosen by attributes.sliderProperty
		minValue: 0,		// Applies only to slider
		maxValue: 1,		// Applies only to slider
	},
	attributes: {
		round: false,
		sliderProperty: 'sliderVal',
		progressProperty: 'progressVal',
		updateInterval: .2,
		progressStartProperty: .5,
		cancellable: true,
		title: 'Downloading...'
	},

	updateProgress: function() {
		Mojo.Log.info("progress change to %s", this.progressSliderModel[this.attributes.sliderProperty]);
		this.progressSliderModel[this.attributes.progressProperty] = this.progressSliderModel[this.attributes.sliderProperty];
		this.controller.modelChanged(this.progressSliderModel);
		
	},
	
	propertyChanged: function(event) {
		Mojo.Log.info("new value %s from event, value %s from model", event.value, this.progressSliderModel[this.attributes.sliderProperty]);
	},
});
