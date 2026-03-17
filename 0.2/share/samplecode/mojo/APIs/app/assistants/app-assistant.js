/* This is an example of an app-assistant.  It's not a required assistant (unless you specify your app as a noWindow app).
 * We're only using it hear to demonstrate the notificationChain.
 */
function AppAssistant(appController) {
}

/* This function is used as part of the notificationChain scene demonstration - see notifications/notificationChain-assistant.js
 *
 * This is the last stop in the notification chain.
 */
AppAssistant.prototype.considerForNotification = function(notificationData) {
	//Show a banner notification containing the notification data that was sent in the notification chain.
	this.controller.showBanner(notificationData.message, {});
};