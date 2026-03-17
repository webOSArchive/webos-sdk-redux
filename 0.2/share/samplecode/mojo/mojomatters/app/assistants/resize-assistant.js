ResizeAssistant = Class.create({
	setup: function() {
		Mojo.Log.info("SETUP CALLED ONCE");
		this.resize = this.resize.bind(this);
		Mojo.Event.listen(this.controller.window, 'resize', this.resize);
	},
	
	cleanup: function() {
		Mojo.Event.stopListening(this.controller.window, 'resize', this.resize);
	},

	resize: function() {
		Mojo.Log.info("RESIZE CALLED HERE");
	},
});