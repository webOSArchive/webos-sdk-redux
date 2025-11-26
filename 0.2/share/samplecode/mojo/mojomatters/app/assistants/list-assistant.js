function exampleCategory (modelItem) {
	return modelItem.category;
}

ListAssistant = Class.create( FLibExample, {
	setup: function() {
		var sceneName;
		
		// Bind event handlers ahead of time, and only once each
		this.handleListTap = this.handleListTap.bind(this);
		
		// Setup widgets
		//	For clarity's sake, I've defined the items for the list at the end of the page, and insterted them
		//	into the model here...
		//	Same thing with the filterFunction
		this.examplesModel.items = this.kExamples;
		this.examplesAttributes.filterFunction = this.filterExamples.bind(this);
		this.controller.setupWidget('examples', this.examplesAttributes, this.examplesModel);
		
		//	Listen
		// Start listening to events, remember to stop in cleanup
		this.controller.listen('examples', Mojo.Event.listTap, this.handleListTap);
	},

	cleanup: function() {
		this.controller.stopListening('examples', Mojo.Event.listTap, this.handleListTap);
	},
	
	examplesModel: {listTitle: $L('Examples')},
	examplesAttributes: {
		itemTemplate: 'list/example',
		dividerTemplate: 'list/divider',
		dividerFunction: exampleCategory,
		renderLimit: 80
	},
	
	convertSceneName: function(sceneId) {
		return sceneId.gsub("_", "-");
	},
	
	activate: function() {
		ListAssistant.setSavedSceneName("");
	},
	
	filterExamples: function(filterString, listWidget, offset, count) {
		var matching, lowerFilter;
		if (filterString) {
			lowerFilter = filterString.toLocaleLowerCase();
			function matchesName (example) {
				return example.title.toLocaleLowerCase().startsWith(lowerFilter);
			}
			matching = this.kExamples.findAll(matchesName)
		} else {
			matching = this.kExamples;
		}
		this.examplesModel.items = matching;			
		listWidget.mojo.setLength(matching.length);
		listWidget.mojo.setCount(matching.length);
		listWidget.mojo.noticeUpdatedItems(0, matching);
	},

	listElementSelector: 'div[id^="line_"]',

	handleListTap: function(listTapEvent) {
		var example = listTapEvent.item;
		var sceneName = this.convertSceneName(example.name);
		if(listTapEvent.originalEvent.down.shiftKey) {
			this.showSceneHandler = ListAssistant.showScene.bind(this, sceneName);
			Mojo.Controller.getAppController().createStageWithCallback({name: sceneName, lightweight: true}, this.showSceneHandler);
		} else {
			ListAssistant.showScene(sceneName, this.controller.stageController);
		}
		listTapEvent.stop();
	}
});

ListAssistant.kSceneCookieName = "sceneCookie";

ListAssistant.getSavedSceneName = function() {
	var sceneCookie = new Mojo.Model.Cookie(ListAssistant.kSceneCookieName);
	return sceneCookie.get();
};

ListAssistant.setSavedSceneName = function(sceneName) {
	var sceneCookie = new Mojo.Model.Cookie(ListAssistant.kSceneCookieName);
	sceneCookie.put(sceneName);
};

ListAssistant.showScene = function(sceneName, stageController) {
	if (sceneName === 'test') {
		Mojo.Test.pushTestScene(stageController);
	} else {
		Mojo.Log.info("****************************** ListAssistant pushing scene "+sceneName);
		stageController.pushScene({name: sceneName});						
	}
	ListAssistant.setSavedSceneName(sceneName);
}

ListAssistant.prototype.kExamples = 
[
	{
	"name": "button",
	"category": "Buttons and Selectors",
	"title": "Button",
	"description": "The time has come. To push the button."
	},
	{
	"name": "checkbox",
	"category": "Buttons and Selectors",
	"title": "CheckBox",
	"description": "Binary values with rounded corners"
	},
	{
	"name": "listselector",
	"category": "Buttons and Selectors",
	"title": "List selector",
	"description": "A widget for editing a multiple-choice object property."
	},
	{
	"name": "radiobutton",
	"category": "Buttons and Selectors",
	"title": "Radio Button",
	"description": "The opposite of whack-a-mole"
	},
	{
	"name": "slider",
	"category": "Buttons and Selectors",
	"title": "Slider",
	"description": "Adjustable values have never been so much fun"
	},
	{
	"name": "togglebutton",
	"category": "Buttons and Selectors",
	"title": "Toggle Button",
	"description": "Button with 2 state: true or false"
	},




	{
	"name": "photoanimation",
	"category": "Core",
	"title": "Animated images",
	"description": "The 'wobbly dog'."
	},
	{
	"name": "cross_app",
	"category": "Core",
	"title": "Cross Application Push",
	"description": "Use scenes from other apps in yours, and get results back!"
	},
	{
	"name": "eventwatcher",
	"category": "Core",
	"title": "Event Watcher",
	"description": "A simple event logging scene"
	},
	{
	"name": "gesture",
	"category": "Core",
	"title": "Gesture",
	"description": "Catching and processing multifinger gestures"
	},
	{
	"name": "highlight",
	"category": "Core",
	"title": "Highlight Modes",
	"description": "An example of the various highlight modes."
	},
	{
	"name": "imageview",
	"category": "Core",
	"title": "ImageView Example",
	"description": "Show me your best cake!"
	},
	{
	"name": "nestedscroller",
	"category": "Core",
	"title": "Nested Scrollers Example",
	"description": "A vertical scroller that's scrolled horizontally, beyond its controll. Similar to calendar week and day views."
	},
	{
	"name": "orientation",
	"category": "Core",
	"title": "Orientation",
	"description": "Look at the world from another angle"
	},
	{
	"name": "sceneevents",
	"category": "Core",
	"title": "Keystroke Events",
	"description": "Mojo helps you manage when you get events so you don't have to"
	},
	{
	"name": "scenestacking",
	"category": "Core",
	"title": "Scene stacking",
	"description": "Stacking scenes multiple times, and popping them."
	},
	{
	"name": "scrolling",
	"category": "Core",
	"title": "Scrolling",
	"description": "Scrolling every which way."
	},
	{
	"name": "service-error",
	"category": "Core",
	"title": "Service error handling",
	"description": "When services go wild."
	},
	{
	"name": "locale",
	"category": "Core",
	"title": "Setting Locale",
	"description": "An example of how to set the locale."
	},
	{
	"name": "touch",
	"category": "Core",
	"title": "Touch",
	"description": "Touch event playground."
	},




	{
	"name": "dialogs",
	"category": "Dialogs and Containers",
	"title": "Dialog & pop up alert demo",
	"description": "How a scene assistant can display simple modal dialogs and pop up alerts."
	},
	{
	"name": "drawer",
	"category": "Dialogs and Containers",
	"title": "Drawers",
	"description": "One third of a second it's there, and another third of a second it's gone!"
	},
	{
	"name": "notify",
	"category": "Dialogs and Containers",
	"title": "Notifications",
	"description": "How to use the dashboard and notifications"
	},
	{
	"name": "popupmenu",
	"category": "Dialogs and Containers",
	"title": "Popup menu demo",
	"description": "How to create dynamic popup menus."
	},



	{
	"name": "progress",
	"category": "Indicators",
	"title": "Inline Progress Bar",
	"description": "An inline widget for showing progress of an event."
	},
	{
	"name": "progressbar",
	"category": "Indicators",
	"title": "Progress Bar",
	"description": "A widget for showing progress of an event in a full screen view"
	},
	{
	"name": "progresspill",
	"category": "Indicators",
	"title": "Progress Pill",
	"description": "A widget for showing progress of an event like a download"
	},
	{
	"name": "progressslider",
	"category": "Indicators",
	"title": "Progress Slider",
	"description": "A shortcut widget that produces a slider ontop of a progress bar."
	},
	{
	"name": "spinner",
	"category": "Indicators",
	"title": "Spinner",
	"description": "Spinner: He just keeps spinnin' around..."
	},




	{
	"name": "formatterdemo",
	"category": "Lists",
	"title": "Data formatters",
	"description": "Formatting data from a model when displaying in a list."
	},
	{
	"name": "editablelist",
	"category": "Lists",
	"title": "Editable list",
	"description": "A list of editable items."
	},
	{
	"name": "filterlist",
	"category": "Lists",
	"title": "FilterList",
	"description": "Typedown in lists is easy peasy"
	},
	{
	"name": "lazylist",
	"category": "Lists",
	"title": "Lazy list",
	"description": "The List widget configured to load items lazily, as they need to be displayed."
	},
	{
	"name": "recursivelist",
	"category": "Lists",
	"title": "Recursive list",
	"description": "A list of lists, how novel."
	},
	{
	"name": "subwidgets",
	"category": "Lists",
	"title": "Widgets in a list",
	"description": "List items containing multiple mojo widgets."
	},
	{
	"name": "lazylistlazywidgets",
	"category": "Lists",
	"title": "Lazy list with Lazy Widgets",
	"description": "A lazily loaded list containing mojo widgets."
	},
	{
	"name": "dividerlist",
	"category": "Lists",
	"title": "Dividers",
	"description": "Definable section dividers inside a list."
	},
	{
	"name": "persistentlist",
	"category": "Lists",
	"title": "Persistent List",
	"description": "A list of items stored in a HTML5 db through Mojo depot."
	},
	{
	"name": "imageviewcrop",
	"category": "Media Objects",
	"title": "Image Cropper",
	"description": "Sometimes you don't want to see the big picture. Trust me."
	},
	{
	"name": "menudemo",
	"category": "Menus",
	"title": "Menus",
	"description": "Examples of working with scene menus and the mighty app menu."
	},
	{
	"name": "datetime",
	"category": "Pickers",
	"title": "Date & Time Pickers",
	"description": "Pick a time, date and a number! The best!"
	},
	{
	"name": "filepicker",
	"category": "Pickers",
	"title": "File picker",
	"description": "WebOS has a sweet File picking system that you can configure to suit your needs"
	},
	{
	"name": "filterfield",
	"category": "Text Fields",
	"title": "FilterField",
	"description": "An open ended aproach to drilldown, this can be used to filter anything, not just lists"
	},
	{
	"name": "passwordfield",
	"category": "Text Fields",
	"title": "PasswordField",
	"description": "PasswordField, an obfuscated widgeted TextField"
	},
	{
	"name": "richtext",
	"category": "Text Fields",
	"title": "Rich Text Field",
	"description": "Rich text field with integrated menu items."
	},
	{
	"name": "webview",
	"category": "Viewers",
	"title": "Web View",
	"description": "An example of how to embed a web view"
	},
];
