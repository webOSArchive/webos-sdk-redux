/**
 * @author charles bybee
 */
function LocalizationAssistant() {

 }
    

LocalizationAssistant.prototype.setup = function() {
// set the initial value and the key for translating the text
// Look in resources/es_es/strings.json for the translation for the below
	this.controller.get('headertext').innerText = ($L('Translation'));
// and for the 'TAP HERE' text.
	var temptext = $L({
		'value': 'Change language to Espa&#241;ol (Espa&#241;a) in system "Regional Settings" to see the translation.', 
		'key': 'text_key'
		});	//–	
	$('text').update(temptext);
//

// a local object for button attributes
    this.buttonAttributes = {};

// a local object for button model
    this.buttonModel = {
        buttonLabel : $L('TAP HERE'),
        buttonClass : '',
        disabled : false
        };


// set up the button
    this.controller.setupWidget("MyButton", this.buttonAttributes, this.buttonModel);
// bind the button to its handler
    Mojo.Event.listen(this.controller.get('MyButton'), Mojo.Event.tap, this.handleButtonPress.bind(this));
}
    
LocalizationAssistant.prototype.handleButtonPress = function(event){
// the button does nothing. It just demonstrates the translation.
}

LocalizationAssistant.prototype.activate = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
}


LocalizationAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
    Mojo.Event.listen(this.controller.get('MyButton'), Mojo.Event.tap, this.handleButtonPress.bind(this));
}

LocalizationAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    Mojo.Event.listen(this.controller.get('MyButton'), Mojo.Event.tap, this.handleButtonPress.bind(this));
}
