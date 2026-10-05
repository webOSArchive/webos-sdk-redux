enyo.kind({
   name: "applicationManager.Messaging",
   kind: HeaderView,
   components: [
      {
         name: "launchPrefilledButton",
         kind: "Button",
         caption: "Launch IM w/ Prefilled Data",
         onclick: "launchPrefilled"
      },
      {
         name: "launchAttachmentButton",
         kind: "Button",
         caption: "Launch IM w/ File",
         onclick: "launchAttachment"
      },
      {
         name: "appManager",
         kind: "PalmService",
         service: "palm://com.palm.applicationManager",
         onSuccess: "success",
         onFailure: "failure"
      }
   ],
   // End Components
   
   launchPrefilled: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.messaging",
            params: {
               composeRecipients: [
                  {
                     address: "joe",
                     serviceName: "yahoo"
                  },
                  {
                     address: "4085555555"
                  }
               ],
               messageText: "Text of the message."
            }
         },
         {
            method: "launch"
         }
      );
   },
   launchAttachment: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.messaging",
            params: {
               attachment: "icon.png"
            }
         },
         {
            method: "open"
         }
      );
   },
   success: function(inSender, inResponse) {
      console.log("success:" + enyo.json.stringify(inResponse));
   },
   failure: function(inSender, inResponse) {
      console.log("failure:" + enyo.json.stringify(inResponse));
   }
});
