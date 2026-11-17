/*  Dashboard Assistant - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Responsible for posting that last feed with new stories,
    including the new story count and the latest story headline.
    
    Arguments:
    - title; News feed title
    - count: Number of new stories
    - message; Latest new story headline
    
    Other than posting the new story, the dashboard will call the
    News apps handleLaunch with a "notification" action when the
    dashboard is tapped, and the dashboard window will be closed.
*/    

function DashboardAssistant(feedlist, selectedFeedIndex) {
    this.list = feedlist;
    this.index = selectedFeedIndex;
    this.title = this.list[this.index].title;
    this.message = this.list[this.index].stories[0].title;
    this.count = this.list[this.index].newStoryCount;
}

DashboardAssistant.prototype.setup = function() {
    this.displayDashboard(this.title, this.message, this.count);
    this.switchHandler = this.launchMain.bindAsEventListener(this);
    this.controller.listen("dashboardinfo", Mojo.Event.tap, this.switchHandler);
    
    this.stageDocument = this.controller.stageController.document;
    this.activateStageHandler = this.activateStage.bindAsEventListener(this);
    Mojo.Event.listen(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
    this.deactivateStageHandler = this.deactivateStage.bindAsEventListener(this);
    Mojo.Event.listen(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);
};

DashboardAssistant.prototype.cleanup = function() {
    // Release event listeners
    this.controller.stopListening("dashboardinfo", Mojo.Event.tap, this.switchHandler);
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);
};

DashboardAssistant.prototype.activateStage = function() {
    Mojo.Log.info("Dashboard stage Activation");
    this.storyIndex = 0;
    this.showStory();
};

DashboardAssistant.prototype.deactivateStage = function() {
    Mojo.Log.info("Dashboard stage Deactivation");
    this.stopShowStory();
};

// Update scene contents, using render to insert the object into an HTML template 
DashboardAssistant.prototype.displayDashboard = function(title, message, count) {
    var info = {title: title, message: message, count: count};
    var renderedInfo = Mojo.View.render({object: info, template: "dashboard/item-info"});
    var infoElement = this.controller.get("dashboardinfo");
    infoElement.update(renderedInfo);
};

DashboardAssistant.prototype.launchMain = function() {
    Mojo.Log.info("Tap to Dashboard");
    var appController = Mojo.Controller.getAppController();
    appController.assistant.handleLaunch({action: "notification", index: this.index});
    this.controller.window.close();
};

// showStory - rotates stories shown in dashboard panel, every 3 seconds.
//   Only displays unread stories 
DashboardAssistant.prototype.showStory = function() {
    Mojo.Log.info("Dashboard Story Rotation", this.timer, this.storyIndex);

    this.interval = 3000;    
    //    If timer is null, just restart the timer and use the most recent story
    //  or the last one displayed;
    if (!this.timer)    {
        this.timer = this.controller.window.setInterval(this.showStory.bind(this),
            this.interval);    
    }    
    
    // Otherwise, get next story in list and update the story in the dashboard display.
    else {
        // replace with test for unread story
        this.storyIndex = this.storyIndex+1;
        if(this.storyIndex >= this.list[this.index].stories.length) {
            this.storyIndex = 0;
        }
    
        this.message = this.list[this.index].stories[this.storyIndex].title;
        this.displayDashboard(this.title, this.message, this.count);
    }
};

DashboardAssistant.prototype.stopShowStory = function() {
    if (this.timer) {
        this.controller.window.clearInterval(this.timer);
        this.timer = undefined;
    }
};

// Update dashboard scene contents - external method
DashboardAssistant.prototype.updateDashboard = function(selectedFeedIndex) {
    this.index = selectedFeedIndex;
    this.title = this.list[this.index].title;
    this.message = this.list[this.index].stories[0].title;
    this.count = this.list[this.index].newStoryCount;
    this.displayDashboard(this.title, this.message, this.count);
};