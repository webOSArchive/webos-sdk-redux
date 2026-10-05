enyo.kind({
	name: "Main",
	kind: "VFlexBox",
	events: {
		onItemSelected: "",
	},
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Input"},
				{viewKind: "input.KeyPresses", title: "Key Presses", onSelected:'itemSelected', description: "Type and Capture", className: "enyo-first"},
				{viewKind: "input.ScreenMovement", title: "Screen Movement", onSelected:'itemSelected', description: "Mind your x's and y's"},
				{viewKind: "input.Gestures", title: "2-Finger Gestures", onSelected:'itemSelected', description: "2 finger fun"},
				{viewKind: "input.Multitouch", title: "Multitouch Tracking", onSelected:'itemSelected', description: "Track up to 10 fingers or toes"}
			]}
		]}
	],	
	itemSelected: function(inSender, inEvent){
		this.doItemSelected(inEvent)
	}
});
