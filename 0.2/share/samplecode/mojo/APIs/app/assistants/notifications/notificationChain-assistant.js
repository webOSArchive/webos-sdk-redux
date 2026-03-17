function NotificationChainAssistant() {
	this.notificationAreaInfo = "There are 3 situations to try.  Press the notification button and then see what happens "
	+ "when the notification arrives while a) this scene is the active scene b) this scene is not the active scene, but " 
	+ "the app is in the foreground c) this app is no longer in the foreground."
}
    
NotificationChainAssistant.prototype.setup = function() {
	this.buttonHandler = this.handleSendNotificationButton.bind(this) //save this for use in stopListening when we cleanup
    Mojo.Event.listen(this.controller.get('send-notification'),Mojo.Event.tap, this.buttonHandler)
	this.controller.get('notification-area').innerText = (this.notificationAreaInfo); //set the message
}

//this is an intermediary function - we should just move the setTimeout to the sendNotification function
NotificationChainAssistant.prototype.handleSendNotificationButton = function() {
	setTimeout(this.sendNotification.bind(this), 5000);
}

NotificationChainAssistant.prototype.sendNotification = function(){
    var myParams = {
        message: 'I\'m a notification message'
    }
	
    Mojo.Controller.getAppController().sendToNotificationChain(myParams);
}

/* If sendNotification is called while this scene isn't the currently displayed scene then this
 * function won't be called and the notification chain will attempt to call the stage assistant's 
 * considerForNotification function next.
 */
NotificationChainAssistant.prototype.considerForNotification = function(notificationData) {
	if (notificationData) {
		this.controller.get('notification-area').innerText = ("The notification was caught by this scene assistant.")
	}
	
	/* We're not returning any notification data here which will stop the notification chain here.  To allow
	 * the notification chain to continue, uncomment the below return statement and the stage assistant will
	 * then have it's considerForNotification function called. 
	 */	
	//return notificationData;
};

FormattingAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Event.stopListening(this.controller.get('send-notification'),Mojo.Event.tap,this.buttonHandler);
}

FormattingAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('send-notification'),Mojo.Event.tap,this.buttonHandler);
}