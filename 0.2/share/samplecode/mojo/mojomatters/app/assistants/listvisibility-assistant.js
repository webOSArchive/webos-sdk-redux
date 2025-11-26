
/*
	Demonstrates a list with dynamically loaded items.
*/

ListvisibilityAssistant = Class.create({
	
	setup: function() {
		
		// Set up view menu with scene header
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [
					{label: $L("Widgets » List Visibility")}
				]});
		
		// Set up command menu. This has buttons which perform various operations on the list items.
		this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, {items: [
				{},
				{toggleCmd: 'toggle-a', items:[
					{label:"A", command:'toggle-a'}]
				},
				{toggleCmd: 'list-a', items:[
					{label:"List A", command:'list-a'},
					{label:'List B', command:'list-b'}
					]},	// delete items
				{}
				]});
		
		
		this.listAVisible = true;
		this.listAScrollPosition = this.controller.sceneScroller.mojo.getState();
		this.listBScrollPosition = this.controller.sceneScroller.mojo.getState();
				
		// Set up for the list widget.
		// Note that we specify a callback function for loading list items in the widget attributes.
		this.controller.setupWidget('list-a', 
									{itemTemplate:'listvisibility/listitem'
//									itemsCallback:this.itemsCallback.bind(this), 
//									fixedHeightItems:true,
//									scrollThreshold: 6000,
//									renderLimit: 50,
//									lookahead: 200,
//									swipeToDelete:true,
//									autoconfirmDelete: false,
//									reorderable:true
									},
									{listTitle: $L('Favorite Quotes'),
									 	items: this.makeListItems(160, "List A")});
				
		this.controller.setupWidget('list-b', 
									{itemTemplate:'listvisibility/listitem'
									},
									{listTitle: $L('Favorite Quotes'),
									 	items: this.makeListItems(160, "List B")});

		this.listA = this.controller.get('list-a');
		this.listB = this.controller.get('list-b');
		
		this.listA.show();
	  	this.controller.showWidgetContainer(this.listA);
						
	},
	
	activate: function() {
		this.controller.hideWidgetContainer(this.listB);
	  	
	},
	
	// This is how the menu commands are handled.
	handleCommand: function(event) {		
		if(event.type == Mojo.Event.command) {
			
			switch(event.command) {
				
				// Main list-modifying commands:
			case 'toggle-a':
//				this.loadListAView();
				
				this.listAVisible = !this.listAVisible;
				this.setListVisibility("A", this.listAVisible);
				break;
				
				case 'list-a':
//					this.loadListAView();
//this.controller.sceneScroller.mojo.setState(this.controller.sceneScroller.mojo.getState());  
					this.setListVisibility("B", false);
					this.setListVisibility("A", true);
					break;
				case 'list-b':
//				this.controller.sceneScroller.mojo.setState(this.controller.sceneScroller.mojo.getState());  
					this.setListVisibility("A", false);
					this.setListVisibility("B", true);
					break;
								
				default:
					return; // avoid the stop below!
			}
			Event.stop(event);
		}
		
	},
	

	// Generates an array of numbered & labelled text strings.
	makeListItems: function(howMany, label) {
		var i;
		var items = [];
		
		for(i=0; i < howMany; i++) {
			items.push({index:i, text: label + " #"+i});
		}
		return items;
	},

	
	
	/*
	// Cribbed from messaging app:
  loadListAView: function(shouldUpdateToggle) {
//	if(!this.currentListView || this.currentListView != this.Messaging.Views.BUDDY) {
//	  this.clearFilterField();
//	  this.currentListView = this.Messaging.Views.BUDDY;
	  this.listBScrollPosition = this.controller.sceneScroller.mojo.getState();
	Mojo.Log.info("*&*&*&*&*&*&*&*&* Saving listBScrollPosition: "+this.listBScrollPosition.top+", "+this.listBScrollPosition.left);
	  this.listB.hide();
      this.listA.show();
	  this.controller.showWidgetContainer(this.listA);
	  this.controller.hideWidgetContainer(this.listB);	  
//      this.buddyListUpdateEvent(this.buddyListWidget); // execute update event after the list is visible so it can retrieve an accurate item count	  
	Mojo.Log.info("*&*&*&*&*&*&*&*&* Setting listAScrollPosition: "+this.listAScrollPosition.top+", "+this.listAScrollPosition.left);

//  	  this.controller.sceneScroller.mojo.setState(this.listAScrollPosition);		
		this.controller.sceneScroller.mojo.scrollTo(this.listAScrollPosition.left, this.listAScrollPosition.top, false);


//    }
//    if(shouldUpdateToggle && this.topMenuModelItems[0].toggleCmd != this.COMMAND_MENU.loadBuddyView.command) {
    //    this.topMenuModelItems[0].toggleCmd = this.COMMAND_MENU.loadBuddyView.command;
  //      this.controller.modelChanged(this.topMenuModel);        
//    }	
  },

  loadListBView: function(shouldUpdateToggle) {

		  this.listAScrollPosition = this.controller.sceneScroller.mojo.getState();
		Mojo.Log.info("*&*&*&*&*&*&*&*&* Saving listAScrollPosition: "+this.listAScrollPosition.top+", "+this.listAScrollPosition.left);
		  this.listA.hide();
	      this.listB.show();
		  this.controller.showWidgetContainer(this.listB);
		  this.controller.hideWidgetContainer(this.listA);	  
		Mojo.Log.info("*&*&*&*&*&*&*&*&* Setting listBScrollPosition: "+this.listBScrollPosition.top+", "+this.listBScrollPosition.left);
//	  	  this.controller.sceneScroller.mojo.setState(this.listBScrollPosition);  
		this.controller.sceneScroller.mojo.scrollTo(this.listBScrollPosition.left, this.listBScrollPosition.top, false);
	},
	*/
	

	setListVisibility: function(which, vis) {
		var list = this['list'+which];
		var listPosProp = 'list'+which+'ScrollPosition';
		var listPos = this[listPosProp];

		if(vis) {
			list.show();
			this.controller.showWidgetContainer(list);
 			
			Mojo.Log.info("*&*&*&*&*&*&*&*&* Scrolling to "+listPosProp+": "+listPos.left+", "+listPos.top);
			this.controller.sceneScroller.mojo.setState(listPos, false);  
			//this.controller.sceneScroller.mojo.scrollTo(listPos.left, listPos.top, false);
			
			
		}else {
			this[listPosProp] = this.controller.sceneScroller.mojo.getState();
			Mojo.Log.info("*&*&*&*&*&*&*&*&* Saving "+listPosProp+": "+this[listPosProp].left+", "+this[listPosProp].top);
		  	this.controller.hideWidgetContainer(list);	  
			list.hide();
		}


	}
	
	
	
	
	
	
});




