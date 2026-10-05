function EmbeddedAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

EmbeddedAssistant.prototype.setup = function() {
	this.onPlay = this.onPlay.bind(this);
	this.onEnd = this.onEnd.bind(this);

	this.videoObject = this.controller.get('video-object');
	this.videoObject.addEventListener('play', this.onPlay, false);
	this.videoObject.addEventListener('ended', this.onEnd, false);
	this.videoObject.src =   Mojo.appPath + "video/HaveFun.mp4"
	this.videoObject.play();
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
}

EmbeddedAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


EmbeddedAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

EmbeddedAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.videoObject.removeEventListener('play', this.onPlay, false);
	this.videoObject.removeEventListener('ended', this.onEnd, false);

}


/**
 * Handler called when the video starts playing.
 * 
 * This handler is called because I call addEventListener for the Media.Event.PLAY event type.
 * Use this handler 
 */
EmbeddedAssistant.prototype.onPlay = function(event){
	this.timers = {};
	this.timers.counter = setTimeout(this.counterShow.bind(this), EmbeddedAssistant.TIMESTAMP.COUNTER_SHOW);
	this.timers.jump = setTimeout(this.jumpShow.bind(this), EmbeddedAssistant.TIMESTAMP.JUMP_SHOW);

	this.timers.update = setTimeout(this.updateCounter.bind(this), 1000);
}


EmbeddedAssistant.prototype.onDuration = function(event){
	// If you need to know how long the video is ...
}

/**
 * Handler called when the video reaches the end.
 * 
 * Display an artsy message at the end of the video.
 */
EmbeddedAssistant.prototype.onEnd = function(event){

	var elem = this.controller.get('ended');
	EmbeddedAssistant.genericShow(elem);
}



/**
 * Generic function to hide a div 
 * 
 * @note function on class not instance.
 */
EmbeddedAssistant.genericHide = function(element){
	element.style.display = "none";
}

/**
 * Generic function to show a div 
 * 
 * @note function on class not instance.
 */
EmbeddedAssistant.genericShow = function(element){
	element.style.display = "";
}


/**
 * Callback function used to show the counter text sometime after app start, under the control of 
 * the play callback and a timeout.
 */
EmbeddedAssistant.prototype.counterShow = function(){
	delete this.timers.counter;
	var counterElem = this.controller.get('counter');
	EmbeddedAssistant.genericShow(counterElem);

	setTimeout(function(){
		EmbeddedAssistant.genericHide(counterElem);
	}, EmbeddedAssistant.TIMESTAMP.COUNTER_HIDE);
}

/**
 * Callback function used to show the "splash" text sometime after app start, under the control of 
 * the play callback and a timeout.
 */
EmbeddedAssistant.prototype.splashShow = function(){
	delete this.timers.splash;
	var splashElem = this.controller.get('splash');
	EmbeddedAssistant.genericShow(splashElem);

	setTimeout(function(){
		EmbeddedAssistant.genericHide(splashElem);
	}, EmbeddedAssistant.TIMESTAMP.SPLASH_HIDE);
}

/**
 * Callback function used to show the "we are about to seek" text sometime after app start, under the control of 
 * the play callback and a timeout.
 */
EmbeddedAssistant.prototype.jumpShow = function(){
	delete this.timers.jump;
	var jumpElem = this.controller.get('jump');
	EmbeddedAssistant.genericShow(jumpElem);

	setTimeout(function(){
		// Set the current time and hide the message after a couple of seconds.

		//REMEMBER: HTML5 currentTime property is in seconds not milliseconds.
 		//NOTE: Video will seek to closest I frame before the requested position.
		this.videoObject.currentTime = EmbeddedAssistant.TIMESTAMP.JUMP_SEEKTO/1000;

		EmbeddedAssistant.genericHide(jumpElem);
	}.bind(this), EmbeddedAssistant.TIMESTAMP.JUMP_HIDE);
}

/**
 * Update the onscreen counter.
 * 
 * Function called periodically to update the current time information on screen
 */
EmbeddedAssistant.prototype.updateCounter = function(){
	var millisecs = this.videoObject.currentTime*1000;
	var seconds = Math.floor(this.videoObject.currentTime);

	if (millisecs >= EmbeddedAssistant.TIMESTAMP.SPLASH_SHOW) {
		var elem = this.controller.get('splash');
		if ( (millisecs-EmbeddedAssistant.TIMESTAMP.SPLASH_SHOW) < EmbeddedAssistant.TIMESTAMP.SPLASH_HIDE ){
			EmbeddedAssistant.genericShow(elem);
		}
		else{
			EmbeddedAssistant.genericHide(elem);
		}
	}

	this.timers.update = setTimeout(this.updateCounter.bind(this), 1000);
	

	this.controller.get('counter').update(seconds);
}


/* 
 * Defines, used in timing onscreen events.
 */
EmbeddedAssistant.TIMESTAMP = {};
EmbeddedAssistant.TIMESTAMP.COUNTER_SHOW = 1000;
EmbeddedAssistant.TIMESTAMP.COUNTER_HIDE = 40000;

EmbeddedAssistant.TIMESTAMP.SPLASH_SHOW = 44000;
EmbeddedAssistant.TIMESTAMP.SPLASH_HIDE = 3000;

EmbeddedAssistant.TIMESTAMP.JUMP_SHOW = 15000;
EmbeddedAssistant.TIMESTAMP.JUMP_HIDE = 2000;
EmbeddedAssistant.TIMESTAMP.JUMP_SEEKTO = 36000;






