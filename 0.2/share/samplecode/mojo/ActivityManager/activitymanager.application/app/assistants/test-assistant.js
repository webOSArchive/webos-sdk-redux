function TestAssistant() {
}

/*
  Set up all our button handlers & any intitialization values.
*/
TestAssistant.prototype.setup = function() {
	this.helloTestHandlerCB = this.helloTestHandler.bind(this);
	this.controller.listen('hellotest',Mojo.Event.tap,this.helloTestHandlerCB);
	
	this.subscriptionTestHandlerCB = this.subscriptionTestHandler.bind(this);
	this.controller.listen('subscriptiontest',Mojo.Event.tap,this.subscriptionTestHandlerCB);
	
	this.scheduledTestHandlerCB = this.scheduledTestHandler.bind(this);
	this.controller.listen('scheduledtest',Mojo.Event.tap,this.scheduledTestHandlerCB);
	
	this.RequirementTestHandlerCB = this.RequirementTestHandler.bind(this);
	this.controller.listen('requirementtest',Mojo.Event.tap,this.RequirementTestHandlerCB);
	
	this.TriggerTestHandlerCB = this.TriggerTestHandler.bind(this);
	this.controller.listen('triggertest',Mojo.Event.tap,this.TriggerTestHandlerCB);
	
	this.TriggerButtonHandlerCB = this.TriggerButtonHandler.bind(this);
	this.controller.listen('triggerbutton',Mojo.Event.tap,this.TriggerButtonHandlerCB);
	
	//trigger is not set & hide the trigger button
	this.trigger = false;
	$('triggerbutton').hide();
	
	//currently not subscribed to our subscription service
	this.subscribed = false;
};

/*
  This is just a basic sanity check call to our service to make sure it's running properly.
*/
TestAssistant.prototype.helloTestHandler = function(event) {
	//call the 3rd party service using standard Palm serviceRequest
    this.controller.serviceRequest("palm://com.palmdts.activitymanager.sample.service", {
      method: "hello",
      parameters: {"name": "webOS developer"},
      onSuccess: this.handleOKResponse.bind(this),
	  onFailure: this.handleErrResponse.bind(this)
    });	
}

/*
  This will subscribe to our subscription service.  It's not an activity but it will let you see the value of our trigger related to the trigger activity example below.  Also allows toggling between subscribed & unsubscribed.
*/
TestAssistant.prototype.subscriptionTestHandler = function(event) {
	if (!this.subscribed){
		//call the 3rd party service using standard Palm serviceRequest
    	this.subscription = this.controller.serviceRequest("palm://com.palmdts.activitymanager.sample.service", {
      		method: "subscription",
      		parameters: {"subscribe":true},
      		onSuccess: this.handleOKResponse.bind(this),
	  		onFailure: this.handleErrResponse.bind(this)
    	});
		this.subscribed = true; //this should actually go in our success handler to be sure we are subscribed...
		$('subscriptiontest').update('Unsubscribe');
	} else {
		this.subscription.cancel();
		this.subscribed = false;
		$('subscriptiontest').update('Subscription Test');
	}
}

/*
  This will create an activity which schedule a call to our service app's launch method and based on the passed parameters will cause it to launch the messaging app.  The call is scheduled for 10 seconds in the future.  The commented out code sets up the call to happen on an interval of 5 minutes.
*/
TestAssistant.prototype.scheduledTestHandler = function(event) {
//this is to test launching at a particular scheduled time

	//get the current date & add 10 seconds
	var d = new Date((new Date()).getTime() + (10*1000));
	
	//build the local time
	var time = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' +
	d.getMinutes() + ':' + d.getSeconds(); 
	//or for UTC
	//d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate()
	//+" "+d.getUTCHours()+":"+d.getUTCMinutes()+":"+d.getUTCSeconds()+'Z'		 					

    this.controller.serviceRequest("palm://com.palm.activitymanager" , {
		method: "create",
		parameters: {
			"activity": {
				"name": "SCHEDULE_LAUNCH_ACTIVITY",
				"description":"Test activity that fires at scheduled time",
				"type": {
					"persist": true,
					"cancellable": true,
					"foreground" :true
				},
				"callback": {
					"method": "palm://com.palmdts.activitymanager.sample.service/launch",
					"params":{"id":"com.palm.app.messaging"}
				},
				"schedule" : {
					"start" : time,
					"local" : true
				}
			},
			subscribe: false,
			start:true,
			replace:true
		},
		onSuccess: this.handleOKResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});	

	//This demonstrates launching on an interval
/*
	this.controller.serviceRequest("palm://com.palm.activitymanager" , {
		method: "create",
		parameters: {
			"activity": {
				"name": "SCHEDULE_LAUNCH_ACTIVITY",
				"description":"Test activity that fires at scheduled time",
				"type": {
					"persist": true,
					"cancellable": true,
					"foreground" :true
				},
				"callback": {
					"method": "palm://com.palmdts.activitymanager.sample.service/launch",
					"params":{"id":"com.palm.app.messaging"}
				},
				"schedule" : {
					"interval" : "0d0h5m0s"
				}
			},
			subscribe: false,
			start:true,
			replace:true,
		},
		onSuccess: this.handleOKResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});	
*/

};	

/*
  This will create an activity which watches for an internet connect & if one exists then it will call our service app's launch method and based on the passed parameters will cause it to launch the email app.
*/
TestAssistant.prototype.RequirementTestHandler = function(event) {
    this.controller.serviceRequest("palm://com.palm.activitymanager" , {
		method: "create",
		parameters: {
			"activity": {
				"name": "REQUIREMENT_ACTIVITY",
				"description":"Test activity requiring internet connection",
				"type": {
					"persist": true,
					"cancellable": true,
					"foreground" :true
				},
				"callback": {
					"method": "palm://com.palmdts.activitymanager.sample.service/launch",
					"params":{"id":"com.palm.app.email"}
				},
			    "requirements" : {
			        "internet" : true
			    },
			},
			subscribe: false,
			start:true,
			replace:true
		},
		onSuccess: this.handleOKResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});
}


/*
  This creates an activity which will subscribe to our subscription service & watch for a reponse with our trigger value.  Once the trigger is seen it will call our service app's launch method and based on the passed parameters will cause it to launch the browser app.
*/
TestAssistant.prototype.TriggerTestHandler = function(event) {
    this.controller.serviceRequest("palm://com.palm.activitymanager" , {
		method: "create",
		parameters: {
			"activity": {
				"name": "TRIGGER_ACTIVITY",
				"description":"Test activity requiring internet connection",
				"type": {
					"persist": true,
					"cancellable": true,
					"foreground" :true
				},
				"callback": {
					"method": "palm://com.palmdts.activitymanager.sample.service/launch",
					"params":{"id":"com.palm.app.browser"}
				},   
				"trigger" : {
					/***bonus example*** - this could be used to trigger whenever a user updates the system time
					/*
					"method": "palm://com.palm.systemservice/time/getSystemTime",
					"params": {"subscribe":true}					
					*/					
					//this will trigger when "triggerKey" is seen as a property key in a response from our subscription service
			         "method" : "palm://com.palmdts.activitymanager.sample.service/subscription",
                     "key" : "triggerKey",
			         "params" : {"subscribe":true}
					
			    },
			},
			subscribe: false,
			start:true,
			replace:true
		},
		onSuccess: this.handleOKResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});
	$('triggertest').hide();
	$('triggerbutton').show();
	this.trigger = false;
}

/*
  This function handler will set a variable held by the service assistant & checked by the subscription service.  Once the variable is set to true our subscription service will respond with our trigger.
*/
TestAssistant.prototype.TriggerButtonHandler = function(event) {
	//if the trigger has just been set then set our trigger state variable to true, send a message to our service & then update the button
	if (this.trigger == false) {
    	this.controller.serviceRequest("palm://com.palmdts.activitymanager.sample.service", {
      		method: "trigger",
      		parameters: {setTrigger:'on'},
      		onSuccess: this.handleOKResponse.bind(this),
	  		onFailure: this.handleErrResponse.bind(this)
    	});	
		$('triggerbutton').update('Reset Trigger');
		this.trigger = true;
	}
	//if our trigger state is true then this means the 'reset button' has been pressed & so we reset the trigger & update the UI 
	else {
    	this.controller.serviceRequest("palm://com.palmdts.activitymanager.sample.service", {
      		method: "trigger",
      		parameters: {setTrigger:'off'},
      		onSuccess: this.handleOKResponse.bind(this),
	  		onFailure: this.handleErrResponse.bind(this)
    	});	
		$('triggertest').show();
		$('triggerbutton').update('Set the Trigger!');
		$('triggerbutton').hide();
		this.trigger = false;		
	}
}

TestAssistant.prototype.handleOKResponse = function(response){
	this.controller.get("area-to-update").innerText = JSON.stringify(response);																	 
}

TestAssistant.prototype.handleErrResponse = function(response){
	this.controller.get("area-to-update").innerText = JSON.stringify(response);																	 
}

TestAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('hellotest',Mojo.Event.tap,this.helloTestHandlerCB);
	this.controller.stopListening('subscriptiontest',Mojo.Event.tap,this.subscriptionTestHandlerCB);
	this.controller.stopListening('scheduledtest',Mojo.Event.tap,this.scheduledTestHandlerCB);
	this.controller.stopListening('requirementtest',Mojo.Event.tap,this.RequirementTestHandlerCB);
	this.controller.stopListening('triggertest',Mojo.Event.tap,this.TriggerTestHandlerCB);
	this.controller.stopListening('triggerbutton',Mojo.Event.tap,this.TriggerButtonHandlerCB);
};