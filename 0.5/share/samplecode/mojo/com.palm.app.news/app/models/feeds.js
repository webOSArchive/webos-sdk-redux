/*  Feeds - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    The primary data model for the News app. Feeds includes the primary
        data structure for the newsfeeds, which are structured as a list of lists:

    Feeds.list entry is:
      list[x].title           String    Title entered by user
      list[x].url             String    Feed source URL in unescaped form
      list[x].type            String    Feed type: either rdf (rss1), rss (rss2) or atom
      list[x].value           Boolean   Spinner model for feed update indicator
      list[x].numUnRead       Integer   How many stories are still unread
      list[x].newStoryCount   Integer   For each update, how many new stories
      list[x].stories         Array     Each entry is a complete story
          
    list.stories entry is:    
       stories[y].title       String    Story title or headline
       stories[y].text        String    Story text
       stories[y].summary     String    Story text, stripped of markup
       stories[y].unreadStyle String    Null when Read
       stories[y].url         String    Story url                

    Methods:
    initialize(test) - create default and test feed lists
    getDefaultList() - returns the default feed list as an array
    getTestList() - returns both the default and test feed lists as a single array
    loadFeedDb() - loads feed database depot, or creates it with the default feed list
        if it doesn't already exist
    processFeed(transport, index) - function to process incoming feeds that are
        XML encoded in an Ajax object and stores them in the Feeds.list. Supports
        RSS, RDF and Atom feed formats.
    storeFeedDb() - writes contents of Feeds.list array to feed database depot
    updateFeedList(index) - updates the entire feed list starting with this.feedIndex.
*/  

var Feeds = Class.create ({
    
    //  Default Feeds.list
    defaultList: [
            {
                title:"Huffington Post",
                url:"http://feeds.huffingtonpost.com/huffingtonpost/raw_feed",
                type:"atom", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Google",
                url:"http://news.google.com/?output=atom",
                type:"atom", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"BBC News",
                url:"http://newsrss.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"New York Times",
                url:"http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"MSNBC",
                url:"http://rss.msnbc.msn.com/id/3032091/device/rss/rss.xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"National Public Radio",
                url:"http://www.npr.org/rss/rss.php?id=1004",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Slashdot",
                url:"http://rss.slashdot.org/Slashdot/slashdot",
                type:"rdf", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Engadget",
                url:"http://www.engadget.com/rss.xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"The Daily Dish",
                url:"http://feeds.feedburner.com/andrewsullivan/rApM?format=xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Guardian UK",
                url:"http://feeds.guardian.co.uk/theguardian/rss",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Yahoo Sports",
                url:"http://sports.yahoo.com/top/rss.xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"ESPN",
                url:"http://sports-ak.espn.go.com/espn/rss/news",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Ars Technica",
                url:"http://feeds.arstechnica.com/arstechnica/index?format=xml",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            },{
                title:"Nick Carr", 
                url:"http://feeds.feedburner.com/roughtype/unGc",
                type:"rss", value:false, numUnRead:0, newStoryCount:0, stories:[]
            }
        ],
        
        // Additional test feeds
        testList: [
            {
                title:"Hacker News",
                url:"http://news.ycombinator.com/rss",
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Ken Rosenthal",
                url:"http://feeds.feedburner.com/foxsports/rss/rosenthal",
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"George Packer",
                url:"http://www.newyorker.com/online/blogs/georgepacker/rss.xml",
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Palm Open Source",
                url:"http://www.palmopensource.com/tmp/news.rdf",
                type:"rdf", value:false, numUnRead:0, stories:[]
            },{
                title:"Washington Post",
                url:"http://feeds.washingtonpost.com/wp-dyn/rss/linkset/2005/03/24/LI2005032400102_xml",
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Baseball Prospectus", 
                url:"http://www.baseballprospectus.com/rss/feed.xml", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Peter Gammons", 
                url:"http://sports.espn.go.com/keyword/search?searchString=gammons_peter&feed=rss&src=rss&filter=blog", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"McCovey Chronicles", 
                url:"http://feedproxy.google.com/sportsblogs/mccoveychronicles.xml", 
                type:"atom", value:false, numUnRead:0, stories:[]
            },{
                title:"The Page", 
                url:"http://feedproxy.google.com/time/thepage?format=xml", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Salon",
                url:"http://feeds.salon.com/salon/index", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Slate", 
                url:"http://feedproxy.google.com/slate?format=xml", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
             title:"SoSH", 
                url:"http://sonsofsamhorn.net/index.php?act=rssout&id=1", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Talking Points Memo", 
                url:"http://feeds.feedburner.com/talking-points-memo", 
                type:"atom", value:false, numUnRead:0, stories:[]
            },{
                title:"Whatever", 
                url:"http://scalzi.com/whatever/?feed=rss2", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Baseball America", 
                url:"http://www.baseballamerica.com/today/rss/rss.xml", 
                type:"rss", value:false, numUnRead:0, stories:[]
            },{
                title:"Test RDF Feed", 
                url:"http://foobar.blogalia.com/rdf.xml", 
                type:"rdf", value:false, numUnRead:0, stories:[]
            },{
                title:"Daily Kos", 
                url:"http://feeds.dailykos.com/dailykos/index.html", 
                type:"rss", value:false, numUnRead:0, stories:[]
            }
        ],
    // initialize - Assign default data to the feedlist 
    initialize: function(test)  {
        this.feedIndex = 0;
        if (!test)  {
            this.list = this.getDefaultList();
        } else {
            this.list = this.getTestList();
        }
    },
    
    // getDefaultList - returns the default feed list as an array
    getDefaultList: function() {
        var returnList = [];
        for (var i=0; i<this.defaultList.length; i++)   {
            returnList[i] = this.defaultList[i];
        }
        
        return returnList;
    },
    
    // getTestList - returns the default and tests feeds in one array
    getTestList: function() {
        var returnList = [];
        var defaultLength = this.defaultList.length;
        for (var i=0; i<defaultLength; i++)   {
            returnList[i] = this.defaultList[i];
        }
        
        for (var j=0; j<this.testList.length; j++)   {
            returnList[j+defaultLength] = this.testList[j];
        }
        
        return returnList;
    },
    
    // loadFeedDb - loads feed db depot, or creates it with default list
    // if it doesn't already exist
    loadFeedDb: function()  {
    
      // Open the database to get the most recent feed list
      // DEBUG - replace is true to recreate db every time; false for release
        this.db = new Mojo.Depot(
            {name:"feedDB", version:1, estimatedSize:100000, replace: false},
            this.loadFeedDbOpenOk.bind(this),
            function(transaction, result) {
                Mojo.Log.warn("Can't open feed database: ", result.message);
            }
        );
    },

    // dbOpenOK - Callback for successful db request in setup. Get stored db or
    // fallback to using default list
    loadFeedDbOpenOk: function() {
        Mojo.Log.info("Database opened OK");
        this.db.get("feedList", this.loadFeedDbGetSuccess.bind(this), this.loadFeedDbUseDefault.bind(this));
    },

    // loadFeedDbGetSuccess - successful retrieval of db. Call
    //  useDefaultList if the feedlist empty or null or initiate an update
    //  to the list by calling updateFeedList.
    loadFeedDbGetSuccess: function(fl) {
    
        Mojo.Log.info("Database size: " , Object.values(fl).size());
    
        if (Object.toJSON(fl) == "{}" || fl === null) { 
            Mojo.Log.warn("Retrieved empty or null list from DB");
            this.loadFeedDbUseDefault();
        
        } else {
            Mojo.Log.info("Retrieved feedlist from DB");
            this.list = fl;

            // If update, then convert from older versions
            if (News.dbUpdate == "0.4")  {
                for (var i=0; i<this.list.length; i++) {
                    for (var j=0; j<this.list[i].stories.length; j++) {
                        if(this.list[i].stories[j].unreadStyle == "<b>") {
                            this.list[i].stories[j].unreadStyle = News.unreadStory;
                        }
                    }
                }
                News.dbUpdate="";
            }
            this.updateFeedList();
        }
    },

    //    loadFeedDbUseDefault() - Callback for failed DB retrieval meaning no list so use default.
    loadFeedDbUseDefault: function() {
      // Couldn't get the list of feeds. Maybe its never been set up, so 
      // initialize it here to the default list and then initiate an update
      // with this feed list
        Mojo.Log.warn("Database has no feed list. Will use default.");
        this.list = this.getDefaultList();
        this.updateFeedList();  
    },
    
    // processFeed (transport, index) - process incoming feeds that
    // are XML encoded in an Ajax object and stores them in Feeds.list.
    // Supports RSS, RDF and Atom feed formats.

    processFeed: function(transport, index) {
      // Used to hold feed list as it's processed from the Ajax request
        var listItems = [];
      // Variable to hold feed type tags
        var feedType = transport.responseXML.getElementsByTagName("rss");
        
        if (index === undefined)    {
            //    Default index is at end of the list
            index = this.list.length-1;
        }

        // Determine whether RSS 2, RDF (RSS 1) or ATOM feed
        if (feedType.length > 0)    {
            this.list[index].type = "rss";
        }
        else    {    
            feedType = transport.responseXML.getElementsByTagName("RDF");
            if (feedType.length > 0)    {
                this.list[index].type = "RDF";
            }
            else {
                feedType = transport.responseXML.getElementsByTagName("feed");
                if (feedType.length > 0)    {
                    this.list[index].type = "atom";
                }
                else {
                
                // If none of those then it can't be processed, set an error code
                // in the result, log the error and return
                Mojo.Log.warn("Unsupported feed format in feed ",
                    this.list[index].url);
                return News.invalidFeedError;
                }
            }
        }
    
        // Process feeds; retain title, text content and url
        switch(this.list[index].type) {
            case "atom":
                // Temp object to hold incoming XML object
                var atomEntries = transport.responseXML.getElementsByTagName("entry");
                for (var i=0; i<atomEntries.length; i++) {
                    listItems[i] = {
                        title: unescape(atomEntries[i].getElementsByTagName("title").item(0).textContent),
                        text: atomEntries[i].getElementsByTagName("content").item(0).textContent,
                        unreadStyle: News.unreadStory,
                        url: atomEntries[i].getElementsByTagName("link").item(0).getAttribute("href")
                    };
                
                // Strip HTML from text for summary and shorten to 100 characters
                listItems[i].summary = listItems[i].text.replace(/(<([^>]+)>)/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/http:\S+/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/#[a-z]+/ig,"{");
                listItems[i].summary = listItems[i].summary.replace(/(\{([^\}]+)\})/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/digg_url .../,"");
                listItems[i].summary = unescape(listItems[i].summary);
                listItems[i].summary = listItems[i].summary.substring(0,101);
                }
                break;
        
            case "rss":    
                // Temp object to hold incoming XML object
                var rssItems = transport.responseXML.getElementsByTagName("item");
                for (i=0; i<rssItems.length; i++) {

                    listItems[i] = {
                        title: unescape(rssItems[i].getElementsByTagName("title").item(0).textContent),
                        text: rssItems[i].getElementsByTagName("description").item(0).textContent,
                        unreadStyle: News.unreadStory,
                        url: rssItems[i].getElementsByTagName("link").item(0).textContent
                    };
                
                // Strip HTML from text for summary and shorten to 100 characters
                listItems[i].summary = listItems[i].text.replace(/(<([^>]+)>)/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/http:\S+/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/#[a-z]+/ig,"{");
                listItems[i].summary = listItems[i].summary.replace(/(\{([^\}]+)\})/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/digg_url .../,"");
                listItems[i].summary = unescape(listItems[i].summary);
                listItems[i].summary = listItems[i].summary.substring(0,101);
                }
                break;
            
            case "RDF":    
                // Temp object to hold incoming XML object
                var rdfItems = transport.responseXML.getElementsByTagName("item");
                for (i=0; i<rdfItems.length; i++) {

                    listItems[i] = {
                        title: unescape(rdfItems[i].getElementsByTagName("title").item(0).textContent),
                        text: rdfItems[i].getElementsByTagName("description").item(0).textContent,
                        unreadStyle: News.unreadStory,
                        url: rdfItems[i].getElementsByTagName("link").item(0).textContent    
                    };
                
                // Strip HTML from text for summary and shorten to 100 characters
                listItems[i].summary = listItems[i].text.replace(/(<([^>]+)>)/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/http:\S+/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/#[a-z]+/ig,"{");
                listItems[i].summary = listItems[i].summary.replace(/(\{([^\}]+)\})/ig,"");
                listItems[i].summary = listItems[i].summary.replace(/digg_url .../,"");
                listItems[i].summary = unescape(listItems[i].summary);
                listItems[i].summary = listItems[i].summary.substring(0,101);
                }
                break;
        }
    
        // Update read items by comparing new stories with stories last
        // in the feed. For all old stories, use the old unreadStyle value,
        // otherwise set unreadStyle to News.unreadStory.
        // Count number of unread stories and store value.
        // Determine if any new stories when URLs don't match a previously
        // downloaded story.
        //
        var numUnRead = 0;  
        var newStoryCount = 0;    
        var newStory = true;                                                    
        for (i = 0; i < listItems.length; i++) {
            var unreadStyle = News.unreadStory;                        
            var j;                                                                    
            for (j=0; j<this.list[index].stories.length; j++ ) {
                if(listItems[i].url == this.list[index].stories[j].url) {
                    unreadStyle = this.list[index].stories[j].unreadStyle;
                    newStory = false;
                }            
            }
        
            if(unreadStyle == News.unreadStory) {
                numUnRead++;
            }
            
            if (newStory) {
                newStoryCount++;
            }
        
            listItems[i].unreadStyle = unreadStyle;
        }
    
        // Save updated feed in global feedlist
        this.list[index].stories = listItems;
        this.list[index].numUnRead  = numUnRead;
        this.list[index].newStoryCount = newStoryCount;
    
        // If new feed, the user may not have entered a name; if so, set the name to the feed title
        if (this.list[index].title === "")    {
            //    Will return multiple hits, but the first is the feed name
            var titleNodes = transport.responseXML.getElementsByTagName("title");
            this.list[index].title = titleNodes[0].textContent; 
        }    
        return News.errorNone;
    },
    
    // storeFeedDb() - writes contents of Feeds.list array to feed database depot
    storeFeedDb: function() {
        Mojo.Log.info("FeedList save started");
        this.db.add("feedList", this.list,
                function() {Mojo.Log.info("FeedList saved OK");}, 
                this.storeFeedDBFailure);
    },
    
    
    // storeFeedDbFailure(transaction, result) - handles save failure, usually an out
    //    of memory error
    storeFeedDbFailure: function(transaction,result) {
        Mojo.Log.warn("Database save error: ", result.message);
       /* if (result.message == News.dbOutOfMemoryError)   {
            // replace contents of text bodies with the summaries and try again
            for (var i = 0; i < this.list.length; i++) {
                var stories = this.list[i].stories                                                                    
                for (var j=0; j<stories.length; j++ ) {
                    stories[j].text = stories[j].summary;
                    }            
                }
            }
        }
        */
    },      
    
    // updateFeedList() - called to cycle through feeds. This is called
    //   once per update cycle.
    updateFeedList: function() {
        News.feedListUpdateInProgress = true;
    
        // request fresh copies of all stories
        this.currentFeed = this.list[this.feedIndex];
        this.updateFeedRequest(this.currentFeed);
    },

    // updatFeedRequest() - function called to setup and make a feed request
    updateFeedRequest: function(currentFeed) {
        Mojo.Log.info("URL Request: ", currentFeed.url);
    
        // Notify the chain that there is an update in progress
        Mojo.Controller.getAppController().sendToNotificationChain({type: "update", update: true, feedIndex: this.feedIndex});
    
        var request = new Ajax.Request(currentFeed.url, {
            method: "get",
            evalJSON: "false",
            onSuccess: this.updateFeedSuccess.bind(this),
            onFailure: this.updateFeedFailure.bind(this)
        });
    },

    // updateFeedFailure(transport) - Callback routine from a failed AJAX feed request;
    //   post a simple failure error message with the http status code.
    updateFeedFailure: function(transport) {
        // Prototype template to generate a string from the return status.
        var t = new Template($L("Status #{status} returned from newsfeed request."));
        var m = t.evaluate(transport);
    
        //    Post error alert and log error
        Mojo.Log.info("Invalid feed - http failure, check feed: ", m);
    
        // Notify the chain that this update is complete
        Mojo.Controller.getAppController().sendToNotificationChain({type: "update", update: false, feedIndex: this.feedIndex});
    },

    // updateFeedSuccess(transport) - Successful AJAX feed request (feedRequest);
    //   uses this.feedIndex and this.list
    updateFeedSuccess: function(transport) {

        var t = new Template($L({key: "newsfeed.status", value: "Status #{status} returned from newsfeed request."}));
        Mojo.Log.info("Feed Request Success: ", t.evaluate(transport));
    
        // Work around due to occasional XML errors
        if (transport.responseXML === null && transport.responseText !== null) {
                Mojo.Log.info("Request not in XML format - manually converting");
                transport.responseXML = new    DOMParser().parseFromString(transport.responseText, "text/xml");
         }
                    
        // Process the feed, identifying the current feed index and passing in the transport object holding the updated feed data
        var feedError = this.processFeed(transport, this.feedIndex);
    
        // If successful processFeed returns News.errorNone, otherwise there was a problem with the feed
        if (feedError == News.errorNone)    {
            var appController = Mojo.Controller.getAppController();
            var stageController = appController.getStageController(News.MainStageName);
            var dashboardStageController = appController.getStageProxy(News.DashboardStageName);
        
            // Post a notification if new stories and application is minimized
            if (this.list[this.feedIndex].newStoryCount > 0)   {
                Mojo.Log.info("New Stories: ", this.list[this.feedIndex].title," : ", this.list[this.feedIndex].newStoryCount, " New Items");
                if (!stageController.isActiveAndHasScenes() && News.notificationEnable)   {
                    var bannerParams = {
                        messageText: Mojo.Format.formatChoice(
                            this.list[this.feedIndex].newStoryCount, 
                            $L("0##{title} : No New Items|1##{title} : 1 New Item|1>##{title} : #{count} New Items"), 
                            {title: this.list[this.feedIndex].title, count: this.list[this.feedIndex].newStoryCount}
                        )
                    };
                
                    appController.showBanner(bannerParams, {action: "notification", index: this.feedIndex},
                        this.list[this.feedIndex].url);
                
                    // Create or update dashboard
                    var feedlist = this.list;
                    var selectedFeedIndex = this.feedIndex;

                    if(!dashboardStageController) {
                        Mojo.Log.info("New Dashboard Stage");
                        var pushDashboard = function(stageController){
                            stageController.pushScene("dashboard", feedlist, selectedFeedIndex);
                        };
                        appController.createStageWithCallback({name: News.DashboardStageName,
                            lightweight: true}, pushDashboard, "dashboard");
                    }
                    else {
                        Mojo.Log.info("Existing Dashboard Stage");
                        dashboardStageController.delegateToSceneAssistant("updateDashboard",
                            selectedFeedIndex);
                    }
                }
            }
        } else     {
        
            // There was a feed process error; unlikely, but could happen if the
            // feed was changed by the feed service. Log the error.
            if (feedError == News.invalidFeedError)    {
                Mojo.Log.info("Feed ", this.nameModel.value, " is not a supported feed type.");
            }
        }
    
        // Notify the chain that this update is done
        Mojo.Controller.getAppController().sendToNotificationChain({type: "update", update: false, feedIndex: this.feedIndex});
        News.feedListChanged = true;    
    
        // If NOT the last feed then update the feedsource and request next feed
        this.feedIndex++;
        if(this.feedIndex < this.list.length) {
            this.currentFeed = this.list[this.feedIndex];
        
            // Notify the chain that there is a new update in progress
            Mojo.Controller.getAppController().sendToNotificationChain({type: "update", update: true, feedIndex: this.feedIndex});
        
            // Request an update for the next feed
            this.updateFeedRequest(this.currentFeed);        
        } else {
        
            // Otherwise, this update is done. Reset index to 0 for next update
            this.feedIndex = 0;      
            News.feedListUpdateInProgress = false;
            
        }
    }
});
    