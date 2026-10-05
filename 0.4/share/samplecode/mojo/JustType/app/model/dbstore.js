function DbStore() {
	
}

DbStore.createDb = function(controller) {
	var schema = Mojo.Load.JSONFile(Mojo.appPath + "db_Kinds/com.suresh.bingphonebook");
	Mojo.Log.error("Schema %j", schema);
	if(!schema)
		return false;
	
	controller.serviceRequest(DbStore.serviceId, {
		method: "putKind",
		parameters: schema,
		onSuccess: function() {
			Mojo.Log.info("DB created successfully!");
			DbStore.grantPermissions(controller);
		},
		onFailure: function() {
			Mojo.Log.error("DB Creation failure!");
		}
	});
};

DbStore.grantPermissions = function(controller) {
	
	var permObj = [{"type":"db.kind","object":DbStore.dbKind,"caller":"com.palm.launcher","operations":{"read":"allow"}}];
	controller.serviceRequest(DbStore.serviceId, {
			method: "putPermissions",
			parameters: {"permissions":permObj},
			onSuccess: function() {
				Mojo.Log.info("DB permission granted successfully!");
			},
			onFailure: function() {
				Mojo.Log.error("DB failed to grant permissions!");
			}
		});
};


DbStore.saveAllData = function(controller, obj) {
	
	controller.serviceRequest(DbStore.serviceId, {
		method: "put",
		parameters: {"objects": obj},
		onSuccess: function() {
			Mojo.Log.info("Saved data successfully!");
		},
		onFailure: function() {
			Mojo.Log.error("Save failed!");
		}
	});
};

DbStore.saveData = function(controller, obj) {
	obj._kind = DbStore.dbKind;
	
	controller.serviceRequest(DbStore.serviceId, {
		method: "put",
		parameters: {"objects": [obj]},
		onSuccess: function() {
			Mojo.Log.info("Saved data successfully!");
		},
		onFailure: function() {
			Mojo.Log.error("Save failed!");
		}
	});
};

DbStore.getData = function(controller, id, callback) {
	
	controller.serviceRequest(DbStore.serviceId, {
		method: "get",
		parameters: {"ids":[id]},
		onSuccess: function(response) {
			callback(response.results[0]);
		},
		onFailure: callback({})
	});
};

DbStore.queryData = function(controller, filter, callback) {
	controller.serviceRequest(DbStore.serviceId, {
		method: "search",
		parameters: {"query":{"from":DbStore.dbKind, "where":[{"prop":"searchText","op":"?","val":filter, "collate":"primary"}],"limit":20}},
		onSuccess: callback,
		onFailure: callback
	});
};

DbStore.getAllData = function(controller, callback) {
	controller.serviceRequest(DbStore.serviceId, {
		method: "find",
		parameters: {"query":{"from":DbStore.dbKind}},
		onSuccess: callback,
		onFailure: callback
	});
};

DbStore.delData = function(controller, id) {
	
	controller.serviceRequest(DbStore.serviceId, {
		method: "del",
		parameters: {"ids":[id]}
	});
};

DbStore.purge = function(controller) {
	controller.serviceRequest(DbStore.serviceId, {
		method: "del",
		parameters: {"query":{"from":DbStore.dbKind}}
	});
};


DbStore.serviceId = "palm://com.palm.db/";
DbStore.dbKind = "com.palmdts.db8sample:1";