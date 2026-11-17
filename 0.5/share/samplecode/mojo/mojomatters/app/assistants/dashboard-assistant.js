DashboardAssistant = Class.create({
	
	initialize: function(messageText, date) {
		this.messageText = messageText;
		this.when = date;
		this.count = 1;
	},

	setup: function() {
		this.updateDisplay()
	},
	
	update: function(messageText, date) {
		this.messageText = messageText;
		this.when = date;
		this.count += 1;
		this.updateDisplay()
	},
	
	updateDisplay: function() {
		var props = {
			title: window.name, 
			text: this.messageText, 
			when: this.when, 
			times: this.count == 1 ? $L("time") : $L("times"),
			count: this.count
		};
		var messageText = Mojo.View.render({object: props, template: 'dashboard/dashboard-message'});
		var messageDiv = this.controller.get('dashboard-text');
		Element.update(messageDiv, messageText);
	},

});

