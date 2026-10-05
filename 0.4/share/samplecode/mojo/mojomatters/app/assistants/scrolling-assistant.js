// This loads a small scroller widget with a very large bit of content to show. This gives you a small window
// to browse around with. ListSelectors under the scroller change various properties including the physics and
// direction/snapping behaviour

ScrollingAssistant = Class.create( FLibExample, {
	setup: function() {
		
		// Set up command menu. This has buttons which perform various operations on the list items.
		this.setupMenus({
			header: 'Scrolling',
			commandMenu: {items: [
				{icon:"save", command:'saveScroll'},
				{icon:"file", command:'restoreScroll'}
				]}
		});
		
		// Store references once instead of many calls to controller.get()
		this.scroller = this.controller.get('two_dogs');
		this.scrollerContents = this.controller.get('scrolling_contents');

		// Bind response Handlers here
		this.scrollStarting		= this.scrollStarting.bind(this);
		this.moved 				= this.moved.bind(this);
		this.rememberImageSize 	= this.rememberImageSize.bind(this);
		this.snap 				= this.snap.bind(this);
		this.frictionChanged 	= this.frictionChanged.bind(this);
		this.weightChanged		= this.weightChanged.bind(this);
		this.modeChanged		= this.modeChanged.bind(this);
		
		// Setup data
		this.renderSingleDogContent();
		this.modesModel.mode = this.getSavedScrollMode() || 'free';
		this.modesModel.weight = 'light';
		this.modesModel.friction = 'low';
		
		// Setup Widgets
		this.controller.setupWidget('two_dogs', {}, this.modesModel);
		this.controller.setupWidget('modeSelector', {label: $L('Mode'), choices: this.modes, modelProperty:'mode'}, this.modesModel);
		this.controller.setupWidget('weightSelector', {label: $L('Weight'), choices: this.weights, modelProperty:'weight'}, this.modesModel);
		this.controller.setupWidget('frictionSelector', {label: $L('Friction'), choices: this.friction, modelProperty:'friction'}, this.modesModel);
		
		//	Listen for events
		// propertyChange is thrown when a selector pics a new value
		this.controller.listen('modeSelector', Mojo.Event.propertyChange, this.modeChanged);
		this.controller.listen('weightSelector', Mojo.Event.propertyChange, this.weightChanged);
		this.controller.listen('frictionSelector', Mojo.Event.propertyChange, this.frictionChanged);
		this.controller.listen('dog_img', 'load', this.rememberImageSize);
		// scrollStarting is thrown when scroller starts or stops
		this.controller.listen(this.scroller, Mojo.Event.scrollStarting, this.scrollStarting);
	},
	cleanup: function(){
		this.controller.stopListening('modeSelector', Mojo.Event.propertyChange, this.modeChanged);
		this.controller.stopListening('weightSelector', Mojo.Event.propertyChange, this.weightChanged);
		this.controller.stopListening('frictionSelector', Mojo.Event.propertyChange, this.frictionChanged);
		this.controller.stopListening('dog_img', 'load', this.rememberImageSize);
		this.controller.stopListening(this.scroller, Mojo.Event.scrollStarting, this.scrollStarting);
	},
	
	//	Keypress
	// keypress events need to be handled in activate/deactivate not setup/cleanup.
	// If you push a new scene, you'll still react to keypresses from the new active scene
	// Deactivate is called when the scene is popped and when a new one is pushed on top,
	// Activate is called whenever we come back. These two together act to pause the listening
	// whenever this scene isn't the active scene.
	activate: function() {
		this.controller.listen(this.controller.document, 'keypress', this.snap);		
	},
	deactivate: function() {
		this.controller.stopListening(this.controller.document, 'keypress', this.snap);		
	},
	
	LOWER_CASE_I: "i".charCodeAt(0),
	snap: function(keypressEvent) {
		if (keypressEvent.charCode === this.LOWER_CASE_I) {
			// Snap to next item
			var newSnapIndex = (this.modesModel.snapIndex + 1) % 3;
			
			// Perform snap
			this.scroller.mojo.setSnapIndex(newSnapIndex, true);
		}
	},
	
	
	scrollStarting: function(event) {
		// A scroller will package a scroller property and an addListener method onto the event that is passed here.
		// Note: event.scroller.addListener === event.addListener
		//
		// the addListener functions accept an object with a .moved() method that gets passed
		// true or false while the scroller is moving, indicating whether or not the scroller has stopped yet.
		
		//	Pass in 'this' as the object with the listener, because the moved method just below does the trick
		event.scroller.addListener(this);
		Mojo.Log.info(new Date(), "scroll starting");			
	},
	moved: function(stopping) {
		if (stopping) {
			Mojo.Log.info(new Date(), "scroll stopping");			
		}
	},
	
	renderSingleDogContent: function() {
		var content = Mojo.View.render({object: {appBase: Mojo.appPath}, template: 'scrolling/single_dog'});
		this.controller.update('scrolling_contents', content);
	},
	

	
	
	rememberImageSize: function(event) {
		this.originalSize = this.controller.get('dog_img').getDimensions();
		this.modeChanged();
	},
	
	calculateImageSize: function(scaleFactor) {
		return {height: this.originalSize.height * scaleFactor, width: this.originalSize.width * scaleFactor};
		
	},
	
	// Handle menu commands as needed:
	handleCommand: function(event) {
		if(event.type == Mojo.Event.command && typeof this[event.command] == "function") {
			this[event.command](event);
		}
	},
	saveScroll: function() {
		this.scrollState = this.scroller.mojo.getState();
	},
	restoreScroll: function() {
		if(this.scrollState)
			{	this.scroller.mojo.setState(this.scrollState, true); } 
	},
	
	
	getSavedScrollMode: function() {
		var scrollModeCookie = new Mojo.Model.Cookie(this.kScrollModeCookieName);
		return scrollModeCookie.get();
	},
	setSavedScrollMode: function(scrollMode) {
		var scrollModeCookie = new Mojo.Model.Cookie(this.kScrollModeCookieName);
		scrollModeCookie.put(scrollMode);
	},
	modeChanged: function(event) {
		var content, vElements, hElements;
		
		if(this.modesModel.mode.match(/snap/)) {
			// Switch to 'snap-ready' content
			content = Mojo.View.render({object: {appBase: Mojo.appPath}, template: 'scrolling/number_grid'});
			this.scrollerContents.innerHTML = content;
			
			vElements = this.controller.sceneElement.select('.scroll-number-left');
			hElements = this.controller.sceneElement.select('.scroll-number-top');
			
			this.modesModel.snapElements = {x: hElements, y: vElements};
			
			Mojo.Log.info(this.modesModel.snapElements);
			
			this.modesModel.snapIndex = 1;
			this.controller.modelChanged(this.modesModel);
		} else {
			// Switch back to 'doggy' content
			this.renderSingleDogContent();
			
			this.modesModel.snap = false;
			this.controller.modelChanged(this.modesModel);
		}
		this.setSavedScrollMode(this.modesModel.mode);
	},
	weightChanged: function() {
		this.scroller.mojo.updatePhysicsParameters({flickFactor: this.weightValues[this.modesModel.weight]});		
	},
	frictionChanged: function() {
		this.scroller.mojo.updatePhysicsParameters({flickSpeed: this.frictionValues[this.modesModel.friction]});		
	},

	modesModel: {scrollbars: true, mode: "free"},
	modes: [{label: $L("Free"), value: "free"}, 
		{label: $L("Horizontal"), value: "horizontal"}, 
		{label: $L("Vertical"), value: "vertical"}, 
		{label: $L("Dominant Axis"), value: "dominant"},
		{label: $L("Horizontal-Snap"), value: 'horizontal-snap'},
		{label: $L("Vertical-Snap"), value: 'vertical-snap'}
	],

	weights: [{label: $L("Light"), value: 'light'}, 
		{label: $L("Medium"), value: 'medium'}, 
		{label: $L("Heavy"), value: 'heavy'}],
		
	weightValues: {light: 0.3, medium: 0.1, heavy: 0.03},

	friction: [{label: $L("Low"), value: 'low'}, 
		{label: $L("Medium"), value: 'medium'}, 
		{label: $L("High"), value: 'high'}],

	frictionValues: {low: 0.06, medium: 0.2, high: 0.5},
	kScrollModeCookieName: 'scrollModeCookie'
});
