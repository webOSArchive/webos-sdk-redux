function AlarmsAssistant() {
}

// Called by the controller when the scene is pushed
AlarmsAssistant.prototype.setup = function() {
	//set the key value for our alarm - note we're only allowing 1 alarm to be set at a time here
	this.key = "testKey"
	
	//set up the integer picker - note we're only using minutes in this example for simplicity
	var attributes = {
		label:	'Minutes',
		min: 0,
		max: 60,
		modelProperty:	'value'
	    };
	this.intPickerModel = {
		value : 5
	}
	this.controller.setupWidget('integer_field', attributes, this.intPickerModel);	
	
	//set up the radio button widget
	var alarmTypeAttributes = {
			choices: [
				{label : 'Monotonic', value : 'Monotonic'},
				{label : 'Calendar', value : 'Calendar'}
			]
		}	
	this.alarmTypeModel = {
		value : 'Monotonic',
		disabled:false
	}
	this.controller.setupWidget('radioButton', alarmTypeAttributes,this.alarmTypeModel );
	
	this.setTimeoutButtonHandler = this.scheduleTimeoutTask.bind(this)
	this.clearTimeoutButtonHandler = this.clearTimeoutTask.bind(this)
	//set up our button handlers		
	this.controller.listen('setTimeout', Mojo.Event.tap, this.setTimeoutButtonHandler);
	this.controller.listen('clearTimeout', Mojo.Event.tap, this.clearTimeoutButtonHandler);	
}

// This function schedules the timeout task
AlarmsAssistant.prototype.scheduleTimeoutTask = function(){
	//clear the service response information div
	$('response').update("");
	
	//parameters for the alarm service call	
	var params = {
		"wakeup": true,
		"key": this.key,
		"uri": "palm://com.palm.applicationManager/open",
		"params": '{"id":"com.palmdts.services","params":{"message": "Here is your alarm!"}}',
	}
	
	//check the value of the radio button for whether it's a monotonic or calendar alarm request
	if (this.alarmTypeModel.value == 'Monotonic'){
		var timeoutValue = this.intPickerModel.value;
		if (timeoutValue < 5){
			Mojo.Controller.errorDialog("Monotonic alarms must be set for at least 5 minutes in the future.");
			return;
		}
		//set the montonic alarm for the selected number of minutes in the future
		params["in"] = "00:" + timeoutValue + ":00"
	}
	else {
		//get the current date & then add the number of minutes they selected to the date
		var d = new Date((new Date()).getTime() + (this.intPickerModel.value * 60 * 1000))
		//make sure to use UTC time
		params["at"] = (d.getUTCMonth()+1)+'/'+d.getUTCDate()+'/'+d.getUTCFullYear()
						+" "+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()
	}

    //set the alarm
	this.controller.serviceRequest('palm://com.palm.power/timeout', { 
		method: "set",
		parameters: params,
		onSuccess:  this.handleOKResponse.bind(this),
		onFailure:  this.handleErrResponse.bind(this)
	});
}

// This function clears a pending alarm - note we only have one possible pending alarm in this example
AlarmsAssistant.prototype.clearTimeoutTask = function(){
	//clear the service response information div
	$('response').update("");
	
	//clear the alarm
	this.controller.serviceRequest('palm://com.palm.power/timeout', {
		method: "clear",
		parameters: {"key":this.key},
		onSuccess: this.handleOKResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});
}

// This function handles the success case
AlarmsAssistant.prototype.handleOKResponse = function(response){
	$('response').update("Success service response: <br><br>" + Object.toJSON(response));
}

// This function handles the failed case
AlarmsAssistant.prototype.handleErrResponse = function(response){
	$('response').update("Error service response: <br><br>" + Object.toJSON(response));	
}

// Cleanup anything we did in setup function
AlarmsAssistant.prototype.cleanup = function() {
	this.controller.stopListening('setTimeout', Mojo.Event.tap, this.setTimeoutButtonHandler);
	this.controller.stopListening('clearTimeout', Mojo.Event.tap, this.clearTimeoutButtonHandler);
}

// Called by the controller when this scene is about to be viewed	
AlarmsAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
AlarmsAssistant.prototype.deactivate = function() {
}