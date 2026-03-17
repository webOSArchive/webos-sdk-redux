/*
	Demonstrates use of Mojo.Animation.animateStyle, used to fluidly change styles from one to the other
*/

PhotoanimationAssistant = Class.create({

	setup: function() {
		
		//	State Holder
		this.big=true;
		
		// Bind response handler once here, instead of repeatedly in each listener
		this.animate = this.animate.bind(this);
		this.customSetter = this.customSetter.bind(this);
		
		//	Find and store references before observing events on those elements
		this.button = this.controller.get('animButton');
		this.pic	= this.controller.get('testPhoto');
		
    
	// Events
	//	Use controller.listen() and remember to .stopListening() in .cleanup() until
	//	the framework is updated to do that for itself. Helps with memory management
		this.controller.listen(this.button, Mojo.Event.tap, this.animate);


	},

	animate:function(e) {

		//	Animation
		// Mojo.Animation.animateStyle( element, styleProperty, curveType, options )
		//
		// Try setting the curve types to all the same option. Do it for each to figure
		// out what they look like. Options include:
		//		linear, ease, ease-in, ease-out, ease-in-out, over-easy
		//
		// You can animate any numeric style on any element. 
			
		Mojo.Animation.animateStyle(this.pic, 'height', 'linear', {
				from:6,
					to: 200,
					duration: 0.65,
					curve:'over-easy', 
					reverse:this.big}
			);
		
		Mojo.Animation.animateStyle(this.pic, 'width', 'zeno', {
				from: 10,
					to: 320,
					duration: 0.65,
					curve:'ease-in', 
					reverse:this.big});

		Mojo.Animation.animateStyle(this.pic, 'top', 'bezier', {
				from: 380,
					to: 100,
					duration: 0.65,
					curve:'ease-out', 
					reverse:this.big});
		Mojo.Animation.animateStyle(this.pic, 'left', 'bezier', {
				from: 150,
					to: 0,
					duration: 0.65,
					curve:'ease', 
					reverse:this.big});



		Mojo.Animation.animateValue(window.Mojo.Animation.queue, 'bezier', this.customSetter, {
				from: 0,
					to: 150,
					duration: 0.65,
					curve:'ease', 
					reverse:this.big,});

		this.big = !this.big;

	},
	
	customSetter: function(value) {
		//  This is only here to demonstrate that you can have
		// the animator call a callback that does anything with the iterated value,
		// not just have it applied into the css in this way.
		
		this.button.innerHTML = "Animate ("+Math.round(value)+")";
	}


});
