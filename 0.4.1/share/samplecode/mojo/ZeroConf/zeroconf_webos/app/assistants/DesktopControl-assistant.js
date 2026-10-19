function DesktopControlAssistant(argFromPusher) {
    this.webserviceURL = argFromPusher;
}

DesktopControlAssistant.prototype = {
	setup: function(args) {
		Ares.setupSceneAssistant(this);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
	button1Tap: function(inSender, event) {
		var request = new Ajax.Request(this.webserviceURL+"moveMouse?action=center", {
			method: 'post',
			onComplete: function() { console.log("completed"); },
			onFailure: function() { console.log("failed"); }
		});
	},
	button4Tap: function(inSender, event) {
		var request = new Ajax.Request(this.webserviceURL+"moveMouse?action=up", {
			method: 'post',
			onComplete: function() { console.log("completed"); },
			onFailure: function() { console.log("failed"); }
		});
		
	},
	button5Tap: function(inSender, event) {
		var request = new Ajax.Request(this.webserviceURL+"moveMouse?action=down", {
			method: 'post',
			onComplete: function() { console.log("completed"); },
			onFailure: function() { console.log("failed"); }
		});		
	},
	button6Tap: function(inSender, event) {
		var request = new Ajax.Request(this.webserviceURL+"moveMouse?action=left", {
			method: 'post',
			onComplete: function() { console.log("completed"); },
			onFailure: function() { console.log("failed"); }
		});
	},
	button7Tap: function(inSender, event) {
				var request = new Ajax.Request(this.webserviceURL+"moveMouse?action=right", {
			method: 'post',
			onComplete: function() { console.log("completed"); },
			onFailure: function() { console.log("failed"); }
		});
	}
};