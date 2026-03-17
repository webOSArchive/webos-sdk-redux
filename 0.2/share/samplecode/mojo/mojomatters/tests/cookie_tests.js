function CookieTests() {
}

CookieTests.prototype.createDogCookie = function createDogCookie(cookieName, testObject) {
	var cookie = new Mojo.Model.Cookie(cookieName);
	var dogName = "Dawson";
	cookie.put(testObject);
	return cookie;
};

CookieTests.prototype.testPutGet = function testPutGet(recordResults) {
	var cookieName = "dog" + Date.now();
	var dogName = "Dawson";
	var testObject = {name: dogName};
	var cookie = this.createDogCookie(cookieName, testObject);
	var storedObject = cookie.get();
	Mojo.requireEqual(dogName, storedObject.name);
	Mojo.require(testObject !== storedObject, "stored object must not be the same object as the test object.");
	cookie.remove();
	return Mojo.Test.passed;
};

CookieTests.prototype.testDelete = function testPutGet(recordResults) {
	var cookieName = "dog" + Date.now();
	var dogName = "Dawson";
	var testObject = {name: dogName};
	var cookie = this.createDogCookie(cookieName, testObject);
	var storedObject = cookie.get();
	Mojo.requireEqual(dogName, storedObject.name);
	cookie.remove();
	var storedObjectAfterDelete = cookie.get();
	Mojo.require(storedObjectAfterDelete === undefined, "after a delete the stored object should be undefined.")
	return Mojo.Test.passed;
};

CookieTests.prototype.testTwo = function testTwo(recordResults) {
	var cookieName = "dog" + Date.now();
	var cookie2Name = "cat" + Date.now();
	var dogName = "Dawson";
	var testObject = {name: dogName};
	var cookie1 = this.createDogCookie(cookieName, testObject);
	var cookie2 = this.createDogCookie(cookie2Name, testObject);
	var storedObject = cookie1.get();
	Mojo.requireEqual(dogName, storedObject.name);
	Mojo.require(testObject !== storedObject, "stored object must not be the same object as the test object.");
	return Mojo.Test.passed;
};

CookieTests.prototype.testEquals = function testEquals(recordResults) {
	var cookie = new Mojo.Model.Cookie("withEquals");
	var testObject = {value: "this = that"}
	cookie.put(testObject);
	var storedObject = cookie.get();
	Mojo.requireEqual(testObject.value, storedObject.value);
	return Mojo.Test.passed;
};


CookieTests.prototype.testTwoNames = function testTwoNames(recordResults) {
	var cookieName = "dog" + Date.now();
	var cookie2Name = "cat" + Date.now();
	var dogName = "Dawson";
	var dogName2 = "Nutmeg";
	var testObject1 = {name: dogName};
	var testObject2 = {name: dogName2};
	var cookie1 = this.createDogCookie(cookieName, testObject1);
	var cookie2 = this.createDogCookie(cookie2Name, testObject2);
	var dawsonObject = cookie1.get();
	Mojo.requireEqual(testObject1.value, dawsonObject.value);
	return Mojo.Test.passed;
};
