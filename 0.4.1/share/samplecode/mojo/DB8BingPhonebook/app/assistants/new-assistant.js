NewAssistant = function(newStr) {
		this.newEntry = newStr;
};

NewAssistant.prototype.setup = function() {
	this.displayDetails();
};

NewAssistant.prototype.cleanup = function() {
	
};

NewAssistant.prototype.displayDetails = function() {
	this.controller.get("phoneBookEntry").innerHTML = this.newEntry;
};