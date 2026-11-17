enyo.kind({
   name: "applicationManager.Phone",
   kind: HeaderView,
   components: [
      {kind: "Group", caption: "URL", components: [
         {name: "numberInput", kind: "Input", value: "14086177000", alwaysLooksFocused: true, autoCapitalize: "lowercase"}
      ]},
      {name: "openPhoneButton", kind: "Button", caption: "Open Phone App", onclick: "openPhone"},
      {name: "openPhoneWithNumberButton", kind: "Button", caption: "Open Phone w/ Number", onclick: "openPhoneWithNumber"},
      {name: "appManager", kind: "PalmService", service: "palm://com.palm.applicationManager", onSuccess: "success", onFailure: "failure"}
   ],
   openPhone: function() {
      this.$.appManager.call(
         {
            id: "com.palm.app.phone"
         },
         {
            method: "launch"
         }
      );
   },
   openPhoneWithNumber: function() {
      console.log(this.$.numberInput.getValue());
      this.$.appManager.call(
         {
            target: "tel://" + this.$.numberInput.getValue()
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
