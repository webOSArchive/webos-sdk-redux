var HelloCommandAssistant = function(){
}
  
HelloCommandAssistant.prototype.run = function(future) {  
   future.result = { reply: "Hello " + this.controller.args.name + '!' };
}