/*
 *    MainAssistant - Displays a list of APIs that are related to working with data.
 *        User taps an item in the list to see a demonstration of a data API.
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
	this.controller.setupWidget('dataList', 
								{itemTemplate:'main/listitem', 
								dividerTemplate:'main/divider', 
								dividerFunction: this.dividerFunc.bind(this)},
								{items:this.dataAPIs});
									
	// Watch for taps on the list items	
	Mojo.Event.listen($('dataList'),Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this))
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
 * directory that it's scene files are located, the name of the corresponding data api and the name of it's 
 * scene file.
 */
MainAssistant.prototype.setupModel = function(){
	this.dataAPIs = [
			{category:$L("Data Parsing"), directory:$L("dataParsing/xmlParse"), name:$L("XML Parse"), scene:$L("xmlParse")},
			{category:$L("Network Data"), directory:$L("networkData/ajaxGet"), name:$L("AJAX Get"), scene:$L("ajaxGet")},
			{category:$L("Network Data"), directory:$L("networkData/ajaxPost"), name:$L("AJAX Post"), scene:$L("ajaxPost")},
			{category:$L("Security"), directory:$L("security/encryption"), name:$L("Encryption"), scene:$L("encryption")},
			{category:$L("Storage"), directory:$L("storage/depot"), name:$L("Depot"), scene:$L("depot")},
			{category:$L("Storage"), directory:$L("storage/sqlite"), name:$L("SQLite"), scene:$L("sqlite")},
			{category:$L("Storage"), directory:$L("storage/cookie"), name:$L("Cookie"), scene:$L("cookie")},
	]
}

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
