enyo.kind({
   name: "system.ConnectionManager",
   kind: HeaderView,   
   components: [
      // Button to get connection status
      {
         name: "getStatusButton",
         kind: "Button",
         caption: "Get Status",
         onclick: "getStatus"
      },
      // Status display div
      {
         name: "statusContainer",
         style: "display: none;",
         components: [
            {
               content: "Now change WiFi or other data connection status and watch this space:"
            },
            {
               name: "connectionStatus",
               style: "margin-top: 10px; word-wrap: break-word"
            }
         ]
      },
      // Connection Manager Service
      {
         name: "connectionManager",
         kind: "PalmService",
         service: "palm://com.palm.connectionmanager",
         onSuccess: "onSuccess",
         onFailure: "onFailure",
         onResponse: "onResponse",
         method: "getStatus",
         subscribe: true
      }
   ],
   // End Components
   
   getStatus: function(inSender) {
      this.$.connectionManager.call();
   },
   onResponse: function(inSender, inResponse) {
      console.log("response:" + enyo.json.stringify(inResponse));
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success:" + enyo.json.stringify(inResponse));
      this.$.connectionStatus.setContent(enyo.json.stringify(inResponse));
      this.$.statusContainer.setStyle("display: block");
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure:" + enyo.json.stringify(inResponse));
   }
});
