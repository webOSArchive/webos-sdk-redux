describe('Messaging AccountService Test', function() {
	it('should find account icon', function(){
		var obj = new accountService();
		
		var fakeData = getJson('accountService');
		expect(fakeData).toBeTruthy();	
		expect(obj).toBeTruthy();	
		expect(obj.$.listAccounts).toBeTruthy();	
		spyOn(obj.$.listAccounts, 'getAccounts').andCallFake(function() {
			obj.gotAccounts(enyo.WebService, fakeData);
		});
		
		obj.getAccounts();
		
		expect(obj.data).toBeTruthy();
		expect(obj.data.length).toEqual(3);
		expect(obj.getCleanedImAccounts()).toBeTruthy();
		//getChatWithNonBuddies return true only for google
		expect(obj.getChatWithNonBuddies("type_yahoo")!== true).toBeTruthy();
		expect(obj.getChatWithNonBuddies("type_yahoo") === undefined).toBeTruthy();
		expect(obj.getChatWithNonBuddies("type_aim")!== true).toBeTruthy();
		expect(obj.getChatWithNonBuddies("type_aim") === undefined).toBeTruthy();
		expect(obj.getIcons("type_yahoo")).toBeTruthy();
		expect(obj.getIcons("type_gtalk")).toBeFalsy();
		expect(obj.getDbKinds("type_yahoo")).toBeTruthy();
		expect(obj.getDbKinds("type_yahoo").imcommand === "com.palm.imcommand.yahoo:1").toBeTruthy();
		expect(obj.getDbKinds("type_yahoo").immessage === "com.palm.immessage.yahoo:1").toBeTruthy();
		expect(obj.getAccountTemplates()).toBeTruthy();
		expect(obj.getAccount("type_yahoo","palm_test8@yahoo.com")).toBeTruthy();
		expect(obj.getAccount("type_yahoo","palm_test8")).toBeFalsy();

		expect(obj.getMyAccountTypesHash()).toBeTruthy();
		expect(obj.getImCommandKind()).toBeTruthy();
		expect(obj.getImCommandKind("type_yahoo")=== "com.palm.imcommand.yahoo:1").toBeTruthy();
		expect(obj.getImCommandKind()=== "com.palm.imcommand:1").toBeTruthy();
		expect(obj.getImAccounts()).toBeTruthy();
		
		
	});	
})