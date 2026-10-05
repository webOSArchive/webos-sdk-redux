function XmlParseAssistant() {
	this.items = [];
	this.path = "/artist/opml-feeds/opml-feed";
	this.url = 'http://feeds.rhapsody.com/u2/data.xml';
}

XmlParseAssistant.prototype.setup = function() {
	this.buttonModel1 = {
		buttonLabel : 'Parse XML',
		buttonClass : 'dismiss',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_button',this.buttonAtt1,this.buttonModel1)
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.send.bind(this));
	
}

XmlParseAssistant.prototype.propertyChange = function (event){
	/* Kick off a search when the search value changes */
	this.send();
}

XmlParseAssistant.prototype.sendContinue = function() {
	if (Mojo.Host.current === Mojo.Host.mojoHost) {
		// same original policy means we need to use the proxy on mojo-host
		this.url = '/proxy?url=' + encodeURIComponent(this.url);
	}
	/*
	 * Use the prototype AJAX object, being sure to use Prototype's
	 * bind function to make sure the 'this' keyword is set to this
	 * instance when the callbacks are called.
	 */
	var request = new Ajax.Request(this.url, {
		method: 'get',
		evalJSON: 'force', //to enforce parsing JSON if there is JSON response
		onCreate: function(){console.info('******* onCreate happened')},
		onLoading: function(){console.info('******* onLoading happened')},
		onLoaded: function(){console.info('******* onLodaed happened')},
		onSuccess: function(){console.info('******* onComplete happened')},
		onComplete: this.gotResults.bind(this),
		onFailure: this.failure.bind(this)
	});
}

/*
 * Called by Prototype when the request succeeds. Parse the XML response
 */
XmlParseAssistant.prototype.gotResults = function(transport) {
	// Use responseText, not responseXML!! try: reponseJSON 
	var xmlstring = transport.responseText;	
	
	// Convert the string to an XML object
	var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	
	// Use xpath to parse xml object
	var nodes = document.evaluate(this.path, xmlobject, null, XPathResult.ANY_TYPE, null);
	
	var result = nodes.iterateNext();
	var i = 0;
	while (result)
	{
	  	// TODO: add list or partial here
	  	console.log("******* song name: " + result.attributes[0].nodeValue);
		this.items[i] = result.attributes[0].nodeValue;
		i++;
		result=nodes.iterateNext();
	}
	
	// Print out result to the screen
	this.controller.get('response').update(this.items);
	this.mybutton = this.controller.get('go_button')
	this.mybutton.mojo.deactivate();
}

/*
 * Called by Prototype when the request fails.
 */
XmlParseAssistant.prototype.failure = function(transport) {
	/*
	 * Use the Prototype template object to generate a string from the return status.
	 */
	var t = new Template($L("Error: Status #{status} returned from AJAX Google search."));
	var m = t.evaluate(transport);
	
	/*
	 * Show an alert with the error.
	 */
	this.controller.showAlertDialog({
	    onChoose: function(value) {},
		title: $L("Error"),
		message: m,
		choices:[
			{label: $L('OK'), value:'ok', type:'color'}    
		]
	});	  
}

XmlParseAssistant.prototype.send = function(event) {
	
	//Make textfield loose focus, then queue up the next part so that the blur
	// event has time to be processed
	//$('sendField').blur();
	this.sendContinue.bind(this).defer();
}

XmlParseAssistant.prototype.activate = function(event) {
	/*
	 * Really you should be able to use $('sendField').mojo.focus(), but
	 * that's not available at the moment. This works, but could break if the 
	 * widget changes. */
	//$('sendField').querySelector('textarea').focus();
}


XmlParseAssistant.prototype.deactivate = function(event) {
	
}

XmlParseAssistant.prototype.cleanup = function(event) {
	
}
