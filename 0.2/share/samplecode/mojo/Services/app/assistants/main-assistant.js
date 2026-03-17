/*
 *    MainAssistant - Displays a list of services.  User taps an item in the
 *        list to see a demonstration of a service.
 *   
 *    Arguments:
 *        none                           
 *        
 *    Functions:
 *        constructor         No-op
 *        setup               Sets up a list widget.
 *        activate            No-op
 *        deactivate          No-op
 *        cleanup             No-op
 *        dividerFunc		  Returns a divider label to use in the list dividers.
 *        listTapHandler      Handles user taps on the list items.
 *        setupModel		  Sets up our list model data.
 *        showScene           Pushes a scene. 
*/


function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */
}    

MainAssistant.prototype.setup = function () {
	/* This function is for setup tasks that have to happen when the scene is first created */
    /* Use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* Setup widgets here */
	/* Add event handlers to listen to events from widgets */
	
	// Set up our list data model	
	this.setupModel();

	// Set up the list widget with templates for the items, their dividers & the list container.
	// We also set the model to use for the list items & specify a function to format divider content.
	this.controller.setupWidget('servicesList', 
								{itemTemplate: 'main/listitem', 
								dividerTemplate: 'main/divider', 
								dividerFunction: this.dividerFunc.bind(this)},
								{items: this.services});
									
	// Watch for taps on the list items	
	Mojo.Event.listen($('servicesList'), Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};
    
/*
 *	List dividers work by specifying a function for the 'dividerFunction' widget attribute.
 *	This function works kind of like a data formatter function... it's called with the item model
 *	during list rendering, and it returns a label string for the divider.
 *		
 *	The List widget takes care of inserting an actual divider item whenever the label is different
 *	between two consecutive items.
*/	
MainAssistant.prototype.dividerFunc = function (itemModel) {
	return itemModel.category;  // We're using the item's category as the divider label.
};
	
/*
 * This function is called when the user taps an item in the list.  It will call the showScene function
 * to display a service specific scene. 
 */
MainAssistant.prototype.listTapHandler = function (event) {
    var index = event.model.items.indexOf(event.item);
	if (index > -1) {
		this.controller.stageController.assistant.showScene(event.item.directory, event.item.scene);
    }      
};

/* 
 * Set up our list's model.  An item includes the category it belongs to (for display in the list dividers), the
 * directory that it's scene files are located, the name of the corresponding service and the name of it's scene file.
 */
MainAssistant.prototype.setupModel = function () {
	this.services = [
		{category: $L("Application Manager Services"), directory: $L("applicationManager/applicationManager"), name: $L("Application Manager"), scene: $L("applicationManager")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/audioPlayer"), name: $L("Audio Player"), scene: $L("audioPlayer")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/browser"), name: $L("Browser"), scene: $L("browser")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/camera"), name: $L("Camera"), scene: $L("camera")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/documentViewer"), name: $L("Document Viewer"), scene: $L("documentViewer")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/email"), name: $L("Email"), scene: $L("email")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/installCertificates"), name: $L("Install Certificates"), scene: $L("installCertificates"), description: $L("Work In Progress")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/maps"), name: $L("Maps"), scene: $L("maps")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/messaging"), name: $L("Messaging"), scene: $L("messaging")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/phone"), name: $L("Phone"), scene: $L("phone")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/photos"), name: $L("Photos"), scene: $L("photos")},
		{category: $L("Application Manager Services"), directory: $L("applicationManager/videoPlayer"), name: $L("Video Player"), scene: $L("videoPlayer")},
		{category: $L("Device Services"), directory: $L("device/accelerometer"), name: $L("Accelerometer"), scene: $L("accelerometer")},
		{category: $L("Device Services"), directory: $L("device/alarms"), name: $L("Alarms"), scene: $L("alarms")},
		{category: $L("Device Services"), directory: $L("device/calendar"), name: $L("Calendar"), scene: $L("calendar")},
		{category: $L("Device Services"), directory: $L("device/connectionManager"), name: $L("Connection Manager"), scene: $L("connectionManager")},
		{category: $L("Device Services"), directory: $L("device/contacts"), name: $L("Contacts"), scene: $L("contacts")},
		{category: $L("Device Services"), directory: $L("device/downloadManager"), name: $L("Download Manager"), scene: $L("downloadManager")},
		{category: $L("Device Services"), directory: $L("device/gps"), name: $L("GPS"), scene: $L("gps")},
		{category: $L("Device Services"), directory: $L("device/powerManager"), name: $L("Power Manager"), scene: $L("powerManager")},
		{category: $L("Device Services"), directory: $L("device/systemProperties"), name: $L("System Properties"), scene: $L("systemProperties")},
		{category: $L("Device Services"), directory: $L("device/systemServices"), name: $L("System Services"), scene: $L("systemServices")},
		{category: $L("Device Services"), directory: $L("device/systemSounds"), name: $L("System Sounds"), scene: $L("systemSounds")},
		];
};

MainAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};
	
MainAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
