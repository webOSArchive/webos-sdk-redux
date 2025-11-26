enyo.kind({
   name:"AppView",
   kind:"VFlexBox",
   components:[
      {kind: "ApplicationEvents", onLoad:"onload", onUnload:"unload"},
      {kind:"Control", flex:1, content:"This is the app view"},
      {kind:"Button", caption:"Do Nothing", onclick:"buttonClick"}
   ],
   buttonClick:function(){
      window.close();
   },
   onload:function(){
      this.log();
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