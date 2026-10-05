function SystemSoundsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

SystemSoundsAssistant.prototype.setup = function () {
	
	this.soundSelectorAttributes = {
        choices: [
            {label: "appclose", value: "appclose"},
            {label: "back_01", value: "back_01"},
            {label: "browser_01", value: "browser_01"},
            {label: "card_01", value: "card_01"},
            {label: "card_02", value: "card_02"},
            {label: "card_03", value: "card_03"},
            {label: "card_04", value: "card_04"},
            {label: "card_05", value: "card_05"},
            {label: "default_425hz", value: "default_425hz"},
            {label: "delete_01", value: "delete_01"},
            {label: "discardingapp_01", value: "discardingapp_01"},
            {label: "down2", value: "down2"},
            {label: "dtmf_0", value: "dtmf_0"},
            {label: "dtmf_1", value: "dtmf_1"},
            {label: "dtmf_2", value: "dtmf_2"},
            {label: "dtmf_3", value: "dtmf_3"},
            {label: "dtmf_4", value: "dtmf_4"},
            {label: "dtmf_5", value: "dtmf_5"},
            {label: "dtmf_6", value: "dtmf_6"},
            {label: "dtmf_7", value: "dtmf_7"},
            {label: "dtmf_8", value: "dtmf_8"},
            {label: "dtmf_9", value: "dtmf_9"},
            {label: "dtmf_asterisk", value: "dtmf_asterisk"},
            {label: "dtmf_pound", value: "dtmf_pound"},
            {label: "error_01", value: "error_01"},
            {label: "error_02", value: "error_02"},
            {label: "error_03", value: "error_03"},
            {label: "focusing", value: "focusing"},
            {label: "launch_01", value: "launch_01"},
            {label: "launch_02", value: "launch_02"},
            {label: "launch_03", value: "launch_03"},
            {label: "pagebacwards", value: "pagebacwards"},
            {label: "pageforward_01", value: "pageforward_01"},
            {label: "shuffle_02", value: "shuffle_02"},
            {label: "shuffle_03", value: "shuffle_03"},
            {label: "shuffle_04", value: "shuffle_04"},
            {label: "shuffle_05", value: "shuffle_05"},
            {label: "shuffle_06", value: "shuffle_06"},
            {label: "shuffle_07", value: "shuffle_07"},
            {label: "shuffle_08", value: "shuffle_08"},
            {label: "shuffling_01", value: "shuffling_01"},
            {label: "shutter", value: "shutter"},
            {label: "switchingapps_01", value: "switchingapps_01"},
            {label: "switchingapps_02", value: "switchingapps_02"},
            {label: "switchingapps_03", value: "switchingapps_03"},
            {label: "tones_3beeps_otasp_done", value: "tones_3beeps_otasp_done"},
            {label: "unassigned", value: "unassigned"},
            {label: "up2", value: "up2"},
            {label: "non_existant_sound", value: "non_existant_sound"}
        ]
	};
    this.soundSelectorModel = {
		value: '...touch for list',
        disabled: false
    };
	this.controller.setupWidget('soundSelector', this.soundSelectorAttributes, this.soundSelectorModel);
	this.controller.listen($('sounds_button'), Mojo.Event.tap, this.handleButtonPressed.bind(this));
};

// Launch Messaging app with pre-filled text
SystemSoundsAssistant.prototype.handleButtonPressed = function () {
	this.controller.serviceRequest('palm://com.palm.audio/systemsounds', {
	    method: "playFeedback",
	    parameters: {name: this.soundSelectorModel.value},
	    onSuccess: this.handleOKResponse.bind(this),
	    onFailure: this.handleErrResponse.bind(this)
	});
};

SystemSoundsAssistant.prototype.handleOKResponse = function (response) {
	this.controller.get('area-to-update').update("System Sounds response: <br><br>" + Object.toJSON(response));																	 
};

SystemSoundsAssistant.prototype.handleErrResponse = function (response) {
	this.controller.get('area-to-update').update("Error service response: <br><br>" + Object.toJSON(response));																		 
};

SystemSoundsAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

};


SystemSoundsAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening($('sounds_button'), Mojo.Event.tap, this.handleButtonPressed.bind(this));
};

SystemSoundsAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('sounds_button'), Mojo.Event.tap, this.handleButtonPressed.bind(this));
};
