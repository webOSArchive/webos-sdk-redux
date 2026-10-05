function CardAssistant() {
 }
    
CardAssistant.prototype.setup = function() {
    Mojo.Event.listen(this.controller.get('create-card'),Mojo.Event.tap, this.showCard.bind(this))
}
    
CardAssistant.prototype.showCard = function(){
		    var appController = Mojo.Controller.getAppController();
		    var stageName = "cardStage";
		    var f = function(stageController){
				//We can't use our showScene function from our app's stage assistant here since this
				//stageController is actually a new stage controller specifically for our card stage.
		        stageController.pushScene({name: "cardStage",
					       		   		   sceneTemplate: "stages/card/cardStage-scene"},
										   {
										 	  message: "I'm a card stage.",
											  stage: stageName
										   });
		    };
		    appController.createStageWithCallback({
				name: stageName,
				lightweight: true
			}, f, 'card');
}

/* This is an assistant for the actual card stage
 * Note we're using this.controller.get here rather than Prototype's $ - a consequence of using
 * lightweight stages.
 */ 
function CardStageAssistant(argFromPusher) {
	  this.passedArgument = argFromPusher
 }    

CardStageAssistant.prototype.setup = function() {
	this.controller.get('info').innerText = (this.passedArgument.message)
	//set up button handlers
	this.handleQuitButton = this.handleQuitButton.bind(this)
	Mojo.Event.listen(this.controller.get('quit-button'),Mojo.Event.tap, this.handleQuitButton)
}
CardStageAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.controller.get('quit-button'),Mojo.Event.tap, this.handleQuitButton)
}    
CardStageAssistant.prototype.handleQuitButton = function(){
    Mojo.Controller.appController.closeStage(this.passedArgument.stage);
}