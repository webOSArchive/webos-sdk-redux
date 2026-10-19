/*  StoryViewAssistant - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Passed a story element, displays that element in a full scene view and offers options
    for next story (right command menu button), previous story (left command menu button)
    and to launch story URL in the browser (view menu) or share story via email or messaging.
    Major components:
    - StoryView; display story in main scene
    - Next/Previous; command menu options to go to next or previous story
    - Web; command menu option to display original story in browser
    - Share; command menu option to share story by messaging or email
    
    Arguments:
    - storyFeed; Selected feed from which the stories are being viewed
    - storyIndex; Index of selected story to be put into the view                
*/

function StoryViewAssistant(storyFeed, storyIndex) {
    this.storyFeed = storyFeed;
    this.storyIndex = storyIndex;
}

// setup - set up menus
StoryViewAssistant.prototype.setup = function() { 
    this.stageController = this.controller.stageController;  
    
    this.storyMenuModel = {
        items: [
            {iconPath: "images/url-icon.png", command: "do-webStory"},
            {},
            {items: []},
            {},
            {icon: "send", command: "do-shareStory"}
        ]};
        
        if (this.storyIndex > 0)    {
           this.storyMenuModel.items[2].items.push({icon: "back", command: "do-viewPrevious"});                
        }    else    {
            this.storyMenuModel.items[2].items.push({icon: "", command: "", label: "  "});
        }
    
        if (this.storyIndex < this.storyFeed.stories.length-1)    {
            this.storyMenuModel.items[2].items.push({icon: "forward", command: "do-viewNext"});
        }
        else {
            this.storyMenuModel.items[2].items.push({icon: "", command: "", label: "  "});
        }

    this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.storyMenuModel);

    // Setup App Menu
    this.controller.setupWidget(Mojo.Menu.appMenu, News.MenuAttr, News.MenuModel);
    
    // Update story title in header and summary
    var storyViewTitleElement = this.controller.get("storyViewTitle");
    var storyViewSummaryElement = this.controller.get("storyViewSummary");
    this.controller.update(storyViewTitleElement,
        this.storyFeed.stories[this.storyIndex].title);
    this.controller.update(storyViewSummaryElement,
        this.storyFeed.stories[this.storyIndex].text);
};

// activate - display selected story
StoryViewAssistant.prototype.activate = function(event) {
    Mojo.Log.info("Story View Activated");
    
    // Update unreadStyle string and unReadCount in case it's changed
    if (this.storyFeed.stories[this.storyIndex].unreadStyle == News.unreadStory)    {
        this.storyFeed.numUnRead--;
        this.storyFeed.stories[this.storyIndex].unreadStyle = "";                                
        News.feedListChanged = true;
    } 

};

// ---------------------------------------------------------------------
// Handlers to go to next and previous stories, display web view 
// or share via messaging or email.
StoryViewAssistant.prototype.handleCommand = function(event) {        
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case "do-viewNext":
                this.stageController.swapScene(
                    {
                        transition: Mojo.Transition.crossFade,
                        name: "storyView"
                    },
                    this.storyFeed, this.storyIndex+1);
                break;
            case "do-viewPrevious":
                this.stageController.swapScene(
                    {
                        transition: Mojo.Transition.crossFade,
                        name: "storyView"
                    },
                    this.storyFeed, this.storyIndex-1);
                break;
            case "do-shareStory":
                var myEvent = event;
                var findPlace = myEvent.originalEvent.target;
                this.controller.popupSubmenu({
                    onChoose:  this.shareHandler,
                    placeNear: findPlace,
                    items: [
                        {label: $L("Email"), command: "do-emailStory"},
                        {label: $L("SMS/IM"), command: "do-messageStory"}
                        ]
                    });
                break;
             case "do-webStory":
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
                       method: "open",
                       parameters: {
                           id: "com.palm.app.browser",
                           params: {
                               target: this.storyFeed.stories[this.storyIndex].url
                           }
                       }
                });
                break;
          }
    }
};

// shareHandler - choose function for share submenu
StoryViewAssistant.prototype.shareHandler = function(command) {    
        switch(command) {
            case "do-emailStory":    
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
                       method: "open",
                       parameters:  {
                           id: "com.palm.app.email",
                           params: {
                            summary: $L("Check out this News story..."),
                            text: this.storyFeed.stories[this.storyIndex].url
                        }
                    }
                });
                break;
            case "do-messageStory":    
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
                       method: "open",
                       parameters: {
                           id: "com.palm.app.messaging",
                           params: {
                               messageText: $L("Check this out: ")+this.storyFeed.stories[this.storyIndex].url
                           }
                       }
                });
                break;
       }    
};



