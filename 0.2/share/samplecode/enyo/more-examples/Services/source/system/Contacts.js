enyo.kind({
   name: "system.Contacts",
   kind: HeaderView,   
   components: [
      // Explanatory text
      {
         components: [
            {
               nodeTag: "p",
               content: "Tapping on the button will pass a contacts object to the contacts app, opening the contacts	app in the edit scene.",
            },
            {
               nodeTag: "p",
               content: "See documentation for the contacts scheme", 
            }
         ]
       },
       // Button to add new contact
      {
         name: "addContactButton",
         kind: "Button",
         caption: "Add Contact",
         onclick: "addContact"
      },
      // App Manager Service
      {
         name: "appManager",
         kind: "PalmService",
         service: "palm://com.palm.applicationManager",
         onSuccess: "onSuccess",
         onFailure: "onFailure"
      }
   ], 
   // End Components
   
   addContact: function(inSender) {
      // Define the contact to be added
      var contact = {
         name: {
            "familyName": "Palm",
            "givenName": "HP",
            "middleName": "E",
            "honorificPrefix": "Mr.",
            "honorificSuffix": "I"
         },        
         birthday: '1977-01-18',
         nickname: "webos",
         phoneNumbers: [
            {
               value: "4086177000",
               type: "type_work",
               primary : true
            },
            {
               value: "44086170100",
               type: "type_fax",
               primary : false
            }
         ],
         emails: {
            value: 'info@palm.com',
            type: "type_work",
            primary : true
         },
         addresses: {
            "streetAddress": '950 W Maude Ave',
            "locality": 'Sunnyvale',
            "region": "CA",
            "postalCode": '94085',
            "country": "USA"
         },
         organizations : {
            "name": "HP Palm, inc",
            "department": 'DTS',
            "title": 'Support Engineer',
            "primary": true
         }
      };
      
      // Call the service
      this.$.appManager.call(
         {
            id: "com.palm.app.contacts",
            params: {
               contact: contact,
               launchType: "newContact"
            }
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
