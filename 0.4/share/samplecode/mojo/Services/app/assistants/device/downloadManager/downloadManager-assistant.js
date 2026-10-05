function DownloadManagerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DownloadManagerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.controller.setupWidget("downloadButton",
        this.attributes = {
				type : Mojo.Widget.activityButton
            },
        this.model = {
            label : "Download",
            disabled: false
        });
	this.controller.setupWidget("uploadButton",
        this.attributes = {
				type : Mojo.Widget.activityButton
            },
        this.model = {
            label : "Upload",
            disabled: false
        });

	
	
	
	this.handleDownloadButton = this.handleDownloadButton.bind(this)
	this.handleUploadButton =this.handleUploadButton.bind(this)
	Mojo.Event.listen(this.controller.get('downloadButton'),Mojo.Event.tap,this.handleDownloadButton)
	Mojo.Event.listen(this.controller.get('uploadButton'),Mojo.Event.tap,this.handleUploadButton)
}
DownloadManagerAssistant.prototype.handleDownloadButton = function(event) {
	try{
		 this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
		 	method: 'download', // - will download specified file
				parameters: {
					target: "http://developer.palm.com/download/attachments/38731952/palm-mojo-styling-07.xls",
					//"mime" : "my-mime-type" (optional)
					targetDir : "/media/internal/palmdts/", //(has to be within /media/internal, will default to /media/internal/downloads)
					"targetFilename" : "palm-mojo-styling-07.xls", //(will default to originalfilename)
					keepFilenameOnRedirect: true,
					subscribe: false
				},
				onSuccess : function (resp){
					Mojo.Log.info('RESPONSE Success: ' + Object.toJSON(resp));
					this.controller.get('area-to-update').update("Download success, ticket = " + resp.ticket + "\npalm-mojo-styling-07.xls save to /media/internal/palmdts/")}.bind(this),			
				onFailure : function (e){
					Mojo.Log.info('RESPONSE Failure : ' + Object.toJSON(e));
					this.controller.get('area-to-update').update("Download failed, " + e.errorCode + " : " + e.errorText)}.bind(this)
			});
	}catch(e){this.controller.get('area-to-update').update(Object.toJSON(e))}
	this.controller.get('downloadButton').mojo.deactivate()
}
DownloadManagerAssistant.prototype.handleUploadButton = function(event) {
	try{
	  	this.controller.serviceRequest("palm://com.palm.downloadmanager", {
          method: "upload",
          parameters: {
            "fileName": '/media/internal/wallpapers/01.jpg',
            "url": 'www.freeaspupload.net/freeaspupload/testUpload.asp',
            "fileLabel":"filename",
            "subscribe":true
			},
			onSuccess : function (resp){
					Mojo.Log.info('RESPONSE Success: ' + Object.toJSON(resp));
					this.controller.get('area-to-update').update("Upload success, ticket = " + resp.ticket)
					
					}.bind(this),			
				onFailure : function (e){
					Mojo.Log.info('RESPONSE Failure : ' + Object.toJSON(e));
					this.controller.get('area-to-update').update("Upload failed, " + e.errorCode + " : " + e.errorText)}.bind(this)
		});
		}catch(e){this.controller.get('area-to-update').update(Object.toJSON(e))}
		this.controller.get('uploadButton').mojo.deactivate()
}
DownloadManagerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


DownloadManagerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

DownloadManagerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListen(this.controller.get('downloadButton'),Mojo.Event.tap,this.handleDownloadButton)
	Mojo.Event.stopListen(this.controller.get('uploadButton'),Mojo.Event.tap,this.handleUploadButton)
}
