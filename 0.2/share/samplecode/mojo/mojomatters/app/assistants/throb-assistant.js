ThrobAssistant = Class.create({
	initialize : function() {	
	},

	setup: function() {

		this.model = {
			buttonLabel : "start Throb ",
			buttonClass: ''
		};
		
		this.model2 = {
			buttonLabel : "stop Throb",
			buttonClass: ''
		};
		
		this.controller.setupWidget('button', this.attributes, this.model);
		this.controller.setupWidget('button2', this.attributes2, this.model2);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.controller.get('button'), Mojo.Event.tap, this.tapped.bind(this));
		this.controller.listen(this.controller.get('button2'), Mojo.Event.tap, this.tapped2.bind(this));
	},
	
	tapped: function(event) {
		Mojo.Controller.stageController.indicateNewContent(true);
		Mojo.Log.info(Mojo.Controller.stageController.hasNewContent());
	},
	tapped2: function(event) {
		Mojo.Controller.stageController.indicateNewContent(false);
		Mojo.Log.info(Mojo.Controller.stageController.hasNewContent());
	}


	
});
