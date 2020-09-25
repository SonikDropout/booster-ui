#!/bin/bash

set -e

cd /home/pi/booster-ui
git pull
npm run build
reboot
