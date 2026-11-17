function ApplicationManagerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ApplicationManagerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.controller.setupWidget('launchButton', 
				this.atts = {
					type: Mojo.Widget.activityButton
					}, 
				this.model = {
					buttonLabel: 'Launch',
					buttonClass: 'affirmative',
					disabled: false
				});
	this.handleLaunchButton =this.handleLaunchButton.bind(this)
	Mojo.Event.listen(this.controller.get('launchButton'),Mojo.Event.tap,this.handleLaunchButton)
}

ApplicationManagerAssistant.prototype.handleLaunchButton = function(event) {
	var url = 'http://developer.palm.com/appredirect/?packageid=com.palm.pandora';
	//http://developer.palm.com/appredirect/?packageid=com.palm.pandora&amp;applicationid=181
	
	
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters:  {
	       id: 'com.palm.app.findapps',
	       params: {
	           scene : 'page',
			   target: url
	       }
	   	}
	});
	window.setTimeout(this.deactivateSpinner.bind(this), 3000);		
}
ApplicationManagerAssistant.prototype.deactivateSpinner = function() {
	this.buttonWidget = this.controller.get('launchButton');
	this.buttonWidget.mojo.deactivate();
}
ApplicationManagerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ApplicationManagerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ApplicationManagerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  Mojo.Event.stopListen(this.controller.get('launchButton'),Mojo.Event.tap,this.handleLaunchButton)
	}
