function VideofilesAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.DB =  args;
}

VideofilesAssistant.prototype.setup = function(){
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	//** Construct query, specifying fields to retrieve and kind
	this.videofilesModel = {
             listTitle: "Video Files",
             items : [{}]
          }
	this.controller.setupWidget("listId",
        	this.attributes = {
	            itemTemplate: "videofiles/list",
	            listTemplate: 'list/listcontainer',
	            swipeToDelete: false,
	            reorderable: true,
	            emptyTemplate:"list/emptylist"
	         },
         	this.videofilesModel);
	
	var fquery = { "select" : ["title", "description"], "from":"com.palm.media.video.file:1"};
	this.DB.find(fquery, false, false).then(function(future) { // Get data, no watch, no count
		var result = future.result;   
		var videofiles;
		if (result.returnValue == true){
			videofiles = result.results;
         	var i = 0;
         	while (videofiles[i] != null) {
            	Mojo.Log.info("Path: "+videofiles[i].path+ ", Modified: "+ videofiles[i].modifiedTime+", Created: "+videofiles[i].createdTime + ", Title: "+videofiles[i].title); 
            	Mojo.Log.info("Size: "+videofiles[i].size+ ", Playback Position: "+ videofiles[i].playbackPosition+", Duration: "+videofiles[i].duration + ", Description: "+videofiles[i++].description);		 		 
         	}   
		}else{  
			result = future.exception;
			Mojo.Log.info("find failure: Err code=" + result.errorCode + "Err message=" + result.message); 
		}
	  	this.videofilesModel.items = videofiles;
		this.controller.modelChanged(this.videofilesModel) 
    }.bind(this));
	this.handleTap = this.handleTap.bind(this);
}
VideofilesAssistant.prototype.handleTap = function(event) {			
	var args = {
		appId: "com.palm.app.videoplayer",
		name: "nowplaying"
    }
    var params = {};
    params.target = event.item.path;
    params.title = event.item.title;
    params.initialPos = 0;
    this.controller.stageController.pushScene(args, params);
};

VideofilesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.listen(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

VideofilesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

VideofilesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
