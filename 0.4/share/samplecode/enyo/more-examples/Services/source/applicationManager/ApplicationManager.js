enyo.kind({
   name: "applicationManager.ApplicationManager",
   kind: HeaderView,
   components: [
      {
         content: "Tap the button to launch the app catalog to the Pandora app."
      },      
      {
         name: "launchAppCatalogButton",
         kind: "Button",
         caption: "Launch", 
         onclick: "launchAppCatalog"
      },
      {
         name: "appCatalog",
         kind: "PalmService",
         service: "palm://com.palm.applicationManager",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ],
   launchAppCatalog: function() {
      this.$.appCatalog.call(
         {
               target: "http://developer.palm.com/appredirect/?packageid=com.palm.pandora",
            
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
