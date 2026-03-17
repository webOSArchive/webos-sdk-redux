function StageAssistant () {
}

StageAssistant.prototype.setup = function() {
	this.controller.pushScene('main')
}

/*
 * This function will push a passed in scene.  The reason we are using a special function here is that
 * for file organization purposes we have put scene files in sub directories & to load them from these
 * locations requires that we use the name and sceneTemplate properties when pushing the scenes.
 */ 
StageAssistant.prototype.showScene = function(directory, sceneName, arguments) {
	if (arguments === undefined){
		this.controller.pushScene({name: sceneName,
					       		   sceneTemplate: directory + "/" + sceneName + "-scene"})		
	}
	else{
		this.controller.pushScene({name: sceneName,
					       		   sceneTemplate: directory + "/" + sceneName + "-scene"},
								   arguments)				
	}
}


/* This function is used as part of the notificationChain scene demonstration - see notifications/notificationChain-assistant.js
 *
 * If sendNotification is called while this stage isn't in the foreground(ie another app is in the foreground
 * or this app is minimized) then this function won't be called and the notification chain will attempt to call 
 * the app assistant's considerForNotification function next.
 */
StageAssistant.prototype.considerForNotification = function(notificationData){
	 /* If we get notificationData then show a popup alert with the notificationData information.
	  * To find get more information about popup alerts (including the implementation for the scene used
	  * in this popup alert see notifications/popupAlert-assistant.js
	  */
     if (notificationData) {	 
	 	var appController = Mojo.Controller.getAppController();
	 	var stageName = "popupAlertStage";
	 	var theMessage = "The stage assistant caught the notification.  The notification is: " + notificationData.message;
	 	
	 	var f = function(stageController){
	 		    /* We can't use our showScene function here since this stageController is 
	 		     * actually a new stage controller specifically for our popup alert.
	 		     */
				stageController.pushScene({
					name: "popupWindow",
					sceneTemplate: "notifications/popupAlert/popupWindow-scene"
				}, {
					message: theMessage,
					stage: stageName
				});
			};
			appController.createStageWithCallback({
				name: stageName,
				height: 305,
				lightweight: true
			}, f, 'popupalert');
	}
    
	/* We're not returning any notification data here which will stop the notification chain here.  To allow
	 * the notification chain to continue, uncomment the below return statement and the app assistant will
	 * then have it's considerForNotification function called. 
	 */	
    //return notificationData;
};