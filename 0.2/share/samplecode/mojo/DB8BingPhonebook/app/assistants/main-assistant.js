var libraries = MojoLoader.require({name:"foundations", version:"1.0"});
var Foundations = libraries.foundations;
var Future = Foundations.Control.Future;
var PalmCall = Foundations.Comms.PalmCall;

function MainAssistant(params) {
	this.defaultMsg = $L("Just type to search...");
	this.searchMsg = $L("Searching...");
	this.useCachedData = false;
	this.longitude = undefined;
	this.latitude = undefined;
	
	this.filterString = params || undefined;
	
}

MainAssistant.prototype.setup = function() {

	
	var attr = {
		filterFieldName: "name",
		delay: 1000,
		filterFieldHeight: 100
	};
	this.model = {
		
	};
	this.controller.setupWidget('filterField', attr, this.model);
	this.controller.listen('filterField', Mojo.Event.filter, this.filter.bind(this));
	this.filterField = this.controller.get('filterField');
	
	this.searchResults = [];
	this.phoneBookListModel = {listTitle:$L('Results'), items:this.searchResults};   
	this.controller.setupWidget('phoneBookList', 
				{itemTemplate:'main/phonebook-list-entry',listTemplate:'main/listcontainer'},
				this.phoneBookListModel);
	
	Mojo.Event.listen(this.controller.get('phoneBookList'), Mojo.Event.listTap, this.selectedPoneBook.bind(this));
	this.infoMsg = this.controller.get('infoMsg');
	this.infoMsg.innerHTML = this.defaultMsg;
	
	//App Menu - Remove default items and add only Edit & Help items.
	var appMenuModel = {
        visible: true,
        items: [{label:$L('Save All'), command:'saveData'},
                {label: $L('Cached Data'), command:'cachedData'},
                {label: $L('New Data'), command:'newData'},
                {label: $L('Get All'), command:'getAll'},
                {label: $L('Purge'), command: 'purgeData'}
            ]
        };
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems:true}, appMenuModel);	
	
	this.getCurrentLocation();
	//create the database;
	DbStore.createDb(this.controller);
};

MainAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch(event.command) {
		case 'saveData': this.saveData();
						break;
		case 'cachedData': this.useCachedData = true;
						this.clearAll();
						this.filterField.mojo.close();
						break;
		case 'newData': this.useCachedData = false;
						this.clearAll();
						this.filterField.mojo.close();
						break;
		case 'getAll' : DbStore.getAllData(this.controller, this.displayAllData.bind(this));
						break;
		case 'purgeData' : DbStore.purge(this.controller);
						this.clearAll();
						this.filterField.mojo.close();
						break;
		}
	}	
};

MainAssistant.prototype.cleanup = function() {
	this.filterString = "";
};

MainAssistant.prototype.filter = function(event) {
	this.filterString = event.filterString;
	
	if(Foundations.StringUtils.isBlank(this.filterString)) {
		this.clearAll();
		return;
	}
	this.infoMsg.innerHTML = this.searchMsg;
	
	if(!this.useCachedData)
		this.doSearch();
	else
		DbStore.queryData(this.controller, this.filterString, this.displayAllData.bind(this));
};

MainAssistant.prototype.doSearch = function() {
	
	if(this.phoneBookListModel)
		Foundations.ArrayUtils.clear(this.phoneBookListModel.items);
	
	var headers = {
			"headers": {
				"Content-Type": "application/json",
				"Connection": "close"
			}
	};
	
	this.queryUrl += "&Query=" + encodeURIComponent(this.filterString);
	
	var ajaxFuture = Foundations.Comms.AjaxCall.get(this.queryUrl,"",headers);
	
	ajaxFuture.then(this, function() {
		
		if (ajaxFuture.result) {
			if (ajaxFuture.result.responseJSON) {
				var results = ajaxFuture.result.responseJSON.SearchResponse.Phonebook;
				if(results) {
					this.infoMsg.innerHTML = "";
					this.filterField.mojo.setCount(results.Results.length);
					this.phoneBookListModel.items = results.Results;
					this.controller.modelChanged(this.phoneBookListModel);
				}
				else 
					this.filterField.mojo.setCount(0);
			}
			else
				this.filterField.mojo.setCount(0);
		}
		else
			this.filterField.mojo.setCount(0);
	});		
	
};

MainAssistant.prototype.saveData = function() {
	this.searchResults = this.phoneBookListModel.items;
	for(var i = 0; i < this.searchResults.length; i++) {
		this.searchResults[i]._kind = DbStore.dbKind;
	}
	DbStore.saveAllData(this.controller, this.searchResults);
};

MainAssistant.prototype.displayAllData = function(objs) {
	this.phoneBookListModel.items = objs.results;
	this.controller.modelChanged(this.phoneBookListModel);
	
	this.filterField.mojo.setCount(objs.results.length);
	this.infoMsg.innerHTML = "";
};

MainAssistant.prototype.selectedPoneBook = function(event) {
	if(!event.item)
		return;
	this.controller.stageController.pushScene("detail", event.item);
};

MainAssistant.prototype.clearAll = function() {
	Foundations.ArrayUtils.clear(this.phoneBookListModel.items);
	this.controller.modelChanged(this.phoneBookListModel);
	this.infoMsg.innerHTML = this.defaultMsg;
};

MainAssistant.prototype.getCurrentLocation = function() {
	this.infoMsg.innerHTML = $L("Getting current location...");
	var future = Foundations.Comms.PalmCall.call("palm://com.palm.location/", "getCurrentPosition", {});
	
	future.then(this, function(response) {
		this.infoMsg.innerHTML = this.defaultMsg;
		try{
			if(response.result.returnValue) {
				var result = response.result;
				this.longitude = result.longitude;
				this.latitude = result.latitude;
			}
		}
		catch(e) {
			Mojo.Log.error("Error getting current locaiton "+ e.stact);
			this.constructQueryUrlWithoutLocation();
			if(this.filterString) {
				this.doSearch();
			}
			return;
		}
		
		this.constructQueryUrl();
		
		if(this.filterString) {
			this.doSearch();
		}
	});
	
};

MainAssistant.prototype.constructQueryUrl = function() {
	
	this.queryUrl = "http://api.bing.net/json.aspx?";
	this.queryUrl += "AppId=7ABCB83B468D0BFE10A84BA26B23F7516EDE82B1";
	
	this.queryUrl += "&Sources=Phonebook";
	this.queryUrl += "&Latitude="+ this.latitude;
	this.queryUrl += "&Longitude="+ this.longitude;
	this.queryUrl += "&Radius=10.0";

	this.queryUrl += "&Phonebook.Count=10";
	this.queryUrl += "&Phonebook.Offset=0";
	this.queryUrl += "&Phonebook.FileType=YP";
	this.queryUrl += "&Phonebook.SortBy=Distance";

};

MainAssistant.prototype.constructQueryUrlWithoutLocation = function() {
	
	this.queryUrl = "http://api.bing.net/json.aspx?";
	this.queryUrl += "AppId=7ABCB83B468D0BFE10A84BA26B23F7516EDE82B1";
	
	this.queryUrl += "&Sources=Phonebook";
	this.queryUrl += "&Radius=10.0";

	this.queryUrl += "&Phonebook.Count=10";
	this.queryUrl += "&Phonebook.Offset=0";
	this.queryUrl += "&Phonebook.FileType=YP";
	this.queryUrl += "&Phonebook.SortBy=Distance";

};