/*globals enyo */

enyo.kind({
	name: "ConversationItem",
	kind: "enyo.SwipeableItem",
	confirmCaption: $L("Delete"),
	layoutKind: "enyo.HFlexLayout",
	align: "start",
	published: {
		message: ""
	},
	events: {
		onError: ""
	},
	components: [
		{name: "imageContainer", className:"conversationContactImage", components: [
			{className: "contact-image-border"},
			{name: "contactImage", kind: "Image", className: "contact-image"}
		]},
		{name: "messageContainer", flex: 1, components:[
			{name: "message", components:[
				{name: "messageText", allowHtml:true},
				{layoutKind: "HLayout", components:[
					{name: "messageTime", className: "message-time"},
					{name: "errorIcon", kind: "Image", src: "images/header-warning-icon.png", className:"erroricon", onclick: "showError"}
				]}	,
					{name: "invitationButtons", layoutKind: "HLayout", className:"accept-decline-box", components: [
						{name: "declineButton", kind: "IconButton", className: "enyo-button-negative", icon: "images/icon-decline.png", onclick: "declinedBuddy"},
						{name: "acceptButton", kind: "IconButton", className: "enyo-button-affirmative", icon: "images/icon-accept.png", onclick: "acceptedBuddy"}
					]}
			]}
		]}, 
		{name: "inviteService", kind: "InviteResponseService"}
	],
	create: function() {
		this.inherited(arguments);
		this.messageChanged();
		this.addClass("chat-balloon");
	},
	messageChanged: function() {
		this.updateMessageText(this.message, this.message.folder !== enyo.messaging.message.FOLDERS.OUTBOX && this.message.folder !== enyo.messaging.message.FOLDERS.INBOX);
		this.updateContactImage(this.message.personImage);
		this.updateSentReceived(this.message.folder);
		this.updateTime(this.message.localTimestamp);
		this.updateMessageStatus(this.message.status, this.message.errorCategory);
		this.updateInvite(this.message);
		this.updatePriority(this.message);
	},
	updatePriority: function(message){
		// 0 = normal priority
		// 1 = interactive
		// 2 = urgent
		// 3 = emergency
		// 4 = low priority
		if (message.priority && (message.priority === 2 || message.priority === 3)) {
			this.$.message.addClass("high-priority");
		}
	},
	updateMessageStatus: function(inStatus, errorCategory){
		if (inStatus !== "successful") {
			this.$.message.setClassName("enyo-item chat-balloon-error");
		} 
		if(errorCategory && (inStatus === enyo.messaging.message.MESSAGE_STATUS.FAILED || inStatus === enyo.messaging.message.MESSAGE_STATUS.UNDELIVERABLE)){
			this.$.errorIcon.canGenerate = true;
			this.$.errorIcon.show();
		}
		else{
			this.$.errorIcon.canGenerate = false;
		}
	},
	updateMessageText: function(inMessage, skipTextIndexer) {
		var inText = inMessage.messageText || "";
		if (enyo.messaging.message.isMMSMessage(inMessage)) {
			inText = enyo.messaging.message.getMMSDisplayMessage();
		} else if (inMessage.folder === enyo.messaging.message.FOLDERS.INBOX) {
			inText = inText.replace(/\r|\n|\\r|\\n/g, "<br>");
		} else if (inMessage.folder === enyo.messaging.message.FOLDERS.OUTBOX) {
			// outgoing message needs to be sanitized since the incoming ones 
			// are already sanitized before they are written into database.
			inText = enyo.string.escapeHtml(inText);
		}
		
		if (!skipTextIndexer) {
			inText = enyo.string.runTextIndexer(inText);
		}
		this.$.messageText.setContent(inText);
	},
	updateContactImage: function(personImage) {
		this.$.contactImage.setAttribute("src", personImage);
	},
	updateTime: function(localTimestamp) {
		this.$.messageTime.setContent(this.formatTime(new Date(localTimestamp)));
	},
	formatTime: function(date){
		if (!date) {
			return "";
		}
		
		
		return Utils.formatShortTime(date);
	},
	updateSentReceived: function(inFolder) {
		if (inFolder === enyo.messaging.message.FOLDERS.INBOX) {
			this.$.message.setClassName("enyo-item chat-balloon-received");
			this.$.imageContainer.canGenerate = true; 
			this.$.imageContainer.show();
		} else if(inFolder === enyo.messaging.message.FOLDERS.OUTBOX){
			this.$.message.setClassName("enyo-item chat-balloon-sent");
			this.$.imageContainer.canGenerate = false; 
		} else {
			this.$.message.setClassName("enyo-item chat-balloon-system");
			this.$.imageContainer.canGenerate = false; 
		}
	},
	updateInvite: function(message) {
		var showInvite = this.message._kind === "com.palm.iminvitation:1" && this.message.accepted === "pending";
		
		// update invite buttons
		this.updateInviteButtons(showInvite);	
		// update style
		if (showInvite) {
			this.$.message.setClassName("enyo-item chat-balloon-error");
			this.$.imageContainer.canGenerate = false; 
		}
	},
	updateInviteButtons: function(show) {
		this.$.invitationButtons.canGenerate = show;
		this.$.invitationButtons.setShowing (show);
	},
	showError: function(inSender, inEvent){
		this.doError(this.message);			
		return true;
	},
	acceptedBuddy: function(inSender, inEvent) {
		this.setResponseInvitation(true);
		return true;
	},
	declinedBuddy: function(inSender, inEvent) {
		this.setResponseInvitation(false);
		return true;
	},
	setResponseInvitation: function(accepted) {
		this.$.inviteService.responseToInvite(this.message, accepted);
	}
});