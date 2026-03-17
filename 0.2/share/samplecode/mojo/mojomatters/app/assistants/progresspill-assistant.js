/*
	The progress pill is really just a display, reflecting whatever the latest change to its model
	tells it to display. The mechanisms for making it update are entirely external. In this example we 
	have an interval that increases its fillitude periodically until it is full, then stops. 
*/

ProgresspillAssistant = Class.create( FLibExample, {

	setup: function() {
		this.setupMenus({
			header: 'Progress Pill'
		});
		
		// Store references for later, reducing the usage of controller.get()
		this.pill = this.controller.get('progressPill');
		
		// Bind response handlers once, ahead of time
		this.startProgress = this.startProgress.bindAsEventListener(this, 0);
		this.progressDone = this.progressDone.bind(this);
		this.updateProgress = this.updateProgress.bind(this);
		
		this.reset = this.reset.bind(this);
		
		this.controller.setupWidget('progressPill', this.attributes, this.model);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('progressPill', Mojo.Event.tap, this.startProgress);
		this.controller.listen('progressPill', Mojo.Event.progressComplete, this.progressDone);
		this.controller.listen('progressPill', Mojo.Event.progressIconTap, this.reset);
		
	},
	
	cleanup: function(){
		this.controller.stopListening('progressPill', Mojo.Event.tap,this.startProgress);
		this.controller.stopListening('progressPill', Mojo.Event.progressComplete,this.progressDone);
		this.controller.stopListening('progressPill', Mojo.Event.progressIconTap, this.reset);
		
		this.stopProgress();
	},
	
	progressDone: function() {
		this.model.progress = undefined;
		this.controller.modelChanged(this.model);
	},

	reset: function(e) {
		this.progress = 1;
		this.updateProgress();
	 	this.stopProgress();
	},
	
	stopProgress: function() {
		if (this.updater) {
			this.stopped = true;
			Mojo.Log.info("Updater we clear is " + Object.toJSON(this.updater))
			this.controller.window.clearInterval(this.updater);
			delete this.updater;	
		}		
	},

	startProgress: function(e, inProgress) {
		
		// The following is a hack around a bug where ProgressIconTap events also issue Tap events
		if(e.target.className == ("actiontype-icon action-icon")){
			return;
		}
		
		this.stopped = undefined;
		if (!this.updater) {
			this.updater = this.controller.window.setInterval(this.updateProgress, 600);
			
			Mojo.Log.info("Updater we set was " + Object.toJSON(this.updater))
		}
		if (inProgress !== undefined) {
			this.progress = inProgress;
		}		
	},

	// Called by our assistant in regular intervals to move things along
	updateProgress: function() {
		if (this.stopped) {
			return;
		}
		
		// Check for overflow, stop progress when done
		if (this.progress > 1) {
			this.progress = 1;
			Mojo.Log.info("SET TO 1");
			this.model.progress = this.progress;
			this.controller.modelChanged(this.model);
			this.stopProgress();
			return;
		}
		
		this.model.progress = this.progress;
		this.controller.modelChanged(this.model);
		this.progress += .1;
		
	},
	
	attributes: {
		content: content,
		title: 'Baking...',
		modelProperty: 'progress',
	},
	model: {
		icon: "action-icon",
		cancellable: true
	}
	

});


var content = Mojo.View.render({template: 'progresspill/entry'});