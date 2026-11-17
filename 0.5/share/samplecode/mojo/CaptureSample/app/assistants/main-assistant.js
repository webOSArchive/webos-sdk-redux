function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.controller.setupWidget("audioButton",
         this.attributes = {
             },
         this.model = {
             label : "Audio",
             disabled: false
         }
     );
	 this.controller.setupWidget("videoButton",
         this.attributes = {
             },
         this.model = {
             label : "Video",
             disabled: false
         }
     );
	 this.controller.setupWidget("imageButton",
         this.attributes = {
             },
         this.model = {
             label : "Image",
             disabled: false
         }
     );
	
	/* add event handlers to listen to events from widgets */
};

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  this.handleTap = this.handleTap.bind(this)
	  Mojo.Event.listen(this.controller.get("audioButton"),Mojo.Event.tap, this.handleTap);
	  Mojo.Event.listen(this.controller.get("videoButton"),Mojo.Event.tap, this.handleTap);
	  Mojo.Event.listen(this.controller.get("imageButton"),Mojo.Event.tap, this.handleTap);
};
MainAssistant.prototype.handleTap = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  if (event.srcElement.id.indexOf("audio") != -1) {
	  	this.controller.stageController.pushScene('audio');
	  }else if (event.srcElement.id.indexOf("video") != -1) {
	  	this.controller.stageController.pushScene('video');
	  }else	if (event.srcElement.id.indexOf("image") != -1) {
	  	this.controller.stageController.pushScene('image');
	  }
	  
};
