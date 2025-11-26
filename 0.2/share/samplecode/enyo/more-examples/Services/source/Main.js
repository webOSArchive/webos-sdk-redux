enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	events: {
		onItemSelected: "",
	},
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Application Manager Services"},
				{title: "Application Manager", viewKind: "applicationManager.ApplicationManager", onSelected:'itemSelected', className: "enyo-first"},
				{title: "Audio Player", viewKind: "applicationManager.AudioPlayer", onSelected:'itemSelected'},
				{title: "Browser", viewKind: "applicationManager.Browser", onSelected:'itemSelected'},
				{title: "Email", viewKind: "applicationManager.Email", onSelected:'itemSelected'},
				{title: "Maps", viewKind: "applicationManager.Maps", onSelected:'itemSelected'},
				{title: "Messaging", viewKind: "applicationManager.Messaging", onSelected:'itemSelected'},
				{title: "Phone", viewKind: "applicationManager.Phone", onSelected:'itemSelected'},
				{title: "Photos", viewKind: "applicationManager.Photos", onSelected:'itemSelected'},

				{kind: "Divider", caption: "System Services"},
				{title: "Alarms", viewKind: "system.Alarms", onSelected:'itemSelected', className: "enyo-first"},
				{title: "Calendar", viewKind: "system.Calendar", onSelected:'itemSelected'},
				{title: "Connection Manager", viewKind: "system.ConnectionManager", onSelected:'itemSelected'},
				{title: "Contacts", viewKind: "system.Contacts", onSelected:'itemSelected'},
				{title: "Download Manager", viewKind: "system.DownloadManager", onSelected:'itemSelected'},
				{title: "GPS", viewKind: "system.GPS", onSelected:'itemSelected'},
				{title: "Media Indexer", viewKind: "system.MediaIndexer", onSelected:'itemSelected'},
				{title: "Power Manager", viewKind: "system.PowerManager", onSelected:'itemSelected'},
				{title: "System Properties", viewKind: "system.SystemProperties", onSelected:'itemSelected'},
				{title: "System Services", viewKind: "system.SystemServices", onSelected:'itemSelected'},
				{title: "System Sounds", viewKind: "system.SystemSounds", onSelected:'itemSelected'},
			]}
		]}
	],	
	itemSelected: function(inSender, inEvent){
		this.doItemSelected(inEvent)
	}
});
