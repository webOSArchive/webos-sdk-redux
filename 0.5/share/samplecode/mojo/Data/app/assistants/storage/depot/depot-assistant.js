function DepotAssistant() {
		
	//TODO: move options to model
	
	var options = {
		name: "demo", //Name used for the HTML5 database name. (required)
		version: 1, //Version number used for the HTML5 database. (optional, defaults to 1)	
		//displayName: "demoDB", //Name that would be used in user interface that the user sees regarding this database. Not currently used. (optional, defaults to name)
	    //estimatedSize: 200000, //Estimated size for this database. (optional, no default)
		replace: false // open an existing depot
	};
	
	//Create a database when the scene is generated
	this.demoDepot = new Mojo.Depot(options, this.dbSuccess, this.dbFailure);
}

DepotAssistant.prototype.setup = function() {
	this.add = this.add.bindAsEventListener(this);
	this.get = this.get.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('main_add_button'),Mojo.Event.tap, this.add.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('main_get_button'),Mojo.Event.tap, this.get.bindAsEventListener(this));
}


DepotAssistant.prototype.add = function(){
	//TODO: respond to model change event and save silently
	//TODO: warn users before replacing a record
	this.controller.stageController.assistant.showScene("storage/depot", 'add', this.demoDepot)	
}

DepotAssistant.prototype.get = function(){
	this.controller.stageController.assistant.showScene("storage/depot", 'get', this.demoDepot)		
}

DepotAssistant.prototype.advanced = function(){
	this.controller.stageController.assistant.showScene("storage/depot", 'advanced', this.demoDepot)	
}
DepotAssistant.prototype.cleanup = function(){
	Mojo.Event.stopListening(this.controller.get('main_add_button'), Mojo.Event.tap, this.add.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('main_get_button'), Mojo.Event.tap, this.get.bindAsEventListener(this));
}