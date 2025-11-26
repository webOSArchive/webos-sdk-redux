enyo.kind({
	name: "Main.WebView",
	kind: "Control",
	components: [
		{kind: "RowGroup",  caption: "URL", components: [
			{kind: "HFlexBox", components: [
        		{kind: "Input", name: "txtURL", value: "http://developer.palm.com", flex: 4}, 
            	{kind: "Button", className: "enyo-button-affirmative", caption: "GO!", onclick: "goToURL", flex: 1}
            ]}
		]},
		{
			kind: "WebView",
			name: "myWebView",
			layoutKind: "HFlexLayout",
			url: "http://developer.palm.com",
			onUrlRedirected: "redir",
			redirects: [
			
				// Intercept and redirect any link with 'twitter' in the url to our redir function
				{regex: "twitter", cookie: "newBrowserCard", enable: true},
				
				// Intercept and redirect any link with 'mailto' in the url to our redir function
				{regex: "mailto", cookie: "newEmailCard", enable: true}
			]
		},
		//non visual component to open the browser/email
        {
        	kind: "PalmService",
            name: "appManager",
            service: "palm://com.palm.applicationManager/",
            method: "open"
        },
	],
	goToURL: function() {
		this.$.myWebView.setUrl(this.$.txtURL.value);
	},
	redir: function(source, url, cookie) {
		
		switch (cookie) {
			
			// Open new browser card
			case "newBrowserCard":
				this.openBrowser(url);
				break;
				
			// Open email app
			case "newEmailCard":
				this.openEmail();
				break;
			
			// Proceed normally through the WebView
			default:
				this.$.myWebView.setUrl(url);
				break;
		}
		
	},
	openBrowser: function(url) {
	    this.$.appManager.call( {
            'id': "com.palm.app.browser",
            params: {
                url: url
            }
	    });
	},
	openEmail:function() {
	    this.$.appManager.call({
            'id': "com.palm.app.email",
            'params':{
                'summary':'test subject',
                'text':'test email text',
                recipients:[{
                    "type":"email",
                    "role":"1",
                    "value":"address@email.com",
                    "contactDisplay":"Your Name",
                }]
            }
	    });
	}
});
