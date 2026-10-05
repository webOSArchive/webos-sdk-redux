function RotationSecondAssistant(parameter) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.parameter = parameter;
}


// Called by the controller when the scene is pushed
RotationSecondAssistant.prototype.setup = function() {
		//set window orientation to passed in value
		this.controller.stageController.setWindowOrientation(this.parameter);
		//set up our button handlers	
		this.handleOrientation = this.handleOrientation.bind(this)
		this.controller.listen('orientation', Mojo.Event.tap, this.handleOrientation);
}

RotationSecondAssistant.prototype.handleBack = function(){
	this.controller.stageController.popScene()	
}

RotationSecondAssistant.prototype.handleOrientation = function(){
	this.showDialogBox('Screen Orientation','Screen orientation is: ' + PalmSystem.screenOrientation)
}


// Cleanup anything we did in setup function
RotationSecondAssistant.prototype.cleanup = function() {
	// Since the rotation will persist for the whole application,
	// set it back to 'up' before leaving this scene.
	this.controller.stageController.setWindowOrientation('up');
	this.controller.stopListening('orientation', Mojo.Event.tap, this.handleOrientation);
}

// Called by the controller when this scene is about to be viewed	
RotationSecondAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
RotationSecondAssistant.prototype.deactivate = function() {
}

// This function will popup a dialog, displaying the message passed in.
RotationSecondAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {
			if (title == 'Success' && this.debug == 'No')
			window.close();
		},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}