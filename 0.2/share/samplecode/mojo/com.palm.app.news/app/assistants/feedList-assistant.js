/*  FeedListAssistant - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Main scene for News app. Includes AddDialog-assistant for handling
    feed entry and then feedlist-assistant and supporting functions.
    
    Major components:
    - UpdateDialogAssistant; scene assistant for info screen on new features
    - AddDialogAssisant; Scene assistant for add feed dialog and handlers
    - FeedListAssistant; manages feedlists
    - List Handlers - delete, reorder and add feeds
    - Feature Feed - functions for rotating and showing feature stories
    - Search - functions for searching across the entire feedlist database
    
    Arguments:
    - feeds; Feeds object

*/    

// ----------------------------------------------------------------------
// UpdateDialogAssistant - Post the new version's features after an update    
function UpdateDialogAssistant(sceneAssistant)    {
    this.sceneAssistant = sceneAssistant;
}
    
UpdateDialogAssistant.prototype.setup = function(widget) {
    this.widget = widget;
    this.okDialogHandler = this.okDialog.bindAsEventListener(this);
    this.sceneAssistant.controller.listen("update_okButton", Mojo.Event.tap,
        this.okDialogHandler);
    this.updateScrollerModel = {
        scrollbars: false,
        mode: "vertical"
        };
    this.sceneAssistant.controller.setupWidget("updateScroller", this.updateScrollerModel);
};

// okDialog - close dialog
UpdateDialogAssistant.prototype.okDialog = function() {
    this.sceneAssistant.controller.stopListening("update_okButton", Mojo.Event.tap,
      this.okDialogHandler);
    this.widget.mojo.close();    
};


// ------------------------------------------------------------------------
// AddDialogAssistant - simple controller for adding new feeds to the list
//   when the "Add..." is selected on the feedlist. The dialog will
//   allow the user to enter the feed's url and optionally a name. When
//   the "Ok" button is tapped, the new feed will be loaded. If no errors
//   are encountered, the dialog will close otherwise the error will be
//   posted and the user encouraged to try again.
// 
function AddDialogAssistant(sceneAssistant, feeds, index) {
    this.feeds = feeds;
    this.sceneAssistant = sceneAssistant;
        
    //  If an index is provided then this is an edit feed, not add feed
    //  so provide the existing title, url and modify the dialog title
    if (index !== undefined) {
        this.title = this.feeds.list[index].title;
        this.url = this.feeds.list[index].url;
        this.feedIndex = index;
        this.dialogTitle = $L("Edit News Feed");
    }
    else {
        this.title = "";
        this.url = "";
        this.feedIndex = null;
        this.dialogTitle = $L("Add News Feed Source");
    }
}
    
AddDialogAssistant.prototype.setup = function(widget) {
        this.widget = widget;
        
        // Set the dialog title to either Edit or Add Feed
        var addFeedTitleElement = this.sceneAssistant.controller.get("add-feed-title");
        addFeedTitleElement.update(this.dialogTitle);
            
        // Setup text field for the new feed's URL
        this.sceneAssistant.controller.setupWidget(
            "newFeedURL",
            {
                  hintText: $L("RSS or ATOM feed URL"),
                  autoFocus: true,
                  limitResize: true,
                  autoReplace: false,
                  textCase: Mojo.Widget.steModeLowerCase,
                  enterSubmits: false
            },
            this.urlModel = {value : this.url});
        
        // Setup text field for the new feed's name    
        this.sceneAssistant.controller.setupWidget(
            "newFeedName",
            {
                  hintText: $L("Title (Optional)"),
                  limitResize: true,
                  autoReplace: false,
                  textCase: Mojo.Widget.steModeTitleCase,
                  enterSubmits: false
            },
            this.nameModel = {value : this.title});
        
        // Setup OK  & Cancel buttons
        //   OK button is an activity button which will be active
        //   while processing and adding feed. Cancel will just
        //   close the scene
        this.okButtonModel = {label: $L("OK"), disabled: false};
        this.sceneAssistant.controller.setupWidget("okButton", {type: Mojo.Widget.activityButton},
            this.okButtonModel);
        this.okButtonActive = false;
        this.okButton = this.sceneAssistant.controller.get("okButton");
        this.checkFeedHandler = this.checkFeed.bindAsEventListener(this);
        this.sceneAssistant.controller.listen("okButton", Mojo.Event.tap,
          this.checkFeedHandler);
          
        this.cancelButtonModel = {label: $L("Cancel"), disabled: false};
        this.sceneAssistant.controller.setupWidget("cancelButton", {type: Mojo.Widget.defaultButton},
          this.cancelButtonModel);
        this.sceneAssistant.controller.listen("cancelButton", Mojo.Event.tap,
          this.widget.mojo.close);
};

// checkFeed  - called when OK button is clicked implying a valid feed URL has been entered.
AddDialogAssistant.prototype.checkFeed = function() {
        
        if (this.okButtonActive === true)  {
            // Shouldn't happen, but log event if it does and exit
            Mojo.Log.info("Multiple Check Feed requests");
            return;
        }
        
        // Check entered URL and name to confirm that it is a valid and supported feedlist
        Mojo.Log.info("New Feed URL Request: ", this.urlModel.value);
        
        // Check for "http://" on front or other legal prefix; assume that any string of
        // 1 to 5 alpha characters followed by ":" is legal, otherwise prepend "http://"        
        var    url = this.urlModel.value; 
        if (/^[a-z]{1,5}:/.test(url) === false)    {
            // Strip any leading slashes
            url = url.replace(/^\/{1,2}/,"");                                
            url = "http://"+url;                                                        
        }
        
        // Update the entered URL & model
        this.urlModel.value = url;
        this.sceneAssistant.controller.modelChanged(this.urlModel);
        
        // If the url is the same, then assume that it's just a title change,
        // update the feed title and close the dialog. Otherwise update the feed.
        if (this.feedIndex && this.feeds.list[this.feedIndex].url == this.urlModel.value) {
            this.feeds.list[this.feedIndex].title = this.nameModel.value;
            this.sceneAssistant.feedWgtModel.items = this.feeds.list;
            this.sceneAssistant.controller.modelChanged(this.sceneAssistant.feedWgtModel);
            this.widget.mojo.close();
        }
        else {
            
            this.okButton.mojo.activate();
            this.okButtonActive = true;
            this.okButtonModel.label = "Updating Feed";
            this.okButtonModel.disabled = true;
            this.sceneAssistant.controller.modelChanged(this.okButtonModel);

            var request = new Ajax.Request(url, {
                method: "get",
                evalJSON: "false",
                onSuccess: this.checkSuccess.bind(this),
                onFailure: this.checkFailure.bind(this)
            });
        }
};

// checkSuccess - Ajax request success
AddDialogAssistant.prototype.checkSuccess = function(transport) {
    Mojo.Log.info("Valid URL - HTTP Status", transport.status);
    
    // DEBUG - Work around due occasion Ajax XML error in response.
    if (transport.responseXML === null && transport.responseText !== null) {
            Mojo.Log.info("Request not in XML format - manually converting");
            transport.responseXML = new DOMParser().parseFromString(transport.responseText, "text/xml");
     }
    
    var feedError = News.errorNone;
    
    //  If a new feed, push the entered feed data on to the feedlist and
    //  call processFeed to evaluate it.
    if (this.feedIndex === null) {
        this.feeds.list.push({title:this.nameModel.value, url:this.urlModel.value,
            type:"", value:false, numUnRead:0, stories:[]});
        // processFeed - index defaults to last entry
        feedError = this.feeds.processFeed(transport);                
    }
    else    {
        this.feeds.list[this.feedIndex] = {title:this.nameModel.value, url:this.urlModel.value,
            type:"", value:false, numUnRead:0, stories:[]};
        feedError = this.feeds.processFeed(transport, this.feedIndex);    
    }
    
    // If successful processFeed returns errorNone
    if (feedError === News.errorNone)    {
        // update the widget, save the DB and exit
        this.sceneAssistant.feedWgtModel.items = this.feeds.list;       
        this.sceneAssistant.controller.modelChanged(this.sceneAssistant.feedWgtModel);    
        this.feeds.storeFeedDb();    
        this.widget.mojo.close();    
    }
    else    {
        // Feed can't be processed - remove it but keep the dialog open
        this.feeds.list.pop();                                                                        
        if (feedError == News.invalidFeedError)    {
            Mojo.Log.warn("Feed ",
                this.urlModel.value, " isn't a supported feed type.");
            var addFeedTitleElement = this.controller.get("add-feed-title");
            addFeedTitleElement.update($L("Invalid Feed Type - Please Retry"));
        }
        
        this.okButton.mojo.deactivate();
        this.okButtonActive = false;
        this.okButtonModel.buttonLabel = "OK";
        this.okButtonModel.disabled = false;
        this.sceneAssistant.controller.modelChanged(this.okButtonModel);        
    }
};

// checkFailure  - Ajax request failure
AddDialogAssistant.prototype.checkFailure = function(transport) {
    // Log error and put message in status area
    Mojo.Log.info("Invalid URL - HTTP Status", transport.status);
    var addFeedTitleElement = this.controller.get("add-feed-title");
    addFeedTitleElement.update($L("Invalid URL - Please Retry."));
};

// cleanup  - remove listeners
AddDialogAssistant.prototype.cleanup = function() {
    // TODO - Cancel Ajax request or Feed operation if in progress
    this.sceneAssistant.controller.stopListening("okButton", Mojo.Event.tap,
        this.checkFeedHandler);
    this.sceneAssistant.controller.stopListening("cancelButton", Mojo.Event.tap,
        this.widget.mojo.close);
};



//    ---------------------------------------------------------------------------------------
//
//    FeedListAssistant - main scene handler for news feedlists
//    
function FeedListAssistant(feeds) {
    this.feeds = feeds;
    this.appController = Mojo.Controller.getAppController();
    this.stageController = this.appController.getStageController(News.MainStageName);
}

FeedListAssistant.prototype.setup =  function() {

    // Setup App Menu
    this.controller.setupWidget(Mojo.Menu.appMenu, News.MenuAttr, News.MenuModel);
    
    // Setup the search filterlist and handlers;
    this.controller.setupWidget("startSearchField",
        {
            itemTemplate: "storyList/storyRowTemplate",
            listTemplate: "storyList/storyListTemplate",
            filterFunction: this.searchList.bind(this),
            renderLimit: 70,
            delay: 350
        },
        this.searchFieldModel = {
            disabled: false
        });
    
    this.viewSearchStoryHandler = this.viewSearchStory.bindAsEventListener(this);
    this.controller.listen("startSearchField", Mojo.Event.listTap,
        this.viewSearchStoryHandler);
    this.searchFilterHandler = this.searchFilter.bindAsEventListener(this);
    this.controller.listen("startSearchField", Mojo.Event.filter,
        this.searchFilterHandler, true);
        
    // Setup header, drawer, scroller and handler for feature feeds

    this.featureDrawerHandler = this.toggleFeatureDrawer.bindAsEventListener(this);
    this.controller.listen("featureDrawer", Mojo.Event.tap,
        this.featureDrawerHandler);
        
    this.controller.setupWidget("featureFeedDrawer", {}, this.featureFeedDrawer = {open:News.featureFeedEnable});
    
    this.featureScrollerModel = {
        scrollbars: false,
        mode: "vertical"
        };
    
    this.controller.setupWidget("featureScroller", this.featureScrollerModel);
    this.readFeatureStoryHandler = this.readFeatureStory.bindAsEventListener(this);
    this.controller.listen("featureStoryDiv", Mojo.Event.tap,
        this.readFeatureStoryHandler);
        
            // If feature story is enabled, then set the icon to open
    if (this.featureFeedDrawer.open === true) {
        this.controller.get("featureDrawer").className = "featureFeed-open";
    } else  {
        this.controller.get("featureDrawer").className = "featureFeed-close";
    }
    
    // Setup the feed list, but it's empty
    this.controller.setupWidget("feedListWgt",
         {
            itemTemplate:"feedList/feedRowTemplate", 
            listTemplate:"feedList/feedListTemplate", 
            addItemLabel:$L("Add..."), 
            swipeToDelete:true, 
            renderLimit: 40,
            reorderable:true
        },
        this.feedWgtModel = {items: this.feeds.list});
    
    // Setup event handlers: list selection, add, delete and reorder feed entry
    this.showFeedHandler = this.showFeed.bindAsEventListener(this);
    this.controller.listen("feedListWgt", Mojo.Event.listTap,
        this.showFeedHandler);
    this.addNewFeedHandler = this.addNewFeed.bindAsEventListener(this);
    this.controller.listen("feedListWgt", Mojo.Event.listAdd,
        this.addNewFeedHandler);    
    this.listDeleteFeedHandler = this.listDeleteFeed.bindAsEventListener(this);
    this.controller.listen("feedListWgt", Mojo.Event.listDelete,
        this.listDeleteFeedHandler);
    this.listReorderFeedHandler = this.listReorderFeed.bindAsEventListener(this);
    this.controller.listen("feedListWgt", Mojo.Event.listReorder,
        this.listReorderFeedHandler);
    
    // Setup spinner for feedlist updates
    this.controller.setupWidget("feedSpinner", {property: "value"});

    // Setup listeners for minimize/maximize events
    this.activateWindowHandler = this.activateWindow.bindAsEventListener(this);
    Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.activate,
        this.activateWindowHandler);
    this.deactivateWindowHandler = this.deactivateWindow.bindAsEventListener(this);
    Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.deactivate,
        this.deactivateWindowHandler);
        
    // Setup up feature story index to first story of the first feed
    this.featureIndexFeed = 0;
    this.featureIndexStory = 0;    
};

// activate - handle portrait/landscape orientation, feature feed layout and rotation,
//   and show the info dialog for the first launch after an app update.
FeedListAssistant.prototype.activate =  function() {
    
    // Set Orientation to free to allow rotation
    if (this.controller.stageController.setWindowOrientation) {
        this.controller.stageController.setWindowOrientation("free");
    }
    
    if (News.feedListChanged === true)    {
        this.feedWgtModel.items = this.feeds.list; 
        this.controller.modelChanged(this.feedWgtModel, this);
        this.controller.modelChanged(this.searchFieldModel, this);
    
        // Don't update the database here; it's slow enough that it lags the UI;
        // wait for a feature story update to mask the update effect
    }
    
    if (News.updateDialog === true)  {
            News.updateDialog = false;
            this.controller.showDialog({
               template: "feedList/update-dialog",
               assistant: new UpdateDialogAssistant(this)
            });   
    }    
            
    // If there's some stories in the feed list, then start 
    // the story rotation even if the featureFeed is disabled as we'll use
    // the rotation timer to update the DB
    if(this.feeds.list[this.featureIndexFeed].stories.length > 0) {
        var splashScreenElement = this.controller.get("splashScreen");
        splashScreenElement.hide();
        this.showFeatureStory();
    }
};

// deactivate - always turn off feature timer
FeedListAssistant.prototype.deactivate =  function() {
    Mojo.Log.info("FeedList deactivating");
    this.clearTimers();    
};

// cleanup - always turn off timers, and save this.feeds.list contents
FeedListAssistant.prototype.cleanup =  function() {
    Mojo.Log.info("FeedList cleaning up");
    
    // Save the feed list on close, as a precaution; shouldn't be needed; don't wait for results
    this.feeds.storeFeedDb();
    
    // Clear feature story timer and activity indicators
    this.clearTimers();
    
    // Remove event listeners
    this.controller.stopListening("startSearchField", Mojo.Event.listTap,
        this.viewSearchStoryHandler);
    this.controller.stopListening("startSearchField", Mojo.Event.filter,
        this.searchFilterHandler, true);
    this.controller.stopListening("featureDrawer", Mojo.Event.tap,
        this.featureDrawerHandler);
    this.controller.stopListening("feedListWgt", Mojo.Event.listTap,
        this.showFeedHandler);
    this.controller.stopListening("feedListWgt", Mojo.Event.listAdd,
        this.addNewFeedHandler);    
    this.controller.stopListening("feedListWgt", Mojo.Event.listDelete,
        this.listDeleteFeedHandler);
    this.controller.stopListening("feedListWgt", Mojo.Event.listReorder,
        this.listReorderFeedHandler);
    Mojo.Event.stopListening(this.controller.stageController.document, Mojo.Event.activate,
        this.activateWindowHandler);
    Mojo.Event.stopListening(this.controller.stageController.document, Mojo.Event.deactivate,
        this.deactivateWindowHandler);
};

FeedListAssistant.prototype.activateWindow = function() {
    Mojo.Log.info("Activate Window");
    this.feedWgtModel.items = this.feeds.list; 
    this.controller.modelChanged(this.feedWgtModel);

    // If stories exist in the this.featureIndexFeed, then start the rotation if not already started
    if ((this.feeds.list[this.featureIndexFeed].stories.length > 0) && (News.featureStoryTimer === null)) {
        var splashScreenElement = this.controller.get("splashScreen");
        splashScreenElement.hide();
        this.showFeatureStory();
    }
};

FeedListAssistant.prototype.deactivateWindow = function() {
    Mojo.Log.info("Deactivate Window");
    this.clearTimers();    
};

// ------------------------------------------------------------------------
// List functions for Delete, Reorder and Add
//
// listDeleteFeed - triggered by deleting a feed from the list and updates
// the feedlist to reflect the deletion
//
FeedListAssistant.prototype.listDeleteFeed =  function(event) {
    Mojo.log("News deleting "+event.item.title+".");
    
    var deleteIndex = this.feeds.list.indexOf(event.item);
    this.feeds.list.splice(deleteIndex, 1);
    this.feedWgtModel.items = this.feeds.list;
    News.feedListChanged = true;
    
    // Adjust the feature story index if needed:
    // - feed that falls before feature story feed is deleted 
    // - feature story feed itself is deleted (default back to first feed)
    if (deleteIndex == this.featureIndexFeed)    {
        this.featureIndexFeed = 0;
        this.featureIndexStory = 0;
    } else    {
        if (deleteIndex < this.featureIndexFeed)    {
            this.featureIndexFeed--;
        }
    }
};

// listReorderFeed - triggered re-ordering feed list and updates the
// feedlist to reflect the changed order
FeedListAssistant.prototype.listReorderFeed =  function(event) {
    Mojo.log("com.palm.app.news - News moving "+event.item.title+".");
    
    var    fromIndex = this.feeds.list.indexOf(event.item);
    var toIndex = event.toIndex;
    this.feeds.list.splice(fromIndex, 1);
    this.feeds.list.splice(toIndex, 0, event.item);    
    this.feedWgtModel.items = this.feeds.list;
    News.feedListChanged = true;
    
    // Adjust the feature story index if needed:
    // - feed that falls after featureIndexFeed is moved before it
    // - feed before is moved after
    // - the feature story feed itself is moved
    if (fromIndex > this.featureIndexFeed && toIndex <= this.featureIndexFeed)     {
        this.featureIndexFeed++;
    }    else {
        if (fromIndex < this.featureIndexFeed && toIndex > this.featureIndexFeed)    {
            this.featureIndexFeed--;
        }    else    {
            if (fromIndex == this.featureIndexFeed)    {
                this.featureIndexFeed = toIndex;
            }
        }
    }
};

// addNewFeed - triggered by "Add..." item in feed list
FeedListAssistant.prototype.addNewFeed = function() {
                
        this.controller.showDialog({
            template: "feedList/addFeed-dialog",
            assistant: new AddDialogAssistant(this, this.feeds)
        });
        
};

// ----------------------------------------------------------------------------------
// clearTimers - clears timers used in this scene when exiting the scene
FeedListAssistant.prototype.clearTimers = function()    {
    if(News.featureStoryTimer !== null) {
        this.controller.window.clearInterval(News.featureStoryTimer);
        News.featureStoryTimer = null;
    }
    
    // Clean up any active update spinners
    for (var i=0; i<this.feeds.list.length; i++) {
            this.feeds.list[i].value = false;
    }
    this.controller.modelChanged(this.feedWgtModel);

};

// ---------------------------------------------------------------------
// considerForNotification - called by the framework when a notification
//  is issued; look for notifications of feed updates and update the
//  feedWgtModel to reflect changes, update the feed's spinner model
FeedListAssistant.prototype.considerForNotification = function(params){
    if (params && (params.type == "update"))    {
        this.feedWgtModel.items = this.feeds.list;
        this.feeds.list[params.feedIndex].value = params.update;
        this.controller.modelChanged(this.feedWgtModel);

        // If stories exist in the this.featureIndexFeed, then start the rotation if not already started
        if ((this.feeds.list[this.featureIndexFeed].stories.length > 0) && (News.featureStoryTimer === null)) {
            var splashScreenElement = this.controller.get("splashScreen");
            splashScreenElement.hide();
            this.showFeatureStory();
    
        }
    }
    return undefined;
};

// --------------------------------------------------------------------------------
// Feature story functions
//
// showFeatureStory - simply rotate the stories within the
// featured feed, which the user can set in their preferences. 
FeedListAssistant.prototype.showFeatureStory = function() {
    
    // If timer is null, either initial story or restarting. Start with
    // previous story..
    if (News.featureStoryTimer === null)    {
        News.featureStoryTimer = this.controller.window.setInterval(this.showFeatureStory.bind(this),
            News.featureStoryInterval);    
    }
    
    else {
        this.featureIndexStory = this.featureIndexStory+1;
        if(this.featureIndexStory >= this.feeds.list[this.featureIndexFeed].stories.length) {
            this.featureIndexStory = 0;
            this.featureIndexFeed = this.featureIndexFeed+1;
            if (this.featureIndexFeed >= this.feeds.list.length)    {
                this.featureIndexFeed = 0;
            }
        }
    }
    
    var summary = this.feeds.list[this.featureIndexFeed].stories[this.featureIndexStory].text.replace(/(<([^>]+)>)/ig,"");
    summary = summary.replace(/http:\S+/ig,"");
    var featureStoryTitleElement = this.controller.get("featureStoryTitle");
    this.controller.update(featureStoryTitleElement,
        unescape(this.feeds.list[this.featureIndexFeed].stories[this.featureIndexStory].title));    
    var featureStoryElement = this.controller.get("featureStory");
    this.controller.update(featureStoryElement, summary);
    
    // Because this is periodic and not tied to a screen transition, use
    // this to update the db when changes have been made
    
    if (News.feedListChanged === true)    {
        this.feeds.storeFeedDb();
        News.feedListChanged = false;
    }
    
};

// readFeatureStory - handler when user taps on feature story; will push storyView
//  with the current feature story.
FeedListAssistant.prototype.readFeatureStory = function() {
    this.stageController.pushScene("storyView", this.feeds.list[this.featureIndexFeed], this.featureIndexStory);
};

// toggleFeatureDrawer - handles taps to the featureFeed drawer. Toggle
//   drawer and icon class to reflect drawer state.
FeedListAssistant.prototype.toggleFeatureDrawer =  function(event) {
       var featureDrawer = this.controller.get("featureDrawer");
       if (this.featureFeedDrawer.open === true) {
           this.featureFeedDrawer.open = false;
           News.featureFeedEnable = false;
           featureDrawer.className = "featureFeed-close";
       } else {
           this.featureFeedDrawer.open = true;
           News.featureFeedEnable = true;
           featureDrawer.className = "featureFeed-open";
       }
       this.controller.modelChanged(this.featureFeedDrawer);
       News.Cookie.storeCookie();                // Update News saved preferences                                                                            
};

// ---------------------------------------------------------------------
// Search Functions
//
// searchFilter - triggered by entry into search field. First entry will
//  hide the main feedList scene - clearing the entry will restore the scene.
//
FeedListAssistant.prototype.searchFilter = function(event)    {
    Mojo.Log.info("Got search filter: ", event.filterString);
    var feedListMainElement = this.controller.get("feedListMain");
    if (event.filterString !== "")    {
        //    Hide rest of feedList scene to make room for search results
        feedListMainElement.hide();
    }    else    {
        //    Restore scene when search string is null
        feedListMainElement.show();
    }
    
};

// viewSearchStory - triggered by tapping on an entry in the search results
// list  will push the storyView scene with the tapped story.
//
FeedListAssistant.prototype.viewSearchStory = function(event)    {
    var searchList = {title: $L("Search for: ")+this.filter, stories: this.entireList};
    var storyIndex = this.entireList.indexOf(event.item);
    
    Mojo.Log.info("Search display selected story with title = ",
        searchList.title, "; Story index - ", storyIndex);
    this.stageController.pushScene("storyView", searchList, storyIndex);
    
};

// searchList - filter function called from search field widget to update the
//  results list. This function will build results list by matching the
//  filterstring to the story titles and text content, and then return the
//  subset of the list based on offset and size requested by the widget.
//
FeedListAssistant.prototype.searchList = function(filterString, listWidget, offset, count)    {
    
    var subset = [];
    var totalSubsetSize = 0;
    
    this.filter = filterString;    
    
    //    If search string is null, then return empty list, otherwise build results list
    if (filterString !== "")    { 
    
        // Search database for stories with the search string; push matches
        var items = [];
        
        // Comparison function for matching strings in next for loop
        var hasString = function(query, s) {
            if(s.text.toUpperCase().indexOf(query.toUpperCase())>=0) {
                return true;
            }
            if(s.title.toUpperCase().indexOf(query.toUpperCase())>=0) {
                return true;
            }
            return false;
        };
        
        for (var i=0; i<this.feeds.list.length; i++) {
            for (var j=0; j<this.feeds.list[i].stories.length; j++) {
                if(hasString(filterString, this.feeds.list[i].stories[j])) {
                    var sty = this.feeds.list[i].stories[j];
                    items.push(sty);
                }
            }
        }
        
    this.entireList = items;
    Mojo.Log.info("Search list asked for items: filter=",
        filterString, " offset=", offset, " limit=", count);

    // Cut down the list results to just the window asked for by the filterList widget
    var cursor = 0;
        while (true) {
            if (cursor >= this.entireList.length) {
                break;
            }
    
            if (subset.length < count && totalSubsetSize >= offset) {
                subset.push(this.entireList[cursor]);
            }
            totalSubsetSize++;
            cursor++;
        }
    }

    // Update List
    listWidget.mojo.noticeUpdatedItems(offset, subset);

    // Update filter field count of items found
    listWidget.mojo.setLength(totalSubsetSize);
    listWidget.mojo.setCount(totalSubsetSize);

};

// ---------------------------------------------------------------------------------
// Show feed and popup menu handler
//
// showFeed - triggered by tapping a feed in the this.feeds.list.
//   Detects taps on the unReadCount icon; anywhere else, 
//   the scene for the list view is pushed. If the icon is tapped,
//   put up a submenu for the feedlist options
FeedListAssistant.prototype.showFeed = function(event) {
        var target = event.originalEvent.target.id;
        if (target !== "info") {
          this.stageController.pushScene("storyList", this.feeds.list, event.index);
        }
        else  {
            var myEvent = event;
            var findPlace = myEvent.originalEvent.target;
            this.popupIndex = event.index;
            this.controller.popupSubmenu({
              onChoose:  this.popupHandler,
              placeNear: findPlace,
              items: [
                {label: $L("All Unread"), command: "feed-unread"},
                {label: $L("All Read"), command: "feed-read"},
                {label: $L("Edit Feed"), command: "feed-edit"},
                {label: $L("New Card"), command: "feed-card"}
                ]
              });
        }
};

// popupHandler - choose function for feedPopup
FeedListAssistant.prototype.popupHandler = function(command) {
        var popupFeed=this.feeds.list[this.popupIndex];    
        switch(command) {
            case "feed-unread":
                Mojo.Log.info("Popup - unread for feed:", popupFeed.title);
                
                for (var i=0; i<popupFeed.stories.length; i++ ) {
                    popupFeed.stories[i].unreadStyle = News.unreadStory;    
                }
                popupFeed.numUnRead = popupFeed.stories.length;
                this.controller.modelChanged(this.feedWgtModel);
                break;

            case "feed-read":
                Mojo.Log.info("Popup - read for feed:", popupFeed.title);
                for (var j=0; j<popupFeed.stories.length; j++ ) {
                    popupFeed.stories[j].unreadStyle = "";    
                }
                popupFeed.numUnRead = 0;
                this.controller.modelChanged(this.feedWgtModel);
                break;
                
            case "feed-edit":
                Mojo.Log.info("Popup edit for feed:", popupFeed.title);
                this.controller.showDialog({
                    template: "feedList/addFeed-dialog",
                    assistant: new AddDialogAssistant(this, this.feeds, this.popupIndex)
                });
                break;
                
            case "feed-card":
                Mojo.Log.info("Popup tear off feed to new card:", popupFeed.title);
                
                var newCardStage = "newsCard"+this.popupIndex;
                var cardStage = this.appController.getStageController(newCardStage);
                var feedList = this.feeds.list;
                var feedIndex = this.popupIndex;
                if(cardStage) {
                    Mojo.Log.info("Existing Card Stage");
                    cardStage.popScenesTo();
                    cardStage.pushScene("storyList", this.feeds.list, feedIndex);
                    cardStage.activate();
                } else  {
                    Mojo.Log.info("New Card Stage");
                    var pushStoryCard = function(stageController){
                        stageController.pushScene("storyList", feedList, feedIndex);
                    };
                    this.appController.createStageWithCallback({name: newCardStage, lightweight: true},
                        pushStoryCard, "card");
                }
                break;

       }
};
