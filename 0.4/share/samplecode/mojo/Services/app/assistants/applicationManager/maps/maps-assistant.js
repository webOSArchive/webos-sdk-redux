function MapsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MapsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
		var attributes = {
				hintText: 'hint',
				textFieldName:	'Map Query', 
				modelProperty:		'fieldValue', 
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
			'fieldValue' : 'Palm,Sunnyvale,CA',
			disabled: false
		};

		this.controller.setupWidget('textField', attributes, this.model);
	
	/* add event handlers to listen to events from widgets */
    this.controller.listen($('map_it_button'),Mojo.Event.tap, this.handleMapButtonPressed.bind(this))
}

MapsAssistant.prototype.handleMapButtonPressed = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
    method: 'launch',
    parameters: {
        id:"com.palm.app.maps",
        params:{"query":this.model.fieldValue}
    }
});
}
MapsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


MapsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MapsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    this.controller.stopListening($('map_it_button'),Mojo.Event.tap, this.handleMapButtonPressed.bind(this))
}
