function SplashAssistant(arg) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.launchParams = arg; 
	this.AppDB = new AppDBAssistant(this);
}
SplashAssistant.prototype.updateSplash = function(message){
	this.controller.get('status-area').innerText = message;
}

SplashAssistant.prototype.setup = function() {
	
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* CREATE A DELAY SO THE SPLASH SCREEN DOESN'T DISAPPEAR TOO QUICKLY */
	setTimeout(this.delay.bind(this),1000);
	
	this.controller.setupWidget("spinnerId",
        this.attributes = {
            spinnerSize: Mojo.Widget.spinnerLarge
        },
        this.model = {
            spinning: true 
        }
    );
	
	/* add event handlers to listen to events from widgets */
};
SplashAssistant.prototype.delay = function(){
		this.AppDB.check4DB();
}
SplashAssistant.prototype.dbReady = function() {
	
	if (this.launchParams.query) {
		this.controller.stageController.swapScene('main',{searchString:this.launchParams.query,Appdb:this.AppDB}) 
	}else if(this.launchParams.playerId){
		var id = [this.launchParams.playerId];	
		
		this.AppDB.DB.get(id).then(function(future) {
			var result = future.result;
		      var rs = future.result.results;
		      if (result.returnValue == true)
		      { 
				  this.controller.stageController.swapScene('editPlayer',{playerId : rs[0],uSearch:true,Appdb:this.AppDB}) 
				  
		      }
		      else
		      {  
		         result = future.exception;
		         Mojo.Log.info("get failure: Err code=" + result.errorCode + "Err message=" + result.message); 
		      }	
		}.bind(this))
	}else if(this.launchParams.newPlayer){
			
			this.controller.stageController.swapScene('editPlayer',{newPlayer : this.launchParams.newPlayer,uSearch:true,Appdb:this.AppDB})
	}else{
		this.controller.stageController.swapScene('main',{Appdb:this.AppDB});
		
	}
};
SplashAssistant.prototype.activate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};
SplashAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SplashAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
