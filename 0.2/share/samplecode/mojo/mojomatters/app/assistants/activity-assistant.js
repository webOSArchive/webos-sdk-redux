ActivityAssistant = Class.create({
	spinner: 'activity-spinner',

	setup: function() {
		
		// Set up view menu with scene header
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [{label: $L("Widgets » Activity Indicator")}]});
		
		this.toggleHandler = this.toggleSpin.bind(this);      
		this.atts = {
			onStart: 'Add Account',
			onActive: 'Verifying Settings',
			onComplete: 'Success!',
			activityFunction: this.activityMethod.bind(this)
		/*	buttonContentTemplate: Mojo.Widget.getSystemTemplatePath('/button/button-content'),
			buttonLabelId: 'STEVE',
			activityContentTemplate: Mojo.Widget.getSystemTemplatePath('/button/activity-content'),
			activityContentId: 'BOB'*/
		};
		this.controller.setupWidget('button', this.atts, {});

	},

	activate: function() {
		if (ActivityAssistant.spinning) {
			$(this.spinner).mojo.start();
		}
		
	},                                                                 

	toggleSpin: function() {       
		if (ActivityAssistant.spinning) {
			$(this.spinner).mojo.stop();
			ActivityAssistant.spinning = false;
		} else {
			$(this.spinner).mojo.start();
			ActivityAssistant.spinning = true;
		}
	},
	
	activityMethod: function(callback) {
		Mojo.Log.info("this is the method to call on click of the button");
		var a = 1, b= 2, c = 3;
		window.setTimeout(callback.bind(this, this.callbackFunc.bind(this, a, b, c)), 1000);
	},
	
	callbackFunc: function(a, b, c) {
		Mojo.Log.info("got content back " + a + b + c);
	}

});

ActivityAssistant.spinning = false;