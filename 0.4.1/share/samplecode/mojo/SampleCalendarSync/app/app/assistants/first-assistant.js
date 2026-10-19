function FirstAssistant() {
}

FirstAssistant.prototype.setup = function() {
	this.controller.get("app-title").update(Mojo.appInfo.title);
	this.controller.get("app-id").update(Mojo.appInfo.id);
	this.controller.get("app-version").update(Mojo.appInfo.version);
};

FirstAssistant.prototype.activate = function(event) {
};

FirstAssistant.prototype.deactivate = function(event) {
};

FirstAssistant.prototype.cleanup = function(event) {
};
