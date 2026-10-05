describe('Messaging Favorites Unit Test', function() {
	
	var favoriteItem = new FavoriteItem();
	
	it('FavoriteItem.getBestAvailabilityImsIndex() Test', function() {			
		expect(favoriteItem).toBeTruthy();
		
		var ims;
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).not.toBeDefined();
		
		ims = [{"availability":0},
		       {"availability":2},
		       {"availability":3},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(0);
		
		ims = [{"availability":3},
		       {"availability":2},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(1);
		
		ims = [{"availability":3},
		       {"availability":0}
		      ];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(1);
		
		ims = [{"availability":4}];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(0);
		
		ims = [{"availability":4},
		       {"availability":2},
		       {"availability":0},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(2);
		
		ims = [{"availability":4},
		       {"availability":2},
		       {"availability":2},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailabilityImsIndex(ims)).toEqual(1);
	});	
	
	it('FavoriteItem.getBestAvailability() Test', function() {			
		expect(favoriteItem).toBeTruthy();
		
		var ims;
		expect(favoriteItem.getBestAvailability(ims)).not.toBeDefined();
		
		ims = [{"availability":0},
		       {"availability":2},
		       {"availability":3},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(0);
		
		ims = [{"availability":2},
		       {"availability":3},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(2);
		
		ims = [{"availability":3},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(3);
		
		ims = [{"availability":4}];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(4);
		
		ims = [{"availability":4},
		       {"availability":2},
		       {"availability":0},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(0);
		
		ims = [{"availability":4},
		       {"availability":2},
		       {"availability":2},
		       {"availability":4}
		      ];
		expect(favoriteItem.getBestAvailability(ims)).toEqual(2);
	});	
	
	it('FavoriteItem.getStatusMessage() Test', function() {			
		expect(favoriteItem).toBeTruthy();
		
		var ims;
		expect(favoriteItem.getStatusMessage(ims)).toEqual("");
		
		ims = [{"availability":0, "status":"Groovy"},
		       {"availability":2, "status":"Not Today!"},
		       {"availability":3, "status":"Oh Boy!!"},
		       {"availability":4, "status":"Out of here!"}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("Groovy");
		
		ims = [{"availability":2, "status":"Groovy"},
		       {"availability":3, "status":"Bad Day."},
		       {"availability":4, "status":"I'm Done."}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("Groovy");
		
		ims = [{"availability":3, "status":"Number 3"},
		       {"availability":4, "status":"Number 4"}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("Number 3");
		
		ims = [{"availability":4, "status":"All Done."}];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("All Done.");
		
		ims = [{"availability":4, "status":"Four"},
		       {"availability":2, "status":"Two"},
		       {"availability":0, "status":"I'm here."},
		       {"availability":4, "status":"Another four."}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("I'm here.");
		
		ims = [{"availability":4, "status":"Out"},
		       {"availability":2, "status":"First two."},
		       {"availability":2, "status":"Second two."},
		       {"availability":4, "status":"Last four."}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("First two.");
			
		ims = [{"availability":0, "status":"Groovy &amp;&apos;&lt;&gt;", "_kind":"com.palm.imbuddystatus.libpurple:1"}, 
		       {"availability":2, "status":"Not Today!"},
		       {"availability":3, "status":"Oh Boy!!"},
		       {"availability":4, "status":"Out of here!"}
		       ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("Groovy &'<>");
	
		ims = [{"availability":4, "status":"Four"},
		       {"availability":2, "status":"Two"},
		       {"availability":0, "status":"I&apos;m here."},
		       {"availability":4, "status":"Another four."}
		      ];
		expect(favoriteItem.getStatusMessage(ims)).toEqual("I&apos;m here.");
	});	
	
	
})