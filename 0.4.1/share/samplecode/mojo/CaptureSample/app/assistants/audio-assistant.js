function AudioAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.AUDIO = 0;
}

AudioAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.fileExtension = '.wav'
	this.attributes = {label: 'Format',labelPlacement: Mojo.Widget.labelPlacementLeft},
    this.model = {
        value: 0,
        disabled: false,
		choices :[{}]
    }
	this.controller.setupWidget("listselectorId",this.attributes,this.model);
	this.DeviceChange = this.DeviceChange.bind(this)
	Mojo.Event.listen(this.controller.get("listselectorId"), Mojo.Event.propertyChange, this.DeviceChange);
	this.gctx = document.getElementById('waveform-canvas').getContext('2d');
	
	this.controller.setupWidget("startButton",
          		{
		 			type: Mojo.Widget.activityButton
             	},
          		{
             		label : "Start",
             		disabled: false,
			 		buttonClass: 'affirmative'
         		}
     );
	this.controller.setupWidget("stopButton",
          		{},
          		this.stopModel = {
             		label : "Stop",
             		disabled: true,
			 		buttonClass: 'negative'
         		}
     );
	this.controller.setupWidget("playButton",
         this.attributes = {
		 		type: Mojo.Widget.activityButton
             },
         this.playModel = {
             label : "Play",
             disabled: true
         }
     );
	  
	this.recordingCallback = this.recordingCallback.bind(this);
	this.startCallback = this.startCallback.bind(this);
	this.stopCallback = this.stopCallback.bind(this);
	this.handleError = this.handleError.bind(this)
	this.playCallback = this.playCallback.bind(this)
	this.controller.listen(this.controller.get('playButton'),Mojo.Event.tap,this.playCallback)
	this.controller.listen(this.controller.get('startButton'),Mojo.Event.tap,this.startCallback)
	this.controller.listen(this.controller.get('stopButton'),Mojo.Event.tap,this.stopCallback)
	var dInfo = Mojo.Environment.DeviceInfo;
	try{
		/** 	
		* Load the media capture loadable library.
		* */
		
		var libraries = MojoLoader.require({
		name: "mediacapture",
		version: "1.0"
		})	  
		if(libraries){
			this.audioRecorder = libraries.mediacapture.MediaCapture();
			this.getSupportedAudioFormats();
			
			
			this.audioRecorder.load(
				this.audioRecorder.captureDevices[this.AUDIO].deviceUri,{});
				
			this.audioRecorder.addEventListener("error", this.handleError, false);
			
		}else{
			Mojo.Log.info("Error loading media libs.");
		}
	}
	catch(e){
	Mojo.Log.error("AudioAssistant ::setup threw: ", JSON.stringify(e));
	}
	/* add event handlers to listen to events from widgets */
};
AudioAssistant.prototype.DeviceChange = function(event) {
	
	this.fileExtension = '.wav'	
	//Reload with the new audio format
	this.audioRecorder.load(this.audioRecorder.captureDevices[this.AUDIO].deviceUri,{});
};
AudioAssistant.prototype.handleError = function(e) {
	Mojo.Log.info('****************************** AudioAssistant ERRORHANDLER')
};

AudioAssistant.prototype.stopCallback = function(event) {
	this.controller.get('area-to-update1').innerText = 'Recording finished, press play';
	this.controller.get('startButton').mojo.deactivate();
	this.playModel.disabled = false
	this.controller.modelChanged(this.playModel)
	
	this.stopModel.disabled = true
	this.controller.modelChanged(this.stopModel)
	
	this.audioRecorder.stopAudioCapture();
};

AudioAssistant.prototype.recordingCallback = function(event) {
	Mojo.Log.info('****************************** AudioAssistant RECORDING : ' + (event))
};
AudioAssistant.prototype.activate = function(event) {
	Mojo.Log.info('BEFORE startGrapher')	
	this.startGrapher();
	Mojo.Log.info('AFTER startGrapher')	
	this.controller.listen(this.controller.get('playButton'),Mojo.Event.tap,this.playCallback)
	this.controller.listen(this.controller.get('startButton'),Mojo.Event.tap,this.startCallback)
	this.controller.listen(this.controller.get('stopButton'),Mojo.Event.tap,this.stopCallback)
	
};

AudioAssistant.prototype.deactivate = function(event) {
	/* remove all event handlers*/
	this.controller.stopListening(this.controller.get('playButton'),Mojo.Event.tap,this.playCallback)
	this.controller.stopListening(this.controller.get('startButton'),Mojo.Event.tap,this.startCallback)
	this.controller.stopListening(this.controller.get('stopButton'),Mojo.Event.tap,this.stopCallback)  
    this.audioRecorder.removeEventListener("error", this.handleError, false);
	this.stopGrapher();
};

AudioAssistant.prototype.cleanup = function(event) {
	this.audioRecorder.unload();	
};
AudioAssistant.prototype.startCallback = function(event) {	
	this.controller.get('area-to-update1').innerText = 'Recording ...'
	this.timestart = 0;
	this.stopModel.disabled = false
	this.controller.modelChanged(this.stopModel)
	this.audioRecorder.startAudioCapture('/media/internal/dts/samples/audioRecording/sample' + this.fileExtension, {});
	this.showtimer();
};
function getGraphColor(isRecording){
	if (isRecording){
		return "rgb(0, 200, 0)";
	}
	else {
		return "rgb(50, 100, 50)";
	}
}

AudioAssistant.prototype.grapher = function(){
		// Get most recent sample of VU data.
		if (0 != this.audioRecorder.vuData.length){
			var vuData = this.audioRecorder.vuData.pop();
			var height = 80*vuData.peak[0];
	
			if (this.gctx){
				this.gctx.fillStyle = getGraphColor(this.audioRecorder.audioCapture);
				this.gctx.fillRect(this.x, 80-height, 4, 80);
			}
		}

		this.x+=5;
		if (this.x == 300) {
			this.gctx.fillStyle = "rgb(0, 0, 0)"
			this.gctx.clearRect(0, 0, 300, 80);
			this.x = 0;
		}

	}	
AudioAssistant.prototype.startGrapher = function(){	
	this.x= 0
	this.gctx.fillStyle = "rgb(0, 0, 0)"
	this.gctx.clearRect(0, 0, 300, 80);
	this.gtimer = window.setInterval(this.grapher.bind(this), 200);
	

}
AudioAssistant.prototype.stopGrapher= function(){
	this.controller.window.clearTimeout(this.timercount);
	this.stopModel.disabled = true
	this.controller.modelChanged(this.stopModel)
	if (this.gtimer){
		window.clearInterval(this.gtimer);
		this.gtimer = 0;
	}
}
AudioAssistant.prototype.showtimer = function() {
	if(this.timercount) {
		this.controller.window.clearTimeout(this.timercount);
	}
	this.stopModel.label = Math.round(this.audioRecorder.elapsedTime);
	if(this.stopModel.label < 1)
		this.stopModel.label = 0;
	this.controller.modelChanged(this.stopModel);
	
	this.timercount = setTimeout(this.showtimer.bind(this), 1000);
}

AudioAssistant.prototype.playCallback = function(event) {
	this.myAudioObj = new Audio();
	this.myAudioObj.src = '/media/internal/dts/samples/audioRecording/sample' + this.fileExtension;
	this.myAudioObj.addEventListener("ended", function(){
	this.controller.get('playButton').mojo.deactivate();}.bind(this), false);
	this.myAudioObj.play();	
};

AudioAssistant.prototype.getSupportedAudioFormats = function(){
	var idx = 0;
	Mojo.Log.info("Supported audio formats: ", JSON.stringify(this.audioRecorder.supportedAudioFormats));
	
	if (undefined === this.audioRecorder.supportedAudioFormats) {
		return;
	}
	else if (1 === this.audioRecorder.supportedAudioFormats.length) {
		// Only one supported format.
		Mojo.Log.info("No choices for capture format.");
		return this.audioRecorder.supportedAudioFormats[0];
	}
	else {
		Mojo.Log.info(this.audioRecorder.supportedAudioFormats.length, " choices for capture format.");

		for (idx=0; this.audioRecorder.supportedAudioFormats.length != idx; ++idx){
			var fmt = this.audioRecorder.supportedAudioFormats[idx];
			Mojo.Log.info("Format available for audio: ", JSON.stringify(fmt));
			this.model.choices.push({label: fmt.mimetype + ":"+fmt.bitrate+"/"+fmt.samplerate,'value':idx});
			
		}
		this.controller.modelChanged(this.model);
	}
	
	return; 
}