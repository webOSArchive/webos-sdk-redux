enyo.kind({
   name: "system.SystemSounds",
   kind: HeaderView, 
   sound: "appclose",
   components: [
      {
         content: "Pick a sound: "
      },
      {
         name: "soundPicker",
         kind: "Picker",
         onChange: "soundPicked",
         value: "appclose",
         items: [
            {caption: "appclose", value: "appclose"},
            {caption: "back_01", value: "back_01"},
            {caption: "browser_01", value: "browser_01"},
            {caption: "card_01", value: "card_01"},
            {caption: "card_02", value: "card_02"},
            {caption: "card_03", value: "card_03"},
            {caption: "card_04", value: "card_04"},
            {caption: "card_05", value: "card_05"},
            {caption: "default_425hz", value: "default_425hz"},
            {caption: "delete_01", value: "delete_01"},
            {caption: "discardingapp_01", value: "discardingapp_01"},
            {caption: "down2", value: "down2"},
            {caption: "dtmf_0", value: "dtmf_0"},
            {caption: "dtmf_1", value: "dtmf_1"},
            {caption: "dtmf_2", value: "dtmf_2"},
            {caption: "dtmf_3", value: "dtmf_3"},
            {caption: "dtmf_4", value: "dtmf_4"},
            {caption: "dtmf_5", value: "dtmf_5"},
            {caption: "dtmf_6", value: "dtmf_6"},
            {caption: "dtmf_7", value: "dtmf_7"},
            {caption: "dtmf_8", value: "dtmf_8"},
            {caption: "dtmf_9", value: "dtmf_9"},
            {caption: "dtmf_asterisk", value: "dtmf_asterisk"},
            {caption: "dtmf_pound", value: "dtmf_pound"},
            {caption: "error_01", value: "error_01"},
            {caption: "error_02", value: "error_02"},
            {caption: "error_03", value: "error_03"},
            {caption: "focusing", value: "focusing"},
            {caption: "launch_01", value: "launch_01"},
            {caption: "launch_02", value: "launch_02"},
            {caption: "launch_03", value: "launch_03"},
            {caption: "pagebacwards", value: "pagebacwards"},
            {caption: "pageforward_01", value: "pageforward_01"},
            {caption: "shuffle_02", value: "shuffle_02"},
            {caption: "shuffle_03", value: "shuffle_03"},
            {caption: "shuffle_04", value: "shuffle_04"},
            {caption: "shuffle_05", value: "shuffle_05"},
            {caption: "shuffle_06", value: "shuffle_06"},
            {caption: "shuffle_07", value: "shuffle_07"},
            {caption: "shuffle_08", value: "shuffle_08"},
            {caption: "shuffling_01", value: "shuffling_01"},
            {caption: "shutter", value: "shutter"},
            {caption: "switchingapps_01", value: "switchingapps_01"},
            {caption: "switchingapps_02", value: "switchingapps_02"},
            {caption: "switchingapps_03", value: "switchingapps_03"},
            {caption: "tones_3beeps_otasp_done", value: "tones_3beeps_otasp_done"},
            {caption: "unassigned", value: "unassigned"},
            {caption: "up2", value: "up2"},
            {caption: "non_existant_sound", value: "non_existant_sound"}
         ]
      },
       // Get location button
      {
         name: "playSoundButton",
         kind: "Button",
         caption: "Play System Sound",
         onclick: "playSound"
      },
      {
         components: [
            {
               content: "System Sounds response:"
            },
            {
               name: "responseContainer",
               style: "word-wrap: break-word;"
            },
         ]
      },
      // System Sound service
      {
         name: "systemSound",
         kind: "PalmService",
         service: "palm://com.palm.audio/systemsounds",
         onSuccess: "onSuccess",
         onFailure: "onFailure",
         method: "playFeedback"
      }
   ], 
   // End Components
   
   playSound: function(inSender) {
      this.$.systemSound.call(
         {
            name: this.sound
         },
         {}
      );
   },
   soundPicked: function(inSender) {
      this.sound = this.$.soundPicker.getValue();
   },
   onSuccess: function(inSender, inResponse) {
      console.log("success: " + enyo.json.stringify(inResponse));
      this.$.responseContainer.setContent(enyo.json.stringify(inResponse));
   },
   onFailure: function(inSender, inResponse) {
      console.log("failure: " + enyo.json.stringify(inResponse));
      this.$.responseContainer.setContent("error: " + enyo.json.stringify(inResponse));
   },
});
