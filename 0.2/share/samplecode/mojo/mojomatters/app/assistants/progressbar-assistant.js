/*
	Simple progress indicator, animates a fluid change between states as you tell it what % fill to show
*/

ProgressbarAssistant = Class.create( FLibExample, {

	setup: function() {
		this.attr = {
			modelProperty: 'progress'
		};
		this.model = {
			progress: 0
		};
		
		// Bind handlers once, ahead of time
		this.updateProgress = this.updateProgress.bind(this);
		this.complete = this.complete.bind(this);
		this.reset = this.reset.bind(this);
		
		// Store references for later, reducing the usage of controller.get()
		this.bar = this.controller.get('progressBar');
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('progressBar', Mojo.Event.progressComplete, this.complete);
		this.controller.listen('resetButton', Mojo.Event.tap, this.reset);
		
		//setup a window timeout with an interval
		this.progress = 0;
		this.updater = window.setInterval(this.updateProgress, 600);
		
		// Setup the progress bar
		this.controller.setupWidget('progressBar', this.attr, this.model);
	},
	
	cleanup: function(){
		this.controller.stopListening('progressBar', Mojo.Event.progressComplete, this.complete);
		this.controller.stopListening('resetButton', Mojo.Event.tap, this.reset);
	},
	
	reset: function() {
		this.bar.mojo.reset();
	},
	

	updateProgress: function() {
		if (this.progress > 1) {
			window.clearInterval(this.updater);
		}
		this.model.progress = this.progress;
		this.controller.modelChanged(this.model);
		this.progress += .2;
		
	},
	
	cleanup: function() {
		window.clearInterval(this.updater);
	},
	
	complete: function() {
		Mojo.Log.info('The progress is done.');
	},

});