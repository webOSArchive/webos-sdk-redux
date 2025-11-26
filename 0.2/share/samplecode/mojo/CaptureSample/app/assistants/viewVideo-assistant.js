function ViewVideoAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.playVideo = args;	
}

ViewVideoAssistant.prototype.setup = function() {
	this.videoObject = this.controller.get("player");
	
	var libs = MojoLoader.require({name:'mediaextension' ,version:'1.0'});
	this.videoExtObject  = new libs.mediaextension.MediaExtension.getInstance(this.videoObject,this);
	this.videoExtObject.audioClass = 'media' ;
	this.back.bind(this)
	this.videoObject.addEventListener("ended",this.back , false);
	this.videoObject.src =  this.playVideo;
	this.videoObject.play();
};
ViewVideoAssistant.prototype.back = function(event) {
	Mojo.Controller.stageController.popScene();
};

