function KeymatcherTests() {
	this.setMatchedValue = this.setMatchedValue.bind(this);
}

KeymatcherTests.timeoutInterval = 2000; // 2 sec timeout, since we need more then a second for testDelayedClear().


KeymatcherTests.prototype.makeMatcher = function() {
	return new Mojo.Event.KeyMatcher(this.setMatchedValue, {
			items: [{label:"Foo", value:'foo-value'}, 
					{label:"Bar", value:'bar-value'},
					{label:"Farfignügen", value:'farfig-value'}
					]});
};

KeymatcherTests.prototype.setMatchedValue = function(value) {
	this.matchedValue = value;
	this.setValueCalled = true;
};

KeymatcherTests.prototype.before = function before() {
	delete this.matchedValue;
	delete this.setValueCalled;
	return Mojo.Test.beforeFinished;
};

KeymatcherTests.prototype.testSimpleMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(70); // 'F'
	Mojo.require(this.matchedValue === "foo-value");
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testOtherMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.b);
	Mojo.require(this.matchedValue === "bar-value");
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testMismatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.o);
	Mojo.require(this.matchedValue === undefined);
	Mojo.require(this.setValueCalled === undefined);
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testCaselessMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(102); // 'f'
	Mojo.require(this.matchedValue === "foo-value");
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testFallbackMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.f);
	Mojo.require(this.matchedValue === "foo-value");
	matcher.keyPress(Mojo.Char.a);	// should change matched value to farfig-value
	Mojo.require(this.matchedValue === "farfig-value");
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testFallbackMismatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.f);
	Mojo.require(this.matchedValue === "foo-value");
	
	delete this.setValueCalled;
	matcher.keyPress(Mojo.Char.i);
	Mojo.require(this.matchedValue === "foo-value"); // should be no change, since there was no match.
	Mojo.require(this.setValueCalled === undefined);
	return Mojo.Test.passed;
};

// setValue func should not be called when teh value doesn't change
KeymatcherTests.prototype.testFastDoubleMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.f);
	Mojo.require(this.matchedValue === "foo-value");
	
	delete this.setValueCalled;
	matcher.keyPress(Mojo.Char.o);
	Mojo.require(this.matchedValue === "foo-value"); // should be no change, since value did not change.
	Mojo.require(this.setValueCalled === undefined);
	return Mojo.Test.passed;
};


KeymatcherTests.prototype.testSwitchMatch = function(recordResults) {
	var matcher = this.makeMatcher();
	matcher.keyPress(Mojo.Char.f);
	Mojo.require(this.matchedValue === "foo-value");
	
	matcher.keyPress(Mojo.Char.b);
	Mojo.require(this.matchedValue === "bar-value"); // should drop the 'f' and switch to 'bar-value' since 'fb' doesn't match.
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testNumMatch = function(recordResults) {
	var matcher = new Mojo.Event.KeyMatcher(this.setMatchedValue, {itemsRange:{min:1, max:12}});
	
	matcher.keyPress(Mojo.Char.one);
	Mojo.require(this.matchedValue === 1);
	
	matcher.keyPress(Mojo.Char.two);
	Mojo.require(this.matchedValue === 12);
	
	matcher.keyPress(Mojo.Char.three);
	Mojo.require(this.matchedValue === 3);
	
	return Mojo.Test.passed;
};

KeymatcherTests.prototype.testDelayedClear = function(recordResults) {
	var matcher = new Mojo.Event.KeyMatcher(this.setMatchedValue, {itemsRange:{min:1, max:12}});
	
	matcher.keyPress(Mojo.Char.one);
	Mojo.require(this.matchedValue === 1);
	
	this.delayedKeyPress.bind(this, matcher, recordResults).delay(1.1);
	
	return;
};

KeymatcherTests.prototype.delayedKeyPress = function(matcher, recordResults) {
	matcher.keyPress(Mojo.Char.two);
	if(this.matchedValue === 2) { // should match 2 instead of 12, since we waited more than a second.
		recordResults(Mojo.Test.passed);
	} else {
		recordResults("Unexpected match: "+this.matchedValue);
	}
	
};


