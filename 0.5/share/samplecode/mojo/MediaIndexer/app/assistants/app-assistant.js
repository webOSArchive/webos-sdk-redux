function AppAssistant(appController) {
	this.appController = appController;
}
 
AppAssistant.prototype.handleLaunch = function(params){
	if (params.dockMode|| params.touchstoneMode) { //launch the touchstone theme
		this.launchTouchstone();
	}else{
		this.normalLaunch()
	}
}

AppAssistant.prototype.launchTouchstone = function(sceneParams) {
	var dockStage = this.controller.getStageController('dock1');
	if (dockStage) {
		dockStage.window.focus();
	} else {
		var f = function(stageController) {
			stageController.pushScene('main', {dockmode:true});
		}.bind(this);
		this.controller.createStageWithCallback({name: 'dock1', lightweight: true}, f, "dockMode");	
	}
};
AppAssistant.prototype.normalLaunch = function(sceneParams) {
	var dockStage = this.controller.getStageController('dock1');
	if (dockStage) {
		dockStage.window.focus();
	} else {
		var f = function(stageController) {
			stageController.pushScene('main', {dockmode:false});
		}.bind(this);
		this.controller.createStageWithCallback({name: 'dock1', lightweight: true}, f);	
	}
};
