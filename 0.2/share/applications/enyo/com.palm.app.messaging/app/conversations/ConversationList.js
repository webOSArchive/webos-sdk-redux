enyo.kind({
	name: "ConversationList",
	kind: enyo.VFlexBox,
	selectedMessage: "",
	events: {
		onSelectThread: "",
		onClearUnreadCount: "",
		onCloseConversationList: "",
		onOpenComposeView:""
	},
	published: {
		chatThread: "", 
		params:"",
		loginStates:[],
		deletedChatThread: ""
	},
	components: [
		{kind: "ApplicationEvents", onUnload: "windowUnloadHandler", onWindowHidden:"windowHiddenHandler"},
			{name: "dbDelete", kind: "DbService", dbKind: "com.palm.db", method: "del"},
			{name: "dbFind", kind: "DbService", dbKind: "com.palm.db", method: "find", onSuccess: "gotMessagesForChatThreadId"},
			{name: "dbMerge", kind: "DbService", dbKind: "com.palm.db", method: "merge"},
			{kind: "VFlexBox", flex: 1, onclick:"disableKeyboardMannualMode", components: [
				{kind: "Toolbar", className:"enyo-toolbar-light conversation-header", layoutKind: "HFlexLayout", align: "center", components: [
					{name: "buddyStatusServiceWatch", kind: enyo.TempDbService, dbKind: "com.palm.imbuddystatus:1", method: "find", onSuccess: "gotStatus", subscribe: true, resubscribe: true, reCallWatches: true},
					{name: "status", className: "status"},
					{kind:"Control", name: "header", className: "conversation-header-content", flex: 1, onclick: "handleHeaderTap"},
					{kind: "Button", className:"conversation-header-type", components:[ 
						{name: "personServiceWatch", kind: "DbService", dbKind: "com.palm.person:1", method: "find", onSuccess: "gotPerson", subscribe: true, resubscribe: true, reCallWatches: true, onFailure: "personFailure"},
						{name: "contactServiceGet", kind: "DbService", dbKind: "com.palm.contact:1", method: "get", onSuccess: "gotContacts", onFailure: "contactFailure"},
						{name: "transportselector", kind: "TransportSelector",onPhoneClick:"dial", onVideoClick: "videocall", label: $L("."), hideCaption: true, align: "center", onChange: "transportChange"}
					]}
				]},
				{className:"header-shadow"},
				{name: "messageService", kind: "DbService", dbKind: enyo.messaging.message.dbKind, onFailure: "messagesFailure", components: [
					{name: "messageServicePutOutbox", method: "put", onSuccess: "revealListBottom"},//for outbox message
					{name: "messageServicePut", method: "put"},//for status message and draft
					{name: "messageServiceFind", method: "find", onSuccess: "gotDraftMessages"}
				]},
				{kind: "ConversationService", onSuccess: "gotMessages", onWatch: "messagesWatch"},
				{name: "launchApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
				{name: "errorDialog", kind: "PopupDialog", onAccept: "retryMessage"},
				{name: "buddyOfflineDialog", kind: "PopupDialog", onAccept: "sendAny"},
				{kind: "PopupSelect", onSelect: "popupMenuSelect"},
				{flex: 1, name: "list", kind: "FlyweightDbList", pageSize: 20, style: "border: none;", desc: true, bottomUp: true, onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
					{name: "listButtons", layoutKind: "HFlexLayout", flex: 1, showing: false, className:"block-delete-box", components: [
						{name: "blockButton", kind: "Button", caption: $L("Block Sender"), className:"enyo-button-light blocksender-bt", onclick: "promptBlock", flex: 1},
						{name: "deleteButton", kind: "Button", caption: $L("Delete Conversation"), className:"enyo-button-light deleteconversation-bt", onclick: "promptDelete", flex: 1}
					]},
					{kind: "Divider", icon: "images/default_transport_splitter.png", className: "conversationDivider", caption: ""},
					{kind: "ConversationItem", style: "border: none;", onConfirm: "swipeDelete", onclick: "handleMessageTap", onError: "showErrorDialog", onCancel: "disableKeyboardMannualMode"}
				]}
			]},
			{className:"footer-shadow"},
			{name:"footer", kind: "Toolbar", className:"enyo-toolbar-light conversation-bottom", components: [
				{name: "slidingDrag", slidingHandler: true, kind: "GrabButton" },
				/* Watch keyup because the default action of a key (printing/deleting a character)
				 * is done before keyup, which means the input will have resized.
				 * Watch keypress because pressing & holding a key generates
				 * multiple presses but never a keyup
				 */
				{name: "scroller", kind: "BasicScroller", style: "max-height: 155px;", flex: 1, horizontal: false, autoHorizontal: false,  components: [
				    {name: "richText", kind: "RichText", hint:$L("Enter message here..."), richContent: false, alwaysLooksFocused:true, onkeydown: "checkKey", autoEmoticons: true, onfocus: "setKeyboardMannualMode"}
				]}
			]},
		{name: "detailsDialog", kind: "com.palm.library.contactsui.detailsDialog", style: "height: 425px", onCancelClicked: "closeDetailsDialog", onEdit: "closeDetailsDialog", onDone :"closeDetailsDialog", onAddToNew: "closeDetailsDialog", onAddToExisting: "closeDetailsDialog", onBeforeOpen: "onBeforeOpenDetailsDialog"},
        {name: "deleteDialog",  kind: "PopupDialog", onAccept: "deleteConversation"},
		{name: "deleteService", kind: "DeleteThreadService"},
		{name: "blockDialog",   kind: "PopupDialog", onAccept: "blockSender"},
		{name: "blockService",  kind: "BlockPersonService"},
		{name: "connectPhoneDialog", kind: "ConnectPhoneDialog"},
		{name: "systemPrefs", kind: enyo.SystemService, method: "getPreferences", subscribe: true, onSuccess: "gotSystemPrefs", onFailure: "gotSystemPrefsFailure"},
		{name: "chatThreadWatch", kind: "DbService", dbKind: "com.palm.chatthread:1", method: "find", onSuccess: "gotChatThread", subscribe: true, resubscribe: true, reCallWatches: true, onFailure: "chatThraedFailure"}
	],
	create: function() {
		this.inherited(arguments);
		if (window.PalmSystem) {
			this.$.systemPrefs.call ({keys: ["timeFormat"]});
		}
		if (enyo.application.telephonyWatcher) {
			enyo.application.telephonyWatcher.register(this, this.connectionUpdated.bind(this));
		}
	},
	connectionUpdated: function(connected) {
		this.phoneConnected = connected;
	},
	onBeforeOpenDetailsDialog: function(){	
		if (this.chatThread.personId) {
			this.$.detailsDialog.setPersonId(this.chatThread.personId);
		}
		else {
			var contact = ContactsLib.ContactFactory.createContactDisplay();
			var serviceName = this.chatThread.replyService;
			var chatAddress = this.chatThread.replyAddress;
			
			if (enyo.messaging.utils.isTextMessage(serviceName) === true && chatAddress && chatAddress.indexOf("@") > -1) {
				contact.getEmails().add(new ContactsLib.EmailAddress({
					value: chatAddress
				}));
			}
			else 
				if (enyo.messaging.utils.isTextMessage(serviceName) === true) {
					contact.getPhoneNumbers().add(new ContactsLib.PhoneNumber({
						value: chatAddress
					}));
				}
				else {
					contact.getIms().add(new ContactsLib.IMAddress({
						value: chatAddress,
						serviceName: serviceName,
						type: serviceName
					}));
				}
			this.$.detailsDialog.setContact(contact);
		}
	},
	closeDetailsDialog: function() {
		if (this.$.detailsDialog && this.$.detailsDialog.isOpen) {
			this.$.detailsDialog.close();
		}
	},
	disableKeyboardMannualMode: function(){
		enyo.messaging.keyboard.setKeyboardAutoMode();
	},
	handleHeaderTap: function(){
		enyo.messaging.keyboard.setKeyboardAutoMode();

		if (!this.chatThread.flags.locked) {
			this.$.detailsDialog.openAtCenter();			
		}			
	},
	// scroll list to bottom when we resize.
	resize: function() {
		if (this.$.list) {
			// reset adjusts the scroller and tries to maintain the scroll position
			this.$.list.reset();
		}
	},
	disEnableTransportSelector: function(inDisEnable) {
		this.$.transportselector.setHideArrow(!inDisEnable);
		this.$.transportselector.setDisabled(!inDisEnable);
	},
	//event from sweep delete in thread list, clean up and close conversation list if deleted chatthread is  current viewed
	deletedChatThreadChanged: function() {
		if(this.chatThread && this.chatThread._id === this.deletedChatThread._id){
			this.closeConversation(this.chatThread._id, true);
			this.doSelectThread(null);
			this.doCloseConversationList();
		}
	},
	deleteEmptyChatThread: function(chatThreadId){
		if (chatThreadId && this.$.dbFind) {
			this.$.dbFind.call({
				query: {
					from: enyo.messaging.message.dbKind,
					where: [{
						prop: "conversations",
						op: "=",
						val: chatThreadId
					}, {
						prop: "folder",
						op: "=",
						val: [enyo.messaging.message.FOLDERS.INBOX, enyo.messaging.message.FOLDERS.OUTBOX, enyo.messaging.message.FOLDERS.DRAFTS]
					}],
					select: [
						"conversations"
					],
					limit: 1
				}
			});
		}//gotMessagesForChatThreadId
	},
	gotMessagesForChatThreadId: function(inSender, inResponse, inRequest){
		if (inResponse.returnValue && inResponse.results && inResponse.results.length === 0) {
			var i, id, where;
			where = inRequest["params"].query.where;
			for (i = 0; i < where.length; i++) {
				if (where[i].prop === "conversations") {
					id = where[i].val;
					break;
				}
			}
			if (id) {
				this.$.dbDelete.call({
					"ids": [id]
				});
			}
		}
	},
	deleteTransientMessages: function(chatThreadId){
		if (chatThreadId && this.$.dbDelete) {
			this.$.dbDelete.call({
				query: {
					from: enyo.messaging.message.dbKind,
					where: [{
						prop: "conversations",
						op: "=",
						val: chatThreadId
					}, {
						prop: "folder",
						op: "=",
						val: enyo.messaging.message.FOLDERS.TRANSIENT
					}]
				}
			});
		}
		else if(this.$.dbDelete){//case to delete all transient messages, todo: maybe we don't need it anymore since always do closeConversation. currently not called without chatid anymore.
			this.$.dbDelete.call({
				query: {
					from: enyo.messaging.message.dbKind,
					where: [{
						prop: "folder",
						op: "=",
						val: enyo.messaging.message.FOLDERS.TRANSIENT
					}]
				}
			});
		}
	},
	//thread is locked in thread list, and passed to conversation list.
	threadLocked: function(inThread) {
		if (inThread._id === this.chatThread._id) {
			var lock = inThread.flags.locked;
			this.lockConversationList(lock);
		}
	},
	lockConversationList: function(lock){
		if (lock) {
			var message = $L("Messages can no longer be sent or received in this conversation.");
			this.addStatusMessageToChat(message, true);
			this.$.deleteButton.hide();
			this.$.blockButton.hide();
		}
		this.$.richText.setShowing(!lock);
		this.disEnableTransportSelector(!lock);
	},
	addStatusMessageToChat: function(message, locked) {
		if(message !== undefined && message.length > 0) {
			var params = {
				conversations: [this.chatThread._id],
				folder: enyo.messaging.message.FOLDERS.TRANSIENT,
				messageText: message,
				recipient: this.chatThread.replyAddress,
				serviceName: this.chatThread.replyService,
				status: "successful",
				locked:locked,
				_kind: enyo.messaging.message.dbKind,
				localTimestamp: Date.now()
			};
			this.$.messageServicePut.call({objects: [params]});
		}
	},
	addAvailabilityMessageToChat: function(buddystatus) {
		var availability = buddystatus.availability;
        var template = new enyo.g11n.Template(enyo.messaging.buddyAvailability_TRANSIENT_MESSAGES_Template[availability]);
		if( template !== undefined ) {
			var transport = transportPicker.getSelectedTransport();
			var message = template.evaluate({name: transport.displayName}); 
			// special case for offline. Make sure we did not get logged out
			if (availability === enyo.messaging.im.availability.OFFLINE) {
				for (var i = 0; i < this.loginStates.length; i++) {
					if (transport && transport.account && this.loginStates[i].accountId === transport.account.accountId) {
						if (this.loginStates[i].availability === enyo.messaging.im.availability.OFFLINE) {
							message = $L("You are offline");
						}
					}
				}
			}
			this.addStatusMessageToChat(message);
		}
	},
	closeConversation: function(chatThreadId, skipSaveDraft) {
//enyo.log("--------ConversationList::closeConversation this.chatThread:", this.chatThread);
		if (this.$.personServiceWatch && this.$.personServiceWatch.active) {
			this.$.personServiceWatch.cancel();
			this.$.personServiceWatch.active = false;
		}
		if (this.$.conversationService) {
			this.$.conversationService.cancel();
		}
		if (this.$.chatThreadWatch && this.$.chatThreadWatch.active) {
			this.$.chatThreadWatch.cancel();
			this.$.chatThreadWatch.active = false;
		}
		if (this.$.buddyStatusServiceWatch && this.$.buddyStatusServiceWatch.active) {
			this.$.buddyStatusServiceWatch.cancel();
			this.$.buddyStatusServiceWatch.active = false;
		}
		if (chatThreadId) {
			if (!skipSaveDraft) {
				//save draft
				this.saveMessageToDraft(this.$.richText.getValue(), chatThreadId);			
			}
			
			this.$.richText.setValue("");
			
			//clear unread count if app is activated only, but this conversation is closed (switch conversation or open compose view)
			//but not clear if current selected thread has unread messages because app is carded
			if (enyo.application.messageDashboardManager.getAppDeactivated() === false) {
				//cases we want to clear message when incoming messages at bottom and never rendered
				this.doClearUnreadCount(chatThreadId);
			}
			this.deleteTransientMessages(chatThreadId);
			this.deleteEmptyChatThread(chatThreadId);
			
			// clear dashboard to filter out messages from this thread 
			this.updateDashboard({_id: undefined}, enyo.application.messageDashboardManager);
			this.updateDashboard({_id: undefined}, enyo.application.inviteDashboardManager);
		}
	},
	getDraftMessage: function(chatThreadId){
		this.startDraftMsgTime = Date.now();
		enyo.log("Timing - ConversationList - getDraftMessage() - Get Draft Message");
		this.$.messageServiceFind.call({
			query: {
				where: [{
					prop: "conversations",
					op: "=",
					val: chatThreadId
				}, {
					prop: "folder",
					op: "=",
					val: enyo.messaging.message.FOLDERS.DRAFTS
				}]
			}
		});
	},
	watchChatThread: function(chatThreadId){
		this.$.chatThreadWatch.cancel();
		var whereClause = [{"prop":"_id","op":"=","val":chatThreadId}];
		this.$.chatThreadWatch.call({
			query: {
				where: whereClause
			}
		});
		this.$.chatThreadWatch.active = true;
	},
	watchPersonById: function(personId){
				this.$.personServiceWatch.cancel();
				this.$.personServiceWatch.call({
					query: {
						where: [{
							     "prop":"_id",
							     "op":"=",
							     "val":personId
						}],
					    select: enyo.messaging.person.selectAttributes
					}
				});
				this.$.personServiceWatch.active = true;
	},
	setupNewChatThread: function(){
		this.forceSendIfOffline = false;
		this.isIMBuddy = false;

		// clear current thread's unread count
		this.doClearUnreadCount(this.chatThread._id);
	
		// update dashboard to filter out messages from this thread 
		this.updateDashboard(this.chatThread, enyo.application.messageDashboardManager);
		this.updateDashboard(this.chatThread, enyo.application.inviteDashboardManager);
		
		//clear text field and retrieve draft for this chatThread
//		this.$.richText.setValue("");
		this.getDraftMessage(this.chatThread._id);
		
		//update header and status 
		this.$.header.setContent(this.chatThread.displayName || "");
		this.$.status.setClassName("status status-no-presence");
		
		//get default avartar image
		this.chatThread.personImage = enyo.messaging.person.getDisplayImage();
		//watch this chatThread for person, or lock flag change
		this.watchChatThread(this.chatThread._id);
	},
	chatThreadChanged: function(inOldChatThread) {
		this.chatThreadChangeTime = Date.now();
		enyo.log("Timing - ConversationList - chatThreadChanged() - Chat Thread changed so build new Conversation List");
		if (!inOldChatThread && this.chatThread && this.chatThread._id) {
			//open conversationList, switch from default view or composeView
			this.setupNewChatThread();
		}
		else if(inOldChatThread && inOldChatThread._id && !this.chatThread){
			//close conversationList, case that switch to composeView, or default view (thread is deleted so app is carded or closed)
			this.closeConversation(inOldChatThread._id);
		}
		else if (inOldChatThread && inOldChatThread._id && this.chatThread && inOldChatThread._id !== this.chatThread._id) {
			//switch to different chat thread
			this.closeConversation(inOldChatThread._id);
			this.setupNewChatThread();
		}
		else if(inOldChatThread && inOldChatThread._id && this.chatThread && inOldChatThread._id === this.chatThread._id){
			//refresh current chatthread, such as person info changed or thread is locked, or 3rd party launch(need updated transportPicker)
			//todo: test out cases that 3rd party launch with different transport as current selected transport.
		}

		if (this.chatThread && this.chatThread._id) {
			this.lockConversationList(this.chatThread.flags.locked);

			if (!this.chatThread.flags.locked) {
				if (this.chatThread.personId && this.chatThread.personId !== "null") {
					this.watchPersonById(this.chatThread.personId);
					// For handling 'Block Sender' button:
					// We need to double check to make sure the person record contains
					// record that is created by IM transport.  If the person's contact
					// records only contains IM addresses that are created by the user,
					// we still need to display the block sender button.   
					if (this.chatThread.person && this.chatThread.person._id === this.chatThread.personId) {
						this.chatThread.personImage = enyo.messaging.person.getDisplayImage(this.chatThread.person);
						//setup transports for person's phoneNumbers
						transportPicker.setTransportsByPerson(this.$.status, this.$.transportselector, this.chatThread.person, this.chatThread, this.params.selectIMTransport, this.params.buddyStatus);
						if (this.chatThread.person.ims && this.chatThread.person.ims.length > 0 && this.chatThread.person.contactIds && this.chatThread.person.contactIds.length > 0) {
							this.shouldCallListPunt = true;//used in gotContacts() to  reset list after get contact's imbuddy info
							this.$.contactServiceGet.call({"ids": this.chatThread.person.contactIds});
						}
						else {
							this.$.list.punt();//reset();
						}
					}
					else {
					//cases: tap on buddy in buddylist, which create chatthread with personId, but won't have person since it's not part of thread list and person is joined in thread watch
					//cases: 3rd party launch with personId, a new thread is created, no person neither
					//if any other case found that has personId, but don't have person, then, need add code to handle block button
						this.$.list.punt();//reset();
					}
				}
				else {
					transportPicker.setTransportsByChatThread(this.chatThread, this.$.transportselector);
					this.$.list.punt();//dumping existing data and get new data
				}
			}
			else{
				this.$.transportselector.setLabel($L("Lock"));
				this.$.transportselector.closePopup();
				this.$.list.punt();//dumping existing data and get new data
			}
		}
	},
	//watch for chatThread which doesn't have personId, watch it for personId added.
	gotChatThread: function(inSender, inResponse){
		if (inResponse.returnValue && inResponse.results && inResponse.results.length > 0 && inResponse.results[0]._id === this.chatThread._id) {
			if (inResponse.results[0].personId !== this.chatThread.personId || inResponse.results[0].flags.locked !== this.chatThread.flags.locked) {
				this.chatThread = inResponse.results[0];
				this.chatThreadChanged(this.chatThread);
			}
		}
	},
	updateDashboard: function(thread, dashboardMgr) {
		var filter = dashboardMgr.getFilter();
		if (!filter) {
			filter = {};
		} 
		filter.thread = thread._id;
		
//		enyo.log("In ConversationList, setting filter message dashboard manager: " ,filter);
		dashboardMgr.setFilter(filter);
	},
	revealListBottom: function(inSender, inResponse){
		if(this.$.list.$.scroll.y >= enyo.messaging.MAX_BOTTOM_HEIGHT_FOR_SNAP) {
			//reveal bottom for outbox only, not status or drafts
			this.$.list.punt();
		}
	},
	messagesWatch: function(inSender, inResponse){
		//list will retain where it is if user scroll up list at least enyo.messaging.MAX_BOTTOM_HEIGHT_FOR_SNAP(300px)
		//but we want to reveal bottom for outgoing message, so, need reveal it in revealListBottom() after successfully send out messages 
		if (this.$.list.$.scroll.y < enyo.messaging.MAX_BOTTOM_HEIGHT_FOR_SNAP) {
			//reveal bottom
			this.$.list.punt();
		}
		else {
			this.$.list.reset();
		}
	},
	gotMessages: function(inSender, inResponse, inRequest){
		this.gotMessagesTime = Date.now();
		enyo.log("Timing - ConversationList - gotMessages() - It took ", Date.now() - this.listQueryTime, "ms to get",inResponse.results.length,  "messages from the Db.");
		this.$.list.queryResponse(inResponse, inRequest);
	},
	gotStatus: function(inSender, inResponse){
		transportPicker.gotStatus(inResponse, this.statusChanged.bind(this));
	},
	statusChanged: function(buddystatus){
		if (this.oldBuddyStatus && this.oldBuddyStatus.serviceName == buddystatus.serviceName && this.oldBuddyStatus.username == buddystatus.username && this.oldBuddyStatus.availability != buddystatus.availability){
			this.addAvailabilityMessageToChat(buddystatus);
		}
		if (this.oldBuddyStatus && this.oldBuddyStatus.serviceName == buddystatus.serviceName && this.oldBuddyStatus.username == buddystatus.username && this.oldBuddyStatus.status != buddystatus.status){
			var statusMessage = buddystatus.status || "";
			if (buddystatus._kind === "com.palm.imbuddystatus.libpurple:1") {
				// needs to unescape &amp; &apos; &lt; and &gt; from status messages
				// that are synced by libpurple transport since the libpurple
				// library escapes these characters.
				statusMessage = enyo.messaging.message.unescapeText(statusMessage);
			}
			this.addStatusMessageToChat(enyo.string.removeHtml(statusMessage));
		}
		this.oldBuddyStatus = buddystatus;
	},
	gotPerson: function(inSender, inResponse){
		if(inResponse.returnValue && inResponse.results && inResponse.results.length > 0 && inResponse.results[0]._id === this.chatThread.personId){
			var person = inResponse.results[0];
			var personImage = enyo.messaging.person.getDisplayImage(person);
			if(personImage !== this.chatThread.personImage) {
				this.chatThread.personImage = personImage;
				this.$.list.refresh();
			}
						
			var displayName = enyo.messaging.person.getDisplayName(person);
			if (displayName !== this.$.header.getContent() && enyo.messaging.person.isNotBlank(displayName)) {
				this.$.header.setContent(displayName);
			}
			
			if (!this.chatThread.person || this.isDifferent(person.contactIds, this.chatThread.person.contactIds) || this.isDifferent(person.phoneNumbers, this.chatThread.person.phoneNumbers)) {
				if (this.$.buddyStatusServiceWatch && this.$.buddyStatusServiceWatch.active) {
					this.$.buddyStatusServiceWatch.cancel();
					this.$.buddyStatusServiceWatch.active = false;
				}
				transportPicker.setTransportsByPerson(this.$.status, this.$.transportselector, person, this.chatThread, this.params.selectIMTransport, this.params.buddyStatus);

				if (person.ims && person.ims.length > 0 && person.contactIds && person.contactIds.length > 0) {
					this.$.contactServiceGet.call({
						"ids": person.contactIds
					});
				}
				else{
					this.$.status.setClassName("status status-no-presence");
				}
			}
			
			this.chatThread.person = person;
		}
		else {
			enyo.error("ConversationList::gotPerson:Failed to get person:payload ",inResponse.results, " this.chatThread.personId:", this.chatThread.personId);
			//fallback to chatthread for deleted person (from contacts)
			transportPicker.setTransportsByChatThread(this.chatThread, this.$.transportselector);
			this.$.status.setClassName("status status-no-presence");
		}
	},
	gotContacts:function(inSender, inResponse){
		this.isIMBuddy = false;
		if (inResponse.returnValue && inResponse.results && inResponse.results.length > 0) {
			var i, contact;
			for (i = 0; i < inResponse.results.length; i++) {
				contact = inResponse.results[i];
				if(contact.imBuddy){
					this.isIMBuddy = true;
					break;
				}
			}
			//need call list.punt() only for one cases which is not called in chatthreadChanged
			if (this.shouldCallListPunt) {
				this.$.list.punt();//reset()
				this.shouldCallListPunt = false;
			}

			if(this.isIMBuddy && this.chatThread.personId){
				this._watchBuddyStatus(this.chatThread.personId);
			}
			transportPicker.setTransportsByContacts(this.$.status, this.$.transportselector, inResponse.results, this.chatThread, this.params.selectIMTransport, this.params.buddyStatus/*, this.allowVideoCallsSkype*/);
		}
		else {
			enyo.error("ConversationList::gotContacts:Failed to get contacts ",inResponse.results);
			transportPicker.setTransportsByChatThread(this.chatThread, this.$.transportselector);
		}
	},
	_watchBuddyStatus: function(personId){
		if (this.$.buddyStatusServiceWatch.active) {
			this.$.buddyStatusServiceWatch.cancel();
		}
		this.$.buddyStatusServiceWatch.call({
			query: {
				where: [{
					"prop": "personId",
					"op": "=",
					"val": personId
				}],
				select: ["_id", "_kind", "personId", "username", "serviceName", "availability", "status"]
			}
		});
		this.$.buddyStatusServiceWatch.active = true;
	},
	transportChange: function(inSender, inNewValue, inOldValue) {
		//todo:for different service this.setCharacterCounterMaxLength();
		transportPicker.selectTransportById(inNewValue);
		var selectedTransport = transportPicker.getSelectedTransport();
		this.$.transportselector.setLabel(selectedTransport.label);
		this.$.status.setClassName("status status-"+enyo.messaging.im.buddyAvailabilities[transportPicker.getBuddyAvailability(selectedTransport.serviceName, selectedTransport.caption)]);
	},
	rendered: function() {
		var bottom, range;
		var richTextNode = this.$.richText && this.$.richText.hasNode();
		this.inherited(arguments);
//todo: what this is for? should clean up later
		/* This is called after the list renders, but the rich text does not
		 * exist at that point. Only "focus" it (set its selection) if it
		 * exists and there is a chat thread to type in
		 */
		if (this.chatThread && richTextNode) {
			range = document.createRange();
			range.setEnd(richTextNode, richTextNode.childNodes.length);
			range.collapse(false);
			window.getSelection().addRange(range);
		}
	},
	checkKey: function(inSender, inEvent) {
		var messageText;

		// Pressing "enter" should send a message and clear the input
		if (inEvent.keyCode === 13) {
			enyo.log(" ENYO PERF: TRANSITION START time: "+ Date.now());
			inEvent.preventDefault();
			messageText = this.$.richText.getValue();

			// Only send non-empty messages
			if (messageText) {
				this.considerForSend();
				enyo.log(" ENYO PERF: TRANSITION DONE time: "+ Date.now());
			}
		}
	},
	listQuery: function(inSender, inQuery) {
		if(this.chatThread){
			this.listQueryTime = Date.now();
			enyo.log("Timing - ConversationList - listQuery() - Get Messages from Db.");
			inQuery.where = [
				{"prop":"conversations","op":"=","val":this.chatThread._id}, 
				{"prop":"flags.visible","op":"=","val":true}, 
				{"prop":"localTimestamp","op":">","val":0}];
			
			inQuery.orderBy = "localTimestamp";
			inQuery.select = [
					"_id",			
					"_kind",		
					"parts",
					"conversations",
					"deliveryReports",
					"errorCategory",
					"networkErrorCode",
					"flags",		
					"folder",
					"groupChatName",
					"localTimestamp",
					"messageText",
					"smsType",
					"callbackNumber",
					"mmsAttachmentsFolder",
					"mmsType",
					"priority",
					"serviceName",
					"status",
					"subject",
					"accepted",
					"commandId",
					"from",
					"to",
					"locked"
				];
			return this.$.conversationService.call({query: inQuery});
	   }
	},
	listSetupRow: function(inSender, inMessage, inIndex) {
		enyo.log("Timing - ConversationList - listSetupRow() - It took", (Date.now() - this.chatThreadChangeTime), "ms to render this message since the chat thread changed.");
		this.setupDivider(inMessage, inIndex);
		//todo: for groupchat, each message could associate with different person, so can't use chatThread.personImage for this.Will we show different iamge for different buddy or use default for all?
		if (this.chatThread.personImage) {
			inMessage.personImage = this.chatThread.personImage;
		}
		this.$.conversationItem.setMessage(inMessage);
		this.$.listButtons.canGenerate = false;
		if (!inSender.fetch(inIndex+1)) {
			if (this.chatThread && !this.chatThread.flags.locked) {
				// show top buttons for the first row
				this.$.conversationItem.applyStyle("padding-top:10px");
				this.$.listButtons.canGenerate = true;//show();
				this.$.listButtons.show();
				this.updateListButtons(this.chatThread);
			}
		}			
		
		if (inMessage.flags && !inMessage.flags.read && enyo.application.messageDashboardManager.getAppDeactivated() === false) {
			// play sound notification only when this is a new unread message in either inbox or transient folder
			if (inMessage.folder !== enyo.messaging.message.FOLDERS.OUTBOX) {
				this.playSoundNotification({ isSent: false });
			}
		}				
	},
	updateListButtons: function(thread) {
		this.$.blockButton.setShowing(!this.shouldHideBlockButton(thread));
	},
	shouldHideBlockButton: function(thread) {
		var transports = transportPicker.getTransports();
		var haveIMAccount = false;
		for(var i = 0; i < transports.length; i++) {
			if (transports[i].account && transports[i].account.capabilitySubtype === "IM") {
				haveIMAccount = true;		
			}
		}		
		return thread && ((thread.personId && this.isIMBuddy) || thread.groupChatId || !haveIMAccount);
	},
	setupDivider: function(inMessage, inIndex) {
		var caption = this.getDividerCaption(inMessage.localTimestamp);
		var username = inMessage.folder === enyo.messaging.message.FOLDERS.INBOX ? inMessage.from.addr : (inMessage.folder === enyo.messaging.message.FOLDERS.OUTBOX ? inMessage.to[0].addr: "");
		if(enyo.messaging.utils.isTextMessage(inMessage.serviceName)){
			username = enyo.messaging.utils.formatAddress(username, inMessage.serviceName);
		}
		var pt = this.$.list.fetch(inIndex + 1);
		var previousCaption = pt && this.getDividerCaption(pt.localTimestamp);
		var previousServiceName = pt && pt.serviceName;
		var serviceName = inMessage.serviceName;
		var icon;
		var previousUsername = pt && (pt.folder === enyo.messaging.message.FOLDERS.INBOX ? pt.from.addr : (pt.folder === enyo.messaging.message.FOLDERS.OUTBOX ? pt.to[0].addr: ""));
		if(pt && pt.serviceName && enyo.messaging.utils.isTextMessage(pt.serviceName)){
			previousUsername = enyo.messaging.utils.formatAddress(previousUsername, pt.serviceName);
		}
		var showDivider = caption != previousCaption || serviceName != previousServiceName || username !== previousUsername; 
		var usernameDisplay = username ? username + ", " : "";
		var usernameDate = usernameDisplay + caption;
		if (showDivider) {
			this.$.divider.setCaption(usernameDate);
			icon = enyo.application.accountService.getIcons(serviceName);
			if (icon && icon.splitter) {
				this.$.divider.setIcon(icon.splitter);
			}
			else{
				this.$.divider.setIcon("images/default_transport_splitter.png");
			}
		}
		//
		this.$.divider.canGenerate = showDivider;
	},
	getDividerCaption: function(timestamp) {
		return Utils.formatShortDate(new Date(timestamp));
	},
	considerForSend: function() {
		// If the current transport is IM + it has gone offline + you are not offline, display a dialog, give the user an option to force the send
		var selectedTransport = transportPicker.getSelectedTransport();

		var accountLoginState, loginState, i;
		if (selectedTransport.account && selectedTransport.account.accountId) {
			for (i = 0; i < this.loginStates.length; i++) {
				loginState = this.loginStates[i];
				if (loginState.accountId === selectedTransport.account.accountId) {
					accountLoginState = loginState;
					break;
				}
			};
		}
		if (this.forceSendIfOffline === false && enyo.messaging.utils.isTextMessage(selectedTransport.serviceName) === false &&
			transportPicker.getBuddyAvailability(selectedTransport.serviceName, selectedTransport.caption) === enyo.messaging.im.availability.OFFLINE && 
			accountLoginState && accountLoginState.availability !== enyo.messaging.im.availability.OFFLINE && accountLoginState.state !== enyo.messaging.imLoginState.TRANSPORT_STATE.OFFLINE
			&& !this.chatThread.groupChatId) {
            var template = new enyo.g11n.Template($L("#{name} is offline. What would you like to do?"));
            var dialogMessage = template.evaluate({name: selectedTransport.displayName}); 
            this.$.buddyOfflineDialog.openAtCenter();
            this.$.buddyOfflineDialog.setTitle($L("Recipient is offline."));
            this.$.buddyOfflineDialog.setMessage(dialogMessage);
            this.$.buddyOfflineDialog.setAcceptButtonCaption($L("Send Anyway"));
		} else {
			this.sendMessage();
		} 
		/*todo: CDMA only
		 else {
			var segments = this.characterCounter.getSegmentData();
			if (segments.segmentCount) {
				for (var x = 0; x < segments.segmentCount; x++) {
					this.sendMessage(segments.segments[x]);
				}
				this.resetTextBox(true);
				this.revealBottomHack(); // snap to the bottom when the user sends a message
			} else {
				Mojo.Log.warn("Segment count is zero or not set."); // This should not happen
			}
		}*/
	},
	sendMessage: function() {
		//safty net to clear unread count for current chat thread in case system crashes
		if (this.chatThread && this.chatThread._id) {
			this.doClearUnreadCount(this.chatThread._id);
		}
		var selectedTransport = transportPicker.getSelectedTransport();
		var recipient = {
			name: selectedTransport.displayName,
			addr: selectedTransport.replyAddress
		};
		//todo: following edge cases are inhired from previous code, might not needed here, but won't hurt to keep it for now
		// Edge cases:
		// 1. If the user has a partial number stored in contacts, and we are using the replyAddress to send, the moment that they 
		//    send or receive on a different transport in the same chat, we will have lost the phone number that was stored in the chat address
		//    switching back to the phone number that was being used previously will fail to send 
		// 2. If the transport picker contains a valid short code that happens to be a subset of a different phone number in the transport picker
		//    Then it is possible for us to send using the replyAddress when we should really use what is in the transport picker
		if (enyo.messaging.utils.isTextMessage(selectedTransport.serviceName) &&
			enyo.messaging.utils.isTextMessage(this.chatThread.serviceName) && this.chatThread.replyAddress) { 
			var chatNum = enyo.messaging.utils.cleanPhoneNumber(this.chatThread.replyAddress);
			var transportNum = enyo.messaging.utils.cleanPhoneNumber(recipient);
			if (transportNum.length >= 7 && chatNum.length > transportNum.length) {
				var isMatch = true;
				for (var i = 1; i <= transportNum.length && isMatch; i++) {
					if (transportNum[transportNum.length - i] !== chatNum[chatNum.length - i]) {
						isMatch = false;
					}
				}
				if (isMatch) {
					recipient.addr = this.chatThread.replyAddress;
				}
			}
		}
		var deliveryReport = false;
/*todo: might not needed
  
 		if( this.Messaging.messagingPrefs.getUseDeliveryReceipts() && enyo.messaging.utils.isTextMessage(selectedTransport.serviceName) ) {
			deliveryReport = true;
		}
*/		
		var params = {
			folder: enyo.messaging.message.FOLDERS.OUTBOX,
			status: "pending",
			conversations: [this.chatThread._id],
			flags: { 
				read: true,
				visible: true,
				deliveryReport: deliveryReport
			},
			to: [recipient],
			messageText: this.$.richText.getValue(),
			serviceName: selectedTransport.serviceName
		};
		
		// For IM accounts, the account's username is set to our IM username so
		// put that into the from address.
		// This isn't the case for SMS, which uses the Palm Profile account.
		//todo: might need new api for >1 number associate with device (sms)
		if (selectedTransport.account !== undefined && selectedTransport.account.capabilitySubtype === "IM") {
			params.from = {
				name: selectedTransport.account.alias,
				addr: selectedTransport.account.username
			};
			params.username = selectedTransport.account.username;
		}

		if (recipient.addr === undefined || recipient.addr.length === 0) {
			enyo.error("ConversationList.sendMessage recipient missing address ", recipient);
		}
		var kind;
		if (!enyo.messaging.utils.isTextMessage(params.serviceName) && selectedTransport.account !== undefined) {
			kind = selectedTransport.account.dbkinds.immessage;
		}
		else {
			// SMS
			kind = enyo.messaging.message.SMS.dbKind;
			params.serviceName = "sms";
		}
		// Manually add the message to the thread and update the chat thread record
		// since it takes too long to load the chatthreader.
		var conversation = enyo.messaging.thread.create({_id: this.chatThread._id});
		conversation.updateFromNewMessage(params, recipient);
		conversation.save();

		this.sendMessageHelper(params, kind);
	},
	sendMessageHelper: function(params, kind) {
		params._kind = kind;
		params.localTimestamp = Date.now();
		this.$.messageServicePutOutbox.call({objects: [params]});//revealListBottom
		this.$.richText.setValue("");
		
		// play a sound for sending message
		this.playSoundNotification({ isSent: true });
		
//todo: keep it to remind something similiar
//		MessagingUtils.checkAirplaneMode(params);

		if (kind === enyo.messaging.message.SMS.dbKind && !this.phoneConnected) {
			// this call is needed for devices that lack of SMS capability
			// phone is not connected, so prompt the user to connect to the phone
			this.$.connectPhoneDialog.openAtCenter();
		}
	},
	playSoundNotification: function(inParams) {
		var prefs = enyo.application.prefsHandler.getPrefs();
		if (prefs && prefs.enableNotification 
				&& (prefs.notificationSound === "system" || prefs.notificationSound === "ringtone")) {
			// play sound notification when user enables sound notification in preferences
			var soundPath = enyo.messaging.utils.getAppRootPath() + (inParams.isSent ? enyo.messaging.message.SOUND_PATHS.SENT : enyo.messaging.message.SOUND_PATHS.RECEIVED);
			window.PalmSystem.playSoundNotification(enyo.messaging.message.SOUND_CLASSES.RINGTON, soundPath);
		}
	},
//todo: check if this message has more than one converstions (chatthread Id)
	swipeDelete: function(inSender, inIndex) {
		enyo.messaging.keyboard.setKeyboardAutoMode();
		var record = this.$.list.fetch(inIndex);
		if (record && record._id) {
			this.$.dbDelete.call({
				ids: [record._id]
			});
		}
	},
	handleMessageTap: function(inSender, inEvent){
		enyo.messaging.keyboard.setKeyboardAutoMode();
		if (inEvent.target.nodeName == "A") {
			return;
		} 
		var index = inEvent.rowIndex;
		var message = this.$.list.fetch(index);
		this.selectedMessage = message;
		
		var messageId = message._id;
		var messageType = message._kind;
			
		if (messageType === enyo.messaging.message.MMS.dbKind) {
				//todo: special command for mms
				//this.showMmsContextPopupMenu(event, eventTarget, chatRowTarget);
			// Only display popup for standard message types (those that are part of the inbox or outbox)
		} else if (message.folder === enyo.messaging.message.FOLDERS.INBOX || message.folder === enyo.messaging.message.FOLDERS.OUTBOX) {
			var popupItems = [];
			//todo:phone only feature
			/*var deliveryReceiptMsg = MessagingUtils.getDeliveryReceiptMsg(event.item);
			if(deliveryReceiptMsg !== undefined) {
				popupItems = [{caption: $L(deliveryReceiptMsg), value: "", disabled: true}];
			}*/
			popupItems = popupItems.concat([
				{caption: $L("Forward"), value: "forward-cmd"},
				{caption: $L("Forward Via Email"), value: "forward-as-email-cmd"},
				{caption: $L("Copy Text"), value: "copy-cmd"},
				{caption: $L("Delete"), value: "delete-cmd"}
			]);
			if(message.errorCategory && (message.status === enyo.messaging.message.MESSAGE_STATUS.FAILED || message.status === enyo.messaging.message.MESSAGE_STATUS.UNDELIVERABLE)) {
				popupItems.push( {caption: $L("View Error"), value: "view-error"} );
			}
			this.$.popupSelect.setItems(popupItems);
			this.$.popupSelect.openAtEvent(inEvent);
		}
	},
	popupMenuSelect: function(inSender, inSelected) {
		var value = inSelected.getValue();
		if (value === "forward-cmd") {
			var composeParams = {
				messageText: enyo.messaging.message.unescapeText(this.selectedMessage.messageText)
			};
			this.doSelectThread(null);
			this.doOpenComposeView(composeParams);
		} else if (value === "forward-as-email-cmd") {
			this.$.launchApp.call({id: "com.palm.app.email", params: {text: this.selectedMessage.messageText}});

		} else if (value === "copy-cmd") {
			enyo.dom.setClipboard(enyo.messaging.message.unescapeText(this.selectedMessage.messageText));
		} else if (value === "delete-cmd") {
//todo: also need check multiple converstions (chatthreadId)
			this.$.dbDelete.call({ids: [this.selectedMessage._id]});
			
		} else if (value === "view-error") {
			this.handleMessageErrorPopup(this.selectedMessage);
		}
	},
	showErrorDialog: function(inSender, inMessage){
		this.selectedMessage = inMessage;
		this.handleMessageErrorPopup(inMessage);
	},
	handleMessageErrorPopup: function(messageData) {
		var title = "";
		// if the message is not really in an error state then just return		
		if (messageData.errorCategory === undefined || messageData.errorCategory === null || (messageData.status !== enyo.messaging.message.MESSAGE_STATUS.FAILED && messageData.status !== enyo.messaging.message.MESSAGE_STATUS.UNDELIVERABLE)) {
			enyo.error("*** Warning got into handleMessageErrorPopup but the message isn't in an error. status= ", messageData.status," , error= ", messageData.errorCategory);
			return;
		}
        
		// For some reason only MMS errors have title text
		if (messageData._kind === enyo.messaging.message.MMS.dbKind) {
			if (messageData.folder === enyo.messaging.message.FOLDERS.OUTBOX) {
				title = $L("Unable To Send Message");
			} else {
				title = $L("Unable to Download Message");
			}
		}
						
    	this.$.errorDialog.openAtCenter();	
    	
		// provide a retry option for temporary failures but not permanent "undeliverable" failures
		if (messageData.status === enyo.messaging.message.MESSAGE_STATUS.FAILED) {
			if (messageData.folder === enyo.messaging.message.FOLDERS.OUTBOX) {
				this.$.errorDialog.setAcceptButtonCaption($L("Send again"));
			// incoming MMS can also fail
			} else if (messageData._kind === enyo.messaging.message.MMS.dbKind) {
				this.$.errorDialog.setAcceptButtonCaption($L("Retry message fetch"));
			} 
		} else if (messageData.status === enyo.messaging.message.MESSAGE_STATUS.UNDELIVERABLE) {
			this.$.errorDialog.hideAcceptButton();
		}
		
        if (title !== "") {
            this.$.errorDialog.setTitle(title);
    	} else {
    		this.$.errorDialog.setTitle($L("Error"));
    	}
        
        this.$.errorDialog.setMessage(enyo.messaging.message.getMessageErrorFromCode(messageData.errorCategory, messageData));
	},
	retryMessage: function(){
		 // Retry puts the message back to status=pending so the service will try sending it again
		var object = { _id:this.selectedMessage._id, status:"pending", errorCategory:null, retryCount:0 };
		this.$.dbMerge.call({objects: [object]});
	},	
	sendAny: function()	{
		this.forceSendIfOffline = true;
		this.sendMessage();
	},
	promptDelete: function() {
		enyo.messaging.keyboard.setKeyboardAutoMode();
	    this.$.deleteDialog.openAtCenter();
	    this.$.deleteDialog.setTitle($L("Delete Conversation"));
	    this.$.deleteDialog.setMessage($L("Are you sure you want to delete this conversation? You cannot undo this action."));
	    this.$.deleteDialog.setAcceptButtonCaption($L("Delete"));
	}, 
	deleteConversation: function() {
		this.$.deleteService.setId(this.chatThread._id);
		this.$.deleteService.deleteThread();
		this.closeConversation(this.chatThread._id, true);
		this.doSelectThread(null);
		this.doCloseConversationList();
	},
	promptBlock: function() {
		enyo.messaging.keyboard.setKeyboardAutoMode();
		this.$.blockDialog.openAtCenter();
		this.$.blockDialog.setTitle($L("Block Sender"));                                                                                          
        this.$.blockDialog.setMessage($L("Are you sure you want to block this sender?"));
	    this.$.blockDialog.setAcceptButtonCaption($L("Block Sender"));
	},
	blockSender: function() {
		this.$.blockService.setThread(this.chatThread);
		this.$.blockService.blockPerson();
		this.deleteConversation();
	},
	dial: function(inSender, inReplyAddress){
		this.$.launchApp.call({id: "com.palm.app.phone", params: {address: inReplyAddress, transport: "com.palm.skype.call", video: false}});
	},
	videocall: function(inSender, inReplyAddress, inServiceName){
		this.$.launchApp.call({id: "com.palm.app.phone", params: {address: inReplyAddress, transport: "com.palm.skype.call", video: true}});
	},
    gotSystemPrefs: function(from, response) {
        // System preferences (timeFormat) service success response handler.
        // timeFormat should be "HH12" or "HH24"
		if (response.timeFormat !== undefined) {
			var twelveHour = false;
	        this.timeFormat = response.timeFormat;
	
	        if (this.timeFormat === "HH12"){
	        	twelveHour = true;
	        }
	        //Resetting the formatter object with the new system setting
	        Utils._shortTimeFmt=new enyo.g11n.DateFmt({time: "short", twelveHourFormat: twelveHour});
	        //Re-render the list
			if (this.$.list) {
				this.$.list.refresh();
			}
		}
	},
    gotSystemPrefsFailure: function(from, response) {
        // System preferences (timeFormat) service failure response handler.
        enyo.log ("Failed to retrieve system time format.\n\t", response);
    },
	saveMessageToDraft: function(message, chatThreadId) {
		if (message && message.length > 0) {
			// Get the recipient
			var selectedTransport = transportPicker.getSelectedTransport();
			var recipient = {
				addr: selectedTransport.replyAddress
			};
			
			// Build the record, might not need save to and serviceName since only messageText is used after retrieved draft
			var params = {
				to: [recipient],
				messageText: message,
				serviceName: selectedTransport.serviceName
			};
			
			// Handle attachment
			if (this.outboundAttachment !== undefined) {
				params.attachment = this.outboundAttachment;
			}
			params.folder = enyo.messaging.message.FOLDERS.DRAFTS;
			params.flags = { visible: "false" };
			params._kind = enyo.messaging.message.dbKind;
			params.conversations = [chatThreadId];
			params.localTimestamp =  Date.now();
			this.$.messageServicePut.call({objects: [params]});
		}
	},
	gotDraftMessages: function(inSender, inResponse){
		enyo.log("Timing - ConversationList - gotDraftMessages() - It took", (Date.now() - this.startDraftMsgTime), "ms to get any draft message from the Db.");
enyo.error("----enyo.keyboard.isShowing():", enyo.keyboard.isShowing());
		if (enyo.keyboard.isShowing()) {
			this.$.richText.forceFocus();
		}

		if (inResponse.results && inResponse.results[0] && inResponse.results[0].conversations && this.chatThread && inResponse.results[0].conversations[0] === this.chatThread._id) {
			this.$.richText.setValue(inResponse.results[0].messageText);
			this.$.dbDelete.call({
				ids: [inResponse.results[0]._id]
			});
		}
	},
	messagesFailure: function(inSender, inResponse){
		enyo.error("ConversationList::messagesFailure::inResponse:", inResponse);
	},
	windowHiddenHandler: function(){
		if (this.chatThread && this.chatThread._id) {
			this.closeConversation(this.chatThread._id);
			this.doSelectThread(null);
		}
		if (this.$.richText.hasFocus()) {
			this.$.richText.forceBlur();
		}
	},
	windowUnloadHandler: function(){
		if (this.chatThread && this.chatThread._id) {
			this.closeConversation(this.chatThread._id);
		}
		if (enyo.application.telephonyWatcher) {
			enyo.application.telephonyWatcher.unregister();
		}
	},
	setKeyboardMannualMode: function(){
		enyo.messaging.keyboard.setKeyboardMannualMode();
	},
	/***********************************
	 * Functions below are unit tested *
	 ***********************************/
	isDifferent: function(newIds, oldIds){
		if(newIds === undefined && oldIds === undefined){
			return false;
		}
		else if(newIds === undefined || oldIds === undefined){
			return true;
		}
		else if(newIds.length !== oldIds.length){
			return true;
		}
		else{
			var i, isChanged = false;
			newIds.sort();
			oldIds.sort();
			for (i=0; i<newIds.length; i++){
				if(newIds[i]!==oldIds[i]){
					isChanged = true;
					break;
				}
			}
			return isChanged;
		}
	}
});