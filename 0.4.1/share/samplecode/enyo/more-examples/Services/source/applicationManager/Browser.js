enyo.kind({
   name: "applicationManager.Browser",
   kind: HeaderView,
   components: [
      {kind: "Group", caption: "URL", components: [
         {name: "urlInput", kind: "Input", value: "www.palm.com", alwaysLooksFocused: true, autoCapitalize: "lowercase"}
      ]},
      {name: "openBrowserButton", kind: "Button", caption: "Open Browser", onclick: "openBrowser"},
      {name: "launchBrowserButton", kind: "Button", caption: "Launch Browser w/ URL", onclick: "launchBrowser"},
      {name: "appManager", kind: "PalmService", service: "palm://com.palm.applicationManager", onSuccess: "success", onFailure: "failure"}
   ],
   openBrowser: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.browser"
         },
         {
            method: "open"
         }
      );
   },
   launchBrowser: function() {
      console.log(this.$.urlInput.getValue());
      this.$.appManager.call(
         {
            id: "com.palm.app.browser",
            params: {
               target: this.$.urlInput.getValue()
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
