function CalendarAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

}

CalendarAssistant.prototype.setup = function(){
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.setupWidget("buttonId", this.attributes = {}, this.model = {
		label: "Add Event",
		disabled: false
	});
	this.addEvent = this.addEvent.bind(this);
}
CalendarAssistant.prototype.addEvent = function() {	 
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "open",
			parameters: 
			{
				id: "com.palm.app.calendar",
				params: 
				{
					newEvent: {
						subject: 'Take daily medicine',  //string
						dtstart: '1290711600000', //a string that represents the start date/time as timestamp in milliseconds ex: "1234567890000"
						dtend: '1290718800000',  //a string that represents the end date/time as timestamp in milliseconds ex: "1234567890000"
						location: 'Where ever I am!', //string
						rrule: {
							freq: "DAILY",
							count: 3
						},  //an rrule object.  see Calendar schema for details.  If rrule has an 'until' field, it must be a string like dtstart and dtend.
						tzId: "America/Los_Angeles", //a string that represents a standard olson timezone name
						alarm: [
							{
								alarmTrigger: {
									valueType: "DURATION",
									value: "-PT22M"
								}
							}
						], //an array of alarm objects. see Calendar schema for details
						note: 'Take alergy medicine, 1 pill',  //string
						allDay: false  //boolean
					}
				}
			}
		});
	
}

CalendarAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.listen(this.controller.get("buttonId"),Mojo.Event.tap, this.addEvent);

}
CalendarAssistant.prototype.deactivate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Event.stopListening(this.controller.get("buttonId"),Mojo.Event.tap, this.addEvent);

}

CalendarAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

