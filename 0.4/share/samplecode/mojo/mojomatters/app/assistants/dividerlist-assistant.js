/*
	Demonstrates a list with dividers. 
*/

DividerlistAssistant = Class.create( FLibExample, {
	
	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'List Dividers'
		});
		
		// Bind event handlers once, ahead of time
		this.dividerFunc = this.dividerFunc.bind(this);
		this.itemRendered = this.itemRendered.bind(this);
		
		// Set up for the list widget.
		// Note that we specify a callback function for loading list items in the widget attributes.
		this.controller.setupWidget('wordList', 
									{itemTemplate:'dividerlist/listitem', 
									listTemplate:'dividerlist/listcontainer', 
									dividerFunction: this.dividerFunc, 
									onItemRendered: this.itemRendered},
									{listTitle: $L('Words'), 
									items:this.wordItems});
				
	},
	
	
	/*
		List dividers work by specifying a function for the 'dividerFunction' widget attribute.
		This function works kind of like a data formatter function... it's called with the item model
		during list rendering, and it returns a label string for the divider.
		
		The List widget takes care of inserting an actual divider item whenever the label is different
		between two consecutive items.
		
		This example generates list dividers based on the first letter of each item.
	*/
	dividerFunc: function(itemModel) {
		return itemModel.data.toString()[0];
	},
	
	/*
		This is an example of an 'item rendered' callback.
		It will be called each time an item is rendered, giving app code the chance to modify rendered list items if needed.
	*/
	itemRendered: function(listWidget, itemModel, itemNode) {
				
		// Set background to a random color.
		// Generally this kind of thing should be done with the model & item template, but 
		// it makes for a reasonable demonstration of how the callback works.
		itemNode.style.backgroundColor=this.randomColor();
	},
	
	
	randomColor: function() {
		var colorElements = [9,'A', 'B', 'C', 'D', 'E', 'F'];
		var colorStr = '#';
		
		colorStr += colorElements[Math.floor(Math.random() * colorElements.length)];
		colorStr += colorElements[Math.floor(Math.random() * colorElements.length)];
		colorStr += colorElements[Math.floor(Math.random() * colorElements.length)];
		
		return colorStr;
	},
	
	
	wordItems: [
		{data:$L("Aura")},
		{data:$L("Arugula")},
		{data:$L("Apricot")},
		{data:$L("Abstract")},
		{data:$L("Almanac")},
		{data:$L("Amazement")},
		{data:$L("Autumn")},
		{data:$L("Ballistic")},
		{data:$L("Blizzard")},
		{data:$L("Blueberry")},
		{data:$L("Brandy")},
		{data:$L("Brouhaha")},
		{data:$L("Caffeine")},
		{data:$L("Cheddar")},
		{data:$L("Chocolate")},
		{data:$L("Chortle")},
		{data:$L("Cornflower")},
		{data:$L("Courage")},
		{data:$L("Concertina")},
		{data:$L("Curiosity")},
		{data:$L("Daisy")},
		{data:$L("Enticing")},
		{data:$L("Eternity")},
		{data:$L("Euphonious")},
		{data:$L("Fontina")},
		{data:$L("Forclempt")},
		{data:$L("Giraffe")},
		{data:$L("Gorgonzola")},
		{data:$L("Guffaw")},
		{data:$L("Hilarity")},
		{data:$L("Hullabaloo")},
		{data:$L("Ironic")},
		{data:$L("Legend")},
		{data:$L("Linoleum")},
		{data:$L("Magnificent")},
		{data:$L("Margarita")},
		{data:$L("Measle")},
		{data:$L("Miraculous")},
		{data:$L("Orchestrion")},
		{data:$L("Possibility")},
		{data:$L("Peculiar")},
		{data:$L("Platypus")},
		{data:$L("Plurality")},
		{data:$L("Remarkable")},
		{data:$L("Roquefort")},
		{data:$L("Scintillating")},
		{data:$L("Serendipity")},
		{data:$L("Shadow")},
		{data:$L("Snigger")},
		{data:$L("Sublime")},
		{data:$L("Strawberry")},
		{data:$L("Stupendous")},
		{data:$L("Truthy")},
		{data:$L("Tangerine")},
		{data:$L("Verdant")},
		{data:$L("Vermillion")},
		{data:$L("Watermelon")},
		{data:$L("Wensleydale")},
		{data:$L("Wisdom")},
		{data:$L("Wonder")}
		]
	


});





