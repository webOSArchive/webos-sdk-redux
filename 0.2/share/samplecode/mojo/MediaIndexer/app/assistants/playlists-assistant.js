function PlaylistsAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.DB = args;
}

PlaylistsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.playlistModel = {
             listTitle: "PlayLists",
             items : [{}]
          }
	this.controller.setupWidget("listId",
        	this.attributes = {
	            itemTemplate: "playlists/list",
	            listTemplate: 'list/listcontainer',
	            swipeToDelete: false,
	            reorderable: true,
	            emptyTemplate:"list/emptylist"
	         },
         	this.playlistModel);
	
	var fquery = { "select" : ["name", "path", "songIds"], "from":"com.palm.media.playlist.object:1"};
	this.DB.find(fquery, false, false).then(function(future) { // Get data, no watch, no count
		var result = future.result;   
		if (result.returnValue == true){
			var playlistobjects = result.results;
         	var i = 0;
         	while (playlistobjects[i] != null) {
            	Mojo.Log.info("Name: "+playlistobjects[i].name+ ", IDs: "+playlistobjects[i++].songIds); 
          	}   
		}else{  
			result = future.exception;
			Mojo.Log.info("find failure: Err code=" + result.errorCode + "Err message=" + result.message); 
		}
	  	this.playlistModel.items = playlistobjects;
		this.controller.modelChanged(this.playlistModel) 
    }.bind(this));
	
	/* add event handlers to listen to events from widgets */
	this.handleTap = this.handleTap.bind(this);
	
}
PlaylistsAssistant.prototype.handleTap = function(event) {			
	var fquery = {"ids":event.item.songIds}
	this.controller.serviceRequest('palm://com.palm.db', {
        method: 'get',
        parameters: fquery,
        onSuccess: function(result) {
            Mojo.Log.info('we have permissions.');
            audiofiles = result.results;
            var i = 0;
            while (audiofiles[i] != null) {            
                Mojo.Log.info("title: " + audiofiles[i].title + ",  path: " + audiofiles[i].path + ", created: " + audiofiles[i].createdTime + ",  size: " + audiofiles[i].size);
                Mojo.Log.info("duration: " + audiofiles[i].duration + ",  artist: " + audiofiles[i].artist + ", album: " + audiofiles[i].album + ",  genre: " + audiofiles[i].genre + ",  isRingtone: " + audiofiles[i++].isRingtone);                
            }
        }.bind(this),
        onFailure: function(e) {
            Mojo.Log.info(JSON.stringify(e));
            
        }.bind(this)
    });
	var type='get';
	this.controller.stageController.pushScene('audio',this.DB,fquery,type)

};

PlaylistsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	 this.controller.listen(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap); 
};

PlaylistsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

PlaylistsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
