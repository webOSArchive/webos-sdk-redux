
/*
	Popup menus are a handy, simple way to grab input from your users. There is nothing needed to set them up,
	although in this example we use a command menu as a clean UI to call several examples of popups, mostly
	for your benefit although I've come to enjoy them a lot myself. 
	
	To use them, call:
	
	this.controller.popupSubmenu( ... );
	
	and feed it an object hash with 3 properties:
		onChoose: 	callback which is passed the 'command' of the selected item, much in the same way
					a command menu works
		manualPlacement: 	If true, place popup at (placeX, placeY) which are now required
			placeX: 		Required if manualPlacement == true, ignored otherwise
			placeY: 		Required if manualPlacement == true, ignored otherwise
		placeNear:	reference to a DOM element. The framework will handle the rest so that it looks
					like the menu is popping up from that element (ie. looks like you 'right-clicked' 
					on that element)
		items: 		array of choices for the menu to show, same format as command menu
*/

PopupmenuAssistant = Class.create( FLibExample, {

	setup: function() {
		
		this.setupMenus({
			header: 'Pop-up Menus',
			commandMenu: {items: [
				{icon:"refresh", command:'menuRefresh'},
				{items: [{icon:"back", command:'menuBack'},
						{icon:"forward", command:'menuForward'}]},
				{icon:"new", command:'menuNew'}
			]}
		});
		
		

	},
	
	// Handle menu commands as needed:
	handleCommand: function(event) {
		if(event.type == Mojo.Event.command && typeof this[event.command] == "function") {
			this[event.command](event);
		}
	},
	
	popupChoose: function(value) {
		this.controller.get('resultSpan').innerText=value;
	},
	

	menuRefresh: function(event) {
		var near = event.originalEvent && event.originalEvent.target;
		var items = 
		[
			// This menu is a test of the combinations of various options
			{label: $L('Sunday'), command: 'Your mom' ,disabled:true}, 
			{label: $L('Monday'), command: 'mon-cmd'}, 
			{label: $L('Tuesday'), command: 'tue-cmd', chosen:true}, 
			{label: $L('Wednesday'), command: 'wed-cmd', shortcut:'w', chosen:true}, 

			{label: $L('Thursday'), command: 'thus-cmd', secondaryIcon:'status-away'}, 
			{label: $L('Friday'), command: 'fri-cmd', secondaryIcon:'status-away', shortcut:'f'}, 
			{label: $L('Saturday'), command: 'sat-cmd', secondaryIcon:'status-away', chosen:true}, 
			{label: $L('Funday'), command: 'fun-cmd', secondaryIcon:'status-away', shortcut:'n', chosen:true}, 

			{label: $L('Wonday'), command: 'won-cmd', icon:'aim'}, 
			{label: $L('Bluesday'), command: 'blue-cmd', shortcut:'b', icon:'aim'}, 
			{label: $L('Cleansday'), command: 'clean-cmd', chosen:true, icon:'aim'}, 
			{label: $L('Fursday'), command: 'fur-cmd', shortcut:'r', chosen:true, icon:'aim'}, 

			{label: $L('Pryday'), command: 'pry-cmd', secondaryIcon:'status-away', icon:'aim'}, 
			{label: $L('Clatterday'), command: 'cla-cmd', secondaryIcon:'status-away', shortcut:'c', icon:'aim'}, 
			{label: $L('Runday'), command: 'run-cmd', secondaryIcon:'status-away', chosen:true, icon:'aim'}

		];
		this.controller.popupSubmenu({onChoose:this.popupChoose, placeNear:near, 
			items: items});

	},
	
	menuBack: function(event) {
		var near = event.originalEvent && event.originalEvent.target;
		this.controller.popupSubmenu({onChoose:this.popupChoose, placeNear:near,
			items: 
			[{label: $L('Back to start'), command: 'start'}, 
			{label: $L('Previous chapter'), command: 'chap-prev'}, 
			{label: $L('Previous page'), command: 'page-prev'}
			]});
	},

	menuForward: function(event) {
		this.controller.popupSubmenu({
			onChoose:this.popupChoose, 
			
			// This example uses manual placement near (placeX, placeY), 
			// instead of the placeNear: *element* property
			manualPlacement: true,
			placeX: 50,
			placeY: 100,
			
			items: 
				[{label: $L('Skip to end'), command: 'end'}, 
				{label: $L('Next Chapter'), command: 'chap-next'}, 
				{label: $L('Next page'), command: 'page-next'}
			]});
	},

	menuNew: function(event) {
		var near = event.originalEvent && event.originalEvent.target;
		this.controller.popupSubmenu({onChoose:this.popupChoose, placeNear:near,
			items: 
			[{label: $L('New page'), command: 'page-new'}, 
			{label: $L('New app'), command: 'new-app'}, 
			{label: $L('New framework'), command: 'new-framework'}, 
			{label: $L('New Treo'), command: 'new-treo'}
			]});
	},


});





