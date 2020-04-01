/**
 * @author Murad Al Moadamani
 */

/* Import St because it is the library that allow to create UI elements */
const St = imports.gi.St;
/*
 * Import Main because is the instance of the class that have all the UI elements
 * and we have to add to the Main instance our UI elements
*/
const Main = imports.ui.main;

const MainLoop = imports.mainloop;
const GLib = imports.gi.GLib; //to have terminal access


let panelButton, panelButtonText, timeout;

// const PopupMenu = imports.ui.popupMenu;

function init(){
    panelButton = new St.Bin({
        style_class: "panel-button"
    });

    panelButton.set_child(
        new St.Label({
            style_class: "neutral_text",
            text: "Starting.."
        })
    );
}

/*
Status: Connected,
Current server: abc123.nordvpn.com,
Country: XXXXXXX,
City: XXXXXXXXXXXX,
Your new IP: xxx.xxx.xxx.xxx,
Current technology: OpenVPN,
Current protocol: UDP,
Transfer: xx.xx MiB received, 
xx.xx MiB sent,
Uptime: xx minutes xx seconds,




Status: Connecting
Current server: abc123.nordvpn.com
Country: XXXXXXX
City: XXXXX
Your new IP: xxx.xxx.xxx.xxx
Current technology: OpenVPN
Current protocol: UDP


*/

/**
 * Update message: 
 * A new version of NordVPN is available! Please update the application.
 */


function checkStatus(){
    var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn status');
    var statusText = out.toString();

    if (statusText == "Status: Disconnected\n"){
        panelButton.set_child(new St.Label({style_class: "unprotected", text: "UNPROTECTED!"}));
        return true;
    }

    else if (statusText.startsWith("Status: Connecting")){
        panelButton.set_child(new St.Label({style_class: "connecting", text: "Connecting.."}));
        return true;
    }

    else if (statusText.startsWith("Status: Connected")){
        try{
            server = statusText.split('\n')[1].split(': ')[1].split('.')[0] //extract server name from string
        }catch(e){
            logError(e, 'ExtensioError');
        }
        panelButton.set_child(new St.Label({style_class: "protected", text: server}));
        return true;
    }
}

function enable(){
    Main.panel._rightBox.insert_child_at_index(panelButton, 1);
    timeout = MainLoop.timeout_add_seconds(1.0, checkStatus); //run check every 1 second
}

function disable(){
    MainLoop.source_remove(timeout);
    Main.panel._rightBox.remove_child(panelButton);
}
