EditAssistant = Class.create({

	// Defining the model like this puts it in the prototype, as if it were static in a C++ class, 
	// so "changes are saved" if the user pops the scene and later pushes it again.
	dogModel: {callName: $L("Fez"), name: $L("Wannabe Run's Funny Hat"), age: 2},
	catModel: {callName: $L("Higgs"), name: "", age: 0.2},


	setup: function() {
		var animalFields = [
			{label: $L('Call Name'), property: "callName"}, 
			{label: $L("Name"), property: "name"}, 
			{label: $L({"value":"Age", "key": "age_key"}), property: "age", maxlength:3}
		];
		var dogEditBoxParams =
			{title: $L("Dog Name"), 
			fields: animalFields
		};
		
		var catEditBoxParams = {
			fields: animalFields
		};
		// Specify the model for the 'dog' widget.
		this.controller.setupWidget('dog', dogEditBoxParams, this.dogModel);
		this.controller.setupWidget('cat', catEditBoxParams, this.catModel);
		this.commands = 0;
		
		// Set up view menu with scene header
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [{label: $L("Widgets » Frameworked edit")}]});
		
		// Catch property change events, which the GroupEditBox widget generates.
		Mojo.Event.listen(this.controller.get('dog'), 'mojo-property-change', this.propChangeHandler.bind(this));
		Mojo.Event.listen(this.controller.get('cat'), 'mojo-property-change', this.propChangeHandler.bind(this));
	},
	
	handleCommand: function(event) {
		if(event.type == Mojo.Event.back) {
			//Mojo.log("in handle command, command = " + event.type + " # " + this.commands);
			if (parseInt(this.dogModel.age, 10) === 22) {
				//Mojo.log("dog age is 22. edit rejecting back.");
				this.controller.get('last_change').update("no dog is that old, fix it!");
			} else {
				//Mojo.log("edit popping scene");
				this.controller.stageController.popScene();
			}
			event.stop();
		}
		this.commands += 1;
	},

	propChangeHandler: function(event) {
			//Mojo.log("property " + event.property + $L(", new value is ") + event.value);
		this.controller.get('last_change').update("property " + event.property + $L(", new value is ") + event.value);
	}

});

