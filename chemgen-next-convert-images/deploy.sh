#!/usr/bin/env bash

############################################################################################################
# Rsync to pyrite
############################################################################################################
cd ..
rsync -avz -e 'ssh -p 4410' chemgen-next-convert-images "jdr400@pyrite.abudhabi.nyu.edu:/home/jdr400/DEPLOY" | echo 'rsync is weird'

############################################################################################################
# Ensure the docker daemon is running
# Build and start the server
############################################################################################################
ssh -p 4410 jdr400@pyrite.abudhabi.nyu.edu "cd /home/jdr400/DEPLOY/chemgen-next-convert-images && ./run.sh"
