/**
 * @author charles bybee
 */
function CrossAppAssistant() {
}
	
CrossAppAssistant.prototype.setup = function () {
	//set up button handlers
	this.controller.get('scene_loading').hide();
	this.handleCrossAppButtonBinder = this.handleCrossAppButton.bind(this)
	this.controller.listen(this.controller.get('cross_app_button'), Mojo.Event.tap, this.handleCrossAppButtonBinder);
};
    
CrossAppAssistant.prototype.handleCrossAppButton = function () {
	// Launch another application. (Must be a light-weight stage application
	//  because the app must not have its own window/document.)
	// Note that this takes some time since a new app is loading instead of
	//  just a scene being pushed.
	this.controller.get('scene_loading').show();
    this.controller.stageController.pushScene(
    { appId : 'com.palmdts.lightweightapplication', name: 'first' },
    { sublaunch : true}
	);      
};
    

CrossAppAssistant.prototype.activate = function (event) {
	/*  */
	if (event !== undefined) {
		if(event.launchFailed) {
			this.showDialogBox("Basic Application Not Loaded", "Apparently you have not loaded the Basic Application Light sample application.").bind(this);
		} else {
			this.showDialogBox("Returned", "Returned from Basic Application Light" + Object.toJSON(event)).bind(this);
		}
	}
};


CrossAppAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.get('scene_loading').hide();
};

CrossAppAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening(this.controller.get('cross_app_button'), Mojo.Event.tap, this.handleCrossAppButtonBinder);
};

// This function will popup a dialog, displaying the message passed in.
CrossAppAssistant.prototype.showDialogBox = function (title, message) {
	this.controller.showAlertDialog({
		onChoose: function (value) {},
		title: title,
		message: message,
		choices: [ {label: 'OK', value: 'OK', type: 'color'} ]
	});
};
