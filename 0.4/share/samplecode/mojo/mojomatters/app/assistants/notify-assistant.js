/*
	Notifications are handy. You can launch	and clear away any number of notifications from your one app,
	and they show things to your user without interupting them!
	
	Try that on other phones.
*/

NotifyAssistant = Class.create( FLibExample, {

	setup: function() {

		// Set up view menu with scene header
		this.setupMenus({
			header: 'Notifications'
		});
		
		// Store references needed in the scene
		this.appController = Mojo.Controller.getAppController();
		
		// Setup widgets used in this scene
		this.controller.setupWidget('message', this.textAttributes, this.textModel);

		// Bind and store references to event handlers ahead of time
		this.notify = this.notify.bind(this);
		this.delayedNotify = this.delayedNotify.bind(this);
		this.closeNotifications = this.closeNotifications.bind(this);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('notify_button', Mojo.Event.tap, this.notify);
		this.controller.listen('delayed_notify_button', Mojo.Event.tap, this.delayedNotify);
		this.controller.listen('close_notifications', Mojo.Event.tap, this.closeNotifications);
	},
	
	cleanup: function(){
		//	StopListening
		// Manually stop listening to events here, until the framework learns to do it on its own
		this.controller.stopListening('notify_button', Mojo.Event.tap, this.notify);
		this.controller.stopListening('delayed_notify_button', Mojo.Event.tap, this.delayedNotify);
		this.controller.stopListening('close_notifications', Mojo.Event.tap, this.closeNotifications);
	},

	notify: function(event) {
		var bannerParams, stageController;
		 
		this.controller.commitChanges();
		
		bannerParams = {
			soundClass: 'pirate', 
			soundFile: 'yaaar.wav', 
			icon: 'sailor.png',
			messageText: this.textModel.message
		};
		
		this.appController.showBanner(bannerParams, {banner: this.textModel.message});
		
		stageController = this.appController.getStageController(this.kDashboardStageName);
		if (stageController) {
			// Update existing banner
			stageController.delegateToSceneAssistant("update", this.textModel.message, new Date());
		} else {
			// Push new banner
			this.notificationCreatedHandler = this.notificationCreated.bind(this, this.textModel.message);
			this.appController.createStageWithCallback({name: this.kDashboardStageName, lightweight: true}, 
				this.notificationCreatedHandler, "dashboard");			
		}
	},
	
	delayedNotify: function(event) {
		this.notify.delay(0.5);
	},
	
	notificationCreated: function(text, stageController) {
		stageController.pushScene('dashboard', text, new Date());
	},

	closeNotifications: function(event) {
		this.appController.removeAllBanners();
		this.appController.closeStage(this.kDashboardStageName);
	},
	
	kDashboardStageName: "library-dashboard",
	textAttributes: {
		hintText: $L('Enter Message Here'),
		modelProperty: 'message',
		multiline: true,
		textFieldMode: 'sentence-case',
		focusMode: Mojo.Widget.focusSelectMode
	},
	textModel: {
		'message' : $L('Hello, sailor')
	}
	

});

