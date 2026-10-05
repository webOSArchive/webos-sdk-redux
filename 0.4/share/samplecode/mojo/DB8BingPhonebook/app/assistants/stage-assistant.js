function StageAssistant(stageController) {
	/* this is the creator function for your stage assistant object */
	this.stageController = stageController
}

StageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the stage is first created */
//	 this.stageController.pushScene('main')
};

function AppAssistant() {
	
}

AppAssistant.prototype.handleLaunch = function(params) {
	var phonebookStageController = Mojo.Controller.getAppController().getStageController('bingphonebookstage');
	
	var f = function(stageController) {
		if(params.newEntry)
			stageController.pushScene('new', params.newEntry);
		else if(params.phoneBookId)
			stageController.pushScene('detail', params.phoneBookId);
		else 
			stageController.pushScene('main', params.query);
	};
	if (phonebookStageController) {
		if (phonebookStageController.topScene() && phonebookStageController.topScene().sceneName == "main")
			f(phonebookStageController);
		else
			phonebookStageController.window.focus(); 
	} else {
		Mojo.Controller.getAppController().createStageWithCallback({name: 'bingphonebookstage'}, f);		
	}
};
