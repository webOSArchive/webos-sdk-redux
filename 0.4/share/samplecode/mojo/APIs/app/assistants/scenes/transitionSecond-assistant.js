function TransitionSecondAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


// Called by the controller when the scene is pushed
TransitionSecondAssistant.prototype.setup = function() {
		//set up our button handlers		

}

TransitionSecondAssistant.prototype.handleBack = function(){
	this.controller.stageController.popScene()	
}


// Cleanup anything we did in setup function
TransitionSecondAssistant.prototype.cleanup = function() {
}

// Called by the controller when this scene is about to be viewed	
TransitionSecondAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
TransitionSecondAssistant.prototype.deactivate = function() {
}