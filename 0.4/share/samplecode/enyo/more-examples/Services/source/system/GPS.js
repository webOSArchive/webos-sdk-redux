enyo.kind({
   name: "system.GPS",
   kind: HeaderView,   
   
   // Street address for the current latitude and longitude
   locationAddress: "",
   
   components: [
       // Get location button
      {
         name: "locateButton",
         kind: "Button",
         caption: "Get Location",
         onclick: "locate"
      },
      {
         components: [
            {
               content: "GPS Info:"
            },
            {
               name: "locationContainer",
               style: "word-wrap: break-word;"
            },
            {
               name: "reverseLocationContainer",
               style: "word-wrap: break-word;"
            }
         ]
      },
       // Map button
      {
         name: "mapButton",
         kind: "Button",
         caption: "Map It",
         onclick: "map"
      },
      // GPS Service
      {
         name: "gps",
         kind: "PalmService",
         service: "palm://com.palm.location"
      },
      // App Manager Service (for mapping)
      {
         name: "appManager",
         kind: "PalmService",
         service: "palm://com.palm.appManager",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ], 
   // End Components
   
   locate: function(inSender) {
      this.$.gps.call(
         {
            responseTime: 2,
            subscribe: false
         },
         {
            method: "getCurrentPosition",
            onSuccess: "onLocateSuccess",
            onFailure: "onLocateFailure"
         }
      );
   },
   onLocateSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
      
      latitude = inResponse.latitude;
      longitude = inResponse.longitude;
      
      this.$.gps.call(
         {
            latitude: latitude,
            longitude: longitude
         },
         {
            method: "getReverseLocation",
            onSuccess: "onReverseSuccess",
            onFailure: "onReverseFailure"
         }
      );
      
      this.$.locationContainer.setContent("Current Position: latitude=" + latitude + ", longitude=" + longitude);
   },
   onLocateFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
      this.$.locationContainer.setContent("Get Location Error: " + enyo.json.stringify(inResponse));
   },
   onReverseSuccess: function(inSender, inResponse) {
      this.locationAddress = inResponse.address;
      this.$.reverseLocationContainer.setContent("Reverse Location (Address): " + this.locationAddress);
   },
   onReverseFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
      this.$.locationContainer.setContent("Reverse Location Error: " + enyo.json.stringify(inResponse));
   },
   map: function(inSender) {
      if (this.locationAddress) {
         this.$.appManager.call(
            {
               id: "com.palm.app.maps",
               params: {
                  query: this.locationAddress
               }
            },
            {
               method: "launch"
            }
         );
      } else {
         this.$.locationContainer.setContent("No location set. Try clicking the Get Location button.");
      }
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
   },
});
