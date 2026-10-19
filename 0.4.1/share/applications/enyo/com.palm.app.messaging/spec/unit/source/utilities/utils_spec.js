describe('Messaging Utils Unit Test', function() {

	it('enyo.messaging.imLoginState.getAggregatedLoginState() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var state;
		var loginStates;
		
		expect(enyo.messaging.imLoginState.getAggregatedLoginState(loginStates)).toBeFalsy();
		
		loginStates = [];
		expect(enyo.messaging.imLoginState.getAggregatedLoginState(loginStates)).toBeFalsy();

		
		loginStates = [{"availability": 0, "state": "online", "customMessage":"My Custom Message."},
		               {"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "logging-on"},
		               {"availability": 0, "state": "retrieving-buddies"},
		               {"availability": 4, "state": "logging-out"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.AVAILABLE);
		expect(state.identicalStates).toBeFalsy();
		expect(state.identicalAvailabilities).toBeFalsy();
		expect(state.identicalCustomMessages).toBeFalsy();
		expect(state.hasOffline).toBeTruthy();
		expect(state.hasPending).toBeTruthy();
		expect(state.customMessage).not.toBeDefined();
		
		loginStates = [{"availability": 0, "state": "online", "customMessage":"My First Custom Message."},
		               {"availability": 0, "state": "online"},
		               {"availability": 0, "state": "online"},
		               {"availability": 0, "state": "online", "customMessage":"My Second Custom Message."},
		               {"availability": 0, "state": "online"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.AVAILABLE);
		expect(state.identicalStates).toBeTruthy();
		expect(state.identicalAvailabilities).toBeTruthy();
		expect(state.identicalCustomMessages).toBeFalsy();
		expect(state.hasOffline).toBeFalsy();
		expect(state.hasPending).toBeFalsy();
		expect(state.customMessage).not.toBeDefined();
		
		loginStates = [{"availability": 0, "state": "online"},
		               {"availability": 0, "state": "online"},
		               {"availability": 0, "state": "online"},
		               {"availability": 0, "state": "online", "customMessage":"My Custom Message."},
		               {"availability": 0, "state": "online"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.AVAILABLE);
		expect(state.identicalStates).toBeTruthy();
		expect(state.identicalAvailabilities).toBeTruthy();
		expect(state.identicalCustomMessages).toBeFalsy();
		expect(state.hasOffline).toBeFalsy();
		expect(state.hasPending).toBeFalsy();
		expect(state.customMessage).not.toBeDefined();
		
		loginStates = [{"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "offline", "customMessage":"My Custom Message."},
		               {"availability": 4, "state": "offline"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.OFFLINE);
		expect(state.identicalStates).toBeTruthy();
		expect(state.identicalAvailabilities).toBeTruthy();
		expect(state.identicalCustomMessages).toBeFalsy();
		expect(state.hasOffline).toBeTruthy();
		expect(state.hasPending).toBeFalsy();
		expect(state.customMessage).not.toBeDefined();
		
		loginStates = [{"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "offline"},
		               {"availability": 2, "state": "online"},
		               {"availability": 0, "state": "retrieving-buddies"},
		               {"availability": 3, "state": "online"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.BUSY);
		expect(state.identicalStates).toBeFalsy();
		expect(state.identicalAvailabilities).toBeFalsy();
		expect(state.identicalCustomMessages).toBeTruthy();
		expect(state.hasOffline).toBeTruthy();
		expect(state.hasPending).toBeTruthy();
		expect(state.customMessage).toEqual("");
		
		loginStates = [{"availability": 4, "state": "offline"},
		               {"availability": 4, "state": "offline"},
		               {"availability": 0, "state": "retrieving-buddies"},
		               {"availability": 3, "state": "online"}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.INVISIBLE);
		expect(state.identicalStates).toBeFalsy();
		expect(state.identicalAvailabilities).toBeFalsy();
		expect(state.identicalCustomMessages).toBeTruthy();
		expect(state.hasOffline).toBeTruthy();
		expect(state.hasPending).toBeTruthy();
		expect(state.customMessage).toEqual("");	
		
		loginStates = [{"availability": 4, "state": "offline", "customMessage":"My Custom Message."},
		               {"availability": 4, "state": "offline", "customMessage":"My Custom Message."},
		               {"availability": 0, "state": "retrieving-buddies", "customMessage":"My Custom Message."},
		               {"availability": 3, "state": "online", "customMessage":"My Custom Message."}	
		              ];
		state = enyo.messaging.imLoginState.getAggregatedLoginState(loginStates);
		expect(state.bestAvailability).toEqual(enyo.messaging.im.availability.INVISIBLE);
		expect(state.identicalStates).toBeFalsy();
		expect(state.identicalAvailabilities).toBeFalsy();
		expect(state.identicalCustomMessages).toBeTruthy();
		expect(state.hasOffline).toBeTruthy();
		expect(state.hasPending).toBeTruthy();
		expect(state.customMessage).toEqual("My Custom Message.");
	});	

	
	it('enyo.messaging.message.isVisible() Test', function() {
		expect(enyo.messaging).toBeTruthy();	
		
		var rawMessage = {"flags":{"visible":false}};
		expect(enyo.messaging.message.isVisible(rawMessage)).toBeFalsy();
		
		rawMessage = {"flags":{"visible":true}};
		expect(enyo.messaging.message.isVisible(rawMessage)).toBeTruthy();				
	});	
	
	it('enyo.messaging.message.isUnread() Test', function() {
		expect(enyo.messaging).toBeTruthy();	
		
		var rawMessage = {"folder":"inbox"};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeTruthy();
		
		rawMessage = {"folder":"outbox", "flags":{"visible":true, "read":true}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();
	
		rawMessage = {"folder":"outbox", "flags":{"visible":true, "read":false}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();
		
		rawMessage = {"folder":"outbox", "flags":{"visible":false, "read":true}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();
	
		rawMessage = {"folder":"outbox", "flags":{"visible":false, "read":false}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();	
		
		rawMessage = {"folder":"inbox", "flags":{"visible":true, "read":false}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeTruthy();

		rawMessage = {"folder":"inbox", "flags":{"visible":true, "read":true}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();

		rawMessage = {"folder":"inbox", "flags":{"visible":false, "read":true}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();

		rawMessage = {"folder":"inbox", "flags":{"visible":false, "read":false}};
		expect(enyo.messaging.message.isUnread(rawMessage)).toBeFalsy();
	});		
	

	it('enyo.messaging.message.isReplacementMessage() Test', function() {
		expect(enyo.messaging).toBeTruthy();	
		
		var rawMessage;
		expect(enyo.messaging.message.isReplacementMessage(rawMessage)).toBeFalsy();
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 64})).toBeFalsy();
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 65})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 66})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 67})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 68})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 69})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 70})).toBeTruthy();	
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 71})).toBeTruthy();			
		expect(enyo.messaging.message.isReplacementMessage({"smsType": 72})).toBeFalsy();	
	});	
 
	it('enyo.messaging.message.isMMSMessage() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		expect(enyo.messaging.message.isMMSMessage(undefined)).toBeFalsy();
		expect(enyo.messaging.message.isMMSMessage(null)).toBeFalsy();
		expect(enyo.messaging.message.isMMSMessage({})).toBeFalsy();
		expect(enyo.messaging.message.isMMSMessage({"_kind":enyo.messaging.message.MMS.dbKind})).toBeTruthy();
		expect(enyo.messaging.message.isMMSMessage({"_kind":"some kind"})).toBeFalsy();
	});
	
	it('enyo.messaging.message.isMMSThread() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		expect(enyo.messaging.message.isMMSThread(undefined)).toBeFalsy();
		expect(enyo.messaging.message.isMMSThread(null)).toBeFalsy();
		expect(enyo.messaging.message.isMMSThread({})).toBeFalsy();
		expect(enyo.messaging.message.isMMSThread({"replyService":"mms"})).toBeTruthy();
		expect(enyo.messaging.message.isMMSThread({"replyService":"junk"})).toBeFalsy();
	});

	it('enyo.messaging.message.getMessageText() Test', function() {
		expect(enyo.messaging).toBeTruthy();	
		
		var rawMessage;
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("");
	
		rawMessage = {"garbage":"This is a test message."};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("");

		rawMessage = {"subject":"This is a test message."};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("This is a test message.");
		
		rawMessage = {"messageText":"This is a test message."};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("This is a test message.");
		
		rawMessage = {"serviceName":"mms", "attachments":[{"mimeType":"text/plain", "partText":"This is a test message."}]};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("This is a test message.");
		
		rawMessage = {"serviceName":"mms", "attachments":[{"mimeType":"text/plain", "junk":"This is junk."}, {"mimeType":"text/plain", "partText":"This is a test message."}]};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("This is a test message.");
		
		rawMessage = {"serviceName":"mms", "attachments":[{"mimeType":"text/plain", "junk":"This is junk."}]};
		expect(enyo.messaging.message.getMessageText(rawMessage)).toEqual("");
	});	

	it('enyo.messaging.message.getAddressesForThreading() Test', function() {
		expect(enyo.messaging).toBeTruthy();	

		var rawMessage;
		var addresses;
		
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses.length).toEqual(0);

		rawMessage = null;
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses.length).toEqual(0);
		
		rawMessage = {};
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses.length).toEqual(0);
		
		rawMessage = {"groupChatName":"My Group"};
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses[0].addr).toEqual("My Group");
		
		rawMessage = {"folder":"outbox", "to":"George"};
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses).toEqual("George");
		
		rawMessage = {"folder":"inbox", "from":"George"};
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);
		expect(addresses[0]).toEqual("George");
		
		rawMessage = {"folder":"inbox"};
		addresses = enyo.messaging.message.getAddressesForThreading(rawMessage);		
		expect(addresses.length).toEqual(0);
	});	

	it('enyo.messaging.message.removeHtml() Test', function() {
		expect(enyo.messaging).toBeTruthy();
	
		expect(enyo.messaging.message.removeHtml("")).toEqual("");
		expect(enyo.messaging.message.removeHtml("<html>This is a test</html>")).toEqual("This is a test");
		expect(enyo.messaging.message.removeHtml("<script>This is a test</script>")).toEqual("");
		expect(enyo.messaging.message.removeHtml("This is a test<br>")).toEqual("This is a test");	
		
	});	
	
	it('enyo.messaging.message.unescapeText() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		expect(enyo.messaging.message.unescapeText("&amp;&apos;&lt;&gt;&quot;")).toEqual("&'<>\"");
	});	
	
	it('enyo.messaging.person.isNotBlank() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		expect(enyo.messaging.person.isNotBlank(undefined)).toBeFalsy();
		expect(enyo.messaging.person.isNotBlank(null)).toBeFalsy();
		expect(enyo.messaging.person.isNotBlank("")).toBeFalsy();
		expect(enyo.messaging.person.isNotBlank("  ")).toBeTruthy();
		expect(enyo.messaging.person.isNotBlank("x")).toBeTruthy();
		
	});	

	it('enyo.messaging.person.getDisplayNameFromAccounts() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var accounts;
		expect(enyo.messaging.person.getDisplayNameFromAccounts(accounts)).toEqual("");
		
		accounts = [];
		expect(enyo.messaging.person.getDisplayNameFromAccounts(accounts)).toEqual("");

		accounts = [{"junk":"More junk"}];
		expect(enyo.messaging.person.getDisplayNameFromAccounts(accounts)).toEqual("");

		accounts = [{"value":"Some Name"}];
		expect(enyo.messaging.person.getDisplayNameFromAccounts(accounts)).toEqual("Some Name");

		accounts = [{"value":"Some Name"}, {"value":"Another Name"}, {"value":"Last Name"}];
		expect(enyo.messaging.person.getDisplayNameFromAccounts(accounts)).toEqual("Some Name");
	});	
	
	it('enyo.messaging.person.hasMessagingAccounts() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var person;
		
		expect(enyo.messaging.person.hasMessagingAccounts(undefined)).toBeFalsy();
		expect(enyo.messaging.person.hasMessagingAccounts(null)).toBeFalsy();
		
		person = {};
		expect(enyo.messaging.person.hasMessagingAccounts(person)).toBeFalsy();
		
		person = {"ims":[]};
		expect(enyo.messaging.person.hasMessagingAccounts(person)).toBeFalsy();
		
		person = {"ims":[{"type":"type_aim"}, {"type":"type_gtalk"}]};
		expect(enyo.messaging.person.hasMessagingAccounts(person)).toBeTruthy();	
	});	
	

	it('enyo.messaging.person.hasSMSAccounts() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var person;
		expect(enyo.messaging.person.hasSMSAccounts(undefined)).toBeFalsy();
		expect(enyo.messaging.person.hasSMSAccounts(null)).toBeFalsy();
		
		person = {};
		expect(enyo.messaging.person.hasSMSAccounts(person)).toBeFalsy();
		
		person = {"phoneNumbers":[]};
		expect(enyo.messaging.person.hasSMSAccounts(person)).toBeFalsy();
		
		person = {"phoneNumbers":[{"value":"(123) 4567890"}]};
		expect(enyo.messaging.person.hasSMSAccounts(person)).toBeTruthy();	

	});	
	
	it('enyo.messaging.thread.updateFromNewMessage() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var rawMessage;
		var addressObj;
		var rawChatThread;
	
		expect(enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj)).not.toBeDefined();
		expect(enyo.messaging.thread.updateFromNewMessage(rawMessage, null)).not.toBeDefined();
		expect(enyo.messaging.thread.updateFromNewMessage(null, addressObj)).not.toBeDefined();		
		expect(enyo.messaging.thread.updateFromNewMessage(null, null)).not.toBeDefined();

		rawMessage = {"folder":"drafts", "flags":{"visible":"false"}};
		expect(enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj)).not.toBeDefined();

		rawMessage = {"folder":"outbox","flags":{"read":true,"visible":true},"messageText":"Hello!","serviceName":"type_aim","from":{"name":"AIM","addr":"gandhi@aol.com"},"username":"gandhi@aol.com"};
		rawChatThread = enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj);	
		expect(rawChatThread).toBeDefined();
		expect(rawChatThread.flags.outgoing).toBeTruthy();
		expect(rawChatThread.summary).toEqual(rawMessage.messageText);
		expect(rawChatThread.replyService).toEqual(rawMessage.serviceName);
		expect(rawChatThread.replyAddress).toEqual("No Recipient");
		expect(rawChatThread.normalizedAddress).toEqual("no recipient");

		rawMessage = {"folder":"outbox","flags":{"read":true,"visible":true},"to":[{"name":"george","addr":"george"}],"messageText":"Hello!","serviceName":"type_aim","from":{"name":"AIM","addr":"gandhi@aol.com"},"username":"gandhi@aol.com"};
		rawChatThread = enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj);	
		expect(rawChatThread).toBeDefined();
		expect(rawChatThread.flags.outgoing).toBeTruthy();
		expect(rawChatThread.summary).toEqual(rawMessage.messageText);
		expect(rawChatThread.replyService).toEqual(rawMessage.serviceName);
		expect(rawChatThread.replyAddress).toEqual(rawMessage.to[0].name);
		expect(rawChatThread.normalizedAddress).toEqual(rawMessage.to[0].name);

		addressObj = {"name":"george","addr":"george", "normalizedAddress":"george"};		
		rawChatThread = enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj);		
		expect(rawChatThread).toBeDefined();
		expect(rawChatThread.flags.outgoing).toBeTruthy();
		expect(rawChatThread.summary).toEqual(rawMessage.messageText);
		expect(rawChatThread.replyService).toEqual(rawMessage.serviceName);
		expect(rawChatThread.replyAddress).toEqual(addressObj.addr);
		expect(rawChatThread.normalizedAddress).toEqual(addressObj.normalizedAddress);

		rawMessage = {"folder":"inbox","flags":{"visible":true},"to":[{"name":"george","addr":"george"}],"messageText":"Hello!","serviceName":"type_aim","from":{"name":"AIM","addr":"gandhi@aol.com"},"username":"gandhi@aol.com"};
		rawChatThread = enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj);		
		expect(rawChatThread).toBeDefined();
		expect(rawChatThread.flags.outgoing).toBeFalsy();
		expect(rawChatThread.summary).toEqual(rawMessage.messageText);
		expect(rawChatThread.replyService).toEqual(rawMessage.serviceName);
		expect(rawChatThread.replyAddress).toEqual(addressObj.addr);
		expect(rawChatThread.normalizedAddress).toEqual(addressObj.normalizedAddress);
		expect(rawChatThread.unreadCount).toEqual(1);		
		
		rawMessage = {"folder":"inbox","smsType":65,"flags":{"visible":true},"to":[{"name":"george","addr":"george"}],"messageText":"Hello!","serviceName":"type_aim","from":{"name":"AIM","addr":"gandhi@aol.com"},"username":"gandhi@aol.com"};
		rawChatThread = enyo.messaging.thread.updateFromNewMessage(rawMessage, addressObj);		
		expect(rawChatThread).toBeDefined();
		expect(rawChatThread.flags.outgoing).toBeFalsy();
		expect(rawChatThread.summary).toEqual(rawMessage.messageText);
		expect(rawChatThread.replyService).toEqual(rawMessage.serviceName);
		expect(rawChatThread.replyAddress).toEqual(addressObj.addr);
		expect(rawChatThread.normalizedAddress).toEqual(addressObj.normalizedAddress);
		expect(rawChatThread.unreadCount).toEqual(0);
	});		

	it('enyo.messaging.utils.isTextMessage() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		expect(enyo.messaging.utils.isTextMessage(undefined)).toBeTruthy();
		expect(enyo.messaging.utils.isTextMessage(null)).toBeFalsy();
		expect(enyo.messaging.utils.isTextMessage("")).toBeTruthy();
		expect(enyo.messaging.utils.isTextMessage("type_garbage")).toBeFalsy();
		expect(enyo.messaging.utils.isTextMessage("sms")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("mms")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_home")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_work")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_mobile")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_home_fax")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_business")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_car")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_pager")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_work_fax")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_sim")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_primary")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_other")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_home2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_home2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_work2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_business2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_mobile2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_car2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_pager2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_work_fax2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_sim2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_primary2")).toBeTruthy();		
		expect(enyo.messaging.utils.isTextMessage("type_other2")).toBeTruthy();	
	});	
	
	it('enyo.messaging.utils.formatAddress() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var address;
		var serviceName;
		
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual(enyo.messaging.utils.kMissingAddress);
		expect(enyo.messaging.utils.formatAddress(null, null)).toEqual(enyo.messaging.utils.kMissingAddress);
		
		serviceName = "junk";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual(enyo.messaging.utils.kMissingAddress);

		address = "4081234567";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual(address);

		serviceName = "sms";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual("(408) 123-4567");
		
		address = "14081234567";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual("1 (408) 123-4567");
		
		address = "014081234567";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual(address);
		
		address = "0114081234567";
		expect(enyo.messaging.utils.formatAddress(address, serviceName)).toEqual("011 40 81234567");
	});	
	
	it('enyo.messaging.utils.normalizeAddress() Test', function() {
		expect(enyo.messaging).toBeTruthy();
		
		var address;
		var serviceName;
		
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual(enyo.messaging.utils.kMissingAddress);
		expect(enyo.messaging.utils.normalizeAddress(null, null)).toEqual("no recipient");
		
		address = "George@yahoo.com";	
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual("george@yahoo.com");
		
		serviceName = "junk";
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual("george@yahoo.com");
		
		serviceName = "sms";
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual("george@yahoo.com");
		
		address = "123";
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual(address);
		
		address = "4081234567";
		expect(enyo.messaging.utils.normalizeAddress(address, serviceName)).toEqual("1234567");		
	});	

	it('enyo.messaging.utils.normalizeShortcode() Test', function() {
		expect(enyo.messaging).toBeTruthy();

		var shortcode;
		
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toBeFalsy();
		expect(enyo.messaging.utils.normalizeShortcode(null)).toBeFalsy();

		shortcode = "123";
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toEqual(shortcode);
		
		shortcode = "1*2@3";
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toEqual("123");
		
		shortcode = "1";	
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toBeFalsy();
		
		shortcode = "1234567"
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toBeFalsy();
		
		shortcode = "123456"
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toEqual(shortcode);
		
		shortcode = ".1.2.3.4.5.6."
	    expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toEqual("123456");
		
		shortcode = "1.2.3.4.5.6.7"
		expect(enyo.messaging.utils.normalizeShortcode(shortcode)).toBeFalsy();		
	});

	it('enyo.messaging.utils.isEmail() Test', function() {
		expect(enyo.messaging).toBeTruthy();

		expect(enyo.messaging.utils.isEmail(undefined)).toBeFalsy();
		expect(enyo.messaging.utils.isEmail(null)).toBeFalsy();
		expect(enyo.messaging.utils.isEmail("")).toBeFalsy();
		expect(enyo.messaging.utils.isEmail("george")).toBeFalsy();
		expect(enyo.messaging.utils.isEmail("george@gmail.com")).toBeTruthy();
	});
	
	it('enyo.messaging.utils.cleanPhoneNumber() Test', function() {
		expect(enyo.messaging).toBeTruthy();

		var value;
		var type;
		
		expect(enyo.messaging.utils.cleanPhoneNumber(value, type)).not.toBeDefined();
		expect(enyo.messaging.utils.cleanPhoneNumber(null, null)).toBeNull();
		
		type = "phone";
		expect(enyo.messaging.utils.cleanPhoneNumber(value, type)).not.toBeDefined();
		expect(enyo.messaging.utils.cleanPhoneNumber(null, type)).toBeNull();
		
		value = "1234567"
		expect(enyo.messaging.utils.cleanPhoneNumber(value, type)).toEqual(value);

		value = "*1234567#"
		expect(enyo.messaging.utils.cleanPhoneNumber(value, type)).toEqual(value);
		
		value = "A0123456789b"
		expect(enyo.messaging.utils.cleanPhoneNumber(value, type)).toEqual("0123456789");
	});
	it('enyo.messaging.utils.getMessageErrorFromCode() Test', function() {
		expect(enyo.messaging).toBeTruthy();

		var errorcode;
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, {})).toBeTruthy;
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, {})).toEqual("Could not send your message. Try again.");
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, {status:"permanent-fail"})).toEqual("Could not send your message.");
		errorcode = "unknownscaddress";
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, undefined)).toEqual("Unknown service center address. Contact your carrier.");
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, {status:"permanent-fail"})).toEqual("Unknown service center address. Contact your carrier.");
		errorcode =	"smsnetworkerror";
		expect(enyo.messaging.message.getMessageErrorFromCode(errorcode, {networkErrorCode:"101"})).toEqual("Could not send your message due to a network error. Try again. 101");
	});
	
	it('enyo.messaging.joinData() Test One', function() {
		expect(enyo.messaging).toBeTruthy();	

		data = {
			"returnValue": true,
			"results": [{
				"_id": "++Hc2tSWj74Zj0ZB",
				"_kind": "com.palm.chatthread:1",
				"personId": "++HbstQncV43tRWz"
			}, {
				"_id": "++Hbu2tuPDKjzGyi",
				"_kind": "com.palm.chatthread:1"
//comment out personId for this record to test case which doesn't have personId
//				"personId": "++Hbu2s1tJlVkbYn"
			}, {
				"_id": "++Hbu2tuPDKjzGya",
				"_kind": "com.palm.chatthread:1",
//notice this personId end with m, which won't find match in either imbuddystatus db or person db
				"personId": "++Hbu2s1tJlVkbYm"
			}]
		};
//join imbuddystatus to chatthread data
		var inData =[{
			"_id": "++Hc7lcLeo4frc5A",
			"_kind": "com.palm.imbuddystatus.yahoo:1",
			"availability": 4,
			"offline": true,
			"personId": "++HbstQncV43tRWz"
		},
		{
			"_id": "++Hc7lcW5M+w+hP0",
			"_kind": "com.palm.imbuddystatus.libpurple:1",
			"availability": 4,
			"offline": true,
			"personId": "++Hbu2s1tJlVkbYn"
		}] ;
		enyo.messaging.utils.joinData(data, inData, "personId", "personId", "status");

		expect(data.results[0].status).toBeTruthy();	
		expect(data.results[0].status === inData[0]).toBeTruthy();	
		expect(data.results[1].status).toBeFalsy();	
		expect(data.results[2].status).toBeFalsy();	
 
//join person to chatthread data
		inData = [{
			"_id": "++HbstQncV43tRWz",
			"_kind": "com.palm.person:1"
		},
		{
			"_id": "++Hbu2s1tJlVkbYn",
			"_kind": "com.palm.person:1"
		}];
		enyo.messaging.utils.joinData(data, inData, "_id", "personId", "person");

		expect(data.results[0].person).toBeTruthy();	
		expect(data.results[0].person === inData[0]).toBeTruthy();	
		expect(data.results[1].person).toBeFalsy();	
		expect(data.results[2].person).toBeFalsy();	
	});
	
	it('enyo.messaging.joinData() Test Two', function() {
		expect(enyo.messaging).toBeTruthy();
		
		data = {"returnValue": true,			
	             "results": [{"_id":"++Hcub65LAoN0Nar",
	            	          "_kind":"com.palm.imbuddystatus.libpurple:1",
	            	          "accountId":"++Hc2AAm+hG1N_4F",
	            	          "displayName":"john@aol.com",
	            	          "group":"Buddies",
	            	          "personAvailability":0,
	            	          "personId":"++Hcub6tMX7yiV33",
	            	          "serviceName":"type_aim",
	            	          "username":"john"
	             	        },
	             	        {"_id":"++Hcub65LAoN0Njv",
		            	     "_kind":"com.palm.imbuddystatus.libpurple:1",
		            	     "accountId":"++Hc2AAm+hG1N_5Q",
		            	     "displayName":"mark@aol.com",
		            	     "group":"Buddies",
		            	     "personAvailability":0,
		            	     "personId":"++Hcub6tMX7yiV44",
		            	     "serviceName":"type_aim",
		            	     "username":"mark"
	             	        }]
				};
		
		var inData =[{"_id": "++Hcub6tMX7yiV33",
                      "_kind": "com.palm.person:1",
                      "contactIds": ["++HcubA7kBJUHiZX",
                                     "++Hcub67KD8ifAZM"],
                      "emails": [{"_id": "815",
                                  "favoriteData": {},
                                  "normalizedValue": "john@aol.com",
                                  "primary": false,
                                  "type": "type_home",
                                  "value": "john@aol.com"
                                }],
                      "favorite": false,
                      "ims": [{"_id": "816",
                               "normalizedValue": "john",
                               "primary": false,
                               "serviceName": "type_aim",
                               "type": "type_aim",
                               "value": "john"
                              }],
                      "photos": {"squarePhotoPath": ""}
		             },
		             {"_id": "++Hcub6tMX7yiV44",
	                  "_kind": "com.palm.person:1",
	                  "contactIds": ["++HcubA7kBJUHiZX",
	                                 "++Hcub67KD8ifAZM"],
	                  "emails": [{"_id": "815",
	                              "favoriteData": {},
	                              "normalizedValue": "mark@aol.com",
	                              "primary": false,
	                              "type": "type_home",
	                              "value": "mark@aol.com"
	                            }],
	                  "favorite": false,
	                  "ims": [{"_id": "816",
	                           "normalizedValue": "mark",
	                           "primary": false,
	                           "serviceName": "type_aim",
	                           "type": "type_aim",
	                           "value": "mark"
	                          }],
	                  "photos": {"squarePhotoPath": ""}
	                 }];

		    // join person data to buddy data
		    enyo.messaging.utils.joinData(data, inData, "_id", "personId", "person");
			expect(data.results[0].person).toBeTruthy();
			expect(data.results[0].person).toEqual(inData[0]);	
			expect(data.results[1].person).toBeTruthy();
			expect(data.results[1].person).toEqual(inData[1]);
			
			inData = [{"_id": "++HcubFMJ8JUmUId",
	                   "_kind": "com.palm.chatthread:1",
	                   "displayName": "john@aol.com",
	                   "flags": {"outgoing": false,
	                             "visible": true
	                            },
	                   "normalizedAddress": "john",
	                   "personId": "++Hcub6tMX7yiV33",
	                   "replyAddress": "john",
	                   "replyService": "type_aim",
	                   "summary": "123"
	                  },
	                  {"_id": "++HcubFMJ8JUmAbc",
		               "_kind": "com.palm.chatthread:1",
		               "displayName": "mark@aol.com",
		               "flags": {"outgoing": false,
		                         "visible": true
		                        },
		               "normalizedAddress": "mark",
		               "personId": "++Hcub6tMX7yiV44",
		               "replyAddress": "mark",
		               "replyService": "type_aim",
		               "summary": "123"
	                  }];

			// join chatthread data to buddy data
			enyo.messaging.utils.joinData(data, inData, "personId", "personId", "thread");

			expect(data.results[0].thread).toBeTruthy();	
			expect(data.results[0].thread).toEqual(inData[0]);	
			expect(data.results[1].thread).toBeTruthy();	
			expect(data.results[1].thread).toEqual(inData[1]);
	});
})