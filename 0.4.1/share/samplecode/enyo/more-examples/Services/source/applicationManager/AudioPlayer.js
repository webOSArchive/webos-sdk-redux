enyo.kind({
   name: "applicationManager.AudioPlayer",
   kind: HeaderView,
   components: [
      {name: "openAudioAppButton", kind: "Button", caption: "Open Audio App", onclick: "openAudioApp"},
      {name: "launchAudioAppButton", kind: "Button", caption: "Launch Audio App", onclick: "launchAudioApp"},
      {name: "audioApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", onSuccess: "success", onFailure: "failure"}
   ],
   openAudioApp: function() {
      this.$.audioApp.call(
         {target: "/media/internal/ringtone/Flurry.mp3"},
         {method: "open"}
      );
   },
   launchAudioApp: function() {
      this.$.audioApp.call(
         {
            id: "com.palm.app.streamingmusicplayer",
            params: {
               target: "/media/internal/ringtone/Guitar.mp3"
            }
         },
         {
            method: "launch"
         }
      );
   },
   success: function(inSender, inResponse) {
      console.log("success:" + enyo.json.stringify(inResponse));
   },
   failure: function(inSender, inResponse) {
      console.log("failure:" + enyo.json.stringify(inResponse));
   }
});
