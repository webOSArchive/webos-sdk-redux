function AudioObjectAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

AudioObjectAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	var dInfo = Mojo.Environment.DeviceInfo;
	try{
		// New API for 1.4.  Palm specific APIs for media are in this loadable library.
		// DO NOT include media.js any more, use this instead.
		this.libs = MojoLoader.require({ name: "mediaextension", version: "1.0"});
	}
	catch(e){
		// Prior to 1.4 MojoLoader.require() was restricted to palm apps.  Calling it on 
		// older builds will result in an exception.
		Mojo.Log.error("Cannot load mediaextension library: "+e.message);
	}
	//Display webOS version number
	this.controller.get('version').update('WebOS version ' + dInfo.platformVersionMajor + "." + dInfo.platformVersionMinor);
	try{
		// Get the device version, if before 1.4 thehe <audio> tag in the scene will not do anything.
		// Use extendElement(), etc., to start music playback.
		// Now setup the second audio
		if (this.libs && this.libs.mediaextension){
			
			Mojo.Log.info("1.4 media APIs are present.");
			
			this.myAudioObj = this.controller.get('audio-nav');

			// Palm extensions library is present, get the extension API for the 
			// audio object in the scene.
			this.audioExt = this.libs.mediaextension.MediaExtension.getInstance(this.myAudioObj);

			// 1.4 replacement for what previous would be "myAudioObj.palm.audioClass = 'navigation'" - see below
			this.audioExt.audioClass = 'navigation';

			// media setup can continue immediately (no 'x-palm-connect' required) as element is part of browser.
			this.mediaSetup();
		}
	}
	catch(e){
		Mojo.Log.error("PlayAudioAssistant::setup threw: ", Object.toJSON(e));
	}
	//Set up button handlers
	
	this.buttonModel1 = {
		buttonLabel : 'Play',
		buttonClass : 'affirmative',
		disable : false
	};
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	};
	
	//Set up button handlers
	this.buttonModel2 = {
		buttonLabel : 'Pause',
		buttonClass : 'dismiss',
		disable : false
	};
	this.buttonAtt2 = {
		type : Mojo.Widget.activityButton
	};
	
	this.controller.setupWidget('PlayButton', this.buttonAtt1, this.buttonModel1);
	this.controller.setupWidget('PauseButton', this.buttonAtt2, this.buttonModel2);
	this.mediaHandleEventBound = this.mediaHandleEventBound.bind(this);
	this.playButton = this.controller.get('PlayButton');
	this.stopButton = this.controller.get('StopButton');
	Mojo.Event.listen(this.playButton, Mojo.Event.tap, this.handlePlayButton.bind(this));
	Mojo.Event.listen(this.controller.get('StopButton'), Mojo.Event.tap, this.handleStopButton.bind(this));
	this.playing = false;
	this.stopped = false;
};
/*
 * For 1.4 we don't have media setup can continue immediately 
 * (no 'x-palm-connect' required) as element is part of browser. 
 */
AudioObjectAssistant.prototype.mediaSetup = function(){
	Mojo.Log.info("PlayAudioAssistant::mediaSetup called, mediaserver is connected");

	this.mediaHandleEventBound = this.mediaHandleEvent.bind(this);

	this.myAudioObj.addEventListener('play', this.mediaHandleEventBound, false);
	this.myAudioObj.addEventListener('ended', this.mediaHandleEventBound, false); 
	this.myAudioObj.addEventListener('pause', this.mediaHandleEventBound, false);
	this.myAudioObj.addEventListener('error', this.mediaHandleEventBound, false);
	this.myAudioObj.addEventListener('canplay', this.mediaHandleEventBound, false);

	this.myAudioObj.src = '/media/internal/ringtones/Triangle (short).mp3';
	this.playing = true;
}
AudioObjectAssistant.prototype.mediaHandleEvent = function(event){
	this.playButton.mojo.deactivate();
	try{
		Mojo.Log.info("PlayAudioAssistant::eventHandlerMedia for event: ", event.type);
		switch(event.type){
			// Handled events 
			// (listed in alphabetical order)
			// This is not an exhaustive list, but enough for this simple example.

			case 'canplay':
				if (!event.target.paused){
					Mojo.Log.warn("Should only be getting canplay if the state is paused");
				}
				this.playButton.mojo.activate();
				event.target.play();
				break;
			case 'ended':
				//play it again.				
				this.controller.get('area-to-update').update("Play it again Sam...");
				if(!this.stopped)
					this.mediaReplay();
				break;
			case 'error':
				Mojo.Log.warn("Error occured on the media element: ", event.target.error);
				this.controller.get('area-to-update').update("Error occured on the media element: " + event.target.error);
				break;
			case 'pause':
				this.controller.get('area-to-update').update("Paused!!");
				Mojo.Log.warn("State went to pause.  presumably there was a call or some other such high priority interrupt");
				break;
			case 'play':
				this.controller.get('area-to-update').update("Play...");
				this.playButton.mojo.activate();
				break;
			case 'stop':
				this.controller.get('area-to-update').update("Stopped...");
				break;
			default:
				Mojo.Log.error("PlayAudioAssistant::eventHandlerMedia: Need a handler for ", event.type);
				break;
		}
	}
	catch(e){
		Mojo.Log.error("PlayAudioAssistant::eventHandlerMedia threw: ", Object.toJSON(e));
	}
}

AudioObjectAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	 
      
};
AudioObjectAssistant.prototype.handlePlayButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	
	try {
		if (this.stopped) {			
				this.myAudioObj.play();			
		}
		this.controller.get('area-to-update').update("Playing...");
	}catch (err) {
		this.showDialogBox('error', err); 
	}
	this.stopped = false;
	this.playing = true;
};

AudioObjectAssistant.prototype.handleStopButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */	
	
	if (this.isPending){
			this.controller.window.clearTimeout(this.isPending);
			this.isPending = null;
		}
	this.stopped = true;
	this.playing = false;
	this.controller.get('area-to-update').update("Repeat stoppped...");	
};
AudioObjectAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AudioObjectAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  try{
		this.myAudioObj.removeEventListener('play', this.mediaHandleEventBound, false);
		this.myAudioObj.removeEventListener('ended', this.mediaHandleEventBound, false); 
		this.myAudioObj.removeEventListener('pause', this.mediaHandleEventBound, false);
		this.myAudioObj.removeEventListener('error', this.mediaHandleEventBound, false);
		this.myAudioObj.removeEventListener('canplay', this.mediaHandleEventBound, false);

		if (this.isPending){
			this.controller.window.clearTimeout(this.isPending);
			this.isPending = null;
		}
	}
	catch(e){
		Mojo.Log.error("PlayAudioAssistant::cleanup threw: ", Object.toJSON(e));
	}
};


AudioObjectAssistant.NAV_SOUND_REPEAT_TIMER = 2000;
AudioObjectAssistant.prototype.mediaReplay = function(){

	var replayCallback = function PlayAudioAssistant_replay_callback(){
		this.isPending = null;
		this.myAudioObj.play();
	}.bind(this);


	if (this.isPending){
		Mojo.Log.warn("Playback is already pending");
	}
	else {
		this.isPending = this.controller.window.setTimeout(replayCallback, AudioObjectAssistant.NAV_SOUND_REPEAT_TIMER);
	}

}
AudioObjectAssistant.prototype.showDialogBox = function (title, message) {
	this.controller.showAlertDialog({
		onChoose: function (value) {},
		title: title,
		message: message,
		choices: [ {label: 'OK', value: 'OK', type: 'color'} ]
	});
};

