/*globals enyo */

enyo.kind({
	name: "PreferencesView",
	className: "enyo-bg",
	kind: "VFlexBox",
	published: {
		accounts: null
	},
	events: {
		onClosePreferences: ""
	},
	components: [
		{kind: "Pane", flex:1, components: [
		{name: "prefsAndAccounts", kind: "VFlexBox", components: [
			{kind: "Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", src: "images/messaging-48x48.png"},
				{kind: "Control", content: $L("Preferences & Accounts")}
			]},
			{className:"accounts-header-shadow"},
			
			{kind: "Scroller",flex:1, components:[
				{kind:"Control", className:"box-center", components: [
					{kind: "RowGroup", caption: $L("New Message"), className:"accounts-group", components: [
						{layoutKind: "enyo.HFlexLayout", align: "center", tapHighlight: false, components: [
							{content: $L("Show Notifications"), flex: 1},
							{kind: "ToggleButton", onChange: "showNotificationChange"}
						]},
						{kind: "ListSelector", label: $L("ALERT"), onChange: "notificationTypeChange", items: [
							{caption: $L("Vibrate"), value:"vibrate"},
							{caption: $L("System Sound"), value: "system"},
							{caption: $L("Ringtone"), value: "ringtone"},
							{caption: $L("Mute"), value: "mute"}
						]},
						{tapHighlight:true, kind: "HFlexBox", onclick:"showRingtonePicker", components: [
							{name:"ringtoneName", content: $L("Tap to pick a ringtone"), flex: 1},
							{content: $L("ringtone"), style: "color: rgb(31, 117, 191);text-transform: uppercase; "}
						]}
					]},
					{name: "accountgroup", kind: "RowGroup", caption: $L("Accounts"), className:"accounts-group", components: [
						{kind: "Accounts.accountsList", name: "accountsList", onAccountsList_AccountSelected: "editAccount"}
					]},
					{kind: "Button", caption: AccountsUtil.BUTTON_ADD_ACCOUNT, onclick: "AddAccount", className:"accounts-btn"}/*,
					{kind: "ConnectPhone", onComplete: "exitAccountPrefs"}*/
				]}
			]},
			{className:"accounts-footer-shadow"},
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{kind: "Button", caption: $L("Done"), className:"enyo-button-dark accounts-toolbar-btn", onclick: "exitAccountPrefs"}
			]}
		]},

		{kind: "AccountsUI", name: "accountsView", capability: "MESSAGING", onAccountsUI_Done: "accountsDone"},
		{kind: "AccountsModify", name: "accountsModify", capability: "MESSAGING", onAccountsModify_Done: "accountsDone"}
		]},
		{name: "ringtonepicker", kind: "FilePicker", fileType: ["ringtone"], onPickFile: "ringtoneChosen"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.rowGroup.hide();
		//this.$.connectPhone.subscriptToTelephony();
	},
	rendered: function(){
		this.$.accountsList.getAccountsList(this.capability, "com.palm.palmprofile");
		if (enyo.application.prefsHandler) {
			enyo.application.prefsHandler.register(this, this.prefsUpdated.bind(this));
		}
	},
	exitAccountPrefs: function(){
		this.doClosePreferences();
	},
//account stuff
	capability: "MESSAGING",
	// "Add Account" button was tapped
	AddAccount: function(button) {
		this.$.accountsView.AddAccount(enyo.application.accountService.getAccountTemplates());
		this.$.pane.selectViewByName("accountsView");
	},
	// User tapped on account to edit
	editAccount: function(inSender, inResults) {
		this.$.accountsModify.ModifyAccount(inResults.account, inResults.template, this.capability);
		this.$.pane.selectViewByName("accountsModify");
	},
	// Go to the prefs and accounts view
	accountsDone: function(inSender, e) {
		this.$.pane.selectViewByName("prefsAndAccounts");
	},
	prefsUpdated: function(inPrefs) {
		//enyo.log("---------##### preferences view: " ,inPrefs);
		if (!inPrefs) {
			return;
		}
		
		this._prefs = inPrefs;
		this.updatePrefsUI();
	},
	updatePrefsUI: function(){
		this.$.toggleButton.setState(this._prefs.enableNotification);
		this.$.listSelector.setValue(this._prefs.notificationSound);
		if (this._prefs.enableNotification) {
			this._showNotification();
		}
		else {
			this._hideNotification();
		}
		this.$.rowGroup.show();
	},
	_hideNotification: function(){
		this.$.rowGroup.hideRow(1);
		this.$.rowGroup.hideRow(2);
	},
	_showNotification: function(){
		this.$.rowGroup.showRow(1);
		if (this._prefs.notificationSound === "ringtone") {
			if (this._prefs.ringtone && this._prefs.ringtone.name) {
				this.$.ringtoneName.setContent(this._prefs.ringtone.name);
			}
			this.$.rowGroup.showRow(2);
		}
		else {
			this.$.rowGroup.hideRow(2);
		}
	},
	showNotificationChange: function(inSender, inState){
		if(inState){
			this._showNotification();
		}
		else{
			this._hideNotification();
		}
		this._prefs.enableNotification = inState;
		//this._dbMerge({enableNotification:inState});
		this.mergePrefs();
	},
	notificationTypeChange: function(inSender, inNewValue, inOldValue){
		if(inNewValue === "ringtone"){
			this.$.rowGroup.showRow(2);
		}
		else{
			this.$.rowGroup.hideRow(2);
		}
		this._prefs.notificationSound = inNewValue;
		this.mergePrefs();
		//this._dbMerge({notificationSound:inNewValue});
	},
	mergePrefs: function() {
		enyo.application.prefsHandler.setPrefs(this._prefs);
	},
	showRingtonePicker: function(){
		this.$.ringtonepicker.pickFile();
	},
	ringtoneChosen: function(inSender, inRingtone){
		if (inRingtone.length > 0) {
			this.$.ringtoneName.setContent(inRingtone[0].name);
			this._prefs.ringtone.name = inRingtone[0].name;
			this._prefs.ringtone.fullPath = inRingtone[0].fullPath;
			this.mergePrefs();
		}
	},
	unloadHandler: function(){
//		enyo.log("-------unregistering PreferencesView from PrefsHandler");
		enyo.application.prefsHandler.unregister(this);
	}
});