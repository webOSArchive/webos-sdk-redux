/*
  Demonstrates use of the data formatter support in SmallList.
  This mechanism is still quite new (as of 7/9) and may be changing somewhat as we find issues with it.
  
  The attributes passed to setupWidget() contains a 'formatters' property 
  that maps model property names to formatter functions to apply to them.
*/

FormatterdemoAssistant = Class.create( FLibExample, {
  
  setup: function() {
    
	// Set up view menu with scene header
	this.setupMenus({
		header: 'Formatters'
	});
       
	// Bind listeners and event handlers once, ahead of time
	this.listChangeHandler = this.listChangeHandler.bind(this);
	this.formatNumber = this.formatNumber.bind(this);
	this.formatOther = this.formatOther.bind(this);
	
	
	this.numbersAtts.formatters = {				// If an items property has a corresponding formatter, its property is passed through
		number: this.formatNumber,		// and the results are made available in the view as #{propertyFormatted}
		other: this.formatOther
	};
	
	this.controller.setupWidget('numbersList', this.numbersAtts, this.numbersModel);
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
    this.controller.listen('numbersList', 'mojo-list-change', this.listChangeHandler);
  },
  
	
  listChangeHandler: function(event) {
    if(event.originalEvent.target.tagName == "INPUT") {
      event.item.number = event.originalEvent.target.value;
      
      // Call modelChanged so that the list is re-rendered, and formatters are re-applied.
      this.controller.modelChanged(this.numbersModel);
    }
  },
  
  
  formatNumber: function(n, model) {
    
    // Convert via simple array if it's < 20
    var result = this.digitToString[n];
    if(result !== undefined) {
      return result;
    }
    
    // Handle a few mathematical constants:
    switch(n) {
      case "pi": return "3.1415926535";
      case "e": return "2.718281828459045";
      case "c": return "299,792,458 m/s";
    }
    
    // Otherwise, cop out:
    return $L("the number ")+n;
  },
	formatOther: function(other, model){
		if(model.yetMore == 'noother')
			return '';
		
		switch(other){
			case 'Pi': return 'Pi is cool.';
			case 'Pie': return 'But Pie is better.';
		}
		
		return '';
	},
   
  digitToString: [
    $L("zero"), $L("one"), $L("two"), $L("three"), $L("four"), $L("five"), $L("six"), $L("seven"), $L("eight"), $L("nine"), 
    $L("ten"), $L("eleven"), $L("twelve"), $L("thirteen"), $L("fourteen"), $L("fifteen"), $L("sixteen"), $L("seventeen"), $L("eighteen"), $L("nineteen"), $L("twenty")
    ],
  
	numbersModel: {
		listTemplateAttr: { listTitle: $L('Fun Words')}, 
		items: [
	      {number:"1"},
	      {number:"18", other: 'Pie', yetMore: 'noother'},
	      {number:"pi", other: 'Pi'},
	      {number:"pie", other: 'Pie'},
   	]},
	numbersAtts: {
		itemTemplate: 		'formatterdemo/listitem', // Template for rendering each item
		itemsProperty: 		'items',	// Default is items, property 
	}
  
});





