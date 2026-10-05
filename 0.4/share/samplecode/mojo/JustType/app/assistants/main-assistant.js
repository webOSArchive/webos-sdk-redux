MainAssistant.prototype.refreshList;

function MainAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.AppDB = args.Appdb;
	this.launchStr = args.searchString;
	this.count = 0;
	this.filterString = '';
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.controller.setupWidget(Mojo.Menu.commandMenu,
	    {
	        spacerHeight: 0,
	        menuClass: 'no-fade'
	    },
	    {
	        visible: true,
	        items: [ 
	            { icon: "new", command: "do-edit"}
	        ]
	    }
	);
	this.controller.setupWidget("listId",
          this.attributes = {
              itemTemplate: "main/list",
	          listTemplate: 'main/listcontainer',
              swipeToDelete: true,
              reorderable: true,
              filterFunction: this.list.bind(this),
              delay: 350
          },
          this.model = {
              disabled: false
          }
     );
	
	var permObj = [{"type":"db.kind","object":'com.palmdts.db8sample:1',"caller":"com.palm.launcher","operations":{"read":"allow"}}];
	this.controller.serviceRequest("palm://com.palm.db/", {
		method: "putPermissions",
		parameters: {"permissions":permObj},
		onSuccess: function() {
			Mojo.Log.info("DB permission granted successfully!");
		},
		onFailure: function() {
			Mojo.Log.error("DB failed to grant permissions!");
		}
	});
	
	var fquery;
	if (!this.launchStr) {
		fquery = {
			"from": "com.palmdts.db8sample:1"
		};
	}
	else {
		fquery = {
			"from": "com.palmdts.db8sample:1",
			"where": [{
				"prop": "firstname",
				"op": "%",
				"val": this.launchStr
			}],
			"orderBy": "firstname"
		};
	}
	try {
		this.libraries = MojoLoader.require({ name: "foundations", version: "1.0"});
		this.Future = this.libraries["foundations"].Control.Future;
		this.DB = this.libraries["foundations"].Data.DB;  
		
	}catch(e){Mojo.Log.info("ERROR " + JSON.stringify(e))}
		 
	this.handleListTap = this.handleListTap.bind(this);
	this.listDeleteHandler = this.listDeleteHandler.bind(this);
};

MainAssistant.prototype.populateList = function(query){
	this.controller.serviceRequest("palm://com.palm.db/", {
		method: "search",
		parameters: {"query":query},
			onSuccess: function(objs) {
			Mojo.Log.info("First page results, count = " + objs.count);
			rs = objs.results;
			for (var i = 0; i < rs.length; i++) {
				this.decorateItem(rs[i]);
			}
			widgetlist = this.controller.get('listId').mojo.getList();
			widgetlist.mojo.noticeUpdatedItems(0,rs)
			
			widgetlist.mojo.setLength(rs.length);
			this.controller.get('listId').mojo.setCount(rs.length);
			if (this.launchStr) {
				this.tapHack();	
			}
		}.bind(this),
		onFailure: function(objs) {
			Mojo.Log.error("DB failed to grant permissions!");
		}
	});
	
}
MainAssistant.prototype.list = function(filterString, listWidget, offset, count){
	this.filterString = filterString;
	Mojo.Log.info('******************** In filter function ' + filterString)
	
	if (this.launchStr) {
		filterString = this.launchStr;	
	}
	var fquery = {"from":"com.palmdts.db8sample:1","where":[{"prop":"firstname","op":"%","val":filterString}],"orderBy":"firstname"};
	this.populateList(fquery);
	
}
MainAssistant.prototype.decorateItem = function(item){
	this.count ++;
	 this.controller.get('listId').mojo.setCount(this.count);
	var decorator = {};
		var preview;
		var found;
		item.firstname = item.firstname.substr(0, 1).toUpperCase() + item.firstname.substr(1);
		item.lastname = item.lastname.substr(0, 1).toUpperCase() + item.lastname.substr(1);
		if (this.filterString) {
			if (item.firstname.toLocaleLowerCase().indexOf(this.filterString) == 0) {
				 item.firstname = this.highlightMatchText(this.filterString, item.firstname)
			}
		}
		if (!found) {
			preview = item.firstname[0];
		}
		if (item.firstname.length > 1) {
			preview += "...";
		}
		
		decorator._definitionPreview = preview;
		return decorator;
}

MainAssistant.prototype.handleListTap = function(e) {
	//Remove any html in added to firstname in decorateItem
	e.item.firstname = this.cleanFirstName(e.item.firstname);
	Mojo.Log.info('######################## ' + e.item.firstname)
	this.controller.stageController.pushScene({name:'editPlayer'},{playerId:e.item,Appdb:this.AppDB,uSearch:false});
};
MainAssistant.prototype.cleanFirstName = function(firstname) {
	firstname = firstname.replace('<span class=\'list-highlight\'>','')
	firstname = firstname.replace('</span>','')
	return firstname;
};
MainAssistant.prototype.listDeleteHandler = function(e) {
	this.DB.del([e.item._id]).then(function(future) {

      var result = future.result;
      if (result.returnValue == true)	
         Mojo.Log.info("del success, count="+result.count);
      else{  
         result = future.exception;
         Mojo.Log.info("del failure: Err code=" + result.errorCode + "Err message=" + result.message); 
      }
   });
};
MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Log.info("********************** " + MainAssistant.prototype.refreshList);
	if (MainAssistant.prototype.refreshList)
		this.list(this.filterString);
	this.controller.listen(this.controller.get("listId"), Mojo.Event.listTap, this.handleListTap);		
	this.controller.listen(this.controller.get("listId"), Mojo.Event.listDelete,this.listDeleteHandler);
};
// This is a dirty hack to make the filterfield display the value passed in from universal search
MainAssistant.prototype.tapHack = function(event) {
	
	if (this.launchStr) {
	
		var contentDiv = this.controller.get('listId')
		var containedDivElements = contentDiv.getElementsByTagName("div");
		
		var allContainedElements = contentDiv.getElementsByTagName("input");
		for (var i = 0; i < allContainedElements.length; i++) {
			if (allContainedElements[i].id.indexOf('-filterField')) {
				allContainedElements[i].value = this.launchStr;
			}
			
		}
		this.controller.get('listId').mojo.open();		
		for (var i = 0; i < containedDivElements.length; i++) {
			Mojo.Event.send(this.controller.get(containedDivElements[i]), Mojo.Event.tap, undefined, false)
		}
		
		// We're done with the lauchString so clear it as otherwise it will cause problems it backspace is use to clear out the filterfield
		this.launchStr = ''
	}
};
MainAssistant.prototype.handleCommand = function(event) {
    
	if (event.type === Mojo.Event.command) {
        switch (event.command) {
            case  'do-edit' :
			this.controller.stageController.pushScene({name:'editPlayer'},{Appdb:this.AppDB})
			break;
        }
    }
}
MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	MainAssistant.prototype.refreshList = false;
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listTap, this.handleListTap);		
	this.controller.stopListening(this.controller.get("listId"), Mojo.Event.listDelete,this.listDeleteHandler);
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
MainAssistant.prototype.highlightMatchText = function(fStr, str) {
		var result = "<span class='list-highlight'>";
		result += str.substr(0,str.toLocaleLowerCase().indexOf(fStr)+fStr.length) +  "</span>" + str.substr(str.toLocaleLowerCase().indexOf(fStr)+fStr.length,str.length+1)
		
		return result;
	}