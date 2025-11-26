function ArtistsAssistant(args){
	/* this is the creator function for your scene assistant object. It will be passed all the 
	 additional parameters (after the scene name) that were passed to pushScene. The reference
	 to the scene controller (this.controller) has not be established yet, so any initialization
	 that needs the scene controller should be done in the setup function below. */
	this.DB = args;
}

ArtistsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.artistsModel = {
             listTitle: "Albums",
             items : []
          }
	this.controller.setupWidget("listId",
        	this.attributes = {
	            itemTemplate: "artists/list",
	            listTemplate: 'list/listcontainer',
	            swipeToDelete: false,
	            reorderable: true,
	            emptyTemplate:"list/emptylist"
	         },
         	this.artistsModel);
	
	var fquery = { "select" : ["name", "total.tracks", "total.albums"], "from":"com.palm.media.audio.artist:1" };
 	this.DB.find(fquery, false, false).then(function(future) { // Get data, no watch, no count
		var result = future.result;   
		var artists;
		if (result.returnValue == true){
			artists = result.results;
			var i = 0;
		 	while (artists[i] != null)
		   	Mojo.Log.info("Artist name: "+artists[i].name+ ", #tracks = "+artists[i].total.tracks+", #albums="+ artists[i++].total.albums); 
		}else{  
			result = future.exception;
			Mojo.Log.info("find failure: Err code=" + result.errorCode + "Err message=" + result.message); 
		}
	  	this.artistsModel.items = artists;
		this.controller.modelChanged(this.artistsModel) 
   }.bind(this));

	this.handleTap = this.handleTap.bind(this);
	
	/* add event handlers to listen to events from widgets */
};
ArtistsAssistant.prototype.handleTap = function(event) {			
	var fquery = [{
                prop: 'isRingtone',
                op: "=",
                val: false
            },{
                prop: 'artist',
                op: "=",
                val: event.item.name
            }]
	this.controller.stageController.pushScene('audio',this.DB,fquery)

};
ArtistsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.listen(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

ArtistsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listTap, this.handleTap);
};

ArtistsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
