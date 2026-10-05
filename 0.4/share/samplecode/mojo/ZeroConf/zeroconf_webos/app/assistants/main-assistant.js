function MainAssistant(argFromPusher) {
}

MainAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
	
	
	activityButton1Tap: function(inSender, event) {
		console.log("doing browse");
		var self = this;
		
		//create a resolve service to turn search results into actual server info
		resolveService = function(info) {
		    var request = new Mojo.Service.Request('palm://com.palm.zeroconf/', {
                method: 'resolve',
                parameters: {
                    subscribe: true,
                    regType: info.regType,
                    domainName: info.domainName,
                    instanceName: info.instanceName
                },
                    
                onSuccess: function(result) { 
                    console.log("success: RESOLVE: " + Object.toJSON(result)); 
                    if(undefined !== result.targetName) {
                        console.log("we can now connect to the webservice at " + result.IPv4Address + " " + result.port);
                        var url = "http://"+result.IPv4Address+":"+result.port+"/";
                        self.$.sb.setActive(false);
                        console.log("controller = " + self.controller);
                        self.controller.stageController.pushScene({
                            name: "DesktopControl",
                            disableSceneScroller: true
                        },url);            
                    }
                },
                onFailure: function(result) {
                    console.log("failure: RESOLVE " + Object.toJSON(result)); 
                }
            });
		};

		//browse the network for '_palmdts._tcp' services. 
		//once we find one, request to resolve it
		this.controller.serviceRequest('palm://com.palm.zeroconf/', {
            method: 'browse',
            parameters:{
                'regType':'_palmdts._tcp'
                ,'subscribe': true
            },
            //if we find the service, resolve it
            onSuccess: function(reply){ 
                console.log("success: BROWSE " + Object.toJSON(reply));           
                if("Add" === reply.eventType) {
                    console.log("adding service");
                    resolveService(reply);
                }
            },
            onFailure: function(result){
                console.log("failure: BROWSE " + Object.toJSON(result));
            }
        }); 
	}
};