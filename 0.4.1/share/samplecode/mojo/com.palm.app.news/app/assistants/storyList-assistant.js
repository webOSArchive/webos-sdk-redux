/*  StoryListAssistant - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Displays the feed's stories in a list, user taps display the
    selected story in the storyView scene. Major components:
    - Setup view menu to move to next or previous feed
    - Search filter; perform keyword search within feed list
    - Story View; push story scene when a story is tapped
    - Update; handle notifications if feedlist has been updated
    
    Arguments:
    - feedlist; Feeds.list array of all feeds
    - selectedFeedIndex; Feed to be displayed                
*/

function StoryListAssistant(feedlist, selectedFeedIndex) {
    this.feedlist = feedlist;
    this.feed = feedlist[selectedFeedIndex];
    this.feedIndex = selectedFeedIndex;
    Mojo.Log.info("StoryList entry = ", this.feedIndex);
    Mojo.Log.info("StoryList feed = " + Object.toJSON(this.feed));
}
    

StoryListAssistant.prototype.setup =  function() {    
    this.stageController = this.controller.stageController;
    // Setup scene header with feed title and next/previous feed buttons. If
    // this is the first feed, suppress Previous menu; if last, suppress Next menu
    var    feedMenuPrev = {};
    var    feedMenuNext = {};        
            
    if (this.feedIndex > 0)    {
        feedMenuPrev = {
            icon: "back",
            command: "do-feedPrevious"
        };                
    } else    {
        // Push empty menu to force menu bar to draw on left (label is the force)
        feedMenuPrev = {icon: "", command: "", label: "  "};
    }
    
    if (this.feedIndex < this.feedlist.length-1)    {
        feedMenuNext = {
            iconPath: "images/menu-icon-forward.png",
            command: "do-feedNext"
        };
    } else    {
        // Push empty menu to force menu bar to draw on right (label is the force)
        feedMenuNext = {icon: "", command: "", label: "  "};
    }
    
    this.feedMenuModel =     {
        visible: true,
        items:     [{
            items: [
                feedMenuPrev,
                { label: this.feed.title, width: 200 },
                feedMenuNext
            ]
        }]    
    };
    
    this.controller.setupWidget(Mojo.Menu.viewMenu, 
        { spacerHeight: 0, menuClass:"no-fade" }, this.feedMenuModel);
            
    // Setup App Menu
    this.controller.setupWidget(Mojo.Menu.appMenu, News.MenuAttr, News.MenuModel);
    
    // Setup the search filterlist and handlers;
    this.controller.setupWidget("storyListSearch",
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
    this.controller.listen("storyListSearch", Mojo.Event.listTap,
        this.viewSearchStoryHandler);
    this.searchFilterHandler = this.searchFilter.bindAsEventListener(this);
    this.controller.listen("storyListSearch", Mojo.Event.filter,
        this.searchFilterHandler, true);
        
    // Setup story list with standard news list templates.
    this.controller.setupWidget("storyListWgt", 
        {
            itemTemplate: "storyList/storyRowTemplate",
            listTemplate: "storyList/storyListTemplate",
            swipeToDelete: false, 
            renderLimit: 40,
            reorderable: false
        },    
        this.storyModel = {
            items: this.feed.stories
        }
    );
    
    this.readStoryHandler = this.readStory.bindAsEventListener(this);
    this.controller.listen("storyListWgt", Mojo.Event.listTap,
        this.readStoryHandler);    
};

StoryListAssistant.prototype.activate =  function() {
    // Update list models in case unReadCount has changed
    this.controller.modelChanged(this.storyModel);                    
};

StoryListAssistant.prototype.cleanup =  function() {
    // Remove event listeners
    this.controller.stopListening("storyListSearch", Mojo.Event.listTap,
        this.viewSearchStoryHandler);
    this.controller.stopListening("storyListSearch", Mojo.Event.filter,
        this.searchFilterHandler, true);
    this.controller.stopListening("storyListWgt", Mojo.Event.listTap,
        this.readStoryHandler);
};

// readStory - when user taps on displayed story, push storyView scene
StoryListAssistant.prototype.readStory = function(event) {
    Mojo.Log.info("Display selected story = ", event.item.title,
        "; Story index = ", event.index);
    this.stageController.pushScene("storyView", this.feed, event.index);
};

// handleCommand - handle next and previous commands    
StoryListAssistant.prototype.handleCommand = function(event) {        
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case "do-feedNext":
                this.nextFeed();
                break;
            case "do-feedPrevious":
                this.previousFeed();
                break;
        }
    }
};

// nextFeed - Called when the user taps the next menu item
StoryListAssistant.prototype.nextFeed = function(event) {
    this.stageController.swapScene(
        {
            transition: Mojo.Transition.crossFade,
            name: "storyList"
        },
        this.feedlist,
        this.feedIndex+1);
};

// previousFeed - Called when the user taps the previous menu item
StoryListAssistant.prototype.previousFeed = function(event) {
    this.stageController.swapScene(
        {
            transition: Mojo.Transition.crossFade,
            name: "storyList"
        },
        this.feedlist,
        this.feedIndex-1);
};

// searchFilter - triggered by entry into search field. First entry will
//   hide the main storyList scene and clearing the entry will restore the scene.
StoryListAssistant.prototype.searchFilter = function(event)    {
    var storyListSceneElement = this.controller.get("storyListScene");
    if (event.filterString !== "")    {
        //    Hide rest of storyList scene to make room for search results
        storyListSceneElement.hide();
    }    else    {
        //    Restore scene when search string is null
        storyListSceneElement.show();
    }
    
};

// viewSearchStory - triggered by tapping on an entry in the search results list.
StoryListAssistant.prototype.viewSearchStory = function(event)    {
    var searchList = {title: $L("Search for: #{filter}").interpolate({filter: this.filter}), stories: this.entireList};

    var storyIndex = this.entireList.indexOf(event.item);
    
    this.stageController.pushScene("storyView", searchList, storyIndex);
    
};

// searchList - filter function called from search field widget to update
// results list. This function will build results list by matching the
// filterstring to story titles and text content, and return the subset
// of list based on offset and size requested by the widget.t.
StoryListAssistant.prototype.searchList = function(filterString, listWidget, offset, count)    {
    
    var subset = [];
    var totalSubsetSize = 0;
    
    this.filter = filterString;    
    
    // If search string is null, then return empty list, otherwise build results list
    if (filterString !== "")    { 
    
        // Search database for stories with the search string
        // and push on to the items array
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
        
        for (var j=0; j<this.feed.stories.length; j++) {
            if(hasString(filterString, this.feed.stories[j])) {
                var sty = this.feed.stories[j];
                items.push(sty);
            }
        }
    
        this.entireList = items;
    
        Mojo.Log.info("Search list asked for items: filter=", filterString,
            " offset=", offset, " limit=", count);
    
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

// considerForNotification - called when a notification is issued; if this
// feed has been changed, then update it.
StoryListAssistant.prototype.considerForNotification = function(params){
    if (params && (params.type == "update"))    {
        if ((params.feedIndex == this.feedIndex) && (params.update === false)) {
            this.storyModel.items = this.feed.stories;
            this.controller.modelChanged(this.storyModel);
        }
    }
    return undefined;
};