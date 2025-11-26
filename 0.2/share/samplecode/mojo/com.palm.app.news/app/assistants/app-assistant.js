/*  AppAssistant - NEWS
    
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Responsible for app startup, handling launch points and updating news feeds.
    Major components:
    - setup; app startup including preferences, initial load of feed data
        from the Depot and setting alarms for periodic feed updates
    - handleLaunch; launch entry point for initial launch, feed update
        alarm, dashboard or banner tap
    - handleCommand; handles app menu selections
    
    Data structures:
    - globals; set of persistant data used throughout app
    - Feeds Model; handles all feedlist updates, db handling and default data
    - Cookies Model; handles saving and restoring preferences
    
    App architecture:
    - AppAssistant; handles startup, feed list management and app menu management
    - FeedListAssistant; handles feedList navigation, feedList search, feature feed
    - StoryListAssistant; handles single feed navigation
    - StoryViewAssistant; handles single story navigation
    - PreferencesAssistant; handles preferences display and changes
    - HelpAssistant; handles help topics display
    - DashboardAssistant; displays latest new story and new story count

*/    

//  ---------------------------------------------------------------
//    GLOBALS
//  ---------------------------------------------------------------

//  News namespace
News = {};

// Constants
News.unreadStory = "unReadStyle";                                    
News.versionString = "0.85";
News.MainStageName = "newsStage";
News.DashboardStageName = "newsDashboard";
News.errorNone =    "0";                    // No error, success
News.invalidFeedError = "1";                // Not RSS2, RDF (RSS1), or ATOM

// Global Data Structures

// Persistent Globals - will be saved across app launches
News.featureFeedEnable = true;              // Enables feed rotation                                         
News.featureStoryInterval = 5000;           // Feature Interval (in ms) 
News.notificationEnable = true;             // Enables notifcations 
News.feedUpdateBackgroundEnable = false;    // Enable device wakeup 
News.feedUpdateInterval = "00:15:00";       // Feed update interval 

//  Session Globals - not saved across app launches
News.feedListChanged = false;               // Triggers update to Depot db
News.feedListUpdateInProgress = false;      // Feed update is in progress
News.featureStoryTimer = null;              // Timer for story rotations
News.dbUpdate = "";                         // Default is no update
News.updateDialog = true;                   // Enables update info Dialog
News.wakeupTaskId = 0;                      // Id for wakeup tasks

// Setup App Menu for all scenes; all menu actions handled in
//  AppAssistant.handleCommand()
News.MenuAttr = {omitDefaultItems: true};

News.MenuModel = {
    visible: true,
    items: [ 
        {label: $L("About News..."), command: "do-aboutNews"},
        Mojo.Menu.editItem,
        {label: $L("Update All Feeds"), checkEnabled: true, command: "do-feedUpdate"},
        {label: $L("Preferences..."), command: "do-newsPrefs"},    
        {label: $L("Help..."), command: "do-newsHelp"}            
    ]
};

function AppAssistant (appController) {

}

//  -------------------------------------------------------
//  setup - all startup actions:
//    - Setup globals with preferences
//    - Set up application menu; used in every scene
//    - Open Depot and use contents for feedList
//    - Initiate alarm for first feed update                    

AppAssistant.prototype.setup = function() {
    
    // initialize the feeds model
    this.feeds = new Feeds();
    this.feeds.loadFeedDb();
        
    // load preferences and globals from saved cookie
    News.Cookie.initialize();
            
    // Set up first timeout alarm
    this.setWakeup();
    
};

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
//    - First launch; create card stage and first first scene
//    - Update; after alarm fires to update feeds
//    - Notification; after user taps banner or dashboard
//
AppAssistant.prototype.handleLaunch = function (launchParams) {
    Mojo.Log.info("ReLaunch");

    var cardStageController = this.controller.getStageController(News.MainStageName);
    var appController = Mojo.Controller.getAppController();
    
    if (!launchParams)  {
        // FIRST LAUNCH
        // Look for an existing main stage by name. 
        if (cardStageController) {
            // If it exists, just bring it to the front by focusing its window.
            Mojo.Log.info("Main Stage Exists");
            cardStageController.popScenesTo("feedList");    
            cardStageController.activate();
        } else {
            // Create a callback function to set up the new main stage
            // once it is done loading. It is passed the new stage controller 
            // as the first parameter.
            var pushMainScene = function(stageController) {
                stageController.pushScene("feedList", this.feeds);
            };
            Mojo.Log.info("Create Main Stage");
            var stageArguments = {name: News.MainStageName, lightweight: true};
            this.controller.createStageWithCallback(stageArguments, 
                pushMainScene.bind(this), "card");        
        }
    }
    else  {
        Mojo.Log.info("com.palm.app.news -- Wakeup Call", launchParams.action);  
        switch (launchParams.action) {
                      
    // UPDATE FEEDS
    case "feedUpdate"  :
        // Set next wakeup alarm
        this.setWakeup();
        
        // Update the feed list
        Mojo.Log.info("Update FeedList");
        this.feeds.updateFeedList();
    break;
        
        // NOTIFICATION
        case "notification"  :
             Mojo.Log.info("com.palm.app.news -- Notification Tap");  
            if (cardStageController) {
                
                // If it exists, find the appropriate story list and activate it.
                Mojo.Log.info("Main Stage Exists");
                cardStageController.popScenesTo("feedList");
                cardStageController.pushScene("storyList", this.feeds.list, launchParams.index);
                cardStageController.activate();
            } else {
                
                // Create a callback function to set up a new main stage,
                // push the feedList scene and then the appropriate story list
                var pushMainScene2 = function(stageController) {
                    stageController.pushScene("feedList", this.feeds);
                    stageController.pushScene("storyList", this.feeds.list, launchParams.index);
                };
                Mojo.Log.info("Create Main Stage");
                var stageArguments2 = {name: News.MainStageName, lightweight: true};
                this.controller.createStageWithCallback(stageArguments2, pushMainScene2.bind(this), "card");        
            }
        break;
        
        }
    }
};

// -----------------------------------------
// handleCommand - called to handle app menu selections
//    
AppAssistant.prototype.handleCommand = function(event) {    
    var stageController = this.controller.getActiveStageController();
    var currentScene = stageController.activeScene();
    
    if (event.type == Mojo.Event.commandEnable) {
        if (News.feedListUpdateInProgress && (event.command == "do-feedUpdate")) {
            event.preventDefault();
        }
    }
    
    else {
        
        if(event.type == Mojo.Event.command) {
            switch(event.command) {
            
                case "do-aboutNews":
                    currentScene.showAlertDialog({
                            onChoose: function(value) {},
                            title: $L("News — v#{version}").interpolate({version: News.versionString}),
                            message: $L("Copyright 2009, Palm Inc."),
                            choices:[
                                {label:$L("OK"), value:""}   
                                       ]
                              });
                break;
                
                case "do-newsPrefs":
                    stageController.pushScene("preferences");
                break;
                
                case "do-newsHelp":
                    stageController.pushScene("help");
                break;
            
                case "do-feedUpdate":
                    this.feeds.updateFeedList();
                break;
            }
        }
    }
};

// ------------------------------------------------------------------------
// setWakeup - called to setup the wakeup alarm for background feed updates
//   if preferences are not set for a manual update (value of "00:00:00")
AppAssistant.prototype.setWakeup = function() {    
        if (News.feedUpdateInterval !== "00:00:00")   {
            this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
                method: "set",
                parameters: {
                    "key": "com.palm.app.news.update",
                    "in": News.feedUpdateInterval,
                    "wakeup": News.feedUpdateBackgroundEnable,
                    "uri": "palm://com.palm.applicationManager/open",
                    "params": {
                        "id": "com.palm.app.news",
                        "params": {"action": "feedUpdate"}
                    }
                },
                onSuccess:  function(response){
                Mojo.Log.info("Alarm Set Success", response.returnValue);
                News.wakeupTaskId = Object.toJSON(response.taskId);
                },
                onFailure:  function(response){
                    Mojo.Log.info("Alarm Set Failure",
                        response.returnValue, response.errorText);
                }
            });
           Mojo.Log.info("Set Update Timeout");
        }
};
