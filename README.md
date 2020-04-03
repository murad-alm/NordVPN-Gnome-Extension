# NordVPNStatus
An extension for gnome-shell to show the status of NordVPN connecntion.

This is <b>NOT</b> an official extension. It's only purpose is to show the status of the NordVPN connection on the task bar all the time.
Please visit the <a href="https://nordvpn.com/tutorials/linux/">official NordVPN website</a> for official linux tutorials and support.

## Indicators

<p>
   When disconnected,  a red indicator will be displayed &emsp;&emsp;
  <img width="50" height="30"" src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/disconnected.svg">
</p>

<p>
  While connecting, an orange indicator will be displayed &emsp;
  <img width="50" height="30"src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/connecting.svg">
</p>
  
<p>
  When connected, the icon will be displayed in green &emsp; &emsp;
  <img width="50" height="30" src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/connected.svg">
</p>

## Coming soon
- Detailed information of the current connection on mouse-over.
- pop-up window (on click) which features:
  - The ability to connect and disconnect.
  - Change server
  - Toggle buttons for de-/ activating killswitch, cybersec, obfuscate, notifications and auto-connect
  - connection speed measurement

## Download
Please check the <a href= "https://github.com/murad-alm/NordVPNStatus/releases">releases</a> to download the latest version.

## Installation
Please follow the following steps after downloading the <a href= "https://github.com/murad-alm/NordVPNStatus/releases">.zip file</a>:

- Create a new directory into which you will unzip the content of the previously downloaded gnome extension. Make sure to set the directory name to <b>nordVpnStatus</b>:
```script
$ mkdir ~/.local/share/gnome-shell/extensions/nordVpnStatus
```

- Unzip the downloaded file:<br>
```script
$ unzip ~/Downloads/NordVPNStatus-VERSION_NUMBER.zip ~/.local/share/gnome-shell/extensions/nordVpnStatus
```
- Enable the newly installed extension: 
```script
$ gnome-extensions enable nordVpnStatus
```
- You may need to restart gnome-shell. Press <kbd>Alt</kbd> and <kbd>F2</kbd>, type `r` then <kbd>Enter</kbd>.
