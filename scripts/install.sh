set -e
# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo '/home/pi/bat-ui/dist/linux-armv7l-unpacked/booster-ui' > ~/.xinitrc
chmod +x ~/.xinitrc
