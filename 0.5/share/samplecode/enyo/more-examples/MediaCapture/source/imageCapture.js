enyo.kind({
	name: "imageCapture",
	kind: "VFlexBox",
	components: [
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			{kind: "SpinnerLarge"}
		]},
	
		{kind: "RowGroup",style:"width:300px;top:20px;left: 50%;margin-left: -150px;position: absolute;pointer-events: auto;",align: "center", pack: "center",components: [
			{kind: "ListSelector", name:"cameraList", value: 0, label: "Camera Source:", flex: 1, onChange: "itemChanged", items: [
		        {caption: "Front", value: 1},
		        {caption: "Back", value: 2}
    		]}
		]},
		{kind: "Video", name: "streamTheVideo", style:"width:50%;height:50%;top:25%;left:25%;position:fixed"},
		
		{kind: "Group", caption: "Camera Controls",style: "bottom: 20px;width:60%;left:20%;position:fixed", components: [
			{style: "padding: 5px", components: [
				
				{kind: "RadioGroup", onChange: "flashOptionChanged", value: 2, components: [
					{label: "On"},
					{label: "Off"},
					{label: "AUTO"}
				]},
				{kind: "Button", name:"clickButton",className: "enyo-button-affirmative",caption: "CLICK",  onclick: "takePhoto"},
				{kind: "Button", name:"recordButton", className: "enyo-button-negative",caption: "Record", onclick: "recordVideo"}
			]}
		]},
		{kind: "ModalDialog", name: "mdialog", caption: "Login", components:[
			{name:"dialogContent"},
			{layoutKind: "HFlexLayout", components: [  
	    		{kind: "Button", content: "OK", flex: 1, onclick: "closeDialog"},
		    	{kind: "Button", content: "View", flex: 1, onclick: "openView", className: "enyo-button-dark"},
			]}
		]},	
		
		{kind: "enyo.MediaCapture", name: "mediaCaptureCamera", onInitialized: "loadMediaCap", onLoaded: "mediaCapLoaded", onVideoCaptureComplete: "videoTaken", onImageCaptureComplete: "pictureTaken", onDurationChange:"updateTime",onVuData:"updateTime",onError: "someErrorOccured"},
		{kind: "ApplicationEvents", onLoad: "onLoad"},
		{kind: "PalmService", name: "launchPhotos", service: "palm://com.palm.applicationManager", method: "launch", onSuccess: "", onFailure: "", subscribe: true}
		
	],
	create: function() {
		this.inherited(arguments);
		this.showScrim(true);
		this.flashValue = "FLASH_AUTO"
		this.activateCamera = 0;
		this.captureType = "";
	},
	load: function(){
				
		this.$.mediaCaptureCamera.initialize(this.$.streamTheVideo);
		
	},
	unload: function(){
				
		this.$.mediaCaptureCamera.unload();
		
	},
	showScrim: function(inShowing) {
		this.$.scrim.setShowing(inShowing);
		this.$.spinnerLarge.setShowing(inShowing);
	},
	flashOptionChanged: function(inShowing) {
		
		switch(inShowing.value){
				case 0:
					this.flashValue = "FLASH_ON"
					break;
				case 1:
					this.flashValue = "FLASH_OFF"
					break;
				case 2:
					this.flashValue = "FLASH_AUTO"
					break;		
			}
			console.log(this.flashValue)
	},
	closeDialog: function(){
		this.$.mdialog.close();
	},
	openView:function(){
		if(this.captureType == "VIDEO")
			this.openVideo();
		else
			this.openImage();	
		this.closeDialog();	
	},
	openImage: function(){
		 console.log(this.$.mediaCaptureCamera.lastImagePath)
		 try {
		 	this.$.launchPhotos.call({
				"id": "com.palm.app.browser",
				"params": {
					target: this.$.mediaCaptureCamera.lastImagePath
				}
					
				
		 	});
		 }catch(e){
		 	console.log(e);
		 }
		 this.closeDialog();
	},
	loadMediaCap: function(inSender, inResponse){
		
		this.cameras = [];
		var cameraItems =[];
		var x =0;
		//var camerasObj = {};
		for (var format in inResponse){
			if(format.search("video")==0){
				for (i = 0; inResponse[format].supportedVideoFormats.length != i; ++i) {
					fmt2 = inResponse[format].supportedVideoFormats[i];
					
					if (fmt2.mimetype == "video/mp4") {
						break;
					}
				}
				console.log(JSON.stringify(fmt2));
				
				for (i = 0; inResponse[format].supportedImageFormats.length != i; ++i) {
					
					fmt = inResponse[format].supportedImageFormats[i];
					if (fmt.mimetype == "image/jpeg") {
						break;
					}
				}
				console.log(JSON.stringify(fmt))
				this.cameras.push({
					caption : inResponse[format].description,
					value:x++,
					uri : inResponse[format].deviceUri,
					fmtC : fmt,
					fmtV : fmt2
				})
			}
			
		}
		console.log(JSON.stringify(this.cameras))
		this.$.cameraList.setItems(this.cameras);
		this.$.mediaCaptureCamera.load(this.cameras[this.activateCamera].uri, this.cameras[this.activateCamera].fmtC);
	},
	itemChanged:function(insender){
		this.showScrim(true);
		this.$.mediaCaptureCamera.unload();
		console.log(this.cameras[insender.value].uri + " : " + this.cameras[insender.value].fmtC)
		this.activateCamera = insender.value;
		//this.$.mediaCaptureCamera.load(this.cameras[insender.value].uri, this.cameras[insender.value].fmtC);
		this.$.mediaCaptureCamera.initialize(this.$.streamTheVideo);
	},
	mediaCapLoaded: function(){
		this.showScrim(false); 
	},
	takePhoto: function(){
		
		switch(enyo.getWindowOrientation){
				case 'up':
					this.orientation = 3;
					break;
				case 'down':
					this.orientation = 4;
					break;
				case 'left':
					this.orientation = 1;
					break;
				case 'right':
					this.orientation = 2;
					break;			
			}
			
		var myexifdata  =  {
			orientation: this.orientation
		}
	
		var ImageCaptureOptions ={orientation: this.orientation,'quality' : 100,'flash':this.flashValue,'reviewDuration':5,'exifData':myexifdata}
		this.picName = "PicSample" + Date.parse(new Date()) 
		this.$.mediaCaptureCamera.startImageCapture('/media/internal/dts/image/' + this.picName + '.jpg', ImageCaptureOptions);
		
	},
	
	pictureTaken: function(inSender){
		this.captureType = "IMAGE"
		this.$.mdialog.caption = "Media Captured"; 
		//"Picture taken, saved here /media/internal/Camera/" + this.picName + ".jpg";
		this.$.mdialog.openAtCenter();
				
	},
	/*VIDEO STUFF*/
	recordVideo:function(inSender){
		if(!this.recording){
			this.recording = true;
			this.$.recordButton.setContent ( "Stop");
			this.vidName = Date.parse(new Date())
			var arg ={"title":this.vidName,"flash":"FLASH_ON"};
			this.$.mediaCaptureCamera.startVideoCapture('/media/internal/dts/video/' + this.vidName +".mp4", arg);
			this.timestart = new Date().getTime()
			this.timer = window.setInterval(this.updateTime.bind(this), 1000);
		}
		else{
			this.captureType = "VIDEO"
			this.recording = false;
			this.$.recordButton.setContent ("Record");
			this.$.mediaCaptureCamera.stopVideoCapture();
			this.videoTaken()// looks like there is a bug in the complete callback
			window.clearInterval(this.timer);
			this.timestart = ""
		}
		
	},
	videoTaken: function(inSender){
		console.log(this.$.mediaCaptureCamera.lastVideoPath)
		this.$.mdialog.caption = "Media Captured"; 
		this.$.mdialog.openAtCenter();
				
	},
	updateTime: function(insender){
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
		
		this.$.recordButton.setContent ( "Recording... " +  minutes_passed + ":" + seconds_passed);
		//this.$.recordButton.setContent (insender.value);	
	},
	openVideo: function(){
		 
		 console.log("Path : + " + this.$.mediaCaptureCamera.lastVideoPath)
		 try {
		 	this.$.launchPhotos.call({
				"id": "com.palm.app.videoplayer",
				"params": {
					target: this.$.mediaCaptureCamera.lastVideoPath
				}
				
		 	});
		 }catch(e){
		 	console.log(e);
		 }
		 this.closeDialog();
	}
})