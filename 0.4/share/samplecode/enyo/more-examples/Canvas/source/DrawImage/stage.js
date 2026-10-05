enyo.kind({
	name: "DrawImage.stage",
	kind: HeaderView,
	components:[
        { kind: "PageHeader", content: "An image drawn to the canvas", flex: 0, style: "font-size: 16px" },
        { kind: "DrawImage.control" }
    ]
});