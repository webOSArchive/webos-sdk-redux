function StageAssistant(stageController) {
	var params = Mojo.getLaunchParameters();
	//get the appcontroller and assign the stagecontroller to it
	
	var appControl = Mojo.Controller.getAppController();
	var appAssistant = appControl.assistant;
	appAssistant.mainstageController = stageController;
	
	if (!Mojo.Controller.appInfo.noWindow && !Mojo.Controller.isChildWindow(stageController.window)) {
		var appController = stageController.getAppController();
	
		stageController.pushScene({name: 'list', id: 'list'});
		var sceneName = ListAssistant.getSavedSceneName();
	
		if (!params.launchToScene && sceneName) {
			ListAssistant.showScene(sceneName, stageController);
		}
		
		if(params && params.launchToScene){
			if(params && params.launchToScene){
				ListAssistant.showScene(params.launchToScene, stageController);
			}
		}
	}
}
