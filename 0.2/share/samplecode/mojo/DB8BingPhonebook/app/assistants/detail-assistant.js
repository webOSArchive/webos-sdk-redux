DetailAssistant = function(params) {
	this.params = params;
};

DetailAssistant.prototype.setup = function() {
	this.phoneBookDetailModel = {listTitle:$L('Details'), items:[]};   
	this.controller.setupWidget('phoneBookDetailList', 
				{itemTemplate:'detail/details-entry',listTemplate:'detail/listcontainer'},
				this.phoneBookDetailModel);
	Mojo.Event.listen(this.controller.get('phoneBookDetailList'), Mojo.Event.listTap, this.tapHandler.bind(this));
	
	//App Menu - Remove default items and add only Edit & Help items.
	var appMenuModel = {
        visible: true,
        items: [{label:$L('Save'), command:'saveData'},
            ]
        };
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems:true}, appMenuModel);	
};

DetailAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch(event.command) {
		case 'saveData': DbStore.saveData(this.controller, this.params);
						break;
		}
	}
};

DetailAssistant.prototype.activate = function() {
	
	var paramType = Foundations.ObjectUtils.type(this.params);

	if(paramType == "string") {
		this.fetchObject(this.params);
	}
	else if(paramType == "object") {
		this.displayDetails(this.params);
	}
	else 
		Mojo.Log.error("else --why??");
	
	
};

DetailAssistant.prototype.fetchObject = function(phoneBookId) {
	DbStore.getData(this.controller, phoneBookId, this.displayDetails.bind(this));
};

DetailAssistant.prototype.displayDetails = function(detailsObj) {
	this.params = detailsObj;
	var items = this.convertToArray(detailsObj);
	this.phoneBookDetailModel.items = items;
	this.controller.modelChanged(this.phoneBookDetailModel);
};


DetailAssistant.prototype.convertToArray = function(obj) {
	var key;
    var pairs = [];
    for (key in obj) {
		if(key == "_id" || key == "_rev" || key == "_kind")
			continue;
        if (obj.hasOwnProperty(key)) {
            var val = obj[key];
            var type = Foundations.ObjectUtils.type(val);

            switch (type) {
                case "null":
                case "undefined":
                    pairs.push({label:key, value:""});
                    break;

                case "number":
                case "string":
                case "boolean":
                	pairs.push({label:key, value:val});
                    break;
            }
        }
    }

    return pairs;

};

DetailAssistant.prototype.tapHandler = function(event) {
	if(!event.item)
		return;

	var item = event.item;
	var callParams = {};
	Mojo.Log.error("Selected value %j", item);
	if(item.label == "PhoneNumber") {
		callParams.id = "com.palm.app.phone";
		callParams.params = {"number": item.value};
	}
	else if(item.label == "Url" || item.label == "DisplayUrl") {
		callParams.id = "com.palm.app.browser";
		callParams.params = {scene: 'page', target: item.value};
	}
	else {
		return;
	}
	
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: callParams
		});
};

DetailAssistant.prototype.cleanup = function() {
	
};

