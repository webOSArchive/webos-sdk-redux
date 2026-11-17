/*
	Example of the Date & Time picker widgets.
*/
DatetimeAssistant = Class.create( FLibExample, {


	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Date, Time and Number Pickers'
		});
		
		// The date & time picker widgets can be used to edit a Date object in the widget model.
		this.controller.setupWidget('timepicker', this.timeAtts, this.pickerModel);
		this.controller.setupWidget('datepicker', this.dateAtts, this.pickerModel);
		
		// The integer picker edits an integer valued model property.
		this.controller.setupWidget('intpicker', this.intPickerAtts, this.pickerModel);
		
		// The date & time picker widgets send propertyChange events when the Date object is modified.
		this.propChange = this.propChange.bind(this);
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('timepicker', Mojo.Event.propertyChange, this.propChange);
		this.controller.listen('datepicker', Mojo.Event.propertyChange, this.propChange);
		
		this.intPropChange = this.intPropChange.bind(this);
		this.controller.listen('intpicker', Mojo.Event.propertyChange, this.intPropChange);
		
		this.outputDiv = this.controller.get('output');
	},
	
	cleanup: function() {
		
		this.controller.stopListening('timepicker', Mojo.Event.propertyChange, this.propChange);
		this.controller.stopListening('datepicker', Mojo.Event.propertyChange, this.propChange);
		this.controller.stopListening('intpicker', Mojo.Event.propertyChange, this.intPropChange);
	},
	
	propChange: function(event) {
		this.outputDiv.innerHTML = "<div>"+event.value.toLocaleString()+"</div>"+this.outputDiv.innerHTML;
		Mojo.Log.info("propertyChange: %s", event.value);
	},
	
	intPropChange: function(event) {
		this.outputDiv.innerHTML = "<div>New int value: "+event.value+"</div>"+this.outputDiv.innerHTML;
		Mojo.Log.info("propertyChange: new int value %s", this.pickerModel.myValue);
	},
	
	timeAtts: {
		label: 'Time:',
		labelPlacement: Mojo.Widget.labelPlacementLeft,
		minuteInterval: 30
	},
	dateAtts: {
		label: 'Date:',
		// The date picker defaults to using the 'date' model property.
		// We change it to 'time' here, so it will edit the same object as the time picker.
		modelProperty: 'time',
		month: false,	// Hide the month selector
		day: true,		// show the day selector, this is the default behavior
		year: true,		// show the year selector, this is the default behavior
		minYear: 2000,
		maxYear: 2010
	},
	intPickerAtts: {
		modelProperty:'myValue',
		min:30, 
		max:50
	},
	pickerModel: {
		time:new Date(), 
		myValue:42
	}
	
});

