
/*
	Playground for testing & experimentation of layout & mode position measurement.
*/

LayoutAssistant = Class.create({
		
	setup: function() {
		var i = 0;
		var el;
		var ppos;
		
		while(true) {
			el = this.controller.get('logtarget'+i);
			if(!el) {
				break;
			}
			
			ppos = Mojo.View.viewportOffset(el);
			Mojo.Log.info(i+": Placeover pos="+ppos.left+", "+ppos.top);

			ppos = el.viewportOffset();
			Mojo.Log.info(i+": Placeover prototype pos="+ppos.left+", "+ppos.top);
			
			i++;
		} 
		              
		
//		Mojo.View.logParentPositions(el);
		
		
		return;
	},
	

	logParentPositions: function(element) {
		var curElement = element;
		var offsetElement;
		var i=0;

		while(curElement && curElement !== element.ownerDocument) {
			if(curElement.offsetParent !== offsetElement) {
				Mojo.Log.info("%s: offset = %s,%s, scroll = %s,%s, pos:%s", i, curElement.offsetLeft, curElement.offsetTop, curElement.scrollLeft, curElement.scrollTop, curElement.getStyle('position'));
				offsetElement = curElement.offsetParent;
			} else {
				Mojo.Log.info("%s:                  scroll = %s,%s, pos:%s", i, curElement.scrollLeft, curElement.scrollTop,  curElement.getStyle('position'));
			}

			curElement = curElement.parentNode;
			i++;
		}

	},
	
	// Handle menu commands as needed:
	handleCommand: function(event) {
		// don;t allow back, since we need escape to cancel the screenshot tool we use to check measurement	
		if (Mojo.Host.current === Mojo.Host.mojoHost) {
			event.stop();			
		}
	},
	
	
	
});



