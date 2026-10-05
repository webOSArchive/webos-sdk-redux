/**
 * @author charles bybee
 */
function CameraAssistant() {
}
	
CameraAssistant.prototype.setup = function () {
	//set up button handlers
	this.controller.listen($('capture_button'), Mojo.Event.tap, this.handleCaptureButton.bind(this));
	this.controller.listen($('capture_other_button'), Mojo.Event.tap, this.handleCaptureOtherButton.bind(this));
};
    
CameraAssistant.prototype.handleCaptureButton = function () {
	// Let the camera capture to the file it decides
    this.controller.stageController.pushScene(
    { appId : 'com.palm.app.camera', name: 'capture' },
    { sublaunch : true }
	);      
};
    
CameraAssistant.prototype.handleCaptureOtherButton = function () {
	// Capture the image to a specific file (at the root of the USB Drive)
    this.controller.stageController.pushScene(
    { appId : 'com.palm.app.camera', name: 'capture' },
    { sublaunch : true, filename : '/media/internal/testpicture.jpg' }
	);      
};

/*
CameraAssistant.prototype.handleIntegerPickerButton = function(){
        Mojo.Controller.stageController.pushScene("integer");        
}
*/
    

CameraAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	if (event !== undefined) {
		this.showDialogBox("Captured", "The file is: " + event.filename);
	}
};


CameraAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening($('capture_button'), Mojo.Event.tap, this.handleCaptureButton.bind(this));
	this.controller.stopListening($('capture_other_button'), Mojo.Event.tap, this.handleCaptureOtherButton.bind(this));
};

CameraAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('capture_button'), Mojo.Event.tap, this.handleCaptureButton.bind(this));
	this.controller.stopListening($('capture_other_button'), Mojo.Event.tap, this.handleCaptureOtherButton.bind(this));
};

// This function will popup a dialog, displaying the message passed in.
CameraAssistant.prototype.showDialogBox = function (title, message) {
	this.controller.showAlertDialog({
		onChoose: function (value) {},
		title: title,
		message: message,
		choices: [ {label: 'OK', value: 'OK', type: 'color'} ]
	});
};
