function TransitionTest() {
	this.window = window;
}

TransitionTest.prototype.testTwoAtOnce = function(recordResults) {
	var tOne;
	var tTwo;

	tOne = new Mojo.Controller.Transition(this.window);
	tOne.setTransitionType(Mojo.Transition.defaultTransition);
	try {
		tTwo = new Mojo.Controller.Transition(this.window);
		tOne.run();
	} catch (e) {
		tOne.cleanup();
		return Mojo.Test.passed;
	}
	throw new Error("Expected exception not thrown");
};


TransitionTest.prototype.testDoubleCleanup = function(recordResults) {
	var tOne;
	var tTwo;
	var tThree;

	tOne = new Mojo.Controller.Transition(this.window);
	tOne.cleanup();

	// tOne is no longer operable, so creating a new Transition should work
	tTwo = new Mojo.Controller.Transition(this.window);

	// Cleaning up tOne should not effect tTwo ...
	tOne.cleanup();
	try {
		// ... which means this should fail
		tThree = new Mojo.Controller.Transition(this.window);
	} catch (e) {
		tTwo.cleanup();
		return Mojo.Test.passed;
	}
	throw new Error("Expected exception not thrown");
};

TransitionTest.prototype.testBasic = function(recordResults) {
	var tOne;
	var tTwo;
	
	tOne = new Mojo.Controller.Transition(this.window);
	tOne.cleanup();
	
	tTwo = new Mojo.Controller.Transition(this.window);
	tTwo.cleanup();
	
	return Mojo.Test.passed;
};
