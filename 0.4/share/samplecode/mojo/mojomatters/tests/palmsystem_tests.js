function PalmSystemTests() {
}

PalmSystemTests.prototype.testGetIdentifier = function() {
	var id = Mojo.Controller.getAppController().getIdentifier();
	Mojo.require(id.startsWith('com.palm.app.framework-library') || id.startsWith('framework-library'));
	return Mojo.Test.passed;
};

PalmSystemTests.prototype.testIsMinimal = function() {
	var isMinimal = Mojo.Controller.getAppController().isMinimal();
	Mojo.require(!isMinimal);
	return Mojo.Test.passed;
};

PalmSystemTests.prototype.testVersion = function() {
	var version = Mojo.Environment.version;
	Mojo.require(version === 'mojo-host' || 'WebKit3.1; device');
	return Mojo.Test.passed;
};
