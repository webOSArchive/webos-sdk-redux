function PhotosAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PhotosAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.controller.listen(this.controller.get('PhotosButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
}
PhotosAssistant.prototype.handleButtonPressed = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
    method:'launch',
    parameters: {
        id:"com.palm.app.photos",
        params: {}
        }
    });
}

PhotosAssistant.prototype.handleServiceResponse = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}
PhotosAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


	PhotosAssistant.prototype.deactivate = function(event) {
		/* remove any event handlers you added in activate and do any other cleanup that should happen before
		   this scene is popped or another scene is pushed on top */
	}
	
	PhotosAssistant.prototype.cleanup = function(event) {
		/* this function should do any cleanup needed before the scene is destroyed as 
		   a result of being popped off the scene stack */
	this.controller.stopListening(this.controller.get('PhotosButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	}
