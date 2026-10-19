function GpsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

GpsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.buttonModel = {
		buttonLabel : 'Go!!',
		buttonClass : 'affirmative',
		disable : false
	}
	this.buttonAtt = {
		type: 'activity'
	}
	this.controller.get('location_area-to-update').update("GPS Info:");
				
	this.controller.setupWidget('GetButton',this.buttonAtt,this.buttonModel)
    this.controller.listen($('map_it_button'),Mojo.Event.tap, this.handleMapButtonPressed.bind(this))
	this.controller.listen(this.controller.get('GetButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
}
GpsAssistant.prototype.handleButtonPressed = function(event) {
	    this.controller.serviceRequest('palm://com.palm.location', {
			method : 'getCurrentPosition',
	        parameters: {
				responseTime: 2,
	            subscribe: false
	                },
	        onSuccess: this.handleServiceResponse.bind(this),
	        onFailure: this.handleServiceResponseError.bind(this)
	    });
}
GpsAssistant.prototype.handleMapButtonPressed = function(event) {
	if (typeof latitude !== "undefined" && typeof longitude !== "undefined") {
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
		    method: 'launch',
		    parameters: {
		        id:"com.palm.app.maps",
		        //params:{"query":"ll="+latitude+","+longitude}
		        params:{"query":this.locationaddress}
		    }
		});
	} else {
		$('error_area-to-update').update("No location set. Click on the Go!! button");
	}
}
GpsAssistant.prototype.handleServiceResponse = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  latitude = event.latitude;
	  longitude = event.longitude;
	    this.controller.serviceRequest('palm://com.palm.location', {
			method : 'getReverseLocation',
	        parameters: {
				latitude: event.latitude,
	            longitude: event.longitude
	                },
	        onSuccess: this.handleServiceResponseReverse.bind(this),
	        onFailure: this.handleServiceResponseReverseError.bind(this)
	    });
	            $('location_area-to-update').update("Current Position: Latitude="+event.latitude + " Longitude="+event.longitude);
}
GpsAssistant.prototype.handleServiceResponseReverse = function(event) {
	/* If we got a location, get the address */
				this.getButton = this.controller.get('GetButton');
				this.getButton.mojo.deactivate();
				this.locationaddress=event.address;
	            $('address_area-to-update').update("Reverse Location (Address):"+event.address);
}
GpsAssistant.prototype.handleServiceResponseError = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
				this.getButton = this.controller.get('GetButton');
				this.getButton.mojo.deactivate();
	            $('error_area-to-update').update("Get Location Error:"+Object.toJSON(event));
}
GpsAssistant.prototype.handleServiceResponseReverseError = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
				this.getButton = this.controller.get('GetButton');
				this.getButton.mojo.deactivate();
	            $('error_area-to-update').update("Reverse Location Error:"+Object.toJSON(event));
}
GpsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


GpsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

GpsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    this.controller.stopListening($('map_it_button'),Mojo.Event.tap, this.handleMapButtonPressed.bind(this))
	this.controller.stopListening(this.controller.get('GetButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
}
