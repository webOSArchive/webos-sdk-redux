function ContainerTests() {
	this.mockScene = {window:window};
}

ContainerTests.prototype.sceneContainerLayer = Mojo.Controller.SceneController.prototype.sceneContainerLayer;
ContainerTests.prototype.dialogContainerLayer = Mojo.Controller.SceneController.prototype.dialogContainerLayer;
ContainerTests.prototype.submenuContainerLayer = Mojo.Controller.SceneController.prototype.submenuContainerLayer;

ContainerTests.prototype.testEmpty = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var div = document.createElement("div");
	
	Mojo.require(stack.topContainer() === undefined, "ContainerStack.topContainer() is not undefined.");
	Mojo.require(stack.removeContainer(div) === false, "Succeeded in removing a container that should not have been in the stack.");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


ContainerTests.prototype.testPushRemove = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var div = document.createElement("div");
	
	Mojo.require(stack.getLength() === 0, "Initial ContainerStack length != 0");
	
	stack.pushContainer(div, stack.kSceneLayer);
	Mojo.require(stack.getLength() === 1, "ContainerStack length did not increase.");
	Mojo.require(stack.topContainer() === div, "ContainerStack has wrong top container.");
	
	Mojo.require(stack.removeContainer(div) === true, "Failed to remove container.");
	Mojo.require(stack.getLength() === 0, "Final ContainerStack length != 0");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


/*
	Ordinarily, a dialog should cancel a submenu... but if it has no cancelFunc, then we can't, and they both go on.
*/
ContainerTests.prototype.testNonCancellable = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var div = document.createElement("div");
	var div2 = document.createElement("div");
	
	stack.pushContainer(div2, stack.kSubmenuLayer);
	stack.pushContainer(div, stack.kDialogLayer);
	
	Mojo.require(stack.getLength() === 2, "Bad ContainerStack size");
	Mojo.require(stack.topContainer() === div, "Bad top container");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


/*
	This dialog should cancel the submenu.
*/
ContainerTests.prototype.testCancellable = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var div = document.createElement("div");
	var div2 = document.createElement("div");
	var gotCancelled;
	
	stack.pushContainer(div2, this.submenuContainerLayer, {cancelFunc:function(){gotCancelled = true;}});
	stack.pushContainer(div, this.dialogContainerLayer);
	
	Mojo.require(stack.getLength() === 1, "Bad ContainerStack size");
	Mojo.require(gotCancelled, "Submenu layer did not get cancelled.");
	Mojo.require(stack.topContainer() === div, "Bad top container");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


/*
*/
ContainerTests.prototype.testCancelSome = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var scene = document.createElement("div");
	var dialog1 = document.createElement("div");
	var dialog2 = document.createElement("div");
	
	// Pushing the second dialog should cancel the first one, but not the scene.
	stack.pushContainer(scene, this.sceneContainerLayer, {cancelFunc:function(){scene.gotCancelled = true;}});
	stack.pushContainer(dialog1, this.dialogContainerLayer, {cancelFunc:function(){dialog1.gotCancelled = true;}});
	stack.pushContainer(dialog2, this.dialogContainerLayer, {cancelFunc:function(){dialog2.gotCancelled = true;}});
	
	Mojo.require(stack.getLength() === 2, "Bad ContainerStack size");
	Mojo.require(dialog1.gotCancelled, "Original dialog layer did not get cancelled.");
	Mojo.require(!dialog2.gotCancelled, "New dialog layer got cancelled.");
	Mojo.require(!scene.gotCancelled, "Scene layer got cancelled.");
	Mojo.require(stack.topContainer() === dialog2, "Bad top container");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


ContainerTests.prototype.testCancelSome2 = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var scene = document.createElement("div");
	var dialog1 = document.createElement("div");
	var dialog2 = document.createElement("div");
	
	// Pushing the second dialog should result in it being cancelled, since the first one has no cancelFunc.
	stack.pushContainer(scene, this.sceneContainerLayer, {cancelFunc:function(){scene.gotCancelled = true;}});
	stack.pushContainer(dialog1, this.dialogContainerLayer, {});
	stack.pushContainer(dialog2, this.dialogContainerLayer, {cancelFunc:function(){dialog2.gotCancelled = true;}});
	
	Mojo.require(stack.getLength() === 2, "Bad ContainerStack size");
	Mojo.require(!dialog1.gotCancelled, "Original dialog layer got cancelled.");
	Mojo.require(dialog2.gotCancelled, "New dialog layer did not get cancelled.");
	Mojo.require(!scene.gotCancelled, "Scene layer got cancelled.");
	Mojo.require(stack.topContainer() === dialog1, "Bad top container");
	
	stack.cleanup();
	return Mojo.Test.passed;
};


ContainerTests.prototype.testCancelAll = function(recordResults) {
	var stack = new Mojo.Controller.ContainerStack(this.mockScene);
	var scene = document.createElement("div");
	var dialog = document.createElement("div");
	var submenu = document.createElement("div");
	
	// None should get cancelled, until we call cancelAll(), and then only the scene should be left.
	stack.pushContainer(scene, this.sceneContainerLayer, {});
	stack.pushContainer(dialog, this.dialogContainerLayer, {cancelFunc:function(){dialog.gotCancelled = true;}});
	stack.pushContainer(submenu, this.submenuContainerLayer, {cancelFunc:function(){submenu.gotCancelled = true;}});
	
	Mojo.require(stack.getLength() === 3, "Bad ContainerStack size");
	Mojo.require(!dialog.gotCancelled, "Dialog layer got cancelled.");
	Mojo.require(!submenu.gotCancelled, "Submenu layer got cancelled.");
	Mojo.require(!scene.gotCancelled, "Scene layer got cancelled.");
	Mojo.require(stack.topContainer() === submenu, "Bad top container");
	
	stack.cancelAll();
	
	Mojo.require(stack.getLength() === 1, "Bad ContainerStack size");
	Mojo.require(stack.topContainer() === scene, "Wrong top container");
	Mojo.require(dialog.gotCancelled, "Dialog layer did not get cancelled.");
	Mojo.require(submenu.gotCancelled, "Submenu layer did not get cancelled.");
	Mojo.require(!scene.gotCancelled, "Scene layer got cancelled.");
	Mojo.require(stack.topContainer() === scene, "Bad top container");
	
	stack.cleanup();
	return Mojo.Test.passed;
};




