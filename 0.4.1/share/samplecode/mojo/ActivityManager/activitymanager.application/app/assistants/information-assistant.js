function InformationAssistant() {
}

InformationAssistant.prototype.setup = function() {
	this.getDetailsHandlerCB = this.getDetailsHandler.bind(this)
	this.controller.listen('getdetails',Mojo.Event.tap,this.getDetailsHandlerCB)
	
	//setup the textfield
	this.textModel = {value: ''};
	//specify textReplacement attribute so we don't have any trouble with entering #s
	this.controller.setupWidget('activityID', {textReplacement:false}, this.textModel);
};
 
//gets the activity details on a specified activity
InformationAssistant.prototype.getDetailsHandler = function(event) {
	this.controller.serviceRequest("palm://com.palm.activitymanager", {
	      method: "getDetails",
	      parameters: 
	    	  //get details on an entry (use either the activity id or the activity name)
	      	  {"activityId": this.textModel['value']},
	      	  //{"activityName" : "activity name"},
	      onSuccess:function(results){
	      		  		this.controller.get("area-to-update").innerText = JSON.stringify(results)
	      		    }.bind(this),
	      onFailure:function(results){
	      		    	this.controller.get("area-to-update").innerText = JSON.stringify(results)
	      		    }.bind(this),
	});	
}

InformationAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('listone',Mojo.Event.tap,this.getDetailsHandlerCB);
};