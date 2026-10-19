function KeyPressAssistant() {

}

KeyPressAssistant.prototype.setup = function(){
	this.div = this.controller.get('echo');
	this.handleKeyUpEvent = this.handleKeyUpEvent.bind(this);
	this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this);
	this.handleKeyPressEvent = this.handleKeyPressEvent.bind(this);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent);
}


KeyPressAssistant.prototype.handleKeyUpEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});
	this.div.innerHTML = this.div.innerHTML + (content);
}


KeyPressAssistant.prototype.handleKeyDownEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});
	this.div.innerHTML = this.div.innerHTML + (content);
}


KeyPressAssistant.prototype.handleKeyPressEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});	
	this.div.innerHTML = this.div.innerHTML + (content);
}
KeyPressAssistant.prototype.cleanup = function(){
	this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent);
	this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent);
	this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent);
}
