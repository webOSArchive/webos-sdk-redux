/*
 *    MainAssistant - Displays a list of Mojo APIs.  User taps an item in the
 *        list to see a demonstration of an API.
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

MainAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created */
    /* Use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* Setup widgets here */
	/* Add event handlers to listen to events from widgets */
	
	// Set up our list data model	
	this.setupModel();

	// Set up the list widget with templates for the items, their dividers & the list container.
	// We also set the model to use for the list items & specify a function to format divider content.
	
	this.controller.setupWidget('apiList', 
								{itemTemplate:'main/listitem', 
								dividerTemplate:'main/divider', 
								dividerFunction: this.dividerFunc.bind(this)},
								{items:this.apis});
									
	// Watch for taps on the list items	
	this.listTapHandler = this.listTapHandler.bind(this);
	
}
    
/*
 *	List dividers work by specifying a function for the 'dividerFunction' widget attribute.
 *	This function works kind of like a data formatter function... it's called with the item model
 *	during list rendering, and it returns a label string for the divider.
 *		
 *	The List widget takes care of inserting an actual divider item whenever the label is different
 *	between two consecutive items.
*/	
MainAssistant.prototype.dividerFunc = function(itemModel) {
		return itemModel.category; // We're using the item's category as the divider label.
}
	
/*
 * This function is called when the user taps an item in the list.  It will call the showScene function
 * (defined in this stage's stage assistant) to display a specific scene. 
 */
MainAssistant.prototype.listTapHandler = function(event){
        var index = event.model.items.indexOf(event.item);
		if (index > -1) {
			this.controller.stageController.assistant.showScene(event.item.directory, event.item.scene)
        }      
}

/* 
 * Set up our list's model.  An item includes the category it belongs to (for display in the list dividers), the
 * directory that it's scene files are located, the name of the corresponding api and the name of it's scene file.
 */
MainAssistant.prototype.setupModel = function(){
	this.apis = [
			{category:$L("Animation"), directory:$L("animation/animateStyle"), name:$L("Animate Style"), scene:$L("animateStyle")},
			{category:$L("Input"), directory:$L("input/keyPress"), name:$L("Key Presses"), scene:$L("keyPress")},
			{category:$L("Input"), directory:$L("input/screenMovement"), name:$L("Screen Movement"), scene:$L("screenMovement")},
			{category:$L("Input"), directory:$L("input/gesture"), name:$L("Gestures"), scene:$L("gesture")},
			{category:$L("Localization"), directory:$L("localization/formatting"), name:$L("Formatting"), scene:$L("formatting")},
			{category:$L("Localization"), directory:$L("localization/localization"), name:$L("Localization"), scene:$L("localization")},
			{category:$L("Logging"), directory:$L("logging/logging"), name:$L("Logging"), scene:$L("logging")},
			{category:$L("Notifications"), directory:$L("notifications/bannerAlert"), name:$L("Banner Alert"), scene:$L("bannerAlert")},
			{category:$L("Notifications"), directory:$L("notifications/notificationChain"), name:$L("Notification Chain"), scene:$L("notificationChain")},
			{category:$L("Notifications"), directory:$L("notifications/popupAlert"), name:$L("Popup Alert"), scene:$L("popupAlert")},
			{category:$L("Rendering"), directory:$L("rendering/view"), name:$L("View"), scene:$L("view")},
			{category:$L("Scenes"), directory:$L("scenes/fullscreen"), name:$L("Full Screen"), scene:$L("fullScreenMain")},
			{category:$L("Scenes"), directory:$L("scenes/rotation"), name:$L("Rotation"), scene:$L("rotationMain")},
			{category:$L("Scenes"), directory:$L("scenes/transition"), name:$L("Transition"), scene:$L("transitionMain")},
			{category:$L("Stages"), directory:$L("stages/card"), name:$L("Card"), scene:$L("card")},
			{category:$L("Stages"), directory:$L("stages/crossApp"), name:$L("Cross-Application Push"), scene:$L("crossApp")},
			{category:$L("Stages"), directory:$L("stages/dashboard"), name:$L("Dashboard"), scene:$L("dashboard")},
			{category:$L("System"), directory:$L("system/orientation"), name:$L("Orientation"), scene:$L("orientation")}
	]
}

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  Mojo.Event.listen(this.controller.get('apiList'),Mojo.Event.listTap, this.listTapHandler)
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('apiList'),Mojo.Event.listTap, this.listTapHandler)
}

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
}
