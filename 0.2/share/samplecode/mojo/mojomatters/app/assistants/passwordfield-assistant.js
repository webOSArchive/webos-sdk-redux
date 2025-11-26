/*
	The password is an obfuscated textField widget, and operates in the same way
*/

PasswordfieldAssistant = Class.create( FLibExample, {
	initialize : function() {
	},

	setup: function() {

		this.setupMenus({
			header: 'Password Field'
		});
		
		// Bind callbacks and listeners once, ahead of time
		this.propertyChanged = this.propertyChanged.bind(this);
		
		this.controller.setupWidget('passwordField', this.attributes, this.model);
		
		// Events
		//	Use controller.listen() and remember to .stopListening() in .cleanup() until
		//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen('passwordField', Mojo.Event.propertyChange, this.propertyChanged);
	},
	cleanup: function(){
		this.controller.stopListening('passwordField', Mojo.Event.propertyChange, this.propertyChanged);
	},

	propertyChanged: function(event) {
		Mojo.log("Password = %s", this.model.original);
	},
	
	model: {
		
	},	
	attributes: {
		hintText: 'enter password',
		label: "password",
		focus: true
	}

});