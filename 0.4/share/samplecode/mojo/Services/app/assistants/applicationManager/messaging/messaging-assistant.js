function MessagingAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MessagingAssistant.prototype.setup = function() {
	
	this.controller.listen($('composeWithData'),Mojo.Event.tap, this.handleComposeWithData.bind(this) );
	this.controller.listen($('composeWithFile'),Mojo.Event.tap, this.handleComposeWithFile.bind(this) );
}


// Launch Messaging app with chatWith field pre-filled
MessagingAssistant.prototype.handleChatWithID = function(){
	this.controller.stageController.assistant.showScene("applicationMangager/messaging", 'chatwith')	
}

// Launch Messaging app with pre-filled text
MessagingAssistant.prototype.handleComposeWithData = function(){
	Mojo.Log.error("Now in Open");
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
			id: 'com.palm.app.messaging',
			params: {
				composeRecipients: [{
					address: "joe",
					serviceName: "yahoo"
				}, {
					address: "4085555555"
				}],
				messageText: 'Text of the message.'
			}
		},
		onSuccess: this.handleOKResponse,
		onFailure: this.handleErrResponse
	});
}

// Launch Messaging app with attachment
MessagingAssistant.prototype.handleComposeWithFile = function(){
	this.controller.serviceRequest('palm://com.palm.applicationManager',
  	{
    	method: 'open',
    	parameters: {
			id: 'com.palm.app.messaging',
			params: {
				attachment:'icon.png'
				}
			},
		onSuccess: this.handleOKResponse,
		onFailure: this.handleErrResponse
  	}); 

}

MessagingAssistant.prototype.handleOKResponse = function(response){
	$('response').update("Success service response: <br><br>" + Object.toJSON(response));																	 
}

MessagingAssistant.prototype.handleErrResponse = function(response){
	$('response').update("Error service response: <br><br>" + Object.toJSON(response));																		 
}

MessagingAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

}


MessagingAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MessagingAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('composeWithData'),Mojo.Event.tap, this.handleComposeWithData.bind(this) );
	this.controller.stopListening($('composeWithFile'),Mojo.Event.tap, this.handleComposeWithFile.bind(this) );
}
