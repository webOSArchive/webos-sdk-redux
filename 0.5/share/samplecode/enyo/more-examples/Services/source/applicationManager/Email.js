enyo.kind({
   name: "applicationManager.Email",
   kind: HeaderView,
   components: [
      {kind: "Group", caption: "URL", components: [
         {name: "addressInput", kind: "Input", value: "info@palm.com", alwaysLooksFocused: true, autoCapitalize: "lowercase"}
      ]},
      {name: "launchEmailButton", kind: "Button", caption: "Launch Email App", onclick: "launchEmail"},
      {name: "openEmailUriButton", kind: "Button", caption: "Launch Using URI", onclick: "openEmailUri"},
      {name: "openEmailJsonButton", kind: "Button", caption: "Launch Using JSON", onclick: "openEmailJson"},
      {name: "appManager", kind: "PalmService", service: "palm://com.palm.applicationManager"}
   ],
   launchEmail: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.email"
         },
         {
            method: "launch"
         }
      );
   },
   openEmailUri: function() {
      this.$.appManager.call(
         {
            target: "mailto:" + this.$.addressInput.getValue() +
               "?subject=This is the subject&body=This is the body"
         },
         {
            method: "open"
         }
      );
   },
   openEmailJson: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.email",
            params: {
               summary: "This is a summary.",
               text: "This is the body of the email.",
               recipients: [{
                  value: this.$.addressInput.getValue(),
                  contactDisplay: "Display name"
               }]
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
