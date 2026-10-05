function mockMillisecondsNow (times) {
	var cannedTimes = $A(times);
	return function() {
		var timeToReturn = cannedTimes[0];
		if (cannedTimes.length > 0) {
			cannedTimes.shift();
		}
		return timeToReturn;
	};
}

function timerWithMockMillisecondsNow (times, label) {
	var perfTimer = new Mojo.Timing.PerfTimer(label);
	perfTimer.millisecondsNow = mockMillisecondsNow(times);
	return perfTimer;
}

function TimingTests() {
	this.perfTimer = new Mojo.Timing.PerfTimer("blue");
}

TimingTests.prototype.before = function before (beforeCallback) {
	// restore the perf timer creator, in case a test changed it
	Mojo.Timing.enabled = true;
	Mojo.Timing.resetAll();
	beforeCallback();
};

TimingTests.prototype.after = function after (afterCallback) {
	// restore the perf timer creator, in case a test changed it
	Mojo.Timing.createPerfTimer = Mojo.Timing.defaultCreatePerfTimer;
	afterCallback();
};

TimingTests.prototype.testResumePauseOnce = function testResumePauseOnce () {
	this.perfTimer.millisecondsNow = mockMillisecondsNow([100, 200]);
	Mojo.require(!this.perfTimer.running, "perf timer should not be running");
	this.perfTimer.resume();
	Mojo.require(this.perfTimer.running, "perf timer should be running");
	this.perfTimer.pause();
	Mojo.requireEqual(100, this.perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testResumePauseTwice = function testResumePauseOnce () {
	this.perfTimer.millisecondsNow = mockMillisecondsNow([100, 200, 400, 600]);
	this.perfTimer.resume();
	this.perfTimer.pause();
	this.perfTimer.resume();
	this.perfTimer.pause();
	Mojo.requireEqual(300, this.perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testReset = function testReset () {
	this.perfTimer.millisecondsNow = mockMillisecondsNow([100, 200, 400, 600]);
	this.perfTimer.resume();
	this.perfTimer.pause();
	this.perfTimer.reset();
	Mojo.require(!this.perfTimer.running, "perf timer should not be running");
	Mojo.requireEqual(0, this.perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testCategories = function testCategories () {
	Mojo.Timing.createPerfTimer = timerWithMockMillisecondsNow.curry([100, 200]);
	Mojo.Timing.resume("blue");
	Mojo.Timing.pause("blue");
	var perfTimer = Mojo.Timing.get("blue");
	Mojo.requireEqual(100, perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testDisabled = function testDisabled () {
	Mojo.Timing.enabled = false;
	Mojo.Timing.resume("blue");
	Mojo.Timing.pause("blue");
	var perfTimer = Mojo.Timing.get("blue");
	Mojo.require(perfTimer === Mojo.Timing.nullPerfTimer, "should always get the null perf timer when timing is disabled");
	Mojo.requireEqual(0, perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testNestedPauseResumeCategory = function testNestedPauseResumeCategory () {
	Mojo.Timing.createPerfTimer = timerWithMockMillisecondsNow.curry([100, 200, 900, 1300]);
	Mojo.Timing.resume("blue");
	Mojo.Timing.resume("blue");
	Mojo.Timing.pause("blue");
	Mojo.Timing.pause("blue");
	var perfTimer = Mojo.Timing.get("blue");
	Mojo.requireEqual(100, perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

TimingTests.prototype.testRenderTiming = function testRenderTiming () {
	Mojo.Timing.createPerfTimer = timerWithMockMillisecondsNow.curry([100, 200, 900, 1300]);
	var NUTMEG = {name: "Nutmeg", age: 12, dogBreed: 'Boston Terrier'};
	var rendered = Mojo.View.render({object: NUTMEG, template: 'test/dog'});
	Mojo.requireEqual("<div>Nutmeg</div>", rendered);
	var perfTimer = Mojo.Timing.get("scene#render");
	Mojo.requireEqual(100, perfTimer.elapsedTime);
	return Mojo.Test.passed;
};

function checkTiming (category, expected) {
	var actual = Mojo.Timing.get(category).elapsedTime;
	Mojo.requireEqual(expected, actual, 
		"#{category} got time #{actual} instead of expected #{expected}", 
		{category: category, expected: expected, actual: actual});
}

function ScenePushTimingAssistant (recordResults) {
	this.recordResults = recordResults;
}

ScenePushTimingAssistant.prototype.setup = function setup() {
	this.controller.setupWidget('ok', {});
};

ScenePushTimingAssistant.prototype.activate = function activate() {
	var f = function() {
		checkTiming('scene#render', 500);
		checkTiming('scene#widgetTotal', 100);
		checkTiming('scene#setup', 100);
		checkTiming('scene#aboutToActivate', 100);
		checkTiming('scene#activate', 100);
	};
	Mojo.Test.validate.defer(this.recordResults, f);
	this.controller.stageController.window.close();
};

TimingTests.prototype.testScenePushTiming = function testScenePushTiming(recordResults) {
	Mojo.Timing.createPerfTimer = timerWithMockMillisecondsNow.curry([100, 200, 900, 1300, 1600, 1900]);
	var f = function pushTimingScene(stageController) {
		stageController.pushScene('scenePushTiming', recordResults);
	};
	Mojo.Controller.getAppController().createStageWithCallback({name: "push-timing", lightweight: true}, 
		f);
};