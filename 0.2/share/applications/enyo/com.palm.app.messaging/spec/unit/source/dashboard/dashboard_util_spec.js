describe('test MessageDashboardUtil', function(){
	var util;
	
	beforeEach(function(){
		util = new MessageDashboardUtil();
	});
	
	it('test updating dashboard layers', function(){
		var currentLayers = [];
		
		// test adding new layers
		// appending a new layer for thread '++Aaaaa+Aaaaaaaa' 
		var layer = getDashboardLayer1();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers1()).toEqual(currentLayers);
		
		// appending a new layer for thread '++Bbbbb+Bbbbbbbb'
		layer = getDashboardLayer2();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers2()).toEqual(currentLayers);
		
		// merging a new layer for thread '++Aaaaa+Aaaaaaaa' and moving existing layer for '++Aaaaa+Aaaaaaaa' to the end of list
		layer = getDashboardLayer3();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers3()).toEqual(currentLayers);
		
		// merging a new layer for thread '++Bbbbb+Bbbbbbbb' and moving existing layer for '++Bbbbb+Bbbbbbbb' to the end of list 
		layer = getDashboardLayer4();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers4()).toEqual(currentLayers);
		
		// append a new layer for thread '++Ccccc+Cccccccc'
		layer = getDashboardLayer5();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers5()).toEqual(currentLayers);
		
		// merging a new layer for thread '++Ccccc+Cccccccc' but leave existing layer for '++Ccccc+Cccccccc' to stay at the end of list 
		layer = getDashboardLayer6();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers6()).toEqual(currentLayers);
		
		// appending a new layer for a sms thread '++Ddddd+Ddddddd' 
		layer = getDashboardLayer7();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers7()).toEqual(currentLayers);
		
		// appending a new layer for a mms thread '++Ddddd+Ddddddd' 
		layer = getDashboardLayer8();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers8()).toEqual(currentLayers);
		
		// merging a new layer for thread '++Bbbbb+Bbbbbbbb' and moving existing layer for '++Bbbbb+Bbbbbbbb' to the end of list 
		layer = getDashboardLayer9();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers9()).toEqual(currentLayers);
		
		// appending a new layer for a mms thread '++Eeeee+Eeeeeee' and moving existing mms layer to the end of list 
		layer = getDashboardLayer10();
		util.pushLayer(currentLayers, layer);
		expect(getUpdatedDashboardLayers10()).toEqual(currentLayers);
	});
	
	it ('test MessageDashboardUtil.findExistingLayerIndex()', function() {
		var layers = [];
		var newLayer = {};
		
		// new layer is not found in empty layers from dashboard
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		
		layers = [getExistingImLayer1(), getExistingImLayer2(), getExistingImLayer3()];
		// same thread id as layer 0
		newLayer = getDashboardLayer3();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(0);
		// same thread id as layer 1
		newLayer = getDashboardLayer4();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(1);
		// same thread id as layer 2
		newLayer = getDashboardLayer6();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(2);
		// new layer for SMS message
		newLayer = getDashboardLayer7();
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		// new layer for MMS message
		newLayer = getDashboardLayer8();
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		
		layers = [getExistingImLayer1(), getExistingImLayer2(), getExistingImLayer3(), getExistingSmsLayer4()];
		// new layer for SMS message with same thread as 3rd layer
		newLayer = getDashboardLayer11();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(3);
		// new layer for SMS message with different thread as 3rd layer
		newLayer = getDashboardLayer12();
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		// new layer for MMS message with same thread as 3rd layer
		newLayer = getDashboardLayer8();
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		// new layer for MMS message with new thread id
		newLayer = getDashboardLayer10();
		expect(util.findExistingLayerIndex(layers, newLayer)).toBeUndefined();
		
		layers = [getExistingImLayer1(), getExistingImLayer2(), getExistingImLayer3(), getExistingMmsLayer5()];
		// new layer for MMS message with same thread as 3rd layer
		newLayer = getDashboardLayer8();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(3);
		// new layer for MMS message with new thread id
		newLayer = getDashboardLayer10();
		expect(util.findExistingLayerIndex(layers, newLayer)).toEqual(3);
	});
	
	it('test MessageDashboardUtil.getMMSMessageLayer()', function(){
		var layer = {
			_from: "1234567890",
			_message: {
				"_id": "++HcfGGzALcPHIlE",
				"_kind": "com.palm.mmsmessage:1",
				"_rev": 115900,
				"conversations": ["++Harw7ALBNOycIB"],
				"flags": {
					"read": true
				},
				"folder": "inbox",
				"from": {
					"addr": "1234567890"
				},
				"localTimestamp": 2147483647,
				"messageText": "I'm a MMS message",
				"readRevSet": 115900,
				"serviceName": "mms",
				"status": "successful"
			},
			_messageCount: 1,
			text: "I'm MMS message",
			title: "1234567890",
			icon: "images/notification-large-messaging.png"
		};
		var mmsLayer = util.getMMSMessageLayer(layer);
		expect(layer._from).toEqual(mmsLayer.title);
		expect('New MMS on your phone').toEqual(mmsLayer.text);
		
		layer = {
			_from: "John Dole",
			_message: {
				"_id": "++HcfGGzALcPHIlE",
				"_kind": "com.palm.mmsmessage:1",
				"_rev": 115900,
				"conversations": ["++Harw7ALBNOycIB"],
				"flags": {
					"read": true
				},
				"folder": "inbox",
				"from": {
					"addr": "1234567890"
				},
				"localTimestamp": 2147483647,
				"messageText": "I'm MMS message",
				"readRevSet": 115900,
				"serviceName": "mms",
				"status": "successful"
			},
			_messageCount: 1,
			text: "",
			title: "1234567890",
			icon: "images/notification-large-messaging.png"
		};
		mmsLayer = util.getMMSMessageLayer(layer);
		expect(layer._from).toEqual(mmsLayer.title);
		expect('New MMS on your phone').toEqual(mmsLayer.text);
	});
	
	it('test MessagingDashboardUtil.areThreadsMatched()', function() {
		// matched scenarios
		expect(util.areThreadsMatched([""], [""], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeTruthy(); // TODO: should this consider to be true? 
		expect(util.areThreadsMatched(["++Aaaaa+Aaaaaaaaa"], ["++Aaaaa+Aaaaaaaaa"], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeTruthy(); 
		expect(util.areThreadsMatched(["++Aaaaa+Aaaaaaaaa","++Bbbbb+Bbbbbbbb"], ["++Aaaaa+Aaaaaaaaa","++Bbbbb+Bbbbbbbb"], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeTruthy();
		
		// not matched scenarios
		expect(util.areThreadsMatched(undefined, undefined, {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched([], undefined, {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched(undefined, [], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched([], [], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched([], ["++Aaaaa+Aaaaaaaaa"], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched(["++Aaaaa+Aaaaaaaaa"], [], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched(["++Aaaaa+Aaaaaaaaa"], [""], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched(["++Aaaaa+Aaaaaaaaa"], ["++Bbbbb+Bbbbbbbb"], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
		expect(util.areThreadsMatched([""], ["++Bbbbb+Bbbbbbbb"], {_message:{_id: "++111111111111111"}}, {_message:{_id: "++222222222222222"}})).toBeFalsy();
	});
	
	it('test MessageDashboardUtil.updateIcon()', function() {
		// positive test cases
		var expectedLayer = {icon: "images/notification-large-messaging-mult.png"};
		var layer = {};
		util.updateIcon(layer, true);
		expect(layer).toEqual(expectedLayer);
		
		layer = {icon: "images/notification-large-messaging.png"};
		util.updateIcon(layer, true);
		expect(layer).toEqual(expectedLayer);
		
		layer = {icon: "images/notification-large-messaging-mult.png"};
		util.updateIcon(layer, true);
		expect(layer).toEqual(expectedLayer);
		
		// positive test cases	
		expectedLayer = {icon: "images/notification-large-messaging.png"};
		layer = {}
		util.updateIcon(layer, false);
		expect(layer).toEqual(expectedLayer);
		
		layer = {icon: "images/notification-large-messaging.png"};
		util.updateIcon(layer, false);
		expect(layer).toEqual(expectedLayer);
		
		layer = {icon: "images/notification-large-messaging-mult.png"};
		util.updateIcon(layer, false);
		expect(layer).toEqual(expectedLayer);
		
		// negative test cases
		layer = undefined;
		util.updateIcon(layer)
		expect(layer).toBeUndefined();
		
		util.updateIcon(layer, true)
		expect(layer).toBeUndefined();
		
		util.updateIcon(layer, false)
		expect(layer).toBeUndefined();
	});
	
	it ('test MessageDashboardUtil.addNewLayer()', function() {
		var existingLayers = [];
		var layer = getDashboardLayer1();
		var expectedLayers = getUpdatedDashboardLayers1();
		util.addNewLayer(existingLayers, layer);
		expect(expectedLayers).toEqual(existingLayers);
		
		layer = getDashboardLayer2();
		expectedLayers = getUpdatedDashboardLayers2();
		util.addNewLayer(existingLayers, layer);
		expect(expectedLayers).toEqual(existingLayers);
	});
	
	it ('test MessageDashboardUtil.getUpdatedLayer()', function() {
		var existingLayer = getDashboardLayer1();
		var newLayer = getDashboardLayer2();
		var expectedLayer = newLayer;
		var ndx;
		for (ndx = 1; ndx <= 10; ndx++) {
			existingLayer = util.getUpdatedLayer(existingLayer, newLayer);
			expectedLayer._messageCount = ndx + 1;
			expectedLayer.title = newLayer._from + " (" + (ndx + 1) + ")";
			expect(expectedLayer).toEqual(existingLayer);
		}
	});
	
	it ('test MessageDashboardUtil.mergeLatestLayer()', function() {
		var currentLayers = getUpdatedDashboardLayers1();
		var newLayer = getDashboardLayer2();
		var ndx = 0;
		var expectedLayers = [getDashboardLayer2()];
		
		util.mergeLatestLayer(currentLayers, newLayer, ndx);
		expect(expectedLayers).toEqual(currentLayers);
		
		currentLayers = getUpdatedDashboardLayers5();
		newLayer = getDashboardLayer6();
		ndx = 2;
		util.mergeLatestLayer(currentLayers, newLayer, ndx);
		expectedLayers = getUpdatedDashboardLayers5();
		expectedLayers[2] = newLayer;
		expectedLayers[2].icon = "images/notification-large-messaging-mult.png";
		expect(expectedLayers).toEqual(currentLayers);
		
	});
	
	it ('test MessageDashboardUtil.moveToLatestLayer()', function() {
		// layers with two items
		var currentLayers = 
			[{
				_message: {
					_id: "1",
					readRevSet: 1
				},
				icon: "images/notification-large-messaging.png"
			}, {
				_message: {
					_id: "2",
					readRevSet: 2
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		var newLayer = {
			_message: {
				_id: "3",
				readRevSet: 3
			},
			icon: "images/notification-large-messaging.png"
		};
		var ndx = 0;
		var expectedLayers = 
			[{
				_message: {
					_id: "2",
					readRevSet: 2
				},
				icon: "images/notification-large-messaging.png"
			}, {
				_message: {
					_id: "3",
					readRevSet: 3
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		util.moveToLatestLayer(currentLayers, newLayer, ndx);
		expect(expectedLayers).toEqual(currentLayers);
		
		// layers with three items, and first item is moved to the end and replace with new layer
		currentLayers = 
			[{
				_message: {
					_id: "1",
					readRevSet: 1
				},
				icon: "images/notification-large-messaging.png"
			}, {
				_message: {
					_id: "2",
					readRevSet: 2
				},
				icon: "images/notification-large-messaging-mult.png"
			}, {
				_message: {
					_id: "3",
					readRevSet: 3
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		newLayer = {
			_message: {
				_id: "4",
				readRevSet: 4
			},
			icon: "images/notification-large-messaging.png"
		};
		ndx = 0; 
		expectedLayers = 
			[{
				_message: {
					_id: "2",
					readRevSet: 2
				},
				icon: "images/notification-large-messaging.png"
			}, {
				_message: {
					_id: "3",
					readRevSet: 3
				},
				icon: "images/notification-large-messaging-mult.png"
			}, {
				_message: {
					_id: "4",
					readRevSet: 4
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		util.moveToLatestLayer(currentLayers, newLayer, ndx);
		expect(expectedLayers).toEqual(currentLayers);
		
		// layers with three items, and middle item is moved to the end and replace with new layer
		currentLayers = 
			[{
				_message: {
					_id: "1",
					readRevSet: 1
				},
				icon: "images/notification-large-messaging.png"
			}, {
				_message: {
					_id: "2",
					readRevSet: 2
				},
				icon: "images/notification-large-messaging-mult.png"
			}, {
				_message: {
					_id: "3",
					readRevSet: 3
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		newLayer = {
			_message: {
				_id: "4",
				readRevSet: 4
			},
			icon: "images/notification-large-messaging.png"
		};
		ndx = 1; 
		expectedLayers = 
			[{
				_message: {
					_id: "1",
					readRevSet: 1
				},
				icon: "images/notification-large-messaging.png"
			},{
				_message: {
					_id: "3",
					readRevSet: 3
				},
				icon: "images/notification-large-messaging-mult.png"
			}, {
				_message: {
					_id: "4",
					readRevSet: 4
				},
				icon: "images/notification-large-messaging-mult.png"
			}];
		util.moveToLatestLayer(currentLayers, newLayer, ndx);
		expect(expectedLayers).toEqual(currentLayers);
	});
});
	
function getDashboardLayer1() {
	return {
		_from: "testSender",
		_message: {
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "test message 1",
		title: "testSender",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers1() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "test message 1",
		title: "testSender",
		icon: "images/notification-large-messaging.png"
	}];
};

function getDashboardLayer2() {
	return {
		_from: "verifySender",
		_message: {
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "verify message 1",
		title: "verifySender",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers2() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++11111111111111",
			"_kind": "com.palm.message:1",
			"_rev": 1,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 1",
			"readRevSet": 1,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "test message 1",
		title: "testSender",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "verify message 1",
		title: "verifySender",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer3() {
	return {
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "test message 2",
		title: "testSender",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers3() {
	return [{
		_from: "verifySender",
		_message: {
			"_id": "++22222222222222",
			"_kind": "com.palm.message:1",
			"_rev": 2,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 1",
			"readRevSet": 2,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "verify message 1",
		title: "verifySender",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer4() {
	return {
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "verify message 2",
		title: "verifySender",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers4() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer5() {
	return {
		_from: "checkSender",
		_message: {
			"_id": "++66666666666666",
			"_kind": "com.palm.message:1",
			"_rev": 22,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 1",
			"readRevSet": 22,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 1,
		text: "check message 1",
		title: "checkSender",
		icon: "images/notification-large-messaging.png"
	}
};

function getUpdatedDashboardLayers5() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++66666666666666",
			"_kind": "com.palm.message:1",
			"_rev": 22,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 1",
			"readRevSet": 22,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 1,
		text: "check message 1",
		title: "checkSender",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer6() {
	return {
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 1,
		text: "check message 2",
		title: "checkSender",
		icon: "images/notification-large-messaging.png"
	}
};

function getUpdatedDashboardLayers6() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 2,
		text: "check message 2",
		title: "checkSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer7() {
	return {
		_from: "1234567890",
		_message: {
			"_id": "++77777777777778",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 24,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 1",
			"readRevSet": 24,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers7() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 2,
		text: "check message 2",
		title: "checkSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++77777777777778",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 24,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 1",
			"readRevSet": 24,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer8() {
	return {
		_from: "1234567890",
		_message: {
			"_id": "++88888888888888",
			"_kind": "com.palm.mmsmessage:1",
			"_rev": 31,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "mms message 1",
			"readRevSet": 31,
			"serviceName": "mms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "New MMS on your phone",
		title: "1234567890",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers8() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 2,
		text: "check message 2",
		title: "checkSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++77777777777778",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 24,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 1",
			"readRevSet": 24,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++88888888888888",
			"_kind": "com.palm.mmsmessage:1",
			"_rev": 31,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "mms message 1",
			"readRevSet": 31,
			"serviceName": "mms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "New MMS on your phone",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer9() {
	return {
		_from: "verifySender",
		_message: {
			"_id": "++99999999999999",
			"_kind": "com.palm.message:1",
			"_rev": 32,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 3",
			"readRevSet": 32,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 1,
		text: "verify message 3",
		title: "verifySender",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers9() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 2,
		text: "check message 2",
		title: "checkSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++77777777777778",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 24,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 1",
			"readRevSet": 24,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++88888888888888",
			"_kind": "com.palm.mmsmessage:1",
			"_rev": 31,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "mms message 1",
			"readRevSet": 31,
			"serviceName": "mms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "New MMS on your phone",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++99999999999999",
			"_kind": "com.palm.message:1",
			"_rev": 32,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 3",
			"readRevSet": 32,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 3,
		text: "verify message 3",
		title: "verifySender (3)",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer10() {
	return {
		_from: "9876543210",
		_message: {
			"_id": "++00000000000000",
			"_kind": "com.palm.mmsmessage:1",
			"_rev": 41,
			"conversations": ["++Eeeee+Eeeeeeee"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "9876543210"
			},
			"localTimestamp": 2147483647,
			"messageText": "mms message 2",
			"readRevSet": 41,
			"serviceName": "mms",
			"status": "successful"
		},
		_messageCount: 1,
		text: "New MMS on your phone",
		title: "9876543210",
		icon: "images/notification-large-messaging.png"
	};
};

function getUpdatedDashboardLayers10() {
	return [{
		_from: "testSender",
		_message: {
			"_id": "++33333333333333",
			"_kind": "com.palm.message:1",
			"_rev": 11,
			"_sync": true,
			"conversations": ["++Aaaaa+Aaaaaaaaa"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "testSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "test message 2",
			"readRevSet": 11,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "test message 2",
		title: "testSender (2)",
		icon: "images/notification-large-messaging.png"
	},{
		_from: "checkSender",
		_message: {
			"_id": "++77777777777777",
			"_kind": "com.palm.message:1",
			"_rev": 23,
			"_sync": true,
			"conversations": ["++Ccccc+Cccccccc"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "checkSender"
			},
			"localTimestamp": 2147483647,
			"messageText": "check message 2",
			"readRevSet": 23,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		}, 
		_messageCount: 2,
		text: "check message 2",
		title: "checkSender (2)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "1234567890",
		_message: {
			"_id": "++77777777777778",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 24,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 1",
			"readRevSet": 24,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "verifySender",
		_message: {
			"_id": "++99999999999999",
			"_kind": "com.palm.message:1",
			"_rev": 32,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 3",
			"readRevSet": 32,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 3,
		text: "verify message 3",
		title: "verifySender (3)",
		icon: "images/notification-large-messaging-mult.png"
	},{
		_from: "9876543210",
		_message: {
			"_id": "++00000000000000",
			"_kind": "com.palm.mmsmessage:1",
			"_rev": 41,
			"conversations": ["++Eeeee+Eeeeeeee"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "9876543210"
			},
			"localTimestamp": 2147483647,
			"messageText": "mms message 2",
			"readRevSet": 41,
			"serviceName": "mms",
			"status": "successful"
		},
		_messageCount: 2,
		text: "New MMS on your phone",
		title: "9876543210",
		icon: "images/notification-large-messaging-mult.png"
	}];
};

function getDashboardLayer11() {
	return {
		_from: "1234567890",
		_message: {
			"_id": "++00000000000001",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 51,
			"conversations": ["++Ddddd+Dddddddd"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1234567890"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 2",
			"readRevSet": 51,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging.png"
	};
};

function getDashboardLayer12() {
	return {
		_from: "1111111111",
		_message: {
			"_id": "++00000000000002",
			"_kind": "com.palm.smsmessage:1",
			"_rev": 52,
			"conversations": ["++Fffff+Ffffffff"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "1111111111"
			},
			"localTimestamp": 2147483647,
			"messageText": "sms message 3",
			"readRevSet": 52,
			"serviceName": "sms",
			"status": "successful",
		}, 
		_messageCount: 1,
		text: "sms message 1",
		title: "1234567890",
		icon: "images/notification-large-messaging.png"
	};
};

function getExistingImLayer1() {
	return getDashboardLayer1();
};

function getExistingImLayer2() {
	return {
		_from: "verifySender",
		_message: {
			"_id": "++44444444444444",
			"_kind": "com.palm.message:1",
			"_rev": 12,
			"_sync": true,
			"conversations": ["++Bbbbb+Bbbbbbbb"],
			"flags": {
				"read": false
			},
			"folder": "inbox",
			"from": {
				"addr": "verifySender"
			},
			"localTimestamp": 2147483647,
			"messageText": "verify message 2",
			"readRevSet": 12,
			"serviceName": "type_service",
			"status": "successful",
			"timestamp": 2147483647,
			"to": [{
				"_id": "156a6",
				"addr": "testUsername@test.com"
			}],
			"username": "testUsername@test.com"
		},
		_messageCount: 2,
		text: "verify message 2",
		title: "verifySender (2)",
		icon: "images/notification-large-messaging-mult.png"
	};
};

function getExistingImLayer3() {
	return getDashboardLayer5();
};


function getExistingSmsLayer4() {
	return getDashboardLayer7();
};

function getExistingMmsLayer5() {
	return getDashboardLayer8();
};
