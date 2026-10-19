function RenderTests() {
}

RenderTests.prototype.NUTMEG = {name: "Nutmeg", age: 12, dogBreed: 'Boston Terrier'};
RenderTests.prototype.DAWSON = {name: "Dawson"};
RenderTests.prototype.FEZ = {name: "Fez"};
RenderTests.prototype.DEEP = {dog: {name: "Rosie"}};
RenderTests.prototype.DEEP_TAG = {dog: {name: "<b>Dawson</b>"}};
RenderTests.prototype.DEEP_3 = {dog: {mother: {name: "Mosee"}}};
RenderTests.prototype.WITH_HTML = {name: "<b>Dawson</b>"};

RenderTests.prototype.DOGS = [RenderTests.prototype.NUTMEG, RenderTests.prototype.DAWSON, RenderTests.prototype.FEZ];
RenderTests.prototype.DEFAULT_OPTIONS = {useNew: true};

RenderTests.prototype.doRender = function doRender(params) {
	var actualParams = Object.extend({}, params);
	actualParams = Object.extend(actualParams, this.DEFAULT_OPTIONS);
	return Mojo.View.render(actualParams);
};

RenderTests.prototype.testObjectRender = function testObjectRender() {
	var rendered = this.doRender({object: this.NUTMEG, template: 'test/dog'})
	Mojo.requireEqual("<div>Nutmeg</div>", rendered);
	return Mojo.Test.passed;
}

RenderTests.prototype.testCollectionRender = function testCollectionRender() {
	var rendered = this.doRender({collection: this.DOGS, template: 'test/dog'})
	Mojo.requireMatch(/<div>Nutmeg<\/div><div>Dawson<\/div><div>Fez<\/div>/, rendered);
	return Mojo.Test.passed;
}

RenderTests.prototype.testDeepRender = function testDeepRender() {
	var rendered = this.doRender({object: this.DEEP_3, template: 'test/deep_dog_three'})
	Mojo.requireEqual("<div>Mosee</div>", rendered);
	rendered = this.doRender({object: this.DEEP, template: 'test/deep_dog'})
	Mojo.requireEqual("<div>Rosie</div>", rendered);
	return Mojo.Test.passed;
}

RenderTests.prototype.testMultiplePropertyRender = function testMultiplePropertyRender() {
	var rendered = this.doRender({object: this.NUTMEG, template: 'test/dog_multi'})
	Mojo.requireEqual("<div>Nutmeg</div><div>Boston Terrier</div><div>12</div>", rendered);
	return Mojo.Test.passed;
}

RenderTests.prototype.testEscapedRender = function testEscapedRender() {
	var rendered = this.doRender({object: this.NUTMEG, template: 'test/escaped'})
	Mojo.requireEqual("<div>Nutmeg</div>#{escaped}", rendered);
	return Mojo.Test.passed;
}

RenderTests.prototype.testTagEscaping = function testTagEscaping() {
	var wasEscape = Mojo.View.escapeHTMLInTemplates;
	Mojo.View.escapeHTMLInTemplates = true;
	Mojo.View.templates = {}
	var rendered = this.doRender({object: this.WITH_HTML, template: 'test/dog'})
	Mojo.requireMatch("<div>&lt", rendered);
	rendered = this.doRender({object: this.WITH_HTML, template: 'test/dog_no_escape'})
	Mojo.requireEqual("<div><b>Dawson</b></div>", rendered);
	rendered = this.doRender({object: this.DEEP_TAG, template: 'test/deep_dog'})
	Mojo.requireMatch("<div>&lt", rendered);
	rendered = this.doRender({object: this.DEEP_TAG, template: 'test/deep_dog_no_escape'})
	Mojo.requireEqual("<div><b>Dawson</b></div>", rendered);
	Mojo.View.escapeHTMLInTemplates = wasEscape;
	return Mojo.Test.passed;
}

RenderTests.prototype.measureRenderObject = function measureRenderObject() {
	this.timing.resume("RenderTests")
	for(var i = 1000; i > 0; --i) {
		var rendered = this.doRender({object: this.NUTMEG, template: 'test/escaped'})
	}
	this.timing.pause("RenderTests")
	var s = Mojo.Timing.createTimingString("RenderTests", "RenderTests");
	Mojo.Timing.resetAllWithPrefix("RenderTests");
	return s;
}
