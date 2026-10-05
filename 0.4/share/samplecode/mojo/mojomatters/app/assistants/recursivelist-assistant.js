/*
	Demonstrates placing lists inside a list.
	This works on the same principle as putting any other widget in a list, but is a bit more confusing.
*/


RecursivelistAssistant = Class.create( FLibExample, {

	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Recursive Lists'
		});
			
		// Define necessary data
		this.colorsModel = {listTitle:$L('Colors'), items:this.colorItems};
		this.wordsModel = {listTitle:$L('Words'), items:this.wordItems};
		this.fruitsModel = {listTitle:$L('Fruits'), items:this.fruitItems};
		this.cheesesModel = {listTitle:$L('Cheeses'), items:this.cheeseItems};
		this.outerListAttrs = {itemTemplate:'recursivelist/outerlistitem'};
		
		// Bind event handlers once, ahead of time
		this.listTapHandler = this.listTapHandler.bind(this);
		this.listAddHandler = this.listAddHandler.bind(this);
		this.listDeleteHandler = this.listDeleteHandler.bind(this);
		this.listReorderHandler = this.listReorderHandler.bind(this);
		this.propertyChanged = this.propertyChanged.bind(this);
		
		// Setup widgets
		this.controller.setupWidget('outerList', this.outerListAttrs,
					                  {items:[this.colorsModel, this.wordsModel, this.fruitsModel, this.cheesesModel]});
 	  	
		this.innerListAttrs = {
				listTemplate:'recursivelist/listcontainer', 
				itemTemplate:'recursivelist/innerListItem',
				addItemLabel:$L("Add..."),
				swipeToDelete:true, reorderable:true,
				autoconfirmDelete:true,
				dragDatatype:'words',
				deletedProperty: 'swiped'
			};
			
		this.controller.setupWidget('innerList', this.innerListAttrs);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('outerList', Mojo.Event.listTap, this.listTapHandler);
		this.controller.listen('outerList', Mojo.Event.listAdd, this.listAddHandler);
		this.controller.listen('outerList', Mojo.Event.listDelete, this.listDeleteHandler);
		this.controller.listen('outerList', Mojo.Event.listReorder, this.listReorderHandler);
		this.controller.listen('outerList', Mojo.Event.propertyChange, this.propertyChanged);
	},
	cleanup: function(){	
		this.controller.stopListening('outerList', Mojo.Event.listTap, this.listTapHandler);
		this.controller.stopListening('outerList', Mojo.Event.listAdd, this.listAddHandler);
		this.controller.stopListening('outerList', Mojo.Event.listDelete, this.listDeleteHandler);
		this.controller.stopListening('outerList', Mojo.Event.listReorder, this.listReorderHandler);
		this.controller.stopListening('outerList', Mojo.Event.propertyChange, this.propertyChanged);
	},
	
	propertyChanged: function(event) {
		Mojo.Log.info("property change event for " + event.property + ", new val "+ event.value);
	},
	
	listTapHandler: function(event) {
		
		if(event.originalEvent.target.getAttribute('name') === 'removeButton') {
			Mojo.Log.info("Removing word %s", event.item.data);
			
			// Warning: By not checking which model we're modifying here, we implicitly assume that they share the same structure.
			var index = event.model.items.indexOf(event.item);
			if(index > -1) {
				event.model.items.splice(index, 1);
				this.controller.modelChanged(event.model, this);
			}
			
		}
		
	},
	
	listAddHandler: function(event) {
		// Warning: By not checking which model we're modifying here, we implicitly assume that they share the same structure.
		
		if(event.item && event.index !== undefined) {
			// Items added by dragging from other lists have 'item' and 'index' specified in the event.
			// This means to add a specific item at a specific location.
			event.model.items.splice(event.index, 0, event.item);
			
		} else {
			// If 'item' and 'index' are undefined, then the 'add...' item was tapped, and we add a "new/blank" item.
			event.model.items.push({data:$L('New Item') });
			this.controller.modelChanged(event.model, this);
		}
	},
	
	listDeleteHandler: function(event) {
		// Remove the item from the model's list.
		// Warning: By not checking which model we're modifying here, we implicitly assume that they share the same structure.
		event.model.items.splice(event.model.items.indexOf(event.item), 1);
	},
	
	
	// Called for Mojo.Event.listReorder events.
	// Modifies the list item model to reflect the changes.
	listReorderHandler: function(event) {
		event.model.items.splice(event.model.items.indexOf(event.item), 1);
		event.model.items.splice(event.toIndex, 0, event.item);
	},
	
	
	wordItems: [
			{data:$L("Scintillating"), definition:$L("Marked by high spirits or excitement.")},
			{data:$L("Serendipity"), definition: $L("The faculty of making fortunate discoveries by accident.")},
			{data:$L("Hullabaloo"), definition:$L("A great noise or commotion; a hubbub.")},
			{data:$L("Chortle"), definition:$L("A snorting, joyful laugh or chuckle.")},
			{data:$L("Euphonious"), definition:$L("Pleasant sounding.")}
		],
	
	colorItems: [
			{data:$L("Coral"), definition:$L("orange")},
			{data:$L("Dark Orchid"), definition: $L("purple")},
			{data:$L("Blanched Almond"), definition:$L("white")},
			{data:$L("Cornflower"), definition:$L("blue")},
			{data:$L("Salmon"), definition:$L("pink")}
		],
	
	fruitItems: [
				{data:$L("Apple"), definition:$L("yum")},
				{data:$L("Apricot"), definition:$L("yum")},
				{data:$L("Bananna"), definition: $L("yum")},
				{data:$L("Blueberry"), definition: $L("yum")},
				{data:$L("Cherry"), definition: $L("yum")},
				{data:$L("Currant"), definition: $L("yum")},
				{data:$L("Guava"), definition: $L("yum")},
				{data:$L("Goji Berries"), definition: $L("yum")},
				{data:$L("Kiwi"), definition:$L("yum")},
				{data:$L("Kumquat"), definition:$L("yum")},
				{data:$L("Mango"), definition:$L("yum")},
				{data:$L("Orange"), definition:$L("yum")},
				{data:$L("Peach"), definition:$L("yum")},
				{data:$L("Pinapple"), definition:$L("yum")},
				{data:$L("Pomegranate"), definition:$L("yum")},
				{data:$L("Quince"), definition:$L("yum")},
				{data:$L("Snozzberry"), definition:$L("yum")},
				{data:$L("Starfruit"), definition:$L("yum")},
				{data:$L("Strawberry"), definition:$L("yum")},
				{data:$L("Tomato"), definition:$L("yum")},
				{data:$L("Uglyfruit"), definition:$L("yum")},
				{data:$L("Watermelon"), definition:$L("yum")}
			],
		
	cheeseItems: [
				{data:$L("Brie"), definition:$L("yum")},
				{data:$L("Cheddar"), definition:$L("yum")},
				{data:$L("Cottage"), definition:$L("yum")},
				{data:$L("Edam"), definition:$L("yum")},
				{data:$L("Fontina"), definition:$L("yum")},
				{data:$L("Gorgonzola"), definition:$L("yum")},
				{data:$L("Gouda"), definition:$L("yum")},
				{data:$L("Manchego"), definition:$L("yum")},
				{data:$L("Swiss"), definition:$L("yum")},
				{data:$L("Roquefort"), definition:$L("yum")},
				{data:$L("Wensleydale"), definition:$L("yum")}
	]
	
	

});


