function PowerManagerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PowerManagerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.controller.setupWidget("togglebuttonId",
        this.attributes = {
            trueValue: "On",
            falseValue: "Off" 
        },
        this.model = {
            value: false,
            disabled: false
        }
    );
	this.handleUpdate = this.handleUpdate.bind(this); 
	Mojo.Event.listen(this.controller.get("togglebuttonId"), Mojo.Event.propertyChange, this.handleUpdate)
	
	this.appController = Mojo.Controller.getAppController();
	this.activitySet = false;
	this.handleTap = this.handleTap.bind(this);
	this.controller.setupWidget("startButton",
         this.attributes = {
             },
         this.model = {
             label : "Start",
             disabled: false
         }
     );
	 
	Mojo.Event.listen(this.controller.get('startButton'), Mojo.Event.tap, this.handleTap);

};
PowerManagerAssistant.prototype.handleUpdate = function(event){
	this.powerManagerState = event.value;
}
PowerManagerAssistant.prototype.handleTap = function(){
	if (this.model.label == 'CANCEL') 
		this.activityEnd();
	else {
	
		if (this.powerManagerState) {
			this.model.label = 'CANCEL';
			this.controller.modelChanged(this.model);
			this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
				method: "activityStart",
				parameters: {
					id: "com.palmdts.services.enda-1",
					duration_ms: 80000
				},
				onSuccess: function(resp){
					Mojo.Log.info('************************' + JSON.stringify(resp))
					this.startCountDown();
				}.bind(this)				,
				onFailure: function(error){
					Mojo.Controller.errorDialog('Error : ' + JSON.stringify(error))
				}.bind(this)
			});
		}		
		this.controller.get('area2').update('Now press the power button to turn screen off')
		this.startCountDown();
	}
};
PowerManagerAssistant.prototype.startCountDown = function(event){
	this.t = this.controller.window.setTimeout(this.activityEnd.bind(this), 60000);
}
PowerManagerAssistant.prototype.activityEnd = function(event) {
	bannerParams = {
			soundFile: '/media/internal/ringtones/Triangle (short).mp3', 
			messageText: "Activity Ended"
		};
	this.appController.showBanner(bannerParams,{banner: 'palm'});
	//this.controller.stageController.setWindowProperties({"blockScreenTimeout":false});
	this.controller.window.clearTimeout(this.t);
	//this.model.label = 'Start';
	this.controller.get('countDown').update('Alarm sounded')
	this.controller.get('area2').update('');
	this.controller.modelChanged(this.model);
	if (this.count > 0) {
		this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
			method: "activityEnd",
			parameters: {
				id: "com.palmdts.services.enda-1"
			},
			onSuccess: function(resp){
				this.activitySet = false;
				this.controller.get('countDown').update('CANCELLED')
			}.bind(this),
			onFailure: function(error){
				Mojo.Controller.errorDialog('Error : ' + JSON.stringify(error))
			}.bind(this)
		});
	}
};
PowerManagerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

PowerManagerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

PowerManagerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  this.controller.stopListening(this.controller.get('startButton'), Mojo.Event.tap, this.hanleTap)
	  Mojo.Event.stopListening(this.controller.get('togglebuttonId'), Mojo.Event.propertyChange, this.handleUpdateBind)
	  this.activityEnd();
};

