function FunctionTests() {
}

FunctionTests.prototype.testWrap = function testWrap(recordResults) {
	var blueCalled, redCalled, greenCalled;
	
	var blueFunc = function(v) {
		blueCalled = v;
	};
	
	var redFunc = function(v) {
		redCalled = v;
	};

	var greenFunc = function(v) {
		greenCalled = v;
	};
	
	var s = new Mojo.Function.Synchronize();
	
	var blueWrapper = s.wrap(blueFunc);
	var redWrapper = s.wrap(redFunc);
	var greenWrapper = s.wrap(greenFunc);
	
	blueWrapper("b");
	redWrapper("r");
	
	Mojo.require(blueCalled === undefined);
	Mojo.require(redCalled === undefined);
	Mojo.require(greenCalled === undefined);
	
	greenWrapper("g");
	
	Mojo.require(blueCalled === "b");
	Mojo.require(redCalled === "r");
	Mojo.require(greenCalled === "g");
	
	return Mojo.Test.passed;
};

FunctionTests.prototype.testWrapWithSync = function testWrap(recordResults) {
	var blueCalled, syncCalled;
	
	var blueFunc = function(v) {
		blueCalled = v;
	};
	
	var sync = function() {
		syncCalled = true;
	}
	
	var s = new Mojo.Function.Synchronize({syncCallback: sync});
	
	var blueWrapper = s.wrap(blueFunc);
	
	Mojo.require(blueCalled === undefined);
	Mojo.require(syncCalled === undefined);
	
	blueWrapper("b");
	
	Mojo.require(blueCalled === "b");
	Mojo.require(syncCalled === true, "sync must be called");
	
	return Mojo.Test.passed;
};
