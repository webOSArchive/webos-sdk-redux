enyo.kind({
	name: "Services",
	kind: enyo.VFlexBox,
   published: {
      launchParams: null
   },
	components: [
		{name: "pane", kind: "Pane", flex: 1, onCreateView: "paneAddView", components: [
			{kind:"VFlexBox", components: [
				{kind: "PageHeader", onclick: "backHandler", components: [
					{kind: "VFlexBox", flex: 1, components: [
						{content: "Services"},
						{content: "Demonstrates the various services available.", style: "font-size: 14px"}
					]},
				]},
				{kind: "Main", flex:1, onItemSelected:"itemSelected"}
			]}
		]},
      {kind: "Popup", name: "alarmAlert", components: [
         {content: "Here is your alarm!"},
         {content: "Tap/Click anywhere to make me go away."}
      ]},
      {kind: "ApplicationEvents", onApplicationRelaunch: "handleLaunch"}
	],
	itemSelected: function(inSender, inEvent){
		var n = inEvent.viewKind.replace(/\./g, "_");
		this.$.pane.selectViewByName(n);
		var s = this.$[n + "_content"] || this.$[n];
		s.setTitle(inEvent.title)
		s.setDescription(inEvent.description)
	},
	create: function() {
		this.inherited(arguments);
	},
	paneAddView: function(inSender, inName) {
		var name = inName + "_content";
		var kind = inName.replace(/_/g, ".");
		
		// wrap content in scrollers
		return {kind: "Scroller", name: inName, components: [{name: name, kind: kind, onBack:'backHandler'}]};
	},
	backHandler: function(inSender, e) {
		if (this.$.pane.getViewIndex() > 0) {
			this.$.pane.back(e);
			var c = this.$.pane.view;
		}
	},
   launchParamsChanged: function () {
      if (this.launchParams && this.launchParams.isAlarm) {
         this.$.alarmAlert.openAtCenter();
      } else {
         console.log("no params");
      }
   },
   handleLaunch: function() {
      if (window.PalmSystem && enyo.windowParams) {
         console.log("setting launch params..");
         this.setLaunchParams(enyo.windowParams);
      }
   },
});
