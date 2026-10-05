function AccelerometerAssistant() {
	
}


AccelerometerAssistant.prototype.handleAcceleration = function(event){
	this.controller.get("accx").update("X = " + event.accelX);
	this.controller.get("accy").update("Y = " + event.accelY);
	this.controller.get("accz").update("Z = " + event.accelZ);
	this.controller.get("time").update("Time (msec) = " + event.time);
}

AccelerometerAssistant.prototype.handleOrientation = function(event){
	var position = ["Flat, face up","Flat, face down", "Upright", "Upside Down", "Pointed left", "Pointed right"]
	this.controller.get("position").update("Current orientation is: " + position[event.position]);
	this.controller.get("roll").update("Roll: " + event.roll + " degrees");
	this.controller.get("pitch").update("Pitch: " + event.pitch + " degrees");
} 

AccelerometerAssistant.prototype.setup = function() {
	
	if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("free");
		this.controller.stageController.setWindowProperties("fastAccelerometer");
	}
	
	this.handleOrientation = this.handleOrientation.bindAsEventListener(this);
	this.controller.listen(document, 'orientationchange', this.handleOrientation);
	this.handleAcceleration = this.handleAcceleration.bindAsEventListener(this);
	this.controller.listen(document, 'acceleration', this.handleAcceleration);
	
	this.handleShakingStart = this.handleShakingStart.bind(this)
	this.handleShaking = this.handleShaking.bind(this);
	this.handleShakingEnd = this.handleShakingEnd.bind(this);
	
	Mojo.Event.listen(document, 'shakestart', this.handleShakingStart);
	Mojo.Event.listen(document, 'shaking', this.handleShaking);
	Mojo.Event.listen(document, 'shakeend', this.handleShakingEnd);
}
AccelerometerAssistant.prototype.handleShakingStart = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  Mojo.Log.info('********** handleShakingStart ************');
	  this.controller.get('area1').update('handleShakingStart')
}
AccelerometerAssistant.prototype.handleShaking = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  Mojo.Log.info('*********** handleShaking ***********');
	  this.controller.get('area2').update('handleShaking')
}
AccelerometerAssistant.prototype.handleShakingEnd = function(event) { 
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  Mojo.Log.info('********* handleShakingEnd*************');
	  this.controller.get('area3').update('handleShakingEnd')
}
AccelerometerAssistant.prototype.activate = function(event) {

}


AccelerometerAssistant.prototype.deactivate = function(event) {

}

AccelerometerAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening(document, 'orientationchange',this.handleOrientation);
	this.controller.stopListening(document, 'acceleration',this.handleAcceleration);
}
