/*
	FilterField is a widget that catches unfocused key events and passes them to a function that
	you can use to prune data. This example has no data, but walks you through the mechanics of 
	using a FilterField widget.
*/

FilterfieldAssistant = Class.create( FLibExample, {
	initialize : function() {
	},


	setup: function() {	
		
		this.setupMenus({
			header: 'Filter Field Widget'
		});
		
		var attr = {
			filterFieldName: "name",
			delay: 1000,
			filterFieldHeight: 100
		};
		this.model = {
			disabled: false
		};
		
		// Bind them handlers!
		this.clicked = this.clicked.bind(this);
		this.filter = this.filter.bind(this);
		
		// Store references to reduce the use of controller.get()
		this.filterField = this.controller.get('filterField');
		
		// Setup the widget
		this.controller.setupWidget('filterField', attr, this.model);
		this.controller.setupWidget('disableCheckbox', {}, {});
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('filterField', Mojo.Event.filter, this.filter);
		this.controller.listen('disableCheckbox', Mojo.Event.propertyChanged, this.clicked);
	},
	
	cleanup: function(){
		this.controller.stopListening('filterField', Mojo.Event.filter, this.filter);
		this.controller.stopListening('disableCheckbox', Mojo.Event.propertyChanged, this.clicked);
	},

	focused: function() {
		Mojo.Log.info("focused temp");
	},

	filter: function(event) {
		// This is where we would normally perform some filters on our results.
		// 	But this example has no real results, so we'll just pretend.
		
		// You could call some functions to prune down the results being shown elsewhere,
		//  Or just log the new string we're using to filter
		var filterString = event.filterString;
		Mojo.Log.info("VALUE '" + event.filterString+"'");
		
		
		if (this.filterField) {
			//	Once you know how many results you have after you've pruned your results,
			//	Updated the count using mojo.setCount(). This changes the number in the little
			//	bubble, adjacent to where the filter string is displayed
			this.filterField.mojo.setCount(5);
		}
	},

	clicked: function(event) {
		this.model.disabled = event.value;
		this.controller.modelChanged(this.model);
	}
});