Sample Calendar Sync

The set of files within this directory provide a simple example of how to write a calendar sync application on the webOS platform.

The files are layed out in the following order:

/accounts:
This directory contains the account template and icon data for the accounts associated with this package.  Also contains the icons used to associated this account within the account manager appliation.

/package:
Overall package information is contained with in the package directory.  The packageinfo.json file tells both palm-package and the on device installer what services, accounts and activities to register.  Any package can contain one application, one or more services and/or one or more accounts.

/service:
This is where the service which handles the synergy function lives.  Contained within are key files:
   /service/configuration/db/kinds: this is where kind data, automatically installed, is located
   /service/configuration/db/permissions: db_kind permissions are automatically setup based on the
   files located here.  
   /service/prologue.js: this is the first file to be loaded by the javascript runtime.
   /service/serviceEndPoints.js: is where the key end points for the service are located
   /service/services/json: defines the service end points
   /service/sources.json: contains a list of source files loaded by the javascript runtime

/app
The webOS front end application is stored here.  NOTE: this app is a placeholder only.  It is suggested the developer create a landing page using a simple application.  All the user interfaces should be done through the account manager.


Testing:
Create an account with Plaxo (www.plaxo.com)
Install the application by using the buildpackage shells script
Open calendar and add an account
Pick "DTS Calendar"
Enter autentication data for Plaxo
Confirm the addition of account
sync
Within the calendar a dinner reservation for tonight should appear.


In this case, the application does not fully sync to a third party.  It simply shows how the developer can create calendar objects and authenticate to third party sync sites.  To see a fully featured sync, check out the contact sync example.



  