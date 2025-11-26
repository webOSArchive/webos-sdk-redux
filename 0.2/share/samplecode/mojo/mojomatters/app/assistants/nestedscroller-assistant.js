/*
	This example demonstrates the functionality of the scroller widget and how to properly nest them 
	within each other
*/

NestedscrollerAssistant = Class.create( FLibExample, {
	setup: function() {
		
		// Set up view menu as scene header
		this.setupMenus({
			header: 'Nested Scrollers',
			commandMenu: {
				items: [
					{items:[
						{icon: 'back', command: 'cmd-left'},
						{icon: 'forward', command: 'cmd-right'}
					]},
				//	{label: 'Up', command: 'cmd-top'},			// the up and down methods do not work correctly, but have been left
				//	{label: 'Down', command: 'cmd-bottom'},		//  in the code to show how they would work in non-nested scrollers
					{label: 'Nudge', command: 'cmd-random'},
				]
			}
		});
		
		// Store references for later
		this.horizontalScroller = this.controller.get('horz_scroller');
		this.verticalScroller = this.controller.get('vert_scroller');
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.propertyChangedHandler = this.propertyChanged.bind(this);
		this.scrollStartingHandler = this.scrollStarting.bind(this);
		
		
		//	snapElements
		// Setup list of elements used as snap points for this scroller
		var elements = this.controller.select('.snap');
		this.horizScrollerModel.snapElements = {x: elements, y: []};
		this.horizScrollerModel.snapIndex = 1;
		
		//	Instantiate each selector
		this.controller.setupWidget('horz_scroller', {}, this.horizScrollerModel);	
		this.controller.setupWidget('vert_scroller', {}, this.vertScrollerModel);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('horz_scroller', Mojo.Event.propertyChanged, this.propertyChangedHandler);
		this.controller.listen('horz_scroller', Mojo.Event.scrollStarting, this.scrollStartingHandler);
	},
	
	
	// Models defined here
	horizScrollerModel: {scrollbars: false, mode: "horizontal-snap"},
	vertScrollerModel: {scrollbars: false, mode: "vertical"},
	
	cleanup: function(){
		// Stop listening to events when scene is popped
		this.controller.stopListening('horz_scroller', Mojo.Event.propertyChanged, this.propertyChangedHandler);
		this.controller.stopListening('horz_scroller', Mojo.Event.scrollStarting, this.scrollStartingHandler);
	},
	
	handleCommand: function(event){
		if(event.type == Mojo.Event.command) {

			switch(event.command) {
				case 'cmd-left':
					if(this.horizScrollerModel.snapIndex >0)
						this.horizontalScroller.mojo.setSnapIndex( this.horizScrollerModel.snapIndex -1, true);
				break;
		
				case 'cmd-right':
					if(this.horizScrollerModel.snapIndex < this.horizScrollerModel.snapElements.x.length -1)
						this.horizontalScroller.mojo.setSnapIndex( this.horizScrollerModel.snapIndex +1, true);
				break;
				
				case 'cmd-top':
					this.verticalScroller.mojo.revealTop();
				break;

				case 'cmd-bottom':
					this.verticalScroller.mojo.revealBottom();
				break;


				case 'cmd-gotoB':
					Mojo.Log.info('Scrolling to B');
					this.horizontalScroller.mojo.revealElement('trees_img');
				break
				
				case 'cmd-random':
					var panX, panY, scrollToX, scrollToY;
					
					panX = this.horizontalScroller.offsetWidth;
					panY = this.verticalScroller.offsetHeight;
					
					scrollToX = Math.floor((.5-Math.random())*200)+20;
					scrollToY = Math.floor((.5-Math.random())*200)+20;
					
					this.horizontalScroller.mojo.scrollTo( scrollToX, undefined, true);
					this.verticalScroller.mojo.adjustBy(0, scrollToY, true);
				break;

				
			}
		}
	},
	
	propertyChanged: function(event) {
		Mojo.Log.info('%%%%%%%%%%%%%%%%% propertyChanged ' + event.value);			
	},
	
	scrollStarting: function(event) {
		event.scroller.addListener(this);
	},
	
	moved: function(scrollEnding, position) {
		if (scrollEnding) {
			Mojo.Log.info('%%%%%%%%%%%%%%%%% Scroll ending');
		} else {
			Mojo.Log.info('%%%%%%%%%%%%%%%%% Moved ' + position.x);
		}
	},
	
});
