package com.palmdts.zeroconf;

import com.joshondesign.xml.XMLWriter;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * ScreenHandler is a handler for Jetty webservice requests.
 * This handler accepets simple REST style requests to move
 * the mouse cursor around.  Requests should be in the form
 *
 * /moveMouse?action=center
 * /moveMouse?action=up | down | left | right
 *
 * The service will return an error if the action is missing or invalid.
 *
 */
public class ScreenHandler extends AbstractHandler {

    public void handle(String target, Request request, HttpServletRequest httpServletRequest, HttpServletResponse response) throws IOException, ServletException {
        p("target = " + target);
        response.setContentType("text/xml;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        PrintWriter writer = response.getWriter();
        if("/moveMouse".equals(target)) {
            moveMouse(request);
            sendOkay(target,writer);
        } else {
            if("/".equals(target)) {
                sendStatus(writer);
            } else {
                sendBadTarget(target,writer);
            }
        }
        writer.close();
    }

    /*
     * moveMouse uses the java.awt.Robot class to move the user's actual mouse cursor.
     */
    private void moveMouse(Request request) {
        try {
            //create an instance of Robot
            Robot robot = new Robot();

            //get the action and current mouse location
            PointerInfo mouse = MouseInfo.getPointerInfo();
            p("mouse = " + mouse.toString());
            p("locaiton = " + mouse.getLocation());

            //get the size of the screen
            Dimension size = Toolkit.getDefaultToolkit().getScreenSize();

            String action = request.getParameter("action");
            p("action = " + action);
            if("center".equals(action)) {
                //if action is center, then center the mouse
                robot.mouseMove((int)size.getWidth()/2, (int)size.getHeight()/2);
            } else {
                //if action is not center, the move the mouse
                int x = (int) mouse.getLocation().getX();
                int y = (int) mouse.getLocation().getY();
                int step = 20;
                if("up".equals(action)) y-=step;
                if("down".equals(action)) y+=step;
                if("left".equals(action)) x-=step;
                if("right".equals(action)) x+=step;
                robot.mouseMove(x,y);
            }
        } catch (AWTException e) {
            e.printStackTrace();
        }
    }

    private void sendBadTarget(String target, PrintWriter writer) {
        try {
            XMLWriter xml = new XMLWriter(writer, new URI("http://localhost:8080/"));
            xml.header();
            xml.start("response","status","error");
            xml.start("target","name",target).end();
            xml.end();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private void sendOkay(String target, PrintWriter writer) {
        try {
            XMLWriter xml = new XMLWriter(writer, new URI("http://localhost:8080/"));
            xml.header();
            xml.start("response","status","ok");
            xml.start("target","name",target).end();
            xml.end();
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private void sendStatus(PrintWriter writer) {
        XMLWriter xml = null;
        try {
            xml = new XMLWriter(writer, new URI("http://localhost:8080/"));
            xml.header();
            xml.start("response","status","ok");
            xml.start("message").text("server is active").end();
            xml.end();
        } catch (URISyntaxException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }


    private void p(String s) {
        System.out.println(s);
    }
}

