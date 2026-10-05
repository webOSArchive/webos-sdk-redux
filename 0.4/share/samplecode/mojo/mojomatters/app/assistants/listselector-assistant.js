
/*
Demonstrates use of SelectorList widget. One listselector changes the set of options in the other. There is a toggle switch that
alternates between disabling and enabling the selectors.
*/

ListselectorAssistant = Class.create(FLibExample, {
	
	initialize: function(){
		
	},

	setup: function() {
		
		// Set up view menu as scene header
		this.setupMenus({
			header: 'List Selectors'
		})
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.selectorChanged = this.selectorChanged.bind(this);
		
		// Primes the second selector with choices
		this.selectorChanged();
		
		//	Instantiate each selector
		this.controller.setupWidget('firstSelector', this.firstAttributes, this.firstModel);
		this.controller.setupWidget('secondSelector', this.secondAttributes, this.secondModel);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('firstSelector', Mojo.Event.propertyChange, this.selectorChanged);
		
		// Setup disabler toggle
		//	Want a better example for the toggle switch? Check togglebutton-assistant.js
		this.handleToggleSwitch = this.handleToggleSwitch.bind(this);
		this.controller.setupWidget('disablerToggle', {trueLabel: 'Disabled', falseLabel: 'Enabled'}, { value: false });
		this.controller.listen('disablerToggle', Mojo.Event.propertyChange, this.handleToggleSwitch);
		
	},
	
	handleToggleSwitch: function(e){
		this.secondModel.disabled = e.value;
		this.firstModel.disabled = e.value;
		this.controller.modelChanged(this.secondModel);
		this.controller.modelChanged(this.firstModel);
	},

	selectorChanged: function(event) {
		
		// Update secondModel with new choices when firstSelector is changed
		if(this.secondModel.choices != this[this.firstModel.firstValue]){
			this.secondModel.choices = this[this.firstModel.firstValue];
			this.secondModel.value = this.secondModel.choices[0].value;
		}
		
		this.controller.modelChanged(this.secondModel);
		
	},
	
	cleanup: function(){
		
			// We need to manually stop listening to events until the framework is updated to clean these up automatically
			this.controller.stopListening('firstSelector', Mojo.Event.propertyChange, this.selectorChanged);
			this.controller.stopListening('disablerToggle', Mojo.Event.propertyChange, this.handleToggleSwitch);
	},



	// Define models for each selctor
	firstAttributes: {
		label: $L('First'), 
		choices: [
				{label: $L('Statuses'), value: 'statuses'},
				{label: $L('Transports'), value: 'transports'},
				{label: $L('Work'), value: 'work'},
				{label: $L('Tests'), value: 'testChoices'}
		], 

		// Store selected value in 'firstValue' instead of the default of 'value'
		//	When a new item is chosen from the selector, the event handler (in this case this.selectorChanged)
		//  gets passed an event with a value property (e.value) that is the new value and a model property that
		//	includes the updated model (new value can be accessed from e.model.firstValue in this case)
		modelProperty:'firstValue' 
	},
	firstModel: {
		firstValue: 'statuses' 
	},
	secondAttributes: {
		label: $L('Second'),
		labelPlacement: Mojo.Widget.labelPlacementLeft
	},
	secondModel: {
		// Default starting value is the option with the value of 'away'
		value: 'away',
		choices: {}
	},
	
	
	
	// Options for list selector choices:
	//	These use lots of different types of content, with different options and icons
	statuses: [                  
			{label:$L('Away'), value:"away", secondaryIcon:'status-away'}, 
			{label:$L('Available'), value:"available" , secondaryIcon:'status-available', disabled:true}, 
			{label:$L('Offline'), value:"offline", secondaryIcon:'status-offline'} 
	],
	
	transports:  [{label:'OnePerson', value:"gtalk", secondaryIcon:'status-offline', icon:'gtalk'},
				{label:'AnotherPerson', value:"aim", secondaryIcon:'status-available', icon:'aim'}
	],
	
	work: [
		{label:$L('Assiduous'), value:"assiduous", secondaryIcon:'status-away'}, 
		{label:$L('Diligent'), value:"diligent"}, 
		{label:$L('Earnest'), value:"earnest"},
		{label:$L('Easy'), value:"easy"},
		{label:$L('Hard'), value:"hd"},
		{label:$L('Hardly'), value:"hdly"},
		{label:$L('Hard boiled wonderland and the end of the world'), value:"hb"},
		{label:$L('Whatever'), value:"whatever"}
		],
	
	testChoices: 	[           
	        
			{label:$L('Send Message to...'), value:"Send Message to...", disabled:true },                                                                                        
			{label:$L('PHONE')},  
			{label:$L('553-555-5555 (m)'), value:"111-222-3333 (m)'), value" , disabled:true},
			{label:$L('AIM')},  
			{label:$L('Johnny.Cash'), value:"AIM - Johnny.Cash", secondaryIcon:'status-available' },   
			{label:$L('GTALK - jkodama')},  
			{label:$L('GTALK - justing')},  
			{label:$L('Sparks McGee'), value:"GTALK - Sparks McGee", secondaryIcon:'status-available' },
			{label:$L('GOOGLE')},  
			{label:$L('afakeperson@gmail.com'), value:"afakeperson@gmail.com", icon:'gtalk' },   
			{label:$L('PERSONAL')},  
			{label:$L('afakeperson@gmail.com'), value:"afakeperson@gmail.com", icon:'exchange' },
			{label:$L('PALM')},  
			{label:$L('afakeperson@gmail.com'), value:"afakeperson@gmail.com", icon:'palm' },
			{label:$L('jafakeperson@gmail.com'), value:"jafakeperson@gmail.com", secondaryIcon:'color-chip-green' }

	],
	

});


