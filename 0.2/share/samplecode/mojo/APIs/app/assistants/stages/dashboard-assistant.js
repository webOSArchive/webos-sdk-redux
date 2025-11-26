function DashboardAssistant() {
 }
    
DashboardAssistant.prototype.setup = function() {
    Mojo.Event.listen(this.controller.get('create-dashboard'),Mojo.Event.tap, this.showDashboard.bind(this))
}
    
DashboardAssistant.prototype.showDashboard = function(){
		    var appController = Mojo.Controller.getAppController();
		    var stageName = "dashboardStage";
		    
		    var f = function(stageController){
				//We can't use our showScene function from our app's stage assistant here since this
				//stageController is actually a new stage controller specifically for our dashboard.
		        stageController.pushScene({name: "dashboardStage",
					       		   		   sceneTemplate: "stages/dashboard/dashboardStage-scene"},
										   {
										 	  message: "I'm a dashboard stage.",
											  stage: stageName
										   });
		    };
		    appController.createStageWithCallback({
				name: stageName,
			 	lightweight: true
			}, f, 'dashboard');
}



/* This is an assistant for the actual dashboard
 * Note we're using this.controller.get here rather than Prototype's $ - a consequence of using
 * lightweight stages.
 */ 
function DashboardStageAssistant(argFromPusher) {
	  this.passedArgument = argFromPusher
}
    
/*
 * This will update the dashboard stage with a message & request the throbber 
 * (ie the device center button/area) to notify the user of more content.  To
 * actually see the throbber light up press the device suspend button to turn the
 * screen off.
 */
DashboardStageAssistant.prototype.setup = function() {
	this.controller.get('info').innerText = (this.passedArgument.message)
	setTimeout(this.flashCoreNaviButton.bind(this), 5000);
}

DashboardStageAssistant.prototype.flashCoreNaviButton = function() {
	//Check if the throbber has already been flashed, indicating there is new content available
	if (!this.controller.stageController.hasNewContent()){
		/* If there is no new content already awaiting the user then flash the throbber - otherwise
		 * it's probably already flashing.
		 * NOTE: This is not necessarily a realistic use case, just an example of how to use the API
		 */
		this.controller.stageController.indicateNewContent(true);	
	}
}