enyo.kind({
   name: "applicationManager.Photos",
   kind: HeaderView,
   components: [
      {name: "openPhotosButton", kind: "Button", caption: "Open Photos App", onclick: "openPhotosApp"},
      {name: "appManager", kind: "PalmService", service: "palm://com.palm.applicationManager/", onSuccess: "success", onFailure: "failure"}
   ],
   openPhotosApp: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.photos",
            params: {}
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
