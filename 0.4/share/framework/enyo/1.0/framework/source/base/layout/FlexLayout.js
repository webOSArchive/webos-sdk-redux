/**
A layout type that encapsulates the flexible box model exposed by CSS3.

Flex layouts are particularly useful for designs that need to fit objects 
to spaces. For example, say you have a header, middle section, and footer, 
and you want the header and footer to be always visible, 
with the middle section taking up the remaining space.

Note: Traditional HTML is not good at this kind of structure. 
In HTML, the sizing of objects generally proceeds from the inside out, 
which is, in a way, the opposite of fitting objects to a fixed space. 
(This dichotomy in the approach to layout is something that comes up regularly
in discussions of Web-centric vs. desktop-centric applications.)

The FlexLayout aligns controls into vertically- or horizontally-stacked boxes.
When the flex property is set on a control in a FlexLayout, the control expands
to fill the available space not occupied by other controls. If multiple controls
have their flex property set, they share the available space, each taking the
fraction specified by its own flex value divided by the total flex value. For
example, a control with flex: 5 in a layout with a total flex of 20 will take up
one-quarter (i.e., 5/20) of the available space.

The pack property specifies how controls are aligned with respect to the main axis.
Similarly, the align property specifies how controls are aligned along the
orthogonal axis.

See <a href="#enyo.HFlexLayout">enyo.HFlexLayout</a> and 
<a href="#enyo.VFlexLayout">enyo.VFlexLayout</a>.

*/
enyo.kind({
	name: "enyo.FlexLayout", 
	//* Set to one of "start", "center", "end", or "justify"
	pack: "start",
	//* Set to one of "start", "center", "end", "baseline", "stretch"
	align: "stretch",
	//* @protected
	constructor: function(inContainer) {
		// FIXME: not ideal
		this.prefix = enyo.isMoz ? "-moz" : "-webkit";
		if (inContainer) {
			// propagate settings from the container
			// TODO: containers should have layoutProps bag to support
			// arbitrary layouts. Certain extremely common layout options
			// (namely flex, pack, align) can be published as high level
			// properties that virtualize eponymous layoutProps.
			// Currently, we are simply reading these properties directly.
			this.pack = inContainer.pack || this.pack;
			this.align = inContainer.align || this.align;
		}
		this.container = inContainer;
	},
	destroy: function() {
		if (this.container) {
			delete this.container.setFlex;
			this.container.removeClass(this.flexClass);
		}
	},
	calcControlFlex: function(inControl, inExtent, inExtentNick) {
		var s = inControl.domStyles;
		if (inControl.flex) {
			return inControl.flex;
		} else if (s[inExtent] == "100%" || inControl[inExtentNick] =="fill") {
			delete s[inExtent];
			return (inControl.flex = 1);
		}
		return null;
	},
	flowExtent: function(inControls, inExtent, inExtentNick) {
		for (var i=0, c, s, f; (c=inControls[i]); i++) {
			f = this.calcControlFlex(c, inExtent, inExtentNick);
			s = c.domStyles;
			s[this.prefix + "-box-flex"] = f;
			if (f) {
				// we redefine flex to mean 'be exactly the left over space'
				// as opposed to 'natural size plus the left over space'
				if (!s[inExtent]) {
					// Lunacy: a width is said with flex-basis where the engine counts a 0
					// width (see enyo.FlexLayout.zeroWidthCounts below). Heights are left be.
					if (inExtent == "width" && enyo.FlexLayout.zeroWidthCounts()) {
						// Lunacy: an engine that takes the basis literally would split a box
						// sized to its content evenly; there each child keeps its natural
						// width, as every engine before did (enyo.FlexLayout.basisSplitsContent).
						if (!(enyo.FlexLayout.basisSplitsContent() && this._container && enyo.FlexLayout.contentSized(this._container))) {
							s["flex-basis"] = "0px";
						}
					} else {
						s[inExtent] = "0px";
					}
				}
				// Lunacy: a percentage height inside a vertically flexed child came to 0 on the
				// TouchPad (enyo.FlexLayout.percentOfFlexed below).
				if (inExtent == "height" && s.height == "0px" && enyo.FlexLayout.percentOfFlexed()) {
					enyo.FlexLayout.collapsePercentChildren(c);
				}
				// Mozilla doesn't seem to 'stretch' correctly on this axis
				if (enyo.isMoz && inExtent == "height" && this.align == "stretch") {
					s.width = "100%";
				}
			} else if (s["flex-basis"]) {
				// Lunacy (patch 0010): a child no longer flexed loses the share it was given,
				// or an engine that honours flex-basis keeps it 0 px wide.
				delete s["flex-basis"];
			}
		}
	},
	flow: function(inContainer) {
		var s = inContainer.domStyles;
		s[this.prefix + "-box-pack"] = inContainer.pack || this.pack;
		s[this.prefix + "-box-align"] = inContainer.align || this.align;
		inContainer.addClass(this.flexClass);
		// Lunacy: flowExtent needs to know whose children it is laying out.
		this._container = inContainer;
		this._flow(inContainer.children);
		// Lunacy: paint an item pulled back over an earlier one as the TouchPad did (0007).
		enyo.FlexLayout.liftOverlapped(inContainer, this instanceof enyo.VFlexLayout);
	}
});

/**
A horizontal <a href="#enyo.FlexLayout">flexible layout</a> that displays controls left-to-right.

To create a caption with natural width, followed by a set of three equally-spaced buttons to the right, try:

	{layoutKind: "HFlexLayout", style: "width: 500px;", components: [
		{content: "Here are some buttons:"},
		{kind: "Button", flex: 1, caption: "Left"},
		{kind: "Button", flex: 1, caption: "Center"},
		{kind: "Button", flex: 1, caption: "Right"}
	]}

To control the alignment left-to-right, change the pack property's value.
To control the alignment top-to-bottom, change the align property's value. For example, 
this creates a a set of horizontally-centered buttons positioned at the bottom of the container.

	{kind: "Control", layoutKind: "HFlexLayout", style: "width: 300px; height: 500px;",
		pack: "center", align: "end", components: [
		{kind: "Button", caption: "Left"},
		{kind: "Button", caption: "Right"}
	]}

*/
// Lunacy: whether this engine lets a flexed child's 0 width count when its box is sized to its
// content.
//
// Enyo says "take exactly a share of the leftover space" with width 0 plus a box-flex. The
// WebKit of 2011 ignored a fixed width of 0 when it worked out how wide a box's content wanted
// to be, so a box sized to its content (a RadioGroup between two Spacers in a Toolbar) came out
// as wide as its buttons' content and then split that evenly. Chromium's later -webkit-box
// counts the 0: the same group comes out as wide as its buttons' borders, and Palm's Clock drew
// its clock/alarm switch as two squashed icons. On such an engine the share is said with
// flex-basis instead, which it honours in -webkit-box and which leaves the content counted.
// Only widths: the old engine worked out a box's content height by laying it out, where a 0
// height stays 0, so heights came out the same then as now.
// Checked once, on a throwaway box: the engines that need this are the ones that answer 0.
enyo.FlexLayout.zeroWidthCounts = function() {
	var f = enyo.FlexLayout, root = document.body || document.documentElement;
	if (f._zeroWidthCounts === undefined && root) {
		var box = document.createElement("div"), child = document.createElement("div");
		box.style.cssText = "position:absolute;visibility:hidden;display:-webkit-inline-box";
		child.style.cssText = "-webkit-box-flex:1;width:0px";
		child.textContent = "xx";
		box.appendChild(child);
		root.appendChild(box);
		var counts = box.offsetWidth === 0;
		// And that flex-basis does share a fixed box out evenly, or there is nothing to gain.
		var wide = document.createElement("div");
		wide.style.cssText = "-webkit-box-flex:1;flex-basis:0px";
		wide.textContent = "xxxxxxxxxxxxxxxxxxxx";
		child.style.cssText = "-webkit-box-flex:1;flex-basis:0px";
		box.appendChild(wide);
		box.style.cssText = "position:absolute;visibility:hidden;display:-webkit-box;width:400px";
		f._zeroWidthCounts = counts && Math.abs(child.offsetWidth - wide.offsetWidth) <= 1;
		root.removeChild(box);
	}
	return Boolean(f._zeroWidthCounts);
};

enyo.kind({
	name: "enyo.HFlexLayout", 
	//* @protected
	kind: enyo.FlexLayout,
	flexClass: "enyo-hflexbox",
	_flow: function(inControls) {
		this.flowExtent(inControls, "width", "w");
	}
});

/**
A vertical <a href="#enyo.FlexLayout">flexible layout</a> that displays controls top-to-bottom.

To create a caption with natural height, followed by a set of three equally-spaced buttons below, try:

	{layoutKind: "VFlexLayout", style: "height: 500px;", components: [
		{content: "Here are some buttons:"},
		{kind: "Button", flex: 1, caption: "Top"},
		{kind: "Button", flex: 1, caption: "Middle"},
		{kind: "Button", flex: 1, caption: "Bottom"}
	]}

To control the alignment top-to-bottom, change the pack property's value.
To control the alignment left-to-right, change the align property's value. For example, 
this creates a a set of vertically-centered buttons positioned at the right of the container.

	{kind: "Control", layoutKind: "VFlexLayout", style: "width: 300px; height: 500px;",
		pack: "center", align: "end", components: [
		{kind: "Button", caption: "Top"},
		{kind: "Button", caption: "Bottom"}
	]}
*/
enyo.kind({
	name: "enyo.VFlexLayout", 
	//* @protected
	kind: enyo.FlexLayout,
	flexClass: "enyo-vflexbox",
	_flow: function(inControls) {
		this.flowExtent(inControls, "height", "h");
	}
});

/**
An HFlexBox displays controls using an <a href="#enyo.HFlexLayout">enyo.HFlexLayout</a>.

It is equivalent to specifying a Control with layoutKind set to HFlexLayout.
*/
enyo.kind({
	name: "enyo.HFlexBox",
	//* @protected
	kind: enyo.Control,
	layoutKind: enyo.HFlexLayout
});

/**
An VFlexBox displays controls using an <a href="#enyo.VFlexLayout">enyo.VFlexLayout</a>.

It is equivalent to specifying a Control with layoutKind set to VFlexLayout.
*/
enyo.kind({
	name: "enyo.VFlexBox",
	//* @protected
	kind: enyo.Control,
	layoutKind: enyo.VFlexLayout
});

// Lunacy: whether this engine takes flex-basis literally inside a -webkit-box. Chromium 37 to
// 131 laid -webkit-box out with the old flexible-box code, which never read flex-basis: a
// flexed child kept its natural width and grew by its share of what was left, as the WebKit
// of 2011 did. WebView 149 builds -webkit-box on flexbox and honours the basis, so a box sized
// to its content - the sort buttons at the top of App Catalog's category lists - is split
// evenly among its children, and the widest child's caption is cut off. Checked once, on a
// hidden box: two children with flex-basis 0 and very different text come out the same width.
enyo.FlexLayout.basisSplitsContent = function() {
	var f = enyo.FlexLayout, root = document.body || document.documentElement;
	if (f._basisSplitsContent === undefined && root) {
		var box = document.createElement("div"), a = document.createElement("div"), b = document.createElement("div");
		box.style.cssText = "position:absolute;visibility:hidden;display:-webkit-inline-box";
		a.style.cssText = b.style.cssText = "-webkit-box-flex:1;flex-basis:0px;white-space:nowrap";
		a.textContent = "xx";
		b.textContent = "xxxxxxxxxxxxxxxxxxxx";
		box.appendChild(a);
		box.appendChild(b);
		root.appendChild(box);
		f._basisSplitsContent = Math.abs(a.offsetWidth - b.offsetWidth) <= 1;
		root.removeChild(box);
	}
	return Boolean(f._basisSplitsContent);
};

// Lunacy: whether a container's width comes from its content rather than from its parent or
// from a style of its own: nothing sets its width, it isn't flexed, and it sits in a horizontal
// box (whose children are as wide as their content) or in a vertical box that doesn't stretch
// its children. Anything else - a plain block's child, a stretched one - is as wide as its
// parent, and there every engine splits the children evenly. This is what Enyo knows at
// layout time; a width given by a stylesheet it can't see.
enyo.FlexLayout.contentSized = function(inContainer) {
	var s = inContainer.domStyles || {};
	if (s.width || inContainer.width || inContainer.flex) { return false; }
	var p = inContainer.parent, l = p && p.layout;
	if (!l) { return false; }
	if (l instanceof enyo.HFlexLayout) { return true; }
	if (l instanceof enyo.VFlexLayout) { return (p.align || l.align) != "stretch"; }
	return false;
};

// Lunacy: what a percentage height inside a flexed child comes to (patch 0006).
//
// Enyo gives a child it flexes vertically "height: 0px" and lets -webkit-box stretch it. The
// TouchPad's WebKit worked a percentage height inside that child out against the 0px - before
// the box stretched it - and never again, so "height: 100%" there came out 0 and the content
// overflowed it. Email's message view depends on it: its WebView is "height: 100%" inside a
// flexed pane, and the header after it floats over the web content because the WebView takes
// no room; measured with Workbench/probe's webviewprobe on the reference TouchPad: the WebView
// 0 px tall, the header at the pane's top. Chromium resolves the percentage against the
// stretched height, and the same header lands under a full-height WebView, out of sight.
// On an engine that does that, an in-flow child with a percentage height, inside a child Enyo
// flexes vertically, is given what the TouchPad gave it: 0px. Checked once, on a hidden box.
enyo.FlexLayout.percentOfFlexed = function() {
	var f = enyo.FlexLayout, root = document.body || document.documentElement;
	if (f._percentOfFlexed === undefined && root) {
		var box = document.createElement("div"), item = document.createElement("div"), child = document.createElement("div");
		box.style.cssText = "position:absolute;visibility:hidden;display:-webkit-box;-webkit-box-orient:vertical;height:100px";
		item.style.cssText = "-webkit-box-flex:1;height:0px";
		child.style.cssText = "height:100%";
		item.appendChild(child);
		box.appendChild(item);
		root.appendChild(box);
		f._percentOfFlexed = child.offsetHeight > 0;
		root.removeChild(box);
	}
	return Boolean(f._percentOfFlexed);
};
// Only a child in the flow: an absolutely placed one (enyo.Pane's views, by their enyo-view
// class) takes its percentage from its positioned container, after layout, on every engine.
// Its position is known once it is drawn, and a class may arrive after the flex pass (Pane
// adds enyo-view as it lays its own views out), so the children are looked at just after.
enyo.FlexLayout.collapsePercentChildren = function(inControl) {
	setTimeout(function() {
		var kids = inControl.children || [];
		for (var i = 0, k, h, n, p; (k = kids[i]); i++) {
			h = k.domStyles && k.domStyles.height;
			if (!h || !/%$/.test(String(h)) || !(n = k.hasNode())) { continue; }
			p = window.getComputedStyle(n).position;
			if (p != "absolute" && p != "fixed") { k.applyStyle("height", "0px"); }
		}
	}, 0);
};

// Lunacy: an item drawn back over the one before it, painted as the TouchPad painted it
// (patch 0007).
//
// A negative margin can pull a -webkit-box item back over the item before it: Email's compose
// view lays its "Subject:" label and then the subject Input, whose margin-left of -74px takes
// it under the label, padded clear of it. The TouchPad's WebKit painted the items of an old
// -webkit-box as ordinary blocks - every background first, then every text - so the label's
// text stayed over the Input's background. Chromium paints each item whole, like an inline
// block, in order: the Input, focused, fills its box white from its border image and covered
// the label until it lost the focus. An earlier item that a later one overlaps is lifted with
// position: relative, which paints it over the items in the flow on every engine; it takes no
// z-index, so nothing else is reordered. Looked at once the items are drawn, as 0006 does.
enyo.FlexLayout.liftOverlapped = function(inContainer, inVertical) {
	setTimeout(function() {
		var kids = inContainer.children || [], side = inVertical ? "marginTop" : "marginLeft";
		for (var i = 1, k, n, j, e; (k = kids[i]); i++) {
			if (!(n = k.hasNode()) || !(parseFloat(window.getComputedStyle(n)[side]) < 0)) { continue; }
			for (j = i - 1; j >= 0; j--) {
				if ((e = kids[j].hasNode()) && window.getComputedStyle(e).position == "static" && enyo.FlexLayout.overlaps(e, n)) {
					e.style.position = "relative";
				}
			}
		}
	}, 0);
};
enyo.FlexLayout.overlaps = function(a, b) {
	var r = a.getBoundingClientRect(), q = b.getBoundingClientRect();
	return r.width && r.height && q.width && q.height &&
		r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom;
};
