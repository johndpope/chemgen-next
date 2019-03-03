#!/usr/bin/env bash

set -x -e

#docker-compose build
#docker-compose up -d
### Deploy to QUAY.io
#DOCKER_COMPOSE_PREFIX=$(basename $(pwd))
#
#### Tag the docker images
#docker tag ${DOCKER_COMPOSE_PREFIX}_airflow_sequencer_automation quay.io/nyuad_cgsb/airflow-chemgen:latest
#docker tag ${DOCKER_COMPOSE_PREFIX}_cellprofiler quay.io/nyuad_cgsb/cellprofiler:latest
#docker tag ${DOCKER_COMPOSE_PREFIX}_cellprofiler quay.io/nyuad_cgsb/cellprofiler:v3.1.8
#
## Docker login
#echo ${QUAY_API_TOKEN} | docker login quay.io -u jerowe  --password-stdin
#
## Push to quay
#docker push quay.io/nyuad_cgsb/airflow-chemgen:latest
#docker push quay.io/nyuad_cgsb/cellprofiler:latest
#docker push quay.io/nyuad_cgsb/cellprofiler:v3.1.8
#docker-compose stop

############################################################################################################
# Rsync to pyrite
############################################################################################################
cd ..
rsync -avz -e 'ssh -p 4410' chemgen-next-convert-images "jdr400@pyrite.abudhabi.nyu.edu:/home/jdr400/DEPLOY" | echo 'rsync is weird'

############################################################################################################
# Ensure the docker daemon is running
# Build and start the server
############################################################################################################
#ssh -p 4410 jdr400@pyrite.abudhabi.nyu.edu "cd /home/jdr400/DEPLOY/chemgen-next-convert-images && ./run.sh"
