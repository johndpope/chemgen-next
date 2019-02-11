#!/usr/bin/env bash

set -x -e

############################################################################################################
# Build the production angular frontend for each of the NY/AD wordpress themes
# Since they sit on different databases each is served from a different port, and possibly in the future different IP addresses
# See chemgen-next-client/src/environments/environment.ad.ts and chemgen-next-client/src/environments/environment.ny.ts
# For information on the IP addresses
# Server side code (loopback API) is managed by pm2, and is set to restart on changes
############################################################################################################
# I always work from the AD theme. There are only 2 separate themes so I can build the angular scripts properly
cp -rf chemgen-next-wptheme-ad chemgen-next-wptheme-ny

cd chemgen-next-client
ng build --prod  --output-hashing none --configuration=ny  --output-path ../chemgen-next-wptheme-ny/js/ng
ng build --prod  --output-hashing none --configuration=ad  --output-path ../chemgen-next-wptheme-ad/js/ng

############################################################################################################
# Rsync to onyx
############################################################################################################
cd ../..
rsync -avz -e 'ssh -p 4410' chemgen-next-all "jdr400@10.230.9.227:/home/jdr400/DEPLOY" | echo 'rsync is weird'

############################################################################################################
# Copy the WP themes to their sites, and ensure everything is owned by the apache user
############################################################################################################
ssh -p 4410 jdr400@onyx.abudhabi.nyu.edu "cd /home/jdr400/DEPLOY/chemgen-next-all; sudo cp -rf chemgen-next-wptheme-ad/* /var/www/html/chemgen-next/wp-content/themes/chemgen-next-wptheme/"
ssh -p 4410 jdr400@onyx.abudhabi.nyu.edu "cd /home/jdr400/DEPLOY/chemgen-next-all; sudo cp -rf chemgen-next-wptheme-ny/* /var/www/html/chemgen-next-ny/wp-content/themes/chemgen-next-wptheme-ny/"
ssh -p 4410 jdr400@onyx.abudhabi.nyu.edu "sudo chown -R www-data:www-data /var/www/html"
