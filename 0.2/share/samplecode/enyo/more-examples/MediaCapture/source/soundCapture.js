enyo.kind({
	name: "soundCapture",
	kind: "VFlexBox",
	components: [
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			{kind: "SpinnerLarge"}
		]},
		{name: "canvas", nodeTag:"canvas",style: "width:600px;height:200px;border: 2px solid #000;background: #000000;margin-left: 100px;"},
		
		{kind: "RowGroup",caption: "Audio Capture",style:"margin-left: 200px;bottom: 200px;width:300px;left:20%;",components: [
				{kind: "Button", name:"recordSoundButton",className: "enyo-button-negative",caption: "Record",  onclick: "recordClicked"},
				{kind:"ActivityButton", active: false,disabled: true, name:"playButton", className: "enyo-button-dark",caption: "Play", onclick: "playClicked"}
			]},
		{kind: "enyo.MediaCapture", name: "mediaCaptureSound", onInitialized: "loadMediaCap", onLoaded: "mediaCapLoaded",onVuData:"updateGraph",onError: "someErrorOccured",onAudioCaptureComplete:"captureComplete"},
		{kind: "ApplicationEvents", onLoad: "onLoad"},
		{kind: "Sound", name: "myaudio"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.showScrim(true);
		this.recording = false;
	},
	
	showScrim: function(inShowing) {
		this.$.scrim.setShowing(inShowing);
		this.$.spinnerLarge.setShowing(inShowing);
	},
	onLoad: function(){	
		this.load();
		
	},
	load: function(){	
		this.$.mediaCaptureSound.initialize();
		
	},
	unload: function(){	
		this.$.mediaCaptureSound.unload();
		
	},
	loadMediaCap: function(inSender, inResponse){
		
		for (var format in inResponse){
			console.log("ENDA " + format)
			if(format.search("audio")==0){
				md = inResponse[format].deviceUri; 
				for (i = 0; inResponse[format].supportedAudioFormats.length != i; ++i) {
					fmt = inResponse[format].supportedAudioFormats[i];
					
					if (fmt.mimetype == "audio/vnd.wave") {
						break;
					}
				}
				console.log(JSON.stringify(fmt));
				break;	
			}			
		}
		this.$.mediaCaptureSound.load(md, fmt);
	},
	mediaCapLoaded: function(){
		this.showScrim(false);
		var can = this.$.canvas.hasNode();
		this.gctx = can.getContext('2d');
		this.gctx.strokeStyle = "green";
		this.gctx.lineWidth = 6;
		this.gctx.strokeRect(70, 70, 140, 140);
		this.startGrapher(); 
	},
	recordClicked:function()
	{
		if (!this.recording) {
			this.$.recordSoundButton.caption = "Recording...";
			this.$.recordSoundButton.render();
			this.recording = true;
			timestamp = new Date().getTime();
			var file = "/media/internal/dts/sound/audio_" + timestamp + ".wav";
			var audioCaptureOptions = {};
			
			this.$.mediaCaptureSound.startAudioCapture(file, audioCaptureOptions);
			this.timestart = new Date().getTime()
			this.timer = window.setInterval(this.updateTime1.bind(this), 1000);
			
		}else{			
			console.log("WTF")
			
			this.recording = false;
			this.$.mediaCaptureSound.stopAudioCapture();
			
			window.clearInterval(this.timer)
			
		}	
	},
	captureComplete:function()
	{
		this.$.playButton.disabled=false;
		console.log("WTF COMPLETE")
		this.$.recordSoundButton.setContent( "Record");
		this.$.playButton.addClass ("enyo-button-affirmative");
	},
	playClicked:function()
	{
		this.$.playButton.active=true;
		this.$.myaudio.audio.src = this.$.mediaCaptureSound.lastAudioPath;
		this.$.myaudio.audio.play();	
	},
	getGraphColor : function(isRecording){
		if (isRecording){
			return "rgb(0, 200, 0)";
		}
		else {
			return "rgb(50, 100, 50)";
		}
	},
	grapher : function(peak){
		// Get most recent sample of VU data.
		
		if (peak){
			var height = 200*peak;
			if (this.gctx){
				this.gctx.fillStyle = this.getGraphColor(this.recording);
				this.gctx.fillRect(this.x, 160-height, 4, 200);
			}
		}

		this.x+=5;
		if (this.x == 300) {
			this.gctx.fillStyle = "rgb(0, 0, 0)"
			this.gctx.clearRect(0, 0, 600, 200);
			this.x = 0;
		}

	},	
	startGrapher : function(){	
		this.x= 0
		this.gctx.fillStyle = "rgb(0, 0, 0)"
		this.gctx.clearRect(0, 0, 600, 200);
		//this.gtimer = window.setInterval(this.grapher.bind(this), 200);
	},
	updateGraph:function(insender,inResponse){
		this.grapher(inResponse[0].peak)
		
	},	
	updateTime1: function(insender){
		if(!this.timestart){
			this.timestart = new Date();
		}
		var timeend = new Date();
		var timedifference = timeend.getTime() - this.timestart
		timeend.setTime(timedifference);
		var minutes_passed = timeend.getMinutes();
		if(minutes_passed < 10){
			minutes_passed = "0" + minutes_passed;
		}
		var seconds_passed = timeend.getSeconds();
		if(seconds_passed < 10){
			seconds_passed = "0" + seconds_passed;
		}	
		
		this.$.recordSoundButton.setContent ( "Recording... " +  minutes_passed + ":" + seconds_passed);
	},
})