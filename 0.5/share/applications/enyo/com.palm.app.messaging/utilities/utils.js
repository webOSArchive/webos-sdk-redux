enyo.messaging = {
	MAX_BOTTOM_HEIGHT_FOR_SNAP: 300,
    CONSTANTS : {
        NO_SEARCH_RESULTS: $L("No search results found.")
    },
	im: {
		availability: {
			AVAILABLE: 0,
			BUSY: 2,
			INVISIBLE: 3,
			OFFLINE: 4,
			NO_PRESENCE: 4 //Note, this used to be 6 because we differentiated between none and offline
		},
		availabilityCaptions: {
			"available": $L("Available"),
			"away": $L("Busy"),
			"invisible": $L("Invisible"),			
			"offline": $L("Offline")
		},
		availabilities: {
			"available": 0,
			"available-partial": 1,
			"away": 2,
			"invisible": 3,
			"offline": 4
		},
		buddyAvailabilities: {
			"6": "nopresence",
			"5": "pending",
			"4": "offline",
			"3": "invisible",
			"2": "away",
			"1": "mobile",
			"0": "available"
		},
		availabilityClasses: ["available", "available-partial", "away", "invisible", "offline"]
	},
	buddyAvailability_TRANSIENT_MESSAGES_Template: {
			"6": $L("#{name} is offline"),
			"5": $L("#{name} is offline"),
			"4": $L("#{name} is offline"),
			"3": $L("#{name} is offline"),
			"2": $L("#{name} is busy"),
			"1": $L("#{name} is mobile"),
			"0": $L("#{name} is available")
	},
 	imLoginState: {
		dbKind: "com.palm.imloginstate:1",
		TRANSPORT_STATE: {
			OFFLINE: "offline",
			LOGGING_ON:"logging-on",
			RETRIEVING_DATA:"retrieving-buddies",
			ONLINE:"online",
			LOGGING_OUT:"logging-out"
		},
		// collapse a set of loginStates into a single 'best representation' state
		// (function included in unit testing)
		getAggregatedLoginState: function(loginStates) {
			if (!loginStates || !loginStates.length) {
				// no IM account exists
				return undefined;
			}
			//
			var state = {
				bestAvailability: enyo.messaging.im.availability.OFFLINE,
				identicalStates: true,
				identicalAvailabilities: true,
			    identicalCustomMessages: true,
				hasOffline: false,
				hasPending: false,
				customMessage: undefined
			};
			var currState = undefined;
			var currAvailability = undefined;
			var currCustomMessage = undefined;
			
			// Normalize the custom message attribute to
			// help determine if they are identical.
			for (var i=0; i < loginStates.length; i++) {
				if (!loginStates[i].customMessage) {
					loginStates[i].customMessage = "";
				}
			}
			
			for (var i=0; i < loginStates.length; i++) {
				var loginState = loginStates[i];
				var transportState = loginState.state;
				var availability = loginState.availability;
				var customMessage = loginState.customMessage;
				
				if (currState === undefined) {
					currState = transportState;
				} else if (currState !== transportState) {
					state.identicalStates = false;
				}

				if (currAvailability === undefined) {
					currAvailability = availability;
				} else if (currAvailability !== availability) {
					state.identicalAvailabilities = false;
				}
				
				if (currCustomMessage === undefined) {
					currCustomMessage = customMessage;
				} else if (currCustomMessage !== customMessage) {
					state.identicalCustomMessages = false;
				}
				
				if (transportState === this.TRANSPORT_STATE.ONLINE) {
					// check for best login state
					if (loginState.availability < state.bestAvailability) {
						state.bestAvailability = loginState.availability;
					}
				} else if (transportState === this.TRANSPORT_STATE.OFFLINE) {
					state.hasOffline = true;
				} else if (loginState.availability !== enyo.messaging.im.availability.OFFLINE) {
					var pendingStates = [this.TRANSPORT_STATE.LOGGING_ON, this.TRANSPORT_STATE.LOGGING_OUT, this.TRANSPORT_STATE.RETRIEVING_DATA];
					for (var j=0; j < pendingStates.length; j++) {
						if (transportState === pendingStates[j]) {
							state.hasPending = true;
							break;
						}
					}
				}
			}
			
			if (state.identicalCustomMessages) {
				state.customMessage = loginStates[0].customMessage;
			} else {
				state.customMessage = undefined;
			}
			//enyo.error("final best state: ", state);
			return state;
		},
		getAvailability: function(loginState) {
			return loginState.state === this.TRANSPORT_STATE.OFFLINE ? enyo.messaging.im.availability.OFFLINE : loginState.availability;
		}
	},
	message: {
		dbKind: "com.palm.message:1",
		FOLDERS: {
			INBOX: "inbox",
			OUTBOX: "outbox",
			DRAFTS: "drafts",
			TRANSIENT: "transient",
			SYSTEM: "system"
		},
		SMS: {
			dbKind: "com.palm.smsmessage:1"
		},
		MMS: {
			dbKind: "com.palm.mmsmessage:1"
		},
		SOUND_CLASSES: {
//			SENT: "sink",
//			RECEIVED: "pnotifications",
			SYSTEM: "notification",
			VIBRATE: "vibrate",
			RINGTON: "alerts"
		},
		SOUND_PATHS: {
			SENT: "audios/sent.mp3",
			RECEIVED: "audios/received.mp3"
		},
		MESSAGE_STATUS: {
			SUCCESS: "successful",
			PENDING: "pending",
			FAILED: "failed",
			UNDELIVERABLE: "permanent-fail",
			WAITING_FOR_DATA_TO_CONNECT: "waiting-for-connection",
			DELAYED_DELIVERY: "delayed",
			RETRIEVING_CONTENT: "retrieving"
			
		},	
		ERROR_CATEGORIES: {
			//SMS Errors
			//			"genericsmserror"  : $L("Could not send your message. Try again."),
			"unknownscaddress": $L("Unknown service center address. Contact your carrier."),
			"smsnetworkerror": $L("Could not send your message due to a network error. Try again. #{networkErrorCode}"),
			"fdnrestricted": $L("Number is FDN restricted"),
			//MMS Errors
			//NOTE text for 15 and 16 are verizon required strings for those errors
			"mmsErrorUnspecified": $L("Unknown error while downloading the message."),
			"mmsErrorMessageTooLarge": $L("The attachment is too large."),
			"mmsErrorMessageNotFound": $L("Message not found on server."),
			"mmsErrorNetwork": $L("A network error occurred."),
			"mmsErrorExpired": $L("Message expired or not available."),
			"mmsErrorCorrupt": $L("Message is corrupt."),
			"mmsErrorBadUrl": $L("Unable to connect to MMS server."),
			"mmsErrorDbError": $L("Database failure."),
			"mmsErrorRejected": $L("Message content rejected."),
			"mmsErrorServiceNotInitialized": $L("Message transport not initialized."),
			"mmsErrorUnsupportedMessage": $L("Unknown error while sending the message."),
			"mmsErrorContentCorrupt": $L("Message content is corrupt."),
			"mmsOutOfMediaMemory": $L("Device is full. Delete files to clear space."),
			"mmsErrorServiceDenied": $L("Service not activated on network."),
			"mmsErrorSendingAddressUnresolved": $L("Invalid destination address."),
			"mmsErrorAttachmentTooLarge": $L("Attachment file size exceeds the maximum allowed."),
			//IM Errors
			// TODO come up with new errors, if any
			"error: unable to message a non-buddy": $L("Unable to send messages to screen names that are not in the buddy list.")
		},
		// (function included in unit testing)
		getMessageErrorFromCode: function(errorCode, messageData){
			if (this.ERROR_CATEGORIES[errorCode] === undefined) {
				if (messageData.status === "permanent-fail") {
					return $L("Could not send your message.");
				}
				else {
					return $L("Could not send your message. Try again.");
				}
			}
			else {
				if (messageData === undefined) {
					return this.ERROR_CATEGORIES[errorCode];
				}
				else {
					return new enyo.g11n.Template(this.ERROR_CATEGORIES[errorCode]).evaluate(messageData);
				}
			}
		},
		// (function included in unit testing)
		isVisible: function(rawMessage){
			if (rawMessage.flags && rawMessage.flags.visible === false) {
				return false;
			}
			return true;
		},
		// (function included in unit testing)
		isUnread: function(rawMessage){
			return (rawMessage.folder === "inbox" &&
			(rawMessage.flags === undefined ||
			(rawMessage.flags.read !== true && rawMessage.flags.visible !== false)));
		},
		// (function included in unit testing)
		isReplacementMessage: function(rawMessage){
			// SMS types of 0x41 to 0x47 indicate replacement messages.
			// When a replacement message comes in the smsservice locates the message to replace
			// and makes changes accordingly.  The app and chatthreader don't have to do anything
			// when replacement messages come in.
			if (!rawMessage) {
				enyo.warn("isReplacementMessage() invoked with invalid parameter!!");
				return false;
			} else {
				return (rawMessage.smsType >= 0x41 && rawMessage.smsType <= 0x47);
			}
		},
		// (function included in unit testing)
		isMMSMessage: function(message) {
			return message ? message._kind === enyo.messaging.message.MMS.dbKind : false;
		},
		
		getMMSDisplayMessage: function() {
			return $L("New MMS on your phone");
		},
		// (function included in unit testing)
		isMMSThread: function(thread) {
			return thread ? thread.replyService === "mms" : false;
		},
		
		getMMSThreadSummary: function() {
			return $L("MMS received on phone");
		},
		// (function included in unit testing)
		getMessageText: function(rawMessage){
			var messageText;
			if (rawMessage) {
				if (rawMessage.subject) {
					messageText = rawMessage.subject;
				} else if (rawMessage.serviceName === "mms") {
					// MMS messages do not keep their body in the messageText field
					// Instead the body is a text attachment
					// The first text attachment is going to be interpreted as the message body
					if (rawMessage.attachments) {
						for (var i = 0; i < rawMessage.attachments.length; i++) {
							if (rawMessage.attachments[i].mimeType === "text/plain" && rawMessage.attachments[i].partText) {
								messageText = rawMessage.attachments[i].partText;
								break;
							}
						}
					}
				} else {
					messageText = rawMessage.messageText;
				}
			} else {
				enyo.warn("getMessageText() invoked with invalid parameter!");
			}
			
			return messageText ? messageText:"";
		},
		
		// Returns an array of CommunicationAddress objects
		// (function included in unit testing)
		getAddressesForThreading: function(rawMessage){
			var addresses;
			// For group chat, the address to use is the groupChatName
			if (rawMessage) {
				if (rawMessage.groupChatName) {
					addresses = [{
						addr: rawMessage.groupChatName
					}];
				} else if (rawMessage.folder === "outbox") {
					addresses = rawMessage.to;
				} else if (rawMessage.from !== undefined) {
					addresses = [rawMessage.from];
				}
			} else {
				enyo.warn("getAddressesForThreading() invoked with invalid parameter!");
			}
			
			if (addresses === undefined) {
				addresses = [];
			}
			//enyo.log("Messaging.Message.getAddressesForThreading: folder=", message.folder, ", address=", addresses);
			return addresses;
		},
		_scriptsRe: new RegExp("<script[^>]*>([\\S\\s]*?)<\/script>", "gim"),
		_tagsRe: new RegExp(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi),
		// (function included in unit testing)
		removeHtml: function(inHtml) {
			// use the logic from enyo.string.removeHtml() except the part that 
			// escape the resulting string before returning it.
			return inHtml.replace(enyo.messaging.message._scriptsRe, "").replace(enyo.messaging.message._tagsRe, "");
		},
		// (function included in unit testing)
		unescapeText: function(inText) {
			return inText && inText.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
		}
	},
	person: {
		// Used when getting a person data from the DB.
		selectAttributes : [ "_id",			
			                 "_kind",
			                 "favorite",
			                 "contactIds",
			                 "name",
			                 "names",
			                 "nickname",
			                 "organization",
			                 "emails",
			                 "phoneNumbers",
			                 "ims",
			                 "photos.squarePhotoPath"	
		],
		getDisplayName: function(person){
			return person ? new ContactsLib.Person(person).generateDisplayName() :  "";
		},
		// (function included in unit testing)
		isNotBlank: function(str) {
			return str && str.length > 0;
		},
		// (function included in unit testing)
		getDisplayNameFromAccounts: function(accnts) {
			var value = "";		
			if (accnts && accnts.length > 0 && accnts[0].value) {
				value = accnts[0].value;
			}			
			return value;
		},
		getDisplayImage: function(inPerson) {
			var image = "images/list-avatar-default.png";
			if (inPerson && inPerson.photos && inPerson.photos.squarePhotoPath) {
				if (palmGetResource(inPerson.photos.squarePhotoPath)) {
					image = inPerson.photos.squarePhotoPath;
				} else {
					var palmService = new enyo.PalmService();
					palmService.importProps({
						service: "palm://com.palm.service.contacts",
						method: "refetchPhoto"
					});
					
					// image doesn't exist, so request to load the image again
					var fetchContactPhoto = function(contactId) {
						//enyo.log("--------###### utils.person.getDisplayImage(), fetching photo for contact: ", contactId);
						palmService.call({
							params: {
								contactId: contactId
							}
						});
					}
					
					inPerson.contactIds.forEach(fetchContactPhoto);
				}
			}
			return image;
		},
		// (function included in unit testing)
		hasMessagingAccounts: function(person) {
			if (person) {
				return (person.ims && person.ims.length > 0);
			} else {
				enyo.warn("hasMessagingAccounts() invoked with invalid parameter!!");
			}
			return false;
		},
		// (function included in unit testing)
		hasSMSAccounts: function(person) {
			if (person) {
			    return person.phoneNumbers && person.phoneNumbers.length > 0;
			} else {
				enyo.warn("hasSMSAccounts() invoked with invalid parameter!!");
			}
			return false;	
		}
	},
	thread: {
		dbKind: "com.palm.chatthread:1",
		
		create: function(inProps){
			var rawChatThread = inProps;
			if (rawChatThread) {
				this._rawChatThread = rawChatThread;
			} else {
				this._rawChatThread = {
					_kind: this.dbKind,
					unreadCount: 0
				};
			}
			return this;
		},
		
		/**
		 * Does a db.merge (if _id is set) or a db.put.
		 */
		save: function(){
			if (this._rawChatThread) {
			    var db;
				if (this._rawChatThread._id) {
					    db = new enyo.DbService({
						dbKind: this.dbKind,
						method: "merge"
					});
					db.call({
						objects: [this._rawChatThread]
					});
				} else if (this._rawChatThread._kind) {
					    db = new enyo.DbService({
						dbKind: this.dbKind,
						method: "put"
					});
					db.call({
						objects: [this._rawChatThread]
					});
				}
			}
		},
		
		/**
		 * Updates the chatthread with to reflect a newly added message
		 * (function included in unit testing)
		 */
		updateFromNewMessage: function(rawMessage, addressObj){
			var rawChatThread = this._rawChatThread;
			
			// Ignore messages that shouldn't change the chatthread: ones that are invisible or
			// in a folder other than "inbox" or "outbox".
			if (!rawMessage || (rawMessage.folder !== "outbox" && rawMessage.folder !== "inbox") ||				
			    !enyo.messaging.message.isVisible(rawMessage)) {
				return rawChatThread;
			}
			
			if (rawChatThread) {
				if (!rawChatThread.flags) {
					rawChatThread.flags = {};
				}
				rawChatThread.flags.outgoing = (rawMessage.folder === "outbox");
				rawChatThread.flags.visible = true; // since a new message was added, ensure the thread is visible
			} else {
				// Assume we're creating a new chat thread
				rawChatThread = {
					_kind: this.dbKind,
					unreadCount: 0,
					flags: {
						outgoing: (rawMessage.folder === "outbox")
					}
				};
			}
			
			rawChatThread.timestamp = rawMessage.localTimestamp || Date.now();
			rawChatThread.summary = enyo.messaging.message.getMessageText(rawMessage);
			rawChatThread.replyService = rawMessage.serviceName;
			
			if (!addressObj) {
				var addressList = enyo.messaging.message.getAddressesForThreading(rawMessage);
				var address;
				if (addressList && addressList[0]) {
					address = addressList[0].addr;
				} else {
					address = enyo.messaging.utils.kMissingAddress;
				}
				
				addressObj = {
					addr: address,
					normalizedAddress: enyo.messaging.utils.normalizeAddress(address, rawMessage.serviceName)
				};
			}
			
			if (!addressObj.normalizedAddress) {
				addressObj.normalizedAddress = enyo.messaging.utils.normalizeAddress(addressObj.addr, rawMessage.serviceName);
			}
			
			rawChatThread.replyAddress = addressObj.addr;
			rawChatThread.normalizedAddress = addressObj.normalizedAddress;
			
			if (enyo.messaging.message.isUnread(rawMessage)) {
				// NOTE:
				// We are handling replacement messages by preventing the unreadCount
				// from being updated upon replacement.  This could also be done by
				// having the chatthreader watch for deletes and decrement the
				// unread count on delete.
				// This method is less robust but allows us to avoid another watch on the DB
				if (enyo.messaging.message.isReplacementMessage(rawMessage)) {
					enyo.log("Ignoring replacement message for unreadCount");
				} else {
					var unreadCount = rawChatThread.unreadCount || 0;
					rawChatThread.unreadCount = unreadCount + 1;
				}
			}
						
			return rawChatThread;
		}
	},
	utils: {
		phoneNumberLabels: {
			"type_mobile": $L("Mobile"),
			"type_home": $L("Home"),
			"type_home2": $L("Home 2"),
			"type_work": $L("Work"),
			"type_work2": $L("Work 2"),
			"type_main": $L("Main"),
			"type_personal_fax": $L("Fax"),
			"type_work_fax": $L("Fax"),
			"type_pager": $L("Pager"),
			"type_personal": $L("Personal"),
			"type_sim": $L("SIM"),
			"type_assistant": $L("Assistant"),
			"type_car": $L("Car"),
			"type_radio": $L("Radio"),
			"type_company": $L("Company"),
			"type_other": $L("Other")
		},
		_phoneTypeServiceNames: {
			"sms": true,
			"mms": true,
			"type_home": true,
			"type_work": true,
			"type_mobile": true,
			"type_home_fax":   true,
			"type_business":   true,
			"type_car":	   true,
			"type_pager":  true,
			"type_work_fax": true,
			"type_sim":true,
			"type_primary":  true,
			"type_other":  true,
			"type_home2":   true,
			"type_home_fax2":   true,
			"type_work2":   true,
			"type_business2":   true,
			"type_mobile2": true,
			"type_car2":	   true,
			"type_pager2":  true,
			"type_work_fax2": true,
			"type_sim2":true,
			"type_primary2":  true,
			"type_other2":  true
		},
		kDefaultBuddyGroup: $L("Buddies"),
		kMissingAddress: $L("No Recipient"),
		cleanPhoneNumberRegex: /[^0-9\+\*\#]*/gi,
		
		/**
		 * Returns true if the service is a SMS/MMS type
		 * (function included in unit testing)
		 */
		isTextMessage: function(serviceName){
			return (serviceName === undefined || serviceName === "" || this._phoneTypeServiceNames[serviceName] === true);
		},
		/**
		 * Returns a formatted version of the address to be used for display. This is primarily used for phone numbers.
		 * (function included in unit testing)
		 */
		formatAddress: function(address, serviceName){
			var formattedAddress = address;
			if (!address) {
				enyo.warn("Messaging.Utils.formatAddress address is empty. Using kMissingAddress");
				formattedAddress = this.kMissingAddress;
			} else {
				if (this.isTextMessage(serviceName) && address.indexOf("@") === -1) {
					var numberObj = new enyo.g11n.PhoneNumber(address);
					// If subscriber number wasn't found, the phone number isn't valid
					if (numberObj.subscriberNumber) {
						var phonefmt = new enyo.g11n.PhoneFmt({style: "default"});
						formattedAddress = phonefmt.format(numberObj);
					}
				}
			}
			return formattedAddress;
		},
		// (function included in unit testing)
		normalizeAddress: function(address, serviceName){
			// first trim leading and trailing whitespace
			if (!address) {
				enyo.warn("messaging.utils.Conversations.normalizeAddress missing address");
				address = this.kMissingAddress;
			}
			//
			if (typeof address === "object") {
				enyo.warn("normalizeAddress was passed an object for the address!!! Can I handle this???");
				if (address.addr) {
					enyo.warn("Yes, I can handle it. address.addr ain't so bad");
					address = address.addr;
				} else if (address.value) {
						enyo.warn("Yes, I can handle it. address.value ain't so bad");
						address = address.value;
					} else {
						enyo.warn("No, I can't handle it :( Why did you give me " + JSON.stringify(address));
						address = this.kMissingAddress;
					}
			}
			//
			var normalizedAddress = address.replace(/^\s*/, "").replace(/\s*$/, "");
			if (this.isTextMessage(serviceName) && (address.indexOf("@") === -1)) {
				var normalizedShortcode = this.normalizeShortcode(normalizedAddress);
				if (normalizedShortcode !== false) {
					normalizedAddress = normalizedShortcode;
				} else {
					var numberObj = new enyo.g11n.PhoneNumber(normalizedAddress);
					normalizedAddress = numberObj.subscriberNumber || normalizedAddress;
				}
			} else {
				// Ignore email addresses
				// TODO: Strip out '.'s from email addresses, trim whitespace, 
				normalizedAddress = normalizedAddress.toLowerCase();
			}
			//enyo.log("***normalizeAddress after ", normalizedAddress);
			return normalizedAddress;
		},
		// (function included in unit testing)
		normalizeShortcode: function(shortcode){
			if (shortcode) {
				// strip out all non-numeric characters.
				var normalizedShortcode = shortcode.replace(/\D*/g, "");
				// TODO this is valid for a lot of countries, but not all. Need to use the
				// Globalization library API once it is ready.
				if (normalizedShortcode.length > 1 && normalizedShortcode.length < 7) {
					return normalizedShortcode;
				}
			}
			return false;
		},
		// (function included in unit testing)
		isEmail: function(addr) {
			return addr ? addr.indexOf("@") !== -1 : false;
		},
		// (function included in unit testing)
		cleanPhoneNumber: function(value, type){
			var cleanPhoneNumber = value;
			if (value) {
				if (type === "phone" && !this.isEmail(value)) {
					cleanPhoneNumber = value.replace(enyo.messaging.utils.cleanPhoneNumberRegex, "");
				}
			}
			return cleanPhoneNumber;
		},
		getAppRootPath: function() {
			return enyo.fetchAppRootPath().replace("file://", "");
		},
		// (function included in unit testing)
		joinData: function(data, inData, inSource, inTarget, inField) {
			// assemble look up data
			var r = inData, lookUp = {};
			for (var i=0, d; d=r[i]; i++) {
				lookUp[d[inSource]] = d;
			}
			// join inData to data
			r = data.results;
			for (i=0, d; d=r[i]; i++) {
				d[inField] = lookUp[d[inTarget]];
			}
		}
	},
	keyboard: {
		setKeyboardAutoMode: function(){
			if (enyo.keyboard.isManualMode()) {
				enyo.keyboard.setManualMode(false);
			}
		},
		setKeyboardMannualMode: function(){
			if (!enyo.keyboard.isManualMode()) {
				enyo.keyboard.setManualMode(true);
			}
			enyo.keyboard.show(enyo.keyboard.typeText);
		}
	}
};