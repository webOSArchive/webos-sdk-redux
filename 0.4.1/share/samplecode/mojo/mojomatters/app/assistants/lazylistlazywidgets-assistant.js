function LazylistlazywidgetsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.openDrawer = undefined; // model of currently open drawer
}

LazylistlazywidgetsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	this.listwidget = this.controller.get('thelist');
	
	this.controller.setupWidget('thelist', {
		itemTemplate:'lazylistlazywidgets/listitem',
		itemsCallback: this.generateItems.bind(this),
		onItemRendered: this.onItemRendered.bind(this),
		swipeToDelete: true
	});
	
	this.controller.setupWidget('rowdrawer');
	
	this.controller.setupWidget('sublist', {
		itemTemplate:'lazylistlazywidgets/subitem',
		swipeToDelete: true
	});
	
	this.listwidget.observe(Mojo.Event.listDelete, function() {
		Mojo.Log.info("swiping to delete");
	});
	
	/* add event handlers to listen to events from widgets */
	this.listwidget.observe(Mojo.Event.listTap, this.listItemTapHandler.bindAsEventListener(this));
};

LazylistlazywidgetsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	this.listwidget.mojo.setLength(3000);
};

LazylistlazywidgetsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

LazylistlazywidgetsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

LazylistlazywidgetsAssistant.prototype.generateItems = function(listWidget, offset, length) {
	
	// generate fake items for each row
	var list = $R(offset, offset+length).collect(function(num) {
		
		// generate sublist items to be used by the internal instance of the listwidget
		var sublist = $R(0,3).collect(function(i) { return {name:i}; });
		
		return {id: num, name:"item "+num, items:sublist};
	});
	
	listWidget.mojo.noticeUpdatedItems(offset, list);
};

LazylistlazywidgetsAssistant.prototype.onItemRendered = function(listWidget, itemModel, itemNode) {
	// handles the case where the list item was kicked off the list (most likely
	// because the user scrolled far past it), so we restore its open state
	if ( this.openDrawer && this.openDrawer.id === itemModel.id ) {
		itemModel.open = true;				
		this._addDrawerToItem(itemNode, itemModel);
		
		itemNode._ignoreSwipeToDelete = true; // workaround for NOV-77934
	}
};

LazylistlazywidgetsAssistant.prototype.listItemTapHandler = function(event) {
	// grab the list item. Note that this will be fixed in next major release as event.target will be this list item
	var list_element = Mojo.View.findParentByAttribute(event.originalEvent.target, event.target, "list-row-element");
	var model = event.item;
	if ( list_element ) {
		this._addDrawerToItem(list_element, model);
		
		// toggle drawer
		model.open = ! model.open;
		this.controller.modelChanged(model);
		Event.stop(event);
		
		// close all other items when this one is opened
		if ( model.open ) {
			if ( this.openDrawer ) {
				this.openDrawer.open = false;
				this.controller.modelChanged(this.openDrawer);
			}
			this.openDrawer = model;
		} else {
			this.openDrawer = undefined;
		}
		
		list_element._ignoreSwipeToDelete = model.open; // workaround for NOV-77934
	}
};

// private helper method adds a drawer to the list item if one doesn't exist
LazylistlazywidgetsAssistant.prototype._addDrawerToItem = function(itemNode, itemModel) {
	if ( ! itemNode._rowDrawerAdded ) {
		itemNode._rowDrawerAdded = true;
		var template = Mojo.View.convertToNode('<div name="rowdrawer" class="thedrawer" x-mojo-element="Drawer"> \
													<div name="sublist" x-mojo-element="List"></div> \
									  			</div>', document);
		itemNode.appendChild(template);
		
		this.controller.instantiateChildWidgets(itemNode, itemModel);
		this.controller.showWidgetContainer(itemNode);
	}
};
