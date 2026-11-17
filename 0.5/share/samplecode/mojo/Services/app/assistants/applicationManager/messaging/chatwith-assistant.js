function ChatwithAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ChatwithAssistant.prototype.setup = function() {
	
	this.textFieldAtt = {
			hintText: 'hint',
			textFieldName:	'name', 
			modelProperty:		'original', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			true, 
			modifierState: 	Mojo.Widget.capsLock,
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
		'original' : '4085555555',
		disabled: false
	};

	//Setup the textfield widget and observer
	this.controller.setupWidget('toContactsPicker', this.textFieldAtt, this.model);
	
	this.controller.listen('send',Mojo.Event.tap, this.handleSend.bind(this) );
}

ChatwithAssistant.prototype.handleSend = function(){
	
	// Retrieve contact info
	// Serialize the form into a hash for params to messaging service. This is mainly
	// useful for building out the recipient array from the contacts picker.
		var params = Mojo.View.serializeMojo($('composeForm'),true);
		//$('response').update(Object.toJSON(params.to$A[0]));
		this.id = params.to$A[0].id;
		this.personId = params.to$A[0].personId;
		
		// Send request
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				id: 'com.palm.app.messaging',
				params: {
					personId: this.personId, 
					contactPointId: this.id 
				}
			},
			onSuccess: this.handleOKResponse,
			onFailure: this.handleErrResponse
		});
  		
}

ChatwithAssistant.prototype.handleOKResponse = function(response){
	$('response').update("Success service response: <br><br>" + Object.toJSON(response));																	 
}

ChatwithAssistant.prototype.handleErrResponse = function(response){
	$('response').update("Error service response: <br><br>" + Object.toJSON(response));																		 
    return;
}

ChatwithAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ChatwithAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ChatwithAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('send',Mojo.Event.tap, this.handleSend.bind(this) );
}
