/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */


enyo.kind({
	name: "SinglePane",
	kind: enyo.VFlexBox,
	components: [
		{kind: "ApplicationEvents", onWindowDeactivated:"windowDeactivated",onWindowActivated:"windowActivated",onWindowRotated: "windowRotated"},
		{kind: "AppMenu", components: [
			{kind: "AboutDisplay", name:'About'},
			{caption: "Turn off the lights.", onclick: "displayAbout"}
		]},
		{kind: "PageHeader", components: [
			{content: "Accelerometer and Orientation"}
		]},
		{flex: 1, kind: "Pane", components: [
			{flex: 1, kind: "Scroller", components: [
				{kind: "RowGroup",caption: "Shaking",components: [
					{name: "info1", style: "height: 40px;",content:"Shaking Status : "}

				]},
				{kind: "RowGroup",caption: "Orientation - App event",components: [
					{name: "info2", style: "height: 40px;",content:"Shaking Status : "}

				]},
				{kind: "RowGroup",caption: "Orientation",components: [
					{name: "position", style: "height: 40px;",content:""},
					{name: "roll", style: "height: 40px;",content:""},
					{name: "pitch", style: "height: 40px;",content:""}

				]},
				{kind: "RowGroup",caption: "Acceleration",components: [
					{name: "x", style: "height: 40px;",content:""},
					{name: "y", style: "height: 40px;",content:""},
					{name: "z", style: "height: 40px;",content:""},
					{name: "time", style: "height: 40px;",content:""}

				]}
			]}
		]}
	],
	dosomething:function(){
		this.$.info.setContent("hmmmm");
	},
	create:function(){
		this.inherited(arguments);
		this.handleOrientationBinded = this.handleOrientation.bind(this);
		this.accelerometerCallbackBinded = this.accelerometerCallback.bind(this);
		this.shakeStartCallbackBinded = this.shakeStartCallback.bind(this);
		this.shakingCallbackBinded = this.shakingCallback.bind(this);
		this.shakeEndCallbackBinded = this.shakeEndCallback.bind(this);
	},
	windowActivated: function (){	
		document.addEventListener("orientationchange", this.handleOrientationBinded);
		document.addEventListener("acceleration", this.accelerometerCallbackBinded);
		document.addEventListener("shakestart", this.shakeStartCallbackBinded);
		document.addEventListener("shaking", this.shakingCallbackBinded);
		document.addEventListener("shakeend", this.shakeEndCallbackBinded);
		this.windowRotated();
	},
	windowDeactivated: function (){	
		document.removeEventListener("orientationchange", this.handleOrientationBinded);
		document.removeEventListener("acceleration", this.accelerometerCallbackBinded);
		document.removeEventListener("shakestart", this.shakeStartCallbackBinded);
		document.removeEventListener("shaking", this.shakingCallbackBinded);
		document.removeEventListener("shakeend", this.shakeEndCallbackBinded);
		this.windowRotated();
	},
	windowRotated:function(inSender){
		this.$.info2.setContent(enyo.getWindowOrientation());
	},
	openAppMenuHandler: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.open();
	},
	closeAppMenuHandler: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.close();
	},
	displayAbout: function() {
		this.$.About.openAtCenter();
	},
	accelerometerCallback: function(event){
		this.$.x.setContent("X : " + event.accelX);
		this.$.y.setContent("Y: " + event.accelY);
		this.$.z.setContent("Z: " + event.accelZ);
		this.$.time.setContent("Time (msec): " + event.time);
	},
	handleOrientation: function(event){
		var position = ["Flat, face up","Flat, face down", "Upright", "Upside Down", "Pointed left", "Pointed right"]
		this.$.position.setContent("Current orientation is: " + position[event.position]);
		this.$.roll.setContent("Roll: " + event.roll + " degrees");
		this.$.pitch.setContent("Pitch: " + event.pitch + " degrees");
	},
	shakeStartCallback: function(event){
		this.$.info1.setContent("Shaking Status : Shaking Started");
	},
	shakingCallback: function(event){
		this.$.info1.setContent("Shaking Status : Shaking!!!!");
	},
	shakeEndCallback: function(event){
		this.$.info1.setContent("Shaking Status : Shaking Ended")
	}
});
/*
enyo.kind({
	name: "SinglePane",
	kind: enyo.VFlexBox,
	components: [
		{kind: "ApplicationEvents", onWindowRotated: "windowRotated"},
		{kind: "PageHeader", components: [
			{content: "Page Header"}
		]},
		{kind: "RowGroup",caption: "Shaking",components: [
					{name: "info", style: "height: 40px;"},
					{kind: "Button", name:"recordSoundButton",className: "enyo-button-negative",caption: "Record",  onclick: "recordClicked"},
				{kind:"ActivityButton", active: false,disabled: true, name:"playButton", className: "enyo-button-dark",caption: "Play", onclick: "playClicked"}

			]},
		{kind: "Toolbar", components: [
		]}
	],
	create:function(){
		console.log("ADDING LISTENER0")
	},
	
	windowRotated:function(inSender){
		console.log(JSON.stringify(inSender.events))
		
		for (obj in inSender.events)
			console.log(obj + " : " + inSender.events[obj])
	enyo.getWindowOrientation();
	},
	accelerometerCallback: function(event){
		console.log("in here");
		console.log(JSON.stringify(events))
	},
	shakeStartCallback: function(event){
		console.log("in here");
		this.$.info.setContent("Shaking Started");
	},
	shakingCallback: function(event){
		console.log("in here");
		this.$.info.setContent("Shaking!!!!");
	},
	shakeEndCallback: function(event){
		console.log("in here");
		this.$.info.setContent("Shaking Ended")
	}
});
*/