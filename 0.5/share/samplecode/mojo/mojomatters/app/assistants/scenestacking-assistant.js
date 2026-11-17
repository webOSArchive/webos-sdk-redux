/*
Demonstrates stacking the same scene up multiple times in a (relatively) safe manner,
and also how to pop multiple scenes using the popScenesTo() method on the stage controller.
*/

ScenestackingAssistant = Class.create( FLibExample, {
	initialize: function(nestingLevel, parentController) {
		if(nestingLevel == undefined)
		this.nestingLevel = 1;
		else
		this.nestingLevel = nestingLevel;

		this.parentController = parentController;
	},

	setup: function() {

		var sceneElement = this.controller.sceneElement;
		var nestingLevel = this.nestingLevel;
		var i, buttons;
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Scene Stacking/Unstacking'
		});
		
		this.name = sceneElement.id;
		
		// Set a label to show the depth of our scene stacking:
		// It's likely not safe to use $(), since there could be multiple instances of this scene that are alive in the stack
		// So we search only underneath our scene div, and look for the name attribute:
		this.controller.sceneElement.querySelector('div[name=nestingLevel]').innerHTML = $L("Scene stack level ") + nestingLevel;

		// Hook up click handlers to the buttons:
		// Since we can't identify them by ID, we just assign ther behaviors in document-order.
		this.buttons = this.controller.select('div');
		
		// bind event handlers ahead of time
		this.pushScene = this.pushScene.bind(this);
		this.basicPopScene = this.basicPopScene.bind(this);
		this.popTwoBack = this.popTwoBack.bind(this);
		this.basicPopScene = this.basicPopScene.bind(this);
		this.popTwoBack = this.popTwoBack.bind(this);
		this.popToID = this.popToID.bind(this);
		this.popToList = this.popToList.bind(this);
		
		
		var thisButtonsHandler;
		for(i=0; i<this.buttons.length; i++) {
			if(this.buttons[i].hasAttribute('x-mojo-scenestacking-handler')) {
				thisButtonsHandler = this.buttons[i].getAttribute('x-mojo-scenestacking-handler');
				this.controller.listen(this.buttons[i], Mojo.Event.tap, this[thisButtonsHandler]);
			}
		}
		
		if(this.parentController){
			this.twoBack = this.parentController.assistant.parentController;
		}
		
		
	},
	
	pushScene: function() {
		//	pushScene
		// Basic command adds new scene to the stack. First argument is the name of the 
		// scene, or an object with name and ID of scene. Any other arguments are passed to the contructor
		// of the new scene
		this.controller.stageController.pushScene({
				name:'scenestacking', 
				id:'scenestacking-'+(this.nestingLevel+1)
			}, 
			this.nestingLevel+1, 
			this.controller
		);
	},
	basicPopScene: function() {
		//	popScene
		// Pops a single scene from the stack, passing any arguments to the .activate()
		// method on the newly-activated scene
		this.controller.stageController.popScene("We've popped from scenestacking-"+this.nestingLevel+" to "+(this.nestingLevel-1));
		Mojo.log('pop returned');
	},
	popTwoBack: function() {
		if(this.nestingLevel <= 2)
			this.controller.showAlertDialog({
				title: "Can't Pop 2 Off",
				message: 'Push more than 2 scenes on before trying to pop 2 off',
				choices: [{label:$L('Cool, thx'), value:"ok", type:'affirmative'}]
			});
	 	else 
			this.controller.stageController.popScenesTo(this.twoBack, {
				parameters: 'can be passed as objects!',
				message: 'Lots of stuff can be passed between scenes through the popScene functions'
			});
		
		
	},
	popToID: function() {
		if(this.nestingLevel < 3)
			this.controller.showAlertDialog({
				title: "Can't Pop to #scenestacking-2",
				message: 'Must be on at least #scenestacking-3 first. Currently on #scenestacking-'+this.nestingLevel+'. Push more scenes.',
				choices: [{label:$L('Cool, thx'), value:"ok", type:'affirmative'}]
			});
	 	else 
			this.controller.stageController.popScenesTo('scenestacking-2');
			
		Mojo.Log.info('pop returned');
	},
	popToList: function() {
		this.controller.stageController.popScenesTo('list');
		Mojo.Log.info('pop returned');
	},
	
	
	
	cleanup: function() {
		// Stop listening to key events in cleanup
		
		// In this particular case, we iterate through each button the way we did in setup
		var thisButtonsHandler;
		for(i=0; i<this.buttons.length; i++) {
			if(this.buttons[i].hasAttribute('x-mojo-scenestacking-handler')) {
				thisButtonsHandler = this.buttons[i].getAttribute('x-mojo-scenestacking-handler');
				this.controller.stopListening(this.buttons[i], Mojo.Event.tap, this[thisButtonsHandler]);
			}
		}
	},
	
	activate: function(returnValue) {
		Mojo.Log.info("ScenestackingAssistant#activate: id="+this.name);
		if (returnValue) {
			if(returnValue.message)
				this.controller.update('scene-stacking-info-text', returnValue.message);
			else
				this.controller.update('scene-stacking-info-text', returnValue);
		}
	},
	
	deactivate: function() {
		Mojo.Log.info("ScenestackingAssistant#deactivate: id="+this.name);
	}

});


