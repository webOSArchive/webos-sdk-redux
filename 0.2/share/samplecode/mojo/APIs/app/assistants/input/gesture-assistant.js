function GestureAssistant() {
}

GestureAssistant.prototype.setup = function() {
		this.touchPad 				= this.controller.stageController.document;
		this.gestureInfoElement = this.controller.get('gesture-info');
		this.gestureCenterElement 	= this.controller.get('gesture-center');
		this.gestureScaleElement 	= this.controller.get('gesture-scale');
		this.gestureRotationElement = this.controller.get('gesture-rotation');
		this.gesturePropertiesElement = this.controller.get('gesture-properties');
		
		this.gestureStartHandler 	= this.gestureStart.bind(this);
		this.gestureChangeHandler 	= this.gestureChange.bind(this);
		this.gestureEndHandler 		= this.gestureEnd.bind(this);

		this.controller.listen(this.touchPad, "gesturestart", 	this.gestureStartHandler );
		this.controller.listen(this.touchPad, "gesturechange",	this.gestureChangeHandler);
		this.controller.listen(this.touchPad, "gestureend", 	this.gestureEndHandler);

		this.gestureInfoElement.style.display = 'block';	
		this.gesturePropertiesElement.style.display = 'none';
};

GestureAssistant.prototype.gestureStart = function(event) {
		this.gestureInfoElement.style.display = 'none';	
		this.gesturePropertiesElement.style.display = 'block';	
		this.gestureCenterElement.innerHTML = event.centerX + "," + event.centerY;
}
	
GestureAssistant.prototype.gestureChange = function(event) {
		this.gestureCenterElement.innerHTML = event.centerX + "," + event.centerY;
		this.gestureScaleElement.innerHTML = event.scale;
		this.gestureRotationElement.innerHTML = event.rotation;
}
	
GestureAssistant.prototype.gestureEnd = function(event) {
		this.gestureInfoElement.style.display = 'block';	
		this.gesturePropertiesElement.style.display = 'none';
		this.gestureInfoElement.innerHTML =  $L("Gesture ended");
}
	

GestureAssistant.prototype.cleanup = function(event) {
		this.controller.stopListening(this.touchPad, "gesturestart", 	this.gestureStartHandler );
		this.controller.stopListening(this.touchPad, "gesturechange",	this.gestureChangeHandler);
		this.controller.stopListening(this.touchPad, "gestureend", 	this.gestureEndHandler);
};	