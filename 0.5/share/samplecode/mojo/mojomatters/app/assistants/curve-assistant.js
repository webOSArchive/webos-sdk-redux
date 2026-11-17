
/*
	Hidden test scene for visualization of curves used for animation.
*/

CurveAssistant = Class.create({



	setup: function() {

		// Set up view menu with scene header
		this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [{label: $L("Widgets » Curve Workshop")}, {}]});

		// Hook up the pre-defined curve buttons:
//		this.controller.listen('plotButton', Mojo.Event.tap, this.plotFunc.bind(this));
		this.controller.listen('easeButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", .25, .1, .25, 1));
		this.controller.listen('easeInButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", .42, 0, 1, 1));
		this.controller.listen('easeOutButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", 0, 0, .58, 1));
		this.controller.listen('easeIOButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", .42, 0, .58, 1));
		this.controller.listen('overEasyButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", .6, .1, .4, .9));
		this.controller.listen('linearButton', Mojo.Event.tap, this.setArgs.bind(this, "linear", 0, 0, 0, 0));
		this.controller.listen('bezierButton', Mojo.Event.tap, this.setArgs.bind(this, "bezier", 0, 0, 0, 0));
		this.controller.listen('zenoButton', Mojo.Event.tap, this.setArgs.bind(this, "zeno", 0, 0, 0, 0));

		this.controller.listen('animateButton', Mojo.Event.tap, this.doAnimate.bindAsEventListener(this));


		// Update plot on change events from inputs:
		var that=this;
		$A(this.controller.sceneElement.querySelectorAll('input')).each(
				function(e) {Mojo.listen(e, 'change', that.plotFunc.bind(that))}
				);


//		this.controller.listen('useX', 'change', this.changeUseX.bindAsEventListener(this));
//		this.controller.listen('useNM', 'change', this.changeUseNM.bindAsEventListener(this));

		// always operate in this mode now, since that's what the StyleAnimator does.
		this.useNM = true;
		this.useX = false;

		this.setArgs("bezier", 0,0,1,1);

	},

	doAnimate: function(e) {
		var animDiv = this.controller.get('animDiv');
		var curve;

		curve = [parseFloat(this.controller.get('x1arg').value), parseFloat(this.controller.get('y1arg').value),
					parseFloat(this.controller.get('x2arg').value), parseFloat(this.controller.get('y2arg').value)];
		
		/*
		new Mojo.Animation.StyleAnimator(animDiv, 'top', 0,190, parseFloat(this.controller.get('durationInput').value),
							{reverse:this.animateDirection, curve: curve});
		*/
		
		/*
		Mojo.Animation.animateStyle(animDiv, 'top', 'bezier', {from:0, 
					to:190, 
					duration: parseFloat(this.controller.get('durationInput').value), 
					reverse:this.animateDirection,
					curve: curve});
		*/

		//this isn't actually necessary since the strategy objs should ignore unused params... but oh well.
		switch(this.curveType) 
			{
			case 'bezier':
				Mojo.Animation.animateStyle(animDiv, 'top', 'bezier', {from:0, 
					to:190, 
					duration: parseFloat(this.controller.get('bezDurationInput').value), 
					reverse:this.animateDirection,
					curve: curve});	
				break;
			case 'linear':
				Mojo.Animation.animateStyle(animDiv, 'top', 'linear', {from:0, 
							to:190, 
							duration: parseFloat(this.controller.get('linDurationInput').value), 
							reverse:this.animateDirection
							});
				break;
			case 'zeno':
				Mojo.Animation.animateStyle(animDiv, 'top', 'zeno', {from:0, 
							to:190, 
							coefficient: parseFloat(this.controller.get('coefInput').value), 

							reverse:this.animateDirection
							});
				break;
			default:
			}


		this.animateDirection = !this.animateDirection;

	},

	/*
	// If false, only the 'y' half of the cubic bezier curve will be used.
	// Since the equations are in parametric form, this turns out to be pretty lame.  But it is fast.
	// If true, we calculate X too, which is the "real" curve... but this isn't useful for animation
	// since we can't make X increase linearly with time.
	changeUseX: function(e) {
		this.useX = e.target.value == 'on';
		this.plotFunc();
	},

	// If true, we use newton's method to approximate a t value for a given X... so we can move X from 0-1 linearly,
	// and at each point, get a t value and calculate y from THAT, and then we have the y value that really matches the X.
	// We use Newton's method for the approximation.
	changeUseNM: function(e) {
		this.useNM = e.target.value == 'on';
		this.plotFunc();
	},
	*/

	setArgs:function(curveType, x1, y1, x2, y2) {
		this.controller.get('y1arg').value = y1;
		this.controller.get('y2arg').value = y2;

		this.controller.get('x1arg').value = x1;
		this.controller.get('x2arg').value = x2;

		this.curveType = curveType;
		
		switch(curveType) {
		case 'bezier':
			this.controller.get('bezierProperties').show();
			this.controller.get('linearProperties').hide();
			this.controller.get('zenoProperties').hide();
			this.plotFunc();
			break;
		case 'linear':
			this.controller.get('bezierProperties').hide();
			this.controller.get('linearProperties').show();
			this.controller.get('zenoProperties').hide();
			break;
		case 'zeno':
			this.controller.get('bezierProperties').hide();
			this.controller.get('linearProperties').hide();
			this.controller.get('zenoProperties').show();
			break;
		}


	},

	plotFunc: function() {
			this.fillPlotDiv();
	},

	fillPlotDiv: function(arg1, arg2) {
		var y, content, result;
		var curveArgsY, curveArgsX;

		// Steal some functions from ValueAnimator.
		this.bezierCalcPoint = Mojo.Animation.Generator.Bezier.prototype.bezierCalcPoint;
		this.bezierMemoizeCoefficients = Mojo.Animation.Generator.Bezier.prototype.bezierMemoizeCoefficients;
		this.bezierTFromP = Mojo.Animation.Generator.Bezier.prototype.getTFromAxis;

		// Set up curve parameters.
		curveArgsY = [parseFloat(this.controller.get('y1arg').value), parseFloat(this.controller.get('y2arg').value)];
		curveArgsX=[parseFloat(this.controller.get('x1arg').value), parseFloat(this.controller.get('x2arg').value)];
		this.bezierMemoizeCoefficients(curveArgsX);
		this.bezierMemoizeCoefficients(curveArgsY);

		// the animator's bezier functions expect this.
		// Apologies for the ugly hacking...
		this.epsilon = .001;


		content = '';
		for(var i=0; i<200; i++)
		{

			// Now we always operate in 'useNM' mode, since that's what the StyleAnimator does.

			if(this.useNM) {
				result = this.bezierTFromP(i/200, curveArgsX); // find t value for given x (=i)
				result = this.bezierCalcPoint(result, curveArgsY); // find y value for the t (and thus also for the x, i).
			}else {
				result = this.bezierCalcPoint(i/200, curveArgsY);
			}

			y = Math.round(result*200);

			if(this.useX && !this.useNM) {
				x = this.bezierCalcPoint(i/200, curveArgsX) * 200;
			} else {
				x=i;
			}

			content += "<div style='width:1px; height:1px; left:"+x+"px; bottom:"+y+"px; background-color:#000; position:absolute;'></div>";
		}

		// Plot control points:
		content += "<div style='width:5px; height:5px; left:"+(curveArgsX[0]*200-2)+"px; bottom:"+(curveArgsY[0]*200-2)+"px; background-color:#090; position:absolute;'></div>";
		content += "<div style='width:5px; height:5px; left:"+(curveArgsX[1]*200-3)+"px; bottom:"+(curveArgsY[1]*200-3)+"px; background-color:#009; position:absolute;'></div>";


		this.controller.get('plotDiv').innerHTML = content;
	}

});





