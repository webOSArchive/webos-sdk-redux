function AppDBAssistant(arg) {
	this.splashScene = arg;
 	try {
			this.libraries = MojoLoader.require({ name: "foundations", version: "1.0"});
			this.Future = this.libraries["foundations"].Control.Future;
			this.DB = this.libraries["foundations"].Data.DB;  
		} catch (Error) {
			Mojo.Log.error("LIb Load error" + Error);
		}	
		//this._delete();	
}
 
AppDBAssistant.prototype = {
  _delete:function(){
  	this.DB.delKind("com.palmdts.db8sample:1").then(function(future) {
	      var result = future.result;
	      if (result.returnValue == true)
	         Mojo.Log.info(" DEBUGGING delKind success");
	      else{  
	         result = future.exception;
	         Mojo.Log.info(" DEBUGGING delKind failure: Err code=" + result.errorCode + "Err message=" + result.message);
	      }
	   })
  },
  check4DB: function(){
		// First create a query to check if the kind exists
		try {		
			var check4DBstr = {"from":"com.palmdts.db8sample:1"};
			
			this.DB.find(check4DBstr).then(function(future) {
				if (future.exception) {
					Mojo.Log.info("********** THERE WAS AN EXCEPTION SO CREATE THE DATABASE")
					this.splashScene.updateSplash("Creating database...");
					var indexes = [ //** create indexes
					      {name:"firstname", props: [{name: "firstname"}]},	
						  {name:"lastname", props: [{name: "lastname"}]},			
					      {name:"position", props:[{name: "position"}]},
						  {name:"Club", props:[{name: "club"}]}
					      ]
					this.DB.putKind("com.palmdts.db8sample:1","com.palmdts.db8sample",indexes).then(function(future) {
					      var result = future.result;			
					      if (result.returnValue == true)			
					         Mojo.Log.info("******** putKind success");			
					      else			
					         Mojo.Log.error("****** putKind failure: Err code=" + result.errorCode + "Err text=" + result.errorText);			
					})//.then(function(future) {
						   
				    this.DB.put(this.kExamples).then(function(future) {
				      var result = future.result;				
				      try {
					  	if (result.returnValue == true) 
					  		Mojo.Log.info("put success, c.id=" + result.results[0].id + ", c.rev=" + result.results[0].rev);
					  	else {
					  		result = future.exception;
					  		Mojo.Log.info("put failure: Err code=" + result.errorCode + "Err message=" + result.message);
					  	}
					  }catch(e){console.log("EEEERRRORRR " + e)}				
				   	});
					
				}else{
					Mojo.Log.info("********** DATABASE EXISTS SO DO NOTHING ")						
				}
				this.splashScene.dbReady();
			}.bind(this));		
		}catch(e){console.log("ENDABUGERROR ENDA " + e)}
	
	},
	query : function(queryStr){
		    var rs = null;
			Mojo.Log.info("********** MAKE THE QUERY")
			try {
				this.DB.find(queryStr, false, true).then(function(future){
					Mojo.Log.info("********** Here 1")
					var result = future.result;
					Mojo.Log.info("********** Here 2")
					if (result.returnValue == true) {
						Mojo.Log.info("First page results, count = " + result.count);
						
						rs = result.results;
						
						for (var i = 0; i < rs.length; i++) {
							//Mojo.Log.info("#" + i + " " + rs[i].firstname + ", " + rs[i].Club);
							Mojo.Log.info("********** rs " + JSON.stringify(rs[i]));
						}
					}
					else {
						result = future.exception;
						Mojo.Log.info("***************** find failure: Err code=" + result.errorCode + "Err message=" + result.message);
					}
					
					return rs;
				});
			}catch(e){Mojo.Log.info("ERROR " + JSON.stringify(e))}
			Mojo.Log.info("********** Done Here ")
	},
	add : function(addObj){
		var objs = [addObj];
		this.DB.put(objs).then(function(future) {
			var result = future.result;
			if (result.returnValue == true)	
				Mojo.Log.info("put success, c.id="+result.results[0].id+", c.rev="+result.results[0].rev);
			else{  
				result = future.exception;
				Mojo.Log.info("put failure: Err code=" + result.errorCode + "Err message=" + result.message); 
			}
		});
	},
	update : function(updteObj){
		var objs = [updteObj];
		this.DB.merge(objs).then(function(future) {
			var result = future.result;
			var rs = result.results;
			if (result.returnValue == true) {
				Mojo.Log.info("merge success");
				for (var i = 0; i < rs.length; i++) 
					Mojo.Log.info("#" + i + ": r.id=" + rs[i].id + ", r.rev=" + rs[i].rev);
			}
			else{
				result = future.exception;
				Mojo.Log.info("merge failure: Err code=" + result.errorCode + "Err message=" + result.message);
			}
		});
	},
  cleanup: function() {
    //blah blah
  }
}


//This is only used when the app is first run to populate the database.
AppDBAssistant.prototype.kExamples = 
[
	{_kind:"com.palmdts.db8sample:1","lastname": "adu","firstname" : "freddy","position":"Midfielder","height":"5-8","weight":"140","DOB":"06/02/89","Hometown":"Potomac, Md.","Club":"Aris Thessaloniki F.C. (Greece)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "alston","firstname" : "kevin","position":"Defender","height":"5-8","weight":"160","DOB":"05/05/88","Hometown":"Silver Spring, Md.","Club":"New England Revolution"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "altidore","firstname" : "jozy","position":"Forward","height":"6-1","weight":"175","DOB":"11/06/89","Hometown":"Boca Raton, Fla.","Club":"Villareal (Spain)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "beasley","firstname" : "daMarcus","position":"Midfielder","height":"5-8","weight":"145","DOB":"05/24/82","Hometown":"Ft. Wayne, Ind.","Club":"Rangers (Scotland)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "beckerman","firstname" : "kyle","position":"Midfielder","height":"5-10","weight":"165","DOB":"04/23/82","Hometown":"Crofton, Md.","Club":"Real Salt Lake"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "bedoya","firstname" : "alejandro","position":"Midfielder","height":"5-10","weight":"160","DOB":"04/29/87","Hometown":"Westin, Fla.","Club":"Orebro SK (Sweden)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "bocanegra","firstname" : "carlos","position":"Defender","height":"6-0","weight":"170","DOB":"05/25/79","Hometown":"Alta Loma, Calif.","Club":"Rennes (France)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "bornstein","firstname" : "jonathan","position":"Defender","height":"5-9","weight":"145","DOB":"11/07/84","Hometown":"Los Alamitos, Calif.","Club":"Chivas USA"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "bradley","firstname" : "michael","position":"Midfielder ","height":"6-2","weight":"175","DOB":"07/31/87","Hometown":"Manhattan Beach, Calif.","Club":"Borussia Mšnchengladbach (Germany)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "braun","firstname" : "justin","position":"Forward","height":"6-3","weight":"195","DOB":"03/31/87","Hometown":"Salt Lake City, Utah","Club":"Chivas USA"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "buddle","firstname" : "edson","position":"Forward","height":"6-1","weight":"185","DOB":"05/21/81","Hometown":"New Rochelle, N.Y.","Club":"Los Angeles Galaxy"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "cameron","firstname" : "geoff","position":"Midfielder","height":"6-3","weight":"185","DOB":"07/11/85","Hometown":"Attleboro, Mass.","Club":"Houston Dynamo"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "casey","firstname" : "conor","position":"Forward","height":"6-1","weight":"185","DOB":"07/25/81","Hometown":"Gilpin, Colo.","Club":"Colorado Rapids"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "castillo","firstname" : "edgar","position":"Defender","height":"5-7","weight":"146","DOB":"10/08/86","Hometown":"Las Cruces, N.M.","Club":"U.A.N.L (Mexico)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "cherundolo","firstname" : "steve","position":"Defender","height":"5-6","weight":"145","DOB":"02/19/79","Hometown":"San Diego, Calif.","Club":"Hannover 96 (Germany)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "ching","firstname" : "brian","position":"Forward","height":"5-11","weight":"195","DOB":"05/24/78","Hometown":"Haleiwa, Hawaii","Club":"Houston Dynamo"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "clark","firstname" : "ricardo","position":"Midfielder","height":"5-10","weight":"150","DOB":"05/10/83","Hometown":"Jonesboro, Ga.","Club":"Eintracht Frankfurt (Germany)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "conrad","firstname" : "jimmy","position":"Defender","height":"6-2","weight":"185","DOB":"02/12/77","Hometown":"Temple City, Calif.","Club":"Kansas City Wizards"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "cooper","firstname" : "kenny","position":"Forward","height":"6-3","weight":"210","DOB":"10/21/84","Hometown":"Dallas, Texas","Club":"TSV 1860 Munich (Germany)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "cunningham","firstname" : "jeff","position":"Forward","height":"5-8","weight":"155","DOB":"08/21/76","Hometown":"Crystal River, Fla.","Club":"FC Dallas"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "davies","firstname" : "charlie","position":"Forward","height":"5-10","weight":"160","DOB":"06/25/86","Hometown":"Manchester, N.H.","Club":"FC Sochaux (France)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "davis","firstname" : "brad","position":"Midfielder","height":"5-11","weight":"165","DOB":"11/08/81","Hometown":"St. Charles, Mo.","Club":"Houston Dynamo"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "deMerit","firstname" : "jay","position":"Defender","height":"6-0","weight":"185","DOB":"12/04/79","Hometown":"Green Bay, Wis.","Club":"Watford (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "dempsey","firstname" : "clint","position":"Midfielder","height":"6-1","weight":"170","DOB":"03/09/83","Hometown":"Nacogdoches, Texas","Club":"Fulham (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "donovan","firstname" : "landon","position":"Midfielder","height":"5-8","weight":"158","DOB":"03/04/82","Hometown":"Redlands, Calif.","Club":"Los Angeles Galaxy"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "edu","firstname" : "maurice","position":"Midfielder","height":"6-0","weight":"170","DOB":"04/18/86","Hometown":"Fontana, Calif.","Club":"Rangers (Scotland)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "evans","firstname" : "brad","position":"Midfielder","height":"6-1","weight":"160","DOB":"04/20/85","Hometown":"Phoenix, Ariz.","Club":"Seattle Sounders"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "feilhaber","firstname" : "benny","position":"Midfielder","height":"5-9","weight":"150","DOB":"01/19/85","Hometown":"Irvine, Calif.","Club":"AGF Aarhus (Denmark)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "findley","firstname" : "robbie","position":"Forward","height":"5-9","weight":"165","DOB":"08/04/85","Hometown":"Phoenix, Ariz.","Club":"Real Salt Lake"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "gaven","firstname" : "eddie","position":"Midfielder","height":"6-0","weight":"165","DOB":"10/25/86","Hometown":"Hamilton, N.J.","Club":"Columbus Crew"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "gomez","firstname" : "herculez","position":"Forward","height":"5-10","weight":"165","DOB":"04/06/82","Hometown":"Las Vegas, Nev.","Club":"Puebla F.C. (Mexico)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "gonzalez","firstname" : "omar","position":"Defender","height":"6-5","weight":"210","DOB":"10/11/88","Hometown":"Dallas, Texas","Club":"Los Angeles Galaxy"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "goodson","firstname" : "clarence","position":"Defender","height":"6-4","weight":"170","DOB":"05/17/82","Hometown":"Alexandria, Va.","Club":"IK Start (Norway)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "guzan","firstname" : "brad","position":"Goalkeeper","height":"6-4","weight":"210","DOB":"09/09/84","Hometown":"Homer Glen, Ill.","Club":"Aston Villa (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "hahnemann","firstname" : "marcus","position":"Goalkeeper","height":"6-3","weight":"220","DOB":"06/15/72","Hometown":"Seattle, Wash.","Club":"Wolverhampton Wanderers (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "hartman","firstname" : "kevin","position":"Goalkeeper","height":"6-1","weight":"174","DOB":"05/24/74","Hometown":"Palos Verdes, Calif.","Club":"Kansas City Wizards"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "hejduk","firstname" : "frankie","position":"Defender","height":"5-8","weight":"155","DOB":"08/05/74","Hometown":"Cardiff, Calif.","Club":"Columbus Crew"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "holden","firstname" : "stuart","position":"Midfielder","height":"5-10","weight":"160","DOB":"08/01/85","Hometown":"Houston, Texas","Club":"Bolton Wanderers (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "howard","firstname" : "tim","position":"Goalkeeper","height":"6-3","weight":"210","DOB":"03/06/79","Hometown":"North Brunswick, N.J.","Club":"Everton (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "johnson","firstname" : "eddie","position":"Forward","height":"6-0","weight":"180","DOB":"03/31/84","Hometown":"Palm Coast, Fla.","Club":"Aris Thessaloniki FC (Greece)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "jones","firstname" : "jermaine","position":"Midfielder","height":"6-1","weight":"172","DOB":"11/03/81","Hometown":"Chicago, Ill.","Club":"FC Schalke 04"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "kljestan","firstname" : "sacha","position":"Midfielder","height":"6-1","weight":"150","DOB":"09/09/85","Hometown":"Huntington Beach, Calif.","Club":"Chivas USA"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "larentowicz","firstname" : "jeff","position":"Midfielder","height":"6-1","weight":"175","DOB":"08/05/83","Hometown":"Pasadena, Calif.","Club":"New England Revolution"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "marshall","firstname" : "chad","position":"Defender","height":"6-4","weight":"190","DOB":"08/22/84","Hometown":"Riverside, Calif.","Club":"Columbus Crew"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "mcCarty","firstname" : "dax","position":"Midfielder","height":"5-9","weight":"150","DOB":"04/30/87","Hometown":"Winter Park, Fla.","Club":"FC Dallas"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "mcDonald","firstname" : "brandon","position":"Defender","height":"6-1","weight":"185","DOB":"01/16/86","Hometown":"Glendale, Ariz.","Club":"San Jose Earthquakes"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "onyewu","firstname" : "oguchi","position":"Defender","height":"6-4","weight":"210","DOB":"05/13/82","Hometown":"Olney, Md.","Club":"AC Milan (Italy)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "orozco","firstname" : "michael","position":"Defender","height":"5-11","weight":"160","DOB":"02/07/86","Hometown":"Orange, Calif.","Club":"Philadelphia Union"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "pearce","firstname" : "heath","position":"Defender","height":"5-10","weight":"175","DOB":"08/13/84","Hometown":"Modesto, Calif.","Club":"FC Dallas"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "perkins","firstname" : "troy","position":"Goalkeeper","height":"6-2","weight":"190","DOB":"07/20/81","Hometown":"Worthington, Ohio","Club":"D.C. United"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "pontius","firstname" : "chris","position":"Midfielder","height":"6-0","weight":"170","DOB":"05/12/87","Hometown":"Yorba Linda, Calif.","Club":"D.C. United"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "rimando","firstname" : "nick","position":"Goalkeeper","height":"5-11","weight":"181","DOB":"06/17/79","Hometown":"Montclair, Calif.","Club":"Real Salt Lake"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "rogers","firstname" : "robbie","position":"Midfielder","height":"5-10","weight":"180","DOB":"05/12/87","Hometown":"Huntington Beach, Calif.","Club":"Columbus Crew"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "simek","firstname" : "frank","position":"Defender","height":"5-11","weight":"165","DOB":"10/13/84","Hometown":"St. Louis, Mo.","Club":"Sheffield Wednesday (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "spector","firstname" : "jonathan","position":"Defender","height":"6-0","weight":"180","DOB":"03/01/86","Hometown":"Arlington Heights, Ill.","Club":"West Ham United (England)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "thornton","firstname" : "zach","position":"Goalkeeper","height":"6-3","weight":"210","DOB":"10/10/73","Hometown":"Edgewood, Md.","Club":"Chivas USA"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "torres","firstname" : "josŽ","position":"Midfielder","height":"5-7","weight":"135","DOB":"10/29/87","Hometown":"Longview, Texas","Club":"Pachuca (Mexico)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "tracy","firstname" : "marcus","position":"Forward","height":"6-1","weight":"170","DOB":"10/02/86","Hometown":"Newton, Conn.","Club":"Aalborg BK (Denmark)"
	},{
		_kind:"com.palmdts.db8sample:1","lastname": "wynne","firstname" : "marvell","position":"Defender","height":"5-9","weight":"170","DOB":"05/08/86","Hometown":"Poway, Calif.","Club":"Toronto FC"
	}];