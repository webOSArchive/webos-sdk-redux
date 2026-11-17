/*
  Demonstrates creation of alert dialogs & modal dialogs, and how to get user input out of them.  
*/

var SampleDialogAssistant = Class.create({
	
	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
	},
	
	setup : function(widget) {
		this.widget = widget;
		this.controller.get('thanksButton').addEventListener(Mojo.Event.tap, this.handleThanks.bind(this));
	},
	
	handleThanks: function() {
		this.sceneAssistant.outputDisplay.innerHTML = $L("Dialog result = ") + this.sceneAssistant.loremModel.rating;
		this.widget.mojo.close();
	}
	
	
});

var SampleTextAssistant = Class.create( SampleDialogAssistant, {
	handleThanks: function() {
		this.sceneAssistant.outputDisplay.innerHTML = $L("Text = ") + this.sceneAssistant.demoTextModel.value;
		this.widget.mojo.close();
	}
});


DialogsAssistant = Class.create( FLibExample, {
		
	setup: function() {
		
		//	Store references inside the assistant for later
		this.outputDisplay = this.controller.get('dialogs_outputDisplay');
		
		// Bind references once, ahead of time
		this.doPopup = this.doPopup.bind(this);
		this.doControllerDialog = this.doControllerDialog.bind(this);
		this.propertyChange = this.propertyChange.bind(this);
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Dialogs Demo',
			commandMenu: this.commandMenuModel
		});
		
		// Setup various widgets used as filler in the dialogues
	    this.controller.setupWidget('loremRating', this.loremAttributes, this.loremModel);
		this.controller.setupWidget('demoText', {}, this.demoTextModel);
		this.controller.setupWidget('truncUrl', this.urlAttributes, this.urlModel); 
		this.controller.setupWidget('truncTitle', this.titleAttributes, this.titleModel); 
			
		// Observe mojo-property-change events on our selector widgets:
		//	Remember to fill out this.cleanup to stop these listeners when popping the scene
		this.controller.listen('popup_alert_button', Mojo.Event.tap, this.doPopup);
		this.controller.listen('popup_dialog_button', Mojo.Event.tap, this.doControllerDialog);
	},
	cleanup: function(){
		this.controller.stopListening('popup_alert_button', Mojo.Event.tap, this.doPopup);
		this.controller.stopListening('popup_dialog_button', Mojo.Event.tap, this.doControllerDialog);
	},
	
	
	propertyChange: function() {
		this.doPopup();
	},
	
	// Handle menu commands as needed:
	handleCommand: function(event) {
		Mojo.Log.info(event);		
		if(event.type == Mojo.Event.command) {
			switch(event.command) {
				case 'do-alert':
					this.doAlert();
					break;
				case 'do-uncancellable-alert':
					this.doUncancellableAlert();
					break;
				case 'do-dialog':
					this.doDialog();
					break;
			}
		}
	},
	
	
	doAlert: function() {
	  this.controller.showAlertDialog(this.alertAttributes);
	},
	alertAttributes: {
		//	onChoose
		// Accepts the value of the selection made in the diologue
	    onChoose: function(value) {
			this.outputDisplay.innerHTML = $L("Alert result = ") + value;
		},
		
	    title: $L("Filet Mignon"),
	    message: $L("How would you like your steak done?"),
		
		//	Choices
		// sets of labels, associated values and button types (Green, Gray, Red, Light Gray respectively)
	    choices:[
        	{label:$L('Rare'), value:"rare", type:'affirmative'},  
	        {label:$L("Medium"), value:"medium"},
	        {label:$L("Overcooked"), value:"overcooked", type:'negative'},    
	        {label:$L("Nevermind"), value:"no steak", type:'dismiss'}    
	    ]
	},
	
	doUncancellableAlert: function() {
	  this.controller.showAlertDialog(this.uncancellableAlertAttributes);	  
	},
	uncancellableAlertAttributes: {
		//	preventCancel
		// requires the user to push a button to close the dialog, instead of being about to cancel out
	    preventCancel:true,
	
	    onChoose: function(value) {
			this.outputDisplay.innerHTML = $L("Alert result = ") + value;
		},
	    title: $L("Press 'Dismiss'"),
	    message: $L("This dialog is not cancellable."),
	    choices:[
        	{label: $L('Dismiss'), value:'dismissed', type:'color'}    
	    ]
	},
	
	
	doDialog: function() {
		this.controller.showDialog({
			template: 'dialogs/sample-dialog',
			assistant: new SampleTextAssistant(this),
			wisdom: randomLorem(),
			preventCancel:true
		});
	},
	
	doPopup: function(event) {
		var pushPopupScene = function(stageController) {
			stageController.pushScene('popup-alert')
		}
		Mojo.Controller.appController.createStageWithCallback({
			lightweight: true,
			name: "popup-alert",
			htmlFileName: "notification",
			height: 250},
		pushPopupScene, 'popupalert');
	},
	
	doControllerDialog: function(event) {
			Mojo.Controller.errorDialog("Lorem ipsum is the new goatee");
	},
	


	// This is the model object used by the list selector displayed in the lorem rating dialog.
	loremModel: {rating:3},
	loremAttributes: {
		property : 'rating',
		label: $L('Rating'),
		choices : [
			{label : $L('Inane'), value : 1},
			{label : $L('Innocuous'), value : 2},
			{label : $L('Inspired'), value : 3},
			{label : $L('Infuriating'), value : 4},
			{label : $L('Indignant'), value : 5},
			{label : $L('Indecent'), value : 6},
			{label : $L('Indecipherable and Unintelligibile'), value : 7},
			{label : $L('Indelible'), value : 8}
	]},
	
	demoTextModel:{
		value: 'Put Some Text In Me'
	},
	
	// This is the model object for the commandMenu widget (the 3 icons on the bottom)
	// 	It has no attributes...
	commandMenuModel: {items: [
		{icon:"refresh", command:'do-alert'},
		{icon:"new", command:'do-uncancellable-alert'},
		{icon:"search", command:'do-dialog'}]},
	
	// Url truncator attributes and model                                                  
	urlAttributes: {
		hintText: $L('enter URL'),
		property: 'original',
		multiline: false,       
		textFieldMode: 'sentence-case',
		limitResize: false,
		enterSubmits: false,
		tapHoldToEnable:true,
		focusMode: Mojo.Widget.focusSelectMode,
		disabledProperty: 'p'
	},
	urlModel: {
	        p: false,
	        'original': 'www.cnn.com'
	},
	
	titleAttributes: {
		hintText: $L('enter title'),
		property: 'original',
		multiline: false,       
		textFieldMode: 'sentence-case',
		limitResize: false,
		enterSubmits: false,
		tapHoldToEnable:true,
		focusMode: Mojo.Widget.focusSelectMode,
		disabledProperty: 'p'
	},
	titleModel: {
	        p: false,
	        'original': 'CNN News Headlines from Around the World'
	}
	
});



