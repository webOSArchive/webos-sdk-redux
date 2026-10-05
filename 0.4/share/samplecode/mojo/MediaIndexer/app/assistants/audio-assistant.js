function AudioAssistant(arg1, arg2,arg3){
    /* this is the creator function for your scene assistant object. It will be passed all the 
     additional parameters (after the scene name) that were passed to pushScene. The reference
     to the scene controller (this.controller) has not be established yet, so any initialization
     that needs the scene controller should be done in the setup function below. */
    this.DB = arg1;
    this.filter = arg2;
    this.type = arg3
	this.fquery = {
        "select": ["title", "path", "created", "size", "duration", "artist", "album", "genre", "isRingtone","playlist"],
        "from": "com.palm.media.audio.file:1",
        'where': this.filter
    };
	Mojo.Log.error("QUERY " + JSON.stringify(this.fquery))
}
AudioAssistant.prototype.setup = function(){
    /* this function is for setup tasks that have to happen when the scene is first created */
    
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    
    /* update the app info using values from our app */
	this.audioModel = {
             listTitle: "Audio",
             items : []
          }
    this.controller.setupWidget("listId",
        	this.attributes = {
	            itemTemplate: "audio/list",
	            listTemplate: 'list/listcontainer',
	            swipeToDelete: false,
	            reorderable: true,
	            emptyTemplate:"list/emptylist"
	         },
         	this.audioModel);
	// Need to check permissions again in case we're not coming from the main scene		 
	this.checkPermissions();		
    
    /* add event handlers to listen to events from widgets */
    this.handleTap = this.handleTap.bind(this);
	this.handleBack = this.handleBack(this);
};
AudioAssistant.prototype.handleTap = function(event){
	Mojo.Controller.getAppController().showBanner("Playing " + event.item.title,
     {source: 'notification'});
	if (this.myAudioObj) {
		this.myAudioObj.pause();
		this.myAudioObj.src = null;
	} 
    this.myAudioObj = new Audio();
	this.myAudioObj.src = event.item.path;
	this.myAudioObj.play();
};
AudioAssistant.prototype.activate = function(event){
    /* put in event handlers here that should only be in effect when this scene is active. For
     example, key handlers that are observing the document */

	this.controller.listen(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);	
};
AudioAssistant.prototype.handleCommand = function(event){
	if (event.type == Mojo.Event.back) {
		this.myAudioObj.pause();
		this.myAudioObj.src = undefined;
		this.controller.stageController.popScene();
	}
}
AudioAssistant.prototype.deactivate = function(event){
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
     this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

AudioAssistant.prototype.cleanup = function(event){
    /* this function should do any cleanup needed before the scene is destroyed as 
     a result of being popped off the scene stack */
};
AudioAssistant.prototype.requestPermission = function() {
	this.controller.serviceRequest('palm://com.palm.mediapermissions', {
        method: 'request',
        parameters: {
            rights: {
                read: [
					'com.palm.media.audio.file:1'
				]
            }
        },
        onComplete: function(response) {
            if (response.returnValue && response.isAllowed) {
                Mojo.Log.info('Got permissions okay!');
				this.populateList();
            } else {
                Mojo.Controller.errorDialog('Failed to get permissions!'); 
				Mojo.Log.error('Failed to get permissions!' + response.returnValue + " " + response.isAllowed);
				Mojo.Controller.showAlertDialog({
				    onChoose: function(value) {this.controller.stageController.popScene()},
				    title: $L("Permission denied"),
				    message: $L('Failed to get permissions!'),
				    
				}.bind(this));
				return false;
            }
        }.bind(this)
    });
}
 
 
AudioAssistant.prototype.checkPermissions = function() {
    this.controller.serviceRequest('palm://com.palm.db', {
        method: 'find',
        parameters: {
            query: {
                from: 'com.palm.media.audio.file:1',
                limit: 1
            }
        },
        onSuccess: function() {
            Mojo.Log.info('we have permissions.');
            this.populateList();
        }.bind(this),
        onFailure: function() {
            Mojo.Log.info('we dont have permission, asking.');
            this.requestPermission();
        }.bind(this)
    });
}
AudioAssistant.prototype.populateList = function() {
	Mojo.Log.info('this.type = ' + this.type);
	if (this.type == 'get') {
		this.controller.serviceRequest('palm://com.palm.db', {
			method: 'get',
			parameters: this.filter,
			onSuccess: function(result){
				Mojo.Log.info('we have permissions.');
				audiofiles = result.results;
				var i = 0;
				while (audiofiles[i] != null) {
					Mojo.Log.info("title: " + audiofiles[i].title + ",  path: " + audiofiles[i].path + ", created: " + audiofiles[i].createdTime + ",  size: " + audiofiles[i].size);
					Mojo.Log.info("duration: " + audiofiles[i].duration + ",  artist: " + audiofiles[i].artist + ", album: " + audiofiles[i].album + ",  genre: " + audiofiles[i].genre + ",  isRingtone: " + audiofiles[i++].isRingtone);
				}
				this.audioModel.items = audiofiles;
				this.controller.modelChanged(this.audioModel)
			}.bind(this)			,
			onFailure: function(e){
				Mojo.Log.info(JSON.stringify(e));
				
			}.bind(this)
		});
	}
	else {
		this.DB.find(this.fquery, false, false).then(function(future){ // Get data, no watch, no count
			var result = future.result;
			var audiofiles;
			if (result.returnValue == true) {
				audiofiles = result.results;
				var i = 0;
				while (audiofiles[i] != null) {
					Mojo.Log.info("title: " + audiofiles[i].title + ",  path: " + audiofiles[i].path + ", created: " + audiofiles[i].createdTime + ",  size: " + audiofiles[i].size);
					Mojo.Log.info("duration: " + audiofiles[i].duration + ",  artist: " + audiofiles[i].artist + ", album: " + audiofiles[i].album + ",  genre: " + audiofiles[i].genre + ",  isRingtone: " + audiofiles[i++].isRingtone);
				}
			}
			else {
				result = future.exception;
				Mojo.Log.info("find failure: Err code=" + result.errorCode + "Err message=" + result.message);
			}
			this.audioModel.items = audiofiles;
			this.controller.modelChanged(this.audioModel)
		}.bind(this));
	}
}

