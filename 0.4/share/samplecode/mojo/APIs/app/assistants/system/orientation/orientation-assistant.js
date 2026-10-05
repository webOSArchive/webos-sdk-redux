/**
 * @author charles bybee
 */
function OrientationAssistant() {
}
	
OrientationAssistant.prototype.setup = function() {
			//set up button handlers

}

OrientationAssistant.prototype.orientationChanged = function(orientation){
	//This is the way to watch for changes in orientation
	this.showDialogBox("Orientation Changed", orientation.orientation);
}
    
OrientationAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


OrientationAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

OrientationAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

// This function will popup a dialog, displaying the message passed in.
OrientationAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}
