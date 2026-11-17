enyo.kind({
	name: "videoCapture",
	kind: "VFlexBox",
	components: [
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			//{kind: "SpinnerLarge"}
		]},
	
		{kind: "RowGroup",align: "center", pack: "center",components: [
			{kind: "ListSelector", name:"cameraList", value: 0, label: "Camera Source:", flex: 1, onChange: "itemChanged", items: [
		        {caption: "Front", value: 1},
		        {caption: "Back", value: 2}
    		]}
		]},
		{kind: "Video", name: "streamTheVideo", style:"width:50%;height:50%;top:25%;left:25%;position:fixed"},
		
		{kind: "Group", caption: "Camera Controls",style: "bottom: 20px;width:60%;left:20%;position:fixed", components: [
			{style: "padding: 5px", components: [
				
				{kind: "Button", name:"recordButton", className: "enyo-button-negative",caption: "Record", onclick: "recordVideo"}
			]}
		]},
		{kind: "ModalDialog", name: "mdialog", caption: "Login", components:[
			{name:"dialogContent"},
			{layoutKind: "HFlexLayout", components: [  
	    		{kind: "Button", content: "OK", flex: 1, onclick: "closeDialog"},
		    	{kind: "Button", content: "View", flex: 1, onclick: "openVideo", className: "enyo-button-dark"},
			]}
		]},	
		
		{kind: "enyo.MediaCapture", name: "mediaCapture", onInitialized: "loadMediaCap", onLoaded: "mediaCapLoaded", onVideoCaptureComplete: "videoTaken", onDurationChange:"updateTime",onError: "someErrorOccured"},
		{kind: "ApplicationEvents", onLoad: "onLoad"},
		{kind: "PalmService", name: "launchPhotos", service: "palm://com.palm.applicationManager", method: "launch", onSuccess: "", onFailure: "", subscribe: true}
		
	],
	create: function() {
		this.inherited(arguments);
		this.showScrim(true);
		this.flashValue = "FLASH_AUTO"
		this.activateCamera = 0;
	},
	onLoad: function(){
				
		this.$.mediaCapture.initialize(this.$.streamTheVideo);
		
	},
	showScrim: function(inShowing) {
		this.$.scrim.setShowing(inShowing);
		//this.$.spinnerLarge.setShowing(inShowing);
	},
	
	closeDialog: function(){
		this.$.mdialog.close();
	},
	openPhotosApp: function(){
		 console.log(this.$.mediaCapture.lastVideoPath)
		 try {
		 	this.$.launchPhotos.call({
		 			target: this.$.mediaCapture.lastVideoPath,
				
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
		this.$.mediaCapture.load(this.cameras[this.activateCamera].uri, this.cameras[this.activateCamera].fmtC);
	},
	itemChanged:function(insender){
		this.showScrim(true);
		this.$.mediaCapture.unload();
		console.log(this.cameras[insender.value].uri + " : " + this.cameras[insender.value].fmtC)
		this.activateCamera = insender.value;
		//this.$.mediaCapture.load(this.cameras[insender.value].uri, this.cameras[insender.value].fmtC);
		this.$.mediaCapture.initialize(this.$.streamTheVideo);
	},
	mediaCapLoaded: function(){
		this.showScrim(false); 
	},
		
	videoTaken: function(inSender){
		this.$.mdialog.caption = "Media Captured"; 
		this.$.mdialog.openAtCenter();
				
	},
	recordVideo:function(inSender){
		if(!this.recording){
			this.recording = true;
			this.$.recordButton.setContent ( "Stop");
			this.vidName = Date.parse(new Date())
			var arg ={"title":this.vidName,"flash":"FLASH_ON"};
			this.$.mediaCapture.startVideoCapture('/media/internal/Camera/' + this.vidName, arg);
			this.timestamp = new Date().getTime()
			window.setTimeout(function(){this.$.recordButton.setContent ( "Recording...") + (new Date().getTime()-this.timestamp);}.bind(this), 1000);
		}
		else{
			this.recording = false;
			this.$.recordButton.setContent ("Record");
			this.$.mediaCapture.stopVideoCapture();
			this.videoTaken()// looks like there is a bug in the complete callback
		}
		
	},
	updateTime: function(insender){
		console.log("DURATION")
		this.$.recordButton.setContent (insender.value);	
	},
	openVideo: function(){
		 try {
		 	this.$.launchPhotos.call({
				"id": "com.palm.app.browser",
				"params": {
					target: this.$.mediaCapture.lastVideoPath
				}
					
				
		 	});
		 }catch(e){
		 	console.log(e);
		 }
		 this.closeDialog();
	},
})