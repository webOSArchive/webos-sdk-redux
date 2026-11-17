/*
	A simple playground that demonstrates drag- and flick-specific events
*/

TouchAssistant = Class.create( FLibExample, {
	initialize: function(){
		
		// Bind event handlers once, before they're needed
		//	You can do this inside initialize() or setup()
		this.dragStartHandler = this.dragStart.bind(this);
		this.draggingHandler = this.dragging.bind(this);
		this.dragEndHandler = this.dragEnd.bind(this);
		this.flickHandler = this.flick.bind(this);
	},
	
	setup: function(){

		// Set up header and command menu. The latter has buttons which perform various operations on the list items.
		this.setupMenus({
			header: 'Gesture and Touch Events',
			commandMenu: {
				items:[{},{icon: 'delete', command: 'reset'}]
			}
		});
		
		//	References
		// Store references for later to reduce the use of this.controller.get()
		this.touchPad = this.controller.get('touch-pad');
		this.flickReportElement = this.controller.get('flick-report');
		this.touchEventList	= this.controller.get('touch_event_list');
		
		//	Events
		// Listen to events using controller.listen(), remember to clean them up in this.cleanup()
		this.controller.listen(this.touchPad, Mojo.Event.dragStart, this.dragStartHandler);
		this.controller.listen(this.touchPad, Mojo.Event.flick, this.flickHandler);
		
		// Special Mojo method to indicate you'd like to be informed of gesture events instead of just taps
		Mojo.Gesture.recordEvents(true);
		
	},
	
	// Handle menu commands as needed:
	handleCommand: function(event) {
		if(event.type == Mojo.Event.command && typeof this[event.command] == "function") {
			this[event.command](event);
		}
	},
	
	cleanup: function() {
		// Clean out event listeners manually, at least until the framework is update to do this on its own
		Mojo.Gesture.recordEvents(false);
		this.controller.listen(this.touchPad, Mojo.Event.dragStart, this.dragStartHandler);
		this.controller.listen(this.touchPad, Mojo.Event.flick, this.flickHandler);
	},
	
	reset: function() {
		this.flickReportElement.innerHTML = "No Flick Yet";
		this.touchEventList.innerHTML = "";
	},
	
	dragStart: function(event) {
		
		// Reset the counters and start watching this drag
		this.flickReportElement.innerHTML = "dragging";
		this.flicksInARow = 0;
		this.points = [];
		this.controller.listen(this.touchPad, Mojo.Event.dragging, this.draggingHandler);
		this.controller.listen(this.touchPad, Mojo.Event.dragEnd, this.dragEndHandler);
		this.points.push({x: Event.pointerX(event.down), y: Event.pointerY(event.down)});
		Event.stop(event);
	},
	
	dragging: function(event) {
		this.points.push({x: Event.pointerX(event.move), y: Event.pointerY(event.move)});
		Event.stop(event);
	},
	
	flick: function(event) {
		this.flickReportElement.innerHTML = "flicked";
		this.flicksInARow += 1;
		
		flickText = this.flicksInARow + " flicks " + event.velocity.x + ", " + event.velocity.y + " pixels/s";
		this.flickReportElement.innerHTML = flickText;
		
		Event.stop(event);
	},
	
	dragEnd: function(event) {
		
		// Stop listening to this drag
		this.controller.stopListening(this.touchPad, Mojo.Event.dragging, this.draggingHandler);
		this.controller.stopListening(this.touchPad, Mojo.Event.dragEnd, this.dragEndHandler);
		
		// Parse results from coutners, post to screen
		if (this.flicksInARow >0) {
			this.flickReportElement.innerHTML = "no flick";
			this.flicksInARow = 0;
		}
		
		this.touchEventList.innerHTML = Mojo.View.render({collection: Mojo.Gesture.eventList, template: 'touch/event'});
		delete Mojo.Gesture.eventList;
		
		Event.stop(event);
	},
});
