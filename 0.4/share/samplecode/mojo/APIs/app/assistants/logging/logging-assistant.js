function LoggingAssistant() {

}

LoggingAssistant.prototype.setup = function(){
	this.logInfo = this.logInfo.bind(this);
	this.addLogging = this.addLogging.bind(this)
	this.logProperties = this.logProperties.bind(this);
	this.propertiesAsString = this.propertiesAsString.bind(this)
	Mojo.Event.listen(this.controller.get('log-info'),Mojo.Event.tap, this.logInfo)
    Mojo.Event.listen(this.controller.get('add-logging'),Mojo.Event.tap, this.addLogging)
    Mojo.Event.listen(this.controller.get('log-properties'),Mojo.Event.tap, this.logProperties)
    Mojo.Event.listen(this.controller.get('properties-as-string'),Mojo.Event.tap, this.propertiesAsString)
}

LoggingAssistant.prototype.logInfo = function() {
    Mojo.Log.info("I have", 3, "eggs.");
	
    var favoriteColor = 'blue';
    Mojo.Log.info("My favorite color is %s.", favoriteColor);
}
	
LoggingAssistant.prototype.addLogging = function() {
    Mojo.Log.addLoggingMethodsToPrototype(LoggingAssistant);
    this.info("Welcome to the dollhouse.");

}
	
LoggingAssistant.prototype.logProperties = function() {
    function myTestFunc () {
		//do something
	}

	var temp = {
				prop1:'this is property 1', 
				prop2:'this is property 2', 
				function1:myTestFunc
				}
				
	Mojo.Log.logProperties(JSON.stringify(temp),"tempObject",false)
}

/*This is to demonstrate the Mojo.Log.propertiesAsString function which is not supposed to
 *log function properties.
*/
LoggingAssistant.prototype.propertiesAsString = function(event) {
    function myTestFunc () {
		//do something
	}

	var temp = {
				prop1:'this is property 1', 
				prop2:'this is property 2', 
				function1:myTestFunc
				}
				
	Mojo.Log.logProperties(JSON.stringify(temp),false)
}
LoggingAssistant.prototype.cleanup = function(event) {
	Mojo.Event.listen(this.controller.get('log-info'),Mojo.Event.tap, this.logInfo)
    Mojo.Event.listen(this.controller.get('add-logging'),Mojo.Event.tap, this.addLogging)
    Mojo.Event.listen(this.controller.get('log-properties'),Mojo.Event.tap, this.logProperties)
    Mojo.Event.listen(this.controller.get('properties-as-string'),Mojo.Event.tap, this.propertiesAsString)
}
