function BrowserAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

BrowserAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	this.textFieldAtt = {
		hintText: 'URL',
		textFieldName:	'name', 
		modelProperty:		'originalValue', 
		multiline:		false,
		disabledProperty: 'disabled',
		focus: 			true, 
		//modifierState: 	Mojo.Widget.numLock,
		//autoResize: 	automatically grow or shrink the textbox horizontally,
		//autoResizeMax:	how large horizontally it can get
		//enterSubmits:	when used in conjunction with multline, if this is set, then enter will submit rather than newline
		limitResize: 	false, 
		holdToEnable:  false, 
		focusMode:		Mojo.Widget.focusSelectMode,
		changeOnKeyPress: true,
		textReplacement: false,
		maxLength: 200,
		requiresEnterKey: false
	};
	//Create the model for the text field
	this.txtModel = {
		originalValue : 'www.palm.com'
	};
	
	//Setup the textfield widget and observer
	this.controller.setupWidget('BrowserTextField', this.textFieldAtt, this.txtModel);
	
	this.controller.listen(this.controller.get('LaunchBrowserButton1'), Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.listen(this.controller.get('LaunchBrowserButton2'), Mojo.Event.tap, this.handleButton2Pressed.bind(this));
};
BrowserAssistant.prototype.handleButton1Pressed = function (event) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters:  {
			id: 'com.palm.app.browser',
			params: {
				scene:  'page'
			}
		}
	});
	/*
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
             method: 'launch',
             parameters: {
                 id:     "com.palm.app.phone"
             }
    });
*/
};
BrowserAssistant.prototype.handleButton2Pressed = function (event) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: 'com.palm.app.browser',
			params: {
				scene: 'page',
				target: this.txtModel.originalValue
			}
		}
	});
};

BrowserAssistant.prototype.handleServiceResponse = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};
BrowserAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


BrowserAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BrowserAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening(this.controller.get('LaunchBrowserButton1'), Mojo.Event.tap, this.handleButton1Pressed.bind(this));
	this.controller.stopListening(this.controller.get('LaunchBrowserButton2'), Mojo.Event.tap, this.handleButton2Pressed.bind(this));
};
