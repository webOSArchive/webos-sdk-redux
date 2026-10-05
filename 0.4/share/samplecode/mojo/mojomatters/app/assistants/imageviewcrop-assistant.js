/*
	The imageViewCropper widget  shows a scale- and pan-able image under a crop border with a button to perform 
	the crop. 
*/

ImageviewcropAssistant = Class.create( FLibExample, {
	initialize : function()
	{
		// Nothing to do here
	},

	setup : function()
	{
		// Bind event handlers once, ahead of time
		this.doCropMethod = this.doCropMethod.bind(this);

		// Store references to reduce the use of controller.get()
		this.cropper = this.controller.get('cropper');
		
		var attrs =
		{
			source: 'images/010421-1106-44.jpg',
			text: 'crop this!',
			width: 150,
			height: 150,
			callback: this.doCropMethod
		};
		
		// Oddly enough, we need both pairs
		this.cropper.width = window.innerWidth;
		this.cropper.height = window.innerHeight;
		this.cropper.style.width = window.innerWidth + "px";
		this.cropper.style.height = window.innerHeight + "px";

		// Setup a widget
		this.controller.setupWidget('cropper', attrs, null);
	},

	doCropMethod : function(cropParams, fullCropParams)
	{

		Mojo.Log.info("Suggested: " + Object.toJSON(cropParams));
		Mojo.Log.info("Overall: " + Object.toJSON(fullCropParams));
	},

});

