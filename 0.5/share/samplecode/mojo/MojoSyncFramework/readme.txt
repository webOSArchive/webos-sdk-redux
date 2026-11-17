Mojo Sync Framework - Contact Sample


This sample contains a one way (down) contact sync using the mojo sync framework and Plaxo.


Directories / files:plaxo.accts: contains account definition and icon data.
plaxo.application: contains plaxo "place holder" application
plaxo.package: installer meta data for this package
plaxo.srv: mojo sync synergy service
  - configuration: contains kind and permission meta data
  - javascript: where the service assistants and utilities are located
  - services.json: service identifiers and endpoint definition
  - sources.json: source file load list




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
  
Please note, sync frameworks are intended to work between primary data providers and can be more complicated to develop.  If you need to enter only a few records into contact or calendar accounts, it's recommended to look at the cross app push or synergy service sample instead.




7/21/2011 Update:
Changed the plaxo.accts/account-template.json file to include security permissions for com.palm applications and services now required with 3.02 and above.