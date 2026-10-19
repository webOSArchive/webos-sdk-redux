var SetTriggerCommandAssistant = function(){
}
  
SetTriggerCommandAssistant.prototype.run = function(future) {  
	var assistant = this.controller.service.assistant;
	
	if (this.controller.args.setTrigger == "on"){
		assistant.setTrigger();
		future.result = { reply: "Trigger Set" };
	} else if (this.controller.args.setTrigger == "off") {
		assistant.resetTrigger();
		future.result = { reply: "Trigger Reset" };
	}
}