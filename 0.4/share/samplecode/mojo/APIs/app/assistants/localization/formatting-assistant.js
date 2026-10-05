/**
 * @author charles bybee
 */
function FormattingAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.text1 = "Enter a number that you want to be formatted and click on the buttons ";
	this.text2 = "Click on the buttons below "
	this.text3 = "(change country in system \"Regional Settings\" to see different formats):";
}
    

FormattingAssistant.prototype.setup = function() {		
        /* this function is for setup tasks that have to happen when the scene is first created */

        /* setup widgets here */
	//Get today's date to use in date formatting
	this.now = new Date();
	//Enter the description text
	this.controller.get('string').innerText = this.text1;
	this.textFieldAtt = {
			hintText: 'number',
			textFieldName:	'number', 
			modelProperty:		'original', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			true, 
			modifierState: 	Mojo.Widget.numLock,
			//autoResize: 	automatically grow or shrink the textbox horizontally,
			//autoResizeMax:	how large horizontally it can get
			//enterSubmits:	when used in conjunction with multline, if this is set, then enter will submit rather than newline
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 30,
			requiresEnterKey: false
	};
	this.model = {
		'original' : '1000',
		disabled: false
	};

	//Setup the textfield widget and observer
	this.controller.setupWidget('mainTextField', this.textFieldAtt, this.model);
	
	//Setup the button models and attributes
	this.buttonModel1 = {
		buttonLabel : 'Format as Number',
		buttonClass : '',
		disable : false
	}
	this.buttonModel2 = {
		buttonLabel : 'Format as Currency',
		buttonClass : '',
		disable : false
	}
	this.buttonModel3 = {
		buttonLabel : 'Format as Percent',
		buttonClass : '',
		disable : false
	}
	this.buttonModel4 = {
		buttonLabel : 'Show Short Date',
		buttonClass : '',
		disable : false
	}
	this.buttonModel5 = {
		buttonLabel : 'Show Long Date',
		buttonClass : '',
		disable : false
	}
	this.buttonModel6 = {
		buttonLabel : 'Show Choices',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		//type : 'Activity'
	}

	this.formatAttributes = {
		choices: [
			{label : 'Number', value : 'Number'},
			{label : 'Date', value : 'Date'},
			{label : 'Choices', value : 'Choices'}
		]
	};

	this.formatModel = {
		//value : 'Number',
		disabled:false
	};
	//this.controller.get('groups-main').style.display = 'none';
	//Hide all the controls until the formatting selection has been made
		this.controller.get('string').style.display = 'none';
		this.controller.get('textFieldGroup').style.display = 'none';
		this.controller.get('format_number').style.display = 'none';
		this.controller.get('format_currency').style.display = 'none';
		this.controller.get('format_percent').style.display = 'none';
		this.controller.get('format_short').style.display = 'none';
		this.controller.get('format_long').style.display = 'none';
		this.controller.get('format_choices').style.display = 'none';
	
	//Now setup the buttons and listen for click events.
	this.controller.setupWidget('formatType', this.formatAttributes,this.formatModel );
	Mojo.Event.listen(this.controller.get('formatType'),Mojo.Event.propertyChange,this.formatChanged.bind(this));

	this.controller.setupWidget('format_number',this.buttonAtt1,this.buttonModel1)
    Mojo.Event.listen(this.controller.get('format_number'),Mojo.Event.tap, this.handleFormatNumber.bind(this))

	this.controller.setupWidget('format_currency',this.buttonAtt1,this.buttonModel2)
    Mojo.Event.listen(this.controller.get('format_currency'),Mojo.Event.tap, this.handleFormatCurrency.bind(this))

	this.controller.setupWidget('format_percent',this.buttonAtt1,this.buttonModel3)
    Mojo.Event.listen(this.controller.get('format_percent'),Mojo.Event.tap, this.handleFormatPercent.bind(this))

	this.controller.setupWidget('format_short',this.buttonAtt1,this.buttonModel4)
    Mojo.Event.listen(this.controller.get('format_short'),Mojo.Event.tap, this.handleFormatShortDate.bind(this))

	this.controller.setupWidget('format_long',this.buttonAtt1,this.buttonModel5)
    Mojo.Event.listen(this.controller.get('format_long'),Mojo.Event.tap, this.handleFormatLongDate.bind(this))

	this.controller.setupWidget('format_choices',this.buttonAtt1,this.buttonModel6)
    Mojo.Event.listen(this.controller.get('format_choices'),Mojo.Event.tap, this.handleFormatChoices.bind(this))
}
    
FormattingAssistant.prototype.handleFormatNumber = function(event){
	//Get the numeric value of the number in the text field and format it as a number.
	this.tempnumber1 = Mojo.Format.formatNumber(parseFloat(this.model.original),{'fractionDigits':'2'});
	this.controller.get('number_output').innerText = this.tempnumber1;
}
    
FormattingAssistant.prototype.handleFormatCurrency = function(event){
	//Get the numeric value of the number in the text field and format it as currency.
	this.tempnumber2 = Mojo.Format.formatCurrency(parseFloat(this.model.original),{'fractionDigits':'2'});
	this.controller.get('number_output').innerText = this.tempnumber2;
}
    
FormattingAssistant.prototype.handleFormatPercent = function(event){
	//Get the numeric value of the number in the text field and format it as a percent.
	this.tempnumber3 = Mojo.Format.formatPercent(parseFloat(this.model.original));
	this.controller.get('number_output').innerText  = this.tempnumber3;
}
    
FormattingAssistant.prototype.handleFormatShortDate = function(event){
	//Show today's date in localized short date format
	this.date1 = Mojo.Format.formatDate(this.now,'short');
	this.controller.get('number_output').innerText = this.date1;
}
    
FormattingAssistant.prototype.handleFormatLongDate = function(event){
	//Show today's date in localized long date format.
	this.date2 = Mojo.Format.formatDate(this.now,'long');
	this.controller.get('number_output').innerText = this.date2;
}
    
FormattingAssistant.prototype.handleFormatChoices = function(event){
	//Show the choice text depending on the value in the text field.
	this.anumber = parseInt(this.model.original);
    this.choicemodel = { num: this.anumber };
    this.stringtoprint = Mojo.Format.formatChoice(this.anumber, "0#You entered zero.|1#You entered one.|1>#You entered the number #{num}.|#You didn't enter a number!", this.choicemodel);
	this.controller.get('number_output').innerText = this.stringtoprint;
}
    
FormattingAssistant.prototype.formatChanged = function(event){
	//Show the appropriate controls based on the selected formatting type.
		this.controller.get('string').style.display = 'block';
		this.controller.get('textFieldGroup').style.display = 'block';
	if (event.value === 'Date') {
		this.controller.get('number_output').innerText = ('');
		this.controller.get('string').innerText = (this.text2 + this.text3);
		this.controller.get('textField').style.display = 'none';
		this.controller.get('format_number').style.display = 'none';
		this.controller.get('format_currency').style.display = 'none';
		this.controller.get('format_percent').style.display = 'none';
		this.controller.get('format_short').style.display = 'block';
		this.controller.get('format_long').style.display = 'block';
		this.controller.get('format_choices').style.display = 'none';
		this.controller.get('Label').innerText('Date is');
	} else if (event.value === 'Choices'){
		this.controller.get('string').innerText = ('Enter the following in any sequence - 0, 1, any other number, or any non-number and click "Show Choices".');
		this.controller.get('number_output').innerText = ('');
		this.controller.get('textField').style.display = 'block';
		this.controller.get('format_number').style.display = 'none';
		this.controller.get('format_currency').style.display = 'none';
		this.controller.get('format_percent').style.display = 'none';
		this.controller.get('format_short').style.display = 'none';
		this.controller.get('format_long').style.display = 'none';
		this.controller.get('format_choices').style.display = 'block';
		this.controller.get('Label').innerText = ('Choice is');
	} else {
		this.controller.get('string').innerText = (this.text1 + this.text3);
		this.controller.get('number_output').innerText = ('');
		this.controller.get('textField').style.display = 'block';
		this.controller.get('format_number').style.display = 'block';
		this.controller.get('format_currency').style.display = 'block';
		this.controller.get('format_percent').style.display = 'block';
		this.controller.get('format_short').style.display = 'none';
		this.controller.get('format_long').style.display = 'none';
		this.controller.get('format_choices').style.display = 'none';
		this.controller.get('Label').innerText = ('Enter Number');
	}
}

FormattingAssistant.prototype.activate = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
}


FormattingAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('formatType'),Mojo.Event.propertyChange,this.formatChanged.bind(this));
    Mojo.Event.stopListening(this.controller.get('format_number'),Mojo.Event.tap, this.handleFormatNumber.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_currency'),Mojo.Event.tap, this.handleFormatCurrency.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_percent'),Mojo.Event.tap, this.handleFormatPercent.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_short'),Mojo.Event.tap, this.handleFormatShortDate.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_long'),Mojo.Event.tap, this.handleFormatLongDate.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_choices'),Mojo.Event.tap, this.handleFormatChoices.bind(this))
}

FormattingAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('formatType'),Mojo.Event.propertyChange,this.formatChanged.bind(this));
    Mojo.Event.stopListening(this.controller.get('format_number'),Mojo.Event.tap, this.handleFormatNumber.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_currency'),Mojo.Event.tap, this.handleFormatCurrency.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_percent'),Mojo.Event.tap, this.handleFormatPercent.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_short'),Mojo.Event.tap, this.handleFormatShortDate.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_long'),Mojo.Event.tap, this.handleFormatLongDate.bind(this))
    Mojo.Event.stopListening(this.controller.get('format_choices'),Mojo.Event.tap, this.handleFormatChoices.bind(this))
}
