/*
	This demonstrates the handling of the Pinching gesture for scaling and such.
	
	Three events are listened for to do this:
		gesturestart - when two fingers touch
		gesturechange - when the size of your pinch changes, returns a .scale property which 
						relates to the amount your pinch has shrunk or grown
		gestureend	- user lifts fingers away
*/

GestureAssistant = Class.create( FLibExample, {
	initialize: function(){

	},

	setup: function(){

		// Set up header and commandMenu
		this.setupMenus({
			header: 'Gesture Playground',
			commandMenu: {
				items: [{icon:"delete", command:'reset'}]
			}
		});
		
		//	Store references once ahead of time
		this.touchPad 				= this.controller.get('touch-pad');
		this.gestureReportElement 	= this.controller.get('gesture-report');
		
		//	Bind handlers once here instead of inside listeners, helps reduce overhead
		this.gestureStartHandler 	= this.gestureStart.bind(this);
		this.gestureChangeHandler 	= this.gestureChange.bind(this);
		this.gestureEndHandler 		= this.gestureEnd.bind(this);
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.touchPad, "gesturestart", 	this.gestureStartHandler );
		this.controller.listen(this.touchPad, "gesturechange",	this.gestureChangeHandler);
		this.controller.listen(this.touchPad, "gestureend", 	this.gestureEndHandler);
	},
	
	cleanup: function(){
		// Cleaning event listeners
		this.controller.stopListening(this.touchPad, "gesturestart", 	this.gestureStartHandler );
		this.controller.stopListening(this.touchPad, "gesturechange",	this.gestureChangeHandler);
		this.controller.stopListening(this.touchPad, "gestureend", 	this.gestureEndHandler);
	},
	
	handleCommand: function(e) {
		if(e.type == Mojo.Event.command && e.command == 'reset') {
			this.reset();
		}
	},
	
	reset: function() {
		this.touchPad.style.height = "280px";
		this.touchPad.style.width = "280px";
	},
	
	//
	//	The following methods are used by this example to control the scale of the touchpad 
	//
	
	gestureStart: function(event) {
		// Store real Zindex and bring gesture-catching element to the front
		this.oldzIndex = this.touchPad.zIndex;
		this.touchPad.zIndex = 1000;
		
		this.origWidth = this.touchPad.offsetWidth;
		this.origHeight = this.touchPad.offsetHeight;

		this.offsetX = parseInt(this.touchPad.style.left);
		this.offsetY = parseInt(this.touchPad.style.top);
		if(isNaN(this.offsetX)) { this.offsetX = 0; }
		if(isNaN(this.offsetY)) { this.offsetY = 0; }

		this.origPosLeft = event.centerX;
		this.origPosTop = event.centerY;
		this.gestureReportElement.innerHTML = $L("Gesture started @ ") + this.origWidth + "," + this.origHeight;
		
		Mojo.Log.info("gestureStarted, " + this.origWidth + "," + this.origHeight);
		Mojo.Log.info("offsets: " + this.offsetX + "," + this.offsetY);
		Mojo.Log.info("origpos: " + this.origPosLeft + "," + this.origPosTop);
	},
	
	calculateSize: function(scaleFactor) {
		return {height: this.origHeight * scaleFactor, width: this.origWidth * scaleFactor};
	},
	
	gestureChange: function(event) {
		var newSize = this.calculateSize(event.scale);
		this.touchPad.zIndex = 1000;
		this.touchPad.style.height = Math.round(newSize.height) + "px";
		this.touchPad.style.width = Math.round(newSize.width) + "px";
		this.touchPad.style.left = (event.centerX - this.origPosLeft + this.offsetX) + 'px';
		this.touchPad.style.top = (event.centerY - this.origPosTop + this.offsetY) + 'px';
	},
	
	gestureEnd: function(event) {
		this.touchPad.zIndex = this.oldzIndex;
		this.gestureReportElement.update( $L("Gesture ended") );
	}
	
});
