/*
	Demonstrates placing widgets inside a list. At the time this was made, radio buttons had a style bug and 
	were slightly wider than they should be.
*/



SubwidgetsAssistant = Class.create( FLibExample, {
	
	
	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Widgets in Lists'
		})
		
		// Set up attributes & model for the list widget:
		this.controller.setupWidget('widgetList', {itemTemplate:'subwidgets/subwidgets-item'}, this.widgetList);
		
		
		// Set up attributes for the list widgets by name.
		// These attribuet objects are used for all widgets of the given name (one in each list item).
		// The models for the widgets are all different, and come from the list's item objects,
		// so all widgets in a particular list item share the same model.
		this.controller.setupWidget('listToggle1', {modelProperty : 'volume', choices:this.laughTypes});
		this.controller.setupWidget('listToggle2', {modelProperty : 'frequency', choices:this.laughFreq});    
		this.controller.setupWidget('listSelector1', {label: 'Laugh', modelProperty: 'laugh', choices: this.laughChoices});
		
	},
	
	
	
	// Choices for various widgets
	laughChoices: [{label:'Cackle', value:"cackle"}, 
					{label:'Chortle', value:"chortle"}, 
					{label:'Giggle', value:"giggle"}, 
					{label:'Guffaw', value:"guffaw"}, 
					{label:'Snigger', value:"snigger"}
				],
	
	laughTypes : [
				{label : 'Quiet', value : 'quietLaugh'},
				{label : 'Normal', value : 'normLaugh'},
				{label : 'Loud', value : 'loudLaugh'},
			],
	
	laughFreq : [
				{label : 'Rarely', value : 'rareLaugh'},
				{label : 'Constantly', value : 'alwaysLaugh'},
			],
	
	
			// items for the main list widget.
			widgetList: {items:[
								{laugh:'cackle', volume:'quietLaugh', frequency:'alwaysLaugh'},
								{laugh:'giggle', volume:'normLaugh', frequency:'rareLaugh'},
								{laugh:'chortle', volume:'normLaugh', frequency:'alwaysLaugh'},
								{laugh:'snigger', volume:'loudLaugh', frequency:'rareLaugh'}
								]}
	
});


