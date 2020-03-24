passwd --delete pi

# INSTALL REQUIRED PACKAGES
apt install npm libudev-dev chromium-browser xorg

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo 'su -s /bin/bash -c startx pi&' > /etc/rc.local
echo 'exit 0' > /etc/rc.local
echo 'allowed_users=anybody' >> /etc/X11/Xwrapper.config
echo '/opt/hydrogen-enrgy/HydrogenEnergy' > ~/.xinitrc
chmod +x ~/.xinitrc


# BOOT SPEED OPTIMIZATIONS
cat <<EOT >> /boot/config.txt
enable_uart=1

# Disable the rainbow splash screen
disable_splash=1

# Disable bluetooth
dtoverlay=pi3-disable-bt

#Disable Wifi
dtoverlay=pi3-disable-wifi
 
# Overclock the SD Card from 50 to 100MHz
# This can only be done with at least a UHS Class 1 card
dtoverlay=sdtweak,overclock_50=100
 
# Set the bootloader delay to 0 seconds. The default is 1s if not specified.
boot_delay=0

# Overclock the raspberry pi. This voids its warranty. Make sure you have a good power supply.
force_turbo=1
EOT

echo "quiet" >> /boot/cmdline.txt

systemctl disable dhcpcd.service
systemctl disable networking.service
systemctl disable ssh.service
systemctl disable ntp.service
systemctl disable dphys-swapfile.service
systemctl disable keyboard-setup.service
systemctl disable apt-daily.service
systemctl disable wifi-country.service
systemctl disable hciuart.service
systemctl disable raspi-config.service
systemctl disable avahi-daemon.service
systemctl disable triggerhappy.service

apt-get purge --remove plymouth
