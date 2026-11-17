enyo.kind({
   name: "system.AlarmAlert",
   kind: "Popup",
   components: [
      {
         content: "Here is your alarm!"
      },
      {
         name: "closePopupButton",
         kind: "Button",
         caption: "OK",
         onclick: "closePopup"
      } 
   ],
   // End Components
   constructor: function() {
      console.log("alarm alert");
      this.open();
   },
   handleLaunch: function() {
      console.log("alarm alert launch");
      this.open();
   },
   closeDialog: function() {
      this.close();
   }
});
