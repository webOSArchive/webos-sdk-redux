describe('Dashboard for New Messages Test', function() {
	beforeEach(function() {
		enyo.application.appInit = new AppInit();
		enyo.application.appInit.init();
		enyo.application.messageDashboardManager.isInited = true;
	});
	
	describe('should show notification with notification enabled', function() {
		var dashboardMgr, prefs;
		
		beforeEach(function() {
			dashboardMgr = enyo.application.messageDashboardManager;
			
			// set up preferences
			prefs = getPrefsWithNotificationEnabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeTruthy();
		});
		
		afterEach(function() {
			dashboardMgr.init();
		});
		
		it('test display on; app activated, no filter', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display off; app activated, no filter', function() {
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display on; app deactivated, no filter', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display off; app deactivated, no filter', function() {
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display on; app activated, filtered by thread id', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// set up filter
			var filter = {thread: "++Bbbbb+Bbbbbbbb"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			expect(dashboardMgr.isNewMessage(messages[0])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[0])).toBeTruthy();
			expect(dashboardMgr.isNewMessage(messages[1])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[1])).toBeFalsy();
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			expect(dashboardMgr.isNewMessage(messages[0])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[0])).toBeTruthy();
			expect(dashboardMgr.isNewMessage(messages[1])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[1])).toBeFalsy();
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
		
			// test newest messages
			messages = getNewestMessages().results;
			expect(dashboardMgr.isNewMessage(messages[0])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[0])).toBeTruthy();
			expect(dashboardMgr.isNewMessage(messages[1])).toBeTruthy();
			expect(dashboardMgr.shouldNotify(messages[1])).toBeTruthy();
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display off; app activated, filtered by thread id', function() {
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// set up filter
			var filter = {thread: "++Bbbbb+Bbbbbbbb"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display on; app deactivated, filtered by thread id', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// set up filter
			var filter = {thread: "++Bbbbb+Bbbbbbbb"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test display off; app deactivated, filtered by thread id', function() {
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// set up filter
			var filter = {thread: "++Bbbbb+Bbbbbbbb"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			
			// test newest messages
			messages = getNewestMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeTruthy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
	
		it ('test for detecting new messages', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages
			var messages = getNewMessages().results;
			expect(messages).toEqual(dashboardMgr.getPendingNewMessages(messages));
			
			// test newer messages
			messages = getNewerMessages().results;
			expect(messages).toEqual(dashboardMgr.getPendingNewMessages(messages));
		});
		
		it ('test for detecting mixed messages', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// positive test cases
			// test new messages
			var messages = getMixedNewMessages().results;
			expect([{
				"_id": "++22222222222222",
				"_kind": "com.palm.message:1",
				"_rev": 2,
				"_sync": true,
				"conversations": ["++Bbbbb+Bbbbbbbb"],
				"flags": {
					"read": false
				},
				"folder": "inbox",
				"from": {
					"addr": "verifySender"
				},
				"localTimestamp": 2147483647,
				"messageText": "verify message 1",
				"readRevSet": 2,
				"serviceName": "type_service",
				"status": "successful",
				"timestamp": 2147483647,
				"to": [{
					"_id": "156a6",
					"addr": "testUsername@test.com"
				}],
				"username": "testUsername@test.com"
			},{
				"_id": "++33333333333333",
				"_kind": "com.palm.message:1",
				"_rev": 11,
				"_sync": true,
				"conversations": ["++Aaaaa+Aaaaaaaaa"],
				"flags": {
					"read": false
				},
				"folder": "inbox",
				"from": {
					"addr": "testSender"
				},
				"localTimestamp": 2147483647,
				"messageText": "test message 2",
				"readRevSet": 11,
				"serviceName": "type_service",
				"status": "successful",
				"timestamp": 2147483647,
				"to": [{
					"_id": "156a6",
					"addr": "testUsername@test.com"
				}],
				"username": "testUsername@test.com"
			}]).toEqual(dashboardMgr.getPendingNewMessages(messages));
		});
		
		it ('test for making dashboard layer for new messages', function() {
			var dashboardMgr = enyo.application.messageDashboardManager;
			var messages = getNewMessages().results;
			
			var layers = [getDashboardLayerForNewMessage1(), getDashboardLayerForNewMessage2()];
			expect(layers).toEqual(dashboardMgr.getPendingLayers(messages));
			
			expect(layers[0]).toEqual(dashboardMgr.makeDashboardLayer(messages[0]));
			expect(layers[1]).toEqual(dashboardMgr.makeDashboardLayer(messages[1]));
			
		});
	});
	
	describe('will not show notification', function() {
		var dashboardMgr;
		
		beforeEach(function() {
			dashboardMgr = enyo.application.messageDashboardManager;
		});
		
		afterEach(function() {
			dashboardMgr.init();
		});
		
		it('test notification disabled, display on; app activated, no filter', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display off; app activated, no filter', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display on; app deactivated, no filter', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be deactivated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display off; app deactivated, no filter', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be deactivated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display on; app activated, filtered by thread id', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// set up filter
			var filter = {thread: "++Aaaaa+Aaaaaaaaa"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display off; app activated, filtered by thread id', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// set up filter
			var filter = {thread: "++Aaaaa+Aaaaaaaaa"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display on; app deactivated, filtered by thread id', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be deactivated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// set up filter
			var filter = {thread: "++Aaaaa+Aaaaaaaaa"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test notification disabled, display off; app deactivated, filtered by thread id', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOffDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeTruthy();
			
			// set app to be deactivated
			dashboardMgr.setAppDeactivated(true);
			expect(dashboardMgr.appDeactivated).toBeTruthy();
			
			// set up filter
			var filter = {thread: "++Aaaaa+Aaaaaaaaa"};
			dashboardMgr.setFilter(filter);
			expect(dashboardMgr.filter.thread === filter.thread).toBeTruthy();
			
			// test new messages
			var messages = getNewMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeTruthy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
		});
		
		it('test from newest to oldest messages', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// get newest messages
			var messages = getNewestMessages().results;
			var ndx, len;
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
			
			// test new messages
			messages = getNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
			
			// test new messages
			messages = getNewMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 22).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 22).toBeTruthy();
		});
		
		it('test messages that has been read', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// get new messages
			var messages = getNewMessages().results;
			var ndx, len;
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 2).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			// get read new messages 
			messages = getReadNewMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 4).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 2).toBeTruthy();
			
			// test newer messages
			messages = getNewerMessages().results;
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 12).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
			// get read new messages 
			messages = getReadNewerMessages().results;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
				expect(dashboardMgr.shouldNotify(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 14).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 12).toBeTruthy();
		});
		
		it('test messages that will not cause notification to show', function() {
			// set up preferences with notification disabled
			prefs = getPrefsWithNotificationDisabled();
			dashboardMgr.prefsUpdated(prefs);
			expect(dashboardMgr.prefs).toBeDefined();
			expect(dashboardMgr.prefs.enableNotification).toBeFalsy();
			
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test messages without chat thread assigned
			var messages = getNewMessagesWithoutConversations().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 1).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 0).toBeTruthy();
			
			messages = getOutboxMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 1).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 0).toBeTruthy();
			
			messages = getInvalidInboxMessages().results;
			var ndx, len;
			for (ndx = 0, len = messages.length; ndx < len; ndx++) {
				expect(dashboardMgr.isNewMessage(messages[ndx])).toBeFalsy();
			}
			dashboardMgr.processChanges(messages);
			expect(dashboardMgr.lastRev === 8).toBeTruthy();
			expect(dashboardMgr.cutoffRevSet === 0).toBeTruthy();
		});		
		
		it ('negative tests for detecting new messages', function() {
			// set up display status
			var displayStatus = getOnDisplayStatus();
			dashboardMgr.displayUpdate(undefined, displayStatus);
			expect(dashboardMgr.displayOff).toBeFalsy();
			
			// set app to be activated
			dashboardMgr.setAppDeactivated(false);
			expect(dashboardMgr.appDeactivated).toBeFalsy();
			
			// test new messages without chat thread ID
			var messages = getNewMessagesWithoutConversations().results;
			expect([]).toEqual(dashboardMgr.getPendingNewMessages(messages));
			
			// test outbox messages
			messages = getOutboxMessages().results;
			expect([]).toEqual(dashboardMgr.getPendingNewMessages(messages));
			
			// test read messages
			messages = getReadNewMessages().results;
			expect([]).toEqual(dashboardMgr.getPendingNewMessages(messages));
			
			// test invalid inbox messages
			messages = getInvalidInboxMessages().results;
			expect([]).toEqual(dashboardMgr.getPendingNewMessages(messages));
			
			// test read newer messages
			messages = getReadNewerMessages().results;
			expect([]).toEqual(dashboardMgr.getPendingNewMessages(messages));
		});
	});
	
	describe('test dashboard functions', function() {
		var dashboardMgr;
		
		beforeEach(function() {
			dashboardMgr = enyo.application.messageDashboardManager;
		});
		
		it('test DashboardManager.getDispalyName()', function() {
			expect('Test DisplayName').toEqual(dashboardMgr.getDisplayName({displayName: 'Test DisplayName'}));
			expect('Test DisplayName').toEqual(dashboardMgr.getDisplayName({displayName: 'Test DisplayName', from: {addr: "Test FromAddress"}}));
			expect('Test DisplayName').toEqual(dashboardMgr.getDisplayName({displayName: 'Test DisplayName', from: {name: 'Test FromName', addr: "Test FromAddress"}}));
			expect('Test FromName').toEqual(dashboardMgr.getDisplayName({from: {name: 'Test FromName'}}));
			expect('Test FromName').toEqual(dashboardMgr.getDisplayName({from: {name: 'Test FromName', addr: 'Test FromAddress'}}));
			expect('Test FromName').toEqual(dashboardMgr.getDisplayName({displayName: undefined, from: {name: 'Test FromName', addr: 'Test FromAddress'}}));
			expect('Test FromName').toEqual(dashboardMgr.getDisplayName({displayName: '', from: {name: 'Test FromName', addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({from: {addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({from: {name: undefined, addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({from: {name: '', addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({displayName: undefined, from: {addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({displayName: '', from: {addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({displayName: undefined, from: {name: undefined, addr: 'Test FromAddress'}}));
			expect('Test FromAddress').toEqual(dashboardMgr.getDisplayName({displayName: '', from: {name: '', addr: 'Test FromAddress'}}));
			
			expect('').toEqual(dashboardMgr.getDisplayName({}));
			expect('').toEqual(dashboardMgr.getDisplayName({displayName: ''}));
			expect('').toEqual(dashboardMgr.getDisplayName({displayName: undefined}));
			expect('').toEqual(dashboardMgr.getDisplayName({from: {name: undefined}}));
			expect('').toEqual(dashboardMgr.getDisplayName({from: {name: ''}}));
			expect('').toEqual(dashboardMgr.getDisplayName({from: {addr: undefined}}));
			expect('').toEqual(dashboardMgr.getDisplayName({from: {addr: ''}}));
			expect('').toEqual(dashboardMgr.getDisplayName({displayName: undefined, from: {name: undefined, addr: undefined}}));
		});
		
		it('test DashboardManager.getDisplayText() for SMS messages', function() {
			// test empty message
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: undefined}));
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: ''}));
			
			// test regular strings
			expect('hi').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'hi'}));
			expect("I'm happy").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: "I'm happy"}));
			expect('"quote"').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&quot;quote&quot;'}));
			expect('\/+123()%"=&-456$!:\'*789#?;_<>[\\]^`{|}$').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '\/+123()%&quot;=&amp;-456$!:\'*789#?;_&lt;&gt;[\\]^`{|}$'}));
			expect('1 && 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '1 &amp;&amp; 2'}));
			expect('I <3 u').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'I &lt;3 u'}));
			expect('1<2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '1&lt;2'}));
			expect('1 < 2 && 3 > 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '1 &lt; 2 &amp;&amp; 3 &gt; 2'}));
			expect('日本  今天  tänään  今日の  오늘').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '日本\r 今天\r tänään\r 今日の\r 오늘'}));
			
			//test urls
			expect('www.hp.com').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'www.hp.com'}));
			expect('http:\/\/www.hp.com\/params?val1&val2#section1').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'http:\/\/www.hp.com\/params?val1&amp;val2#section1'}));
			
			// test html tags
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;a href=&quot;www.hp.com&quot;&gt;check it out&lt;\/a&gt;'}));
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;a href=&quot;www.hp.com&quot;&gt;check\rit\nout&lt;\/a&gt;'}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: "&lt;a href='www.hp.com'&gt;check it out&lt;\/a&gt;"}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: "&lt;a href='www.hp.com'&gt;check\rit\nout&lt;\/a&gt;"}));
			expect('<b>:p<\/b>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '<b>:p<\/b>'}));
			expect('<script type="text\/javascript">run it<\/script>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;script type=&quot;text\/javascript&quot;&gt;run it&lt;\/script&gt;'}));
			expect('<script type="text\/javascript">run it<\/script>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&amp;lt;script type=&quot;text\/javascript&quot;&amp;gt;run it&amp;lt;\/script&amp;gt;'}));
			expect('<body> :) </body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;body&gt; :) &lt;\/body&gt;'}));
			expect('<body>:)</body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;body&gt;:)&lt;\/body&gt;'}));
			expect('<meta name="some_id" content="1234"\/>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;meta name=&quot;some_id&quot; content=&quot;1234&quot;\/&gt;'}));
			expect('<!--[if item some-browser]><link rel="stylesheet" type="text\/css" href="\/.element\/css\/3.0\/some-browser.css"><!-- with other --><![endif]-->').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;!--[if item some-browser]&gt;&lt;link rel=&quot;stylesheet&quot; type=&quot;text\/css&quot; href=&quot;\/.element\/css\/3.0\/some-browser.css&quot;&gt;&lt;!-- with other --&gt;&lt;![endif]--&gt;'}));
			expect('<!doctype html public "-\/qw3c\/\/did html 4.01 transitional\/en" "http:\/\/some.dtd"><html lang="en"><head><title>hp<\/title><meta htp-equiv="refresh" content="1800;url=?refresh=1"><\/head><\/html>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: '&lt;!doctype html public &quot;-\/qw3c\/\/did html 4.01 transitional\/en&quot; &quot;http:\/\/some.dtd&quot;&gt;&lt;html lang=&quot;en&quot;&gt;&lt;head&gt;&lt;title&gt;hp&lt;\/title&gt;&lt;meta htp-equiv=&quot;refresh&quot; content=&quot;1800;url=?refresh=1&quot;&gt;&lt;\/head&gt;&lt;\/html&gt;'}));
			
			// test line breaks
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'hi\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'hi\nbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'hi\\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.smsmessage:1', messageText: 'hi\\nbye'}));
		});
		
		it('test DashboardManager.getDisplayText() for gtalk IM messages', function() {
			// test empty message
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: undefined}));
			// the following case can happen if you try to send a html tag from a yahoo client 
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: ''}));
			
			// test regular strings
			expect('hi').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'hi'}));
			expect("I'm happy").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: "I&apos;m happy"}));
			expect('"quote"').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '"quote"'}));
			expect('\/+123()%"=&-456$!:\'*789#?;_<>[\\]^`{|}$').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '\/+123()%\"=&-456$!:\'*789#?;_<>[\\]^`{|}$'}));
			expect('1 && 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '1 && 2'}));
			expect('1 &amp;&amp; 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '1 &amp;&amp; 2'}));
			expect('日本  今天  tänään  今日の  오늘').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '日本\r 今天\r tänään\r 今日の\r 오늘'}));
			
			//test urls
			expect('www.hp.com').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'www.hp.com'}));
			expect('http:\/\/www.hp.com\/params?val1&val2#section1').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'http:\/\/www.hp.com\/params?val1&val2#section1'}));
			
			// test html tags
			/* the following test cases won't happen since the libpurple transport will stripe these html tags
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<a href=&quot;www.hp.com&quot;>check it out<\/a>'}));
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<a href=&quot;www.hp.com&quot;>check\rit\nout<\/a>'}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: "<a href='www.hp.com'>check it out<\/a>"}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: "<a href='www.hp.com'>check\rit\nout<\/a>"}));
			expect('<body>:)</body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<body>:)<\/body>'}));
			expect('<body> :) </body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<body> :) <\/body>'}));
			*/
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<b>:p<\/b>'}));
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<i>:p<\/i>'}));
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '<u>:p<\/u>'}));
			/* the following message text won't happen for libpurple transport yet since the sanitize routine will take out any characters starting from the first less than sign '<' for incomplete html tag.
			expect('I <3 u').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'I &lt;3 u'}));
			expect('1<2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '1&lt;2'}));
			expect('1 < 2 && 3 > 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '1 &lt; 2 &amp;&amp; 3 &gt; 2'}));
			*/
			expect('&lt;script type=\"text\/javascript\"&gt;run it&lt;\/script&gt;').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: '&lt;script type=\"text\/javascript\"&gt;run it&lt;\/script&gt;'}));
			
			// test line breaks
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'hi\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'hi\nbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'hi\\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.libpurple:1', messageText: 'hi\\nbye'}));
		});
		
		it('test DashboardManager.getDisplayText() for skype IM messages', function() {
			// test empty message
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: undefined}));
			// the following case can happen if you try to send a html tag from a yahoo client 
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: ''}));
			
			// test regular strings
			expect('hi').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'hi'}));
			expect("I'm happy").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: "I&apos;m happy"}));
			expect('"quote"').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '"quote"'}));
			expect('\/+123()%"=&-456$!:\'*789#?;_<>[\\]^`{|}$').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '\/+123()%\"=&-456$!:\'*789#?;_<>[\\]^`{|}$'}));
			expect('1 && 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '1 && 2'}));
			expect('1 &amp;&amp; 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '1 &amp;&amp; 2'}));
			expect('日本  今天  tänään  今日の  오늘').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '日本\r 今天\r tänään\r 今日の\r 오늘'}));
			
			//test urls
			expect('www.hp.com').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'www.hp.com'}));
			expect('http:\/\/www.hp.com\/params?val1&val2#section1').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'http:\/\/www.hp.com\/params?val1&val2#section1'}));
			
			// test html tags
			/* the following test cases won't happen since the skype transport will stripe these html tags
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<a href=&quot;www.hp.com&quot;>check it out<\/a>'}));
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<a href=&quot;www.hp.com&quot;>check\rit\nout<\/a>'}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: "<a href='www.hp.com'>check it out<\/a>"}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: "<a href='www.hp.com'>check\rit\nout<\/a>"}));
			expect('<body>:)</body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<body>:)<\/body>'}));
			expect('<body> :) </body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<body> :) <\/body>'}));
			*/
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<b>:p<\/b>'}));
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<i>:p<\/i>'}));
			expect(':p').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '<u>:p<\/u>'}));
			/* the following message text won't happen for skype transport yet since the sanitize routine will take out any characters starting from the first less than sign '<' for incomplete html tag.
			expect('I <3 u').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'I &lt;3 u'}));
			expect('1<2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '1&lt;2'}));
			expect('1 < 2 && 3 > 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '1 &lt; 2 &amp;&amp; 3 &gt; 2'}));
			*/
			expect('&lt;script type=\"text\/javascript\"&gt;run it&lt;\/script&gt;').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: '&lt;script type=\"text\/javascript\"&gt;run it&lt;\/script&gt;'}));
			
			// test line breaks
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'hi\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'hi\nbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'hi\\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.skypem:1', messageText: 'hi\\nbye'}));
		});
		
		it('test DashboardManager.getDisplayText() for yahoo IM messages', function() {
			// test empty message
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: undefined}));
			// the following case can happen if you try to send a html tag from a yahoo client 
			expect('').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: ''}));
			
			// test regular strings
			expect('hi').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'hi'}));
			expect("I'm happy").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: "I'm happy"}));
			expect('"quote"').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '&quot;quote&quot;'}));
			expect('\/+123()%"=&-456$!:\'*789#?;_>[\\]^`{|}$').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '\/+123()%&quot;=&amp;-456$!:\'*789#?;_&gt;[\\]^`{|}$'}));
			expect('1 && 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '1 &amp;&amp; 2'}));
			expect('日本  今天  tänään  今日の  오늘').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '日本\r 今天\r tänään\r 今日の\r 오늘'}));
			
			//test urls
			expect('www.hp.com').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'www.hp.com'}));
			expect('http:\/\/www.hp.com\/params?val1&val2#section1').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'http:\/\/www.hp.com\/params?val1&amp;val2#section1'}));
			
			/* yahoo server stripes out any html tags or remove any text beyond a less than sign, so the following tests are not relavent to yahoo messages 
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '&lt;a href=&quot;www.hp.com&quot;&gt;check it out&lt;\/a&gt;'}));
			expect('<a href="www.hp.com">check it out</a>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '&lt;a href=&quot;www.hp.com&quot;&gt;check\rit\nout&lt;\/a&gt;'}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: "&lt;a href='www.hp.com'&gt;check it out&lt;\/a&gt;"}));
			expect("<a href='www.hp.com'>check it out</a>").toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: "&lt;a href='www.hp.com'&gt;check\rit\nout&lt;\/a&gt;"}));
			expect('<b>:p<\/b>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '<b>:p<\/b>'}));
			expect('I <3 u').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'I &lt;3 u'}));
			expect('1<2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '1&lt;2'}));
			expect('1 < 2 && 3 > 2').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '1 &lt; 2 &amp;&amp; 3 &gt; 2'}));
			expect('<script type="text\/javascript">run it<\/script>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '&amp;lt;script type=&quot;text\/javascript&quot;&amp;gt;run it&amp;lt;\/script&amp;gt;'}));
			expect('<body>:)</body>').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: '&lt;body&gt;:)&lt;\/body&gt;'}));
			*/
			
			// test line breaks
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'hi\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'hi\nbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'hi\\rbye'}));
			expect('hi bye').toEqual(dashboardMgr.getDisplayText({_kind: 'com.palm.immessage.yahoo:1', messageText: 'hi\\nbye'}));
		});
		
		it('test DashboardManager.matchFilter()', function() {
			var filter, threads;
			
			// undefined filter, undefined thread list
			expect(dashboardMgr.matchFilter(filter, threads)).toBeTruthy();
			
			// no threads to be matched, undefined thread list
			filter = {};
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
			// undefined filter, empty thread list
			filter = undefined;
			threads = [];
			expect(dashboardMgr.matchFilter(filter, threads)).toBeTruthy();
			
			// no threads to be matched, empty thread list
			filter = {};
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
			// filter contains a thread id, empty thread list
			filter.thread = "++Aaaaa+Aaaaaaaaa";
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
			// undefined filter, thread list with one thread
			filter = undefined;
			threads = ["++Aaaaa+Aaaaaaaaa"];
			expect(dashboardMgr.matchFilter(filter, threads)).toBeTruthy();
			
			// no threads to be matched, empty thread list
			filter = {};
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
			// filter contains a thread id, empty thread list
			filter.thread = "++Aaaaa+Aaaaaaaaa";
			expect(dashboardMgr.matchFilter(filter, threads)).toBeTruthy();
			
			// filter doesn't have a thread to filter
			filter = {};
			threads = ["++Aaaaa+Aaaaaaaaa","++Bbbbb+Bbbbbbbb","++Ccccc+Cccccccc"];
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
			// filter contains a thread id that is found in the thread list
			filter.thread = "++Bbbbb+Bbbbbbbb";
			expect(dashboardMgr.matchFilter(filter, threads)).toBeTruthy();
			
			// filter contains a thread id that is not found in the thread list
			filter.thread = "++Ddddd+Dddddddd";
			expect(dashboardMgr.matchFilter(filter, threads)).toBeFalsy();
			
		});
		
		it ('test DashboardManager.getSoundOptions()', function() {
			expect(dashboardMgr.getSoundOptions()).toBeUndefined();
			expect(dashboardMgr.getSoundOptions({})).toBeUndefined();
			expect(dashboardMgr.getSoundOptions({notificationSound: "mute"})).toBeUndefined();
			expect(dashboardMgr.getSoundOptions({notificationSound: "bad setting"})).toBeUndefined();
			
			expect({
				soundClass: enyo.messaging.message.SOUND_CLASSES.RINGTON,
				soundPath: enyo.messaging.utils.getAppRootPath() + enyo.messaging.message.SOUND_PATHS.RECEIVED
			}).toEqual(dashboardMgr.getSoundOptions({notificationSound: "system"}));
			
			expect({
				soundClass: enyo.messaging.message.SOUND_CLASSES.VIBRATE
			}).toEqual(dashboardMgr.getSoundOptions({notificationSound: "vibrate"}));
			
			expect({
				soundClass: enyo.messaging.message.SOUND_CLASSES.RINGTON,
				soundPath: '/path/to/ringtone.mp3'
			}).toEqual(dashboardMgr.getSoundOptions({notificationSound: "ringtone", ringtone: {fullPath: '/path/to/ringtone.mp3'}}));
		});
	});
});

function getPrefsWithNotificationEnabled() {
	return {
		"_id": "++HXSkRO5AdWbXfk",
		"_kind": "com.palm.app.messagingprefs:1",
		"_rev": 0,
		"_sync": true,
		"enableNotification": true,
		"firstUseMode": false,
		"isHistoryViewSelected": true,
		"notificationSound": "system",
		"ringtone": {
			"fullPath": "",
			"name": ""
		},
		"showOnlineBuddiesOnly": false,
		"useImmediateMmsRetrieval": true
	};
};

function getPrefsWithNotificationDisabled() {
	return {
		"_id": "++HXSkRO5AdWbXfk",
		"_kind": "com.palm.app.messagingprefs:1",
		"_rev": 0,
		"_sync": true,
		"enableNotification": false,
		"firstUseMode": false,
		"isHistoryViewSelected": true,
		"notificationSound": "system",
		"ringtone": {
			"fullPath": "",
			"name": ""
		},
		"showOnlineBuddiesOnly": false,
		"useImmediateMmsRetrieval": true
	};
};

function getOnDisplayStatus() {
	return {
	    "returnValue": true,
	    "event": "displayOn",
	    "state": "on",
	    "timeout": 300,
	    "blockDisplay": "false",
	    "active": false,
	    "subscribed": false
	};
};

function getOffDisplayStatus() {
	return {
		"returnValue": true,
		"event": "displayOff",
		"state": "on",
		"timeout": 300,
		"blockDisplay": "false",
		"active": false,
		"subscribed": false
	};
};

function getNewMessagesWithoutConversations() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getNewMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getDashboardLayerForNewMessage1() {
	return {
		_message: {
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		_from: "testSender",
		title: "testSender",
		text: "test message 1",
		icon: "images/notification-large-messaging.png"
	};
};

function getDashboardLayerForNewMessage2() {
	return {
		_message: {
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		_from: "verifySender",
		text: "verify message 1",
		title: "verifySender",
		icon: "images/notification-large-messaging.png"
	};
};

function getReadNewMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 3,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": true
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 3,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 4,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": true
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 4,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getMixedNewMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 3,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": true
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 3,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
	
};

function getNewerMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getReadNewerMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 13,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": true
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 13,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 14,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": true
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 14,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getNewestMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++55555555555555",
			"_kind": "com.palm.message:1",
			"_rev": 21,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 21,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		{
			"_id": "++66666666666666",
			"_kind": "com.palm.message:1",
			"_rev": 22,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 1",
			"readRevSet": 22,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getOutboxMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "outbox",
			"from": {
				"_id": "156a6",
				"addr": "testUsername@test.com"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 6",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"addr": "testSender"
			}],
			"username": "testUsername@test.com"
		}]
	};
};

function getInvalidInboxMessages() {
	return {
		"returnValue": true,
		"results": [{
			"_id": "++88888888888888",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "pending",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000000",
			"_kind": "com.palm.message:1",
			"_rev": 3,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 3,
			"serviceName": "type_service",
			"status": "failed",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000001",
			"_kind": "com.palm.message:1",
			"_rev": 4,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 4,
			"serviceName": "type_service",
			"status": "permanent-fail",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000001",
			"_kind": "com.palm.message:1",
			"_rev": 5,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"errorCode": "err-15",
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 5,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000003",
			"_kind": "com.palm.message:1",
			"_rev": 6,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false,
				"visible": true
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 6,
			"serviceName": "successful",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000004",
			"_kind": "com.palm.message:1",
			"_rev": 7,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"noNotification": true
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 7,
			"serviceName": "successful",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, {
			"_id": "++90000000000004",
			"_kind": "com.palm.message:1",
			"_rev": 8,
			"_sync": true,
			"accepted": "true",
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 8,
			"serviceName": "successful",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}]
	};
};