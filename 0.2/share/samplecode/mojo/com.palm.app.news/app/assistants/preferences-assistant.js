/*  Preferences - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Preferences - Handles preferences scene, where the user can:
        - enable or disable the featured feed element on the FeedList Scene
        - select the featured feed when enabled
        - select the featured feed rotation interval
        - select the interval for feed updates
        - enable or disable background feed notifications
        - enable or disable device wakeup
    
    App Menu is disabled in this scene.
        
*/    

function PreferencesAssistant() {

}

PreferencesAssistant.prototype.setup = function() {
        
    // Setup Integer Picker to pick feature feed rotation interval
    this.controller.setupWidget("featureFeedDelay",
        {
            label:    $L("Rotation (in seconds)"),
            modelProperty:    "value", 
            min: 1,
            max: 20    
        },        
        this.featureDelayModel = {
            value : News.featureStoryInterval/1000
        });

    this.changeFeatureDelayHandler = this.changeFeatureDelay.bindAsEventListener(this);
    this.controller.listen("featureFeedDelay", Mojo.Event.propertyChange,
        this.changeFeatureDelayHandler);
    
    // Setup list selector for UPDATE INTERVAL and a handler for when it is changed;
    this.controller.setupWidget("feedCheckIntervalList",
        {
            label: $L("Interval"),
            choices: [
                {label: $L("Manual Updates"),     value: "00:00:00"},
                {label: $L("5 Minutes"),         value: "00:05:00"},    
                {label: $L("15 Minutes"),       value: "00:15:00"},    
                {label: $L("1 Hour"),             value: "01:00:00"},    
                {label: $L("4 Hours"),             value: "04:00:00"},
                {label: $L("1 Day"),             value: "23:59:59"}
            ]    
        },
        this.feedIntervalModel = {
            value : News.feedUpdateInterval
        });
    
    this.changeFeedIntervalHandler = this.changeFeedInterval.bindAsEventListener(this);
    this.controller.listen("feedCheckIntervalList", Mojo.Event.propertyChange,
        this.changeFeedIntervalHandler);
        
    // Toggle for enabling notifications for new stories during feed updates
    this.controller.setupWidget("notificationToggle",
        {},
        this.notificationToggleModel = {
            value: News.notificationEnable
        });
    this.changeNotificationHandler = this.changeNotification.bindAsEventListener(this);
    this.controller.listen("notificationToggle", Mojo.Event.propertyChange,
        this.changeNotificationHandler);
        
    // Toggle for enabling feed updates while the device is asleep
    this.controller.setupWidget("bgUpdateToggle",
        {},
        this.bgUpdateToggleModel = {
            value: News.feedUpdateBackgroundEnable
        });
    
    this.changeBgUpdateHandler = this.changeBgUpdate.bindAsEventListener(this);
    this.controller.listen("bgUpdateToggle", Mojo.Event.propertyChange,
        this.changeBgUpdate);
};

// Deactivate - save News preferences and globals
PreferencesAssistant.prototype.deactivate = function() {
    News.Cookie.storeCookie();                                                                                    
};

// Cleanup - remove listeners
PreferencesAssistant.prototype.cleanup = function() {
    this.controller.stopListening("featureFeedDelay", Mojo.Event.propertyChange,
        this.changeFeatureDelayHandler);
    this.controller.stopListening("feedCheckIntervalList", Mojo.Event.propertyChange,
        this.changeFeedIntervalHandler);
    this.controller.stopListening("notificationToggle", Mojo.Event.propertyChange,
        this.changeNotificationHandler);
    this.controller.stopListening("bgUpdateToggle", Mojo.Event.propertyChange,
        this.changeBgUpdate);
};

//    changeFeatureDelay - Handle changes to the feature feed interval
PreferencesAssistant.prototype.changeFeatureDelay = function(event) {
    Mojo.Log.info("Preferences Feature Delay Handler; value = ",
        this.featureDelayModel.value);
    
    //  Interval is in milliseconds
    News.featureStoryInterval = this.featureDelayModel.value*1000;
    
    // If timer is active, restart with new value
    if(News.featureStoryTimer !== null) {
        this.controller.window.clearInterval(News.featureStoryTimer);
        News.featureStoryTimer = null;
    }                                                        
};

//    changeFeedInterval    - Handle changes to the feed update interva;
PreferencesAssistant.prototype.changeFeedInterval = function(event) {
    Mojo.Log.info("Preferences Feed Interval Handler; value = ",
        this.feedIntervalModel.value);
    News.feedUpdateInterval = this.feedIntervalModel.value;
};

//    changeNotification - disables/enables notifications
PreferencesAssistant.prototype.changeNotification = function(event) {
    Mojo.Log.info("Preferences Notification Toggle Handler; value = ",
        this.notificationToggleModel.value);
    News.notificationEnable = this.notificationToggleModel.value;
};

//    changeBgUpdate - disables/enables background wakeups
PreferencesAssistant.prototype.changeBgUpdate = function(event) {
    Mojo.Log.info("Preferences Background Update Toggle Handler; value = ",
        this.bgUpdateToggleModel.value);
    News.feedUpdateBackgroundEnable = this.bgUpdateToggleModel.value;
};