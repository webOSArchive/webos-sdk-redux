
/*
	Demonstrates use of the List widget to display an editable list of words.
*/

EditablelistAssistant = Class.create( FLibExample, {
	
	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Editable Lists'
		});
		
		// Set up a few models so we can test setting the widget model:
		this.wordsModel = {listTitle:$L('Words'), items:this.wordItems};
		this.fruitsModel = {listTitle:$L('Fruits'), items:this.fruitItems};
		this.noItemsModel = {listTitle:$L('Initially Empty'), items:this.noItems};
		this.currentModel = this.wordsModel;
		
		// Store references to reduce the use of controller.get()
		this.wordsList = this.controller.get('wordsList');
		
		// Bind event handlers ahead of time so we have references we can use in cleanup
		this.listChangeHandler = this.listChangeHandler.bind(this);
		this.listAddHandler = this.listAddHandler.bind(this);
		this.listDeleteHandler = this.listDeleteHandler.bind(this);
		this.listReorderHandler = this.listReorderHandler.bind(this);
			//other API-button events
		this.switchModels = this.switchModels.bind(this);
		this.focusRandom = this.focusRandom.bind(this);
		this.reveal = this.reveal.bind(this);
		this.changeAddItem = this.changeAddItem.bind(this);
		this.changeListVisible = this.changeListVisible.bind(this);
		
		// Set up the attributes for the list widget:
		this.wordAtts = {	
			itemTemplate:'editablelist/listitem', 
			listTemplate:'editablelist/listcontainer', 
			addItemLabel:$L("Add..."), 
			swipeToDelete:true, 
			reorderable:true, 
			emptyTemplate:'editablelist/emptylist'
		};
		
		this.controller.setupWidget('wordsList', this.wordAtts, this.currentModel);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.wordsList, Mojo.Event.listChange, this.listChangeHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listAdd, this.listAddHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listDelete, this.listDeleteHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listReorder, this.listReorderHandler);
		
		
		// These buttons are used to show some of the other APIs available.
		this.controller.listen('switchModelsButton', Mojo.Event.tap, this.switchModels);
		this.controller.listen('focusButton', 'click', this.focusRandom);
		this.controller.listen('revealButton', 'click', this.reveal);
		this.controller.listen('addCheckbox', 'change', this.changeAddItem);
		this.controller.listen('visibleCheckbox', 'change', this.changeListVisible);
		
	},
	
	reveal: function() {
		this.wordsList.mojo.revealItem(350, true);
	},
	
	// Called for Mojo.Event.listAdd events.
	// Adds a new item to the list.
	listAddHandler: function(event ) {
		
		/*
		// This works, but refreshes the whole list:
		this.currentModel.items.push({data:"New item"});
		this.controller.modelChanged(this.currentModel, this);
		*/
		
		// The 'noticeAddedItems' API will inserts the item where indicated, 
		// and then the list can potentially update only the added item.
		var newItem = {data:$L("New item")};
		this.currentModel.items.push(newItem);
		this.wordsList.mojo.noticeAddedItems(this.currentModel.items.length, [newItem]);
		
	},
	
	// Called for Mojo.Event.listDelete events.
	// Removes the deleted item from the model (and would persist the changes to disk if appropriate).
	// The list's DOM elements will be updated automatically, unless event.preventDefault() is called.
	listDeleteHandler: function(event) {
		Mojo.log("EditablelistAssistant deleting '"+event.item.data+"'.");
		this.currentModel.items.splice(this.currentModel.items.indexOf(event.item), 1);
	},
	
	// Called for Mojo.Event.listReorder events.
	// Modifies the list item model to reflect the changes.
	listReorderHandler: function(event) {
		this.currentModel.items.splice(this.currentModel.items.indexOf(event.item), 1);
		this.currentModel.items.splice(event.toIndex, 0, event.item);
	},
	
	
	// Called for Mojo.Event.listChange events, which are sent when a 'change' event comes from a list item.
	// Saves the new value into the model.
	listChangeHandler: function(event) {
		if(event.originalEvent.target.tagName == "INPUT") {
			event.item.data = event.originalEvent.target.value;
			Mojo.Log.info("Change called.  Word is now: "+event.item.data);
		}
	},
	
	// Focus the text field in a random list item:
	focusRandom: function(event) {
		var index = Math.floor(Math.random() * this.currentModel.items.length);
		this.wordsList.mojo.focusItem(this.currentModel.items[index]);
	},
	
	// Show/hide the special "Add..." item.
	changeAddItem: function(event) {
		this.wordsList.mojo.showAddItem(event.target.value);
	},
	
	changeListVisible: function(event) {
		var visible = !!event.target.value;
		
		if(visible) {
			Element.show(this.wordsList);
		} else {
			Element.hide(this.wordsList);
		}
		
	},
	
	
	
	// Switch the list model to the other one.
	// Demonstrates use of setWidgetModel().
	switchModels: function(e) {
		var newModel = this.wordsModel;
		if(this.currentModel === this.wordsModel) {
			Mojo.log("switching to no items model");
			newModel = this.noItemsModel;
		} else if (this.currentModel === this.noItemsModel) {
			Mojo.log("switching to fruits model");
			newModel = this.fruitsModel;			
		}
		
		this.currentModel = newModel;
		this.controller.setWidgetModel(this.wordsList, newModel);
	},
	
	
	/*
		Two lists of sample items.
		They can be switched between using the "toggle models" button.
	*/
	
	wordItems: [
			{data:$L("Stuff"), definition:$L("Marked by high spirits or excitement.")},
			{data:$L("Serendipity"), definition: $L("The faculty of making fortunate discoveries by accident.")},
			{data:$L("Hullabaloo"), definition:$L("A great noise or commotion; a hubbub.")},
			{data:$L("Chortle"), definition:$L("A snorting, joyful laugh or chuckle.")},
			{data:$L("Euphonious"), definition:$L("Pleasant sounding.")},
			{data:$L("Scintillating"), definition:$L("Marked by high spirits or excitement.")}
		],
	
	fruitItems: [
					{data:$L("Apple"), definition:$L("yum")},
					{data:$L("Apricot"), definition:$L("yum")},
					{data:$L("Bananna"), definition: $L("yum")},
					{data:$L("Blueberry"), definition: $L("yum")},
					{data:$L("Cherry"), definition: $L("yum")},
					{data:$L("Guava"), definition: $L("yum")},
					{data:$L("Goji Berries"), definition: $L("yum")},
					{data:$L("Kiwi"), definition:$L("yum")},
					{data:$L("Peach"), definition:$L("yum")},
					{data:$L("Pinapple"), definition:$L("yum")},
					{data:$L("Strawberry"), definition:$L("yum")},
					{data:$L("Tomato"), definition:$L("yum")},
					{data:$L("Watermelon"), definition:$L("yum")}
				],
	noItems : []
		
	
	
	
	
	
});


