var emailassistant = null;
var addressExist = false;
function EmailAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}
//
  
  
EmailAssistant.prototype.setup = function() {
  	emailassistant = this;
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
		'original' : 'info@palm.com',
		disabled: false
	};

	//Setup the textfield widget and observer
	this.controller.setupWidget('emailAddress', this.textFieldAtt, this.model);
	  //set up button handlers 
	  this.controller.listen('launchEmail',Mojo.Event.tap, this.LaunchEmail.bind(this));
	  this.controller.listen('withURI',Mojo.Event.tap, this.showComposeWithURI.bind(this));
	  this.controller.listen('withJSON',Mojo.Event.tap, this.showComposeWithJSON.bind(this));
}

EmailAssistant.prototype.LaunchEmail = function(){
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
			id: 'com.palm.app.email',
			params: {}															
		}
	});
	
} 
 /*
	   This is the event handler called when the "Launch compose view" button is tapped.
	   It launches the compose view of the email app using the 'mailto:' URI provided in 
	   a JSON object
	 */
	
EmailAssistant.prototype.showComposeWithURI = function() {
	
	
	if (validEmail(this.model.original)) {
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				id: 'com.palm.app.email',
				params: {
					uri: 'mailto:' + this.model.original + '?subject=This is the subject&body=this is the body'
				}
			}
		})
		
	}
}  
  
 /*
	   This is the event handler called when the "Launch compose pre-filled" button 
	   is tapped. It launches the compose view of the email app with the fields 
	   pre-filled. The values are provided in a JSON object.
	 */
	
EmailAssistant.prototype.showComposeWithJSON = function(){
	if (validEmail(this.model.original)){	
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				id: 'com.palm.app.email',
				params: {
					summary: "This is a summary",
					text: "This is the body of the email",
					recipients: [{
						value : emailassistant.model.original,
						contactDisplay : 'Display name'
					}]															
				}				
			}
		});
	}	
}


	
/*
	   This is the event handler called when the "Send email without UI" button 
	   is tapped. It pushes the scene where an email address can be entered and 
	   an email sent.
	 */
	
	
EmailAssistant.prototype.showDialogBox = function(title,msg){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:msg,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
	}

validEmail = function(email){
	var localemail = '' + email;
	console.log("***** "+ localemail + " : " + localemail.length);
	if (localemail != 'undefined' && localemail.length > 0){ 
		console.log("Inside ***** ");
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (filter.test(localemail)) 
			return true;
	}
	console.log("outside ***** ");
	emailassistant.showDialogBox('ERROR',"You need to enter a valid email address before you send it!");		
	return false;
}

EmailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


EmailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

EmailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  this.controller.stopListening('launchEmail',Mojo.Event.tap, this.LaunchEmail.bind(this));
	  this.controller.stopListening('withURI',Mojo.Event.tap, this.showComposeWithURI.bind(this));
	  this.controller.stopListening('withJSON',Mojo.Event.tap, this.showComposeWithJSON.bind(this));
}

