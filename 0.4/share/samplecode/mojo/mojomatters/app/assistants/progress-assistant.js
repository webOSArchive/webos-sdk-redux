/*
	The Progress bar is a progress pill made for use in lists, as it has that nice, listy shape
*/

ProgressAssistant = Class.create( FLibExample, {
    initialize: function(){
    
    },
    
    setup: function(){
		
		this.setupMenus({
			header: 'Progress Widget',
			commandMenu: {
				items: [{
					icon: 'new',
					submenu: 'progress-menu'
				}]
			}
		})
	
		// Bind callbacks once ahead of time
		this.updateProgress = this.updateProgress.bind(this);
		this.startUpdates = this.startUpdates.bind(this);
		this.tapped = this.tapped.bind(this);
		
		// Store references for later, reducing calls to controller.get()
		this.slider = this.controller.get('progressDiv');
		
		// Setup progress widget
     	this.controller.setupWidget('progressDiv', this.attributes, this.model);
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('progressDiv', Mojo.Event.progressIconTap, this.tapped);
		this.controller.listen('progressDiv', Mojo.Event.tap, this.startUpdates);
		
		this.controller.setupWidget('progress-menu', undefined, this.progressMenuModel);
	},
	
	tapped: function(e) {
		Mojo.Log.info("got event and a model " + e.model);
	},
	
	startUpdates: function() {
		if(this.updater === undefined){
			this.progress = 0;
			this.updater = window.setInterval( this.updateProgress, 600);
		}
	},
	
	reset: function() {
		Mojo.Log.info('Resetting');
		window.clearInterval(this.updater);
		this.progress = 0;
		this.updater = window.setInterval( this.updateProgress, 600);
	},
	cancel: function(){
		Mojo.Log.info('Stopping');
		
		// Stops our forced animation
		window.clearInterval(this.updater);
	},
	handleCommand: function(e){
		if(e.type === Mojo.Event.command && typeof this[e.command] === 'function')
			this[e.command]();
	},

	updateProgress: function() {
		if (this.progress > 1) {
			window.clearInterval(this.updater);
		}
		
		this.model.progress = this.progress;
		this.controller.modelChanged(this.model);

		this.progress += .1;
		Mojo.Log.info("progress" + this.progress);
		
	},
	buttonClicked: function() {
		if (this.model.value == 20 || this.model.value == 50) {
			this.model.value = 50;
			this.controller.modelChanged(this.model);
		}
		Mojo.Log.info("value changing");
	},
	attributes: {
		title: 'Waiting',
		round: true,
		modelProperty: 'progress',

	},
	model: {
		progress: 0,
		image: 'images/miffy.png', // Relative to app root
		icon: "action-icon",	 	// Due to a bug in the widget, if you want an icon you need to use
									// icon or iconPath, set in the model, to specify the class name that 
									// defines background-url as the relative URL to the icon you want.
		title: 'Baking',
		width: '250px'
	},
	progressMenuModel: {
		items: [
			{ label: 'Reset', command: 'reset'},
			{ label: 'Stop', command: 'cancel'},
		]
	}
});
