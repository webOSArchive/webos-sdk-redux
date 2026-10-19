function StageTests() {
	this.stageCreatedForProxyTest = this.stageCreatedForProxyTest.bind(this);
}

StageTests.prototype.kChildStageName = 'test-child-stage';

StageTests.prototype.testProxy = function(recordResults) {
//	recordResults.delay(.75, Mojo.Test.passed);
	var proxy;
	
	Mojo.Controller.getAppController().createStageWithCallback({name: this.kChildStageName, lightweight: true}, 
		this.stageCreatedForProxyTest, "dashboard");
	
	proxy = Mojo.Controller.getAppController().getStageProxy(this.kChildStageName);
	
	// These calls should be saved up, and delegated once there's a scene assistant for them.
	proxy.delegateToSceneAssistant('testOne', 1);
	proxy.delegateToSceneAssistant('testTwo', 1, 2);
	proxy.delegateToSceneAssistant('testThree', 1, 2, 3);
	
	this.recordResults = recordResults;
};

// Stage ready callback that pushes our test scene.  Delegated calls should then be made.
StageTests.prototype.stageCreatedForProxyTest = function(stageController) {
	stageController.pushScene({name:'test', assistantConstructor:this.ProxyTestScene}, this);
};


// Test scene assistant class.  Saves a reference to the StageTests instance.
StageTests.prototype.ProxyTestScene = function(stageTester) {
	this.stageTester = stageTester;
};



// These test functions are supposed to be called once each, in order:

StageTests.prototype.ProxyTestScene.prototype.testOne = function(one, undef) {
	if(!this.testOneRun && !this.testTwoRun && !this.testThreeRun && one === 1 && undef === undefined) {
		this.testOneRun = true;
	} else {
		this.stageTester.recordResults("Failed, functions called out of order.");
	}
};

StageTests.prototype.ProxyTestScene.prototype.testTwo = function(one, two, undef) {
	if(this.testOneRun && !this.testTwoRun && !this.testThreeRun && 
			one === 1 && two === 2 && undef === undefined) {
		this.testTwoRun = true;
	} else {
		this.stageTester.recordResults("Failed, functions called out of order.");
	}
};

StageTests.prototype.ProxyTestScene.prototype.testThree = function(one, two, three, undef) {
	if(this.testOneRun && this.testTwoRun && !this.testThreeRun && 
			one === 1 && two === 2 && three === 3 && undef === undefined) {
		this.testThreeRun = true;
		this.stageTester.recordResults(Mojo.Test.passed);
		this.controller.window.close();
	}else {
		this.stageTester.recordResults("Failed, functions called out of order.");
	}
	
};


