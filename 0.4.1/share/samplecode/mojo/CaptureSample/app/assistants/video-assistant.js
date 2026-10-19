function VideoAssistant() {
}

VideoAssistant.prototype.setup = function() {
	this.controller.setupWidget("listselectorId",
	  this.attributes = {
	      choices: [
	          {label: "One", value: 1},
	          {label: "Two", value: 2},
	          {label: "Three", value: 3}
	      ]
	  },
	  this.model = {
	      value: 3,
	      disabled: false
	  }
	);
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
	var dInfo = Mojo.Environment.DeviceInfo;
	try{
		this.videoObject = this.controller.get('video-object');	
		
		/** 
		 *  Load the media capture loadable library.
		 */
		var libraries = MojoLoader.require({
		    name: "mediacapture",
		    version: "1.0"
		}) 
		if(libraries){
			this.cap = libraries.mediacapture.MediaCapture({
				video: this.videoObject
			});
		}else{
			Mojo.Log.info("Error loading media libs");
			this.controller.get('area-to-update1').innerText = ("Error loading media libs.");
		}
			
	}
	catch(e){
		Mojo.Log.error("VideoAssistant ::setup threw: ", JSON.stringify(e));
	}
	/* add event handlers to listen to events from widgets */
};
VideoAssistant.prototype.handleError = function(e) {
	Mojo.Log.info('****************************** VideoAssistant ERROR');
};



VideoAssistant.prototype.recordingCallback = function(event) {
	Mojo.Log.info('****************************** VideoAssistant RECORDING : ');
};
VideoAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.setSource();
	this.controller.listen(this.controller.get('playButton'),Mojo.Event.tap,this.playCallback)
	this.controller.listen(this.controller.get('startButton'),Mojo.Event.tap,this.startCallback)
	this.controller.listen(this.controller.get('stopButton'),Mojo.Event.tap,this.stopCallback)
	this.cap.addEventListener("videocapturecomplete",this.videoTaken , false);
	
};

VideoAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.cap.unload();
	this.controller.stopListening(this.controller.get('playButton'),Mojo.Event.tap,this.playCallback)
	this.controller.stopListening(this.controller.get('startButton'),Mojo.Event.tap,this.startCallback)
	this.controller.stopListening(this.controller.get('stopButton'),Mojo.Event.tap,this.stopCallback) 
	this.cap.removeEventListener("videocapturecomplete",this.videoTaken , false); 
	
};
VideoAssistant.prototype.startCallback = function(event) {	
	//this.controller.get('area-to-update1').innerText = 'Recording ...'
	this.timestart = 0;
	this.stopModel.disabled = false
	this.controller.modelChanged(this.stopModel)
	this.vidName = "VidSample" + Date.parse(new Date()) 
	this.cap.startVideoCapture('/media/internal/dts/samples/'+this.vidName+'.mp4',{});
	this.showtimer();
};
VideoAssistant.prototype.stopCallback = function(event) {
	//this.controller.get('area-to-update1').innerText = 'Recording finished, press play';
	this.controller.get('startButton').mojo.deactivate();
	this.playModel.disabled = false
	this.controller.modelChanged(this.playModel)
	clearTimeout( this.timercount)
	this.stopModel.disabled = true
	this.stopModel.label = "Stop"
	this.controller.modelChanged(this.stopModel)
	this.cap.stopVideoCapture();
};	

VideoAssistant.prototype.showtimer = function() {
	if(this.timercount) {
		this.controller.window.clearTimeout(this.timercount);
	}
	if(!this.timestart){
		this.timestart = new Date();
	}
	var timeend = new Date();
	var timedifference = timeend.getTime() - this.timestart.getTime();
	timeend.setTime(timedifference);
	var minutes_passed = timeend.getMinutes();
	if(minutes_passed < 10){
		minutes_passed = "0" + minutes_passed;
	}
	var seconds_passed = timeend.getSeconds();
	if(seconds_passed < 10){
		seconds_passed = "0" + seconds_passed;
	}
	this.stopModel.label = minutes_passed + ":" + seconds_passed;
	this.controller.modelChanged(this.stopModel)
	
	this.timercount = setTimeout(this.showtimer.bind(this), 1000);
}

VideoAssistant.prototype.playCallback = function(event) {
/*	VideoLibrary = MojoLoader.require({name: "metascene.videos", version: "1.0"})["metascene.videos"];
	params = {
		target: '/media/internal/dts/samples/'+this.vidName+'.mp4',
		initalPos: 0,
		thumbUrl: Mojo.appPath + '/icon.png',
		title: 'My Title',
		enableControls: false
	}
//}	
VideoLibrary.Push(this.controller.stageController, VideoLibrary.Nowplaying, params);

	*/
	this.controller.stageController.pushScene('viewVideo',this.cap.lastVideoPath)
	window.setTimeout(this.deactivateSpinner.bind(this), 3000);
};
VideoAssistant.prototype.deactivateSpinner = function() {
	this.controller.get('playButton').mojo.deactivate();
}
VideoAssistant.prototype.mediaHandleEvent = function(event){
	try{
		switch(event.type){
			// Handled events 
			// (listed in alphabetical order)
			// This is not an exhaustive list, but enough for this simple example.

			case 'canplay':
				if (event.target.paused){
					this.playModel.label = 'Continue'
					this.controller.modelChanged(this.playModel)
				}
				break;
			case 'ended':
				this.playModel.label = 'Play'
				this.controller.modelChanged(this.playModel)				
				this.controller.get('area-to-update2').innerText = ("Play it again Sam...");
				this.controller.get('playButton').mojo.deactivate();
				break;
			case 'error':
				Mojo.Log.warn("Error occured on the media element: ", event.target.error);
				this.controller.get('area-to-update2').innerText = ("Error occured on the media element: " + event.target.error);
				break;
			case 'pause':
				this.controller.get('area-to-update2').innerText = ("Paused!!");
				this.playModel.label = 'Continue'
				this.controller.modelChanged(this.playModel)
				Mojo.Log.warn("State went to pause.  presumably there was a call or some other such high priority interrupt");
				break;
			case 'play':
				this.playModel.label = 'Pause'
				this.controller.modelChanged(this.playModel)
				this.controller.get('area-to-update2').innerText = ("Playing ...");
				break;
			case 'stop':
				this.controller.get('area-to-update2').innerText = ("Stopped ...");
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
VideoAssistant.prototype.setSource = function(sourceIdx){
	var idx = sourceIdx || 0;
	if (!this.cap.captureDevices) {
		Mojo.Log.info("No audio capture devices");	
	}
	else {
		

		Mojo.Log.info("Capture devices:  ", JSON.stringify(this.cap.captureDevices));
		var fmt = this.selectFormat();
		
		// Each device may support one or more of INPUT_TYPE_AUDIO, INPUT_TYPE_IMAGE, INPUT_TYPE_VIDEO.  
		// In the case of video the will be only one choice. 
		var device = this.nextVideoDevice(this.cap, 1);
		if (!device) {
			Mojo.Log.info("There are no audio devices");
		}
		else {
			Mojo.Log.info("loading device <<", device.deviceUri, ">>");
			this.cap.load(
				device.deviceUri,{ 
				VideoCaptureFormat:fmt
			});
		}
	}
}
VideoAssistant.prototype.selectFormat = function(){
	var idx = 0;
	Mojo.Log.info("Supported video formats: ", JSON.stringify(this.cap.supportedVideoFormats));
	
	if (undefined === this.cap.supportedVideoFormats) {
		return;
	}
	else if (1 === this.cap.supportedVideoFormats.length) {
		// Only one supported format.
		Mojo.Log.info("No choices for capture format.");
		selectedFormat_ = this.cap.supportedVideoFormats[0];
		return selectedFormat_;
	}
	else {
		Mojo.Log.info(this.cap.supportedVideoFormats.length, " choices for capture format.");

		for (idx=0; this.cap.supportedVideoFormats.length != idx; ++idx){
			var fmt = this.cap.supportedVideoFormats[idx];
			Mojo.Log.info("Format available for audio: ", JSON.stringify(fmt));
		}


		for (idx=0; this.cap.supportedVideoFormats.length != idx; ++idx){
			selectedFormat_ = this.cap.supportedVideoFormats[idx];
			if (selectedFormat_.bitrate <= 128000){
				Mojo.Log.info("Selected ", JSON.stringify(selectedFormat_), " as selected capture format");
				return selectedFormat_;
			}
			++idx;
		}

		//default
		selectedFormat_ = this.cap.supportedVideoFormats[0];
		return selectedFormat_;
	}
	
	return; 
}

VideoAssistant.prototype.nextVideoDevice = function(capObj, idx){
	Mojo.Log.error("capObj.captureDevices.length : " + capObj.INPUT_TYPE_VIDEO)
	
	idx = idx||0; 
	for (var devIdx=idx;devIdx != capObj.captureDevices.length; ++devIdx){
		var dev = capObj.captureDevices[devIdx];
		for (var typeIdx = 0; typeIdx != dev.inputtype.length; ++typeIdx){
			if (dev.inputtype[typeIdx] == capObj.INPUT_TYPE_IMAGE){
				Mojo.Log.info("Device ", devIdx, " (", dev.description, ") supports types: ", JSON.stringify(dev.inputtype));
				//return dev;
			}
		}
	}
}

//[{"inputtype":[1],"deviceUri":"audio:","description":"Front Microphone"},
//{"inputtype":[2,3],"deviceUri":"video:","description":"Camera/Camcorder"},
//{"inputtype":[2],"deviceUri":"video:1","description":"Front Camera"}]