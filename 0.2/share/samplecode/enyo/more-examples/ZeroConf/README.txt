This sample shows how to use ZeroConf networking.
ZeroConf is a discovery protocol that lets you find services
on the local network without having to have any sort of directory
or DNS listing. It is often used to find other devices on the network
such as media servers, printers, and webservers.

#### 
ZeroConf information

ZeroConf is a protocol that lets software discover other software on the
local network without having a centralized directory server. It works by
sending special messages through multicast DNS. (hence the name of the
Java library we use: JmDNS).  


As a client it the protocol is very simple to use.  First 'BROWSE' the network
to find services.  Depending on the network congestion this could take a few
seconds. Once you find the services, scan through for the one you want. Services
are defined by a type. For this example we will search for the type '_palmdts._tcp'
which is supported by our test webserver.

Once you have found the correct service you must 'RESOLVE' it to turn the 
network reference into an actual port number and hostname/ipaddress. Then you
can connect to the real service. This whole process is shown in the 
ZeroConf.js file.

####
Running the webserver

This example has a simple Java webserver which has webservices to
move the mouse cursor. This server will advertise itself on the network
using ZeroConf.  The webOS application searches for the webserver,
connects to server, then makes webservice calls when the user clicks
on buttons. Using this app the user can remotely control the mouse on
their desktop computer.

To use this sample run the Java server first like this:

java -jar javaserver/javaserver_complete.jar

This will start a simple GUI with a button to open the browser 
to the webservice. This lets you verify that the server is running.


####
Running the webOS app

Now compile and run the webOS app in 'zeroconf_webos'.

    palm-package zeroconf_webos
    palm-install com.palmdts.zeroconf_1.0.0_all.ipk

Once the app is running press the scan button to find the server,
then you can move the mouse cursor with the app buttons.

** Note ** this application should be run on a real device. Depending on
your network configuration it may not work in the emulator.

    

######
Licenses

The Java server uses the following open source libraries:

The Jetty Webserver, licensed under the Apache License 2.0
    http://www.eclipse.org/jetty/licenses.php
    
The JmDNS library, licensed under the Apache License 2.0
http://jmdns.sourceforge.net/
