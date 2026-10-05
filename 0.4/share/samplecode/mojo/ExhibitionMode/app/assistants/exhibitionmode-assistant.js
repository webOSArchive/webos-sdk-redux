
var step = 1;
var delay = 30;
var height = 0;
var Hoffset = 0;
var Woffset = 0;
var yon = 0;
var xon = 0;
var pause = true;
var yPos = 0;
var xPos = 0;


function ExhibitionmodeAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

ExhibitionmodeAssistant.prototype.setup = function() {
	
	this.img = this.controller.get('img');
	this.interval =  this.controller.window.setInterval(this.changePos.bind(this),30);
};
ExhibitionmodeAssistant.prototype.changePos = function (){
		
	height = this.controller.window.innerHeight;
	width = this.controller.window.innerWidth;
	Hoffset = 60;
	Woffset = 61;

	this.img.style.top=yPos + this.controller.window.pageYOffset + 'px';
	this.img.style.left=xPos + this.controller.window.pageXOffset + 'px';
	
	if (yon) {
		yPos = yPos + step;
	}
	else {
		yPos = yPos - step;
	}
	if (yPos < 0) {
		yon = 1;
		yPos = 0;
	}
	if (yPos >= (height - Hoffset)) {
		yon = 0;
		yPos = (height - Hoffset);
	}
	if (xon) {
		xPos = xPos + step;
	}
	else {
		xPos = xPos - step;
	}
	if (xPos < 0) {
		xon = 1;
		xPos = 0;
	}
	if (xPos >= (width - Woffset)) {
		xon = 0;
		xPos = (width - Woffset);
	}
}   
	


ExhibitionmodeAssistant.prototype.activate = function(event) {
	this.controller.get('scene').style.backgroundColor = "black";
};

