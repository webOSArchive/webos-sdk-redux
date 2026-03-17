/* Class: CheckCredentialAssistant
	 Purpose: Tests the credentials supplied by the user within the account screen.
	 Returns: returns credential data to be stored by account manager.  This is *very* important as it's based back to this service
	          when the onCreate function is called (after user taps 'create' during the account manager account creation process)
	          The service will then store this authentication data with the account information - see service assistant
	 */
var CheckCredentialsAssistant = Class.create(Transport.OAuthCommand, { 
	 run: function(responseFuture){ //run: called from user tap "sign in" ->account settings
		var future = new Future();
		console.log("CheckCredentialAssistant --> Running");
			
		future.now(this, function initiateLogin() {
         console.log("\n\n**************************START CheckCredentialAssistant*****************************");

			this.args = this.controller.args;
			Assert.require(this.args.username, "Plaxo contact sync: missing username - cannot log in");
			Assert.require(this.args.password, "Plaxo contact sync: missing password - cannot log in");

			//base64 for HTTP auth
			base64Auth = "Basic " + Base64.encode(this.args.username + ":" + this.args.password);

         //for basic auth use curl exec
         future.nest(AjaxCall.get(pingUrl, {
                            headers: {"Authorization": base64Auth,
                            "Connection": "keep-alive"}
                        }).then(function(future) { //success
                            var resultTXT = future.result.responseText;
                            console.log("------------------------>Authentication Success!:");
                            future._complete = true;
                            future.result = resultTXT;
                        },function(future) { // failure
                           future._complete = true;
                           console.log("------------------------>Authentication Failed!:");
                           console.error("Exception raised: " + future.exception);
                           throw error;
                  }) //end AjaxCall
           ); //end future.nest

		}); // end future.now
		
		//if AjaxCall was successful...
		future.then(this, function handleLoginResponse() {			
			var result = future.result, outResult;

         Assert.require(result, "Plaxo Contact Sync: CheckCredentialsAssistant failed to get data from server: falsy result");

			//below is needed for acct manager - at minimum fills in fields for user during re-authentication
			outResult = {
				returnValue: true,
				config:{
				   credentials: {
				      user: this.args.username,
					   password: this.args.password,
					   authToken: base64Auth
				      }
			      }	
			};
			future.result = outResult; 

		});
		
		console.log("\n\n**************************END CheckCredentialAssistant*****************************");
      
	   responseFuture.nest(future);
    } 
});