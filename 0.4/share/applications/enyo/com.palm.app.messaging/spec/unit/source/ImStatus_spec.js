describe('Messaging ImStatus Unit Test', function() {

	it('ImStatus.getStatusClass() Test', function() {		
		var imStatus = new ImStatus();
		expect(imStatus).toBeTruthy();
		
		expect(imStatus.getStatusClass("available")).toEqual("status-available");
		expect(imStatus.getStatusClass("away")).toEqual("status-away");
		expect(imStatus.getStatusClass("invisible")).toEqual("status-invisible");
	    expect(imStatus.getStatusClass("offline")).toEqual("status-offline");
	});	
	
	it('Should show invisible status or not?', function() {
		var popup = new AccountLoginStatesPopup();
		expect(popup).toBeTruthy();
		
		// expect to be truthy
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true}])).toBeTruthy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true},{supportsInvisibleStatus: true}])).toBeTruthy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true},{supportsInvisibleStatus: true},{supportsInvisibleStatus: true},{supportsInvisibleStatus: true}])).toBeTruthy();
		
		// expect to be falsy
		expect(popup.shouldShowAllAccountsInvisibleStatus(undefined)).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: false}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: false},{supportsInvisibleStatus: false}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: false},{supportsInvisibleStatus: false},{supportsInvisibleStatus: false}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true},{supportsInvisibleStatus: false}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: false},{supportsInvisibleStatus: true}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true},{supportsInvisibleStatus: false},{supportsInvisibleStatus: false}])).toBeFalsy();
		expect(popup.shouldShowAllAccountsInvisibleStatus([{supportsInvisibleStatus: true},{supportsInvisibleStatus: true},{supportsInvisibleStatus: false}])).toBeFalsy();
	});
})