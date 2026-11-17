/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "equilizerCanvas", 
	kind: enyo.Control,
   	nodeTag: "canvas",
    domAttributes: { 
    	width:"600px", 
    	height:"200px", 
    	style: "border: 2px solid #000;background: #000000;margin-left: 100px;"		
		
	},
	// After the canvas is rendered
	rendered: function() {
		// Fill in the canvas node property
		this.hasNode();
		
		var can = this.node;
		var c = can.getContext('2d');
		
		c.strokeStyle = "green";
		c.lineWidth = 6;
		c.strokeRect(70, 70, 140, 140);
	}
});