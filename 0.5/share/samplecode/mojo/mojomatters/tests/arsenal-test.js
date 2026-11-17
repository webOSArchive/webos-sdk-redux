function TestDepot(tickleFunction) {
    this.tickleFunction = tickleFunction;
}


/*******compound generic accessors.**/
/**
 * Function to chain a sequence of depot adds/gets/removes. (not atomic wrt adds/gets/removes.)
 *
 * @param {Object} funcArgPairs         [["add"/"get"/"remove",argToSpecifiedFunc],...]
 *
 * onSuccess (optional) - called with result from last chain command (if any) on success
 * onFailure (optional) - called with (index of failure, error message string) on failure of any of the
 *                        adds/gets/removes.
 *                        does not continue executing chain afterwards.
 *
 */
TestDepot.prototype.chain = function (funcArgPairs, onSuccess, onFailure) {
    var curSuccess = onSuccess;
    var curFailure = onFailure;
    for(var i = funcArgPairs.length - 1; i >= 0; i--) {
		var curFunc = funcArgPairs[i][0];
		var curArg = funcArgPairs[i][1];
		curArg.onSuccess = curSuccess;
		curArg.onFailure = curFailure.bind(this, i);

		curSuccess = this[curFunc].bind(this, curArg);
    }

    this[funcArgPairs[0][0]](funcArgPairs[0][1]);
};


/**
 * Function to chain a series of depot adds/gets/removes. (atomic.)
 *
 * @param {Object} funcArgPairs         [["add"/"get"/"remove",argToSpecifiedFunc],...]
 *
 * onSuccess (optional) - called with result from last chain command (if any) on success
 * onFailure (optional) - called with (index of failure, error message string) on failure of any of the
 *                        adds/gets/removes.
 *                        does not continue executing chain afterwards.
 *
 */
//FIXME:
TestDepot.prototype.atomicChain = function(funcArgPairs, onSuccess, onFailure) {
    var sqlStrings = [];
    for(var i=0; i < funcArgPairs.length; i++) {
		var baseFunc = funcArgPairs[i][0];
		var curArg = funcArgPairs[i][1];
		sqlStrings = sqlStrings.concat(this["_"+baseFunc + "Sql"](curArg));
    }

    this.sqlBuilder.execSqlList(sqlStrings, onSuccess, onFailure);

};


/*******generic accessors.***********/
/**
 * Function to add an object, bucket, or set of objects to the depot.
 * @param {Object} args         requires properties : set ([{bucket:__, key:__, value:__, (filters:[__,...])}, ...]) OR
 *                                                    {bucket:__, key:__, value:__}
 *
 *                              onSuccess (optional) - called with no args on success
 *                              onFailure (optional) - called with error message string on failure
 *
 */
TestDepot.prototype.add = function(args) {
	//	this.depot._dumpTables();
    if(args.set) {
		this.depot.addMultiple(args.set, args.onSuccess, args.onFailure);
		/*
		  } else if(args.bucket && args.keys && args.values) {
		  this.addSet(args.bucket, args.keys, args.values, args.onSuccess, args.onFailure);
		*/
    } else if (args.bucket && args.key && args.value) {
		this.depot.addSingle(args.bucket, args.key, args.value, args.filters, args.onSuccess, args.onFailure);
	} else if (args.identifiers) {
		this.depot.addIdentifiers(args.identifiers);
		args.onSuccess();
    } else if (args.simple) {
		this.depot.simpleAdd(args.simple[0], args.simple[1], args.onSuccess, args.onFailure);
	} else {
		if(args.onFailure) {
			args.onFailure("Insufficient arguments to depot add.");
		}
    }
};



/**
 * Function to remove an object or bucket from the depot.
 * @param {Object} args         bucket (required) - bucket of object(s) to remove
 *                              key (optional) - removes specified obj if given, entire bucket if omitted
 *                              onSuccess (optional) - called with no args on success
 *                              onFailure (optional) - called with error message string on failure
 *
 */
TestDepot.prototype.remove = function(args) {
    if (args.bucket) {
		if(args.key) {
			this.depot.removeSingle(args.bucket, args.key, args.onSuccess, args.onFailure);
		} else {
			this.depot.removeBucket(args.bucket, args.onSuccess, args.onFailure);
		}
	} else {
		this.depot.removeAll(args.onSuccess, args.onFailure);
	}
};


/**
 * Function to get an object, bucket, or set of objects from the depot.
 * @param {Object} args         requires properties : {filters:[__,...], (bucket:__)} OR
 *                                                    {bucket:__} OR
 *                                                    {bucket:__, key:__} OR
 *                                                    {bucketsize:__}
 *
 *                              onSuccess (optional) - called with no args on success
 *                              onFailure (optional) - called with error message string on failure
 *
 */
TestDepot.prototype.get = function(args) {
    //Mojo.log("generic get called");
	//this.depot._dumpTables();
    if((args.bucket && !args.key) || args.filters) {
		this.depot.getMultiple(args.bucket, args.filters, args.limit, args.offset, args.onSuccess, args.onFailure);
    } else if (args.bucket && args.key) {
		this.depot.getSingle(args.bucket, args.key, args.onSuccess, args.onFailure);
    } else if (args.bucketsize) {
		this.depot.getBucketSize(args.bucketsize, args.onSuccess, args.onFailure);
    } else if (args.simple) {
		this.depot.simpleGet(args.simple, args.onSuccess, args.onFailure);
	} else {
		if(args.onFailure) {
			args.onFailure("Improper arguments");
		}
    }
};











TestDepot.prototype.setupDatabase = function setupDatabase (onSuccess, onFailure) {
    var options = {
		name: "explosions",
		version: 1,
		replace: true,
		filters: ["carp", "tasty", "cakes", "foo", "bar", "baz", "hmm", "seq"]
    };
    return new Mojo.Depot(options, onSuccess, onFailure);
};



TestDepot.testFunctionNames = [
								 //"testCreate",
								 //"testAddNothing",
								 //"testAddObject",
								 //"testAddString",
								 //"testAddArray",
								 //"testAddWithBackPointer",
								 //"testGetBucket",
								 //"testGetBucketSize",
								 //"testRemoveBucket",
								 //"testRemoveObject",
								 //"testFilterBucket",
								 //"testFilterSet",
								 //"testFilterSetLimitBegin",
								 //"testFilterSetLimitEnd",
								 //"testMultiFilter",
								 //"testMultiFilterReverse",
								 //"testOffsetWhole",
								 //"testOffsetBegin",
								 //"testOffsetMiddle",
								 //"testOffsetEnd",
								 //"testBug",
								 //"testAddAddGet",
								 //"testIdentifierFromFunction"
							   "testBadFilterAdd"
				 ];

//hackish way of commenting out previous.
TestDepot.testFunctionNames = undefined;


TestDepot.prototype.before = function before(beforeCallback) {
    this.depot = this.setupDatabase(
									function() {
										//Mojo.log("suc");
										//this.setupDbResult = "success";
										beforeCallback.defer();
									},
									function(error) {
										//Mojo.log("fail");
										//this.setupDbResult = error;
										beforeCallback.defer();
									}
									 );

};


TestDepot.prototype.after = function after(afterCallback) {
    //this isn't needed.
    afterCallback.defer();
};

TestDepot.prototype.GenericTest = function(funcArgPairs, toCheck, recordResults) {
    this.chain(funcArgPairs, toCheck, function(x, y) { recordResults("index " + x + " : " + y); });
    //this.atomicChain(funcArgPairs, toCheck, recordResults; });
};

TestDepot.prototype.dontReach = function(recordResults) {
	recordResults("should not have been reached");
};

TestDepot.prototype.passTest = function(recordResults) {
	recordResults(Mojo.Test.passed);
};



TestDepot.prototype.GenericNegTest = function(funcArgPairs, recordResults) {
    this.chain(funcArgPairs, this.dontReach.bind(this, recordResults), this.passTest.bind(this, recordResults));
};


TestDepot.prototype.addGetTest = function(toAdd, toGet, toCheck, recordResults) {
    this.GenericTest([["add", toAdd], ["get", toGet]], toCheck, recordResults);
};

TestDepot.prototype.addRemoveGetTest = function(toAdd, toRemove, toGet, toCheck, recordResults) {
    this.GenericTest([["add", toAdd], ["remove", toRemove], ["get", toGet]], toCheck, recordResults);
};


TestDepot.prototype.testCreate = function testCreate(recordResults) {
    //Mojo.require(this.setupDbResult == "success", "db couldn't be set up : " + this.setupDbResult);
    return Mojo.Test.passed;
};

/*
TestDepot.prototype.testAddNothing = function testAddNothing(recordResults) {
    var toAdd = {bucket:"buck1", key:"b1k1", value:null};
    var toGet = {bucket:"buck1", key:"b1k1"};
    var toCheck = function() { recordResults(Mojo.Test.passed); };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};
*/

TestDepot.prototype.testAddString = function testAddString(recordResults) {
    var toAdd = {bucket:"buck1", key:"b1k1", value:"cheese"};
    var toGet = {bucket:"buck1", key:"b1k1"};
    var toCheck = function(rs) {
		Mojo.require(rs == "cheese", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testAddObject = function testAddObject(recordResults) {
    var obj = {title: "Stone Soup", ingredients: ["water", "stones"]};
    var toAdd = {bucket:"buck1", key:"b1k1", value:obj};
    var toGet = {bucket:"buck1", key:"b1k1"};
    var toCheck = function(rs) {
		Mojo.require(rs.title === "Stone Soup", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs.ingredients.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs.ingredients[0] === "water", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs.ingredients[1] === "stones", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testAddArray = function testAddArray(recordResults) {
    var obj = ["green", "blue", "red"];
    var toAdd = {bucket:"buck1", key:"b1k1", value:obj};
    var toGet = {bucket:"buck1", key:"b1k1"};
    var toCheck = function(rs) {
		Mojo.require(Object.toJSON(obj) === Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testAddWithBackPointer = function testAddWithBackPointer(recordResults) {
    var topLevel = {name: "top level"};
    var secondLevel = {name: "second level", parent: topLevel};
    topLevel.child = secondLevel;
    var obj = topLevel;

    var toAdd = {bucket:"buck1", key:"b1k1", value:obj};
    var toGet = {bucket:"buck1", key:"b1k1"};
    var toCheck = function(rs) {
		Mojo.require(rs.name === "top level");
		Mojo.require(rs.child.name === "second level");
		Mojo.require(rs.child.parent === rs);

		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testGetBucket = function testGetBucket(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{name: "top level"}};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz"}};


    var toAdd = {set:[b1obj1, b1obj2, b2obj1, b2obj2]};
    var toGet = {bucket: "buck2"};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2, "fail : rs was " + Object.toJSON(rs));
		var obj1 = rs[0];
		var obj2 = rs[1];
		Mojo.require((obj1[0] == "rawr" && obj1[1] == "greetings") || (obj2[0]=="rawr" && obj2[1] == "greetings"),
					 "fail : rs was " + Object.toJSON(rs));
		Mojo.require((obj1.blah == "lolz" ) || (obj2.blah == "lolz"),
					 "fail : rs was " + Object.toJSON(rs));

		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);

};

TestDepot.prototype.testGetBucketSize = function testGetBucketSize(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{name: "top level"}};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz"}};

    var toAdd = {set:[b1obj1, b1obj2, b2obj1, b2obj2]};
    var toGet = {bucketsize: "buck2"};
    var toCheck = function(rs) {
	    Mojo.require(rs == 2);
	    recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);

};

TestDepot.prototype.testGetEmptyBucketSize = function testGetBucketSize(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{name: "top level"}};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz"}};

    var toAdd = {set:[b1obj1, b1obj2, b2obj1, b2obj2]};
    var toGet = {bucketsize: "buck3"};
    var toCheck = function(rs) {
	    Mojo.require(rs === 0);
	    recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);

};


TestDepot.prototype.testRemoveBucket = function testRemoveBucket(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{name: "top level"}};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz"}};

    var toAdd = {set:[b1obj1, b1obj2, b2obj1, b2obj2]};
    var toRemove = {bucket: "buck2"};
    var toGet = {bucketsize: "buck2"};
    var toCheck = function(rs) {
		Mojo.require(rs === 0);
		recordResults(Mojo.Test.passed);
    };
    this.addRemoveGetTest(toAdd, toRemove, toGet, toCheck, recordResults );
};

TestDepot.prototype.testRemoveObject = function testRemoveObject(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{name: "top level"}};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz"}};

    var toAdd = {set:[b1obj1, b1obj2, b2obj1, b2obj2]};
    var toRemove = {bucket: "buck2", key:"b2obj1"};
    var toGet = {bucket: "buck2"};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 1);
		Mojo.require(rs[0].blah === "lolz");
		recordResults(Mojo.Test.passed);
    };
    this.addRemoveGetTest(toAdd, toRemove, toGet, toCheck, recordResults );
};


TestDepot.prototype.testFilterBucket = function testFilterBucket(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc"}, filters:["tasty"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"xyz"}, filters:["tasty"]};

    var toAdd = {set: [b1obj1, b1obj2, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {bucket: "buck2", filters:[["tasty", "descending"]]};
    var toCheck = function(rs) {
	    Mojo.require(rs.length === 3);
	    Mojo.require(rs[0].hmm === "hmm3");
	    Mojo.require(rs[1].hmm === "hmm2");
	    Mojo.require(rs[2].blah === "lolz");
	    Mojo.require(rs[2].hmm === "hmm1");
	    recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testFilterSet = function testFilterSet(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc1"}, filters:["tasty"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc2"}, filters:["tasty"]};

    var toGet = {limit:1000, filters:[["tasty", "descending"]]};
    var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toCheck = function(rs) {
		Mojo.require(rs.length, 4);
		Mojo.require(rs[0].hmm, "hmm1");
		Mojo.require(rs[0].blah, "lolz");
		Mojo.require(rs[1].hmm, "hmm3");
		Mojo.require(rs[2].hmm, "hmm2");
		Mojo.require(rs[3], "hiya2");
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);

};

TestDepot.prototype.testFilterSetLimitBegin = function testFilterSetLimitBegin(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc1"}, filters:["tasty"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc2"}, filters:["tasty"]};

    var toGet = {limit:2, filters: [["tasty", "descending"]]};
    var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2);
		Mojo.require(rs[0].hmm === "hmm1");
		Mojo.require(rs[0].blah === "lolz");
		Mojo.require(rs[1].hmm === "hmm3");
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};



TestDepot.prototype.testFilterSetLimitEnd = function testFilterSetLimitEnd(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"blah_val", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc1"}, filters:["tasty"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc2"}, filters:["tasty"]};
    //var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{blah:"lsm bug?", tasty:"abc0"}, filters:["tasty"]};

    //var toGet = {limit:3, offset:2, filters: [["tasty", "descending"]]};
    var toGet = {offset:2, limit:2,  filters: [["tasty", "descending"]]};
    //var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toCheck = function(rs) {
		/*
		  Mojo.require(rs.length === 3, "fail. rs was : " + Object.toJSON(rs));
		  Mojo.require(rs[0].hmm === "hmm2", "fail. rs was : " + Object.toJSON(rs));
		  Mojo.require(rs[1].blah === "lsm bug?", "fail. rs was : " + Object.toJSON(rs));

		  Mojo.require(rs[2] === "hiya2", "fail. rs was : " + Object.toJSON(rs));
		*/
		Mojo.require(rs.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].hmm === "hmm2", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1] === "hiya2", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testBug = function testBug(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["carp", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", carp:"abc3"}, filters:["carp"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", carp:"abc1"}, filters:["carp"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", carp:"abc2"}, filters:["carp"]};

    var toGet = {limit:2, offset:2, filters:[["carp", "descending"]]};
    var toAdd = {set:[b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toCheck = function(rs) {
		Mojo.require(rs.length, 2);
		Mojo.require(rs[0].hmm, "hmm2");
		Mojo.require(rs[1], "hiya2");
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};



TestDepot.prototype.testOffsetWhole = function testOffsetWhole(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {filters: [["seq"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 5, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "101", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "102", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[2].seq === "103", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[3].seq === "104", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[4].seq === "105", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testOffsetBegin = function testOffsetBegin(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:0, filters: [["seq"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "101", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "102", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testOffsetMiddle = function testOffsetMiddle(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:2, filters: [["seq"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "103", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "104", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};


TestDepot.prototype.testOffsetEnd = function testOffsetEnd(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:4, filters: [["seq"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 1, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "105", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testOffsetWholeD = function testOffsetWholeD(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {filters: [["seq", "descending"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 5, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "105", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "104", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[2].seq === "103", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[3].seq === "102", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[4].seq === "101", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testOffsetBeginD = function testOffsetBeginD(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:0, filters: [["seq", "descending"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "105", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "104", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};

TestDepot.prototype.testOffsetMiddleD = function testOffsetMiddleD(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:2, filters: [["seq", "descending"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 2, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "103", "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[1].seq === "102", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};


TestDepot.prototype.testOffsetEndD = function testOffsetEndD(recordResults) {
    var b2obj0 = {bucket: "buck2", key:"b2obj0", value:{seq:"100"}};
    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:{seq:"101"}, filters:["seq"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{seq:"102"}, filters:["seq"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{seq:"103"}, filters:["seq"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{seq:"104"}, filters:["seq"]};
    var b2obj5 = {bucket: "buck2", key:"b2obj5", value:{seq:"105"}, filters:["seq"]};

    var toGet = {limit:2, offset:4, filters: [["seq", "descending"]]};
    var toAdd = {set: [b2obj0, b2obj1, b2obj2, b2obj3, b2obj4, b2obj5]};
    var toCheck = function(rs) {
		Mojo.require(rs.length === 1, "fail. rs was : " + Object.toJSON(rs));
		Mojo.require(rs[0].seq === "101", "fail. rs was : " + Object.toJSON(rs));
		recordResults(Mojo.Test.passed);
    };
    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};



TestDepot.prototype.testMultiFilter = function testMultiFilter(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc2"}, filters:["tasty", "hmm"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc1"}, filters:["hmm", "tasty"]};
    var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {limit:123, offset:0, filters:[["tasty", "descending"], ["hmm", "descending"]]};
    var toCheck = function(rs) {
		Mojo.require(rs.length, 2);
		Mojo.require(rs[0].hmm, "hmm2");
		Mojo.require(rs[1].hmm, "hmm3");
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);

};


TestDepot.prototype.testMultiFilterReverse = function testMultiFilterReverse(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};
    var b1obj3 = {bucket: "buck1", key:"b1obj3", value:"hiya3"};
    var b1obj4 = {bucket: "buck1", key:"b1obj4", value:"hiya4"};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc2"}, filters:["tasty", "hmm"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc1"}, filters:["hmm", "tasty"]};
    Mojo.log(Object.toJSON(b2obj4));

    var toAdd = {set: [b1obj1, b1obj2, b1obj3, b1obj4, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {limit:123, offset:0, filters:[["hmm", "descending"], ["tasty", "descending"]]};
    var toCheck = function(rs) {
		Mojo.require(rs.length, 2);
		Mojo.require(rs[0].tasty, "abc1");
		Mojo.require(rs[1].tasty, "abc2");
		Mojo.log(Object.toJSON(b2obj4));
		recordResults(Mojo.Test.passed);
    };

    this.addGetTest(toAdd, toGet, toCheck, recordResults);
};






TestDepot.prototype.testBadFilterAdd = function testMultiFilterReverse(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc2"}, filters:["tasty", "hmm"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc1"}, filters:["hmm", "badfilter1"]};
    Mojo.log(Object.toJSON(b2obj4));

    var toAdd = {set: [b1obj1, b1obj2, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {limit:123, offset:0, filters:[["hmm", "descending"]]};


    this.GenericNegTest([["add", toAdd], ["get", toGet]], recordResults);
};




TestDepot.prototype.testBadFilterGet = function testMultiFilterReverse(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc2"}, filters:["tasty", "hmm"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc1"}, filters:["hmm", "tasty"]};
    Mojo.log(Object.toJSON(b2obj4));

    var toAdd = {set: [b1obj1, b1obj2, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {limit:123, offset:0, filters:[["badfilter", "descending"]]};


    this.GenericNegTest([["add", toAdd], ["get", toGet]], recordResults);

};




TestDepot.prototype.testAddAddGet = function testMultiFilterReverse(recordResults) {

    var firstAdd = {bucket: "buck1", key:"b1obj1", value:{val:"first add", val2:"1st", val3:"first"}, filters:["tasty", "foo"]};
    var secondAdd = {bucket: "buck1", key:"b1obj1", value:{val:"second add", val2:"2nd"}, filters:["tasty", "foo"]};
    var toGet = {bucket:"buck1", key:"b1obj1"};

    var toCheck = function(rs) {
		Mojo.require(rs.val === "second add");
		Mojo.require(rs.val2 === "2nd");
		Mojo.require(rs.val3 === undefined);

		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", firstAdd],
					  ["add", secondAdd],
					  ["get", toGet]], toCheck, recordResults);

};




TestDepot.prototype.testBadCharFilter = function testBadCharFilter(recordResults) {
    var b1obj1 = {bucket: "buck1", key:"b1obj1", value:{blah: "top level"}, filters:[]};
    var secondLevel = {name: "second level", parent: b1obj1.value};
    b1obj1.value.child = secondLevel;

    var b1obj2 = {bucket: "buck1", key:"b1obj2", value:"hiya2", filters:["tasty", "foo"]};

    var b2obj1 = {bucket: "buck2", key:"b2obj1", value:["rawr", "greetings"]};
    var b2obj2 = {bucket: "buck2", key:"b2obj2", value:{blah:"lolz", hmm:"hmm1", tasty:"abc3"}, filters:["tasty"]};
    var b2obj3 = {bucket: "buck2", key:"b2obj3", value:{hmm:"hmm2", tasty:"abc2"}, filters:["tasty", "hmm"]};
    var b2obj4 = {bucket: "buck2", key:"b2obj4", value:{hmm:"hmm3", tasty:"abc1"}, filters:["hmm", "tasty"]};
    Mojo.log(Object.toJSON(b2obj4));

    var toAdd = {set: [b1obj1, b1obj2, b2obj1, b2obj2, b2obj3, b2obj4]};
    var toGet = {limit:123, offset:0, filters:[["badfilter*@", "descending"]]};


    this.GenericNegTest([["add", toAdd], ["get", toGet]], recordResults);
};




TestDepot.prototype.testIdentifierFromFunction = function (recordResults) {
	var cFunction = function (){};
	cFunction.prototype.foo = "bar";
	
	var cFunction2 = function(){};
	cFunction2.prototype.bar = "baz";



	var cObject = new cFunction2();
	
    var toCheck = function(rs) {
		Mojo.Log.info(Object.toJSON(rs));
		Mojo.require(rs.foo === "bar");
		Mojo.require(rs.constructor == cFunction);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {identifiers: {"type1": cFunction}}],
					  ["add", {identifiers: {"type2": cObject}}],
					  ["add", {bucket:"b", key:"k", value: (new cFunction())}],
					  ["get", {bucket:"b", key:"k"}]
					  ], toCheck, recordResults);
};



TestDepot.prototype.testIdentifierFromObject = function (recordResults) {
	var cFunction = function (){};
	cFunction.prototype.foo = "bar";
	
	var cFunction2 = function(){};
	cFunction2.prototype.bar = "baz";

	var cObject = new cFunction2();
	
    var toCheck = function(rs) {
		Mojo.Log.info(Object.toJSON(rs));
		Mojo.require(rs.bar === "baz");
		Mojo.require(rs.constructor == cFunction2);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {identifiers: {"type1": cFunction}}],
					  ["add", {identifiers: {"type2": cObject}}],
					  ["add", {bucket:"b", key:"k", value: (new cFunction2())}],
					  ["get", {bucket:"b", key:"k"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testIdentifierFromNested = function (recordResults) {
	var cFunction = function (){};
	cFunction.prototype.foo = "bar";
	
	var cFunction2 = function(){};
	cFunction2.prototype.bar = "baz";

	var cObject = new cFunction2();
	
	var toAdd = new cFunction2();
	toAdd.nested = new cFunction();
	
    var toCheck = function(rs) {
		Mojo.Log.info(Object.toJSON(rs));
		Mojo.require(rs.constructor == cFunction2);
		Mojo.require(rs.bar === "baz");
		Mojo.require(rs.nested.constructor == cFunction);
		Mojo.require(rs.nested.foo === "bar");
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {identifiers: {"type1": cFunction}}],
					  ["add", {identifiers: {"type2": cObject}}],
					  ["add", {bucket:"b", key:"k", value: toAdd}],
					  ["get", {bucket:"b", key:"k"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testEvilIdentifier = function (recordResults) {
	var cFunction = function (){};
	cFunction.prototype.foo = "bar";
	
	var cFunction2 = function(){};
	cFunction2.prototype.bar = "baz";

	var cObject = new cFunction2();
	
	var toAdd = new cFunction2();
	toAdd.nested = new cFunction();
	toAdd.nested.realObj = {};
	
    var toCheck = function(rs) {
		Mojo.Log.info(Object.toJSON(rs));
		Mojo.require(rs.constructor == cFunction2);
		Mojo.require(rs.bar === "baz");
		Mojo.require(rs.nested.constructor == cFunction);
		Mojo.require(rs.nested.foo === "bar");
		Mojo.require(rs.nested.realObj.constructor == Object);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {identifiers: {"object": cFunction}}],
					  ["add", {identifiers: {"array": cObject}}],
					  ["add", {bucket:"b", key:"k", value: toAdd}],
					  ["get", {bucket:"b", key:"k"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testRemoveAll = function (recordResults) {
	var cFunction = function (){};
	cFunction.prototype.foo = "bar";
	
	var cFunction2 = function(){};
	cFunction2.prototype.bar = "baz";

	var cObject = new cFunction2();
	
	var toAdd = new cFunction2();
	toAdd.nested = new cFunction();
	toAdd.nested.realObj = {};
	
    var toCheck = function(rs) {
		Mojo.Log.info(Object.toJSON(rs));
		Mojo.require(rs.length === 0);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {identifiers: {"object": cFunction}}],
					  ["add", {identifiers: {"array": cObject}}],
					  ["add", {bucket:"b", key:"k", value: toAdd}],
					  ["add", {bucket:"b", key:"k2", value: "blah"}],
					  ["remove", {}],
					  ["get", {bucket:"b"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testSimpleAddNum = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === 14);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", 14]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};

TestDepot.prototype.testSimpleAddString = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === "14");
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", "14"]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};




TestDepot.prototype.testSimpleAddTrue = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === true);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", true]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testSimpleAddFalse = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === false);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", false]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testSimpleAddUndefined = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === undefined);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", undefined]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testSimpleAddNull = function (recordResults) {
    var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs === null);
		recordResults(Mojo.Test.passed);
    };

    this.GenericTest([["add", {simple: ["blah", null]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};


TestDepot.prototype.testSimpleAddNullProperty = function (recordResults) {
	var toCheck = function(rs) {
		Mojo.Log.info("simple add " + Object.toJSON(rs));
		Mojo.require(rs.data === null);
		recordResults(Mojo.Test.passed);
	};

	this.GenericTest([["add", {simple: ["blah", {data: null}]}],
					  ["get", {simple:"blah"}]
					  ], toCheck, recordResults);
};


