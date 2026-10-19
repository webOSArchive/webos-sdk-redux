/*
	Shows what events are received
*/

EventwatcherAssistant = Class.create( FLibExample, {
	
	setup: function() {
		
		// Store references to minimize the use of controller.get()
		this.contentDiv = this.controller.get('eventcontent');
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Event-watcher Playground',
			commandMenu: {
				items: [{label: $L("Clear"), command:'clear-cmd'}]
			}
		})
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.handleEvent = this.handleEvent.bind(this);
		
		// Listen for all events in Mojo.Event
		var name, val;
		for(name in Mojo.Event) {
			val = Mojo.Event[name];
			if(typeof val === 'string') {
				Mojo.Log.info('Watching Mojo.Event.'+name);
				Mojo.Event.listen(this.controller.sceneElement, val, this.handleEvent);
			}
		}
		
		
	},
	
	
	handleEvent: function(event) {
		var content = this.contentDiv.innerHTML;
		if(event.type === Mojo.Event.hold) event.preventDefault();
		this.contentDiv.innerHTML = '<div>Got event '+event.type+'</div>'+content;
	},
	
	handleCommand: function(event) {
		if(event.type === Mojo.Event.command && event.command === 'clear-cmd') {
			this.contentDiv.innerHTML = '';
		}
	}
});





