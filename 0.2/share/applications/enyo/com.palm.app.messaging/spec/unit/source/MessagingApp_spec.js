describe('Messaging MessagingApp Unit Test', function() {
	
	it('MessagingApp.getRemovedAccount() Test', function() {
		var appInit = new AppInit();
		appInit.init();
		var messagingApp = new enyo.MessagingApp();

		expect(messagingApp).toBeDefined();
		
		var imAccounts;
		expect(messagingApp.getRemovedAccount(imAccounts)).toBeNull();
		
		imAccounts = [{"accountId":"One"}, 
		              {"accountId":"Two"},
		              {"accountId":"Three"},
		              {"accountId":"Four"}
		             ];
		expect(messagingApp.getRemovedAccount(imAccounts)).toBeNull();
		
		imAccounts = [{"accountId":"One"}, 
		              {"accountId":"Two"},
		              {"accountId":"Four"}
		              ];
		expect(messagingApp.getRemovedAccount(imAccounts)).toEqual({"accountId":"Three"});
		
		imAccounts = [{"accountId":"One"}, 
	                  {"accountId":"Two"},
	                  {"accountId":"Four"},
	                  {"accountId":"Five"}
	                 ];
	    expect(messagingApp.getRemovedAccount(imAccounts)).toBeNull();
	    
		imAccounts = [{"accountId":"Two"},
	                  {"accountId":"Four"},
	                  {"accountId":"Five"}
	                 ];
	    expect(messagingApp.getRemovedAccount(imAccounts)).toEqual({"accountId":"One"});	    
    });	

})
