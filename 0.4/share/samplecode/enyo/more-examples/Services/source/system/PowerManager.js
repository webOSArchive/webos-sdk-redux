enyo.kind({
   name: "system.PowerManager",
   kind: HeaderView, 
   powerManagerState: false,
   activityHasStarted: false,
   components: [
      {
         components: [
            {
               content: "To demo this sample do the following:<br />" +
                  "1. Leave the toggle button off and tap the start button<br />" +
                  "2. Turn toggle on to activate the powerManager and tap the start button<br /><br />" +
                  "After both instances press the power button to turn the screen off.<br /><br />" +
                  "Results:<br />" +
                  "1. Because the device goes to sleep after the screen got off the alarm doesn't ring<br />" +
                  "2. Even though the screen is off the device won't sleep until the alarm sounds."
            }
         ]
      },
      {
         kind: "ToggleButton",
         name: "toggleButton",
         onLabel: "On",
         offLabel: "Off",
         onChange: "toggleButtonToggle"
      },
      {
         name: "startButton",
         kind: "Button",
         caption: "Start",
         onclick: "start"
      },
      {
         name: "nextInstructionContainer"
      },
      {
         name: "powerManager",
         kind: "PalmService",
         service: "palm://com.palm.power/com/palm/power",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ], 
   // End Components
   
   toggleButtonToggle: function() {
      console.log("powerManagerState=" + this.$.toggleButton.getState());
      this.powerManagerState = this.$.toggleButton.getState();      
   },
   handleClick: function() {
      if (this.activityHasStarted) {
         this.activityEnd();
      } else {
         this.start();
      }
   },
   start: function() {
      this.$.startButton.setCaption("CANCEL");
      if (this.powerManagerState) {
         this.activityHasStarted = true;

         this.$.powerManager.call(
            {
               id: "com.palmdts.services.enda-1",
               duration_ms: 80000
            },
            {
               method: "activityStart",
               onSuccess: function() { this.startCountdown();}
            }
         );
      }
      this.$.nextInstructionContainer.setContent("Now press the power button to turn screen off");
      this.startCountdown();
   },
   activityEnd: function() {
      enyo.windows.addBannerMessage("Activity Ended", "{}", null, null, "/media/internal/ringtones/Triangle (short).mp3", null);
      window.clearTimeout(this.t);
      // Show a banner
      this.$.powerManager.call(
         {
            id: "com.palmdts.services.enda-1",
         },
         {
            method: "activityEnd"
         }
      );
      this.activityHasStarted = false;
      this.$.startButton.setContent("Start");
      this.$.nextInstructionContainer.setContent("");
      window.clearTimeout(this.t);
   },
   startCountdown: function() {
      this.t = window.setTimeout(enyo.bind(this, "activityEnd"), 10000);
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
      this.$.responseContainer.setContent("error: " + enyo.json.stringify(inResponse));
   }
});
