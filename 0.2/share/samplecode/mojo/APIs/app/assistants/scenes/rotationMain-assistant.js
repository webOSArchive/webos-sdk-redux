function RotationMainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


// Called by the controller when the scene is pushed
RotationMainAssistant.prototype.setup = function() {
		//set up our button handlers		
		this.handleRotationFree = this.handleRotationFree.bind(this);
		this.handleRotationUp = this.handleRotationUp.bind(this);		
		this.handleRotationDown = this.handleRotationDown.bind(this);
		this.handleRotationRight = this.handleRotationRight.bind(this);		
		this.handleRotationLeft = this.handleRotationLeft.bind(this);
		
		this.controller.listen('rotation_free', Mojo.Event.tap, this.handleRotationFree.bind(this));
		this.controller.listen('rotation_up', Mojo.Event.tap, this.handleRotationUp.bind(this));		
		this.controller.listen('rotation_down', Mojo.Event.tap, this.handleRotationDown.bind(this));
		this.controller.listen('rotation_right', Mojo.Event.tap, this.handleRotationRight.bind(this));		
		this.controller.listen('rotation_left', Mojo.Event.tap, this.handleRotationLeft.bind(this));		
}

RotationMainAssistant.prototype.handleRotationFree = function(){
	Mojo.Controller.stageController.pushScene({'name': 'rotationSecond', sceneTemplate: 'scenes/rotation/rotationSecond-scene'},'free')
}

RotationMainAssistant.prototype.handleRotationUp = function(){
	Mojo.Controller.stageController.pushScene({'name': 'rotationSecond', sceneTemplate: 'scenes/rotation/rotationSecond-scene'},'up')
}

RotationMainAssistant.prototype.handleRotationDown = function(){
	Mojo.Controller.stageController.pushScene({'name': 'rotationSecond', sceneTemplate: 'scenes/rotation/rotationSecond-scene'},'down')
}

RotationMainAssistant.prototype.handleRotationRight = function(){
	Mojo.Controller.stageController.pushScene({'name': 'rotationSecond', sceneTemplate: 'scenes/rotation/rotationSecond-scene'},'right')
}

RotationMainAssistant.prototype.handleRotationLeft = function(){
	Mojo.Controller.stageController.pushScene({'name': 'rotationSecond', sceneTemplate: 'scenes/rotation/rotationSecond-scene'},'left')
}


// Cleanup anything we did in setup function
RotationMainAssistant.prototype.cleanup = function() {
	this.controller.listen('rotation_free', Mojo.Event.tap, this.handleRotationFree);
		this.controller.stopListening('rotation_up', Mojo.Event.tap, this.handleRotationUp);		
		this.controller.stopListening('rotation_down', Mojo.Event.tap, this.handleRotationDown);
		this.controller.stopListening('rotation_right', Mojo.Event.tap, this.handleRotationRight);		
		this.controller.stopListening('rotation_left', Mojo.Event.tap, this.handleRotationLeft);
}

// Called by the controller when this scene is about to be viewed	
RotationMainAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
RotationMainAssistant.prototype.deactivate = function() {
}