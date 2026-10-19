function AppAssistant(appController) {
}

//This function will handle relaunching the app when an alarm goes off(see the device/alarm scene)
AppAssistant.prototype.handleLaunch = function(params) {
	//if params doesn't exist then it means a user is launching the app rather than an alarm
	//causing it to launch and we should get out of here.
	if (!params || (params["message"] == undefined)){
		return;
	}

	//this is the name we'll give to our popupAlert stage
	var stageName = "alarm"		
	//add the stage name to the params
	params.stageName = stageName;

	//get the proxy for the stage in the event it already exists
	var alarmStage = this.controller.getStageProxy(stageName);
	
	//if the stage already exists then let it's current scene handle this relaunch (which
	//we aren't actually doing anything for in our alarmAlert scene's code)
	//otherwise create the new popupalert stage & push our alarmAlert scene + play a sound
	if (alarmStage) {
		alarmStage.delegateToSceneAssistant(stageName, params) 
	} else {
		var f = function(stageController) {
			stageController.pushScene({name: "alarmAlert",
					       		   	   sceneTemplate: "device/alarms/alarmAlert-scene"}, 
								       params);
		}
		this.controller.createStageWithCallback({
			name: 'alarm', 
			lightweight: true,
			name: stageName, 
			"height": 160, 
			sound: "/media/internal/ringtones/Rain Dance.mp3"
		}, f, 'popupalert');		
	}
		
};
