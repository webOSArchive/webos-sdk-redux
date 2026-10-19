FLibExample = Class.create({
	initialize: function(){
		Mojo.Log.info('Assistant is ready to build menus');
	},
	setupMenus: function(params){
		
		if(params === undefined) {
			Mojo.Info.log("Why call setupMenus() but not tell it to setup any menus?");
			return false;
		}
		
		
		if(params.header){
			if(params.viewMenu === undefined)
				params.viewMenu = {};
			
			if(params.viewMenu.items === undefined)
				params.viewMenu.items = [];
				
			params.viewMenu.items.unshift({label: $L(params.header)});	
		}
		
		if(params.viewMenu && params.viewMenu.items)
			this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: params.viewMenu.items});
			
		if(params.commandMenu && params.commandMenu.items)
			this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, {items: params.commandMenu.items});
			
		Mojo.Log.info('******* We have menus!');
	}
});

function AppAssistant(appController) {
	this.mainstageController;
}
		
AppAssistant.prototype.handleLaunch = function(params) {

	if(params && this.mainstageController){
		Mojo.Log.info("Framework library relaunch with arguments: ");
		this.launchWithParams(params, this.mainstageController);
	}else if(this.mainstageController){
		Mojo.Log.info("Framework library relaunch without arguments: ");
		this.mainstageController.activate();
	}
};

AppAssistant.prototype.openWindowWithList = function() {
	var f = function(stageController) {
		var sceneCookie, sceneName;
		stageController.pushScene('list');
		sceneName = ListAssistant.getSavedSceneName();
		if (sceneName) {
			ListAssistant.showScene(sceneName, stageController);
		}
	};
	this.controller.createStageWithCallback({name: 'list-stage', lightweight: true}, f);
};

AppAssistant.prototype.goToNotifyScene = function() {
	var stageController = Mojo.Controller.stageController;
	stageController.popScenesTo();
	stageController.pushScene('list');
	stageController.pushScene('notify');
	window.focus();	
};

AppAssistant.prototype.considerForNotification = function(notificationData) {
	var c;
	if (notificationData) {
		var template = new Template( $L("red: #{red}, green: #{green}, blue: #{blue}") );
		var values = [];
		["red", "green", "blue"].each(function(color) {
			c = notificationData[color];
			if (c) {
				values.push(color + ": " + c);
			}
		});
		var message = template.evaluate(values);
		this.controller.showBanner(values.join(", "), {});
		var dashboard = this.controller.getStageController("color-dashboard");
		if (dashboard) {
			dashboard.delegateToSceneAssistant("update");
		} else {
			var f = function(stageController) {
				stageController.pushScene('color-dashboard', gColorCounts);
			};
			this.controller.createStageWithCallback("color-dashboard", f, 'dashboard');
		}
	}
};

AppAssistant.prototype.cleanup = function() {
	if(this.considerForNotification) {
		Mojo.log("app cleanup works!");
	} else {
		Mojo.log("meh. unbound.");
	}
};

// 
// AppAssistant.prototype.handleSuspendRequest = function(ack, nack) {
// 	if(this.considerForNotification) {
// 		Mojo.Log.error("handle suspend works!");
// 		ack(); 
// 	} else {
// 		Mojo.Log.error("meh. unbound suspend request.");
// 	}
// };
// 
// AppAssistant.prototype.handleShutdown = function() {
// 	if(this.considerForNotification) {
// 		Mojo.Log.error("handle shutdown works!");
// 	} else {
// 		Mojo.Log.error("meh. unbound handle shutdown.");
// 	}
// };
// 
// AppAssistant.prototype.handleResume = function() {
// 	if(this.considerForNotification) {
// 		Mojo.Log.error("handle resume works!");
// 	} else {
// 		Mojo.Log.error("meh. unbound handle resume.");
// 	}
// };
// 
// AppAssistant.prototype.prepareForSuspend = function(onComplete) {
// 	if(this.considerForNotification) {
// 		Mojo.Log.error("prepare suspend works!");
// 		onComplete();
// 	} else {
// 		Mojo.Log.error("meh. unbound prep for suspend.");
// 	}
// };

AppAssistant.prototype.launchWithParams = function(params, stageController) {
	stageController.popScenesTo('list');
	ListAssistant.showScene(params.launchToScene, stageController);
	stageController.activate();
};
