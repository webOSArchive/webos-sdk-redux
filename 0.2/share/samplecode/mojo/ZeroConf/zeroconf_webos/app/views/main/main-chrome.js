opus.Gizmo({
	name: "main",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	h: "100%",
	styles: {
		zIndex: 2
	},
	chrome: [
		{
			name: "header1",
			label: "Zero Conf Test",
			type: "Palm.Mojo.Header",
			l: 0,
			t: 0
		},
		{
			name: "label1",
			label: "This app scans for instance of a demo server to control the mouse on your desktop. Be sure the server is running, then press 'Scan'",
			type: "Palm.Mojo.Label",
			l: 0,
			t: 0,
			h: "100%",
			styles: {
				padding: "15"
			}
		},
		{
			name: "sb",
			ontap: "activityButton1Tap",
			disabled: undefined,
			buttonClass: "affirmative",
			label: "Scan",
			type: "Palm.Mojo.ActivityButton",
			l: 0,
			t: 160
		}
	]
});