function ImageAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ImageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.controller.setupWidget("listselectorId",
	  this.attributes = {
	      modelProperty:'value',
		  label : 'Camera'
	  },
	  this.modelDevices = {
	      choices: [],
		  value: 1,
	      disabled: false
	  }
	);
	
	this.controller.setupWidget(Mojo.Menu.commandMenu,
	    {
	        spacerHeight: 0,
	        menuClass: 'palm-dark'
	    },
	    {
	        visible: true,
	        items: [ {},
				{ label: "Press Me", command: "do-Previous",toggleCmd:'do-auto',
				items:[
					{label:'Flash On',command:'do-on'},{label:'Off',command:'do-off'},{label:'Auto',command:'do-auto'}
				]},
				{}
	        ]
	    }
	)

	this.controller.setupWidget("snapButton",
          		{
		 			type: Mojo.Widget.defaultButton
             	},
          		{
             		label : "Snap",
             		disabled: false,
			 		buttonClass: 'affirmative'
         		}
     );
	this.controller.setupWidget("viewButton",
         this.attributes = {
		 		type: Mojo.Widget.defaultButton
             },
         this.playModel = {
             label : "View",
             disabled: true
         }
     );
	  
	this.snapCallback = this.snapCallback.bind(this);
	this.viewCallback = this.viewCallback.bind(this);
	this.handleUpdate = this.handleUpdate.bind(this);
	
	
  
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
			this.pictureTaken = this.pictureTaken.bind(this);
			
		}else{
			Mojo.Log.info("Error loading media libs");
			this.controller.get('area-to-update1').innerText = ("Error loading media libs.");
		}
			
	}
	catch(e){
		Mojo.Log.error("ImageAssistant ::setup threw: ", JSON.stringify(e));
	}
	// Get list of available Image capture devices, Pre 3 has 2 cameras
	this.nextImageDevice(this.cap);
};
ImageAssistant.prototype.pictureTaken = function(event) {
	this.controller.showAlertDialog({
	    onChoose: function(value) {},
	    title: $L("Picture taken"),
	    message: $L('Picture location ' + this.cap.lastImagePath),
	    choices:[
	        {label:$L('OK'), value:"ok", type:'affirmative'} 
	    ]
	});
};
ImageAssistant.prototype.handleUpdate = function(event) {
	this.cap.unload();
	console.log(event.value)
	this.setSource(event.value);
};


ImageAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.setSource();
	this.controller.listen(this.controller.get("listselectorId"),Mojo.Event.propertyChange, this.handleUpdate);
	this.controller.listen(this.controller.get('viewButton'),Mojo.Event.tap,this.viewCallback)
	this.controller.listen(this.controller.get('snapButton'),Mojo.Event.tap,this.snapCallback)
	this.cap.addEventListener("imagecapturecomplete",this.pictureTaken , false);
};

ImageAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.cap.unload();
	this.controller.stopListening(this.controller.get("listselectorId"),Mojo.Event.propertyChange, this.handleUpdate);
	this.controller.stopListening(this.controller.get('viewButton'),Mojo.Event.tap,this.viewCallback)
	this.controller.stopListening(this.controller.get('snapButton'),Mojo.Event.tap,this.snapCallback)
	this.cap.removeEventListener("imagecapturecomplete",this.pictureTaken , false);
};

ImageAssistant.prototype.snapCallback = function(event) {	
	
/*	struct ImageCaptureOptions {
    // JPEG quality settings
    unsigned short quality;
 
    FlashMode flash;
 
    // The captured image must be displayed before resuming preview (in seconds).
    float reviewDuration;

 
};*/
	var ImageCaptureOptions ={'quality' : 100,'flash':this.flashValue,'reviewDuration':5,'exifData':{}}
	this.picName = "PicSample" + Date.parse(new Date()) 
	this.cap.startImageCapture('/media/internal/dts/samples/'+this.picName+'.jpg', ImageCaptureOptions);
	this.playModel.disabled = false
	this.controller.modelChanged(this.playModel)
};

ImageAssistant.prototype.viewCallback = function(event) {
	this.controller.stageController.pushScene('viewImage',this.cap.lastImagePath)
};
ImageAssistant.prototype.handleCommand = function(event){
	try{
		if(event.type == Mojo.Event.command) {
			switch(event.command){
				case 'do-on':
					this.flashValue = this.cap.FLASH_ON
					break;
				case 'do-off':
					this.flashValue = this.cap.FLASH_OFF
					break;
				case 'do-auto':
					this.flashValue = this.cap.FLASH_AUTO
					break;		
			}
		}
	}
	catch(e){
		Mojo.Log.error("PlayAudioAssistant::eventHandlerMedia threw: ", JSON.stringify(e));
	}
}
ImageAssistant.prototype.setSource = function(sourceIdx){
	var idx = sourceIdx || 1;
	if (!this.cap.captureDevices) {
		Mojo.Log.info("No capture devices");	
	}
	else {
		
		if (!this.imageCaptureDevicesExist) {
			Mojo.Log.info("There are no Image devices");
		}
		else {
			var fmt = this.selectFormat();
			Mojo.Log.info("loading device <<", this.cap.captureDevices[idx].deviceUri, ">>");
			this.cap.load(
				this.cap.captureDevices[idx].deviceUri,{ 
				VideoCaptureFormat:fmt
			});
		}
		
	}
}
ImageAssistant.prototype.selectFormat = function(){
	var idx = 0;
	Mojo.Log.info("Supported Image formats: ", JSON.stringify(this.cap.supportedImageFormats));
	
	if (undefined === this.cap.supportedImageFormats) {
		return;
	}
	else if (1 === this.cap.supportedImageFormats.length) {
		// Only one supported format.
		Mojo.Log.info("No choices for capture format.");
		selectedFormat_ = this.cap.supportedImageFormats[0];
		return selectedFormat_;
	}
	else {
		Mojo.Log.info(this.cap.supportedImageFormats.length, " choices for capture format.");

		for (idx=0; this.cap.supportedImageFormats.length != idx; ++idx){
			var fmt = this.cap.supportedImageFormats[idx];
			Mojo.Log.info("Format available for image: ", JSON.stringify(fmt));
		}


		//default return the firt one
		return this.cap.supportedImageFormats[0];
	}
	return; 
}
// Get list of available capture devices for Images
ImageAssistant.prototype.nextImageDevice = function(capObj, idx){
	count = 0;
	var devicesModel=new Array();
	idx = idx||0; 
	for (var devIdx=idx;devIdx != capObj.captureDevices.length; ++devIdx){
		var dev = capObj.captureDevices[devIdx];
		for (var typeIdx = 0; typeIdx != dev.inputtype.length; ++typeIdx){
			if (dev.inputtype[typeIdx] == capObj.INPUT_TYPE_IMAGE){
				Mojo.Log.info("Device ", devIdx, " (", dev.description, ") supports types: ", JSON.stringify(dev.inputtype));
				devicesModel[count] = new Object();
				devicesModel[count].label = dev.description 
				devicesModel[count++].value = devIdx
			}
		}
	}
	this.imageCaptureDevicesExist = true;
	this.modelDevices.choices = devicesModel;
	//Update selectorlist with image capture device options
	this.controller.modelChanged(this.modelDevices);
}