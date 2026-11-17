/*
	This example demonstrates how the framework notifies applications of changes in the device's orientation.
	
	.orientationChanged is called automatically and passed a string (up/down/left/right) depending on the 
	new orientation. The normal orienation is "up".
*/

OrientationAssistant = Class.create( FLibExample, {
	
	setup: function() {
		
		// Set up view menu with scene header
		this.setupMenus({
			header: 'Orientation'
		});
		
		// Store References for later
		this.canvas = this.controller.get('tsu-canvas');
		this.tsuImage = new Image();
		this.tsuImage.src = "images/this-side-up.png";
		this.tsuImage.onload = this.drawImage.bind(this);

	},
	
	//	orientationChanged
	// The framework calls .orientationChanged() automatically when needed, and passes in up/down/left/right
	orientationChanged: function (orientation) {
		this.orientation = orientation;
		this.angle = this.angles[this.orientation];
		this.drawImage();
	},
	
	// Degrees to rotate image inside canvas tag, to correlate with new orientation
	angles: {
		up: 0,
		left: Math.PI * 3 / 2,
		down: Math.PI,
		right: Math.PI/2
	},
	drawImage: function() {
		var context = this.canvas.getContext("2d");
	    context.clearRect(0,0,300,300);
	    context.save();
	    context.translate(150, 150);
	
	// Rotate image according to the orientation given to .orientationChanged()
		context.rotate(this.angle || 0);
		
		context.drawImage(this.tsuImage, -100, -100, 200, 200);
		context.restore();
	},
	
});