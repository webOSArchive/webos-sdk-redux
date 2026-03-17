/*
	When your list is best navigated with a search field, particularly one where you would instantly filter the 
	list as each character is typed into the field, you would want to use the FilterList widget. 
	It is intended to display a variable length list of objects, which can be filtered through a call back function.
	
	This example uses a list with 10,000 rows which include the numbers 1-10000 so that you can filter them
	down by typing in digits. 
*/

FilterlistAssistant = Class.create( FLibExample, {
	initialize : function() {
		
		this.entireList = [];
		this.total = 10000;
		for (var i = 0; i < this.total; i++) {
			this.entireList.push({ display: "" + (i+1) });
		}
		
	},


	setup: function() {	
		
		this.setupMenus({
			header: 'Filtered Lists',
			commandMenu: {
				items: [
					{ label: "Trim to 15", command: 'setlen' }
				]
			}
		});
		
		// Bind event handlers and other functions once
		this.formatNumber = this.formatNumber.bind(this);
		this.list = this.list.bind(this);
		this.tapped = this.tapped.bind(this);
		this.buttonTapped = this.buttonTapped.bind(this);
		
		// Store references
		this.filterlist = this.controller.get('filterlist')
		
		var attributes = {
			itemTemplate: 'filterlist/entry',
			swipeToDelete: true,
			reorderable: true,
			filterFunction: this.list,
			formatters:{display:this.formatNumber},
			optimizedOptIn: true,
			delay: 2000,
		};
		this.model = {
			disabled: false
		};

		// Setup widgets m'yah
		this.controller.setupWidget('filterlist', attributes, this.model);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('filterlist', Mojo.Event.listTap, this.tapped);
		this.controller.listen('button', Mojo.Event.tap, this.buttonTapped);
		this.disabled = false;
		
	},
	
	cleanup: function(){
		// Stop listening to events we've started listening to in .setup()
		this.controller.stopListening('filterlist', Mojo.Event.listTap, this.tapped);
		this.controller.stopListening('button', Mojo.Event.tap, this.buttonTapped);
	},

	handleCommand: function(event) {
		Mojo.Log.info("got command: " + event.command);
		if (event.command === 'setlen') {
			
			// Changes the number of elements in the list
			this.widget.mojo.setLength(15);
		}
	},
	
	gotFilter: function(event) {
		Mojo.Log.info("GOT FILTER EVENT IN CLIENT, str=" + event.filterString);
	},

	buttonTapped: function(event) {
	 	this.filterlist.mojo.open();
	},
	
	tapped: function(event) {
		Mojo.Controller.stageController.pushScene('empty');
	},


	formatNumber: function(n, model) {
		return "entry " + n;
	},

	list: function(filterString, listWidget, offset, count) {
		this.widget = listWidget;
		var subset = [];
		var totalSubsetSize = 0;
		Mojo.Log.info("list asked for items: filter=" + filterString + " offset=" + offset + " limit=" + count);
		
		var cursor = 0;
		while (true) {
			if (cursor >= this.entireList.length) {
				break;
			}
			
			if (this.entireList[cursor].display.indexOf(filterString) != -1) {
				if (subset.length < count && totalSubsetSize >= offset) {
					subset.push(this.entireList[cursor]);
				}
				totalSubsetSize++;
			}
			cursor++;
		}
		
		var up = function() {
			Mojo.Log.info("calling noticeUpdatedItems: offset=" + offset + " result count=" + subset.length + " items=" + subset.toJSON());
		
			// Explanations of a lot of these are in the list widget's docs
			listWidget.mojo.noticeUpdatedItems(offset, subset);
		}
		up.delay(1);
		
		if (this.filter !== filterString) {
			var f = function() {
				Mojo.Log.info("setting list length and count to " + totalSubsetSize);
				listWidget.mojo.setLength(totalSubsetSize);
				listWidget.mojo.setCount(totalSubsetSize);
			}
			f.delay(2);
		}
		this.filter = filterString;
	},
	
	activate: function() {
	}
});