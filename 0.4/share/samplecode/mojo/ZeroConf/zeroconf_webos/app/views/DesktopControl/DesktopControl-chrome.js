opus.Gizmo({
	name: "DesktopControl",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	h: "100%",
	styles: {
		zIndex: 2
	},
	chrome: [
		{
			name: "header1",
			label: "Remote Desktop Control",
			type: "Palm.Mojo.Header",
			l: 0,
			t: 0
		},
		{
			name: "button1",
			ontap: "button1Tap",
			disabled: undefined,
			buttonClass: "affirmative",
			label: "Center Mouse",
			type: "Palm.Mojo.Button",
			l: 0,
			t: 50
		},
		{
			name: "panel2",
			dropTarget: true,
			type: "Palm.Mojo.Panel",
			l: 0,
			t: 110,
			h: 252,
			controls: [
				{
					name: "button4",
					ontap: "button4Tap",
					disabled: undefined,
					label: "Up",
					type: "Palm.Mojo.Button",
					l: 0,
					t: 0
				},
				{
					name: "button5",
					ontap: "button5Tap",
					disabled: undefined,
					label: "Down",
					type: "Palm.Mojo.Button",
					l: 0,
					t: 60
				},
				{
					name: "button6",
					ontap: "button6Tap",
					disabled: undefined,
					label: "Left",
					type: "Palm.Mojo.Button",
					l: 0,
					t: 120
				},
				{
					name: "button7",
					ontap: "button7Tap",
					disabled: undefined,
					label: "Right",
					type: "Palm.Mojo.Button",
					l: 0,
					t: 180
				}
			]
		}
	]
});