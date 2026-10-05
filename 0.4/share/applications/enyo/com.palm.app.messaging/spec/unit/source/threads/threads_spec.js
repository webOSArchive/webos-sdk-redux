describe('Messaging Threads Unit Test', function() {
	
	var threadList = new ThreadList();
	var threadItem = new ThreadItem();
	
	it('ThreadItem.getStatusClassName() Test', function() {
		expect(threadItem).toBeTruthy();	

		expect(threadItem.getStatusClassName()).toBeTruthy();
    	expect(threadItem.getStatusClassName() === "status").toBeTruthy();
		expect(threadItem.getStatusClassName(undefined)).toBeTruthy();
    	expect(threadItem.getStatusClassName(undefined) === "status").toBeTruthy();
		expect(threadItem.getStatusClassName(null)).toBeTruthy();
    	expect(threadItem.getStatusClassName(null) === "status").toBeTruthy();
		expect(threadItem.getStatusClassName({})).toBeTruthy();
    	expect(threadItem.getStatusClassName({}) === "status").toBeTruthy();

		expect(threadItem.getStatusClassName({"offline":true})).toBeTruthy();
 		expect(threadItem.getStatusClassName({"offline":true}) === "status status-offline").toBeTruthy();

		expect(threadItem.getStatusClassName({"offline":false})).toBeTruthy();
 		expect(threadItem.getStatusClassName({"offline":false}) === "status").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":0}) === "status status-available").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":1}) === "status status-available-partial").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":2}) === "status status-away").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":3}) === "status status-invisible").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":4}) === "status status-offline").toBeTruthy();
    	expect(threadItem.getStatusClassName({"offline":false, "availability":5}) === "status").toBeTruthy();
	});	
	it('ThreadItem.getThreadSummary() Test', function() {
		var testSummary = "<a href=\"www.google.com\">link</a>";
		expect(threadItem.getThreadSummary({summary:testSummary, replyService: "mms"}) === enyo.messaging.message.getMMSThreadSummary()).toBeTruthy();
		expect(threadItem.getThreadSummary({replyService: "mms"}) === enyo.messaging.message.getMMSThreadSummary()).toBeTruthy();
		expect(threadItem.getThreadSummary({})).toBeFalsy();
		expect(threadItem.getThreadSummary({summary:testSummary, flags:{outgoing: true}}) === enyo.string.escapeHtml(testSummary)).toBeTruthy();
		expect(threadItem.getThreadSummary({summary:testSummary, flags:{outgoing: false}}) === testSummary).toBeTruthy();
	});	
	it('ThreadItem.isThreadSelected() Test', function() {
		enyo.application.appInit = new AppInit();
		enyo.application.appInit.init();
		enyo.application.selectedThread = undefined;
		enyo.application.messageDashboardManager.setAppDeactivated(true);	
		expect(threadItem.isThreadSelected({})).toBeFalsy();
		expect(threadItem.isThreadSelected({_id:"1"})).toBeFalsy();
		enyo.application.selectedThread = {_id:"1"};
		expect(threadItem.isThreadSelected({_id:"1"})).toBeFalsy();
		enyo.application.messageDashboardManager.setAppDeactivated(false);	
		expect(threadItem.isThreadSelected({_id:"1"})).toBeTruthy();
		expect(threadItem.isThreadSelected({_id:"2"})).toBeFalsy();

	});		
	it('DeleteThreadService.getMergeParams() Test', function() {
		var deleteThreadService = new DeleteThreadService();
		expect(deleteThreadService).toBeTruthy();	
		
		var msg1 = {
            "_id": "++HcNTywfKNiYcPm",
            "conversations": [
                "chatthreadId1"
            ]
        };
		var msg2 = {
            "_id": "++HcNTywfKNiYcPm",
            "conversations": [
                "chatthreadId1",
                "chatthreadId2"
            ]
        };
		var msg3 = {
            "_id": "++HcNTywfKNiYcPm",
            "conversations": [
                "chatthreadId1",
                "chatthreadId2",
                "chatthreadId3"
            ]
        };
		deleteThreadService.id = "chatthreadId1";	
		expect(deleteThreadService.getMergeParams(msg1)).toBeFalsy();	
		expect(deleteThreadService.getMergeParams(msg2).objects).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg2).objects[0]).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg2).objects[0].conversations).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg2).objects[0].conversations.length === 1).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg2).objects[0].conversations[0] === msg2.conversations[1]).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg3).objects).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg3).objects[0].conversations).toBeTruthy();	
		expect(deleteThreadService.getMergeParams(msg3).objects[0].conversations.length === 2).toBeTruthy();	

	});	
})