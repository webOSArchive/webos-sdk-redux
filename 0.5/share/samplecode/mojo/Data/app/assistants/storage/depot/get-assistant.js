function GetAssistant(arg){
	this.demoDepot = arg;
}

GetAssistant.prototype.setup = function(){
	this.keyAtt = {
		hintText: 'Enter key here',
		textFieldName:	'key', 
		modelProperty:		'originalValue', 
		multiline:		false,
		disabledProperty: 'disabled',
		focus: 			true, 
		modifierState: 	Mojo.Widget.capsLock,
		limitResize: 	false, 
		holdToEnable:  false, 
		focusMode:		Mojo.Widget.focusSelectMode,
		changeOnKeyPress: true,
		textReplacement: false,
		maxLength: 30,
		requiresEnterKey: false
	};
	this.keyModel = {
		originalValue : ''
	};
	
	//Setup the textfield widget and observer
	
	this.controller.setupWidget('key', this.keyAtt, this.keyModel);
	this.get = this.get.bindAsEventListener(this);
	this.discard = this.discard.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('get_button'),Mojo.Event.tap, this.get.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('discard_button'),Mojo.Event.tap, this.discard.bindAsEventListener(this));
}

GetAssistant.prototype.get = function(){
	Mojo.Log.info('KEY: ' + this.controller.get('key').mojo.getValue())
	if (this.controller.get('key').mojo.getValue() == '') {
		Mojo.Controller.errorDialog("Please enter a key.");
	}
	else {
		this.dbGetSuccess = this.dbGetSuccess.bind(this);
		this.dbFailure = this.dbFailure.bind(this)
		this.demoDepot.get(this.keyModel.originalValue, this.dbGetSuccess, this.dbFailure);
	}
}

GetAssistant.prototype.discard = function(){
	if (this.controller.get('key').mojo.getValue() == '') {
		Mojo.Controller.errorDialog("Please enter a key.");
	}
	else {
		this.demoDepot.discard(this.controller.get('key').mojo.getValue(), this.dbDiscardSuccess.bind(this), this.dbDiscardFailure.bind(this));
	}
}
GetAssistant.prototype.dbDiscardSuccess = function(response){
	this.controller.get('response').update('DISCARD SUCCESS');
	Mojo.Log.info('Response ' + Object.toJSON(response));
}
GetAssistant.prototype.dbDiscardFailure = function(response){
	this.controller.get('response').update('DISCARD FAILURE');
}	
GetAssistant.prototype.dbGetSuccess = function(response){
	
	var recordSize = Object.values(response).size();
	if(recordSize == 0) {
		this.controller.get('response').update("No such record in the database");
	} else {
		this.controller.get('response').update("Data entry is: " + response.arg1 + " : " + response.arg2);
	}
}

GetAssistant.prototype.dbFailure = function(transaction, result) {
	console.log("***** depot failure: " + result.message);
}
GetAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('get_button'),Mojo.Event.tap,this.handleDownloadButton)
	Mojo.Event.stopListening(this.controller.get('discard_button'),Mojo.Event.tap,this.handleUploadButton)
}