/*
 * SyncAssistant
 * Description: Handles the remote to local data conversion for Plaxo contacts
 */
var SyncAssistant = Class.create(Sync.SyncCommand, {
   
   _feedUrl: feedURL,
   _maxResults: 50,
   
   //used to define what to sync
   _templates: {
      contact: {
         remote2local: {
            __partial: true,
            name: function (from) {
               return from.name;
            },
            emails: function (from) {
               return from.emails;
            },
            phoneNumbers: function (from) {
               return from.phoneNumbers;
            },
            ims: function (from) {
               return from.ims;
            },
            addresses: function (from) {
               return from.addresses;
            },
            organizations: function (from) {
               return from.organizations;
            },
            relations: function (from) {
               return from.relations;
            },
            customFields: function (from) {
               return from.customFields;
            }
         },
         //just a placeholder to indicate currently no upsync
         local2remote: false
      },
      contactset: {
      }
   },
    
   /*
    * Return an array of strings identifying the object types for synchronization, in the correct order.
    * In this case: Kinds.objects.contact.name
    */
   getSyncOrder: function () {
        console.log("\n\n**************************SyncAssistant: getSyncOrder*****************************");
        return Kinds.syncOrder;
   },

   /* Return an array of "kind objects" to identify object types for synchronization
    * This will normally be an object with property names as returned from getSyncOrder, with structure like this:
    */
   getSyncObjects: function () {
        console.log("\n\n**************************SyncAssistant: getSyncObjects*****************************");
        return Kinds.objects;
   },

    /*
     * Tells sync engine the transformation type.  remote2local or local2remote  
     */
   getTransformer: function (name, kindName) {
      console.log("\n\n**************************SyncAssistant: getTransformer*****************************");
      if (kindName === Kinds.objects.contact.name) {
         console.log("--------------> transformation type: " + name + "\n");
         return this._getContactTransformer(name);
      } else {
        throw new Error("--------------> Kind name not recognized: '" + kindName + "'");
      }
   },
   
   _getContactTransformer: function (name) {
      console.log("\n\n**************************SyncAssistant:_getContactTransformer*****************************");

      if (name === "remote2local") {
         //this is down-sync - create transformer object
         var transformer = new Json.Transformer(this._templates.contact.remote2local);
         return function (to, from) {
            return transformer.transformAndMerge(to, from);
         };
      } else if (name === "local2remote") {
         return undefined;
      } else {
         //we don't do any other syncs
         return undefined;
      }

    },

   getRemoteId: function (obj, kindName) {
      console.log("\n\n**************************SyncAssistant:getRemoteID*****************************");
      
        if (kindName === Kinds.objects.contact.name) {
            console.log("obj.id: " + obj.id);
            return obj.id;
      
        } else {
           throw new Error("--------------> Kind name not recognized: '" + kindName + "'");
      }
   },

   isDeleted: function (obj, kindName) {
      console.log("\n\n**************************SyncAssistant:isDeleted*****************************");
      
        if (kindName === Kinds.objects.contact.name) {
           if (obj && obj.isDeleted) {
                console.log("true");
            return true;
         } else {
                console.log("false");
            return false;
         }
      
        } else {
           throw new Error("--------------> Kind name not recognized: '" + kindName + "'");
      }
   },
   
   getRemoteChanges: function (state, kindName) {
      console.log("\n\n**************************SyncAssistant:getRemoteChanges*****************************");
        
        if (kindName === Kinds.objects.contact.name) {
           return this._getRemoteContactChanges(state);
      
        } else {
           throw new Error("--------------> Kind name not recognized: '" + kindName + "'");
      }
   },
   
   _getRemoteContactChanges: function (state) {
      console.log("\n\n**************************SyncAssistant:_getRemoteContactChanges*****************************");
          var future = new Future();
          var savedTransportObject = this.client.transport;
          var maxresults = 50;
          var lastSyncDate;
          
        future.now(this, function() {
            //first time sync exception: 
            if (state === "first") {
               lastSyncDate = 0;
            }
            //set lastModified date and configure URL for AJAX CALL
            lastSyncDate = (savedTransportObject && savedTransportObject.syncKey && savedTransportObject.syncKey.lastModified) || "000-05-02T00:01:01Z";

            //can limit by: https://www.plaxo.com/pdata/contacts/@me/@all?filterOp=contains&updatedSince=2011-01-02T00%3A01%3A01Z&fields=id%2C+updated%2C+name&count=20&sortBy=displayName&sortOrder=ascending            console.log("\n\n\n------------>lastSyncDate" + lastSyncDate + "\n\n\n");
            future.nest(AjaxCall.get(feedURL + "?filterOp=contains&updatedSince=" + querystring.escape(lastSyncDate), { 
                        headers: {
                        "Authorization": globUserAuth.authToken, 
                        "Connection": "keep-alive"}
                    }).then(function(future) { //success
                        //console.log("------------>SUCCESS:"+JSON.stringify(future.result));
                       console.log("------------>SUCCESS");
                       future.result = future.result;
                   },function(future) { // failure
                        //console.log("------------>FAIL:"+JSON.stringify(future.exception));
                      future._complete = true;
                      console.log("--------------> Exception raised: " + future.exception);
                   }) 
                ); 
           }); 


        //called from success callback
        future.then(this, function handleLoginResponse() {          
            var changes = future.result.responseJSON || [];
            var last, i, nlast, more;

            if(!changes || changes.entry.length>0){
               console.log("\n---------------> changes.responseText.length: " + changes.entry.length + "\n\n------------>Last Sync"+lastSyncDate);
            } else {
               throw new Error("\n---------->Contact sync: received an invalid or empty response from Sync call: " + Contacts.Utils.stringify(changes) + "\n\n");
            } 
            var len = changes.entry.length;
            
            //find the latest contact record
            last = lastSyncDate;
            
            for (i = 0; i < len; i += 1) {
                nlast = changes.entry[i].published; //we need "entry[x].published" - plaxo uses zulu time so : 010-06-02T19:53:08Z example

                console.log("\n------------->Last Mod Test new vs old = " + nlast + ">" + last + "\n\n\n");

                if (nlast > last) {
                    last = nlast;
                }

                //TODO: pull this from kinds
                changes.entry[i]._kind = Kinds.account.metadata_id;
                changes.entry[i].accountId = globAccountId;
           }
            lastSyncDate = last;
            this._kind += len;
            more = true;
            console.log("\n--------------->len:"+len + "  maxresults:"+maxresults);
          
            //check to see if we need to call this method again for more results (more=true/false)
            more = false
            if (len >= maxresults) {
                console.log("\n\n -->>exception fired - lastModified set to:"+ lastSyncDate + "  more:" + more);
                //savedTransportObject.syncKey.lastModified = lastSyncDate;
                more = true;  //TODO: for now don't call this method again
            }
            savedTransportObject.syncKey.lastModified = lastSyncDate;

            var parsedEntries = changes.entry;

            future.result = {
                more: more,
                entries: parsedEntries
            };
        });
     
     return future; 
   },
   
   /*
    * Given a set of remote ids, returns a set of remote objects matching those ids.
    */
   getRemoteMatches: function (remoteIds, kindName) {
      console.log("\n\n**************************SyncAssistant:getRemoteMatches*****************************");

        if (kindName === Kinds.objects.contact.name) {
         return this._getRemoteContactMatches(remoteIds);
      } else {
         throw new Error("Kind name not recognized: '" + kindName + "'");
      }
   },
   
   _getRemoteContactMatches: function (remoteIds) {
      var futureToReturn;
      var annotatedRemoteIds;
      
      
      console.log("\n\n**************************SyncAssistant:_getRemoteContactMatches*****************************");
      
      Assert.require(remoteIds, "Plaxo contact sync: getRemoteMatches called with falsy remoteIds argument: " + remoteIds);
      Assert.requireArray(remoteIds, "Plaxo contact sync: getRemoteMatches requires an array as the remoteIds argument: " + remoteIds);
      
      if (remoteIds.length === 0) {
         //short-circuit the case where there's 0 entries in the ids array
         console.log("\n\n------------------------>no remote ID's\n\n");
         
         futureToReturn = new Future();
         futureToReturn.now(this, function () {
            futureToReturn.result = [];
         });

      } else {
         //if we get here, we have multiple remote objects to get
         
         //create an array of index-remoteId pairs, so that we can pass the original array index 
         //through map-reduce and use it to re-sort the objects on the other side
         annotatedRemoteIds = [];
         remoteIds.forEach(function (remoteId, index) {
            annotatedRemoteIds.push({
               index: index,
               remoteId: remoteId
            });
         });

         console.log("----------------------->_getRemoteContactMatches is calling AjaxCall");

         futureToReturn.now(this, function() {
            future.nest(AjaxCall.get(feedURL, { headers: {
            "Authorization": globUserAuth.authToken,
               "Connection": "keep-alive"}
               }).then(function(future) { //success
                         var resultTXT = future.result.responseText;
                         console.log("------------------------>Got Result");
                         future._complete = true;
                         future.result = resultTXT;

                     },function(future) { // failure
                        future._complete = true;
                        console.log("----------------->Exception raised: " + future.exception);
                     }) //end AjaxCall

              ); //end future.nest

         }); // end future.now

         futureToReturn.then(this, function () {
            var annotatedResults = futureToReturn.result;
            var sortedContacts = [];

            //for each contact we get back, put it in the correct entry in the sortedContacts array
            annotatedResults.forEach(function (annotatedResult) {
               sortedContacts[annotatedResult.result.index] = annotatedResult.result.remoteContact;
            });

            futureToReturn.result = sortedContacts;
         });
      }
      return futureToReturn; 
   }
});
