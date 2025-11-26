function AppAssistant(appController) {
	this.appController = appController;
}
/*
 * params 			- object containing launch parameters
 * 
 * params.touchstoneMode 	- boolean	True when dockmode is active
 */
AppAssistant.prototype.handleLaunch = function(params){
	if (params.dockMode|| params.touchstoneMode) { //launch the touchstone theme
		this.launchTouchstone();
	}else{
		this.normalLaunch()
	}
}

AppAssistant.prototype.launchTouchstone = function(sceneParams) {
	var dockStage = this.controller.getStageController('dock');
	if (dockStage) {
		dockStage.window.focus();
	} else {
		var f = function(stageController) {
			stageController.pushScene('exhibitionmode', {dockmode:true});
		}.bind(this);
		this.controller.createStageWithCallback({name: 'dock', lightweight: true}, f, "dockMode");	
	}
};
AppAssistant.prototype.normalLaunch = function(sceneParams) {
	var dockStage = this.controller.getStageController('notdock');
	if (dockStage) {
		dockStage.window.focus();
	} else {
		var f = function(stageController) {
			stageController.pushScene('first', {dockmode:false});
		}.bind(this);
		this.controller.createStageWithCallback({name: 'notdock', lightweight: true}, f);	
	}
};
