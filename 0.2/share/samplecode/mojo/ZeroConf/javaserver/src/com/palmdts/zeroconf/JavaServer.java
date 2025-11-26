package com.palmdts.zeroconf;

import org.eclipse.jetty.server.Server;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceTypeListener;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;

/**
 * A simple Java server. It sets up the Jetty server to listen for 
 * webservice requests on port 8945. It also advertises the
 * webservice using ZeroConf MDNS.  Finally it creates a simple
 * desktop GUI to monitor the status and shut down the server.
 */
public class JavaServer {
    public static String DEMO_SERVICE_NAME = "_palmdts._tcp.local.";
    public static JmDNS jmdns;
    private static int port;

    public static void main(String ... args) throws Exception {

        port = 8945;
        Server server = setupWebserver();

        setupZeroConf();

        //set up the GUI on the GUI thread
        SwingUtilities.invokeLater(new Runnable(){
            public void run() {
                setupGUI();
            }
        });

        //wait until jetty is shut down
        server.join();
    }

    /*
    * Set up the Jetty webserver with just on handler, the ScreenHandler
    */
    private static Server setupWebserver() throws Exception {
        //set up the jetty server
        Server server = new Server(port);
        server.setHandler(new ScreenHandler());
        server.start();
        return server;
    }

    /*
    * Set up the ZeroConf server to advertise our webserver.
     */
    private static void setupZeroConf() throws IOException {
        //set up the ZeroConf server
        jmdns = JmDNS.create();
        p("host = " + jmdns.getHostName());
        p("using port: " + port);
        p(" interface = " + jmdns.getInterface());

        //create a service to represent us
        ServiceInfo service = ServiceInfo.create(DEMO_SERVICE_NAME, "foobar", port, "the PalmDTS sample zeroconf service");
        System.out.println("creating: " + service);
        jmdns.registerService(service);
    }


    /*
     * Set up a simple gui to show the status and let the user
     * shutdown the server.
     */
    private static void setupGUI() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel,BoxLayout.Y_AXIS));

        panel.add(new JLabel("ZeroConf Demo Server"));
        panel.add(new JLabel("server is active"));

        Button openBrowser = new Button("check server in browser");
        openBrowser.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                try {
                    URLUtils.openBrowser("http://"+jmdns.getInterface()+":"+port+"/");
                } catch (IOException e1) {
                    e1.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
                }
            }
        });
        panel.add(openBrowser);

        JButton quit = new JButton("quit");
        quit.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                jmdns.unregisterAllServices();
                jmdns.close();
                System.exit(0);
            }
        });
        panel.add(quit);

        JFrame frame = new JFrame();
        frame.add(panel);
        frame.setSize(500,300);
        frame.setVisible(true);
    }

    private static void p(String s) {
        System.out.println(s);
    }
    
}
