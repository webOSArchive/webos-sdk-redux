/*  StoryWebAssistant - NEWS
    
    Passed a URL and displays the corresponding story or link in a webview,
    handling any link selections within the view. User swipes back to
    return to the calling view.
    Major components:
    - StoryView; display story in main scene
    - Next/Previous; command menu options to go to next or previous story
    - Web; command menu option to display original story in browser
    - Share; command menu option to share story by messaging or email
	
	Arguments:
    - storyURL; unescaped form of URL
*/

function StoryWebAssistant(storyURL) {
  //  Save the passed URL for inclusion in the webView properties
  this.storyURL = storyURL;
  this.appController = Mojo.Controller.getAppController();
  this.stageController = this.appController.getStageController(News.MainStageName);
}

StoryWebAssistant.prototype.setup = function() {
  //  Setup for the webView
	Mojo.Log.info("StoryWeb Setup Called; this.storyURL = ", this.storyURL);
	
	this.controller.setupWidget("storyWeb",
		{
			url: this.storyURL,
			minFontSize:18,
			virtualpagewidth: this.controller.window.innerWidth,
			virtualpageheight: 32 
		},
		this.storyViewModel = {
			
		});
		
	//	Setup handlers for links selected and load failure.
	this.controller.listen("storyWeb", Mojo.Event.webViewLinkClicked,
	    this.linkClicked.bindAsEventListener(this));

	//  Setup App Menu
    this.controller.setupWidget(Mojo.Menu.appMenu, News.MenuAttr, News.MenuModel);

	//	Setup spinner for page loading using a spinner and command menu
	
	this.reloadModel = {
			label: $L("Reload"),
			icon: "refresh",
			command: "refresh"
	        };
			
	this.stopModel = {
			label: $L("Stop"),
			icon: "load-progress",
			command: "stop"
            };

	this.cmdMenuModel = {
			visible: true,
			items: [{}, this.reloadModel]
            };
			
	Mojo.Event.listen(this.controller.get("storyWeb"),Mojo.Event.webViewLoadProgress,
	    this.loadProgress.bind(this));
	Mojo.Event.listen(this.controller.get("storyWeb"),Mojo.Event.webViewLoadStarted,
	    this.loadStarted.bind(this));
	Mojo.Event.listen(this.controller.get("storyWeb"),Mojo.Event.webViewLoadStopped,
	    this.loadStopped.bind(this));
	Mojo.Event.listen(this.controller.get("storyWeb"),Mojo.Event.webViewLoadFailed,
	    this.loadStopped.bind(this));

	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass:"no-fade"}, this.cmdMenuModel);

};


//  Handle reload or stop load commands
StoryWebAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch (event.command) {		
			case "refresh":
				this.controller.get("storyWeb").mojo.reloadPage();
				break;
			case "stop":
				this.controller.get("storyWeb").mojo.stopLoad();
				break;
		}
	}
};

//	linkClicked - handler for selected links, requesting new links to be opened in same view
StoryWebAssistant.prototype.linkClicked = function(event) {
	Mojo.Log.info("Story Web linkClicked; event.url = ", event.url);
	var wb = this.controller.get("storyWeb");
	wb.mojo.openURL(event.url);
};

//  loadStarted - start spinner and setup stop menu
StoryWebAssistant.prototype.loadStarted = function(event) {
	Mojo.Log.info("Story Web loadStarted");
	this.cmdMenuModel.items.pop(this.reloadModel);
	this.cmdMenuModel.items.push(this.stopModel);
	this.controller.modelChanged(this.cmdMenuModel);
	
	this.currLoadProgressImage = 0;
};

StoryWebAssistant.prototype.loadStopped = function(event) {
	Mojo.Log.info("Story Web loadStopped");
	this.cmdMenuModel.items.pop(this.stopModel);
	this.cmdMenuModel.items.push(this.reloadModel);
	this.controller.modelChanged(this.cmdMenuModel);
};

StoryWebAssistant.prototype.loadProgress = function(event) {

	var percent = event.progress;
	Mojo.Log.info("Story Web loadProgress; ", percent,"%");
	try {
		if (percent > 100) {
			percent = 100;
		}
		else if (percent < 0) {
			percent = 0;
		}
		
		// Update the percentage complete
		this.currLoadProgressPercentage = percent;
		
		// Convert the percentage complete to an image number
		// Image must be from 0 to 23 (24 images available)
		var image = Math.round(percent / 4.1);
		if (image > 23) {
			image = 23;
		}
		
		// Ignore this update if the percentage is lower than where we're showing
		if (image < this.currLoadProgressImage) {
			return;
		}
		
		// Has the progress changed?
		if (this.currLoadProgressImage != image) {
			// Cancel the existing animator if there is one
			if (this.loadProgressAnimator) {
				this.loadProgressAnimator.cancel();
				delete this.loadProgressAnimator;
			}
			// Animate from the current value to the new value
			var icon = this.controller.select("div.load-progress")[0];
			if (icon) {
				this.loadProgressAnimator = Mojo.Animation.animateValue(Mojo.Animation.queueForElement(icon),
				  "linear", this._updateLoadProgress.bind(this), {
					  from: this.currLoadProgressImage,
					  to: image,
					  duration: 0.5
				});
			}
		}
	} 
	catch (e) {
		Mojo.Log.logException(e, e.description);
	}
};

StoryWebAssistant.prototype._updateLoadProgress = function(image) {
	// Find the progress image
	image = Math.round(image);
	// Don't do anything if the progress is already displayed
	if (this.currLoadProgressImage == image) {
		return;
	}
	var icon = this.controller.select("div.load-progress");
	if (icon && icon[0]) {
		icon[0].setStyle({"background-position": "0px -" + (image * 48) + "px"});
	}
	this.currLoadProgressImage = image;
};

