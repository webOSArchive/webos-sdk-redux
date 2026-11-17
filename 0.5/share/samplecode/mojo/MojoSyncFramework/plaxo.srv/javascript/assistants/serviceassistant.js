/* ServiceAssistant
 * Description: This method handles the high level transport setup.
 * This assistant is called before anything within the service.  This is useful to intercept the various endpoints and 
 * handle various tasks like key storage or customizations
 * 
 * To run manually: 
 * run-js-service -d /media/cryptofs/apps/usr/palm/services/com.plaxo.newcontacts.service/
 */
 
 var ServiceAssistant = Transport.ServiceAssistantBuilder({
    //clientId: "",
    client: Class.create(Sync.AuthSyncClient, {
       
       setup: function setup(service, accountid, launchConfig, launchArgs) {
         console.log("\n\n**************************START SERVICEASSISTANT*****************************");
         //for testing only - will expose credentials to log file if left open
         console.log("\n------------------->launchConfig"+JSON.stringify(launchConfig));
         console.log("\n------------------->launchArgs"+JSON.stringify(launchArgs));

         //Optional: check for following data and launch welcome app if "Initial Sync"
         //launchArgs{"$activity":{"activityId":109,"callback":{"serial":234742332},"creator":{"serviceId":"com.plaxo.newcontacts.service"},"name":"Initial Sync:com.plaxo.newcontacts.service:++HP05GAi38aGTrg"},"accountId":"++HP05GAi38aGTrg"}

         //these two endpoints don't require stored auth data (passed in as default)
         if (launchConfig.name === "onDelete" || launchConfig.name === "checkCredentials") {
               globUserAuth = {"user":launchArgs.username, "password":launchArgs.password};            
               future = new Future(function(){return true;});
               future.then(this, function() {
                  return true;
               });
            } 
         else {
            globAccountId = launchArgs.accountId;

            //check to see if the key exists
            var future = KeyStore.checkKey(globAccountId);

            future.then(this, function() {
               //console.log("------------->Checked Key"+JSON.stringify(future.result));

               if(future.result.value) {  //found key
                  console.log("------------->Existing Key Found");
                  var getKey = KeyStore.getKey(globAccountId).then(function(getKey) {
                     //console.log("------------->Got Key: "+JSON.stringify(getKey.result));
                     globUserAuth = {"user":getKey.result.credentials.user, "password":getKey.result.credentials.password, "authToken": getKey.result.credentials.authToken};            
                     }); 
               } 
               else { //no key found - check for username / password and save
                  console.log("------------->No Key Found - Putting Key Data and storing globally");
                  globUserAuth = {"user":launchArgs.config.credentials.user, "password":launchArgs.config.credentials.password, "authToken":launchArgs.config.credentials.authToken};            
                  var putKey = KeyStore.putKey(globAccountId, globUserAuth).then(function(putKey) {
                     //console.log("------------->Saved Key"+JSON.stringify(putKey.result));
                     }); 
               }
               return true;
            });
         }

         //preconfiguration of the service is complete...launch the sync engine
         future.then(this, function() {
            this.$super(setup)(service, globAccountId, undefined, Transport.HandlerFactoryBuilder(Sync.SyncHandler(Kinds)));
            return true;
         });
         
         return future;

      },
      getSyncInterval: function () {
         return new Future("20m");  //default sync interval
      },
      requiresInternet: function () {
         return true;  //yes, we need internet to connect to Plaxo
      }
   })
});

//these endpoints are delegated to the sync framework to handle - use the serviceassistant code above to intercept
var OnCreate = Sync.CreateAccountCommand;
var OnDelete = Sync.DeleteAccountCommand;
var OnEnabled = Sync.EnabledAccountCommand;


