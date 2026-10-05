package com.palmdts.zeroconf;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceListener;
import javax.jmdns.ServiceTypeListener;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * This is a test app to try to search for the webservice
 * and make one request on it.
 */

public class ZCBrowser {

    public static void main(String ... args) throws IOException {
        
        final JmDNS dns = JmDNS.create();


        //list everything we find.
        dns.addServiceTypeListener(new ServiceTypeListener(){
            public void serviceTypeAdded(ServiceEvent serviceEvent) {
                p("aaa type = " + serviceEvent.getType());
            }
        });
        dns.addServiceListener(JavaServer.DEMO_SERVICE_NAME, new ServiceListener(){
            public void serviceAdded(ServiceEvent serviceEvent) {
                p("bbb type = " + serviceEvent.getType());
                if(JavaServer.DEMO_SERVICE_NAME.equals(serviceEvent.getType())) {
                    p("found the server we are looking for: ");
                    p("requesting to resolve");
                    serviceEvent.getDNS().requestServiceInfo(serviceEvent.getType(), serviceEvent.getName());
                }
            }

            public void serviceRemoved(ServiceEvent serviceEvent) {
                p("removed: " + serviceEvent);
            }

            public void serviceResolved(ServiceEvent serviceEvent) {
                p("resolved! " + serviceEvent.getName() + " " + serviceEvent.getType());
                String host = serviceEvent.getInfo().getHostAddress();
                int port = serviceEvent.getInfo().getPort();
                p("service is at : " + host + " " + port);
                requestMouseMove(host,port);
            }
        });
    }

    private static void requestMouseMove(String host, int port) {
        try {
            p("requesting mouse move");
            URL url = new URL("http://"+host+":"+port+"/moveMouse");
            InputStream in = url.openStream();
            while(true) {
                int n = in.read();
                if(n < 0) break;
            }
            in.close();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void p(String s) {
        System.out.println(s);
    }
}
