function FullScreenSecondAssistant(parameter) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.parameter = parameter;
}


// Called by the controller when the scene is pushed
FullScreenSecondAssistant.prototype.setup = function() {
		//set full screen mode to passed in value (true or false)		
		this.controller.enableFullScreenMode(this.parameter);

}

FullScreenSecondAssistant.prototype.handleBack = function(){
	this.controller.stageController.popScene()	
}

// Cleanup anything we did in setup function
FullScreenSecondAssistant.prototype.cleanup = function() {

}

// Called by the controller when this scene is about to be viewed	
FullScreenSecondAssistant.prototype.activate = function() {
	if (this.parameter) {
		this.controller.get('text').innerText = ('Note that the top status and bottom notification bars have disappeared.');
	} else {
		this.controller.get('text').innerText = ('Note that the top status and bottom notification bars are still showing.');
	}
}
  
// Cleanup anything we did in the activate function
FullScreenSecondAssistant.prototype.deactivate = function() {
}