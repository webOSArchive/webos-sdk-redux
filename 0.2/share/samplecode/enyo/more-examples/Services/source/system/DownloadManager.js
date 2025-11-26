enyo.kind({
   name: "system.DownloadManager",
   kind: HeaderView,   
   components: [
       // Download button
      {
         name: "downloadButton",
         kind: "Button",
         caption: "Download",
         onclick: "download"
      },
       // Upload button
      {
         name: "uploadButton",
         kind: "Button",
         caption: "Upload",
         onclick: "upload"
      },
      {
         name: "statusContainer",
         style: "word-wrap: break-word;"
      },
      // App Manager Service
      {
         name: "downloadManager",
         kind: "PalmService",
         service: "palm://com.palm.downloadmanager"
         //onSuccess: "onSuccess",
         //onFailure: "onFailure"
      }
   ], 
   // End Components
   
   download: function(inSender) {
      this.$.downloadManager.call(
         {
            target: "http://developer.palm.com/download/attachments/38731952/palm-mojo-styling-07.xls",
            //"mime" : "my-mime-type" (optional)
            targetDir : "/media/internal/palmdts/", //(has to be within /media/internal, will default to /media/internal/downloads)
            targetFilename : "palm-mojo-styling-07.xls", //(will default to originalfilename)
            keepFilenameOnRedirect: true,
            subscribe: false,
         },
         {
            method: "download",
            onSuccess: "onDownloadSuccess",
            onFailure: "onDownloadFailure"
         }
      );
   },
   upload: function(inSender) {
      this.$.downloadManager.call(
         {
            fileName: '/media/internal/wallpapers/01.jpg',
            url: 'www.freeaspupload.net/freeaspupload/testUpload.asp',
            fileLabel: "filename",
            subscribe: true
         },
         {
            method: "upload",
            onSuccess: "onUploadSuccess",
            onFailure: "onUploadFailure"
         }
      );
   },
   /**
    * Note: 
    * Anything short of a missing target parameter will cause "onSuccess" to be called.
    * For example, trying to download a file that does not exist will still
    * result in "onSuccess" getting called. However, the completionStatusCode
    * field of the response object will indicate an error . A negative number
    * for this field always means an error.
    *
    * Therefore we must manually check the completionStatusCode for errors.
    */
   onDownloadSuccess: function(inSender, inResponse) {
      // If the status code is greater than 0 we have a success.
      //if (inResponse.completionStatusCode >= 0) {
         console.log("success: download - " + enyo.json.stringify(inResponse));
         this.$.statusContainer.setContent("Download success, ticket = " + inResponse.ticket + "\npalm-mojo-styling-07.xls saved to /media/internal/palmdts/");
      //Otherwise something went wrong.
      //} else {
      //   this.onDownloadFailure(inSender, inResponse);
      //}
   },
   onDownloadFailure: function(inSender, inResponse) {
      console.log("failure: download - " + enyo.json.stringify(inResponse));
      this.$.statusContainer.setContent("Download failure: " + enyo.json.stringify(inResponse));
   },
   /**
    * Note: 
    * Anything short of a missing target parameter will cause "onSuccess" to be called.
    * However, the completionCode and errorCode fields of the response object will
    * indicate an error. A negative number for completionCode always means an
    * error.
    *
    * Therefore we must manually check the completionCode for errors.
    * The errorCode field contains a string describing the error.
    */
   onUploadSuccess: function(inSender, inResponse) {
      //if (inResponse.completionCode >= 0) {
         console.log("success: upload - " + enyo.json.stringify(inResponse));
         this.$.statusContainer.setContent("Upload success, ticket = " + inResponse.ticket);
      //} else {
      //   this.onUploadFailure(inSender, inResponse);
      //}
   },
   onUploadFailure: function(inSender, inResponse) {
      console.log("failure: upload - " + enyo.json.stringify(inResponse));
      this.$.statusContainer.setContent("Upload failure: " + enyo.json.stringify(inResponse));
   }
});
