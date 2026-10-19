enyo.kind({
   name: "system.Alarms",
   kind: HeaderView,
   
   //Default alarm values
   alarmType: "monotonic",
   testKey: "testKey",
   
   components: [
      {
         content: "Alarm type:"
      },
      // Alarm Type Selector
      {
         name: "alarmTypeGroup",
         kind: "RadioGroup",
         onclick: "setAlarmType",
         value: "monotonic",
         components: [
            {caption: "Monotonic", value: "monotonic"},
            {caption: "Calendar", value: "calendar"}
         ]
      },
      {
         content: "Minutes until alarm activates:"
      },
      // Minutes until activation picker
      {
         name: "alarmActivationTimePicker",
         kind: "IntegerPicker",
         label: "Minutes",
         value: 5,
         min: 0,
         max: 60,
         onChange: "activationTimeChange"
      },
      // Set Timeout Button
      {
         name: "setTimeoutButton",
         kind: "Button",
         caption: "Set Timeout",
         onclick: "setTimeout"
      },
      // Clear Timeout Button
      {
         name: "clearTimeoutButton",
         kind: "Button",
         caption: "Clear Timeout",
         onclick: "clearTimeout"
      },
      // Error Dialog
      {
         name: "dialog",
         kind: "Dialog",
         components: [
            {
               content: "Error",
               style: "font-weight: bold; padding-left: 10px;"
            },
            {
               nodeTag: "hr"
            },
            {
               content: "Monotonic alarms must be set for at least 5 minutes in the future.",
               style: "padding: 10px;"
            },
            {
               name: "closeDialogButton",
               kind: "Button", 
               caption: "OK", 
               onclick: "closeDialog"
            }
         ]
      },
      // Alarm Service
      {
         name: "alarmService",
         kind: "PalmService",
         service: "palm://com.palm.power/timeout",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ],
   // End Components
   
   setAlarmType: function(inSender, e) {
      this.alarmType = inSender.getValue();
   },
   //Set the alarm timeout. Monotonic and Calendar alarms are set differently.
   setTimeout: function(inSender) {
      timeout = this.$.alarmActivationTimePicker.getValue();
      if (this.alarmType == "monotonic") {
         //Monotonic alarms must have a timeout of at least 5 minutes.
         //If the current timeout is less than that show an error dialog and do not set a timeout.
         if (timeout >= 5) {
            this.setMonotonicTimeout(timeout);
         }
         else {
            this.$.dialog.open();
         }
      }
      else {
         this.setCalendarTimeout(timeout);
      }
   },
   setMonotonicTimeout: function(timeout) {
      this.$.alarmService.call(
         {
            wakeup: true, //wakeup the device if its sleeping
            key: this.testKey,
            uri: "palm://com.palm.applicationManager/launch",
            //The in parameter takes the format HH:MM:SS. We're 
            //only dealing with minutes in this example for simplicity.
            //The word 'in' is a reserved keyword in javascript, so it must be quoted.
            'in': "00:" + timeout + ":00", 
            params: {
               id: "com.palmdts.services",
               params: {
                  isAlarm: true
               }
            }
         },
         {
            method: "set"
         }
      );
   },
   setCalendarTimeout: function(timeout) {
      //get the current date & then add the number of minutes they selected to the date
		var d = new Date((new Date()).getTime() + (timeout * 60 * 1000))
		//make sure to use UTC time
		at = (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + '/' + d.getUTCFullYear()
						+ " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();
                  
      console.log(at);
      this.$.alarmService.call(
         {
            wakeup: true,
            key: this.testKey,
            uri: "palm://com.palm.applicationManager/launch",
            at: at,
            params: {
               id: "com.palmdts.services",
               params: {
                  isAlarm: true
               }
            }
         },
         {
            method: "set"
         }
      );
   },
   clearTimeout: function() {
      this.$.alarmService.call(
         {
            key: this.testKey
         },
         {
            method: "clear"
         }
      );
   },
   closeDialog: function() {
      this.$.dialog.close();
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success:" + enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure:" + enyo.json.stringify(inResponse));
   }
});
