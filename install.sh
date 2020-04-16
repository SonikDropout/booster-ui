# INSTALL REQUIRED PACKAGES
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash
sudo apt-get install -y nodejs

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
mkdir -p  ~/.config/autostart
sudo mkdir -p /usr/share/booster-ui
sudo cp -rf ./dist/linux-armv7l-unpacked/** /usr/share/booster-ui/
cat <<EOT > ~/.config/autostart/booster.desktop
[Desktop Entry] 

Type=Application

Exec=/usr/share/booster-ui/booster-ui
EOT

reboot
