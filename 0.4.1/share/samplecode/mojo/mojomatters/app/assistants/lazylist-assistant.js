/*
	Demonstrates a list with dynamically loaded items.
	
	Left button opens actions you can perform on the list data, the other buttons tweak the actions.
*/

LazylistAssistant = Class.create( FLibExample, {
	
	setup: function() {
		
		// Set up view menu with scene header
				
		this.setupMenus({
			header: 'Lazy List',
			commandMenu: {
				items: [
							{icon:"new", submenu:'actions-menu'},
							{label:'This Many', submenu:"modcount-menu"},
							{label:'From...', submenu:"modpos-menu"}
						]
			}
		});
		
		// Set up submenus to choose item count & list position for the various list commands:
		// 	Submenus are setup using the ID of the submenu property of the commandMenu or ViewMenu item 
		//	that opens it, undefined attributes and a specially structured model. The models are at the bottom.
		this.controller.setupWidget("modcount-menu", undefined, this.countMenuModel);
		this.controller.setupWidget("modpos-menu", undefined, this.posMenuModel);
		this.controller.setupWidget("actions-menu", undefined, this.actionsModel);
	
		
		this.controller.setupWidget('loremCheckbox', {property: 'loremEnabled'});
		
		
		// Set up for the list widget.
		// Note that we specify a callback function for loading list items in the widget attributes.
		this.controller.setupWidget('loremList', 
									{itemTemplate:'lazylist/listitem', listTemplate:'lazylist/listcontainer', 
									itemsCallback:this.itemsCallback.bind(this), 
//									fixedHeightItems:true,
//									scrollThreshold: 6000,
//									renderLimit: 200,
//									lookahead: 200,
									swipeToDelete:true,
									autoconfirmDelete: false,
									reorderable:true},
									{listTitle: $L('Favorite Quotes') });
				
		this.loremListWidget = this.controller.get('loremList');
		
		
		// If the list is empty, start it out with a bunch of items:
		if(this.loremList.length == 0) {
			loremList = this.loremList;
			this.loremList.push.apply(this.loremList, this.makeLoremItems(100, 0));
		}
		
		
		// Default values for menu options:
		this.modPos = "modpos-beginning";
		this.modCount = 1;
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('loremList', Mojo.Event.listTap, this.listWasTapped.bind(this));
		this.controller.listen('loremList', Mojo.Event.propertyChange, this.propertyChanged.bind(this));
		this.controller.listen('loremList', Mojo.Event.listReorder, this.listReorderHandler.bind(this));
		this.controller.listen('loremList', Mojo.Event.listDelete, this.listDeleteHandler.bind(this));
		
		this.updateListWithNewItems = this.updateListWithNewItems.bind(this);
	
		
	},
	
	
	listWasTapped: function(event) {
		Mojo.Log.info("got a tap in the list " + event.item);
	},
	
	propertyChanged: function(event) {
		Mojo.Log.info("property was changed: " + event.property + " = "+ event.value);
	},
	
	// Called for Mojo.Event.listReorder events.
	// Modifies the list item model to reflect the changes.
	listReorderHandler: function(event) {
		
		this.loremList.splice(this.loremList.indexOf(event.item), 1);
		this.loremList.splice(event.toIndex, 0, event.item);
	},
	
	listDeleteHandler: function(event) {
		this.loremList.splice(this.loremList.indexOf(event.item), 1);
	},
	
	
	/*
		This is the callback function we provide the list widget instead of specifying an array of items.
		The widget will call this function when it needs to load model objects for the list items.
	*/
	itemsCallback: function(listWidget, offset, count) {
//		Mojo.log("Got request @"+offset+", +"+count);
		
		// We delay returning the items by .1 seconds in order to more accurately simulate 
		// data being returned from an async service request.
		// If the data is available immediately, it's fine to call 'updateItems' from within this function.
		this.updateListWithNewItems.delay(.1, listWidget, offset, this.loremList.slice(offset, offset+count));
		//callback(offset, this.loremList.slice(offset, offset+count), this.loremList.length);
		
		// Java services using ActiveRecord may wish to know the window of 
		// currently loaded items, in order to perform certain optimizations:
		var range = this.loremListWidget.mojo.getLoadedItemRange();
//		Mojo.log($L("Current window: ") +range.offset+", +"+range.limit +'    '+$L("Requesting ") +offset+", +"+count);
	},
	
	updateListWithNewItems: function(listWidget, offset, items) {
		// Give the item models to the list widget, and render them into the DOM.
		listWidget.mojo.noticeUpdatedItems(offset, items);
		
		// This will do nothing when the list size hasn't actually changed, 
		// but is necessary when initially setting up the list.
		listWidget.mojo.setLength(this.loremList.length);
	},
	
	
	// This is how the menu commands are handled.
	handleCommand: function(event) {
				
		if(event.type == Mojo.Event.command) {
			switch(event.command) {
				case 'showAddMenu':
					this.showAddMenu(event);
					break;

					case 'add':
						this.addMoreLorem();
						break;
					case 'add-delayed':
						this.addMoreLorem(true); // use setLengthAndInvalidate()
						break;
					case 'remove':
						this.removeLorem();
						break;
					case 'update':
						this.updateLorem(true);
						break;
					case 'invalidate':
						this.updateLorem(false);
						break;
					case 'reveal-next':
						this.revealIndex = (this.revealIndex || 1) % this.loremList.length;
						this.loremListWidget.mojo.revealItem(this.revealIndex, true);
						this.revealIndex++;
						break;
					case 'show-bottom':
						this.controller.getSceneScroller().mojo.revealBottom();
						break;

					// Submenu commands to change number of items affected:
					case 'modcount-1':
						this.modCount=1;
						break;
					case 'modcount-10':
						this.modCount=10;
						break;
					case 'modcount-50':
						this.modCount=50;
						break;
					case 'modcount-100':
						this.modCount=100;
						break;

					// Submenu commands to change the place in the list that is affected:
					case 'modpos-beginning':
					case 'modpos-middle':
					case 'modpos-end':
						this.modPos=event.command;
						break;
				
				default:
					Mojo.log('got unknown command '+event.command);
					return; // avoid the stop below!
					break;
			}
			Event.stop(event);
		}
		
	},
	
	// Called in response to the + menu button
	// Generates new items and adds them.
	addMoreLorem: function(useSetLength) {
		var startOffset = this.getModOffset();
		var newItems = this.makeLoremItems(this.modCount, "("+startOffset+")");
		
		// insert items in proper place in our local array:
		newItems.unshift(startOffset, 0);
		this.loremList.splice.apply(this.loremList, newItems);
		newItems.splice(0,2);
		
		if(useSetLength) {
			// This API can be used to change the list size, but you do not have the new items or know where they were added/removed.
			// It will refresh the entire loaded items window, possibly after shifting it to respect the new list size.
			this.loremListWidget.mojo.setLengthAndInvalidate(this.loremList.length);
		}
		else {
			this.loremListWidget.mojo.noticeAddedItems(startOffset, newItems);
		}
		
		Mojo.log('added lorem: @' +startOffset+", +"+this.modCount);
	},
	
	// Called in response to the menu button
	// Removes some number of list items, rerenders as necessary
	removeLorem: function() {
		var startOffset = this.getModOffset();
		
		if(startOffset == this.loremList.length) {
			startOffset = Math.max(0, startOffset-this.modCount);
		}
		
		this.loremList.splice(startOffset, this.modCount);
		this.loremListWidget.mojo.noticeRemovedItems(startOffset, this.modCount);
		Mojo.log('removed lorem: @' +startOffset+", +"+this.modCount);
	},
	
	// Called in response to the update & invalidate menu buttons.
	// Modifies items, and then updates or invalidates them.
	updateLorem: function(update) {
		var startOffset = this.getModOffset();
		var howMany;
		var newItems;
		
		if(startOffset == this.loremList.length) {
			startOffset = Math.max(0, startOffset-this.modCount);
		}
		
		newItems = this.makeLoremItems(this.modCount, startOffset);
		
		if(update) {
			this.loremListWidget.mojo.noticeUpdatedItems(startOffset, newItems);
		}
		
		// insert items in proper place in our local array, truncating if needed:
		if(startOffset+ newItems.length > this.loremList.length) {
			newItems = newItems.slice(startOffset, this.loremList.length - startOffset);
		}
		
		newItems.unshift(startOffset, newItems.length);
		this.loremList.splice.apply(this.loremList, newItems);
		
		if(!update) 
		{
			this.loremListWidget.mojo.invalidateItems(startOffset, this.modCount);
		}
		
		Mojo.log('updated lorem @' +startOffset+", +"+this.modCount);
	},
	
	
	// Returns actual list offset to modify, depending on the current menu selection.
	getModOffset: function() {
		var startOffset = 0;
		
		switch(this.modPos) {
			case 'modpos-beginning':
				startOffset = 0;
				break;
			case 'modpos-middle':
				startOffset = Math.floor(this.loremList.length/2);
				break;
			case 'modpos-end':
				startOffset = this.loremList.length;
				break;
		}
		return startOffset;
	},
	
	
	// Generates an array of random latin-like text strings.
	makeLoremItems: function(howMany, offset) {
		var i;
		var items = [];
		
		for(i=0; i < howMany; i++) {
			items.push({data:i+offset, text:randomLorem(), rating:3});
		}
		return items;
	},

	
	// Used to choose how many items should be added, deleted, updated, etc...
	countMenuModel: { label: $L('ModCount'), items: [{label:'1', command:'modcount-1'}, 
									                {label:'10', command:'modcount-10'}, 
									                {label:'50', command:'modcount-50'}, 
									                {label:'100', command:'modcount-100'}
								]},

	// Used to choose which part of the list should be acted upon.
	posMenuModel: { label: $L('ModCount'), items: [{label:$L('Beginning'), command:'modpos-beginning'}, 
									                {label:$L('Middle'), command:'modpos-middle'}, 
									                {label:$L('End'), command:'modpos-end'}
								]},

	// Used to choose which part of the list should be acted upon.
	actionsModel: { label: $L('ModCount'), items: [
		{label:"Insert New Items", command:'add'},			// add new items
		{label:'Add New and Reload', command:'add-delayed'},	// add new items using setLengthAndInvalidate
		{label:"Modify and Update", command:'update'},		// modify & update items
		{label:"Modify and Reload", command:'invalidate'},	// modify & invalidate (reload) items
		{label:"Delete Some Items", command:'remove'},
		{label:'Reveal Next', command:'reveal-next'},
		{label:'Show Bottom', command:'show-bottom'}
	]},
								
	// Item list goes into class prototype so it's "static", ad saved after the scene is popped.
	loremList: []

});





