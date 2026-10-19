/*
 * Palm WebOS Bluetooth SPP Example
 *
 * Notes:   Not for Emulator use!
 *          This example used a paired BT-335 Bluetooth SPP unit which broadcasts NMEA data over the BT serial connection
 *          For more information on NMEA and other protocol standards see:
 *          http://en.wikipedia.org/wiki/NMEA_0183
 *          http://www.nmea.org/content/nmea_standards/nmea_083_v_400.asp
 *
 *			Connecting to Bluetooth devices:
 *          * Device must be paired prior to calling gap functions.  GAP will return a list of trusted devices and their address.
 *          * Developer can choose to specify a specific name or cycle through device names - in this case we're looking for any GPS "named" device
 *          * Once an address is acquired, the code will need to first start the SPP notification service and then the SPP service
 *          * Events are fired for connection state - if connected this code will open the serial port and wait for data from the GPS device
 *          * openReadReady will call methods to read the data from the serial port.  openReadReady is called recursively and calls spp:read to collect bytes
 *          * 
 */

function MainAssistant() {}

MainAssistant.prototype.setup = function(){
    this.logOutputNum=0; //display log number increment
    this.instanceId=-1;  //SPP instance object
    this.hndTimeout = {};  //polling timeout object

    
    this.serialPortPollRate = 2500; //time in mS between each SPP read - adjust to SPP device data rate
    this.serialPortBufferSize = 1024; //number of bytes per "read"
    
    this.logInfo("Starting App");  //log info method will print logs to device screen
}

/*
 * on activate get the list of trusted devices
 */
MainAssistant.prototype.activate = function(event) {
    this.logInfo("Get Trusted Devices: ");

    //get a list of paired GPS devices and filter using the getDevicesSuccess function
    this.getBTDevices = this.controller.serviceRequest('palm://com.palm.bluetooth/gap', {
                                    method: "gettrusteddevices",
                                    parameters: {},
                                    onSuccess: this.getDevicesSuccess.bind(this),
                                    onFailure: function(failData){
                                        this.logInfo("gettrusteddevices, errCode: " + failData.errorCode);
                                    }                                                            
                                });
}

/*
 * get trusted devices success callback: Look up the address of a device containing GPS or gps. 
 * Example of callback data:
 *     objData = {"returnValue":true,"trusteddevices":
 *          [{"address":"00:0d:b5:38:c0:3f",
 *            "name":"BT-GPS-38C03F",
 *            "cod":7936,
 *            "renamed":true,
 *            "status":"disconnected"}]} 
 */ 
MainAssistant.prototype.getDevicesSuccess = function(objData){
    this.logInfo("gettrusteddevices:"+objData.returnValue);
    this.targetAddress = "";
    var targetDevice = /GPS/i;  //change this based on your device id

    //are there any trusted devices containing 'GPS' || 'gps' with name
    if(objData.returnValue) {
		if(objData.trusteddevices) {  //TODO:look for trusted devices
                for (i = 0; i < objData.trusteddevices.length; i++) {
                    if(objData.trusteddevices[i].name.search(targetDevice) > -1) {  //assumes "GPS" is within the name of the bluetooth device
                        this.logInfo("found: " + objData.trusteddevices[i].address);
                        this.targetAddress = objData.trusteddevices[i].address;
                    }
                }

        //connect to Palm SPP notification service - this must be running to accept SPP communications events 
        this.sppNotificationService = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
                                        method: "subscribenotifications",
                                        parameters: {"subscribe":true},
                                        onSuccess: this.sppNotify.bind(this),
                                        onFailure: function(failData){
                                            this.logInfo("notifnserverenabled, errCode: " + failData.errorCode);
                                        }                                                            
                                    });
        
        //connect to paired GPS device - this sets up a new event channel (see sppNotificationService)
        if(this.targetAddress !== "") {
            this.connectBTDevice = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
                                            method: "connect",
                                            parameters: {"address" : this.targetAddress},
                                            });                                                           
                                        }
        }   
    }
    else {  //there are no trusted devices - the end user will need to pair to the GPS receiver
        this.logInfo("gettrusteddevice call returned no trusted devices!");
    }
 
};

/*
 * Notification handler for SPP events.  
 */
MainAssistant.prototype.sppNotify = function(objData){
    var that = this; //used to scope this here.

    this.logInfo("SPP notification: "+JSON.stringify(objData));
    this.instanceId = objData.instanceId;

    for(var key in objData) {
        if (key === "notification") {
            switch(objData.notification){
                case "notifnservicenames":
                    this.logInfo("SPP service name: "+objData.services[0]);                
                    /* Send select service response */
                    this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
                                    method: "selectservice",
                                    parameters: {"instanceId" : objData.instanceId,"servicename":objData.services[0] },
                                });
                    return;                                                           
                    break;

                case "notifnconnected":
                    this.logInfo("SPP Connected");  
                    //for some reason two different keys are used for instanceId are passed
                    if(objData.error === 0){
                        this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
                                    method: "open",
                                    parameters: {"instanceId":objData.instanceId},
                                    onSuccess: this.openReadReady.bind(this),
                                    onFailure: function(failData) {
                                        that.logInfo("Unable to Open SPP Port, errCode: " + failData.errorCode + "<br/>"+ failData.errorText);
                                }                                                            
                            });
                        }
                    return;    
                    break;

                case "notifndisconnected":
                    this.logInfo("Device has terminated the connection or is out of range...");                    
                    break;

                default:
                    break;
            }
        } 
    }
}

/*
 * Called from open success and recursively from readPortSuccess
 */
MainAssistant.prototype.openReadReady = function(objData){
    this.logInfo("openSuccess: "+JSON.stringify(objData));
    
    //use "setTimeout" here because the SPP input buffer might not be full yet
    this.hndTimeout = this.controller.window.setTimeout(this.readPort.bind(this), this.serialPortPollRate);
}

/*
 * read from the serial port.
 * dataLength parameter is "read number of bytes from port OR call onSuccess when port buffer is 'full'"
 */
MainAssistant.prototype.readPort = function(){
    this.logInfo("SPP Read Port:");
    this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
            method: "read",
            parameters: {"instanceId":this.instanceId,"dataLength":this.serialPortBufferSize},
            onSuccess: this.readPortSuccess.bind(this),
            onFailure: function(failData) {
                this.logInfo("Unable to Read SPP Port, errCode: " + failData.errorCode + "<br/>"+ failData.errorText);
                }                                                            
        });
}



/*
 * readPortSuccess:
 * Passed a json object containing the data returned from the read operation.
 * Also calls openReadReady recursively 
 * Note: This code may not work if connecting to a different device.  
 * This is just some basic parsing to demonstrate data returning
 */
MainAssistant.prototype.readPortSuccess = function(objData){
    this.logInfo("Read Success: "+objData.returnValue+"<br/> Data Length: "+objData.dataLength);

    /*get the NMEA text output and parse - see NMEA specs online for more deatails*/
    if (objData.returnValue===true) {
        if (typeof objData.data !== "undefined") {
            //objData.data
            var gpsData = objData.data;
            var i = 0;
            var t1 = gpsData.indexOf("$GPGSA");
            var t2 = gpsData.indexOf("\n", t1);
            var gpgsaData = gpsData.slice(t1, t2).split(",");
            
            t1 = gpsData.indexOf("$GPGGA");
            t2 = gpsData.indexOf("\n", t1);
            var gpggaData = gpsData.slice(t1, t2).split(",");
            
            t1 = gpsData.indexOf("$GPRMC");
            t2 = gpsData.indexOf("\n", t1);
            var gprmcData = gpsData.slice(t1, t2).split(",");
            
            
            var gpsMode = "";
            switch (gpgsaData[2]) {
                case "1":
                    gpsMode = "No Signal.";
                    break;
                case "2":
                    gpsMode = "2D";
                    break;
                case "3":
                    gpsMode = "3D";
                    break;
                default:
                    gpsMode = "Unk.";
                    break;
            }
            
           if (typeof gpgsaData[0] !== "undefined") {
                //get SV numbers
                var gpsSatNumbers = "";
                
                // Flag to print results
	            var printResults = true;
                
                for (i = 3; i < 15; i++) {
                    gpsSatNumbers += gpgsaData[i] + " ";
                    if (gpgsaData[i] === undefined) {
	                	printResults = false;
	                }
                }
                //format and output to screen
                var latMin = Math.round(((gpggaData[2].slice(2,gpggaData[2].length-1))/60)*10000);
				var tmpLat = gpggaData[2].slice(0,2) + "." + latMin  + gpggaData[3];

				var longMin = Math.round(((gpggaData[4].slice(3,gpggaData[4].length-1))/60)*10000);
				var tmpLong = gpggaData[4].slice(0,3) + "." + longMin  + gpggaData[5];
				
				if (printResults) {
                	this.controller.get('NMEA-text').innerHTML = "Mode: " + gpsMode + "<br/>Sat.List(SV\'s): " + gpsSatNumbers + "<br/>lat: " + tmpLat + "<br/>long: " + tmpLong + "<br/>Alt: " + gpggaData[9] + "Meters<br/>Speed: " + gprmcData[7] + "MPH";
            	}
            } else {
                this.controller.get('NMEA-text').innerHTML = "Invalid GPS data.  Perhaps connection is lost?";
            }
        } else {
            this.logInfo("Error: GPS data undefined.")
        }        
    } else {
        this.controller.get('NMEA-text').innerHTML += "<br/> Unable to read from SPP Port. Unknown error.";
    }

    //recursive call to SPP read
    this.openReadReady({"returnValue": true}); 
}

/* Disconnect SPP Device
 * !!!!Very Important!!!!
 * Disconnect from the SPP device when exiting the application!
 */
MainAssistant.prototype.disconnectSPP = function(){
    var that=this;
    
    //stop our timout
    this.controller.window.clearTimeout(this.hndTimeout);
 
    //close serial and spp connection
    if (this.targetAddress !== "" && this.instanceId !== undefined) {
        //close comm port
        this.controller.serviceRequest('palm://com.palm.service.bluetooth.spp', {
                    method: "close",
                    parameters: {"instanceId":this.instanceId},
                    onSuccess: function(objData){return;},
                    onFailure: function(failData) {
                        that.logInfo("Unable to Close SPP Port, errCode: " + failData.errorCode + "<br/>"+ failData.errorText);
                }                                                            
            });
        
        //disconnect from SPP
        this.connectBTDevice = this.controller.serviceRequest('palm://com.palm.bluetooth/spp', {
            method: "disconnect",
            parameters: {
                "address": this.targetAddress,
                "instanceId":this.instanceId
            },
            onSuccess: function(objData){
                that.logInfo("Disconnected from SPP");
                return;
            },
            onFailure: function(failData){
                that.logInfo("Disconnect, errCode: " + failData.errorCode);
            }
        });
    } 
}

/*
 * Simple screen logging - add mojo log here if logging to console.
 */
MainAssistant.prototype.logInfo = function(logText) {
    this.controller.get('log-output').innerHTML = "<strong>" +this.logOutputNum++ + "</strong>: " + logText + "<br />" + this.controller.get('log-output').innerHTML + "<br /><br />";       
}


MainAssistant.prototype.cleanup = function(event) {
    this.disconnectSPP();  //make sure to disconnect from the SPP SERVICE!
} 

