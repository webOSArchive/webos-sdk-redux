function SystemPropertiesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

SystemPropertiesAssistant.prototype.setup = function() {
	
	this.controller.listen($('properties_button'),Mojo.Event.tap, this.handleButtonPressed.bind(this) );
}

SystemPropertiesAssistant.prototype.handleButtonPressed = function(){
	this.controller.serviceRequest('palm://com.palm.preferences/systemProperties', {
    method:"Get",
    parameters:{"key": "com.palm.properties.nduid" },
    onSuccess: this.handleOKResponse
    });
}

SystemPropertiesAssistant.prototype.handleOKResponse = function(response){
	$('area-to-update').update("System Properties are: <br><br>" + Object.toJSON(response));																	 
}

SystemPropertiesAssistant.prototype.handleErrResponse = function(response){
	$('area-to-update').update("Error service response: <br><br>" + Object.toJSON(response));																		 
}

SystemPropertiesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

}


SystemPropertiesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

SystemPropertiesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('properties_button'),Mojo.Event.tap, this.handleButtonPressed.bind(this) );
}
