function PopupAlertAssistant() {
 }
    
PopupAlertAssistant.prototype.setup = function() {
	this.showPopUp = this.showPopUp.bind(this);
    Mojo.Event.listen(this.controller.get('show-popup'),Mojo.Event.tap, this.showPopUp)
}
    
PopupAlertAssistant.prototype.showPopUp = function(){
		    var appController = Mojo.Controller.getAppController();
		    var stageName = "popupAlertStage";
		    
		    var f = function(stageController){
				//We can't use our showScene function from our app's stage assistant here since this
				//stageController is actually a new stage controller specifically for our popup alert.
		        stageController.pushScene({name: "popupWindow",
					       		   		   sceneTemplate: "notifications/popupAlert/popupWindow-scene"},
										   {
										 	  message: "I'm a popup alert.",
											  stage: stageName
										   });
		    };
		    appController.createStageWithCallback({
		        name: stageName,
		        height: 305,
				lightweight: true
		    }, f, 'popupalert');
}



/* This is an assistant for the actual popup alert
 * Note we're using this.controller.get here rather than Prototype's $ - a consequence of using
 * lightweight stages.
 */ 
function PopupWindowAssistant(argFromPusher) {
	  this.passedArgument = argFromPusher
 }
    

PopupWindowAssistant.prototype.setup = function() {
	//update the scene with the passed in message
	this.controller.get('info').innerText = (this.passedArgument.message)
	
    //set up button widget
	this.controller.setupWidget('quit-button', {}, {buttonLabel:'Close'})
	//set up button handler
    Mojo.Event.listen(this.controller.get('quit-button'),Mojo.Event.tap, this.handleQuitButton.bind(this))
}
    
PopupWindowAssistant.prototype.handleQuitButton = function(){
    Mojo.Controller.appController.closeStage(this.passedArgument.stage);
}