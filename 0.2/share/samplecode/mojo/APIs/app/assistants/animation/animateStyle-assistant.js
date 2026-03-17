function AnimateStyleAssistant() {
	// set up variable to change when card is minimized to stop animation
	this.stop = false;
	// pre-cache the event handlers for performance and memory reasons
	this.stopAnimatingHandler = this.stopAnimating.bind(this);
	this.animateButtonHandler = this.animateButton.bind(this);
}

AnimateStyleAssistant.prototype.setup = function() {	
	this.tickerInfo = this.controller.get('tickerMessage');
	this.controller.listen('animateButton',Mojo.Event.tap, this.animateButtonHandler);
    // Watch for the card being minimized to stop the animation 
	// (otherwise it's unnecessarily using memory and CPU cycles).
	Mojo.Event.listen(this.controller.stageController.document,
    	Mojo.Event.stageDeactivate,
    	this.stopAnimatingHandler,
    	true
	);
}

AnimateStyleAssistant.prototype.animateButton =function(e) {
	this.stop = false;
	var message = 'This is a long string........................................with nothing interesting' +
	'**************THE END*****************';
	this.doAnimation(message,4); //speedLevel goes from 1(slowest) to 7(fastest)				
}

//Pass a string to display & the speedLevel.  Speed adjustment goes from 1(slowest) to 7(fastest).
AnimateStyleAssistant.prototype.doAnimation = function(message, speedLevel) {
	
	this.tickerInfo.innerText = message;
	
	//adjust the speed level to an Animation class related factor 
	switch (speedLevel)
	{
		case 1: speedLevel = 10; break;
		case 2: speedLevel = 5; break;
		case 3: speedLevel = 1; break;
		case 4: speedLevel = .75; break;
		case 5: speedLevel = .5; break;
		case 6: speedLevel = .25; break;
		case 7: speedLevel = .1; break;
		default: speedLevel = 1; break;
	}
	
	/* This is the size to grow the div to(must grow to show all the text & 
	 * seems we can't just initially set it to a large value since it messes with
	 * the scene layout(although perhaps there's a css tag to handle this - if
	 * so then the width growing animations can be disposed of))
	*/
	//Note - these value computations are hacky - they seem to work in general, but
	//       a more formal algorithm or solid testing of various string lengths is recommended.
	
	//how wide to grow the div	
    toWidth = message.length*10;
	//duration for growing the width.
	widthGrowDuration = speedLevel*message.length/100;
	//how far to move the div to the left.
	toLeft = -(message.length*10);  
	//duration for moving the div to the left.
	leftShrinkDuration = speedLevel*message.length/10; 
	
	//Call this function to start circling the message around.
	this.doCircularTicker(toWidth,widthGrowDuration,toLeft,leftShrinkDuration);
}

AnimateStyleAssistant.prototype.doCircularTicker = function (toWidth,widthGrowDuration,toLeft,leftShrinkDuration)
{
	var that = this;
	//reset the message's left & width properties so that it's back offscreen to the right
	this.tickerInfo.style.left = "300px";
	this.tickerInfo.style.width = "0px";
	
	//grow the width property so that it gets big enough to display the full message
    Mojo.Animation.animateStyle(this.tickerInfo, 'width', 'linear', {
                from: 0,
                to: toWidth,
                duration: widthGrowDuration});                   
				                                
	//decrease the left property so that the message appears to be moving to the left &
	//call us again when the ticker message has gone off the left side of the screen
    Mojo.Animation.animateStyle(this.tickerInfo, 'left', 'linear', {
                from: 300,
                to: toLeft,
                duration: leftShrinkDuration,
					onComplete: function(){
					if (!that.stop) {
						that.doCircularTicker(toWidth, widthGrowDuration, toLeft, leftShrinkDuration);
					}
				}
	});      
}

AnimateStyleAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}

AnimateStyleAssistant.prototype.stopAnimating = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  this.stop = true;

}

AnimateStyleAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */

}

AnimateStyleAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('animateButton',Mojo.Event.tap, this.animateButtonHandler);
	Mojo.Event.stopListening(this.controller.stageController.document,
    	Mojo.Event.stageDeactivate,
    	this.stopAnimatingHandler,
    	true
	);
}