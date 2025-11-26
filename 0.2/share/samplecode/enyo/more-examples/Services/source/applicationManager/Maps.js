enyo.kind({
   name: "applicationManager.Maps",
   kind: HeaderView,
   components: [
      {kind: "Group", caption: "Location", components: [
         {name: "locationInput", kind: "Input", value: "Palm, Sunnyvale, CA", alwaysLooksFocused: true, autoCapitalize: "lowercase"}
      ]},
      {name: "openMapButton", kind: "Button", caption: "Map It With URI", onclick: "openMap"},
      {name: "launchMapButton", kind: "Button", caption: "Map It With JSON", onclick: "launchMap"},
      {name: "appManager", kind: "PalmService", service: "palm://com.palm.applicationManager", onSuccess: "success", onFailure: "failure"}
   ],
   openMap: function() {
      this.$.appManager.call(
         {
            target: "mapto: " + this.$.locationInput.getValue()
         },
         {
            method: "open"
         }
      );
   },
   launchMap: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.maps",
            params: {
               query: this.$.locationInput.getValue()
            }
         },
         {
            method: "launch"
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
