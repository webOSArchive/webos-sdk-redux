/*
	WebOS supports HTML5's sqlLite databases. This scene demonstrates storing and recalling values, which can be
	done even after a scene has been popped off or the app has been closed.
*/

PersistentlistAssistant = Class.create(FLibExample, {

	setup: function() {

		// Set up view menu with scene header
		this.setupMenus({
			header: 'Persistent Lists'
		});

		// Set up a few models so we can test setting the widget model:
		this.wordsModel = {listTitle:$L('Words'), items:this.listTestWordList};    
		this.fruitsModel = {listTitle:$L('Fruits'), items:this.fruitItems};
		this.noItemsModel = {listTitle:$L('Initially Empty'), items:this.noItems};
		this.currentModel = this.wordsModel;
		
		this.depotResult = this.controller.get("depotResult");
		
		// Bind callbacks and event handlers once, ahead of time
		this.listChangeHandler = this.listChangeHandler.bind(this);
		this.listAddHandler = this.listAddHandler.bind(this);
		this.listDeleteHandler = this.listDeleteHandler.bind(this);
		this.listReorderHandler = this.listReorderHandler.bind(this);
		this.save = this.save.bind(this);
		this.restore = this.restore.bind(this);
		this.discard = this.discard.bind(this);
		this.setResult = this.setResult.bind(this);
		
		// Set up the attributes & model for the List widget:
		this.controller.setupWidget('wordsList', {
						itemTemplate:'editablelist/listitem', 
						listTemplate:'editablelist/listcontainer', 
						addItemLabel:$L("Add..."), 
						swipeToDelete:true, 
						reorderable:true
				}, this.currentModel);

    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.wordsList = this.controller.get('wordsList');
		this.controller.listen(this.wordsList, Mojo.Event.listChange, this.listChangeHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listAdd, this.listAddHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listDelete, this.listDeleteHandler);
		this.controller.listen(this.wordsList, Mojo.Event.listReorder, this.listReorderHandler);

		this.setupDb();

		// These buttons are used to show some of the other APIs available.
		this.controller.listen('saveButton', Mojo.Event.tap, this.save);
		this.controller.listen('restoreButton', Mojo.Event.tap, this.restore);
		this.controller.listen('discardButton', Mojo.Event.tap, this.discard);
	},
	
	cleanup: function(){
		
		this.controller.stopListening(this.wordsList, Mojo.Event.listChange, this.listChangeHandler);
		this.controller.stopListening(this.wordsList, Mojo.Event.listAdd, this.listAddHandler);
		this.controller.stopListening(this.wordsList, Mojo.Event.listDelete, this.listDeleteHandler);
		this.controller.stopListening(this.wordsList, Mojo.Event.listReorder, this.listReorderHandler);
		this.controller.stopListening('saveButton', Mojo.Event.tap, this.save);
		this.controller.stopListening('restoreButton', Mojo.Event.tap, this.restore);
		this.controller.stopListening('discardButton', Mojo.Event.tap, this.discard);
	},

	setupDb: function() {
		var options = {
			name: "PersistentList",
			version: 1
		};
		this.depot = new Mojo.Depot(options, Mojo.Log.info.bind("setup db succeeded"), Mojo.Log.info);			
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
		Mojo.Log.info("EditablelistAssistant deleting '"+event.item.data+"'.");
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
			Mojo.Log.info.info("Change called.  Word is now: "+event.item.data);
		}
	},

	save: function(event) {
		this.clearResult();

		var key = this.controller.get("keyTextfield").value;
		var value = this.currentModel;
		var onSuccess = function() {
				this.setResult("Save succeeded.");
		}.bind(this);
		var onFailure = this.setResult;


		//filters are null in this example. they can be used to tag sets of objects 
		//and are used when fetching multiple.
		this.depot.add(key, value, onSuccess, onFailure);
		Mojo.Log.info("saved " + Object.toJSON(value));

	},

	restore: function(event) {
		this.clearResult();

		var key = this.controller.get("keyTextfield").value;
		
		var onSuccess = function(rs) {
			if (rs === null) {
				this.setResult("Restore got a null list.");
				this.currentModel = {listTitle:$L('Null'), items:[]};
			} else {
				this.setResult("Restore succeeded.");
				Mojo.Log.info(Object.toJSON(rs));
				this.currentModel = rs;
			}
			this.controller.setWidgetModel(this.wordsList, this.currentModel);

		}.bind(this);
		var onFailure = this.setResult;

		this.depot.get( key, onSuccess, onFailure);
	},
	
	discard: function(){
		this.clearResult();

		var key = this.controller.get("keyTextfield").value;
		
		var onSuccess = function(){
			this.setResult('Successfully discarded the list');
		}.bind(this);
		var onFailure = function(){
			this.setResult('Failed to discard the list');
		}.bind(this); 
		
		this.depot.discard( key, onSuccess, onFailure);
	},

	setResult: function(message) {
		this.depotResult.innerHTML = message;
		//this.depot._dumpTables();
		this.delayedClearResult();
	},

	delayedClearResult: function(message) {
		if(this.timeout) {
			this.controller.window.clearTimeout(this.timeout);
			this.timeout = null;
		}
		this.timeout = this.controller.window.setTimeout(
			function() {
				this.depotResult.innerHTML = "";
				this.timeout = null;
			}.bind(this), 2000);
		},

		clearResult: function(message) {
			if(this.timeout) {
				this.controller.window.clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.depotResult.innerHTML = "";

		},


		listTestWordList: [
		{data:$L("Scintillating"), definition:$L("Marked by high spirits or excitement.")},
		{data:$L("Serendipity"), definition: $L("The faculty of making fortunate discoveries by accident.")},
		{data:$L("Hullabaloo"), definition:$L("A great noise or commotion; a hubbub.")},
		{data:$L("Chortle"), definition:$L("A snorting, joyful laugh or chuckle.")},
		{data:$L("Euphonious"), definition:$L("Pleasant sounding.")}
		],


		noItems : [],
		
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
					]


	});





