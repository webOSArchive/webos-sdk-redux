function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	//this.db = args
	try {
        //load up the foundations libraries
		this.libraries = MojoLoader.require({ name: "foundations", version: "1.0"});
		this.Future = this.libraries["foundations"].Control.Future;
		this.DB = this.libraries["foundations"].Data.DB;  
		Mojo.Log.info("********************Main DB set*****************************"+this.DB);
	} catch (Error) {
		Mojo.Log.error("Lib Load error, in StageAssistant" + Error);
	}
}

MainAssistant.prototype.setup = function() {
	Mojo.Log.info("********************Launching Main*****************************");
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.albumimageKind =	  'com.palm.media.image.album:1';
	this.imageKind =	      'com.palm.media.image.file:1';
	this.albumKind =	      'com.palm.media.audio.album:1';
	this.artistKind =         'com.palm.media.audio.artist:1';
	this.audiofileKind=       'com.palm.media.audio.file:1';
	this.genreKind =	      'com.palm.media.audio.genre:1';
	this.playlistKind =	      'com.palm.media.playlist.object:1';
	this.videofileKind =      'com.palm.media.video.file:1';
	
	this.controller.setupWidget("albumimageId",
			{},
			this.albumimageButtonModel = {
				label : "Album Image",
				disabled: false
			}
		);	
	this.controller.setupWidget("imageId",
			{},
			this.imageButtonModel = {
				label : "Image",
				disabled: false
			}
		);	
	this.controller.setupWidget("albumId",
		{},
		this.albumButtonModel = {
			label : "Albums",
			disabled: false
		}
	);
	this.controller.setupWidget("artistsId",
		{},
		this.artistButtonModel = {
			label : "Artists",
			disabled: false
		}
	);
	this.controller.setupWidget("audiofilesId",
		{},
		this.audiofilesButtonModel = {
			label : "Audio Files",
			disabled: false
		}
	);
	this.controller.setupWidget("genresId",
		{},
		this.genresButtonModel = {
			label : "Genres",
			disabled: false
		}
	);
	this.controller.setupWidget("playlistId",
		{},
		this.playlistButtonModel = {
			label : "Play Lists",
			disabled: false
		}
	);
	this.controller.setupWidget("videofilesId",
		{},
		this.videofilesButtonModel = {
			label : "Video Files",
			disabled: false
		}
	);
	this.buttonPressed = this.buttonPressed.bind(this)  
};

MainAssistant.prototype.buttonPressed = function(event) {
	//Check if we have permission to access the mediaIndexer when the user presses the button
	var elementId = event.srcElement.id.substr(0,event.srcElement.id.length-12)
	elementId = elementId.substr(elementId.indexOf('main')+4,elementId.length - elementId.lastIndexOf('-'))
	switch(elementId){
	    case 'albumimageId':
		    this.checkPermissions(this.albumimageKind,'albumimage')
		    break;
	    case 'imageId':
		    this.checkPermissions(this.imageKind,'image')
		    break;
		case 'albumId':
			this.checkPermissions(this.albumKind,'album')
			break;
		case 'artistsId':
			this.checkPermissions(this.artistKind,'artists')
			break;
		case 'audiofilesId':
			this.checkPermissions(this.audiofileKind,'audio')
			break;
		case 'genresId':
			this.checkPermissions(this.genreKind,'genres')
			break;
		case 'playlistId':
			this.checkPermissions(this.playlistKind,'playlist')
			break;
		case 'videofilesId':
			this.checkPermissions(this.videofileKind,'videofiles')
			break;
	}
};
MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get("albumimageId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.listen(this.controller.get("imageId"),Mojo.Event.tap, this.buttonPressed); 
	Mojo.Event.listen(this.controller.get("albumId"),Mojo.Event.tap, this.buttonPressed); 
	Mojo.Event.listen(this.controller.get("artistsId"),Mojo.Event.tap, this.buttonPressed);	
	Mojo.Event.listen(this.controller.get("audiofilesId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.listen(this.controller.get("genresId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.listen(this.controller.get("playlistId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.listen(this.controller.get("videofilesId"),Mojo.Event.tap, this.buttonPressed);  
};

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get("albumimageId"),Mojo.Event.tap, this.buttonPressed); 
	Mojo.Event.stopListening(this.controller.get("imageId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.stopListening(this.controller.get("albumId"),Mojo.Event.tap, this.buttonPressed); 
	Mojo.Event.stopListening(this.controller.get("artistsId"),Mojo.Event.tap, this.buttonPressed);	
	Mojo.Event.stopListening(this.controller.get("audiofilesId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.stopListening(this.controller.get("genresId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.stopListening(this.controller.get("playlistId"),Mojo.Event.tap, this.buttonPressed);
	Mojo.Event.stopListening(this.controller.get("videofilesId"),Mojo.Event.tap, this.buttonPressed);  
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
MainAssistant.prototype.requestPermission = function(scene,db) {
    Mojo.Log.info('************* REQUSTING PERMISSION FOR**** ' + db);
    console.log('************* REQUSTING PERMISSION FOR**** ' + db);
	this.controller.serviceRequest('palm://com.palm.mediapermissions', {
        method: 'request',
        parameters: {
            rights: {
                read: [
					db
				]
            }
        },
        onComplete: function(response) {
            if (response.returnValue && response.isAllowed) {
                Mojo.Log.info('*************Got permissions okay!');
                this.controller.stageController.pushScene(scene,this.db);
            } else {
                Mojo.Controller.errorDialog('Failed to get permissions!'); 
				Mojo.Log.error('***************Failed to get permissions!' + response.returnValue + " " + response.isAllowed);
				return false;
            }
        }.bind(this)
    });
}
 
 
MainAssistant.prototype.checkPermissions = function(db,scene) {
    this.controller.serviceRequest('palm://com.palm.db', {
        method: 'find',
        parameters: {
            query: {
                from: db,
                limit: 4
            }
        },
        onSuccess: function() {
            Mojo.Log.info('***************************we have permissions.'+db);
            //this.controller.stageController.pushScene(scene,this.db);
            this.controller.stageController.pushScene(scene,this.DB);
        }.bind(this),
        onFailure: function() {
            Mojo.Log.info('*************************we dont have permission, asking.'+db);
            this.requestPermission(scene,db);
        }.bind(this)
    });
}