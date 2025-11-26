//***************************************************
// Validate calendar username/password 
//***************************************************
// To debug on this service you can novaterm into the device or emulator and use
// run-js-service -d /media/cryptofs/apps/usr/palm/services/com.palmdts.synergy.service/
// To view the console.log outputs.

var checkCredentialsAssistant = function(future){
};

checkCredentialsAssistant.prototype.run = function(future){

    var logInArgs = this.controller.args;
    // Print out the username and password the user entered
    console.log("#------&&-----# Sample Calendar Service: checkCredentials args =" + validate(logInArgs.username));
    
    // As we are not authenticating against a site for this demo we will
    // just validate that the username is a valid email address
    
    
    if (validate(logInArgs.username)) {
        //...Pass back credentials and config (username/password); config is passed to onEnabled where
        //...we will save username/password in encrypted storage
        future.result = {
            returnValue: true,
            "credentials": {
                "common": {
                    "password": logInArgs.password,
                    "username": logInArgs.username
                }
            },
            "config": {
                "password": logInArgs.password,
                "username": logInArgs.username
            }
        };
    }
    else {
        throw new Transport.AuthenticationError();
    }
};

function validate(address){
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(address) == false) {
        return false;
    }
    else 
        return true;
}

//***************************************************
// Capabilites changed notification
//***************************************************
var onCapabilitiesChangedAssistant = function(future){
};

// 
// Called when an account's capability providers changes. The new state of enabled 
// capability providers is passed in. This is useful for transports that handle all syncing where 
// it is easier to do all re-syncing in one step rather than using multiple 'onEnabled' handlers.
//

onCapabilitiesChangedAssistant.prototype.run = function(future){
    var args = this.controller.args;
    console.log("#------&&-----# Test Service: onCapabilitiesChanged args =" + JSON.stringify(args));
    future.result = {
        returnValue: true
    };
};

//***************************************************
// Credentials changed notification 
//***************************************************
var onCredentialsChangedAssistant = function(future){
};
//
// Called when the user has entered new, valid credentials to replace existing invalid credentials. 
// This is the time to start syncing if you have been holding off due to bad credentials.
//
onCredentialsChangedAssistant.prototype.run = function(future){
    var args = this.controller.args;
    console.log("#------&&-----#Sample Service: onCredentialsChanged args =" + JSON.stringify(args));
    future.result = {
        returnValue: true
    };
};


//***************************************************
// Account created notification
//***************************************************
var onCreateAssistant = function(future){
};

//
// The account has been created. Time to save the credentials contained in the "config" object
// that was emitted from the "checkCredentials" function.
// Even though we are not hitting an actual site to authenticate, this is how you would store the u/p 
// for future use 
onCreateAssistant.prototype.run = function(future){
    console.log("#------&&-----# OnCreate");
    
    var args = this.controller.args;
    console.log("#------&&-----# " + JSON.stringify(args))
	
    //...Username/password passed in "config" object
    var B64username = Base64.encode(args.config.username);
    var B64password = Base64.encode(args.config.password);
    
    var keystore1 = {
        "keyname": "AcctUsername",
        "keydata": B64username,
        "type": "AES",
        "nohide": true
    };
    var keystore2 = {
        "keyname": "AcctPassword",
        "keydata": B64password,
        "type": "AES",
        "nohide": true
    };
    
    //...Save encrypted username/password for syncing.
   /* PalmCall.call("palm://com.palm.keymanager/", "store", keystore1).then(function(f){
        if (f.result.returnValue === true) {
            PalmCall.call("palm://com.palm.keymanager/", "store", keystore2).then(function(f2){
                future.result = f2.result;
            });
        }
        else {
            future.result = f.result;
        }
    });*/
	future.result = {
        returnValue: true
    };
};

//***************************************************
// Account deleted notification
//***************************************************
var onDeleteAssistant = function(future){

};

//
// Account deleted - transport should delete account and config information here.
//

onDeleteAssistant.prototype.run = function(future){
    console.log("#------&&-----# OnDelete");
    
    //..Create query to delete contacts from our extended kind associated with this account
    var args = this.controller.args;
    var q = {
        "query": {
            "from": "com.palmdts.synergy.calendar:1",
            "where": [{
                "prop": "accountId",
                "op": "=",
                "val": args.accountId
            }]
        }
    };
    
    //...Delete contacts from our extended kind
    PalmCall.call("palm://com.palm.db/", "del", q).then(function(f){
        if (f.result.returnValue === true) {
            //..Delete our housekeeping/sync data
            var q2 = {
                "query": {
                    "from": "com.palmdts.synergy.calendar.transport:1"
                }
            };
            PalmCall.call("palm://com.palm.db/", "del", q2).then(function(f1){
                future.result = f1.result;
            });
            
        }
        else {
            future.result = f.result;
        }
    });
    var q = {
        "query": {
            "from": "com.palmdts.synergy.calendarevent:1",
            "where": [{
                "prop": "accountId",
                "op": "=",
                "val": args.accountId
            }]
        }
    };
    
    //...Delete contacts from our extended kind
    PalmCall.call("palm://com.palm.db/", "del", q).then(function(f){
        if (f.result.returnValue === true) {
            //..Delete our housekeeping/sync data
            var q2 = {
                "query": {
                    "from": "com.palmdts.synergy.calendarevent.transport:1"
                }
            };
            PalmCall.call("palm://com.palm.db/", "del", q2).then(function(f1){
                future.result = f1.result;
            });
            
        }
        else {
            future.result = f.result;
        }
    });
};

//*****************************************************************************
// Capability enabled notification - called when capability enabled or disabled
//*****************************************************************************
var onEnabledAssistant = function(future){
};

//
// Transport got 'onEnabled' message. When enabled, a sync should be started and future syncs scheduled.
// Otherwise, syncing should be disabled and associated data deleted.
// Account-wide configuration should remain and only be deleted when onDelete is called.
// 

onEnabledAssistant.prototype.run = function(future){

    var args = this.controller.args;
    
    if (args.enabled === true) {
        // First step lest create a new calendar
        
        console.log("#------&&-----# OnEnabled Transport enabled " + args.accountId)
        var acctId = args.accountId;
        var ids = [];
        
        var myCal = {
            _kind: "com.palmdts.synergy.calendar:1",
            "UID": 'DTS_ID',
            "accountId": acctId,
            "name": 'DTS Sample Calendar',
            "isReadOnly": false,
            "syncSource": 'Hard Coded by Enda',
            "excludeFromAll": false,
            "color": 'green'
        }
        
        
        var adCal = {
            "objects": [myCal]
        };
        PalmCall.call("palm://com.palm.db/", "put", adCal).then(function(f){
            if (f.result.returnValue === true) {
                console.log("#------&&-----# Calendar created ")
            }
            else {
                future.result = f.result;
            }
        });
        
        
        // Now lets add last sync info, not really important in this example but will be if you are creating an actual example
        
        var syncRec = {
            "objects": [{
                _kind: "com.palmdts.synergy.calendar.transport:1",
                "lastSync": "2005-01-01T00:00:00Z",
                "accountId": acctId,
                "remLocIds": ids
            }]
        };
        PalmCall.call("palm://com.palm.db/", "put", syncRec).then(function(f){
            if (f.result.returnValue === true) {
                PalmCall.call("palm://com.palmdts.synergy.service/", "sync", {}).then(function(f2){
                    // 
                    // Here you could schedule additional syncing via Activity Manager.
                    //
                    future.result = f2.result;
                });
            }
            else {
                future.result = f.result;
            }
        });
    }
    else {
        // Disable scheduled syncing and delete associated data.
    }
    
    future.result = {
        returnValue: true
    };
};


//***************************************************
// Sync function
// In this example the sync function will only be called once as we didn't setup any
// addition calls using the activity manager.
//***************************************************
var syncAssistant = function(future){
};

syncAssistant.prototype.run = function(future){

    // First we query our calendar so we can get back the calendarId and accountId the
    // system assigned us. We need these to add our new calendarevent
    
    var q = {
        "query": {
            "from": "com.palmdts.synergy.calendar:1"
        }
    };
    PalmCall.call("palm://com.palm.db/", "find", q).then(function(f){
        if (f.result.returnValue === true) {
        
            var calendarId = f.result.results[0]._id;
            var accountId = f.result.results[0].accountId;
            
            //For our new calendar event we are going to set it for the day this code
            //runs from 3 to 4 pm
            var timeStamp = new Date()
            var eventStart = new Date()
			eventStart.setHours(15, 0, 0, 0);
            var eventEnd = eventStart.getTime() + 3600000
            var calendarObj = {
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
            };
            
            //..Get our sync-tracking information saved previously in a db8 object
            var q = {
                "query": {
                    "from": "com.palmdts.synergy.calendar.transport:1"
                }
            };
			var newCalObjects = {"objects":[calendarObj]};
			
            PalmCall.call("palm://com.palm.db/", "find", q).then(function(f2){
                if (f2.result.returnValue === true) {
                    var id = f2.result.results[0]._id;
                    var accountId = f2.result.results[0].accountId;
                    var remLocIds = f2.result.results[0].remLocIds; // local id/remote id pairs
                    var lastSync = f2.result.results[0].lastSync; // date/time since last sync
                    results = f2.result.results
                    
                    
                    //..Write new or updated contacts
                    PalmCall.call("palm://com.palm.db/", "put", newCalObjects).then(function(f5){
                        if (f5.result.returnValue === true) {
                            console.log("CALENDAR ADDED");                           
                        }
                        else {
                            future.result = f5.result; // "put" of new contacts failure
                        }
                    });
                }
                else {
                    future.result = f4.result; // "del" of updated contacts failure
                }
            }); // del objs   
        }
    })
};








