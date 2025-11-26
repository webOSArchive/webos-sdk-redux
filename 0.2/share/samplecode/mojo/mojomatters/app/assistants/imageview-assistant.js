/*
	This example uses a single imageviewer widget with a cached set of images and some tweaks 
	so that the images carouselle around instead of bumping against the 'wall' when you reach 
	the ones on the edges. 
	
	Remote images can be used simply by providing a remote url to the .mojo.rightUrlProvided and
	.mojo.leftUrlProvided methods of the widget.
	
	If the imageViewer doesn't have an image passed to it to show on the left or right side,
	then scrolling in that direction will bump against the wall. This also happens if the image
	hasn't finished loading yet, so it's a good idea to preload a good number of the image on
	either side. 
*/

ImageviewAssistant = Class.create( FLibExample, {
	initialize : function()
	{
	},

	setup : function()
	{
		// Setup Header and commandMenu
		this.setupMenus({
			header: "The Image Viewer"
		});
		
		//	Bind response handlers
		this.leftHandler = this.leftHandler.bind(this);
		this.rightHandler = this.rightHandler.bind(this);
		
		//	Store references for later
		this.cakeViewer = this.controller.get('imageViewer');
		this.captionDiv = this.controller.get('caption');

		// Setup and instantiate the image viewer
		this.viewerAttributes= {
			//	noExtractFS and highResolutionLoadTimeout
			// This combination of attributes will conflict.
			//
			// The widget would wait 3 second before loading the full size image,
			// but won't do anything since noExtractFS is true, skipping the full size image
			noExtractFS : true,
			highResolutionLoadTimeout: 3,
			limitZoom: true
		};
		this.viewerModel= {
			onLeftFunction: this.leftHandler,
			onRightFunction: this.rightHandler
		};
		this.controller.setupWidget('imageViewer', this.viewerAttributes, this.viewerModel);
	},
	
	//	ready!
	// The .mojo methods (like manualSize) are not available until the widgets are instantiated which
	// doesn't happen until after the setup method is finished. ready() is called after this is done,
	// once the .mojo methods are available
	ready: function(){
		this.cakeViewer.mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight/2);
	},
	
	cakes:[
		// because cake is the best
		'./images/cake1.jpg',
		'./images/cake2.jpg',
		'./images/cake3.jpg',
		'./images/cake4.jpg'
	],
	captions: [
		'',
		'',
		'I want to eat this one so bad :(',
		''
	],
	
	// 	These are called after the user flicks one way or the other to a new image
	// When the three images held in the widgets cache are moved to the side, one on the end is 
	// dropped off. These functions are then called so you can left/right/centerUrlProvided a new
	// image URL to the widget to use in that position. 
	leftHandler: function(){
		this.movePhotoIndex('left');
		this.cakeViewer.mojo.leftUrlProvided(this.getUrlForThe('left'));
	},
	rightHandler: function(){
		this.movePhotoIndex('right');
		this.cakeViewer.mojo.rightUrlProvided(this.getUrlForThe('right'));
	},
	
	// Used to recognize and record a change in the widgets 'position' in our set of images
	curPhotoIndex: 1,
	positionDelta: {
		left: -1,
		center: 0,
		right: 1
	},
	movePhotoIndex: function( direction ){
		this.curPhotoIndex = this.curPhotoIndex + this.positionDelta[direction];
		
		//	Wrap around edges
		if(this.curPhotoIndex > this.cakes.length-1 || this.curPhotoIndex < 1) {	
			this.curPhotoIndex = this.wrapAroundMarioStyle( this.curPhotoIndex, this.cakes.length );
		}
		
		this.captionDiv.innerHTML = this.captions[this.curPhotoIndex] || "";
			
	},
	getUrlForThe: function( position ){
		var urlIndex;
		urlIndex = this.curPhotoIndex + this.positionDelta[position];
		
		//	reach around edges
		if(urlIndex > this.cakes.length-1 || urlIndex < 0) {	
			urlIndex = this.wrapAroundMarioStyle( urlIndex, this.cakes.length ); 
		}
			
		return this.cakes[urlIndex];
	},
	wrapAroundMarioStyle: function( index, max ){
		return Math.abs( Math.abs( index ) - max );
	},
	
	
	activate : function()
	{
		this.cakeViewer.mojo.centerUrlProvided(this.getUrlForThe('center'));
		this.cakeViewer.mojo.leftUrlProvided(this.getUrlForThe('left'));
		this.cakeViewer.mojo.rightUrlProvided(this.getUrlForThe('right'));
	}


});

