FwdbckAssistant = Class.create({
	initialize : function() {	
	},

	setup: function() {

		this.model = {
			buttonLabel : "Disable Event Stopping",
			buttonClass: ''
		};
				
		this.controller.setupWidget('button', this.attributes, this.model);
		this.enableStopping = true;
		this.backHandler = this.backHandler.bind(this);
		this.controller.listen(this.controller.get('button'), Mojo.Event.tap, this.backHandler);

	},
	
	backHandler: function(event) {
		this.enableStopping = false;
	},

	handleCommand: function(event) {
		if(this.enableStopping) {
			event.stop();
			Mojo.Log.info(event.type);
			this.controller.get('dummyLogger').innerHTML = event.type;
		}
	}
	
});
