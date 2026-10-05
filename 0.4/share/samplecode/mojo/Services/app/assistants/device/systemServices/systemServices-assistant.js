function SystemServicesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

SystemServicesAssistant.prototype.setup = function() {
	
	this.controller.listen($('services_button'),Mojo.Event.tap, this.handleButtonPressed.bind(this) );
}

SystemServicesAssistant.prototype.handleButtonPressed = function(){
	myappassistant = this;
	this.controller.serviceRequest('palm://com.palm.systemservice', {
	    method: 'time/getSystemTime',
	    parameters: {},
		onSuccess: this.handleTime.bind(this)
	});
}

SystemServicesAssistant.prototype.handleTime = function(response){
	$('area-to-update').update("System Time is: <br><br>" + Object.toJSON(response));																	 
}

SystemServicesAssistant.prototype.handleErrResponse = function(response){
	$('area-to-update').update("Error service response: <br><br>" + Object.toJSON(response));																		 
}

SystemServicesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

}


SystemServicesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

SystemServicesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('services_button'),Mojo.Event.tap, this.handleButtonPressed.bind(this) );
}
