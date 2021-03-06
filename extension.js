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

let nvpnStatusBtn, timeout, icon, panelBox, actionButton;
let killSwitchToggle, cyberSecToggle, obfuscateToggle, notifyToggle, autoConnectToggle;

/**
 * TODOs:
 * [x] check if nordVPN is installed
 * [ ] handle errors when executing a command
 * [x] check if user is logged in
 * [ ] handle login in UI
 * [x] don't display any options if nordvpn is not installed or if the user is not logged in.
 * [ ] one method to execute shell commands instead of calls all over the place..
 * [x] if connected display current connection info
 * [ ] actionButton: while trying to connect, wait before activating the button again (thread.wait)
 * [x] BUG!! DON'T activate the timeloop unless nordvpn is installed and user has logged in | O R | move the mainloop inside the NordVPNStatusButton class
 */


const NordVPNStatusButton = new Lang.Class({
    Name: 'StatusButton',      // Class name
    Extends: PanelMenu.Button,  // Parent class

    /**
     * Constructor will become an argument which indicates to the client's status as following:
     *      0 - client is ready (nordvpn is installed & user is already logged in).
     *      1 - nordvpn is not installed.
     *      2 - user hasn't logged in yet.
     */
    _init: function (clientStatus) {
        /*
         * Call the parent constructor
         * first argument is the menu alignment (1 is left, 0 right and 0.5 is centered)
         * second argument is the name
         * third argument: true to create a menu automatically, otherwise false
         */
        this.parent(1, 'StatusButton', false);
        this.setPanelBox("idle");                                                       // Set the box in the upper panel

        if (clientStatus == 1) {                                                        // If nordvpn is not installed on the system
            this.initNotFound();
        }
        else if (clientStatus == 2) {                                                   // If the user is not logged in
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

    /**
     * This function will be called if nordvpn is not installed on the system
     */
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
        container = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        container.actor.add(textBox, { expand: true, x_fill: true });
        this.menu.addMenuItem(container);
    },

    /**
     * This function will be called if the user hasn't logged in to his account
     */
    initNotLoggedIn: function () {
        // Initialize the message to display
        msg = 'You are not logged in to NordVPN!\n' +
            'Please log in using terminal and re-enable this extension.';
        label = new St.Label({ text: msg, x_align: St.Align.END });
        // textBox will hole the labe
        textBox = new St.BoxLayout();
        textBox.set_vertical(true);
        textBox.add_child(label);
        // Setup the container that holds the textBox and add it to the menu
        container = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        container.actor.add(textBox, { expand: true, x_fill: true });
        this.menu.addMenuItem(container);
    },

    initUI: function () {
        // Connection information
        connectionInfoLabel = new St.Label({ text: "initializing.." });
        textBox = new St.BoxLayout();
        textBox.set_vertical(true);
        textBox.add_child(connectionInfoLabel);
        container = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        container.actor.add(textBox, { expand: true, x_fill: true });
        let popupMenuExpander = new PopupMenu.PopupSubMenuMenuItem('Connection Information');
        popupMenuExpander.menu.addMenuItem(container);


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

        // Add the elements to the menu
        this.menu.addMenuItem(popupMenuExpander);
        this.menu.addMenuItem(killSwitchToggle);
        this.menu.addMenuItem(cyberSecToggle);
        this.menu.addMenuItem(obfuscateToggle);
        this.menu.addMenuItem(notifyToggle);
        this.menu.addMenuItem(autoConnectToggle);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addMenuItem(actionButtonContainer);
    },

    changeStatus: function (newStatus, statMessage) {
        // First set up panelBox (which contains the icon)
        this.actor.remove_child(panelBox);
        this.setPanelBox(newStatus);

        // The change the status of the actionButton
        this.setActionButton(newStatus);

        // Set the connection information
        this.setInfoMessage(newStatus, statMessage);
    },

    setInfoMessage: function (newStatus, statMessage) {
        if (newStatus == "connected") {
            out = statMessage.toString();

            // Extract the information from the status message
            server = out.split('\n')[1].split(': ')[1];
            country = out.split('\n')[2].split(': ')[1];
            city = out.split('\n')[3].split(': ')[1];
            ipAddr = out.split('\n')[4].split(': ')[1];
            tech = out.split('\n')[5].split(': ')[1];
            protocol = out.split('\n')[6].split(': ')[1];
            transfer_rec = out.split('\n')[7].split(': ')[1].split('received')[0];
            transfer_snd = out.split('\n')[7].split(': ')[1].split(', ')[1].split('sent')[0];

            // Construct the info message
            infoMessage = "Connected to:         " + country + ", " + city + "\n";
            infoMessage += "Server:                         " + server + "\n";
            infoMessage += "IP Address:               " + ipAddr + "\n";
            infoMessage += "Technology:              " + tech + "\n";
            infoMessage += "Protocol:                    " + protocol + "\n";
            infoMessage += "Transfer:                    \u2193" + transfer_rec + ", \u2191" + transfer_snd;

            connectionInfoLabel.set_text(infoMessage);
        }
        else {
            connectionInfoLabel.set_text("Your are not connected to NordVPN!");
        }
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
            case "idle":
                icon = new St.Icon({ style_class: 'idle-icon' });
        }

        panelBox.add(icon);
        panelBox.add(PopupMenu.arrowIcon(St.Side.BOTTOM)); // Add down-arrow icon

        this.actor.add_child(panelBox); // Add the box to the top panel
    },

    destroy: function () {
        this.parent();  // Call the parent destroy function
    }
});


function checkConnectionStatus() {
    var [_, out, _, _] = GLib.spawn_command_line_sync('nordvpn status'); // Execute the `nordvpn status` command
    var statusText = out.toString(); // The result of the executed command

    // Disconnected
    if (statusText == "Status: Disconnected\n") {
        nvpnStatusBtn.changeStatus("disconnected", out);
        return true;
    }

    // Connecting
    else if (statusText.startsWith("Status: Connecting")) {
        nvpnStatusBtn.changeStatus("connecting", out);
        return true;
    }

    // Connected
    else if (statusText.startsWith("Status: Connected")) {
        try {
            server = statusText.split('\n')[1].split(': ')[1].split('.')[0] //extract server name from string
        } catch (e) {
            logError(e, 'ExtensionError');
        }
        nvpnStatusBtn.changeStatus("connected", out);
        return true;
    }
}

function checkNordVpnInstalled() {
    out = GLib.spawn_command_line_sync("nordvpn --version")[1].toString();
    if (out.startsWith("NordVPN Version")) {
        return true;
    }
    else {
        return false;
    }
}

function checkUserLoggedIn() {
    out = GLib.spawn_command_line_sync("/bin/bash -c \"echo '' | nordvpn login | grep -Po 'already logged'\"")[1].toString();
    if (out.startsWith("already logged")) {
        return true;
    }
    else {
        return false;
    }
}


function init() {
    // nvpnStatusBtn = new NordVPNStatusButton;
}


function enable() {
    if (!checkNordVpnInstalled()) {
        nvpnStatusBtn = new NordVPNStatusButton(1);
    }
    else if (!checkUserLoggedIn()) {
        nvpnStatusBtn = new NordVPNStatusButton(2);
    }
    else if (checkNordVpnInstalled() && checkUserLoggedIn()){
        nvpnStatusBtn = new NordVPNStatusButton(0);    
        timeout = MainLoop.timeout_add_seconds(1.0, checkConnectionStatus);
    }
    /** 
     * Add the button to the status area
     * first argument is the role, must be unique. You can access it from the Looking Glass in 'Main.panel.statusArea.NordVPNStatusButton`
     * second argument is the position
     * finally where we want the button to be displayed in the box (left, right, center)
     */
    Main.panel.addToStatusArea('NordVPNStatusButton', nvpnStatusBtn, 0, 'right');
}


function disable() {
    nvpnStatusBtn.destroy();
}
