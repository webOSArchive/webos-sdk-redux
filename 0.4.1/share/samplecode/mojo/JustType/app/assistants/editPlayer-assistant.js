function EditPlayerAssistant(args){
	/* this is the creator function for your scene assistant object. It will be passed all the 
	 additional parameters (after the scene name) that were passed to pushScene. The reference
	 to the scene controller (this.controller) has not be established yet, so any initialization
	 that needs the scene controller should be done in the setup function below. */
	//If a player was tapped on from the list we will have a playerID
	if(args.playerId)
		this.playerInfo = args.playerId;
	else
		this.playerInfo = {};
	// If we can straight to this scene from the splash we can't just pop when we're done, we need to swap
	this.noPreviousScene = args.uSearch;
	this.AppDB = args.Appdb;
	// If we came into the app from the quick action to add a new player we need to set the firstname of the player to
	// the text entered into just type
	if (args.newPlayer) 
		this.playerInfo.firstname = args.newPlayer;
}

EditPlayerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	if (this.playerInfo) {
		this.doCommand = 'do-save'
		this.controller.get('list-header').innerText = 'Squad Player';
	}
	else {
		this.doCommand = 'do-add'
		this.playerInfo = {
			_kind: "com.palmdts.db8sample:1",
			"name": '',
			"position": '',
			"height": '',
			"weight": '',
			"DOB": new Date(),
			"Hometown": '',
			"Club": ''
		}
	}
	this.controller.setupWidget(Mojo.Menu.commandMenu,
	    {
	        spacerHeight: 0,
	        menuClass: 'no-fade'
	    },
	    {
	        visible: true,
	        items: [ 
	            { icon: "save", command: this.doCommand}
	        ]
	    }
	);
	this.player = {}
	this.controller.setupWidget("fnameId",
         {
            hintText: $L("... FirstName"),
            multiline: false,
            enterSubmits: false,
            focus: true,
			modifierState :Mojo.Widget.shiftSingle 
         },
         this.player.fNameModel = {
             value: this.playerInfo.firstname,
             disabled: false
         }
    );
	
	this.controller.setupWidget("lnameId",
         {
            hintText: $L("...LastName"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			modifierState :Mojo.Widget.shiftSingle 
         },
         this.player.lNameModel = {
             value: this.playerInfo.lastname,
             disabled: false
         }
    );
	
	this.controller.setupWidget("positionId",
        {
            label:"Position",
			choices: [
                {label: "GoalKeeper", value: 'GoalKeeper'},
                {label: "Defender", value: 'Defender'},
                {label: "Midfielder", value: 'Midfielder'},
				{label: "Forward", value: 'Forward'}
            ]},
        this.player.positionModel = {
            disabled: false,
			value : this.playerInfo.position
        }
    );
	this.controller.setupWidget("heightId",
        {
            label :'Height',
			choices: [
                {label: "5-5", value: '5-5'},
                {label: "5-6", value: '5-6'},
                {label: "5-7", value: '5-7'},
				{label: "5-8", value: '5-8'},
				{label: "5-9", value: '5-9'},
				{label: "5-10", value: '5-10'},
				{label: "5-11", value: '5-11'},
				{label: "6-0", value: '6-0'},
				{label: "6-1", value: '6-1'},
				{label: "6-2", value: '6-2'},
				{label: "6-3", value: '6-3'},
				{label: "6-4", value: '6-4'},
				{label: "6-5", value: '6-5'}
            ]},
        this.player.heightModel = {
            disabled: false,
			value : this.playerInfo.height
        }
    );
	this.controller.setupWidget("weightId",
	    {
	        label :'Weight',
				choices: [
				{label: "140", value: '140'},
                {label: "150", value: '150'},
                {label: "160", value: '160'},
				{label: "170", value: '170'},
				{label: "180", value: '180'},
				{label: "190", value: '190'},
				{label: "200", value: '200'},
				{label: "210", value: '210'},
				{label: "220", value: '220'},
				{label: "230", value: '230'},
				{label: "240", value: '240'},
				{label: "250", value: '250'},
				{label: "260", value: '260'}
				]
	    },
	    this.player.weightModel = {
	        disabled: false,
			value : this.playerInfo.weight
	    }
	);
	var todayDate = new Date(this.playerInfo.DOB);
	//todayDate.setFullYear(1980)
    this.controller.setupWidget("dobId",
        {
             label: 'DOB',
			 labelPlacement : Mojo.Widget.labelPlacementRight,
			 month : true,
			 day : true,
			 year : true,
             maxYear : 2010,
			 minYear : 1970
        },
        this.player.dobModel = {
            date:  todayDate
        }
    );
	this.controller.setupWidget("homeTownId",
        {
            hintText: $L("...Hometown"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			modifierState :Mojo.Widget.shiftSingle 
         },
         this.player.hometownModel = {
             value: this.playerInfo.Hometown,
             disabled: false
         }
    );
	this.controller.setupWidget("clubId",
        {
            hintText: $L("...Club or College"),
            multiline: false,
            enterSubmits: false,
            focus: false,
			modifierState :Mojo.Widget.shiftSingle 
         },
         this.player.ClubModel = {
             value: this.playerInfo.Club,
             disabled: false
         }
    );
};
EditPlayerAssistant.prototype.handleCommand = function(event) {
    if (event.type === Mojo.Event.command) {
        dob = this.player.dobModel.date
		dob = dob.getMonth()+1 + "/" + dob.getDate() +"/" + dob.getFullYear()
		if(!this.player.fNameModel.value || !this.player.lNameModel.value || !this.player.positionModel.value || !this.player.heightModel.value || !this.player.weightModel.value ||
			!this.player.hometownModel.value|| !this.player.ClubModel.value){
			Mojo.Controller.errorDialog("Please fill in all fields."); 
		}else{
			this.playerInfoDB ={
				_kind:"com.palmdts.db8sample:1",
				"firstname": this.player.fNameModel.value.toLocaleLowerCase(),
				"lastname": this.player.lNameModel.value.toLocaleLowerCase(),
				"position":this.player.positionModel.value,
				"height":this.player.heightModel.value,
				"weight":this.player.weightModel.value,
				"DOB":dob,
				"Hometown":this.player.hometownModel.value,
				"Club":this.player.ClubModel.value
			}
			Mojo.Log.info('********************' + JSON.stringify(this.playerInfoDB))
			switch (event.command) {
	            case  'do-add' :
					this.AppDB.add(this.playerInfoDB)
				break;
				case 'do-save':
					this.playerInfoDB._id = this.playerInfo._id
					Mojo.Log.info("PLAYER INFO " + JSON.stringify(this.playerInfoDB))
					this.AppDB.update(this.playerInfoDB)
				break;
	        }
			MainAssistant.prototype.refreshList = true;
			this.controller.stageController.popScene();
		}
    }else if(event.type === Mojo.Event.back){
		if (this.noPreviousScene) {
			this.controller.stageController.swapScene('first', {
				searchString: '',
				Appdb: this.AppDB
			});
			event.stop();
		}
	}
}
EditPlayerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

EditPlayerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

EditPlayerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
