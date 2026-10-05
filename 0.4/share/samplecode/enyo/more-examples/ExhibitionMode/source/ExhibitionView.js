enyo.kind({
   name:"ExhibitionView",
   kind:"VFlexBox",
   components:[
      {kind: "ApplicationEvents", onLoad:"onload", onUnload:"unload"},
      {kind:"Control", flex:1, style:"background-color:red",content:"This is the exhibition view"},
   ],
   onload:function(){
//      this.log();
   },
   unload:function(){
      this.log();
      var winRoot = enyo.windows.getRootWindow();
      if(winRoot)
      {
         enyo.windows.setWindowParams(winRoot, {source:this.name, cmd: "unload"});
      }
   }
})