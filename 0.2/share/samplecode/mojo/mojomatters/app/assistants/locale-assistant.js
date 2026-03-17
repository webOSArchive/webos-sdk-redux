/*
	How to change locales within your app, which will let the framework handle localization of your scenes
*/

LocaleAssistant = Class.create( FLibExample, {
	setup: function(){
		
		// Setup a listSelector widget that passes new localeChoice's into localeChange
		this.handleLocaleChange = this.localeChange.bind(this);
		
		// Prime model with current locale setting
		this.localeChoice.currentLocale = Mojo.Locale.getCurrentLocale();
		this.localeChoice.choices = this.locales;
		
		// Setup listSelector widget
		this.controller.setupWidget('locale-selector', this.localeAttributes, this.localeChoice);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('locale-selector', Mojo.Event.propertyChange, this.handleLocaleChange);

		// Set up view menu with scene header
		this.setupMenus({
			header: 'Setting Locale'
		});
	},
	cleanup: function(){
		// Stop listening for events from the listSelector
		this.controller.stopListening('locale-selector', Mojo.Event.propertyChange, this.handleLocaleChange);
	},
	localeAttributes: {
		label: $L('Locale'),  
		modelProperty:'currentLocale'
	},
	localeChoice: {currentLocale: ''}, // Starting value is set in .setup()
	locales: [                  
		{label:$L('English'), value:"en_us"}, 
		{label:$L('Pséüdø'), value:"en_pl"}
	],
	localeChange: function(event) {
		
		// This is where the magic happens:
		Mojo.Locale.set(this.localeChoice.currentLocale);
	}
});
