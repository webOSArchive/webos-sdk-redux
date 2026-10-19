enyo.kind({
   name: "system.SystemProperties",
   kind: HeaderView,      
   components: [
       // Get location button
      {
         name: "getUIDButton",
         kind: "Button",
         caption: "Get Device Unique ID",
         onclick: "getUID"
      },
      {
         components: [
            {
               content: "Unique ID:"
            },
            {
               name: "uidContainer",
               style: "word-wrap: break-word;"
            },
         ]
      },
      // App Manager Service (for mapping)
      {
         name: "propertiesService",
         kind: "PalmService",
         service: "palm://com.palm.preferences/systemProperties",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ], 
   // End Components
   
   getUID: function(inSender) {
      this.$.propertiesService.call(
         {
            key: "com.palm.properties.nduid"
         },
         {
            method: "Get"
         }
      );
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
      this.$.uidContainer.setContent(inResponse["com.palm.properties.nduid"]);
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
   },
});
