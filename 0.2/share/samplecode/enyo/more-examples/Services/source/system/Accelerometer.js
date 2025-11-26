enyo.kind({
   name: "system.Accelerometer",
   kind: HeaderView, 
   components: [
      {
         components: [
            {
               content: "Accelerometer Data:"
            },
            {
               name: "rotationContainer",
               style: "word-wrap: break-word;"
            },
            {
               name: "shakeContainer",
               style: "word-wrap: break-word;"
            }
         ]
      },
      {
         kind: "ApplicationEvents",
         onWindowRotated: "onWindowRotated"
      }
   ], 
   // End Components
});
