/*  Help - NEWS
        
    Copyright 2009 Palm, Inc.  All rights reserved.
    
    Help scene, which uses a list to display help topics.
    
    Major components:
    - News.helpTopics; in models/help.js, list of help topics
    - Help Assistant; sets up help list with News.helpTopics
        and use drawer to display individual help topics
    
    App menu is disabled in this scene.

*/

function HelpAssistant() {

}

HelpAssistant.prototype.setup =  function() {                
    // Setup story list with standard news list templates.
    this.controller.setupWidget("helpListWgt", 
        {
            itemTemplate: "help/help-row-template",
            listTemplate: "help/help-list-template",
            swipeToDelete: false, 
            renderLimit: 40,
            reorderable: false
        },    
        this.helpModel = {
            items: News.helpTopics
        }
    );
    
    this.openHelpTopicHandler = this.openHelpTopic.bindAsEventListener(this);
    this.controller.listen("helpListWgt", Mojo.Event.listTap,
        this.openHelpTopicHandler);
    
    this.controller.setupWidget("helpDrawer", {modelProperty: "open"});
};

HelpAssistant.prototype.activate =  function() {
    this.controller.modelChanged(this.helpModel);                    
};

HelpAssistant.prototype.cleanup =  function() {
    this.controller.stopListening("helpListWgt", Mojo.Event.listTap,
        this.openHelpTopicHandler);
};

// openHelpTopic - handler when user taps on displayed help item
//
HelpAssistant.prototype.openHelpTopic = function(event) {
    Mojo.Log.info("Display selected help item = ", event.item.title,
        "; Help index = ", event.index);
    
    if (this.helpModel.items[event.index].open === true)   {
        this.helpModel.items[event.index].open = false;
    } else {
        this.helpModel.items[event.index].open = true;
    }
    
    this.controller.modelChanged(this.helpModel.items[event.index], this);
};