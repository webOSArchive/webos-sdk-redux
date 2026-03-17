function SecondAssistant(arg) {
	this.mykeyname = arg.keyname;
	this.algorithm = arg.algorithm;
	Mojo.Log.info(JSON.stringify(arg))
}

SecondAssistant.prototype.setup = function() {
	// Setup textfield and buttons
	this.controller.setupWidget("textFieldId",
         {
            hintText: $L("  ... Enter data to encrypt"),
            multiline: true,
            enterSubmits: false,
            focus: true
         },
         this.txtModel = {
             value: "",
             disabled: false
         }
    );
	this.controller.setupWidget("buttonEncrypt",
         {},
         {
             buttonClass :'affirmative',
			 label : "Encrypt",
             disabled: false
         }
     );
	 this.controller.setupWidget("buttonDecrypt",
         {},
         {
             buttonClass :'negative',
			 label : "Decrypt",
             disabled: false
         }
     );
	 this.handleCrypt = this.handleCrypt.bindAsEventListener(this);
	 this.handleUpdate = this.handleUpdate.bindAsEventListener(this);
};

SecondAssistant.prototype.activate = function(event) {
	Mojo.Event.listen(this.controller.get("buttonEncrypt"),Mojo.Event.tap, this.handleCrypt);
	Mojo.Event.listen(this.controller.get("buttonDecrypt"),Mojo.Event.tap, this.handleCrypt);
	Mojo.Event.listen(this.controller.get("textFieldId"), Mojo.Event.propertyChange, this.handleUpdate);
};

SecondAssistant.prototype.deactivate = function(event) {
	Mojo.Event.stopListening(this.controller.get("buttonEncrypt"),Mojo.Event.tap, this.handleCrypt);
	Mojo.Event.stopListening(this.controller.get("buttonDecrypt"),Mojo.Event.tap, this.handleCrypt);
	Mojo.Event.stopListening(this.controller.get("textFieldId"), Mojo.Event.propertyChange, this.handleUpdate);
};
/*
 * Method to handle encryotion and decryption by calling the crypt service
  {    
	   "keyname"   : string,    
	   "algorithm" : string,    
	   "pad"       : string,      
	   "mode"      : string,      
	   "iv"        : string,     
	   "decrypt"   : boolean,    
	   "data"      : string   
	}
 */
SecondAssistant.prototype.handleCrypt = function(event) {
	var decrypt =false;
	var data = this.mydata;
	
	if (event.srcElement.id.indexOf("Decrypt") != -1) {
		decrypt = true;
		data = this.encryptedData;
	}else{
		data = Base64.encode(data);
	}
	Mojo.Log.info('Decrypt ' + decrypt + " : my data = " + data)
	Mojo.Log.info('this.mykeyname ' + this.mykeyname + " : this.algorithm = " + this.algorithm)
	this.controller.serviceRequest("palm://com.palm.keymanager/", {       
		method: "crypt",       
		parameters: {       
			"keyname"   : this.mykeyname,      
			"algorithm" : this.algorithm,       
			"decrypt"   : decrypt,        
			"data"      : data 
		}, 
		onSuccess: function(e){ 
				if(decrypt){
					Mojo.Log.info("Success, data="+Base64.decode(e.data)); 
					this.controller.get('updateArea').update("Data = " + Base64.decode(e.data));
					
				}else{
					this.controller.get('updateArea').update("Data = " + e.data);
					this.encryptedData = e.data;
					Mojo.Log.info("Success, data="+e.data); 
				}
			}.bind(this), 
		onFailure: function(e){ 
				Mojo.Log.error("Crypto MyKey failure, err="+e.errorText); 
				this.controller.get('updateArea').update("Crypto MyKey failure, err="+e.errorText);
			}.bind(this) 
	}); 


};
SecondAssistant.prototype.handleUpdate = function(e) {
    Mojo.Log.info("Change " + e.value)
	this.mydata = e.value;
}
