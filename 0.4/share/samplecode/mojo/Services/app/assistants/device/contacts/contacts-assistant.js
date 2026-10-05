 function ContactsAssistant() {
	
}	
	
ContactsAssistant.prototype.setup = function(){
	this.controller.setupWidget("buttonId",
         this.attributes = {
             },
         this.model = {
             label : "Add Contact",
             disabled: false
         }
     );
	 this.addContactButtonPressed = this.addContactButtonPressed.bind(this);
	 
}
ContactsAssistant.prototype.addContactButtonPressed = function(){	
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
		phoneNumbers: [{
				value: "4086177000",
				type: "type_work",
				primary : true
			},{
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
        	"name"        : "HP Palm, inc",
        	"department"  : 'DTS',
	        "title"       : 'Support Engineer',
        	"primary"     : true
        }
	}
 
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: 
			{
				id: "com.palm.app.contacts",
				params: 
				{
					contact: contact,
					launchType: "newContact"
				}
			}
	});	
}


ContactsAssistant.prototype.activate = function(event) {
	 Mojo.Event.listen(this.controller.get("buttonId"),Mojo.Event.tap, this.addContactButtonPressed);
}

ContactsAssistant.prototype.deactivate = function(event) {
	 Mojo.Event.stopListening(this.controller.get("buttonId"),Mojo.Event.tap, this.addContactButtonPressed);
}

ContactsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}