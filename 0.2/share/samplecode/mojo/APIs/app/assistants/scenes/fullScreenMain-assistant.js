function FullScreenMainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


// Called by the controller when the scene is pushed
FullScreenMainAssistant.prototype.setup = function() {
		//set up our button handlers		
		this.handleNormalScreen = this.handleNormalScreen.bind(this);
		this.handleFullScreen = this.handleFullScreen.bind(this);
		this.controller.listen('normal_screen', Mojo.Event.tap, this.handleNormalScreen);
		this.controller.listen('full_screen', Mojo.Event.tap, this.handleFullScreen);		
}

FullScreenMainAssistant.prototype.handleNormalScreen = function(){
	Mojo.Controller.stageController.pushScene({'name': 'fullScreenSecond', sceneTemplate: 'scenes/fullscreen/fullScreenSecond-scene'},false)
}

FullScreenMainAssistant.prototype.handleFullScreen = function(){
	Mojo.Controller.stageController.pushScene({'name': 'fullScreenSecond', sceneTemplate: 'scenes/fullscreen/fullScreenSecond-scene'},true)
}


// Cleanup anything we did in setup function
FullScreenMainAssistant.prototype.cleanup = function() {
		this.controller.stopListening('normal_screen', Mojo.Event.tap, this.handleNormalScreen);
		this.controller.stopListening('full_screen', Mojo.Event.tap, this.handleFullScreen);
}

// Called by the controller when this scene is about to be viewed	
FullScreenMainAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
FullScreenMainAssistant.prototype.deactivate = function() {
}