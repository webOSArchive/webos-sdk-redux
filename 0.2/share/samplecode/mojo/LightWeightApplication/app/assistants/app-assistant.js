/**
 * @author charles bybee
 */

function AppAssistant(controller) {
	this.appController = controller;
}

AppAssistant.prototype.setup = function() {
}

AppAssistant.prototype.handleLaunch = function() {
	// This function is required for a light-weight application to be
	// able to open a window of its own. It is not required if the app
	// is always launched from another application cross-app.
	this.openChildWindow(this.appController);
}

AppAssistant.prototype.openChildWindow = function() {
	this.stageController = this.appController.getStageController('lightWeight');
		
	if (this.stageController){
		// app window is open, give it focus
		this.stageController.activate();
	} else{
		// otherwise create the app window
		this.appController.createStageWithCallback({name: 'lightWeight', lightweight: true}, this.pushTheScene.bind(this));		
	}

}

AppAssistant.prototype.pushTheScene = function(stageController) {
	stageController.pushScene('first');
}


