# NordVPNStatus
An extension for gnome-shell to show the status of NordVPN connecntion. <br>

<!--img align ="center" width="300" height="330" src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/screenshots/Screenshot.png"><br-->
![github](https://github.com/murad-alm/NordVPNStatus/blob/master/assets/screenshots/capture.gif)


<h6>Indicators:</h6>
<ul>
   <li>
      <p>
         When disconnected,  a red indicator will be displayed &emsp;&emsp;
        <img width="50" height="30"" src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/disconnected.svg">
      </p>
  </li>
                                                                                                                      
  <li>
      <p>
         While connecting, an orange indicator will be displayed &emsp;
        <img width="50" height="30"src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/connecting.svg">
      </p>
  </li>
  <li>
      <p>
         When connected, the icon will be displayed in green &emsp; &emsp;
        <img width="50" height="30" src="https://github.com/murad-alm/NordVPNStatus/blob/master/assets/connected.svg">
      </p>
   </li>
</ul>

## Disclaimer
###### Nothing official

This extension has been made **without any endorsement or support from NordVPN.**
The developer has no ties nor affiliation whatsoever with NordVPN, its
services, nor its software.
Naturally, this extension is free and isn't, shouldn't and will **not be
subject to any form of profit or compensation**.


###### Release and use

This extension was made for personal needs and use. The code is release on the
off chance it might be of use to someone but without the intention of providing
any form of utility software or service in a rigorous manner.
Therefore, **no support** is endorsed by the developer, meaning that **any
comment, feedback, or request regarding this code should be expected to be completely
ignored by the developer**.
Additionally, the responsibility of any undesired effect the execution of this
code might have on any system lies solely in the hands of the user.
Please visit the <a href="https://nordvpn.com/tutorials/linux/">**official NordVPN website**</a> for official linux tutorials and support.

## Coming soon
- [x] Detailed information about the current connection.
- [ ] Choose server (country & city)
- [x] Toggle buttons for de-/ activating killswitch, cybersec, obfuscate, notifications and auto-connect.
- [ ] Handle login within the UI.
- [ ] installation script.

## Download
Please check the <a href= "https://github.com/murad-alm/NordVPNStatus/releases">releases</a> to download the latest version.

## Installation
First download and install NordVPN for linux from the <a href="https://nordvpn.com/download/linux/">official website</a>, then follow the following steps after downloading the <a href= "https://github.com/murad-alm/NordVPNStatus/releases">.zip file</a>:

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

