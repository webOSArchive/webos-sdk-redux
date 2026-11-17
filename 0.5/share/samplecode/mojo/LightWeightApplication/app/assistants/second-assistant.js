function SecondAssistant(argFromPusher) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.currentValue = argFromPusher;
 }
    

SecondAssistant.prototype.setup = function() {
	this.controller.get('area-to-update').update(this.currentValue);
	this.textFieldAtt = {
		hintText: 'hint',
		textFieldName:	'name', 
		modelProperty:		'originalValue', 
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
	//Create the model for the text field
	this.model = {
		originalValue : "Text to send back"
	};
	this.controller.setupWidget('SecondInputField', this.textFieldAtt, this.model);

	this.buttonModel2 = {
		buttonLabel : 'Pop back (with argument)',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt2 = {
		//type : 'Activity'
	}
	
	// If a back gesture is used to pop the scene, no arguments are passed back,
	// so set up a button to use to pop the scene with arguments to send back.
	this.controller.setupWidget('pop_button',this.buttonAtt2,this.buttonModel2);
	this.handlePopBinder = this.handlePop.bind(this);
    Mojo.Event.listen(this.controller.get('pop_button'),'mojo-tap', this.handlePopBinder)
}
    
SecondAssistant.prototype.handlePop = function(){
	//pop the current scene off the scene stack
     this.controller.stageController.popScene(this.model.originalValue);
}

SecondAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


SecondAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
    Mojo.Event.stopListening(this.controller.get('pop_button'),'mojo-tap', this.handlePopBinder)
}

SecondAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    Mojo.Event.stopListening(this.controller.get('pop_button'),'mojo-tap', this.handlePopBinder)
}
