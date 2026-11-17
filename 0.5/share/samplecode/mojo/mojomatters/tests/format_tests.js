function FormatTests(tickleFunction) {
	this.tickleFunction = tickleFunction;
}

FormatTests.prototype.before = function before() {
	/* months in JavaScript are zero-based */
	//this.dateToFormat = new Date(2008, 3, 14, 10, 21, 50);
	this.dateToFormat = new Date(2008, 2, 8, 3, 1, 43);
	return Mojo.Test.beforeFinished;
};


FormatTests.prototype.testNumberFormat = function testNumberFormat(recordResults) {
	Mojo.requireEqual("11", Mojo.Format.formatNumber(11));
	Mojo.requireEqual("1,111", Mojo.Format.formatNumber(1111));
	Mojo.requireEqual("1,111.00", Mojo.Format.formatNumber(1111, 2));
	Mojo.requireEqual("1,111.00", Mojo.Format.formatNumber(1111, {fractionDigits: 2}));
	Mojo.requireEqual("1,111.0", Mojo.Format.formatNumber(1111, 1));
	Mojo.requireEqual("1,111.0", Mojo.Format.formatNumber(1111, {fractionDigits: 1}));
	Mojo.requireEqual("-1,111", Mojo.Format.formatNumber(-1111));
	Mojo.requireEqual("-1,111.00", Mojo.Format.formatNumber(-1111,2));
	Mojo.requireEqual("-1,111.00", Mojo.Format.formatNumber(-1111, {fractionDigits: 2}));

	Mojo.requireEqual("11", Mojo.Format.formatNumber(11, {countryCode: 'gb'}));
	Mojo.requireEqual("1,111", Mojo.Format.formatNumber(1111, {countryCode: 'gb'}));
	Mojo.requireEqual("1,111.00", Mojo.Format.formatNumber(1111, {countryCode: 'gb', fractionDigits: 2}));
	Mojo.requireEqual("1,111.0", Mojo.Format.formatNumber(1111, {countryCode: 'gb', fractionDigits: 1}));
	Mojo.requireEqual("-1,111", Mojo.Format.formatNumber(-1111, {countryCode: 'gb'}));
	Mojo.requireEqual("-1,111.00", Mojo.Format.formatNumber(-1111, {countryCode: 'gb', fractionDigits: 2}));
	return Mojo.Test.passed;
};

FormatTests.prototype.testCurrencyFormat = function testCurrencyFormat(recordResults) {
	Mojo.requireEqual("$11", Mojo.Format.formatCurrency(11));
	Mojo.requireEqual("$1,111", Mojo.Format.formatCurrency(1111));
	Mojo.requireEqual("$1,111.00", Mojo.Format.formatCurrency(1111, 2));
	Mojo.requireEqual("$1,111.00", Mojo.Format.formatCurrency(1111, {fractionDigits:2}));
	Mojo.requireEqual("$1,111.0", Mojo.Format.formatCurrency(1111, 1));
	Mojo.requireEqual("$1,111.0", Mojo.Format.formatCurrency(1111, {fractionDigits:1}));
	Mojo.requireEqual("$-1,111", Mojo.Format.formatCurrency(-1111));
	Mojo.requireEqual("$-1,111.00", Mojo.Format.formatCurrency(-1111,2));
	Mojo.requireEqual("$-1,111.00", Mojo.Format.formatCurrency(-1111, {fractionDigits:2}));

	Mojo.requireEqual("£11", Mojo.Format.formatCurrency(11, {countryCode: 'gb'}));
	Mojo.requireEqual("£1,111", Mojo.Format.formatCurrency(1111, {countryCode: 'gb'}));
	Mojo.requireEqual("£1,111.00", Mojo.Format.formatCurrency(1111, {countryCode: 'gb', fractionDigits: 2}));
	Mojo.requireEqual("£1,111.0", Mojo.Format.formatCurrency(1111, {countryCode: 'gb', fractionDigits: 1}));
	Mojo.requireEqual("£-1,111", Mojo.Format.formatCurrency(-1111, {countryCode: 'gb'}));
	Mojo.requireEqual("£-1,111.00", Mojo.Format.formatCurrency(-1111, {countryCode: 'gb', fractionDigits: 2}));

	return Mojo.Test.passed;
};

FormatTests.prototype.testPercentFormat = function testPercentFormat(recordResults) {
	Mojo.requireEqual("100%", Mojo.Format.formatPercent(100));
	Mojo.requireEqual("-100%", Mojo.Format.formatPercent(-100));
	Mojo.requireEqual("20%", Mojo.Format.formatPercent(20));

	Mojo.requireEqual("100%", Mojo.Format.formatPercent(100, {countryCode: 'gb'}));
	Mojo.requireEqual("-100%", Mojo.Format.formatPercent(-100, {countryCode: 'gb'}));
	Mojo.requireEqual("20%", Mojo.Format.formatPercent(20), {countryCode: 'gb'});
	return Mojo.Test.passed;
};

FormatTests.prototype.doDateTest = function doDateTest(formatParams, expected) {
	var formatted = Mojo.Format.formatDate(this.dateToFormat, formatParams);
	Mojo.requireEqual(expected, formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.doRelativeTest = function doRelativeTest(formatParams, expected) {
	var formatted = Mojo.Format.formatRelativeDate(this.dateToFormat, formatParams);
	Mojo.requireEqual(expected, formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.doPhoneTest = function doPhoneTest(rawNumber, expected) {
	var formatted = Mojo.Format.formatPhoneNumber(rawNumber);
	Mojo.requireEqual(expected || this.expectedFormattedPhone, formatted);
	return Mojo.Test.passed;
};



FormatTests.prototype.testShortDateTimeFormat = function testShortDateTimeFormat(recordResults) {
	//return this.doDateTest("short", "4/14/08 10:21 AM");
	this.doDateTest("short", "3/8/08 3:01 AM");
	this.doDateTest({format: "short"}, "3/8/08 3:01 AM");
	this.doDateTest({format: "short", countryCode: 'gb'}, "08/03/2008 03:01 AM");
	return Mojo.Test.passed;
};

FormatTests.prototype.testMediumDateTimeFormat = function testMediumDateTimeFormat(recordResults) {
	//return this.doDateTest("medium", "Apr 14, 2008 10:21:50 AM");
	this.doDateTest("medium", "Mar 8, 2008 3:01:43 AM");
	this.doDateTest({format: "medium"}, "Mar 8, 2008 3:01:43 AM");
	this.doDateTest({format: "medium", countryCode: 'gb'}, "8 Mar 2008 03:01:43 AM");
	return Mojo.Test.passed;
};

FormatTests.prototype.testLongDateTimeFormat = function testLongDateTimeFormat(recordResults) {
	//return this.doDateTest("long", "March 8, 2008");
	this.doDateTest("long", "March 8, 2008 3:01:43 AM PST");
	this.doDateTest({format: "long"}, "March 8, 2008 3:01:43 AM PST");
	this.doDateTest({format: "long", countryCode: 'gb'}, "8 March 2008 3:01:43 AM PST");
	return Mojo.Test.passed;
};

FormatTests.prototype.testFullDateTimeFormat = function testFullDateTimeFormat(recordResults) {
	//return this.doDateTest("full", "Monday, April 14, 2008 10:21:50 AM -0700");
	this.doDateTest("full", "Saturday, March 8, 2008 3:01:43 AM PST");
	this.doDateTest({format: "full"}, "Saturday, March 8, 2008 3:01:43 AM PST");
	this.doDateTest({format: "full", countryCode: 'gb'}, "Saturday, 8 March 2008 3:01:43 AM PST");
	return Mojo.Test.passed;
};

FormatTests.prototype.testShortDateFormat = function testShortDateFormat(recordResults) {
	//return this.doDateTest({date: "short"}, "4/14/08");
	this.doDateTest({date: "short"}, "3/8/08");
	this.doDateTest({date: "short", countryCode: 'gb'}, "08/03/2008");
	return Mojo.Test.passed;
};

FormatTests.prototype.testMediumDateFormat = function testMediumDateFormat(recordResults) {
	//return this.doDateTest({date: "medium"}, "Apr 14, 2008");
	this.doDateTest({date: "medium"}, "Mar 8, 2008");
	this.doDateTest({date: "medium", countryCode: 'gb'}, "8 Mar 2008");
	return Mojo.Test.passed;
};

FormatTests.prototype.testLongDateFormat = function testLongDateFormat(recordResults) {
	//return this.doDateTest({date: "long"}, "April 14, 2008");
	this.doDateTest({date: "long"}, "March 8, 2008");
	this.doDateTest({date: "long", countryCode: 'gb'}, "8 March 2008");
	return Mojo.Test.passed;
};

FormatTests.prototype.testFullDateFormat = function testFullDateFormat(recordResults) {
	//return this.doDateTest({date: "full"}, "Monday, April 14, 2008");
	this.doDateTest({date: "full"}, "Saturday, March 8, 2008");
	this.doDateTest({date: "full", countryCode: 'gb'}, "Saturday, 8 March 2008");
	return Mojo.Test.passed;
};

FormatTests.prototype.testShortTimeFormat = function testShortTimeFormat(recordResults) {
	//return this.doDateTest({time: "short"}, "10:21 AM");
	this.doDateTest({time: "short"}, "3:01 AM");
	this.doDateTest({time: "short", countryCode: 'gb'}, "03:01 AM");
	return Mojo.Test.passed;
};

FormatTests.prototype.testMediumTimeFormat = function testMediumTimeFormat(recordResults) {
	//return this.doDateTest({time: "medium"}, "10:21:50 AM");
	this.doDateTest({time: "medium"}, "3:01:43 AM");
	this.doDateTest({time: "medium", countryCode: 'gb'}, "03:01:43 AM");
	return Mojo.Test.passed;
};

FormatTests.prototype.testLongTimeFormat = function testLongTimeFormat(recordResults) {
	//return this.doDateTest({time: "long"}, "10:21:50 AM -0700");
	this.doDateTest({time: "long"}, "3:01:43 AM PST");
	this.doDateTest({time: "long", countryCode: 'gb'}, "03:01:43 AM PST");
	return Mojo.Test.passed;
};

FormatTests.prototype.testFullTimeFormat = function testFullTimeFormat(recordResults) {
	//return this.doDateTest({time: "full"}, "10:21:50 AM -0700");
	this.doDateTest({time: "full"}, "3:01:43 AM PST");
	this.doDateTest({time: "full", countryCode: 'gb'}, "03:01:43 AM PST");
	return Mojo.Test.passed;
};

FormatTests.prototype.testVariousDateTimeFormats = function testVariousDateTimeFormats(recordResults) {
	this.dateToFormat = new Date(2008, 3, 14, 0, 30, 0);
	this.doDateTest({time: "full"}, "12:30:00 AM PST");
	this.doDateTest({time: "full", countryCode: 'gb'}, "12:30:00 AM PST");
	return Mojo.Test.passed;
};

FormatTests.prototype.testHH = function(recordResults) {
	this.dateToFormat = new Date(2008, 3, 14, 14, 30, 0);
	return this.doDateTest("HH:mm", "14:30");
};



FormatTests.prototype.testFirstDayOfWeek = function (recordResults) {
	var first = Mojo.Format.getFirstDayOfWeek();
	Mojo.requireEqual(first, 0);
	first = Mojo.Format.getFirstDayOfWeek({countryCode: 'gb'});
	Mojo.requireEqual(first, 1);
	return Mojo.Test.passed;
};

FormatTests.prototype.testRelativeToday = function (recordResults) {
	this.dateToFormat = new Date();
	this.doRelativeTest("short", "today");
	this.doRelativeTest({format: "short", countryCode: 'gb'}, "today");
	return Mojo.Test.passed;
};

FormatTests.prototype.testRelativeTomorrow = function (recordResults) {
	this.dateToFormat = new Date();
	this.dateToFormat.setDate(this.dateToFormat.getDate() + 1);
	this.doRelativeTest("short", "tomorrow");
	this.doRelativeTest({format: "short", countryCode: 'gb'}, "tomorrow");
	return Mojo.Test.passed;
};

FormatTests.prototype.testRelativeYesterday = function (recordResults) {
	this.dateToFormat = new Date();
	this.dateToFormat.setDate(this.dateToFormat.getDate() - 1);
	this.doRelativeTest("short", "yesterday");
	this.doRelativeTest({format: "short", countryCode: 'gb'}, "yesterday");
	return Mojo.Test.passed;
};
/*
FormatTests.prototype.testRelativeLastWeek = function (recordResults) {
	this.dateToFormat = new Date();
	this.dateToFormat.setDate(this.dateToFormat.getDate() - 2);
	return this.doRelativeTest("full", "Tuesday");
};
*/
FormatTests.prototype.testRelativeFuture = function (recordResults) {
	this.dateToFormat = new Date(2009, 3, 14, 14, 30, 0);
	this.doRelativeTest("short", "4/14/09");
	this.doRelativeTest({format: "short", countryCode: 'gb'}, "14/04/2009");
	return Mojo.Test.passed;
};

FormatTests.prototype.testRelativePast = function (recordResults) {
	this.dateToFormat = new Date(2007, 3, 14, 14, 30, 0);
	this.doRelativeTest("medium", "Apr 14, 2007")
	this.doRelativeTest({format: "medium", countryCode: 'gb'}, "14 Apr 2007");
	return Mojo.Test.passed;
};

FormatTests.prototype.testEscapedLetters = function(recordResults) {
	this.dateToFormat = new Date(2008, 10, 25, 14, 30, 0);
	this.doDateTest("d 'de' MMMM 'de' yyyy ' ''", "25 de November de 2008 ' ''");
	this.doDateTest({format:"d 'de' MMMM 'de' yyyy ' ''", countryCode:'gb'}, "25 de November de 2008 ' ''");
	return Mojo.Test.passed;
};

FormatTests.prototype.testEEE = function(recordResults) {
	this.dateToFormat = new Date(2008, 10, 25, 14, 30, 0);
	this.doDateTest("EEE", "Tue");
	this.doDateTest({format: "EEE", countryCode: 'gb'}, "Tue");
	return Mojo.Test.passed;
};


FormatTests.prototype.testDateTimeMismatch = function(recordResults) {
	this.dateToFormat = new Date(2008, 10, 25, 14, 30, 1);
	this.doDateTest({date:"short", time:"long"}, "11/25/08 2:30:01 PM PST");
	this.doDateTest({date:"short", time:"long", countryCode:'gb'}, "25/11/08 14:30:01 PST");
	return Mojo.Test.passed;
};


FormatTests.prototype.test24hrSwitching = function(recordResults) {
	var formatParams = {date:"short", time:"long"};
	var expected12 = "11/25/08 2:30:01 PM PST";
	var expected24 = "11/25/08 14:30:01 PST";
	var formatted;
	var oldTimeSetting = Mojo.Format.using12HrTime;
	this.dateToFormat = new Date(2008, 10, 25, 14, 30, 1);

	Mojo.Format._using12HrTime = false;
	formatted= Mojo.Format.formatDate(this.dateToFormat, formatParams);
	Mojo.requireEqual(expected24, formatted);
	Mojo.Log.info(formatted);

	Mojo.Format._using12HrTime = true;
	formatted= Mojo.Format.formatDate(this.dateToFormat, formatParams);
	Mojo.requireEqual(expected12, formatted);
	Mojo.Log.info(formatted);

	Mojo.Format.using12HrTime = oldTimeSetting;
	return Mojo.Test.passed;
};



FormatTests.prototype.testSMSPassThrough = function(recordResults) {
	this.doPhoneTest('466453', '466453');
	return Mojo.Test.passed;
};

FormatTests.prototype.testLocalUSPhone = function(recordResults) {
	this.expectedFormattedPhone = '234-5678';
	this.doPhoneTest('2345678');
	this.doPhoneTest('234-5678');
	this.doPhoneTest('234 5678');
	this.doPhoneTest('234.5678');
	return Mojo.Test.passed;
};

FormatTests.prototype.testLongDistanceUSPhone = function(recordResults) {
	this.expectedFormattedPhone = ' (234) 567-8901';
	this.doPhoneTest('2345678901');
	this.doPhoneTest('234-567-8901');
	this.doPhoneTest('234 567 8901');
	this.doPhoneTest('234.567.8901');
	return Mojo.Test.passed;
};

FormatTests.prototype.testPrefixedLongDistanceUSPhone = function(recordResults) {
	this.expectedFormattedPhone = '1 (234) 567-8901';
	this.doPhoneTest('12345678901');
	this.doPhoneTest('1 234-567-8901');
	this.doPhoneTest('1 234 567 8901');
	this.doPhoneTest('1.234.567.8901');
	return Mojo.Test.passed;
};

FormatTests.prototype.testPlusOneLongDistanceUSPhone = function() {
	this.doPhoneTest('+12345678901', '+1 (234) 567-8901');
	return Mojo.Test.passed;
};

FormatTests.prototype.testInternationalPhone = function(recordResults) {
	this.doPhoneTest('02345678', '02345678');	// UK and Ireland
	this.doPhoneTest('+02345678', '+02345678');	// UK and Ireland
	this.doPhoneTest('023456789', '023456789');	// France
	this.doPhoneTest('+023456789', '+023456789');	// France
	this.doPhoneTest('23456789', '23456789');	// Mexico
	this.doPhoneTest('+23456789', '+23456789');	// Mexico
	return Mojo.Test.passed;
};

FormatTests.prototype.testBogusPhone = function(recordResults) {
	// Should return unrecognized "numbers" unchanged.
	this.doPhoneTest('--1234', '--1234');
	this.doPhoneTest("Mom's office number (432)2575652", "Mom's office number (432)2575652");
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceZero = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(0, "0#There are no files|1#There is one file|2#There are 2 files", model);
	Mojo.requireEqual("There are no files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceOne = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(1, "0#There are no files|1#There is one file|2#There are 2 files", model);
	Mojo.requireEqual("There is one file", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceTwo = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(2, "0#There are no files|1#There is one file|2#There are 2 files", model);
	Mojo.requireEqual("There are 2 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceNegative = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(-1, "0#There are no files|-1#The number is minus one|2#There are 2 files", model);
	Mojo.requireEqual("The number is minus one", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceNone = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(18, "0#There are no files|1#There is one file|2#There are 2 files", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceUseDefault = function(recordResults) {
	var model = {};
	var formatted = Mojo.Format.formatChoice(18, "0#There are no files|1#There is one file|2#There are 2 files|#There are a number of files.", model);
	Mojo.requireEqual("There are a number of files.", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceReplacement = function(recordResults) {
	var model = { num: 5 };
	var formatted = Mojo.Format.formatChoice(2, "0#There are no files|1#There is one file|2#There are #{num} files", model);
	Mojo.requireEqual("There are 5 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceReplacementMissing = function(recordResults) {
	var model = { };
	var formatted = Mojo.Format.formatChoice(2, "0#There are no files|1#There is one file|2#There are #{num} files", model);
	Mojo.requireEqual("There are  files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeGreaterThan = function(recordResults) {
	var model = { num: 6 };
	var formatted = Mojo.Format.formatChoice(6, "0#There are no files|1#There is one file|2>#There are #{num} files", model);
	Mojo.requireEqual("There are 6 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeLessThan = function(recordResults) {
	var model = { num: -5 };
	var formatted = Mojo.Format.formatChoice(-2, "0#There are no files|1#There is one file|-1<#There are #{num} files", model);
	Mojo.requireEqual("There are -5 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeGreaterThanFraction = function(recordResults) {
	var model = { num: 2.1 };
	var formatted = Mojo.Format.formatChoice(2.1, "0#There are no files|1#There is one file|2>#There are #{num} files", model);
	Mojo.requireEqual("There are 2.1 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeLessThanFraction = function(recordResults) {
	var model = { num: -1.4 };
	var formatted = Mojo.Format.formatChoice(-1.4, "0#There are no files|1#There is one file|-1<#There are #{num} files", model);
	Mojo.requireEqual("There are -1.4 files", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeGreaterThanNotEqual = function(recordResults) {
	var model = { num: 2 };
	var formatted = Mojo.Format.formatChoice(2, "#Default|1#There is one file|2>#There are #{num} files", model);
	Mojo.requireEqual("Default", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceRangeLessThanNotEqual = function(recordResults) {
	var model = { num: -1 };
	var formatted = Mojo.Format.formatChoice(-1, "#Default|1#There is one file|-1<#There are #{num} files", model);
	Mojo.requireEqual("Default", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceNullFormat = function(recordResults) {
	var model = { num: -5 };
	var formatted = Mojo.Format.formatChoice(-2, "", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceSingleFormatPositive = function(recordResults) {
	var model = { num: -5 };
	var formatted = Mojo.Format.formatChoice(2, "2#This is the only string", model);
	Mojo.requireEqual("This is the only string", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceSingleFormatNegative = function(recordResults) {
	var model = { num: -5 };
	var formatted = Mojo.Format.formatChoice(0, "2#This is the only string", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceBadFormat = function(recordResults) {
	var model = { num: -5 };
	var formatted = Mojo.Format.formatChoice(2, "This is the only string", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceNoString = function(recordResults) {
	var model = { num: 5 };
	var formatted = Mojo.Format.formatChoice(0, "0#|1#There is one file|2#There are #{num} files", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceNoSeparator = function(recordResults) {
	var model = { num: 5 };
	var formatted = Mojo.Format.formatChoice(1, "1There is one file|2#There are #{num} files", model);
	Mojo.requireEqual("", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceLargeNumber = function(recordResults) {
	var count = 90;
	var model = { count: count, start: "start_time", end: "end_time" };
	var formatted = Mojo.Format.formatChoice(count, "1#This event starts on #{start} and ends on #{end} and it occurs 1 time.|101<#This event starts on #{start} and ends on #{end} and it occurs #{count} times.|#This event starts on #{start} and ends on #{end} and there are more than 100 occurrences left.", model);
	Mojo.requireEqual("This event starts on start_time and ends on end_time and it occurs 90 times.", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceLargeNumberDefault = function(recordResults) {
	var count = 108;
	var model = { count: count, start: "start_time", end: "end_time" };
	var formatted = Mojo.Format.formatChoice(count, "1#This event starts on #{start} and ends on #{end} and it occurs 1 time.|101<#This event starts on #{start} and ends on #{end} and it occurs #{count} times.|#This event starts on #{start} and ends on #{end} and there are more than 100 occurrences left.", model);
	Mojo.requireEqual("This event starts on start_time and ends on end_time and there are more than 100 occurrences left.", formatted);
	return Mojo.Test.passed;
};

FormatTests.prototype.testFormatChoiceLargeNumberDefault = function(recordResults) {
	var count = 1;
	var model = { count: count, start: "start_time", end: "end_time" };
	var formatted = Mojo.Format.formatChoice(count, "1#This event starts on #{start} and ends on #{end} and it occurs 1 time.|101<#This event starts on #{start} and ends on #{end} and it occurs #{count} times.|#This event starts on #{start} and ends on #{end} and there are more than 100 occurrences left.", model);
	Mojo.requireEqual("This event starts on start_time and ends on end_time and it occurs 1 time.", formatted);
	return Mojo.Test.passed;
};
