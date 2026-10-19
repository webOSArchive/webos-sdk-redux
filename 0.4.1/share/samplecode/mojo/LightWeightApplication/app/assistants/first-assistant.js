function FirstAssistant(argFromPusher) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.text1 = "Enter some text that you want to pass to 2nd scene:";
	this.text2 = "The argument passed from 2nd scene is:"
	if (argFromPusher) {
		this.sublaunch = argFromPusher.sublaunch;
		if(this.sublaunch) {
			this.text1 = this.text1 + "<br>(I see you launched me from another application. Use the back gesture to return to your app. when you are done.)"
		}
	}
 }
    

FirstAssistant.prototype.setup = function() {		
        /* this function is for setup tasks that have to happen when the scene is first created */

        /* use Mojo.View.render to render view templates and add them to the scene, if needed. */

        /* setup widgets here */
	this.controller.get('string').update(this.text1);
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
		'original' : 'text to pass to scene 2',
		disabled: false
	};

	//Setup the textfield widget and observer
	this.controller.setupWidget('mainTextField', this.textFieldAtt, this.model);
	this.buttonModel1 = {
		buttonLabel : 'Push to second scene',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		//type : 'Activity'
	}
	
	this.controller.setupWidget('push_button',this.buttonAtt1,this.buttonModel1);
	this.handleButtonPressBinder = this.handleButtonPress.bind(this);
    Mojo.Event.listen(this.controller.get('push_button'),Mojo.Event.tap, this.handleButtonPressBinder)
}
    
FirstAssistant.prototype.handleButtonPress = function(event){
	//this.controller.get('string').update(this.text2);
		//push the second scene on the scene stack
	this.firstValue = this.model.original;	
	this.controller.stageController.pushScene('second',this.firstValue);        
}

FirstAssistant.prototype.activate = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	if (event != undefined) {
		this.controller.get('string').update(this.text2 + "<br>" + event);
		this.model.original = "New Text";
		this.controller.modelChanged(this.model);
	}	
}


FirstAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

FirstAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    Mojo.Event.stopListening(this.controller.get('push_button'),Mojo.Event.tap, this.handleButtonPressBinder)
}
