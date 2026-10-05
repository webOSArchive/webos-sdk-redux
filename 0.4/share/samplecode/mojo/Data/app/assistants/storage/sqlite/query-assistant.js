function QueryAssistant(origdb) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
      this.nullHandleCount = 0;
	  this.db = origdb;
}

QueryAssistant.prototype.setup = function() {

	// The following just sets up the nice list box for the results of a query.
	this.innerListAttrs = {
        listTemplate: 'storage/sqlite/listcontainer',
        itemTemplate: 'storage/sqlite/listItem'
    };
	this.resultList = [{resultString: " "}]
    this.listModel = {            
        items: this.resultList
    };
    this.controller.setupWidget('results_list', this.innerListAttrs, this.listModel);

    
}

QueryAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	// Query table1
	var mytext = 'select * from table1;'
    this.db.transaction( 
        (function (transaction) { 
            transaction.executeSql(mytext, [], this.queryDataHandler.bind(this), this.errorHandler.bind(this)); 
        }).bind(this) 
    );
}


QueryAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

QueryAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}

QueryAssistant.prototype.queryDataHandler = function(transaction, results) 
{ 
    // Handle the results 
    var string = ""; 
    
	try {
		var list = [];
		for (var i = 0; i < results.rows.length; i++) {
			var row = results.rows.item(i);
			var name;
			string = "";
			for (name in row)
			{
				if (typeof row[name] !== 'function')
				{
					string = string + name + ': ' + row[name] + " | ";
				}
			}
			list.push({
				resultString: string
			});
		}
		//update the list widget
		this.resultList.clear();
		Object.extend(this.resultList,list);
		this.controller.modelChanged(this.listModel, this);
	}
	catch (e)
	{
		this.controller.get('result').update(e);	
	} 

} 

QueryAssistant.prototype.errorHandler = function(transaction, error) 
{ 
    Mojo.Log.info('Error was '+error.message+' (Code '+error.code+')'); 
    return true;
}
