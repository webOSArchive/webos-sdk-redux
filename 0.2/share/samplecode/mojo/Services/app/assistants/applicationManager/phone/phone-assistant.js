function PhoneAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PhoneAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.textFieldAtt = {
			hintText: 'Enter number to call',
			textFieldName:	'name', 
			modelProperty:		'originalValue', 
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
			maxLength: 20,
			requiresEnterKey: false
	};
	//Create the model for the text field
	this.txtModel = {
		originalValue : '14086177000'
	};
	
	//Setup the textfield widget and observer
	this.controller.setupWidget('PhoneNumTextField', this.textFieldAtt, this.txtModel);
	
	this.controller.listen(this.controller.get('LaunchPhoneButton1'),Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.listen(this.controller.get('LaunchPhoneButton2'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
}
PhoneAssistant.prototype.handleButton1Pressed = function(event) {
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
             method: 'launch',
             parameters: {
                 id:     "com.palm.app.phone"
             }
    });
}
PhoneAssistant.prototype.handleButton2Pressed = function(event) {
	if (this.txtModel.originalValue.length < 7) {
		this.controller.showAlertDialog({
			onChoose: function(value){
			},
			title: 'Number error',
			message: 'Please enter a valid phone number',
			choices: [{
				label: 'OK',
				value: 'OK',
				type: 'color'
			}]
		});
	}
	else {
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			 method : 'open',
			 parameters: {
                target: "tel://" + this.txtModel.originalValue
                
            }
		});
	}	
}

PhoneAssistant.prototype.handleServiceResponse = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}
PhoneAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


	PhoneAssistant.prototype.deactivate = function(event) {
		/* remove any event handlers you added in activate and do any other cleanup that should happen before
		   this scene is popped or another scene is pushed on top */
	}
	
	PhoneAssistant.prototype.cleanup = function(event) {
		/* this function should do any cleanup needed before the scene is destroyed as 
		   a result of being popped off the scene stack */
	this.controller.stopListening(this.controller.get('LaunchPhoneButton1'),Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.stopListening(this.controller.get('LaunchPhoneButton2'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
	}
