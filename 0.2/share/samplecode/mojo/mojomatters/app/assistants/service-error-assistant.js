
/*
	This demonstrates what happens when you make a bad service call and what to do with it
*/

ServiceErrorAssistant = Class.create( FLibExample, {
	setup: function() {
		// Bind response handlers once
		this.contactsResult = this.contactsResult.bind(this);
		this.contactsFail = this.contactsFail.bind(this);
		
		// Store references for later
		this.resultTime = this.controller.get('time');
		this.statusDiv = this.controller.get('status');
		this.resultDiv = this.controller.get('result');
		
		Mojo.Log.info("setting up contacts service request.");
		var params = {offset: 0, limit: 10, subscribe: true};
		this.controller.serviceRequest('palm://com.palm.InvalidServiceID', {
			method: 'list',
			parameters: params,
			subscribe: true,
			onSuccess: this.contactsWin,
			onFailure: this.contactsFail
		}, true);
	},
	
	updateResult: function(statusText, resultText) {
		this.resultTime.innerText = Mojo.Format.formatDate(new Date(), 'short');
		this.statusDiv.innerText = statusText;
		this.resultDiv.innerText = resultText;
	},
	
	contactsResult: function(result) {
		this.updateResult('worked', Object.toJSON(result));
	},
	contactsFail: function(result) {
		Mojo.Log.info(result);
		Mojo.Controller.errorDialog('Service Produced an Error of type: '+result.errorCode );
	},
	
	
});