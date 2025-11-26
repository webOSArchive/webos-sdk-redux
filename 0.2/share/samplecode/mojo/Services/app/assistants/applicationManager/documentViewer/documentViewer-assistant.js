function DocumentViewerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DocumentViewerAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.controller.listen(this.controller.get('DocumentButton1'), Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.listen(this.controller.get('DocumentButton2'), Mojo.Event.tap, this.handleButton2Pressed.bind(this));
};
DocumentViewerAssistant.prototype.handleButton1Pressed = function (event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
	    method: 'open',
	    parameters: {
			target: Mojo.appPath + 'documents/Welcome_to_webOS_development.doc'
		}
	});
};
DocumentViewerAssistant.prototype.handleButton2Pressed = function (event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
	    method: 'open',
	    parameters: {
			target: "http://www.palm.com/us/support/handbooks/800W_Sprint_Datasheet.pdf"
		}
	});
};

DocumentViewerAssistant.prototype.handleServiceResponse = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};
DocumentViewerAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


DocumentViewerAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get('DocumentButton1'), Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.stopListening(this.controller.get('DocumentButton2'), Mojo.Event.tap, this.handleButton2Pressed.bind(this));
};

DocumentViewerAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
