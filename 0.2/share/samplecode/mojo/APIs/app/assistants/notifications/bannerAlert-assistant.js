function BannerAlertAssistant() {
 }
    
BannerAlertAssistant.prototype.setup = function() {
	this.showBannerAlert = this.showBannerAlert.bind(this)
    Mojo.Event.listen(this.controller.get('show-banner-alert'),Mojo.Event.tap, this.showBannerAlert)
}
    
BannerAlertAssistant.prototype.showBannerAlert = function(){
	/* This will show the banner alert.  If this applications card is minimized when the banner alert 
	 * appears & you tap on the banner alert then the application will return to the foreground.  The
	 * application's app-assistant will receive our launch arguments (here it is the string 
	 * "launchArguments") in it's handleLaunch function.
	 * Wow this is working
	 */
    Mojo.Controller.getAppController().showBanner({messageText: "I'm a banner alert"}, "launchArguments",
												  "myCategory");
}
BannerAlertAssistant.prototype.cleanup = function(){
	Mojo.Event.stopListening(this.controller.get('show-banner-alert'),Mojo.Event.tap, this.showBannerAlert)
}
