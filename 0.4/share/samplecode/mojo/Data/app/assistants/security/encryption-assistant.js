function EncryptionAssistant(args) {
  
}

EncryptionAssistant.prototype.setup = function() {

	this.encStr = null;

	this.attKey = {
			hintText: 'key',
			textFieldName:	'key', 
			modelProperty:		'original', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			true, 
			modifierState: 	Mojo.Widget.capsLock,
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 20,
			requiresEnterKey: false
	};
	this.modelKey = {
		'original' : 'mykey',
		disabled: false
	};

	this.controller.setupWidget('keyField', this.attKey, this.modelKey);
	this.attStr = {
			hintText: 'String to encrypt',
			textFieldName:	'stringfield', 
			modelProperty:		'original', 
			multiline:		false,
			disabledProperty: 'disabled',
			focus: 			false, 
			modifierState: 	Mojo.Widget.capsLock,
			limitResize: 	false, 
			holdToEnable:  false, 
			focusMode:		Mojo.Widget.focusSelectMode,
			changeOnKeyPress: true,
			textReplacement: false,
			maxLength: 100,
			requiresEnterKey: false
	};
	this.modelStr = {
		'original' : 'String to encrypt',
		disabled: false
	};

	this.controller.setupWidget('encrypttextField', this.attStr, this.modelStr);

	Mojo.Event.listen(this.controller.get("EncryptButton"),Mojo.Event.tap,this.handleEncryptionButtonPressed.bind(this))
	Mojo.Event.listen(this.controller.get("DecryptButton"),Mojo.Event.tap,this.handleDecryptionButtonPressed.bind(this))
}

EncryptionAssistant.prototype.handleEncryptionButtonPressed = function(event) {
	try{
		this.encStr = PalmSystem.encrypt(this.modelKey.original,this.modelStr.original);
		Mojo.Log.info(PalmSystem.decrypt(this.modelKey.original,this.encStr));
		this.controller.get('encrypted-area-to-update').update('Encrypted string: ' + this.encStr);
	}catch(e){
		Mojo.Log.error(e);
	}
}

EncryptionAssistant.prototype.handleDecryptionButtonPressed = function(event) {
	if (this.encStr == null) {
		this.showDialogBox("Error","Need to encrypt before you can decrypt")
	}else{	
		try{
			Mojo.Log.info("Before decryption " + this.modelKey.original);
			var decrStr = PalmSystem.decrypt(this.modelKey.original,this.encStr);
			Mojo.Log.info(decrStr);
			this.controller.get('decrypted-area-to-update').update('Decrypted string: ' + decrStr);
		}catch(e){
			Mojo.Log.error(e);
		}
	}
}

EncryptionAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}
