function SubscriptionCommandAssistant() {
}

SubscriptionCommandAssistant.prototype = {
	run: function(future, subscription) {
		var assistant = this.controller.service.assistant;
	
		//this function checks the value of our services trigger member & returns the appropriate response
		var triggerStatus = function(f){	
    		//if the trigger has been set
			if (assistant.getTrigger()){
				f.result = {triggerKey: "The trigger is set!"};	
			} else {
				f.result = {notTheTriggerKey: "The trigger is not set"};
			}
		}
	
		//return a response based on the current value of our trigger memeber
		triggerStatus(future)
		
		//We respond every second with the state of our trigger
		//Note - using a small interval here so that our trigger appears responsive.
		this.interval = setInterval(function ping() {
			var f = subscription.get();
			triggerStatus(f);
		}, 1000);
	},
	cancelSubscription: function() {
		clearInterval(this.interval);
	}
};