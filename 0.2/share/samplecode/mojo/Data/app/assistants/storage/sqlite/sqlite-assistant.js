function SqliteAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
      this.nullHandleCount = 0;
	  this.db = null;
}

SqliteAssistant.prototype.setup = function() {
	this.CreateDB = this.CreateDB.bind(this);
	this.CreateTable = this.CreateTable.bind(this);
	this.FillTable = this.FillTable.bind(this);
	this.queryData = this.queryData.bind(this);
	
	Mojo.Event.listen(this.controller.get('createDB_button'), Mojo.Event.tap, this.CreateDB);
	Mojo.Event.listen(this.controller.get('createTables_button'), Mojo.Event.tap, this.CreateTable);
	Mojo.Event.listen(this.controller.get('fillTables_button'), Mojo.Event.tap, this.FillTable);
	Mojo.Event.listen(this.controller.get('query_execute_button'), Mojo.Event.tap, this.queryData);
}
    
SqliteAssistant.prototype.queryData = function(){
	this.controller.stageController.assistant.showScene("storage/sqlite", 'query', this.db)		
}

SqliteAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


SqliteAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

SqliteAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('createDB_button'), Mojo.Event.tap, this.CreateDB);
	Mojo.Event.stopListening(this.controller.get('createTables_button'), Mojo.Event.tap, this.CreateTable);
	Mojo.Event.stopListening(this.controller.get('fillTables_button'), Mojo.Event.tap, this.FillTable);
	Mojo.Event.stopListening(this.controller.get('query_execute_button'), Mojo.Event.tap, this.queryData);
  
}

SqliteAssistant.prototype.CreateDB = function(event) {

	try {
		this.db = openDatabase('SampleDB', '', 'Sample Data Store', 65536);
		this.controller.get(result).update("Created database SampleDB.");
	}
	catch (e)
	{
		this.controller.get(result).update(e);		
	}
}

SqliteAssistant.prototype.CreateTable = function(event) {

	try {
		this.nullHandleCount = 0;
		//create table 1
		var string = 'CREATE TABLE table1 (col1 TEXT NOT NULL DEFAULT "nothing", col2 TEXT NOT NULL DEFAULT "nothing"); GO;'
	    this.db.transaction( 
	        (function (transaction) { 
				transaction.executeSql('DROP TABLE IF EXISTS table1; GO;', []); 
	            transaction.executeSql(string, [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this)); 
	        }).bind(this) 
	    );
		
		this.controller.get(result).update("Created Tables.");
	}
	catch (e)
	{
		this.controller.get(result).update(e);
	}	
}

SqliteAssistant.prototype.FillTable = function()
{
	/*
	 * Get a random number between 0 and 99
	 */
	now = new Date();
	seed = now.getSeconds();
	var random_number = Math.random(seed);
	var range = random_number * 100;
	var rounded_number = Math.round(range);
	/*
	 * Now add a record based on the above.
	 */
	this.controller.get(result).update('0');
	this.nullHandleCount = 0;
	value1 = 'valuea' + rounded_number
	value2 = 'valueb' + rounded_number
	var string = 'INSERT INTO Table1 (col1, col2) VALUES ("' + value1 + '","' + value2 + '"); GO;'	
	this.db.transaction( 
        (function (transaction) { 
            transaction.executeSql(string, [], this.createRecordDataHandler.bind(this), this.errorHandler.bind(this)); 
        }).bind(this) 
    ); 
}

SqliteAssistant.prototype.createTableDataHandler = function(transaction, results) 
{
	this.controller.get(result).update("Created TABLE1.");
} 

SqliteAssistant.prototype.createRecordDataHandler = function(transaction, results) 
{	
	this.controller.get(result).update("Inserted 1 record.");
} 

SqliteAssistant.prototype.errorHandler = function(transaction, error) 
{ 
    Mojo.Log.info('Error was '+error.message+' (Code '+error.code+')'); 
    return true;
}
