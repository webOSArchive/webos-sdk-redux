/**
 * 
 */
G11N_RB = {
	"$L" : function(inText) {
		if (!this.rb) {
			this.rb = new enyo.g11n.Resources({
				root : "$enyo-lib/networkproxy"
			});
		}
		return this.rb.$L(inText);
	},
	reload : function(locale) {
		this.rb = new enyo.g11n.Resources({
			root : "$enyo-lib/networkproxy",
			locale : locale
		});
	}
};

enyo.kind({
	name : "ConManService",
	kind : "PalmService",
	service : "palm://com.palm.connectionmanager/"
});

enyo.kind({
	name : "NetworkProxyConfigPopup",
	kind : "ModalDialog",
	// lazy: false,
	width : "100%",
	height : "100%",
	published : {
		proxyConfig : {
			networkTechnology : "",
			proxyScope : ""
		}
	},
	events : {
		onFinish : "",
		onCancel : ""
	},

	caption : G11N_RB.$L("Network Proxy Configuration"),

	components : [
			{
				layoutKind : "VFlexLayout",
				pack : "center",
				components : [
						{
							kind : "RowGroup",
							caption : G11N_RB.$L("Proxy Configuration"),
							components : [
								{
									kind : "HFlexBox",
									components : [
										{
											kind : "ListSelector",
											flex : 1,
											name : "proxyConfigurationPrefs",
											onChange : "handleProxyConfigChange",
											value : "noProxy",
											items : [
													{
														caption : G11N_RB.$L("No Proxy"),
														value : "noProxy"
													}, {
														caption : G11N_RB.$L("Auto-detect from network"),
														value : "autoDetectFromNetwork"
													}, {
														caption : G11N_RB.$L("Manual Proxy"),
														value : "manualProxy"
													}, {
														caption : G11N_RB.$L("Automatic Proxy configuration url"),
														value : "autoConfigUrl"
													}
											]
										}
									]
								}
							]

						}, {
							kind : "RowGroup",
							showing : false,
							caption : "MANUAL PROXY SETTINGS",
							name : "manualProxySettings",
							components : [
								{
									kind : "VFlexBox",
									components : [
											{
												kind : "RowGroup",
												caption : "PROXY SERVER",
												components : [
													{
														name : "proxyServerId",
														kind : "Input",
														hint : G11N_RB.$L("HTTP/HTTPS Proxy Server")
													}
												]
											}, {
												kind : "RowGroup",
												caption : "PROXY PORT",
												components : [
													{
														name : "proxyPortId",
														kind : "Input",
														hint : G11N_RB.$L("HTTP/HTTPS Proxy Port")
													}
												]
											}
									]
								}
							]
						}, {
							kind : "RowGroup",
							showing : false,
							caption : "AUTOMATIC PROXY SETTINGS",
							name : "automaticProxyConfigUrlSettings",
							components : [
								{
									kind : "VFlexBox",
									components : [
										{
										  name : "proxyConfigUrlId",
											kind : "Input",
											hint : G11N_RB.$L("Automatic Proxy Configuration URL")
										}
									]
								}
							]
						}, {
							name : "submitButton",
							kind : "Button",
							caption : G11N_RB.$L("Submit"),
							showing : true,
							onclick : "handleSubmitClick"
						}, {
							name : "cancelButton",
							kind : "Button",
							caption : G11N_RB.$L("Cancel"),
							showing : true,
							onclick : "handleCancelClick"
						}
				]
			}, {
				kind : "ConManService",
				components : [
						{
							name : "getNetworkStatus",
							method : "getStatus",
							subscribe : true,
							resubscribe : true,
							onResponse : "handleGetConManStatusResponse"
						}, {
							name : "getNwProxiesConfig",
							method : "getNwProxiesConfig",
							onResponse : "handleFoundProxyResponse"
						}, {
							name : "configureNwProxies",
							method : "configureNwProxies",
							onResponse : "handleConfigureProxyProfileRequestResponse"
						}
				]
			}
	],
	componentsReady : function() {
		this.log("NetworkProxyConfigPopup::componentsReady");
		this.inherited(arguments);

		this.$.getNwProxiesConfig.call({});

		// var queryObj = {
		// query : {
		// from : "com.palm.connectionmanager.networkproxies:1",
		// where : [
		// {
		// prop : "networkTechnology",
		// op : "=",
		// val : this.proxyConfig.networkTechnologies
		// }, {
		// prop : "proxyScope",
		// op : "=",
		// val : this.proxyConfig.proxyScope
		// }
		// ]
		// }
		// };
		//
		// this.$.getNwProxiesConfig.call(queryObj, {
		// method : "find",
		// onResponse : "handleFoundProxyResponse"
		// });
	},

	reloadResources : function(locale) { // for firstuse
		if (locale) {
			G11N_RB.reload(locale);
		}
	},

	handleFoundProxyResponse : function(inSender, inResponse) {
		this.log("NetworkProxyConfigPopup::handleFoundProxyResponse #### ", inResponse);
		this.log("Value Searching For nwTech", this.proxyConfig.networkTechnology);
		this.log("Value Searching For Scope", this.proxyConfig.proxyScope);

		if (inResponse.returnValue) {
			for ( var x = 0; x < inResponse.proxyInfoList.length; x++) {
				var proxyInfo = inResponse.proxyInfoList[x];
				// this.log("Testing: nwTech ", proxyInfo.networkTechnology, " scope ", proxyInfo.proxyScope);

				if (proxyInfo.networkTechnology === this.proxyConfig.networkTechnology && proxyInfo.proxyScope == this.proxyConfig.proxyScope) {
					this.log("NetworkProxyConfigPopup::handleFoundProxyResponse found ", proxyInfo);
					this.$.proxyConfigurationPrefs.setValue(proxyInfo.proxyConfigType);
					if("manualProxy"===proxyInfo.proxyConfigType){
	          this.$.proxyServerId.setValue(proxyInfo.proxyServer);
	          this.$.proxyPortId.setValue(proxyInfo.proxyPort);
					} else if("autoConfigUrl"===proxyInfo.proxyConfigType){
            this.$.proxyConfigUrlId.setValue(proxyInfo.proxyAutoConfigUrl);
					}
					  
					this.handleProxyConfigChange();
					break;
				}
			}
		}

	},

	handleConfigureProxyProfileRequestResponse : function(inSender, inResponse) {
		this.log("NetworkProxyConfigPopup::handleConfigureProxyProfileRequestResponse ", inResponse);
		this.close();
		this.doFinish(inResponse);
	},

	handleProxyConfigChange : function(inSender, inValue) {
		this.log("NetworkProxyConfigPopup::handleProxyConfigChange");
		var proxyPrefs = this.$.proxyConfigurationPrefs.getValue();
		if ("noProxy" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(false);
			this.$.automaticProxyConfigUrlSettings.setShowing(false);
		} else if ("autoDetectFromNetwork" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(false);
			this.$.automaticProxyConfigUrlSettings.setShowing(false);
		} else if ("manualProxy" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(true);
			this.$.automaticProxyConfigUrlSettings.setShowing(false);
		} else if ("autoConfigUrl" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(false);
			this.$.automaticProxyConfigUrlSettings.setShowing(true);
		}
	},

	handleSubmitClick : function() {
		var configureObj = {};
		var proxyPrefs = this.$.proxyConfigurationPrefs.getValue();
		if ("noProxy" === proxyPrefs) {
			configureObj.action = "rmv";
			configureObj.proxyInfo = {
				networkTechnology : this.proxyConfig.networkTechnology,
				proxyScope : String(this.proxyConfig.proxyScope)
			};
		} else if ("autoDetectFromNetwork" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(false);
			this.$.automaticProxyConfigUrlSettings.setShowing(false);
		} else if ("manualProxy" === proxyPrefs) {
			configureObj.action = "add";
			configureObj.proxyInfo = {
			  proxyConfigType : proxyPrefs,
				networkTechnology : this.proxyConfig.networkTechnology,
				proxyScope : String(this.proxyConfig.proxyScope),
				proxyServer:this.$.proxyServerId.getValue(),
				proxyPort:parseInt(this.$.proxyPortId.getValue()),
				isProxySecured:false
			};
		} else if ("autoConfigUrl" === proxyPrefs) {
			this.$.manualProxySettings.setShowing(false);
			this.$.automaticProxyConfigUrlSettings.setShowing(true);
      configureObj.action = "add";
      configureObj.proxyInfo = {
        proxyConfigType : proxyPrefs,
        networkTechnology : this.proxyConfig.networkTechnology,
        proxyScope : String(this.proxyConfig.proxyScope),
        proxyAutoConfigUrl:this.$.proxyConfigUrlId.getValue(),
        isProxySecured:false
      };
		}

		this.log("NetworkProxyConfigPopup::handleSubmitClick", configureObj);
		if (undefined !== configureObj.action) {
			this.$.configureNwProxies.call(configureObj);
		}

	},

	handleCancelClick : function() {
		this.log("NetworkProxyConfigPopup::handleCancelClick");
		this.close();
		this.doCancel();
	}

});

enyo.kind({
	name : "NetworkProxyConfigLib",
	statics : {
		openProxyConfigUi : function(proxyConfigObj, ownerObj) {
			console.log("NetworkProxyConfigLib::openProxyConfigUi" + enyo.json.stringify(proxyConfigObj));
			if (undefined !== proxyConfigObj) {
				var myk = new NetworkProxyConfigPopup(proxyConfigObj, {
					owner : ownerObj.owner
				});
				myk.setProxyConfig(proxyConfigObj);
				myk.openAt({
					width : 0,
					height : 0,
					top : 0,
					left : 0
				});
			}
		},
		removeProxyConfig : function(proxyConfigObj, ownerObj) {
		  
		}
	}
});
