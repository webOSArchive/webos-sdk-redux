/*globals enyo */

enyo.kind({
	name: "ThreadItem",
	kind: "SwipeableItem",
	confirmCaption: $L("Delete"),
	layoutKind: "HFlexLayout",
	components: [
		{components: [
			{className: "contact-image-border"},
			{name: "contactImage", kind: "Image", className: "contact-image"}
		]},
		{kind: "VFlexBox", className: "status-box", pack: "justify", align: "center", components: [
			{name: "status", className: "status"},
			{name: "outgoing", className: "sent-received"}
		]},
		{kind: "VFlexBox", className: "message-summary", flex: 1, components: [
			{layoutKind: "HFlexLayout", align: "center", className:"contact-name-box", components: [
				{name: "displayName", className: "contact-name"},
				{name: "unreadCount", className: "unread-count", showing: false}
			]},
			{name: "summary", className: "message-preview", allowHtml:true}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.addClass("contactItem"); 
	},
	updateStatus: function(inStatus) {
		this.$.status.setClassName(this.getStatusClassName(inStatus));
	},
	updateUnreadCount: function(inThread){
		var inUnreadCount = inThread.unreadCount;
		var hasUnread = !this.isThreadSelected(inThread) && Number(inUnreadCount) > 0;
		this.$.unreadCount.setContent(inUnreadCount || 0);
		this.$.unreadCount.setShowing(hasUnread);
		this.$.displayName.setClassName("contact-name" + (hasUnread ? " contact-name-unread" : ""));
	},
	updateContactImage: function(inPerson) {
		this.$.contactImage.setAttribute("src", enyo.messaging.person.getDisplayImage(inPerson));
	},
	updateOutgoing: function(inFlags) {
		this.$.outgoing.setClassName("sent-received " + (Boolean(inFlags && inFlags.outgoing) ? "message-outgoing" : ""));
	},
	setThread: function(inThread) {
		this.updateStatus(inThread.status);
		this.updateContactImage(inThread.person);
		this.updateUnreadCount(inThread);
		this.updateOutgoing(inThread.flags);

		if (inThread.person) {
			var displayName = enyo.messaging.person.getDisplayName(inThread.person);
			this.$.displayName.setContent(displayName);
		}
		else {
			this.$.displayName.setContent(inThread.displayName ? inThread.displayName : inThread.replyAddress);
		}
		
		var summary = this.getThreadSummary(inThread);
		this.$.summary.setContent(summary);
	}, 
	/***********************************
	 * Functions below are unit tested *
	 ***********************************/
	getStatusClassName: function(inStatus) {
		var status = inStatus && (inStatus.offline ? "offline" : enyo.messaging.im.availabilityClasses[inStatus.availability]);
		var statusClass = !status ? "" : " status-" + status;
		return "status" + statusClass;
	},
	getThreadSummary: function(inThread){
		var summary;
		if (enyo.messaging.message.isMMSThread(inThread)) {
			summary = enyo.messaging.message.getMMSThreadSummary();
		} else if(inThread.summary){
			if (inThread.flags && inThread.flags.outgoing) {
				// only outgoing messages needs to be escaped since it is not
				// sanitized.
				summary = enyo.string.escapeHtml(inThread.summary);
			} else {
				summary = inThread.summary;
			}
		}
		else {
			summary = "";
		}
		return summary;
	},
	isThreadSelected: function(inThread) {
		return (enyo.application.selectedThread && inThread._id === enyo.application.selectedThread._id && enyo.application.messageDashboardManager.getAppDeactivated() === false);
	}
});