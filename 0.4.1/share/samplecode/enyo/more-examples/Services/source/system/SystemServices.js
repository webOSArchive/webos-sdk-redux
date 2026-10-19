enyo.kind({
   name: "system.SystemServices",
   kind: HeaderView,      
   components: [
       // Get location button
      {
         name: "getTimeButton",
         kind: "Button",
         caption: "Get System Time",
         onclick: "getTime"
      },
      {
         components: [
            {
               content: "System Time:"
            },
            {
               name: "timeContainer",
               style: "word-wrap: break-word;"
            },
         ]
      },
      // App Manager Service (for mapping)
      {
         name: "systemService",
         kind: "PalmService",
         service: "palm://com.palm.systemservice/time/",
         onSuccess: "onSuccess",
         onFailure: "onFailure",
         method: "getSystemTime"
      }
   ], 
   // End Components
   
   getTime: function(inSender) {
      this.$.systemService.call();
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
      this.$.timeContainer.setContent(enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
      this.$.timeContainer.setContent("error: " + enyo.json.stringify(inResponse));
   },
});
