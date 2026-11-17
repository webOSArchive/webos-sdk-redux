describe('Messaging Buddies Unit Test', function() {
	
	var buddyList = new BuddyList();
	var buddyItem = new BuddyItem();
	
	it('BuddyList.isOffline() Test', function() {
		expect(buddyList).toBeTruthy();	
		
		expect(buddyList.isOffline([{"availability": 0, "state": "offline"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 0, "state": "logging-on"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 0, "state": "retrieving-buddies"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 0, "state": "online"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 0, "state": "logging-out"}])).toBeFalsy();
		
		expect(buddyList.isOffline([{"availability": 2, "state": "offline"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 2, "state": "logging-on"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 2, "state": "retrieving-buddies"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 2, "state": "online"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 2, "state": "logging-out"}])).toBeFalsy();
		
		expect(buddyList.isOffline([{"availability": 3, "state": "offline"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 3, "state": "logging-on"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 3, "state": "retrieving-buddies"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 3, "state": "online"}])).toBeFalsy();
		expect(buddyList.isOffline([{"availability": 3, "state": "logging-out"}])).toBeFalsy();
		
		expect(buddyList.isOffline([{"availability": 4, "state": "offline"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 4, "state": "logging-on"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 4, "state": "retrieving-buddies"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 4, "state": "online"}])).toBeTruthy();
		expect(buddyList.isOffline([{"availability": 4, "state": "logging-out"}])).toBeTruthy();
	});	
	
	it('BuddyList.emptyMessageCheck() Test', function() {	
		expect(buddyList).toBeTruthy();	
				
		var inResponse = {"returnValue":true, "results":[], "count":0};
		var inRequest = {"index":0};
		var loginStates =[];
		var filterString = "george";
		var showOffline = true;
		
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).toEqual(BuddyConstants.OFFLINE_MESSAGE);	
		
		loginStates = [{"availability": 0, "state": "online"}];
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).toEqual(enyo.messaging.CONSTANTS.NO_SEARCH_RESULTS);
		
		filterString = "";
		loginStates = [{"availability": 4, "state": "offline"}];
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).toEqual(BuddyConstants.OFFLINE_MESSAGE);
						
		loginStates = [{"availability": 0, "state": "online"}];
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).toEqual(BuddyConstants.NO_BUDDY_MESSAGE);
		
		showOffline = false;
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).toEqual(BuddyConstants.NO_ONLINE_BUDDY_MESSAGE);
		
		filterString = "me";
		inResponse = {"returnValue":true, "results":["test1","test2"], "count":2};
		expect(buddyList.emptyMessageCheck(inResponse, inRequest, loginStates, filterString, showOffline)).not.toBeDefined();
		
	});
	
	it('BuddyList.shouldHighlight() Test', function() {
		expect(buddyList).toBeTruthy();
	
		var inBuddy = {"username":"george.washington@aol.com", "serviceName":"type_aim", "personId":"++abcdef"};
		var selectedRecord;
		
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeFalsy();	
		
		selectedRecord = {"personId":"++abcdef"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeTruthy();
		selectedRecord = {"personId":"++123456"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeFalsy();
		
		selectedRecord = {"normalizedAddress":"george.washington@aol.com"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeTruthy();
		selectedRecord = {"normalizedAddress":"george.washington"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeFalsy();
		
		selectedRecord = {"username":"george.washington@aol.com", "serviceName":"type_aim"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeTruthy();
		selectedRecord = {"username":"george.washington@google.com", "serviceName":"type_gtalk"};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeFalsy();
		
		selectedRecord = {};
		expect(buddyList.shouldHighlight(inBuddy, selectedRecord)).toBeFalsy();
	});
	
	it('BuddyItem.getContactName() Test', function() {
		expect(buddyItem).toBeTruthy();	
		
		expect(buddyItem.getContactName({"displayName":"George Washington"})).toEqual("George Washington");
		expect(buddyItem.getContactName({"username":"george.washington@google.com"})).toEqual("george.washington@google.com");
		
		expect(buddyItem.getContactName({"displayName":"<html>George Washington</html>"})).toEqual("George Washington");
		expect(buddyItem.getContactName({"username":"<html>george.washington@google.com</html>"})).toEqual("george.washington@google.com");
		
		expect(buddyItem.getContactName({"displayName":"<script>Trying to be sneaky</script>"})).toEqual("");
		expect(buddyItem.getContactName({"username":"<script>Trying to be sneaky</script>"})).toEqual("");	
	});	

	it('BuddyItem.getStatus() Test', function() {
		expect(buddyItem).toBeTruthy();	
		
		expect(buddyItem.getStatus(0)).toEqual("status status-buddy status-available");		
		expect(buddyItem.getStatus(2)).toEqual("status status-buddy status-away");		
		expect(buddyItem.getStatus(3)).toEqual("status status-buddy status-invisible");		
		expect(buddyItem.getStatus(4)).toEqual("status status-buddy status-offline");			
	});	
	
	it('BuddyItem.getStatusMessage() Test', function() {
		expect(buddyItem).toBeTruthy();	
		
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"Available"})).toEqual("Available");
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.yahoo:1", "status":"Available"})).toEqual("Available");

		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"<html>I'm here!!!</html>"})).toEqual("I'm here!!!");
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.yahoo:1", "status":"<html>I'm here!!!</html>"})).toEqual("I'm here!!!");

		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"<script>Trying to be sneaky!!!</script>"})).toEqual("");
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.yahoo:1", "status":"<script>Trying to be sneaky!!!</script>"})).toEqual("");
		
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"<html>&apos;&lt;&gt;&quot;</html>"})).toEqual("'<>\"");	
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"&apos;&lt;&gt;&quot;"})).toEqual("'<>\"");
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"I&apos;m here!!!"})).toEqual("I'm here!!!");
		expect(buddyItem.getStatusMessage({"_kind":"com.palm.imbuddystatus.libpurple:1", "status":"<html>I&apos;m here!!!</html>"})).toEqual("I'm here!!!");
	});	
	
	it('BuddyItem.getUnreadCount() Test', function() {
		expect(buddyItem).toBeTruthy();		
		
		expect(buddyItem.getUnreadCount({"unreadCount":8})).toEqual(8);
		expect(buddyItem.getUnreadCount(null)).toEqual(0);
		expect(buddyItem.getUnreadCount(undefined)).toEqual(0);	
	});
	
	it('BuddyItem.getContactNameClass() Test', function() {
		expect(buddyItem).toBeTruthy();	
				
		expect(buddyItem.getContactNameClass(true,  {"favorite":true})).toEqual("contact-name contact-name-unread-favorite");
		expect(buddyItem.getContactNameClass(true,  {"favorite":false})).toEqual("contact-name contact-name-unread");
		expect(buddyItem.getContactNameClass(false, {"favorite":true})).toEqual("contact-name contact-name-favorite");	
		expect(buddyItem.getContactNameClass(false, {"favorite":false})).toEqual("contact-name");		
		
		expect(buddyItem.getContactNameClass(null, {"favorite":false})).toEqual("contact-name");	
		expect(buddyItem.getContactNameClass(undefined, {"favorite":false})).toEqual("contact-name");	
		expect(buddyItem.getContactNameClass(null, {"favorite":true})).toEqual("contact-name contact-name-favorite");	
		expect(buddyItem.getContactNameClass(undefined, {"favorite":true})).toEqual("contact-name contact-name-favorite");
		
		expect(buddyItem.getContactNameClass(true,  null)).toEqual("contact-name contact-name-unread");
		expect(buddyItem.getContactNameClass(true,  undefined)).toEqual("contact-name contact-name-unread");
		expect(buddyItem.getContactNameClass(false, null)).toEqual("contact-name");	
		expect(buddyItem.getContactNameClass(false, undefined)).toEqual("contact-name");	
	});

})