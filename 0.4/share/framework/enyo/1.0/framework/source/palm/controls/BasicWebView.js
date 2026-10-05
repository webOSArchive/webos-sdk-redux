//* @protected
// FIXME: experimental, NOT currently used
// in case we need to do weighted average 
// for gestures like enyo1 does
enyo.weightedAverage = {
	data: {},
	count: 4,
	weights: [1, 2, 4, 8],
	compute: function(inValue, inKind) {
		if (!this.data[inKind]) {
			this.data[inKind] = [];
		}
		var cache = this.data[inKind];
		cache.push(inValue);
		if (cache.length > this.count) {
			cache.shift();
		}
		for (var i=0, d=0, o=0, c, w; (c=cache[i]) && (w=this.weights[i]); i++) {
			o += c * w;
			d += w;
		}
		d = d || 1;
		o = o / d;
		return o;
	},
	clear: function(inKind) {
		this.data[inKind] = [];
	}
};

//* @protected
enyo.kind({
	name: "enyo.BasicWebView",
	kind: enyo.Control,
	//* @protected
	published: {
		identifier: "",
		url: "",
		minFontSize: 16,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		headerHeight: 0,
		redirects: [],
		systemRedirects: [],
		networkInterface: "",
		dnsServers: [],
		ignoreMetaTags: false,
		cacheAdapter: true
	},
	domAttributes: {
		"onblur": enyo.bubbler,
		"tabIndex": 0
	},
	requiresDomMousedown: true,
	events: {
		onMousehold: "",
		onResized: "",
		onPageTitleChanged: "",
		onUrlRedirected: "",
		onSingleTap: "",
		onLoadStarted: "",
		onLoadProgress: "",
		onLoadStopped: "",
		onLoadComplete: "",
		onFileLoad: "",
		onAlertDialog: "",
		onConfirmDialog: "",
		onPromptDialog: "",
		onSSLConfirmDialog: "",
		onUserPasswordDialog: "",
		onOpenSelect: "",
		onNewPage: "",
		onPrint: "",
		onEditorFocusChanged: "",
		onScrolledTo: "",
		onConnected: "",
		onDisconnected: "",
		onError: ""
	},
	//* @protected
	lastUrl: "",
	style: "display: block; -webkit-transform:translate3d(0,0,0)",
	//style: "border: 2px solid red;",
	// Lunacy: an iframe, not webOS's BrowserAdapter plugin. Everything below still runs; only
	// the bottom layer - what the node is and how a command reaches it - changes. See
	// LunaRuntimes/enyo-1.0/CHANGES.md.
	nodeTag: "iframe",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.history = [];
		this.callQueue = [];
		this.dispatcher = enyo.dispatcher;
		this.log("cache", this.cacheAdapter);
		this.domAttributes.frameborder = "0";
		this.domAttributes.scrolling = "auto";
		/*
		this._mouseInInteractive = false;
		this._mouseInFlash = false;
		*/
		this._flashGestureLock = false;
	},
	destroy: function() {
		this.callQueue = null;
		this.node.eventListener = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.node.eventListener = this;
			// need to add event listeners for touch events for
			// webkit to send them to browser adapter
			this.node.addEventListener("touchstart", enyo.bind(this, "touchHandler"));
			this.node.addEventListener("touchmove", enyo.bind(this, "touchHandler"));
			this.node.addEventListener("touchend", enyo.bind(this, "touchHandler"));
			// Lunacy: the plugin's callbacks came from browserserver; an iframe's come from
			// its own load. A page on another origin won't give up its title, which is the
			// one thing a plugin could see and this can't.
			this.node.addEventListener("load", enyo.bind(this, "_frameLoaded"));
			this.history = [];
			this.lastUrl = "";
			if (this.adapterReady()) {
				this.connect();
			}
		}
	},
	blurHandler: function() {
		if (window.PalmSystem) {
			window.PalmSystem.editorFocused(false, 0, 0);
		}
	},
	touchHandler: function() {
		// nop
	},
	// check to make sure the adapter is ready to receive commands. when
	// the node is hidden we cannot call adapter functions.
	adapterReady: function() {
		// Lunacy: the iframe is always ready; there is no plugin to wait for.
		return Boolean(this.hasNode());
	},
	// (browser adapter callback) we only get this if the view is initially
	// hidden
	adapterInitialized: function() {
		this.log("node", this.hasNode(), "func", this.node && this.node.openUrl);
		this._serverConnected = false;
		this.connect();
	},
	// (browser adapter callback) called when the server is connected
	serverConnected: function() {
		this.log();
		this._serverConnected = true;
		this.initView();
		this.doConnected();
	},
	connect: function() {
		if (this.adapterReady() && !this._serverConnected) {
			this._connect();
			/*
			this._connectJob = enyo.job("browserserver-connect", enyo.hitch(this, "connect"), 500);
		} else {
			this._connectJob = null;
			*/
		}
	},
	_connect: function() {
		// Lunacy: there is no browser server to connect to, so the view is ready at once. The
		// normal flow follows from here (serverConnected -> initView -> urlChanged).
		var self = this;
		enyo.asyncMethod(this, function() {
			if (self.hasNode()) { self.serverConnected(); }
		});
	},
	initView: function() {
		if (this.adapterReady() && this._serverConnected) {
			this.cacheBoxSize();
			// Lunacy: through the adapter call, not straight at the node - an iframe has no
			// plugin methods on it.
			this.callBrowserAdapter("interrogateClicks", [false]);
			this.callBrowserAdapter("setShowClickedLink", [true]);
			this.callBrowserAdapter("pageFocused", [true]);
			this.blockPopupsChanged();
			this.acceptCookiesChanged();
			this.enableJavascriptChanged();
			this.systemRedirectsChanged();
			this.redirectsChanged();
			this.updateViewportSize();
			this.minFontSizeChanged();
			this.urlChanged();
			
		}
	},
	//* @public
	// NOTE: to be called manually when browser should be resized.
	resize: function() {
		var s = enyo.fetchControlSize(this);
		if (this._boxSize && (this._boxSize.w != s.w || this._boxSize.h != s.h)) {
			this.cacheBoxSize();
		}
		this.updateViewportSize();
	},
	//* @protected
	// save our current containing box size;
	// we use this to determine if we need to resize
	cacheBoxSize: function() {
		this._boxSize = enyo.fetchControlSize(this);
		this.applyStyle("width", this._boxSize.w + "px");
		this.applyStyle("height", this._boxSize.h + "px");
	},
	//* @protected
	// this tells the adapter how big the plugin is.
	updateViewportSize: function() {
		var b = enyo.calcModalControlBounds(this);
		if (b.width && b.height) {
			this.callBrowserAdapter("setVisibleSize", [b.width, b.height]);
		}
	},
	urlChanged: function() {
		if (this.url) {
			this.callBrowserAdapter("openURL", [this.url]);
		}
	},
	minFontSizeChanged: function() {
		this.callBrowserAdapter("setMinFontSize", [Number(this.minFontSize)]);
	},
	/*
	dispatchDomEvent: function(inEvent) {
		var r = true;	
		var pass = (inEvent.type == "gesturechange" || inEvent.type == "gesturestart" || inEvent.type == "gestureend");
		var left = inEvent.centerX || inEvent.clientX || inEvent.pageX;
		var top = inEvent.centerY || inEvent.clientY || inEvent.pageY;
		if (inEvent.preventDefault && (left < 0 || top < 0)) {
			inEvent.preventDefault();
			return true;
		}
		//this.log('type: ' + inEvent.type + ' pass: ' + pass + ' flashGestureLock: ' + this._flashGestureLock + ' mouseInFlash: ' + this._mouseInFlash + ' mouseInInteractive: ' + this._mouseInInteractive);
		if (pass || (!this._flashGestureLock && !this._mouseInInteractive) || (this._flashGestureLock && !this._mouseInFlash)) {
			r = this.inherited(arguments);
		}
		return r;
	},
	*/
	dragstartHandler: function() {
		// prevent dragging event from bubbling when dragging in webview
		return true;
	},
	flickHandler: function(inSender, inEvent) {
		this.callBrowserAdapter("handleFlick", [inEvent.xVel, inEvent.yVel]);
		// prevent flick event from bubbling when flicking in webview
		return true;
	},
	enableJavascriptChanged: function() {
		this.callBrowserAdapter("setEnableJavaScript", [this.enableJavascript]);
	},
	blockPopupsChanged: function() {
		this.callBrowserAdapter("setBlockPopups", [this.blockPopups]);
	},
	acceptCookiesChanged: function() {
		this.callBrowserAdapter("setAcceptCookies", [this.acceptCookies]);
	},
	headerHeightChanged: function() {
		this.callBrowserAdapter("setHeaderHeight", [this.headerHeight]);
	},
	systemRedirectsChanged: function(inOldRedirects) {
		this._redirectsChanged(this.systemRedirects, inOldRedirects);
	},
	redirectsChanged: function(inOldRedirects) {
		this._redirectsChanged(this.redirects, inOldRedirects);
	},
	_redirectsChanged: function(inRedirects, inOldRedirects) {
		for (var i=0, r; r=inOldRedirects && inOldRedirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, false, r.cookie, r.type || 0]);
		}
		for (i=0, r; r=inRedirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, r.enable, r.cookie, r.type || 0]);
		}
	},
	networkInterfaceChanged: function() {
		if (this.networkInterface) {
			this.callBrowserAdapter("setNetworkInterface", [this.networkInterface]);
		}
	},
	dnsServersChanged: function() {
		if (this.networkInterface) {
			var serverList = this.dnsServers.join(",");
			this.callBrowserAdapter("setDNSServers", [serverList]);
		}
	},
	ignoreMetaTagsChanged: function() {
		this.callBrowserAdapter("ignoreMetaTags", [this.ignoreMetaTags]);
	},
	//* @public
	clearHistory: function() {
		this.callBrowserAdapter("clearHistory");
	},
	//* @protected
	cutHandler: function() {
		this.callBrowserAdapter("cut");
	},
	copyHandler: function() {
		this.callBrowserAdapter("copy");
	},
	pasteHandler: function() {
		this.callBrowserAdapter("paste");
	},
	selectAllHandler: function() {
		this.callBrowserAdapter("selectAll");
	},
	// attempt to call a method on the browser adapter; if the adapter is not
	// ready the call will be added to the call queue. The call queue is
	// flushed next time this api is called.
	//* @public
	callBrowserAdapter: function(inFuncName, inArgs) {
		//this.log("node", this.hasNode(), "func", inFuncName, "?", this.node && this.node[inFuncName], "connected", this._serverConnected);
		if (this.adapterReady() && this._serverConnected) {
			// flush the call queue first
			for (var i=0,q; q=this.callQueue[i]; i++) {
				this._callBrowserAdapter(q.name, q.args);
			}
			this.callQueue = [];
			this._callBrowserAdapter(inFuncName, inArgs);
		} else if (inFuncName !== "disconnectBrowserServer") {
			this.log("queued!", inFuncName);
			this.callQueue.push({name: inFuncName, args: inArgs});
			if (this.adapterReady() && !this._serverConnected) {
				this.connect();
			}
		}
	},
	//* @protected
	// Lunacy: what the BrowserAdapter plugin did, as far as an iframe can. Anything the plugin
	// alone could do (the filesystem calls, dialogs, printing, find-in-page) is logged once
	// rather than silently ignored, so an app's use of it shows up.
	_lunacyFrame: {
		openURL: function(url) {
			if (!url || url === this.lastUrl) { return; }
			this.lastUrl = url;
			this.loadStarted();
			this.node.setAttribute("src", url);
		},
		reloadPage: function() { this._frameWindow(function(w) { w.location.reload(); }); },
		stopLoad: function() { this._frameWindow(function(w) { w.stop && w.stop(); }); },
		goBack: function() { this._frameWindow(function(w) { w.history.back(); }); },
		goForward: function() { this._frameWindow(function(w) { w.history.forward(); }); },
		setHTML: function(url, body) {
			this.lastUrl = url || "";
			this.loadStarted();
			this.node.setAttribute("src", "data:text/html;charset=utf-8," + encodeURIComponent(body || ""));
		},
		clearHistory: function() {},
		clearCache: function() {},
		clearCookies: function() {},
		pageFocused: function() {},
		interrogateClicks: function() {},
		setShowClickedLink: function() {},
		setPageIdentifier: function() {},
		connectBrowserServer: function() {},
		disconnectBrowserServer: function() {},
		setVisibleSize: function() {},
		setMinFontSize: function() {},
		setEnableJavaScript: function() {},
		setBlockPopups: function() {},
		setAcceptCookies: function() {},
		setIgnoreMetaTags: function() {},
		setNetworkInterface: function() {},
		setDNSServers: function() {},
		addUrlRedirect: function() {},
		setHeaderHeight: function() {}
	},
	// Same-origin only: a page from elsewhere keeps its window to itself.
	_frameWindow: function(inFn) {
		try {
			var w = this.hasNode() && this.node.contentWindow;
			if (w) { inFn(w); }
		} catch (e) {
			this.log("Lunacy: the page in this WebView is on another origin (" + e.message + ")");
		}
	},
	// The plugin's callbacks came from browserserver; an iframe's come from its own load. This
	// is bound when a page is first opened rather than in rendered(), because the kind's
	// rendered is replaced after this file's changes are in place.
	_lunacyWatchLoad: function() {
		if (this._lunacyLoadBound || !this.hasNode()) { return; }
		this._lunacyLoadBound = true;
		this.node.addEventListener("load", enyo.bind(this, "_frameLoaded"));
	},
	_frameLoaded: function() {
		var title = "";
		try { title = (this.node.contentDocument && this.node.contentDocument.title) || ""; } catch (e) {}
		// urlTitleChanged is the callback the plugin used; there is no pageTitleChanged on
		// this kind, and calling one stopped the load event ever reaching the app.
		this.urlTitleChanged(this.lastUrl, title, false, false);
		this.documentLoadFinished();
	},
	_callBrowserAdapter: function(inFuncName, inArgs) {
		// do not log the arguments to setHTML for privacy reasons
		if (inFuncName == "setHTML") {
			this.log(inFuncName);
		} else {
			this.log(inFuncName, inArgs);
		}
		var frame = this._lunacyFrame[inFuncName];
		if (frame) {
			frame.apply(this, inArgs || []);
			return;
		}
		this._loggedMissing = this._loggedMissing || {};
		if (!this._loggedMissing[inFuncName]) {
			this._loggedMissing[inFuncName] = true;
			this.log("Lunacy: enyo.WebView." + inFuncName + " needs webOS's browser plugin and does nothing here");
		}
	},
	showFlashLockedMessage: function() {
		if (this.flashPopup == null) {
			// Note: the html break in the message is intentional
			// (requested by HI)
			this.flashPopup = this.createComponent({kind: "Popup", modal: true, style: "text-align:center", components: [{content: $L("Tap outside or pinch when finished")}]});
			this.flashPopup.render();
			if (this.flashPopup.hasNode()) {
				this.flashTransitionEndHandler = enyo.bind(this, "flashPopupTransitionEndHandler");
				this.flashPopup.node.addEventListener("webkitTransitionEnd", this.flashTransitionEndHandler, false);
			}
		}
		this.flashPopup.applyStyle("opacity", 1);
		this.flashPopup.openAtCenter();
		enyo.job(this.id + "-hideFlashPopup", enyo.bind(this, "hideFlashLockedMessage"), 2000);
	},
	hideFlashLockedMessage: function() {
		this.flashPopup.addClass("enyo-webview-flashpopup-animate");
		this.flashPopup.applyStyle("opacity", 0);
	},
	flashPopupTransitionEndHandler: function() {
		this.flashPopup.removeClass("enyo-webview-flashpopup-animate");
		this.flashPopup.close();
	},
	// (browser adapter callback) reports page url, title and if it's possible
	// to go back/forward
	urlTitleChanged: function(inUrl, inTitle, inCanGoBack, inCanGoForward) {
		this.lastUrl = this.url;
		this.url = inUrl;
		this.doPageTitleChanged(enyo.string.escapeHtml(inTitle), inUrl, inCanGoBack, inCanGoForward);
	},
	// (browser adapter callback) used to store history and generate event
	loadStarted: function() {
		this.log();
		this.doLoadStarted();
	},
	// (browser adapter callback) generates event that can be used to show
	// load progress
	loadProgressChanged: function(inProgress) {
		this.doLoadProgress(inProgress);
	},
	// (browser adapter callback) used to restore history and generate event
	loadStopped: function() {
		this.log();
		this.doLoadStopped();
	},
	// (browser adapter callback) generates event
	documentLoadFinished: function() {
		this.log();
		this.doLoadComplete();
	},
	// (browser adapter callback) generates event
	mainDocumentLoadFailed: function(domain, errorCode, failingURL, localizedMessage) {
		this.doError(errorCode, localizedMessage + ": " + failingURL);
	},
	// (browser adapter callback) ?
	linkClicked : function(url) {
		//this.log(url);
	},
	// (browser adapter callback) called when loading a URL that should
	// be redirected
	urlRedirected: function(inUrl, inCookie) {
		this.doUrlRedirected(inUrl, inCookie);
	},
	// working
	updateGlobalHistory: function(url, reload) {
		//this.log(url);
	},
	// working
	firstPaintCompleted: function() {
		//this.log();
	},
	// (browser adapter callback) used to show/hide virtual keyboard when
	// input field is focused
	editorFocused: function(inFocused, inFieldType, inFieldActions) {
		if (window.PalmSystem) {
			if (inFocused) {
				this.node.focus();
			}
			window.PalmSystem.editorFocused(inFocused, inFieldType, inFieldActions);
		}
		this.doEditorFocusChanged(inFocused, inFieldType, inFieldActions);
	},
	// (browser adapter callback) called when the webview scrolls.
	scrolledTo: function(inX, inY) {
		this.doScrolledTo(inX, inY);
	},
	// (browser adapter callback) called to close a list selector
	// gets called after we send a response, so no need to do anything
	// hideListSelector: function(inId) {
	// },
	// (browser adapter callback) called to open an alert dialog
	dialogAlert: function(inMsg) {
		this.doAlertDialog(inMsg);
	},
	// (browser adapter callback) called to open a confirm dialog
	dialogConfirm: function(inMsg) {
		this.doConfirmDialog(inMsg);
	},
	// (browser adapter callback) called to open a prompt dialog
	dialogPrompt: function(inMsg, inDefaultValue) {
		this.doPromptDialog(inMsg, inDefaultValue);
	},
	// (browser adapter callback) called to open a SSL confirm dialog
	dialogSSLConfirm: function(inHost, inCode, inCertFile) {
		this.doSSLConfirmDialog(inHost, inCode, inCertFile);
	},
	// (browser adapter callback) called to open a user/password dialog
	dialogUserPassword: function(inMsg) {
		this.doUserPasswordDialog(inMsg);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeNotSupported: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeHandoffUrl: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// non-flash interactive rect
	mouseInInteractiveChange: function(inInteractive) {
		//this.log(inInteractive);
		this._mouseInInteractive = inInteractive;
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// flash rect 
	mouseInFlashChange: function(inFlash) {
		//this.log(inFlash);
		this._mouseInFlash = inFlash;
	},
	// (browser adapter callback) called when flash "gesture lock" state
	// changes
	flashGestureLockChange: function(enabled) {
		//this.log(enabled);
		this._flashGestureLock = enabled;

                if (this._flashGestureLock) {
                    this.showFlashLockedMessage();
                }
	},
	/**
	(browser adapter callback) called when browser needs to create
	a new card. (e.g. links with target)
	**/
	createPage: function(inIdentifier) {
		this.doNewPage(inIdentifier);
	},
	/**
	(browser adapter callback) called when the browser needs to scroll
	the page. (e.g. named anchors)
	**/
	scrollTo: function(inLeft, inTop) {
		// nop
	},
	/**
	(browser adapter callback) called when found a meta viewport tag
	**/
	metaViewportSet: function(inInitialScale, inMinimumScale, inMaximumScale, inWidth, inHeight, inUserScalable) {
		// nop
	},
	/**
	(browser adapter callback) called when browser server disconnected
	**/
	browserServerDisconnected: function() {
		this.log();
		this._serverConnected = false;
		this.doDisconnected();
	},
	/**
	(browser adapter callback) called when web page  requests print
	**/
	showPrintDialog: function() {
		this.doPrint();
	},
	/**
	(browser adapter callback) called when text caret position is updated
	**/
	textCaretRectUpdate: function(inLeft, inTop, inRight, inBottom) {
		// nop
	},
	/**
	(browser adapter callback)
	**/
	eventFired: function(inEvent, inInfo) {
		var e = {type:inEvent.type, pageX:inEvent.pageX, pageY:inEvent.pageY};
		var h = {
			isNull: inInfo.isNull,
			isLink: inInfo.isLink,
			isImage: inInfo.isImage,
			x: inInfo.x,
			y: inInfo.y,
			bounds: {
				left: inInfo.bounds && inInfo.bounds.left || 0,
				top: inInfo.bounds && inInfo.bounds.top || 0,
				right: inInfo.bounds && inInfo.bounds.right || 0,
				bottom: inInfo.bounds && inInfo.bounds.bottom || 0
			},
			element: inInfo.element,
			title: inInfo.title,
			linkText: inInfo.linkText,
			linkUrl: inInfo.linkUrl,
			linkTitle: inInfo.linkTitle,
			altText: inInfo.altText,
			imageUrl: inInfo.imageUrl,
			editable: inInfo.editable,
			selected: inInfo.selected
		};
		var fn = "do" + inEvent.type.substr(0, 1).toUpperCase() + inEvent.type.substr(1);
		return this[fn].apply(this, [e, h]);
	},
	// renamed browser adapter callbacks:
	// (browser adapter callback) renamed to showListSelector
	showPopupMenu: function(inId, inItemsJson) {
		this.doOpenSelect(inId, inItemsJson);
	},
	// (browser adapter callback) renamed to documentLoadFinished
	didFinishDocumentLoad: function() {
		this.documentLoadFinished();
	},
	// (browser adapter callback) renamed to loadFailed
	failedLoad: function(domain, errorCode, failingURL, localizedMessage) {
	},
	// (browser adapter callback) renamed to mainDocumentLoadFailed
	setMainDocumentError: function(domain, errorCode, failingURL, localizedMessage) {
		this.mainDocumentLoadFailed(domain, errorCode, failingURL, localizedMessage);
	},
	// (browser adapter callback) renamed to firstPaintCompleted
	firstPaintComplete: function() {
		this.firstPaintCompleted();
	},
	// (browser adapter callback) renamed to loadProgressChanged
	loadProgress: function(inProgress) {
		this.loadProgressChanged(inProgress);
	},
	// (browser adapter callback) renamed to pageDimensionsChanged
	pageDimensions: function(width, height) {
		// nop
	},
	// (browser adapter callback) renamed to smartZoomAreaFound
	smartZoomCalculateResponseSimple: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		// nop
	},
	// (browser adapter callback) renamed to urlTitleChanged
	titleURLChange: function(inTitle, inUrl, inCanGoBack, inCanGoForward) {
		this.urlTitleChanged(inUrl, inTitle, inCanGoBack, inCanGoForward);
	}
});

// ---------------------------------------------------------------------------
// Lunacy: enyo.BasicWebView on a native Android WebView (patch 0005).
//
// The same text is at the end of framework/source/palm/controls/BasicWebView.js and of
// framework/build/enyo-build.js, since an app loads one or the other. See
// LunaRuntimes/enyo-1.0/CHANGES.md.
//
// On webOS this control was the BrowserAdapter, an NPAPI plugin that drew a page browserserver
// had loaded. Patch 0002 put an iframe in its place, which can't show a page that refuses to be
// framed and can't see into a page from another origin. In a Lunacy card the bottom layer is
// now a native WebView instead (BrowserViews.kt): the node is an empty box, the native view is
// kept over it, the plugin's calls go to it and its callbacks come back by name. Everything
// above this layer - BasicWebView's own logic, enyo.WebView, the app - is unchanged. Outside a
// Lunacy card (a desktop browser) the iframe stays.
//
// The plugin drew into the page, so Enyo's popups came out over the web content. The native
// view is over the whole page, so while a popup is open the view is "covered": a picture of it
// goes into the box and the view steps aside until the popup has gone.
// ---------------------------------------------------------------------------
(function () {
	if (!window.enyo || !enyo.BasicWebView || !enyo.BasicPopup) { return; }
	var N = window.LunacyNative;
	if (!N || !N.webViewCreate) { return; }
	var p = enyo.BasicWebView.prototype;
	var live = {};
	var callbacks = {};
	var nextToken = 1;
	var popups = [];
	var timer = null;

	p.nodeTag = "div";

	var create = p.create;
	p.create = function () {
		create.apply(this, arguments);
		delete this.domAttributes.frameborder;
		delete this.domAttributes.scrolling;
	};

	p.adapterReady = function () { return Boolean(this.hasNode()); };

	// Connecting is making the native view; it is ready at once, as the iframe was.
	p._connect = function () {
		var self = this;
		enyo.asyncMethod(this, function () {
			if (!self.hasNode() || self._lunacyId) { return; }
			self._lunacyId = N.webViewCreate(String(self.identifier || ""));
			live[self._lunacyId] = self;
			self.serverConnected();
			self._lunacyPlace(true);
			watch();
		});
	};

	// Every plugin call goes through here. A function argument (saveImageAtPoint's callback)
	// can't cross to Android, so it waits here under a token and the answer comes back to it.
	p._callBrowserAdapter = function (inName, inArgs) {
		// As the TouchPad's Enyo does: every call is logged, setHTML without its arguments.
		if (inName == "setHTML") { this.log(inName); } else { this.log(inName, inArgs); }
		if (!this._lunacyId) { return; }
		var a = [];
		for (var i = 0; inArgs && i < inArgs.length; i++) {
			var v = inArgs[i];
			if (typeof v == "function") {
				callbacks[nextToken] = v;
				v = nextToken++;
			}
			a.push(v === undefined ? null : v);
		}
		N.webViewCall(this._lunacyId, inName, JSON.stringify(a));
	};
	p._callBrowserAdapter.nom = "enyo.BasicWebView._callBrowserAdapter()";

	p.destroy = function () {
		if (this._lunacyId) {
			N.webViewDestroy(this._lunacyId);
			delete live[this._lunacyId];
			this._lunacyId = 0;
		}
		this.callQueue = null;
		if (this.node) { this.node.eventListener = null; }
		enyo.Control.prototype.destroy.apply(this, arguments);
	};

	// ---- where the box is ----

	// A popup that is open, or still on its way out (a toaster sliding away) over the box.
	function covers(inPopup, inBox) {
		if (inPopup.isOpen) { return true; }
		var n = inPopup.hasNode && inPopup.hasNode();
		if (!n || !inPopup.showing || !n.offsetWidth) { return false; }
		var r = n.getBoundingClientRect();
		return r.left < inBox.right && r.right > inBox.left && r.top < inBox.bottom && r.bottom > inBox.top;
	}

	p._lunacyPlace = function (inForce) {
		if (!this._lunacyId) { return; }
		var n = this.node, r = null, visible = false, covered = false;
		if (n && n.offsetWidth > 0 && n.offsetHeight > 0 && document.documentElement.contains(n) &&
				getComputedStyle(n).visibility != "hidden") {
			r = n.getBoundingClientRect();
			visible = true;
			for (var i = popups.length - 1; i >= 0; i--) {
				var q = popups[i];
				if (q.destroyed || !q.node && !q.isOpen) { popups.splice(i, 1); continue; }
				if (covers(q, r)) { covered = true; }
			}
		}
		var place = {
			x: r ? r.left : 0, y: r ? r.top : 0, w: r ? r.width : 0, h: r ? r.height : 0,
			vw: window.innerWidth, visible: visible, covered: covered
		};
		var key = JSON.stringify(place);
		if (inForce || key != this._lunacyKey) {
			this._lunacyKey = key;
			N.webViewPlace(this._lunacyId, key);
		}
	};

	function placeAll() {
		var any = false;
		for (var id in live) {
			any = true;
			live[id]._lunacyPlace();
		}
		if (!any && timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	// Layout moves the box without telling anyone - a pane sliding, the keyboard, a rotation -
	// so it is looked at a few times a second; Android only hears when something changed.
	function watch() {
		if (!timer) { timer = setInterval(placeAll, 200); }
	}

	// A popup opening covers the box straight away, rather than at the next look.
	var bp = enyo.BasicPopup.prototype;
	var prepareOpen = bp.prepareOpen;
	bp.prepareOpen = function () {
		var opened = prepareOpen.apply(this, arguments);
		if (opened) {
			if (popups.indexOf(this) < 0) { popups.push(this); }
			placeAll();
		}
		return opened;
	};
	var close = bp.close;
	bp.close = function () {
		close.apply(this, arguments);
		setTimeout(placeAll, 0);
	};

	// ---- Android's side ----

	// The picture of a covered view is in the box: the view can step aside.
	p._lunacyCover = function (inGeneration, inUrl) {
		var self = this, img = new Image();
		this._lunacyCovering = inGeneration;
		img.onload = function () {
			if (!self.node || self._lunacyCovering != inGeneration) { return; }
			self.node.style.backgroundImage = "url(" + inUrl + ")";
			self.node.style.backgroundSize = "100% 100%";
			// One frame for the picture to be drawn before the view goes.
			setTimeout(function () { if (self._lunacyId) { N.webViewCovered(self._lunacyId, inGeneration); } }, 32);
		};
		img.src = inUrl;
	};

	// The view is back over the box; the picture goes once it is surely drawn.
	p._lunacyUncover = function () {
		var self = this, g = this._lunacyCovering = 0;
		setTimeout(function () {
			if (self.node && self._lunacyCovering == g) { self.node.style.backgroundImage = ""; }
		}, 150);
	};

	window.__lunacyWebView = function (inId, inMethod, inArgs) {
		if (inMethod == "_lunacyCallback") {
			var cb = callbacks[inArgs[0]];
			delete callbacks[inArgs[0]];
			if (cb) { cb(inArgs[1], inArgs[2]); }
			return;
		}
		var v = live[inId];
		if (v && v[inMethod]) {
			try {
				v[inMethod].apply(v, inArgs);
			} catch (e) {
				console.error("enyo.WebView." + inMethod + ": " + e);
			}
		}
	};
})();
