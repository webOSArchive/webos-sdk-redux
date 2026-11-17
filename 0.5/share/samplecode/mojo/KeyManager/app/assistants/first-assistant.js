function FirstAssistant() {
}

FirstAssistant.prototype.setup = function() {
	// Setup command menu
	this.controller.setupWidget(Mojo.Menu.commandMenu,
	    {
	        spacerHeight: 0,
	        menuClass: 'no-fade'
	    },
	    {
	        visible: true,
	        items: [ 
	            {},{ label: "Crypt", command: "do-cryption"},{}        ]
	    }
	);
	// Setup widgets
	this.txtModel = {
             value: "",
             disabled: false
         }
	this.controller.setupWidget("textFieldId",
         {
            hintText: $L("  ... Enter key name"),
            multiline: false,
            enterSubmits: false,
            focus: true
         },
         this.txtModel
    );
	this.controller.setupWidget("buttongen",
         {},
         {
             label : "Generate key",
             disabled: false
         }
     );
	 this.controller.setupWidget("buttonfetch",
         {},
         {
             label : "Fetch",
             disabled: false
         }
     );
	 this.controller.setupWidget("buttonkeyinfo",
         {},
         {
             label : "Key Info",
             disabled: false
         }
     );
	 this.controller.setupWidget("buttonremove",
         {},
         {
             label : "Remove Key",
             disabled: false
         }
     );
	 this.controller.setupWidget("buttonstore",
         {},
         {
             label : "Store Key",
             disabled: false
         }
     );
	 // Set the default algorithm to AES, user can change this from the listselector 
	 this.algorithm = 'AES'
	 this.size = 16
	 this.controller.setupWidget("listselectorId",
        {
            label : 'algorithm',
			choices: [
                {label: "AES", value: 'AES'},
                {label: "3DES", value: '3DES'},
                {label: "HMACSHA1", value: 'HMACSHA1'}
         ]},
         {
            value: this.algorithm,
            disabled: false
        }
    ); 
	 this.handleGenerate = this.handleGenerate.bindAsEventListener(this);
	 this.handleFetch = this.handleFetch.bindAsEventListener(this);
	 this.handleKeyInfo = this.handleKeyInfo.bindAsEventListener(this);
	 this.handleStore = this.handleStore.bindAsEventListener(this);
	 this.handleRemove = this.handleRemove.bindAsEventListener(this);
	 this.handleUpdate = this.handleUpdate.bindAsEventListener(this);
	 this.handleSelector = this.handleSelector.bindAsEventListener(this);
};
/*
 * This is the handle method for the command menu
 */
FirstAssistant.prototype.handleCommand = function(event) {
    if (event.type === Mojo.Event.command) {
        switch (event.command) {
            case 'do-cryption':
				if (this.keyname) {
					/*	Make sure the key exists first and use the correct algorithm, this is case a key
						name is enter but generate isn't pressed first.
						Use the KeyInfo call to a) see if the key exists and b) get the algroithm if it does
					*/
					this.controller.serviceRequest("palm://com.palm.keymanager/", {
						method: "keyInfo",
						parameters: {
							"keyname": this.keyname
						},
						onSuccess: function(rtn){
							this.controller.stageController.pushScene('second', {
								keyname: this.keyname,
								algorithm: rtn.type
							})
							Mojo.Log.info("fetchKey Success: keydata= " + rtn.keydata + ", keyname=" + rtn.keyname);
						}.bind(this),
						onFailure: function(e){
							Mojo.Log.error("fetchKey Failure, err=" + e.errorText);
							this.controller.get('updateArea').update("Err on key " + this.keyname +": "+e.errorText);
						}.bind(this)
					});										
				}
				else {
					Mojo.Controller.errorDialog("Enter key name")
				}				
        }
    }
}
/*
 * Method to handle text being entered into the text field - updates the keyname
 */
FirstAssistant.prototype.handleUpdate = function(e) {
    Mojo.Log.info("Change " + e.value)
	this.keyname = e.value;
}
/*
 * Method to handle a change to the listselector and the algorithm and size
 */
FirstAssistant.prototype.handleSelector = function(e) {
    Mojo.Log.info("Change " + e.value)
	this.algorithm = e.value;
	if(this.algorithm === '3DES')
		this.size = 24;
	else
		this.size = 16
}
FirstAssistant.prototype.activate = function(event) {
	Mojo.Event.listen(this.controller.get("buttongen"),Mojo.Event.tap, this.handleGenerate); 
	Mojo.Event.listen(this.controller.get("buttonfetch"),Mojo.Event.tap, this.handleFetch); 
	Mojo.Event.listen(this.controller.get("buttonkeyinfo"),Mojo.Event.tap, this.handleKeyInfo);
	Mojo.Event.listen(this.controller.get("buttonremove"),Mojo.Event.tap, this.handleRemove);
	Mojo.Event.listen(this.controller.get("buttonstore"),Mojo.Event.tap, this.handleStore); 
	Mojo.Event.listen(this.controller.get("textFieldId"), Mojo.Event.propertyChange, this.handleUpdate);
	Mojo.Event.listen(this.controller.get("listselectorId"), Mojo.Event.propertyChange, this.handleSelector);
};

FirstAssistant.prototype.deactivate = function(event) {
	Mojo.Event.stopListening(this.controller.get("buttongen"),Mojo.Event.tap, this.handleGenerate);
	Mojo.Event.stopListening(this.controller.get("buttonfetch"),Mojo.Event.tap, this.handleFetch);
	Mojo.Event.stopListening(this.controller.get("buttonkeyinfo"),Mojo.Event.tap, this.handleKeyInfo);
	Mojo.Event.stopListening(this.controller.get("buttonremove"),Mojo.Event.tap, this.handleRemove);
	Mojo.Event.stopListening(this.controller.get("buttonstore"),Mojo.Event.tap, this.handleStore); 
	Mojo.Event.stopListening(this.controller.get("textFieldId"), Mojo.Event.propertyChange, this.handleUpdate);
	Mojo.Event.stopListening(this.controller.get("listselectorId"), Mojo.Event.propertyChange, this.handleSelector);
};
/*
 * Methode to handle tapping on the "Generate" button, calls the keymanage generate service
	{    
	   "owner"	: "string"
	   "keyname": "string"
	   "size"   : integer,    
	   "type"   : string,    
	   "nohide" : boolean   
	}
	Return Obj
	{"returnValue":true}

 */
FirstAssistant.prototype.handleGenerate = function(event) {
	this.keyname = this.controller.get('textFieldId').mojo.getValue();
	if (this.keyname) {
		this.controller.serviceRequest("palm://com.palm.keymanager/", {
			method: "generate",
			parameters: {
				"owner": Mojo.appInfo.id,
				"keyname": this.keyname,
				"size": this.size,
				"type": this.algorithm,
				"nohide": true
			},
			onSuccess: function(rtn){
				Mojo.Log.info("KEY: " + JSON.stringify(rtn));
				
				this.controller.get('updateArea').update("KEY: " + JSON.stringify(rtn));
			}.bind(this)			,
			onFailure: function(e){
				Mojo.Log.error("Generate MyGenKey failure, err= " + e.errorText);
				this.controller.get('updateArea').update("Err= " + e.errorText);
			}.bind(this)
		});
	}else{
		Mojo.Controller.errorDialog("Enter key name")
	}

};
/*
 * Method to fetch key
	{    
	   "keyname" : string
	}
	Return obj
	{
		"backup":boolean,
		"cloud":boolean,
		"keydata":string,
		"keyname":string,
		"noexport":boolean,
		"nohide":boolean,
		"returnValue":boolean,
		"shared":boolean,
		"type":string,
		"unwrap_only":boolean}
*/
FirstAssistant.prototype.handleFetch = function(event) {
	if (this.keyname) {
		this.controller.serviceRequest("palm://com.palm.keymanager/", {
			method: "fetchKey",
			parameters: {
				"keyname": this.keyname
			},
			onSuccess: function(rtn){
				Mojo.Log.info("KEY: " + JSON.stringify(rtn));
				this.controller.get('updateArea').update("fetchKey Success: keydata= " + rtn.keydata + ", keyname=" + rtn.keyname);
			}.bind(this),
			onFailure: function(e){
				Mojo.Log.error("fetchKey Failure, err=" + e.errorText);
				this.controller.get('updateArea').update("Err on key " + this.keyname +": "+e.errorText);
			}.bind(this)
		});
	}else{
		Mojo.Controller.errorDialog("Generate key first")
	}
};
/*
 * Method to get keyInfo
	{    
	   "keyname" : string
	}
	Return Obj
	{
		"backup":boolean,
		"cloud":boolean,
		"keyname":string,
		"noexport":boolean,
		"nohide":boolean,
		"returnValue":boolean,
		"shared":boolean,
		"type":string,
		"unwrap_only":boolean
	}
*/
FirstAssistant.prototype.handleKeyInfo = function(event) {
	if (this.keyname) {
		this.controller.serviceRequest("palm://com.palm.keymanager/", {
			method: "keyInfo",
			parameters: {
				"keyname": this.keyname
			},
			onSuccess: function(rtn){
				Mojo.Log.info("KEY: " + JSON.stringify(rtn));
				this.controller.get('updateArea').update("keyInfo Success: type= "+rtn.type);
			}.bind(this),
			onFailure: function(e){
				Mojo.Log.error("fetchKey Failure, err=" + e.errorText);
				this.controller.get('updateArea').update("Err on key " + this.keyname +": "+e.errorText);
			}.bind(this)
		});
	}else{
		Mojo.Controller.errorDialog("Generate key first")
	}
};
/*
 * Method to store key
	{    
	   "keyname" : string
	}
	Return Obj
	{
		"returnValue":true,
		"errorText":string
	}
*/
FirstAssistant.prototype.handleStore = function(event) {
	if (this.keyname) {
		this.controller.serviceRequest("palm://com.palm.keymanager/", {
			method: "store",
			parameters: {
				"keyname": this.keyname,
				"keydata" : Base64.encode("This here be some key data"),  
                 "type"    : this.algorithm
			},
			onSuccess: function(rtn){
				Mojo.Log.info("KEY: " + JSON.stringify(rtn));
				this.controller.get('updateArea').update("Store key success");
			}.bind(this),
			onFailure: function(e){
				Mojo.Log.error("fetchKey Failure, err=" + e.errorText);
				this.controller.get('updateArea').update("Err on key " + this.keyname +": "+e.errorText);
			}.bind(this)
		});
	}else{
		Mojo.Controller.errorDialog("Generate key first")
	}
};
/*
 * Method to remove key
	{    
	   "keyname" : string
	}
	Return Obj
	{
		"returnValue":true,
		"errorText":string
	}
*/
FirstAssistant.prototype.handleRemove = function(event) {
	if (this.keyname) {
		this.controller.serviceRequest("palm://com.palm.keymanager/", {
			method: "remove",
			parameters: {
				"keyname": this.keyname
			},
			onSuccess: function(rtn){
				Mojo.Log.info("KEY: " + JSON.stringify(rtn));
				this.controller.get('updateArea').update("Key '" + this.keyname + "' removed successfully");
			}.bind(this),
			onFailure: function(e){
				Mojo.Log.error("Remove key Failure, err=" + e.errorText);
				this.controller.get('updateArea').update("Err on key " + this.keyname +": "+e.errorText);
			}.bind(this)
		});
	}else{
		Mojo.Controller.errorDialog("Generate key first")
	}
};
