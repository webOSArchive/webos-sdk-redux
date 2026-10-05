enyo.kind({
	name: "AccountLoginState",
	kind: "enyo.Control",
	layoutKind: "VFlexLayout",
	className: "account-login-state",
	published: {
		loginState: {}
	},
	events: {
		onAvailabilitySet: "",
		onInputCustomMessage: "",
		onDrawerOpened: ""
	},
	components: [
		{name: "account", onclick: "toggleDrawer", style: "min-height: 30px; margin-top:8px; width:320px;", components:[
			{name: "header", layoutKind: "HFlexLayout", components: [
				{name: "status", className: "status status-buddy", style: "margin-left:6px;margin-right:10px;margin-top:3px;"},
				{name: "accountText", layoutKind: "HFlexLayout", style: "width:265px;", components: [
					{name: "accountName", style: "margin-right:5px;vertical-align:middle;font-size:16px;" }, 
					{name: "username", flex: 1, style: "overflow: hidden; font-size: 14px;margin-top:2px;color:grey", className: "enyo-text-ellipsis"}
				]},
				{name: "arrow", className: "enyo-menuitem-arrow"}
			]},
			{name: "footer", layoutKind: "HFlexLayout", components: [
				{className: ""},  // TODO: should set the right class name so that custom message lines up with account name
				{name: "customMessage", className:"enyo-text-ellipsis", style: "width:100%;overflow: hidden; font-size: 14px; color:#333; margin-left: 32px;margin-right:14px;margin-top: 3px;padding-bottom: 8px;"}
			]}
		]},
		{kind: "Drawer", open: false, components: [
			{name: "statuses", kind: "AccountStatuses", onAvailabilityChanged: "availabilityChanged", onInputCustomMessage: "inputCustomMessage"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.accountName.setContent(this.loginState.accountTypeName);
		this.$.username.setContent(this.loginState.username);
		this.loginStateChanged();
		
		this.createComponent({name: "db", kind: "AccountLoginStateDB", accountId: this.loginState._id});
	},
	loginStateChanged: function() {
		var availability = enyo.messaging.imLoginState.getAvailability(this.loginState);
		this.$.statuses.setAvailability([availability]);
		this.$.statuses.setInvisibilitySupported(this.loginState.supportsInvisibleStatus);
		if (availability <= enyo.messaging.im.availability.BUSY) {
			this.$.customMessage.setContent(this.loginState.customMessage);
		} else {
			this.$.customMessage.setContent("");
		}
		this.updateStatusClass();
	},
	availabilityChanged: function(inSender) {
		this.loginState.availability = inSender.availability;
		this.doAvailabilitySet(this.$.db, this.loginState);
	},
	inputCustomMessage: function(inSender) {
		this.doInputCustomMessage(this.$.db, this.loginState);
	},
	toggleDrawer: function() {
		this.showDrawer = !this.showDrawer;
		this.$.drawer.setOpen(this.showDrawer);
		
		if (this.showDrawer) {
			this.doDrawerOpened();
			this.$.arrow.setClassName("enyo-menuitem-arrow enyo-button-down");
			this.$.account.applyStyle("border-bottom", "1px solid rgba(0,0,0,0.2);");
		} else {
			this.$.arrow.setClassName("enyo-menuitem-arrow");
			this.$.account.applyStyle("border-bottom", "none");
		}
	},
	closeDrawer: function() {
		if (this.showDrawer) {
			this.toggleDrawer();
		}
	},
	updateStatusClass: function() {
		if (this.statusClass) {
		    this.$.status.removeClass(this.statusClass);
		}
		this.statusClass = "status-" + enyo.messaging.im.buddyAvailabilities[enyo.messaging.imLoginState.getAvailability(this.loginState)];
		this.$.status.addClass(this.statusClass);
	}
});

AccountLoginState.COMPONENT_NAME_PREFIX = "loginState-";