/*
	The drawer widget is used to stash extra content that can be shown or hidden away easily.
	
	The can be styled to look spiffy, or unstyled to just look drab, but they cannot be put inside each other.
	
*/

DrawerAssistant = Class.create({
	setup: function() {
		var drawerContents;
		
		// Set up view menu with scene header
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [{label:$L("Widgets » Drawers")}, {}]});
		
		//	Store references for later / access from inside event handlers
		this.cakeDrawer = this.controller.get('cakeDrawer');
		this.hiddenDrawer = this.controller.get('hiddenDrawer');
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.showDrawer = this.showDrawer.bind(this);
		this.hideDrawer = this.hideDrawer.bind(this);
		
		// Set up the widgets
		//
		//	To put a drawer in a list, setup the list widget before adding the drawer contents, otherwise the drawer's
		//	contents will become rows in the list and it is very bad
		this.controller.setupWidget('cakeDrawer', this.cakeDrawerAttributes, this.cakeDrawerModel);
		this.controller.setupWidget('hiddenDrawer', this.hiddenDrawerAttributes, this.hiddenDrawerModel);
		
		
		// Put the drawer contents in the drawer
		//	Notice we're doing this AFTER setting up the list (above) ? 
		drawerContents = Mojo.View.render({collection: this.cakeTypes, template: 'drawer/drawer-contents'});
		this.cakeDrawer.innerHTML = drawerContents + this.cakeDrawer.innerHTML;
		this.openButton = this.controller.get('openButton');
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('timeToBake', Mojo.Event.tap, this.toggleDrawer);
		this.controller.listen('showDrawerButton', Mojo.Event.tap, this.showDrawer);
		this.controller.listen('hideDrawerButton', Mojo.Event.tap, this.hideDrawer);
		
	},

	drawerAttributes: {
		property:'myOpenProperty',
			itemTemplate: 'example',
			dividerTemplate: 'divider'
	},
	drawerModel: {
		myOpenProperty:true
	},
	hiddenDrawerAttributes: {
		unstyled: true
	},
	hiddenDrawerModel: {
		open: false
	},
	
	cakeTypes: [
		{ cakeName: 'Chocolate Explosion'},
		{ cakeName: 'Coffee Cake'},
		{ cakeName: 'Ice Cream Cake'},
		{ cakeName: 'Meatloaf', label: "'Fake Cake'"},
	],
	
	cleanup: function(){
		
		// We need to manually stop listening to events until the framework is updated to clean these up automatically
		this.controller.stopListening('timeToBake', Mojo.Event.tap, this.toggleDrawer);
		this.controller.stopListening('showDrawerButton', Mojo.Event.tap, this.showDrawer);
		this.controller.stopListening('hideDrawerButton', Mojo.Event.tap, this.hideDrawer);
	},
	
	// Button tap event handler that opens/closes the drawer.
	toggleDrawer: function(e) {

		// You can change the model and call modelChanged(), or set the open state directly:
		//	this.cakeDrawerModel.myOpenProperty = !this.cakeDrawerModel.myOpenProperty;
		//	this.controller.modelChanged(this.cakeDrawerModel, this);
		
		//	but it's easier just to do this:
		this.cakeDrawer.mojo.toggleState();
	},
	
	showDrawer: function(e){
		this.hiddenDrawer.mojo.setOpenState(true);
	},
	hideDrawer: function(e){
		this.hiddenDrawer.mojo.setOpenState(false);
	}
	
});





