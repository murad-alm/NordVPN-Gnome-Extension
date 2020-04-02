/**
 * @author Murad Al Moadamani
 */

/* Import St because it is the library that allow to create UI elements */
const St = imports.gi.St;
/* Import Main because it will have all the UI elements */
const Main = imports.ui.main;
/* Import Clutter because is the library that allow us to use layout UI elements */
const Clutter = imports.gi.Clutter;
/* Import mainloop to execute commands after a certain period of time */
const MainLoop = imports.mainloop;
/* Import GLib to be able to execute terminal commands */
const GLib = imports.gi.GLib;
/* Import Lang because we will write code in a Object Oriented Manner */
const Lang = imports.lang;

const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

let button, timeout, icon, box;


const NordVPNStatusButton = new Lang.Class({
    Name: 'StatusButton',      // Class name
    Extends: PanelMenu.Button,  // Parent class

    //Constructor
    _init: function(){
        /*
         * Call the parent constructor
         * first argument is the menu alignment (1 is left, 0 right and 0.5 is centered)
         * second argument is the name
         * third argument: true to create a menu automatically, otherwise false
         */
        // box = new St.BoxLayout();
        this.parent(1, 'StatusButton', false);
        this.setBox("idle");

    },


    setBox: function(status){
        box = new St.BoxLayout();
            
        switch(status){
            case "connected":
                icon =  new St.Icon({style_class: 'connected_icon'});
                break;
            case "disconnected":
                icon =  new St.Icon({style_class: 'disconnected_icon'});
                break;
            case "connecting":
                icon =  new St.Icon({style_class: 'connecting_icon'});
                break;
            default:
                icon =  new St.Icon({style_class: 'idle_icon'});
        }

        box.add(icon);
        // box.add(PopupMenu.arrowIcon(St.Side.BOTTOM)); // Add down-arrow icon

        this.actor.add_child(box); // Add the box to the top panel
    },


    destroy: function(){
        this.parent();  // Call the paren destroy function
        
    }
});


function checkStatus(){
    var [_, out, _, _] = GLib.spawn_command_line_sync('nordvpn status'); // Execute the `nordvpn status` command
    var statusText = out.toString(); // The result of the executed command

    // Disconnected
    if (statusText == "Status: Disconnected\n"){
        button.actor.remove_child(box);
        button.setBox("disconnected");
        return true;
    }

    // Connecting
    else if (statusText.startsWith("Status: Connecting")){
        button.actor.remove_child(box);
        button.setBox("connecting");
        return true;
    }

    // Connected
    else if (statusText.startsWith("Status: Connected")){
        try{
            server = statusText.split('\n')[1].split(': ')[1].split('.')[0] //extract server name from string
        }catch(e){
            logError(e, 'ExtensionError');
        }
        button.actor.remove_child(box);
        button.setBox("connected");
        return true;
    }
}


function init(){    
}


function enable(){
    button = new NordVPNStatusButton;
    /**
     * Add the button to the status area
     * first argument is the role, must be unique. You can access it from the Looking Glass in 'Main.panel.statusArea.NordVPNStatusButton`
     * second argument is the position
     * finally where we want the button to be displayed in the box (left, right, center)
     */
    Main.panel.addToStatusArea('NordVPNStatusButton', button, 0, 'right');
    timeout = MainLoop.timeout_add_seconds(1.0, checkStatus);
}


function disable(){
    // MainLoop.secure_remove(timeout);  
    button.destroy();
}
