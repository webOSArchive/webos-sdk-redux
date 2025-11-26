enyo.kind({
   name: "system.Calendar",
   kind: HeaderView,   
   components: [
      // Explanatory text
      {
         components: [
            {
               content: "This is the new api for adding a new calendar event to the calendar database!",
               nodeTag: "p"
            },
            {
               content: "Tapping on the button will pass a calender event object to the calendar app, opening the calendar app in a new event scene.",
               nodeTag: "p"
            },
            {
               content: "See documentation for calendar scheme", 
               nodeTag: "p"
            }
         ]
       },
       // Button to add calendar event
      {
         name: "addEventButton",
         kind: "Button",
         caption: "Add Event",
         onclick: "addEvent"
      },
      // App Manager Service
      {
         name: "appManager",
         kind: "PalmService",
         service: "palm://com.palm.applicationManager",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ], 
   // End Components
   
   addEvent: function(inSender) {
      this.$.appManager.call(
         {
            id: "com.palm.app.calendar",
            params: {
					newEvent: {
						subject: 'Take daily medicine',
						dtstart: '1290711600000', //a string that represents the start date/time as timestamp in milliseconds
						dtend: '1290718800000',  //a string that represents the end date/time as timestamp in milliseconds
						location: 'Where ever I am!',
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
						note: 'Take alergy medicine, 1 pill',
						allDay: false
					}
            }    
         },
         {
            method: "open"
         }
      );
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success:" + enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure:" + enyo.json.stringify(inResponse));
   }
});
