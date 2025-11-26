ScrollerpushtestAssistant = Class.create({
	setup: function() {
		this.popSceneTapHandler = this.popSceneTap.bind(this);
		this.controller.listen('nestedscroller-popscene', Mojo.Event.tap, this.popSceneTapHandler);
	},
	
	popSceneTap: function(event) {
		this.controller.stageController.popScene();
	},
	
});
