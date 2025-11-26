//Since Command Assistants are only around for the duration of processing a request, 
//we store more-persistent state in our Service Assistant object so it is available between requests.
function ActivityManagerService() {
}

ActivityManagerService.prototype = {
	// The setup() function is run when the service starts up
	// If the setup needs to do anything asynchronous, it should return a Future
	setup: function() {
		this._trigger = false;
	},
	
	setTrigger: function() {
		this._trigger = true;
	},
	
	getTrigger: function() {
		return this._trigger;
	},
	
	resetTrigger: function() {
		this._trigger = false;
	},
};
