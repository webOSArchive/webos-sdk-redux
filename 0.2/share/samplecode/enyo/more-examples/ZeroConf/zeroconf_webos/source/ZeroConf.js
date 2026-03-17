enyo.kind({
    name: "ZeroConf",
	kind: "VFlexBox",
	components: [
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, components: [
				{content: "Zero Conf Demo"},
				{content: "Remote Desktop Control", style: "font-size: 14px"}
			]}
		]},
		
		// This gets shown to the user on application start
		{name: "scanner", components: [
			{content: "To use this sample, run the Java server first then press the \"scan\" button below.", className: "instructions"},
			{kind: "Button", onclick: "buttonScan", caption: "Scan"}
		]},
		
		// This will appear when java service is found
		{kind: "VFlexBox", flex: 1, name: "appControls", showing: false, components: [
			{content: "Press the buttons below to move your computer's mouse cursor.", className: "instructions"},
			
			{kind: "HFlexBox", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{kind: "Grid", className: "gridSize", components: [
					{kind: "Button", className: "gridText", caption: " ", disabled: true},
					{kind: "Button", className: "gridText", caption: "Up", onclick: "buttonUp"},
					{kind: "Button", className: "gridText", caption: " ", disabled: true},
					{kind: "Button", className: "gridText", caption: "Left", onclick: "buttonLeft"},
					{kind: "Button", className: "gridText", caption: "Center", onclick: "buttonCenter"},
					{kind: "Button", className: "gridText", caption: "Right", onclick: "buttonRight"},
					{kind: "Button", className: "gridText", caption: " ", disabled: true},
					{kind: "Button", className: "gridText", caption: "Down", onclick: "buttonDown"},
					{kind: "Button", className: "gridText", caption: " ", disabled: true},
				]},
				{kind: "Spacer", flex: 1}
			]}
		
		]},
		
		{kind: "Scroller", flex: 1, components:[
			{name: "myLog"}
		]},
		{
			kind: "PalmService",
			name: "browseService",
			service: "palm://com.palm.zeroconf/",
			method: "browse",
			onSuccess: "browseServiceSuccess",
			onFailure: "browseServiceFailure",
			subscribe: true
		},
		{
			kind: "PalmService",
			name: "resolveService",
			service: "palm://com.palm.zeroconf/",
			method: "resolve",
			onSuccess: "resolveServiceSuccess",
			onFailure: "resolveServiceFailure",
			subscribe: true
		},
		{
			kind: "WebService",
			name: "ajaxService",
			method: "POST",
			onSuccess: "ajaxSuccess",
			onFailure: "ajaxFailure"
       }
       
	],
	buttonScan: function(inSender, inEvent) {
		
		// Look for our java service
		this.$.browseService.call({
			regType: "_palmdts._tcp"
		});
		
	},
	browseServiceSuccess: function(inSender, inResponse, inRequest) {
		
		// Resolve our java connection
		this.$.resolveService.call({
			regType: inResponse.regType,
            domainName: inResponse.domainName,
            instanceName: inResponse.instanceName
		});
		
	},
	browseServiceFailure: function(inSender, inResponse) {
		this.logMessage("Could not browse zeroconf service.", true);
	},
	resolveServiceSuccess: function(inSender, inResponse, inRequest) {
		
		// Connection successful! Show our button controls
		if(inResponse.targetName !== undefined) {
            this.logMessage("we can now connect to the webservice at " + inResponse.IPv4Address + " " + inResponse.port, false);
            
    		this.webserviceURL = "http://" + inResponse.IPv4Address + ":" + inResponse.port + "/";
            this.$.appControls.show();
            this.$.scanner.hide();
        }
	},
	resolveServiceFailure: function(inSender, inResponse) {
		this.logMessage("The java service doesn't appear to be running on the local network. Please start the service and try again.", false);
	},
	buttonUp: function(inSender, inEvent) {
		this.ajaxRequest("up");
	},
	buttonDown: function(inSender, inEvent) {
		this.ajaxRequest("down");
	},
	buttonLeft: function(inSender, inEvent) {
		this.ajaxRequest("left");
	},
	buttonRight: function(inSender, inEvent) {
		this.ajaxRequest("right");
	},
	buttonCenter: function(inSender, inEvent) {
		this.ajaxRequest("center");
	},
	ajaxRequest: function(direction) {
		var url = this.webserviceURL + "moveMouse?action=" + direction;
		
		// Set our WebService url and call it
		this.$.ajaxService.setUrl(url);
		this.$.ajaxService.call();
		
	},
	ajaxSuccess: function(inSender, inResponse, inRequest) {
		this.logMessage("Success!", false);
	},
	ajaxFailure: function(inSender, inResponse) {
		this.logMessage("Could not send command to java service.", false);
	},
	logMessage: function(str, onscreen) {
		// If we want to show an on-screen log
		if (onscreen) {
			this.$.myLog.setContent(str);
		}
		console.log(str);
	}
});
