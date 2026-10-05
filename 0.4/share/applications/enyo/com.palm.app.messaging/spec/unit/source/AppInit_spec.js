describe('Messaging AppInit Unit Test', function() {
	
	it('PrefsHandler Instantiation Test', function() {		
		expect(new PrefsHandler()).toBeDefined();
	});	

	it('accountService Instantiation Test', function() {		
		expect(new accountService()).toBeDefined();
	});	

	it('MessageDashboardManager Instantiation Test', function() {
		enyo.application.prefsHandler = new PrefsHandler();
		expect(new MessageDashboardManager()).toBeDefined();
	});	

	it('InviteDashboardManager Instantiation Test', function() {
		enyo.application.prefsHandler = new PrefsHandler();
		expect(new InviteDashboardManager()).toBeDefined();
	});	

	it('Class0AlertManager Instantiation Test', function() {		
		expect(new Class0AlertManager()).toBeDefined();
	});	

	it('InviteWatcher Instantiation Test', function() {		
		expect(new InviteWatcher()).toBeDefined();
	});	

	it('TelephonyService Instantiation Test', function() {		
		expect(new TelephonyService()).toBeDefined();
	});	

	it('AppInit Instantiation Test', function() {
		var appInit = new AppInit();
		expect(appInit).toBeDefined();
	
		appInit.init();
		expect(enyo.application.prefsHandler).toBeDefined();
		expect(enyo.application.accountService).toBeDefined();
		expect(enyo.application.messageDashboardManager).toBeDefined();
		expect(enyo.application.inviteDashboardManager).toBeDefined();
		expect(enyo.application.class0AlertManager).toBeDefined();
		expect(enyo.application.inviteWatcher).toBeDefined();	
		expect(enyo.application.telephonyWatcher).toBeDefined();
	});
})