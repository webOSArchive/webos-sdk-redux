Synergy Service - Contact Sample


This sample contains a one way (down) contact sync using the standard synergy end points.


Directories and files
accounts: Account definition and icon data.
app: contains plaxo "place holder" application
package: installer meta data for this package
service: synergy service code



To test,use the following instructions:

  
* A Plaxo(www.plaxo.com) account with contacts entered is required.
  
* Install by running buildpackage when a webOS device is connected or the emulator is running (2.1 and above).
  
* Open the contacts application on the device or emulator
  
* If this is the first time contacts has been open, tap the add new account button.  Otherwise, tap the contacts drop down menu and select preferences.
  
* Scroll to the bottom of the preferences screen and tap add account.
  
* Tap "Plaxo new" in the account connector list.
  
* Enter your email and password
  
* The authentication process will begin.  Please allow up to 30 seconds (typically 3-4 seconds).
  
* When authentication is complete, complete the account confirmation screen.
  
* The synergy service is now configured and will be called during the next sync.  To force a sync, tap sync now in the preferences screen.
  
* Contacts within your Plaxo account should now synchronize.