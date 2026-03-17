describe('Messaging BucketDateFormatter Unit Test', function() {

	it('BucketDateFormatter.createNewDateWithClearedTime() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var nowDate = new Date();
		var newDate = BucketDateFormatter.createNewDateWithClearedTime(nowDate);		
		expect(newDate).toBeTruthy();
		expect(newDate.getHours() === 0).toBeTruthy();
		expect(newDate.getMinutes() === 0).toBeTruthy();
		expect(newDate.getSeconds() === 0).toBeTruthy();
		expect(newDate.getMilliseconds() === 0).toBeTruthy();
		expect(newDate.getDate() === nowDate.getDate()).toBeTruthy();
		expect(newDate.getDay() === nowDate.getDay()).toBeTruthy();
		expect(newDate.getFullYear() === nowDate.getFullYear()).toBeTruthy();
		expect(newDate.getMonth() === nowDate.getMonth()).toBeTruthy();		
	});	
	
	// Currently, getDateBucket has parameters utcTimestamp, shouldAppendTime, and showTodayTimeOnly but
	// only utcTimestamp is used. If the other params are going to be used, then test should be added.
	it('BucketDateFormatter.getDateBucket() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var todayDate = new Date();
	
		expect(BucketDateFormatter.getDateBucket(todayDate)).toEqual("TODAY ");
		
		var tomorrowTime = todayDate.getTime() + BucketDateFormatter.CONST.DAY_IN_MS;
		expect(BucketDateFormatter.getDateBucket(new Date(tomorrowTime))).toEqual("TOMORROW");
		
		var nextWeekTime = todayDate.getTime() + (BucketDateFormatter.CONST.DAY_IN_MS * 7);
		expect(BucketDateFormatter.getDateBucket(new Date(nextWeekTime))).toEqual("NEXT WEEK");
		
		var twoWeeksFromNowTime = todayDate.getTime() + (BucketDateFormatter.CONST.DAY_IN_MS * 14);
		expect(BucketDateFormatter.getDateBucket(new Date(twoWeeksFromNowTime))).toEqual("2 WEEKS FROM NOW");
		
		var threeWeeksFromNowTime = todayDate.getTime() + (BucketDateFormatter.CONST.DAY_IN_MS * 21);
		expect(BucketDateFormatter.getDateBucket(new Date(threeWeeksFromNowTime))).toEqual("3 WEEKS FROM NOW");				
		
		var lastWeekTime = todayDate.getTime() - (BucketDateFormatter.CONST.DAY_IN_MS * 7);
		expect(BucketDateFormatter.getDateBucket(new Date(lastWeekTime))).toEqual("LAST WEEK");
		
		var twoWeeksAgoTime = todayDate.getTime() - (BucketDateFormatter.CONST.DAY_IN_MS * 14);
		expect(BucketDateFormatter.getDateBucket(new Date(twoWeeksAgoTime))).toEqual("2 WEEKS AGO");
		
		var threeWeeksAgoTime = todayDate.getTime() - (BucketDateFormatter.CONST.DAY_IN_MS * 21);
		expect(BucketDateFormatter.getDateBucket(new Date(threeWeeksAgoTime))).toEqual("3 WEEKS AGO");
	});	
	
	it('BucketDateFormatter.getDateBucketFromInstant() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var days;
		var testDate = new Date();
		var referencePointDate = BucketDateFormatter.createNewDateWithClearedTime(new Date());
		var localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		
		var oneMonthAgo = referencePointDate.getTime() - ((referencePointDate.getDay() + (3*BucketDateFormatter.CONST.DAYS_PER_WEEK))*BucketDateFormatter.CONST.DAY_IN_MS);	
		var oneMonthFuture = referencePointDate.getTime() + ((BucketDateFormatter.CONST.DAYS_PER_WEEK - referencePointDate.getDay() + 3*BucketDateFormatter.CONST.DAYS_PER_WEEK)*BucketDateFormatter.CONST.DAY_IN_MS);

		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("TODAY ");
				
		testDate.setTime(testDate.getTime() + BucketDateFormatter.CONST.DAY_IN_MS);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("TOMORROW");

		var nextWeek = referencePointDate.getTime() + (BucketDateFormatter.CONST.DAYS_PER_WEEK * BucketDateFormatter.CONST.DAY_IN_MS);
		testDate = new Date(nextWeek);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("NEXT WEEK");
		
		var twoWeeksFuture = referencePointDate.getTime() + (2 * BucketDateFormatter.CONST.DAYS_PER_WEEK * BucketDateFormatter.CONST.DAY_IN_MS);
		testDate = new Date(twoWeeksFuture);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("2 WEEKS FROM NOW");
				
		var threeWeeksFuture = referencePointDate.getTime() + (3 * BucketDateFormatter.CONST.DAYS_PER_WEEK * BucketDateFormatter.CONST.DAY_IN_MS);
		testDate = new Date(threeWeeksFuture);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("3 WEEKS FROM NOW");
		
		var lastWeek = referencePointDate.getTime() - ((BucketDateFormatter.CONST.DAYS_PER_WEEK*BucketDateFormatter.CONST.DAY_IN_MS));
		testDate = new Date(lastWeek);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("LAST WEEK");
		
		var twoWeeksAgo = referencePointDate.getTime() - (2 * BucketDateFormatter.CONST.DAYS_PER_WEEK * BucketDateFormatter.CONST.DAY_IN_MS);
		testDate = new Date(twoWeeksAgo);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("2 WEEKS AGO");
				
		var threeWeeksAgo = referencePointDate.getTime() - (3 * BucketDateFormatter.CONST.DAYS_PER_WEEK * BucketDateFormatter.CONST.DAY_IN_MS);
		testDate = new Date(threeWeeksAgo);
		localDate = BucketDateFormatter.createNewDateWithClearedTime(testDate);
		expect(BucketDateFormatter.getDateBucketFromInstant(testDate, localDate, referencePointDate, "")).toEqual("3 WEEKS AGO");	
	});
	
	
	it('BucketDateFormatter.subtract() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var today = new Date();
		var tomorrow = new Date(today.getTime() + BucketDateFormatter.CONST.DAY_IN_MS);
		expect(BucketDateFormatter.subtract(today.getTime(), tomorrow.getTime())).toEqual(today.getTime() - tomorrow.getTime());
		expect(BucketDateFormatter.subtract(today.getTime(), tomorrow)).toEqual(today.getTime() - tomorrow.getTime());
		expect(BucketDateFormatter.subtract(today, tomorrow.getTime())).toEqual(today.getTime() - tomorrow.getTime());
		expect(BucketDateFormatter.subtract(today, tomorrow)).toEqual(today.getTime() - tomorrow.getTime());
	});	
	
	it('BucketDateFormatter.isAfter() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var today = new Date();
		var yesterday = new Date(today.getTime() - BucketDateFormatter.CONST.DAY_IN_MS);
		var tomorrow = new Date(today.getTime() + BucketDateFormatter.CONST.DAY_IN_MS);
		
		expect(BucketDateFormatter.isAfter(today.getTime(), today.getTime())).toBeFalsy();
		expect(BucketDateFormatter.isAfter(today.getTime(), yesterday.getTime())).toBeTruthy();		
		expect(BucketDateFormatter.isAfter(today.getTime(), tomorrow.getTime())).toBeFalsy();
		
	});	
	
	it('BucketDateFormatter.isBefore() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var today = new Date();
		var yesterday = new Date(today.getTime() - BucketDateFormatter.CONST.DAY_IN_MS);
		var tomorrow = new Date(today.getTime() + BucketDateFormatter.CONST.DAY_IN_MS);
		
		expect(BucketDateFormatter.isBefore(today.getTime(), today.getTime())).toBeFalsy();
		expect(BucketDateFormatter.isBefore(today.getTime(), yesterday.getTime())).toBeFalsy();	
		expect(BucketDateFormatter.isBefore(today.getTime(), tomorrow.getTime())).toBeTruthy();
		
	});	
	
	it('BucketDateFormatter.isEqual() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var today = new Date();
		var yesterday = new Date(today.getTime() - BucketDateFormatter.CONST.DAY_IN_MS);
		var tomorrow = new Date(today.getTime() + BucketDateFormatter.CONST.DAY_IN_MS);
		
		expect(BucketDateFormatter.isEqual(today.getTime(), today.getTime())).toBeTruthy();
		expect(BucketDateFormatter.isEqual(today.getTime(), yesterday.getTime())).toBeFalsy();
		expect(BucketDateFormatter.isEqual(today.getTime(), tomorrow.getTime())).toBeFalsy();
	});
	
	it('BucketDateFormatter.wipeTime() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		var today = new Date();
		BucketDateFormatter.wipeTime(today);
		expect(today.getHours()).toEqual(0);
		expect(today.getMinutes()).toEqual(0);
		expect(today.getSeconds()).toEqual(0);
		expect(today.getMilliseconds()).toEqual(0);
	});

	it('BucketDateFormatter.isNumber() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		expect(BucketDateFormatter.isNumber(undefined)).toBeFalsy();
		expect(BucketDateFormatter.isNumber(null)).toBeFalsy();
		expect(BucketDateFormatter.isNumber("1")).toBeFalsy();
		expect(BucketDateFormatter.isNumber("a")).toBeFalsy();
		expect(BucketDateFormatter.isNumber(1)).toBeTruthy();
		expect(BucketDateFormatter.isNumber(-1)).toBeTruthy();
		expect(BucketDateFormatter.isNumber(1.2)).toBeTruthy();
		expect(BucketDateFormatter.isNumber(-1.2)).toBeTruthy();
	});

	it('BucketDateFormatter.getDayOfWeek() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		expect(BucketDateFormatter.getDayOfWeek(new Date("JULY 3, 2011"))).toEqual("Sunday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 4, 2011"))).toEqual("Monday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 5, 2011"))).toEqual("Tuesday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 6, 2011"))).toEqual("Wednesday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 7, 2011"))).toEqual("Thursday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 8, 2011"))).toEqual("Friday");
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 9, 2011"))).toEqual("Saturday");	
		expect(BucketDateFormatter.getDayOfWeek(new Date("July 32, 2011"))).toEqual("");
	});

	it('BucketDateFormatter.getMonthOfYear() Test', function() {
		expect(BucketDateFormatter).toBeTruthy();

		expect(BucketDateFormatter.getMonthOfYear(new Date("JULY 4, 2011"))).toEqual("July 2011");
		expect(BucketDateFormatter.getMonthOfYear(new Date("June 4, 1970"))).toEqual("June 1970");
		expect(BucketDateFormatter.getMonthOfYear(new Date("March 4, 2222"))).toEqual("March 2222");
	});
	
})