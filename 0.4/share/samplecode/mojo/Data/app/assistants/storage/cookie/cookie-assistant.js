function CookieAssistant() {
		
}

CookieAssistant.prototype.setup = function() {
    /* set up our text field */
		var attributes = {
				hintText: 'Enter cookie id here',
				textFieldName:	'name', 
				modelProperty:	'original', 
				changeOnKeyPress: true,
				focus: true
		};
		this.model = {
			'original' : '',
			disabled: false
		};
		this.controller.setupWidget('textField', attributes, this.model);
		
	Mojo.Event.listen(this.controller.get('put_button'),Mojo.Event.tap, this.put.bind(this));
	Mojo.Event.listen(this.controller.get('get_button'),Mojo.Event.tap, this.get.bind(this));
	Mojo.Event.listen(this.controller.get('remove_button'),Mojo.Event.tap, this.remove.bind(this));
}


CookieAssistant.prototype.put = function(){
	this.cookie = new Mojo.Model.Cookie(this.model['original'])
	//We're just using a static object for this example
	this.cookie.put({
		prop1:"property1",
		prop2:"property2"
	})
	$('info').update("cookie saved")
	
}

CookieAssistant.prototype.get = function(){	
	this.cookie = new Mojo.Model.Cookie(this.model['original'])
	$('info').update(Object.toJSON(this.cookie.get()))
}

CookieAssistant.prototype.remove = function(){
	this.cookie = new Mojo.Model.Cookie(this.model['original'])
	this.cookie.remove();
	$('info').update("cookie removed")	
}