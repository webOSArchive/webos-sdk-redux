function TransitionMainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


// Called by the controller when the scene is pushed
TransitionMainAssistant.prototype.setup = function() {
		//set up our button handlers
		this.handleTransitionNone = this.handleTransitionNone.bind(this);
		this.handleTransitionDefault = this.handleTransitionDefault.bind(this);		
		this.handleTransitionZoomFade = this.handleTransitionZoomFade.bind(this);
		this.handleTransitionCrossFade = this.handleTransitionCrossFade.bind(this);
				
		this.controller.listen('transition_none', Mojo.Event.tap, this.handleTransitionNone.bind(this));
		this.controller.listen('transition_default', Mojo.Event.tap, this.handleTransitionDefault.bind(this));		
		this.controller.listen('transition_zoom_fade', Mojo.Event.tap, this.handleTransitionZoomFade.bind(this));
		this.controller.listen('transition_cross_fade', Mojo.Event.tap, this.handleTransitionCrossFade.bind(this));		
}

TransitionMainAssistant.prototype.handleTransitionNone = function(){
	Mojo.Controller.stageController.pushScene({'name': 'transitionSecond', sceneTemplate: 'scenes/transition/transitionSecond-scene',
											  transition: Mojo.Transition.none})
}

TransitionMainAssistant.prototype.handleTransitionDefault = function(){
	Mojo.Controller.stageController.pushScene({'name': 'transitionSecond', sceneTemplate: 'scenes/transition/transitionSecond-scene',
											  transition: Mojo.Transition.defaultTransition})
}

TransitionMainAssistant.prototype.handleTransitionZoomFade = function(){
	Mojo.Controller.stageController.pushScene({'name': 'transitionSecond', sceneTemplate: 'scenes/transition/transitionSecond-scene',
	transition: Mojo.Transition.zoomFade})
}

TransitionMainAssistant.prototype.handleTransitionCrossFade = function(){
	Mojo.Controller.stageController.pushScene({'name': 'transitionSecond', sceneTemplate: 'scenes/transition/transitionSecond-scene',
											  transition: Mojo.Transition.crossFade})
}


// Cleanup anything we did in setup function
TransitionMainAssistant.prototype.cleanup = function() {
	this.controller.stopListening('transition_none', Mojo.Event.tap, this.handleTransitionNone);
	this.controller.stopListening('transition_default', Mojo.Event.tap, this.handleTransitionDefault);		
	this.controller.stopListening('transition_zoom_fade', Mojo.Event.tap, this.handleTransitionZoomFade);
	this.controller.stopListening('transition_cross_fade', Mojo.Event.tap, this.handleTransitionCrossFade);
}

// Called by the controller when this scene is about to be viewed	
TransitionMainAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
TransitionMainAssistant.prototype.deactivate = function() {
}