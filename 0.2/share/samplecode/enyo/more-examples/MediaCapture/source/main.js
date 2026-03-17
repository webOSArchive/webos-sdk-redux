enyo.kind({
	name: "main",
	kind: enyo.HFlexBox,
	components: [
		{kind: "enyo.MediaCapture", name: "mediaCapture"},
		{kind:enyo.VFlexBox, width:'200px', style:"border-right: 2px solid;", components: [
			{kind: "PageHeader", components: [
				{content: "Menu"}
			]},
			{kind: "RowGroup",caption: "Capture Options",style:"height:35%",components: [
				{kind: "Button", name:"soundButton",className: "enyo-button-affirmative",caption: "Mic",  onclick: "showSoundPanel"},
				{kind: "Button", name:"imageButton", className: "enyo-button-affirmative",caption: "Camera", onclick: "showImagePanel"}
			]},
				
			
		]},
		{kind:enyo.VFlexBox, flex:1, components: [
			{kind: "PageHeader", components: [
				{content: "Capture Device"}
			]},
			{flex: 1, kind: "Pane", components: [
				{ name:'soundPane', components: [
					{kind:"soundCapture"},
					
				]},
				{style: "background: beige;", name:'imagePane', components: [
					{kind:"imageCapture"}					
				]},
				{style: "background: tomato;", name:'videoPane', components: [
					//{kind:"videoCapture"}
				]}
			]}
		]}		
	],
	rendered:function(){
		this.$.soundButton.addClass ("enyo-button-blue");	
	},
	showSoundPanel:function(){
		this.$.pane.selectView(this.$.soundPane);
		this.$.imageCapture.unload();
		this.$.soundCapture.load();
		this.$.imageButton.removeClass ("enyo-button-blue");
		this.$.soundButton.addClass ("enyo-button-blue");
		
	},
	showImagePanel:function(){
		this.$.soundButton.removeClass ("enyo-button-blue");
		this.$.imageButton.addClass ("enyo-button-blue");
		
		this.$.pane.selectView(this.$.imagePane);
		this.$.soundCapture.unload();
		this.$.imageCapture.load();
	},	
	showVideoPanel:function(){
		this.$.pane.selectView(this.$.videoPane);	
	}
	
});



