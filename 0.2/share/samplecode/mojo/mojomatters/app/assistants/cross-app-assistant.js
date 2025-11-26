/*
	Pushes a scene from any other app onto the current stage (card)
	
	The scene being pushed needs to either work independantly, or be made to accept parameters if you want it to
	do something specific for you. 
*/

CrossAppAssistant = Class.create({

	setup: function() {
	
		// Store references for commonly accessed DOM items
		this.checkbox = this.controller.get('test-pop');
		this.activateResult = this.controller.get('activate_result');
	
		// Bind response handler once here, instead of repeatedly in each listener
		this.handleTap = this.handleTap.bind(this);
	
		// Set up widgets used in this scene
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, this.headerModel);
		this.controller.setupWidget('cross-app-push', {}, this.buttonModel);
	
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('cross-app-push', Mojo.Event.tap, this.handleTap);
	
	},

	cleanup: function() {
		// We need to manually stop listening to events until the framework is updated to clean these up automatically
		this.controller.stopListening('cross-app-push', Mojo.Event.tap, this.handleTap);	
	},

	headerModel: {items: [
		{	label: $L("Cross-application Push Demo") }
	]},

	buttonModel: {label: $L("Push a Cross-app Scene") },

	handleTap: function() {
	
		var launchParams = {
			//	appId
			// It's this parameter that makes this 'cross-app' instead of just an ordinary scene
			appId: "com.palm.app.musicplayer",
			name: "songs"
		};
		var sceneArgs = {
			color: "Blue"
		};
		this.controller.stageController.pushScene(launchParams, sceneArgs);
	
	},


	activate: function(returnValue) {
		
		//	activate
		// The crossapp scene will pass its payload into our activate once it's poppin off 
		// Check for return value, so you don't update status when this is called on first launch
		if (returnValue) {
			this.activateResult.innerHTML = "Value returned from other app:' " + returnValue + "'";
		}
	}
});