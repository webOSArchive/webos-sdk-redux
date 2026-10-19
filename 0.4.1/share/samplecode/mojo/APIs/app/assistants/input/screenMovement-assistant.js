function ScreenMovementAssistant() {

}

ScreenMovementAssistant.prototype.setup = function(){
    //enable drag handlers
	this.dragStartHandler = this.dragStart.bind(this);
	this.draggingHandler = this.dragging.bind(this);
	this.dragEndHandler = this.dragEnd.bind(this);
	this.flickHandler = this.flick.bind(this);
		
	//listen for drag starts & flicks
	this.trackingArea = this.controller.get('tracking-area');
	this.controller.listen(this.trackingArea, Mojo.Event.dragStart, this.dragStartHandler);  
	this.controller.listen(this.trackingArea, Mojo.Event.flick, this.flickHandler); 	
}

ScreenMovementAssistant.prototype.dragStart = function(event) {
	this.controller.get('tracking-output').innerHTML = "x = " + Event.pointerX(event.down) + "<br>y = " + Event.pointerY(event.down)
	this.controller.listen(this.trackingArea, Mojo.Event.dragging, this.draggingHandler);
	this.controller.listen(this.trackingArea, Mojo.Event.dragEnd, this.dragEndHandler);
	Event.stop(event);
}
	
ScreenMovementAssistant.prototype.dragging = function(event) {
	this.controller.get('tracking-output').innerHTML = "x = " + Event.pointerX(event.move) + "<br>y = " + Event.pointerY(event.move)
    Event.stop(event);
}
	
ScreenMovementAssistant.prototype.dragEnd = function(event) {
	this.controller.stopListening(this.trackingArea, Mojo.Event.dragging, this.draggingHandler);
	this.controller.stopListening(this.trackingArea, Mojo.Event.dragEnd, this.dragEndHandler);
	Event.stop(event);
}

ScreenMovementAssistant.prototype.flick = function(event) {
	this.controller.get('tracking-output').innerHTML = "flick velocity x = " + event.velocity.x + "<br>flick velocity y = " + event.velocity.y
	Event.stop(event);
}