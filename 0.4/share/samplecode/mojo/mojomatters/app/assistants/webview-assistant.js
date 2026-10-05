WebviewAssistant = function() {
}

WebviewAssistant.prototype.setup = function() {
    var attr = {
		minFontSize:18,
		virtualpagewidth: this.controller.window.innerWidth,
		virtualpageheight: 32 
	};
	var tfAttr = {
		hintText: $L('Enter URL')
	};
	this.controller.setupWidget('webview', attr, {});
	this.controller.setupWidget('url_field', tfAttr, {});
	
	// Bind event handlers once, ahead of time
	this.urlChangedHandler = this.urlChanged.bind(this);
	this.linkClicked = this.linkClicked.bind(this);
	
	// Store references to reduce the number of calls to controller.get()
	this.wb = this.controller.get('webview');
	
	// Listen for a new URL
	this.controller.listen('url_field', Mojo.Event.propertyChanged, this.urlChangedHandler);
	// OR for clicks on links
	this.controller.listen('webview', Mojo.Event.webViewLinkClicked, this.linkClicked);
};

WebviewAssistant.prototype.urlChanged = function(event) {
	if (this.wb === null) {
		Mojo.log("couldn't find web adapter");
	} else {
		this.wb.mojo.openURL(event.value);
	}
};

WebviewAssistant.prototype.linkClicked = function(event) {
	this.wb.mojo.openURL(event.url);
};