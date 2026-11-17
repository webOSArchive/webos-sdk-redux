function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the stage is first created */
	try {
	        //load up the foundations libraries
			this.libraries = MojoLoader.require({ name: "foundations", version: "1.0"});
			this.Future = this.libraries["foundations"].Control.Future;
			this.DB = this.libraries["foundations"].Data.DB;  
		} catch (Error) {
			Mojo.Log.error("Lib Load error, in StageAssistant" + Error);
		}
	this.controller.pushScene('main', this.DB)


};
