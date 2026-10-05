function LocaleTest() {
	Mojo.require(Mojo.Locale.current === 'en_us', "Locale tests must be run in US English");
}

LocaleTest.prototype.confirmString = function(testStr, resultStr) {
	Mojo.require(resultStr === testStr, "Look-up failed; wanted '" + testStr + "', got '" + resultStr + "'");
};

LocaleTest.prototype.confirmArray = function(first, second) {
	Mojo.requireEqual(first.length, second.length);
	for (var i = 0; i < first.length; ++i) {
		Mojo.requireEqual(first[i], second[i]);
	}
};

LocaleTest.prototype.confirmLocaleArray = function(arrayFile, testArray) {
	var a = Mojo.Locale.readStringTable(arrayFile, 'en_us', Mojo.Locale.resourcePath, LocaleTest.arrayMerger);
	Mojo.require(a, "Failed to read string table '" + arrayFile + "'");
	Mojo.require(a.length, "Loaded empty array from '" + arrayFile + "'");
	Mojo.require(a.length === testArray.length, "Expected length " + testArray.length + ", got length " + a.length + " (" + arrayFile + ")");
	for (var i = 0; i < testArray.length; ++i) {
		Mojo.require(a[i].text === testArray[i].text, "Expected text '" + testArray[i].text + "', got '{" + a[i].text + "' (" + arrayFile + ")");
		Mojo.require(a[i].index === testArray[i].index, "Expected index '" + testArray[i].index + "', got '{" + a[i].index + "' (" + arrayFile + ")");
	}
};

LocaleTest.prototype.confirmStringTable = function(stringTableFile, testStrings) {
	var fieldName;
	var s = Mojo.Locale.readStringTable(stringTableFile, 'en_us', Mojo.Locale.resourcePath);
	Mojo.require(s, "Failed to read string table '" + stringTableFile + "'");
	for (var i = 1; i < 5; ++i) {
		fieldName = 'String ' + i;
		Mojo.require(s[fieldName] === testStrings[fieldName], "Expected '" + testStrings[fieldName] + "' for field [" + fieldName + "], got '" + s[fieldName] + "' (" + stringTableFile + ")");
	}
};

LocaleTest.prototype.doMonthNameTest = function(length) {
	var m = Mojo.Locale.getMonthNames(length);
	this.confirmArray(LocaleTest.monthNames[length], m);
};

LocaleTest.prototype.doDayNameTest = function(length) {
	var m = Mojo.Locale.getDayNames(length);
	this.confirmArray(LocaleTest.dayNames[length], m);
};

LocaleTest.prototype.testLStrings = function() {
	var s = "Locale Unit Tests supercalifragilisticexpialidocious unlocalized test string";
	this.confirmString(s, $L(s));
	this.confirmString(s, $LL(s));

	this.confirmString(LocaleTest.appTestString1, $L("Test String 1"));
	this.confirmString(LocaleTest.appTestString2, $L("Test String 2"));

	// We don't want to have test strings floating around in the framework, so
	// these are commented out.  But if the strings are added, this will work.
	// Honestly!
//	this.confirmString(LocaleTest.frameworkTestString1, $LL("Test String 1"));
//	this.confirmString(LocaleTest.frameworkTestString2, $LL("Test String 2"));

	return Mojo.Test.passed;
};

LocaleTest.prototype.testTemplates = function() {
	this.confirmString(LocaleTest.templateTest1, Mojo.View.render({template:'locale_tests/locale_tests_1'}));
	this.confirmString(LocaleTest.templateTest2, Mojo.View.render({template:'locale_tests/locale_tests_2'}));
	this.confirmString(LocaleTest.templateTest3, Mojo.View.render({template:'locale_tests/locale_tests_3'}));
	this.confirmString(LocaleTest.templateTest4, Mojo.View.render({template:'locale_tests/locale_tests_4'}));

	return Mojo.Test.passed;
};

LocaleTest.prototype.testArrays = function() {
	var that = this;
	$R(1, 4).each(function(i) {
		that.confirmLocaleArray('locale_array_test_' + i + '.json', LocaleTest['arrayTest' + i]);
	});
	return Mojo.Test.passed;
};

LocaleTest.prototype.testStrings = function() {
	var that = this;
	$R(1, 4).each(function(i) {
		that.confirmStringTable('locale_string_test_' + i + '.json', LocaleTest['stringsTest' + i]);
	});
	return Mojo.Test.passed;
};

LocaleTest.prototype.testMonthNames = function() {
	this.doMonthNameTest('long');
	this.doMonthNameTest('medium');
	this.doMonthNameTest('short');
	this.doMonthNameTest('single');
	return Mojo.Test.passed;
};

LocaleTest.prototype.testDayNames = function() {
	this.doDayNameTest('long');
	this.doDayNameTest('medium');
	this.doDayNameTest('short');
	this.doDayNameTest('single');
	return Mojo.Test.passed;
};

// $L test data
LocaleTest.appTestString1 = "App en 1";
LocaleTest.appTestString2 = "App en/us 2";
LocaleTest.frameworkTestString1 = "Framework en 1";
LocaleTest.frameworkTestString2 = "Framework en/us 2";

// Template test data
LocaleTest.templateTest1 = "Base locale test 1";
LocaleTest.templateTest2 = "en locale test 2";
LocaleTest.templateTest3 = "en/us locale test 3";
LocaleTest.templateTest4 = "en_us locale test 4";

// Array string table test data
LocaleTest.arrayTest1 = [
	{index: 1, text: 'Base locale array test'},
	{index: 2, text: 'Base locale array test'},
	{index: 3, text: 'Base locale array test'},
	{index: 4, text: 'Base locale array test'}
];
LocaleTest.arrayTest2 = [
	{index: 1, text: 'Base locale array test'},
	{index: 2, text: 'en locale array test'},
	{index: 3, text: 'en locale array test'},
	{index: 4, text: 'en locale array test'}
];
LocaleTest.arrayTest3 = [
	{index: 1, text: 'Base locale array test'},
	{index: 2, text: 'en locale array test'},
	{index: 3, text: 'en/us locale array test'},
	{index: 4, text: 'en/us locale array test'}
];
LocaleTest.arrayTest4 = [
	{index: 4, text: 'en_us locale array test'}
];
LocaleTest.arrayMerger = Mojo.Locale.mergeArrayStringTables.curry(function(a,b) { return a.index - b.index; });

// Object string table test data
LocaleTest.stringsTest1 = {
	'String 1': 'Base locale string test',
	'String 2': 'Base locale string test',
	'String 3': 'Base locale string test',
	'String 4': 'Base locale string test'
};
LocaleTest.stringsTest2 = {
	'String 1': 'Base locale string test',
	'String 2': 'en locale string test',
	'String 3': 'en locale string test',
	'String 4': 'en locale string test'
};
LocaleTest.stringsTest3 = {
	'String 1': 'Base locale string test',
	'String 2': 'en locale string test',
	'String 3': 'en/us locale string test',
	'String 4': 'en/us locale string test'
};
LocaleTest.stringsTest4 = {
	'String 1': undefined,
	'String 2': undefined,
	'String 3': undefined,
	'String 4': 'en_us locale string test'
};
LocaleTest.monthNames = {
	"long":   ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	"medium": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	"short":  ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
	"single": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
};
LocaleTest.dayNames = {
	"long":   ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	"medium": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"short":  ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	"single": ["S", "M", "T", "W", "T", "F", "S"]
};