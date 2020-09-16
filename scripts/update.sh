#!/bin/bash

set -e

cd /home/pi/booster-ui
git pull
npm i
npm run build
reboot
