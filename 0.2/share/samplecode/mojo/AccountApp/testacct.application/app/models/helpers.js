try {
     var libraries = MojoLoader.require({name: "foundations", version: "1.0"});
     var Future = libraries["foundations"].Control.Future; // Futures library
     var DB = libraries["foundations"].Data.DB;  // db8 wrapper library
     Mojo.Log.info("--------->Loaded Libraries OK");
   } catch (Error) {
   Mojo.Log.error(Error);
}

//simple logging - requires target HTML element with id of "targOutput"
var logData = function(controller, logInfo) {
	this.targOutput = controller.get("targOutput");
	this.targOutput.innerHTML =  logInfo + "<br/>" + this.targOutput.innerHTML;
	Mojo.Log.info(logInfo);
};