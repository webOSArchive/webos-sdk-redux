PopupAlertAssistant = function() {
}

PopupAlertAssistant.prototype.setup = function() {
	var f = this.doClose.bind(this);
	this.controller.get('popup_dialog_ok').addEventListener(Mojo.Event.tap, f);
	this.controller.get('popup_dialog_cancel').addEventListener(Mojo.Event.tap, f);
}

PopupAlertAssistant.prototype.doClose = function(event) {
	this.controller.window.close();
}
