function FirstAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

FirstAssistant.prototype.setup = function(){

};

FirstAssistant.prototype.activate = function(event) {
	// Add a listener to the button
	this.startExhibitionMode = this.startExhibitionMode.bind(this);
	Mojo.Event.listen(this.controller.get("launchPrefs"), Mojo.Event.tap, this.startExhibitionMode);
};
FirstAssistant.prototype.deactivate = function(event) {
	// Remove listener from the button
	Mojo.Event.stopListening(this.controller.get("launchPrefs"), Mojo.Event.tap, this.startExhibitionMode);
};
FirstAssistant.prototype.startExhibitionMode = function(event) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
	    method:"open",
	    parameters:{
	        id: "com.palm.app.exhibitionpreferences",
	        params: {}
	    }
	});
}
