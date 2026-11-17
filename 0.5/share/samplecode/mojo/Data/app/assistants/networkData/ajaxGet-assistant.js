function AjaxGetAssistant() {
	
}

AjaxGetAssistant.prototype.setup = function() {
	
	//Create the attributes for the textfield
	this.textFieldAtt = {
			hintText: 'Enter text to search here',
			textFieldName:	'name', 
			modelProperty:		'originalValue', 
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
	//Create the model for the text field
	this.model = {
		originalValue : ''
	};
	
	this.resultsModel = {items: [], listTitle: $L('Results')};
	//Setup the textfield widget and observer
	this.controller.setupWidget('sendField', this.textFieldAtt, this.model);
    
	// Set up the attributes & model for the List widget:
	this.controller.setupWidget('results-list', 
					      {itemTemplate:'networkData/ajaxGet/search-result', listTemplate:'networkData/ajaxGet/result-list'},
					      this.resultsModel);

	//Set up button handlers
	this.buttonModel1 = {
		buttonLabel : 'Search Google',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	
	this.controller.setupWidget('go_button',this.buttonAtt1,this.buttonModel1)
	Mojo.Event.listen(this.controller.get('go_button'),Mojo.Event.tap, this.send.bind(this));
	Mojo.Event.listen(this.controller.get('results-list'),Mojo.Event.listTap, this.listWasTapped.bind(this));
	
}

AjaxGetAssistant.prototype.propertyChange = function (event){
	/* Kick off a search when the search value changes */
	this.send();
}

AjaxGetAssistant.prototype.send = function() {
	if (this.model.originalValue == '') {
		this.controller.showAlertDialog({
			onChoose: function(value) {},
			title:'Search Error',
			message:'Please enter something to search!!',
			choices:[ {label:'OK', value:'OK', type:'color'} ]
		});		
	}
	else {
		/*
	 * Use the prototype Ajax object to access the Google AJAX search API.
	 */
		var url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' + encodeURIComponent(this.model.originalValue);
		
		/*
	 * Use the prototype AJAX object, being sure to use Prototype's
	 * bind function to make sure the 'this' keyword is set to this
	 * instance when the callbacks are called.
	 */
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: this.gotResults.bind(this),
			onFailure: this.failure.bind(this)
		});
		this.mybutton = this.controller.get('go_button')
		this.mybutton.mojo.deactivate();
	}
}

/*
 * Called by Prototype when the request succeeds.
 */
AjaxGetAssistant.prototype.gotResults = function(transport) {
	//console.log ("gotResults:" + transport.responseText);
	var r = transport.responseJSON;
	this.resultsModel.items = $A(r.responseData.results);
	this.controller.modelChanged(this.resultsModel);
}

/*
 * Called by Prototype when the request fails.
 */
AjaxGetAssistant.prototype.failure = function(transport) {
	/*
	 * Use the Prototype template object to generate a string from the return status.
	 */
	console.log ("failure");
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

/*
 * Event handler when a list item is tapped.
 */
AjaxGetAssistant.prototype.listWasTapped = function(event) {
	if (Mojo.Host.current !== Mojo.Host.mojoHost) {
		/*
	 * Setup to open the browser with the url from
	 * the search result. The list tapped event
	 * provides us with the model object in
	 * event.item.
	 *
	 * @editorial
	 * This really cries out for a framework function.
	 */
		
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
		  method:      "open",
		  parameters:  {
		               id:     'com.palm.app.browser',
		               params: {
		                       scene:  'page',
		                       target: event.item.url
		                       }
		               }
		  });
	}else{
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:"URL sent to Browser",
		message:event.item.url,
		cancelable:false,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
	}
}


AjaxGetAssistant.prototype.activate = function(event) {
	
}


AjaxGetAssistant.prototype.deactivate = function(event) {
	
}

AjaxGetAssistant.prototype.cleanup = function(event) {
	
}
