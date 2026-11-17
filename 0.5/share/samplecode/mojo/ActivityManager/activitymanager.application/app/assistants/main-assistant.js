function MainAssistant() {
}

MainAssistant.prototype.setup = function() {
	this.informationHandlerCB = this.informationHandler.bind(this)
	this.controller.listen('information',Mojo.Event.tap,this.informationHandlerCB)
	
	this.testHandlerCB = this.testHandler.bind(this)
	this.controller.listen('test',Mojo.Event.tap,this.testHandlerCB)
};

MainAssistant.prototype.informationHandler = function(event) {
	this.controller.stageController.pushScene('information')
};

MainAssistant.prototype.testHandler = function(event) {
	this.controller.stageController.pushScene('test')
};

MainAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('information',Mojo.Event.tap,this.assertionsHandlerCB)
	this.controller.stopListening('test',Mojo.Event.tap,this.testHandlerCB)
};
