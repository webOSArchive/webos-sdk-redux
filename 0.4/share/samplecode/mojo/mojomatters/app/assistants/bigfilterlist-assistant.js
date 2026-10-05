BigfilterlistAssistant = Class.create({
  initialize : function() {
  },

  
  setup: function() {	
    var model =
    {
      template: 'bigfilterlist/entry',
      listFunction: this.list.bind(this),
    };
    this.controller.setupWidget('filterlist', model);
    this.controller.setupWidget('filterField');
    Event.observe('filterlist', Mojo.Event.bigListSelected, this.handleSelection.bind(this));
	},
	
	deactivate: function() {
	  Event.stopObserving('filterlist');
	},
	
	handleSelection: function() {
	  Mojo.Log.info("selected");
	},
	
	list: function(filter, callback, offset, limit) {
	  Mojo.Log.info("queried" + filter);
	  var data = {
	    "list": [{"display":'123'},{"display":'456'}, {"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'},{"display":'456'}]
	  };          
	  callback(data);
	},
	
	
	filter: function(event) {
	  var filterString = event.filterString;
	  alert("filter on "+filterString);
	}
});




