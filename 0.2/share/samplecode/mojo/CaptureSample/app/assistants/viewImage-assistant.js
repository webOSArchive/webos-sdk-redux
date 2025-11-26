function ViewImageAssistant(arg) {
	// Location of file to load
	this.src = arg;
}

ViewImageAssistant.prototype.setup = function() {
	 this.controller.setupWidget("ImageId",
        this.attributes = {
            noExtractFS: true
        },
        {}
    ); 
	this.myPhotoDivElement = this.controller.get("ImageId");
	
};

ViewImageAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  this.myPhotoDivElement.mojo.manualSize(screen.width,screen.height)
	  this.myPhotoDivElement.mojo.centerUrlProvided(this.src)
};