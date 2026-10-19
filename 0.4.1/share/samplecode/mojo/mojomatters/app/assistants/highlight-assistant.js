/* 
	Highlighting is setup by the framework as it parses the views. Any element with the 
	x-mojo-tap-highlight property will be made to highlight according to that property's value.
	
	This scene's assistant may as well be blank because, as you may notice, it doesn't actually do anything. 
*/

HighlightAssistant = Class.create( FLibExample, {
	setup: function(){
		this.setupMenus({
			header: 'Highlight Demo',
			commandMenu: {
				items: [{icon:"delete", command: 'cmd-reset'}]
			}
		});
		
		//
		//	There is no javascript needed to set up highlighting
		//
		//	Look in highlight-scene.html for usage of the x-mojo-tap-highlight attribute
		//
	},
	
	handleCommand: function(e) {
		if(e.type == Mojo.Event.command && e.command == 'cmd-reset') {
			this.reset();
		}
	},
	
	reset: function(){
		//	Psych!
		
		//	Resetting Highlights
		// Immediate and momentary highlights will turn off on their own.
		// Persistent highlights do not turn off. They are used for when scenes are
		// being popped off, or items that are closing / being deleted
	}
});