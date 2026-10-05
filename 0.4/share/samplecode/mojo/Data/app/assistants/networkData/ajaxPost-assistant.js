var myassistant = null;
function AjaxPostAssistant()
{
	
}
AjaxPostAssistant.prototype.setup=function()
{
	myassistant = this;
	this.textFieldAtt = {
			hintText: 'hint',
			textFieldName:	'name', 
			modelProperty:		'original', 
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
	this.model = {
		'original' : 'Palm',
		disabled: false
	};
	this.controller.setupWidget('sendField', this.textFieldAtt, this.model);
	this.buttonModel1 = {
		buttonLabel : 'Push to send post',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		//type : 'Activity'
	}
	
	this.controller.setupWidget('post_button',this.buttonAtt1,this.buttonModel1)
	Mojo.Event.listen(this.controller.get('post_button'),Mojo.Event.tap,this.handlePost.bind(this));
	

}

AjaxPostAssistant.prototype.handlePost=function(event)
{
	 var posturl='http://www.snee.com/xml/crud/posttest.cgi';

	 var postdata='fname=enda&lname=mcgrath';
	 var myAjax = new Ajax.Request(posturl, {
	 	method: 'post',
	 	evalJSON: 'force',
	 	postBody: postdata,
	 	contentType: 'application/x-www-form-urlencoded',
	 	onComplete: function(transport){
	 		if (transport.status == 200) 
				myassistant.controller.get('area-to-update').update('Success!');
			else {
				myassistant.controller.get('area-to-update').update('Failure!');
			}
	 		myassistant.controller.get('server-response').update('Server Response: \n' + transport.responseText);			
	 	},
	 	onFailure: function(transport){
	 		myassistant.controller.get('area-to-update').update('Failure!\n\n' + transport.responseText);
	 	}
	 });

}
AjaxPostAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


AjaxPostAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

AjaxPostAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}