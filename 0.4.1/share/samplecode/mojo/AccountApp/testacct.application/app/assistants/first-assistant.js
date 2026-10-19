function FirstAssistant(){
};

FirstAssistant.prototype.setup = function(){
    //contact button setup
    this.controller.setupWidget("setupContactKind", {}, {
        label: "Setup Account",
        disabled: false
    });
	
    
    this.controller.setupWidget("writeContactData", {}, {
        label: "Write Contact",
        disabled: false
    });
	
    
    this.controller.setupWidget("readContactData", {}, {
        label: "Read Contact",
        disabled: false
    });
	
    
    //calendar button setup
    this.controller.setupWidget("createCalendar", {}, {
        label: "Create Calendar",
        disabled: false
    });
	
    
    this.controller.setupWidget("writeCalendarData", {}, {
        label: "Add event",
        disabled: false
    });
	
    
    this.controller.setupWidget("readCalendarData", {}, {
        label: "Read Calendar",
        disabled: false
    });
	
	this.createContactAccount 	= this.createContactAccount.bind(this);
  	this.writeContactData	 	= this.writeContactData.bind(this);
	this.readContactData	 	= this.readContactData.bind(this);
	this.createCalendar 		= this.createCalendar.bind(this);
	this.addEvent 				= this.addEvent.bind(this);
	this.readCalendar		 	= this.readCalendar.bind(this);
	
	
    
    //account globals
    this.serviceId = "palm://com.palm.db/";
    this.accountId = "";
    
    this.findAccountId(); //run db8 query on the account
    //CONTACT globals
    this.contacts = {};
    
    //CALENDAR globals
    this.calendar = {};
    
}; //end setup
//get the accountId - if the returned JSON is blank then we know to create the account.
FirstAssistant.prototype.findAccountId = function(){
    var query = {
        "from": "com.palmdts.synergy.account:1"
    };
    
    DB.find(query, false, false).then(this, function(future){
        var result = future.result;
        if (result.returnValue == true) {
            if (future.result.results.length > 0) {
                logData(this.controller, "Got accountId: " + future.result.results[0]._id);
                this.accountId = future.result.results[0]._id;
                future.result = future.result.results[0]._id; //TODO: find why this is not returning as expected
            }
            else {
                this.accountId = "";
                future.result = "";
            }
            
        }
        else {
            result = future.exception;
            logData(this.controller, "Cound not find accountId: Err code = " + result.errorCode + "Err message=" + result.message);
        }
    });
};


//store the returned accountId in DB8 so it persists.  It's a really bad idea to lose this key.  
//If lost, the user may have to manually delete the account(and with it all contacts) before re-installing the application.
//DO NOT use a cookie for this as those can expire / be flushed.
FirstAssistant.prototype.saveAcctId = function(acctId){
    logData(this.controller, "saving com.palmdts.synergy.account -> value:" + acctId);
    
    acctIdObj = [{
        "_kind": "com.palmdts.synergy.account:1",
        "accountId": acctId
    }];
    
    DB.put(acctIdObj).then(this, function(future){
        var result = future.result;
        if (result.returnValue == true) {
            logData(this.controller, "------>AcctId put success");
        }
        else {
            result = future.exception;
            Mojo.Log.info("put AcctId failure: Err code=" + result.errorCode + "Err message=" + result.message);
        }
    });
};


//create account
FirstAssistant.prototype.createContactAccount = function(){
    
    this.controller.serviceRequest("palm://com.palm.service.accounts/", {
        method: "createAccount",
        parameters: {
            "templateId": "com.palmdts.synergy.account",
            "username": "enda@palm.com",
            "alias": "Palm DTS Sample Acct",
            "icon": {
                "loc_32x32": "images/palmdts-32x32.png",
                "loc_48x48": "images/palmdts-48x48.png"
            },
            "readPermissions": ["com.palmdts.synergy"],
            "writePermissions": ["com.palmdts.synergy"],
            "capabilityProviders": [{
                "capability": "CONTACTS",
                "id": "com.palmdts.synergy.contact",
                "loc_name": "Palm DTS Contacts",
                "dbkinds": {
                    "contact": "com.palmdts.synergy.contact:1"
                }
            }, {
                "capability": "CALENDAR",
                "id": "com.palmdts.synergy.calendar",
                "loc_name": "Palm DTS Calendar",
                "dbkinds": {
                    "calendar": "com.palmdts.synergy.calendar:1",
                    "calendarevent": "com.palmdts.synergy.calendarevent:1"
                }
            }]
        },
        
        
        onSuccess: function(e){
            //Developer TODO: you must store the result into permament storage on the device (or in your cloud implementation)
            //this is required(!) when R/W to the contact or calendar database!!!
            //this example only keeps for this instance so you'll have to revert your emu image or re-install SDK each test
            this.accountId = e.result._id;
            logData(this.controller, "Success!\n\n\n" + JSON.stringify(e.result._id) + "\n\nNow saving AccountId in DB8\n");//get the id 
            this.saveAcctId(this.accountId);
            
        }.bind(this),
        onFailure: function(e){
            logData(this.controller, "Failure: errorCode = " + e.errorCode + ", errorText = " + e.errorText);
        }.bind(this)
    });
}; //end create account
//write a sample contact
FirstAssistant.prototype.writeContactData = function(e){
    logData(this.controller, "write contact tapped, using:" + this.accountId);
    //typically accountId will look "like" a base64 encoded string like: ++HKCF2IaOFwaD
    // 
    this.samplecontact = {
        "accountId": this.accountId,
        "displayName": "Mike Jones",
        "_kind": "com.palmdts.synergy.contact:1",
        "emails": [{
            "value": "mike.jones@hp.com",
            "type": "work"
        }],
        "phoneNumbers": [{
            "value": "408.555.1415",
            "type": "work"
        }],
        "name": {
            "formatted": "Mike Jones",
            "familyName": "Jones",
            "givenName": "Mike"
        },
        "addresses": [{
            "type": "work",
            "formatted": "555 Pruneridge\nCupertino, CA 94082\nUSA",
            "streetAddress": "555 Pruneridge",
            "locality": "Cupertino",
            "region": "CA",
            "postalCode": "94082",
            "country": "USA"
        }, {
            "type": "home",
            "formatted": "555 Main Street\nSan Jose, CA 95134\nUSA",
            "streetAddress": "555 Main Street",
            "locality": "San Jose",
            "region": "CA",
            "postalCode": "95134",
            "country": "USA"
        }],
        "organizations": [{
            "name": "Hewlett Packard Corporation",
            "title": "webOS master"
        }]
    };
    
    this.contactTestObject = [this.samplecontact];//array can be passed
    //write contacttestobject
    DB.put(this.contactTestObject).then(function(future){
        var result = future.result;
        if (result.returnValue == true) {
            logData(this.controller, "------>put success" + JSON.stringify(future.result));
        }
        else {
            result = future.exception;
            Mojo.Log.info("put failure: Err code=" + result.errorCode + "Err message=" + result.message);
        }
    }.bind(this));
};
FirstAssistant.prototype.readContactData = function(e){
    logData(this.controller, "read contact tapped");
    
    var fquery = {
        "from": "com.palmdts.synergy.contact:1",
        "limit": 500
    };
    
    DB.find(fquery, false, false).then(this, function(future){
        var result = future.result;
        if (result.returnValue == true) {
            logData(this.controller, "find success, results=" + JSON.stringify(result.results));
            future.result = result;
        }
        else {
            result = future.exception;
            logData(this.controller, "find failure: Err code=" + result.errorCode + "Err message=" + result.message);
        }
    }.bind(this));
};
//Calendar

FirstAssistant.prototype.createCalendar = function(e){

    var myCal = [{
        _kind: "com.palmdts.synergy.calendar:1",
        "UID": 'DTS_ID',
        "accountId": this.accountId,
        "name": 'DTS Sample Calendar',
        "isReadOnly": false,
        "syncSource": 'Hard Coded by Enda',
        "excludeFromAll": false,
        "color": 'pink'
    }];
     console.log("#------&&-----# " + JSON.stringify(myCal));
    DB.put(myCal).then(function(f){
        if (f.result.returnValue === true) {
            console.log("#------&&-----# Calendar created ");
            logData(this.controller, "------>put success" + JSON.stringify(f.result));
        }
        else {
            future.result = f.result;
        }
    }.bind(this));
};

FirstAssistant.prototype.addEvent = function(event){
    var q = {
        "from": "com.palmdts.synergy.calendar:1"
    };
    DB.find(q).then(function(f){
        if (f.result.returnValue === true) {
            console.log("#------&&-----# AFTER ");
            var calendarId = f.result.results[0]._id;
            var accountId = f.result.results[0].accountId;
            
            //For our new calendar event we are going to set it for the day this code
            //runs from 3 to 4 pm
            var timeStamp = new Date()
            var eventStart = new Date()
            eventStart.setHours(15, 0, 0, 0);
            var eventEnd = eventStart.getTime() + 3600000
            
            var calendarObj = [{
                _kind: "com.palmdts.synergy.calendarevent:1",
                "accountId": accountId,
                "alarm": [{
                    "_id": "cac",
                    "action": "display",
                    "alarmTrigger": {
                        "value": "-PT15M",
                        "valueType": "DURATION"
                    }
                }],
                "allDay": false,
                "calendarId": calendarId,
                "dtend": eventEnd,
                "dtstart": eventStart.getTime(),
                "etag": "",
                "eventDisplayRevset": 3243,
                "location": "",
                "note": "Adding a time stamp so we know when it was created : " + timeStamp.toDateString() + " : " + timeStamp.toTimeString(),
                "remoteId": "",
                "rrule": null,
                "subject": "Dinner with the wife ",
                "tzId": "America/Los_Angeles"
            }];
			console.log("#------&&-----# " + JSON.stringify(calendarObj));
            //..Write new or updated contacts
            DB.put(calendarObj).then(function(f5){
                if (f5.result.returnValue === true) {
                    console.log("CALENDAR EVENT ADDED");
					logData(this.controller, "------>put success" + JSON.stringify(f5.result));
                }
                else {
                    future.result = f5.result; // "put" of new contacts failure
                }
            }.bind(this));
        }
        else {
            future.result = f4.result; // "del" of updated contacts failure
        }
    }.bind(this))
};
FirstAssistant.prototype.readCalendar = function(e){
    logData(this.controller, "read contact tapped");
    
    var fquery = {
        "from": "com.palmdts.synergy.calendarevent:1",
        "limit": 500
    };
    
    DB.find(fquery, false, false).then(this, function(future){
        var result = future.result;
        if (result.returnValue == true) {
            logData(this.controller, "find success, results=" + JSON.stringify(result.results));
            future.result = result;
        }
        else {
            result = future.exception;
            logData(this.controller, "find failure: Err code=" + result.errorCode + "Err message=" + result.message);
        }
    }.bind(this));
};
FirstAssistant.prototype.activate = function(event){
	this.controller.listen('setupContactKind', Mojo.Event.tap, this.createContactAccount);
    this.controller.listen('writeContactData', Mojo.Event.tap, this.writeContactData);
    this.controller.listen('readContactData', Mojo.Event.tap, this.readContactData);
    this.controller.listen('createCalendar', Mojo.Event.tap, this.createCalendar);
    this.controller.listen('writeCalendarData', Mojo.Event.tap, this.addEvent);
    this.controller.listen('readCalendarData', Mojo.Event.tap, this.readCalendar);
};
FirstAssistant.prototype.deactivate = function(event){
	this.controller.stopListening('setupContactKind', Mojo.Event.tap, this.createContactAccount);
    this.controller.stopListening('writeContactData', Mojo.Event.tap, this.writeContactData);
    this.controller.stopListening('readContactData', Mojo.Event.tap, this.readContactData);
    this.controller.stopListening('createCalendar', Mojo.Event.tap, this.createCalendar);
    this.controller.stopListening('writeCalendarData', Mojo.Event.tap, this.addEvent);
    this.controller.stopListening('readCalendarData', Mojo.Event.tap, this.readCalendar);
};

FirstAssistant.prototype.cleanup = function(event){
};
