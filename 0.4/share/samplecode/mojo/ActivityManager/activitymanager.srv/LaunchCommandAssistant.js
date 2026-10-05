var _ = IMPORTS.underscore._;
var Foundations = IMPORTS.foundations;
var PalmCall = Foundations.Comms.PalmCall;


var LaunchCommandAssistant = function(){
}
  
LaunchCommandAssistant.prototype.run = function(future) {  
		PalmCall.call("palm://com.palm.applicationManager", "open",
		{
			id: this.controller.args.id
		});
		
}