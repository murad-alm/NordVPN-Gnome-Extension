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

// const CONNECTION_STATUS = Object.freeze({ "connected": 1, "disconnected": 2, "connecting": 3 });

let nvpnStatusBtn, timeout, icon, panelBox, actionButton, label;
let killSwitchToggle, cyberSecToggle, obfuscateToggle, notifyToggle, autoConnectToggle;


/**
 * TODOs:
 * [x] check if nordVPN is installed
 * [ ] handle errors when executing a command
 * [x] check if user is logged in
 * [ ] handle login in UI
 * [x] don't display any options if nordvpn is not installed or if the user is not logged in.
 * [ ] one method to execute shell commands instead of calls all over the place..
 * [ ] if connected display current connection info
 */


const NordVPNStatusButton = new Lang.Class({
    Name: 'StatusButton',      // Class name
    Extends: PanelMenu.Button,  // Parent class

    //Constructor
    _init: function () {
        /*
         * Call the parent constructor
         * first argument is the menu alignment (1 is left, 0 right and 0.5 is centered)
         * second argument is the name
         * third argument: true to create a menu automatically, otherwise false
         */
        this.parent(1, 'StatusButton', false);
        this.setPanelBox("idle");                                                       // Set the box in the upper panel

        if (!this.checkNordVpnInstalled()) {                                             // Check if nordvpn is installed on the system
            this.initNotFound();
        }
        else if (this.checkUserLoggedIn()) {                                           // Check if the user is logged in
            this.initNotLoggedIn();
        }
        else {
            this.initUI();                                                              // Initialize all elements of the UI 
            this.setToggles();                                                          // Set the status of the toggle switches at start to match the settings
            this.setToggleActions();                                                    // Set the functionality of the toggle switches
            this.setActionButton("disconnected");                                       // Set the status of the action button at start
            actionButton.connect('clicked', this.setActionButtonOnClick.bind(this));    // Assign the `OnClick` functionality to the actionButton
        }

    },

    initNotFound: function () {
        // Initialize the message to display
        msg = 'NordVPN was not found!\n' +
              'Please install it and re-enable this extension.';
        label = new St.Label({ text: msg, x_align: St.Align.END });
        // textBox will hole the labe
        textBox = new St.BoxLayout();
        textBox.set_vertical(true);
        textBox.add_child(label);
        // Setup the container that holds the textBox and add it to the menu
        container = new PopupMenu.PopupBaseMenuItem({reactive: false});
        container.actor.add(textBox, { expand: true, x_fill: true });
        this.menu.addMenuItem(container);
    },

    initNotLoggedIn: function(){
        // Initialize the message to display
        msg = 'You are not logged in to NordVPN!\n' +
              'Please log in using terminal and re-enable this extension.';
        label = new St.Label({ text: msg, x_align: St.Align.END });
        // textBox will hole the labe
        textBox = new St.BoxLayout();
        textBox.set_vertical(true);
        textBox.add_child(label);
        // Setup the container that holds the textBox and add it to the menu
        container = new PopupMenu.PopupBaseMenuItem({reactive: false});
        container.actor.add(textBox, { expand: true, x_fill: true });
        this.menu.addMenuItem(container);
    },

    initUI: function () {
        // Toggle Switches
        killSwitchToggle = new PopupMenu.PopupSwitchMenuItem('Kill Switch');
        cyberSecToggle = new PopupMenu.PopupSwitchMenuItem('CyberSec');
        obfuscateToggle = new PopupMenu.PopupSwitchMenuItem('Obfuscate');
        notifyToggle = new PopupMenu.PopupSwitchMenuItem('Notify');
        autoConnectToggle = new PopupMenu.PopupSwitchMenuItem('Auto Connect');


        // Action Button
        actionButtonContainer = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false }); // The container will hold the innerBox
        innerBox = new St.BoxLayout(); // This innerBox will hold the action button
        innerBox.set_vertical(true);
        actionButton = new St.Button();
        innerBox.add_child(actionButton);
        actionButtonContainer.actor.add(innerBox, { expand: true });

        /*
        let popupMenuExpander = new PopupMenu.PopupSubMenuMenuItem('More Information');
        let subMenu = new PopupMenu.PopupMenuItem('PopupMenuItem');
        label = new St.Label({ text: 'Item 1' });

        popupMenuExpander.menu.addMenuItem(subMenu);
        popupMenuExpander.menu.box.add(label);
        */

        // Add the elements to the menu
        this.menu.addMenuItem(killSwitchToggle);
        this.menu.addMenuItem(cyberSecToggle);
        this.menu.addMenuItem(obfuscateToggle);
        this.menu.addMenuItem(notifyToggle);
        this.menu.addMenuItem(autoConnectToggle);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(actionButtonContainer);
        // this.menu.addMenuItem(popupMenuExpander);
    },

    checkNordVpnInstalled: function () {
        out = GLib.spawn_command_line_sync("nordvpn --version")[1].toString();
        if (out.startsWith("NordVPN Version")) {
            return true;
        }
        else {
            return false;
        }
    },

    checkUserLoggedIn: function () {
        out = GLib.spawn_command_line_sync("/bin/bash -c \"echo '' | nordvpn login | grep -Po 'already logged'\"")[1].toString();
        if (out.startsWith("already logged")) {
            return true;
        }
        else {
            return false;
        }
    },

    changeStatus: function (newStatus) {
        // First set up panelBox (which contains the icon)
        this.actor.remove_child(panelBox);
        this.setPanelBox(newStatus);

        // The change the status of the actionButton
        this.setActionButton(newStatus);

    },

    setToggles: function () {
        let killSwitchStatus, cyberSecStatus, obfuscateStatus, notifyStatus, autoConnectStatus;
        var [_, out, _, _] = GLib.spawn_command_line_sync('nordvpn settings'); // Execute command
        settings = out.toString();

        killSwitchStatus = settings.split('\n')[2].split(': ')[1];
        cyberSecStatus = settings.split('\n')[3].split(': ')[1];
        obfuscateStatus = settings.split('\n')[4].split(': ')[1];
        notifyStatus = settings.split('\n')[5].split(': ')[1];
        autoConnectStatus = settings.split('\n')[6].split(': ')[1];

        switch (killSwitchStatus) {
            case "enabled":
                killSwitchToggle.setToggleState(true);
                break;
            case "disabled":
                killSwitchToggle.setToggleState(false);
                break;
        }

        switch (String(cyberSecStatus)) {
            case "enabled":
                cyberSecToggle.setToggleState(true);
                break;
            case "disabled":
                cyberSecToggle.setToggleState(false);
                break;
        }

        switch (String(obfuscateStatus)) {
            case "enabled":
                obfuscateToggle.setToggleState(true);
                break;
            case "disabled":
                obfuscateToggle.setToggleState(false);
                break;
        }

        switch (String(notifyStatus)) {
            case "enabled":
                notifyToggle.setToggleState(true);
                break;
            case "disabled":
                notifyToggle.setToggleState(false);
                break;
        }

        switch (String(autoConnectStatus)) {
            case "enabled":
                autoConnectToggle.setToggleState(true);
                break;
            case "disabled":
                autoConnectToggle.setToggleState(false);
                break;
        }
    },

    setToggleActions: function () {
        // killSwitchToggle, cyberSecToggle, obfuscateToggle, notifyToggle, autoConnectToggle;
        killSwitchToggle.connect('toggled', Lang.bind(this, function (Object, value) {
            if (value) {
                GLib.spawn_command_line_sync('nordvpn set killswitch true');
            }
            else {
                GLib.spawn_command_line_sync('nordvpn set killswitch false');
            }
        }));

        cyberSecToggle.connect('toggled', Lang.bind(this, function (Object, value) {
            if (value) {
                GLib.spawn_command_line_sync('nordvpn set cybersec true');
            }
            else {
                GLib.spawn_command_line_sync('nordvpn set cybersec false');
            }
        }));

        obfuscateToggle.connect('toggled', Lang.bind(this, function (Object, value) {
            if (value) {
                GLib.spawn_command_line_sync('nordvpn set obfuscate true');
            }
            else {
                GLib.spawn_command_line_sync('nordvpn set obfuscate false');
            }
        }));

        notifyToggle.connect('toggled', Lang.bind(this, function (Object, value) {
            if (value) {
                GLib.spawn_command_line_sync('nordvpn set notify true');
            }
            else {
                GLib.spawn_command_line_sync('nordvpn set notify false');
            }
        }));

        autoConnectToggle.connect('toggled', Lang.bind(this, function (Object, value) {
            if (value) {
                GLib.spawn_command_line_sync('nordvpn set autoconnect true');
            }
            else {
                GLib.spawn_command_line_sync('nordvpn set autoconnect false');
            }
        }));
    },

    setActionButton: function (status) {
        switch (status) {
            case "connected":
                actionButton.style_class = _('action-button-connected');
                actionButton.label = _("Disconnect");
                break;
            case "disconnected":
                actionButton.style_class = _('action-button-disconnected');
                actionButton.label = _("Quick Connect");
                break;
            case "connecting":
                actionButton.style_class = _('action-button-connecting');
                actionButton.label = _("Connecting..");
                break;
        }
    },

    setActionButtonOnClick: function () {     //TODO handle errors!!!
        // The functionality of the button will change depending on the current connecting status
        var [_, out, _, _] = GLib.spawn_command_line_sync('nordvpn status');
        var statusText = out.toString();

        if (statusText == "Status: Disconnected\n") {
            GLib.spawn_command_line_async('nordvpn c');
        }
        // Connected
        else if (statusText.startsWith("Status: Connected")) {
            GLib.spawn_command_line_async('nordvpn d');
        }
    },

    setPanelBox: function (status) {
        panelBox = new St.BoxLayout();

        switch (status) {
            case "connected":
                icon = new St.Icon({ style_class: 'connected-icon' });
                break;
            case "disconnected":
                icon = new St.Icon({ style_class: 'disconnected-icon' });
                break;
            case "connecting":
                icon = new St.Icon({ style_class: 'connecting-icon' });
                break;
            default:
                icon = new St.Icon({ style_class: 'idle-icon' });
        }

        panelBox.add(icon);
        panelBox.add(PopupMenu.arrowIcon(St.Side.BOTTOM)); // Add down-arrow icon

        this.actor.add_child(panelBox); // Add the box to the top panel
    },

    destroy: function () {
        this.parent();  // Call the paren destroy function

    }
});


function checkConnectionStatus() {
    var [_, out, _, _] = GLib.spawn_command_line_sync('nordvpn status'); // Execute the `nordvpn status` command
    var statusText = out.toString(); // The result of the executed command

    // Disconnected
    if (statusText == "Status: Disconnected\n") {
        nvpnStatusBtn.changeStatus("disconnected");
        return true;
    }

    // Connecting
    else if (statusText.startsWith("Status: Connecting")) {
        nvpnStatusBtn.changeStatus("connecting");
        return true;
    }

    // Connected
    else if (statusText.startsWith("Status: Connected")) {
        try {
            server = statusText.split('\n')[1].split(': ')[1].split('.')[0] //extract server name from string
        } catch (e) {
            logError(e, 'ExtensionError');
        }
        nvpnStatusBtn.changeStatus("connected");
        return true;
    }
}


function init() {
}


function enable() {
    nvpnStatusBtn = new NordVPNStatusButton;
    /**
     * Add the button to the status area
     * first argument is the role, must be unique. You can access it from the Looking Glass in 'Main.panel.statusArea.NordVPNStatusButton`
     * second argument is the position
     * finally where we want the button to be displayed in the box (left, right, center)
     */
    Main.panel.addToStatusArea('NordVPNStatusButton', nvpnStatusBtn, 0, 'right');
    timeout = MainLoop.timeout_add_seconds(1.0, checkConnectionStatus);

}


function disable() {
    // MainLoop.secure_remove(timeout);  
    nvpnStatusBtn.destroy();
}
