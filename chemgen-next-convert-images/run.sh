#!/usr/bin/env bash

set -x -e

sudo su -c "/usr/local/bin/docker-compose stop"
sudo su -c "/usr/local/bin/docker-compose up --build -d"
## Since switching to postgres there is some manner of weird bug
## Where the first time around it doesn't fill in the schema in the exact order it needs to be in
## But with a restart its fine
sudo su -c "/usr/local/bin/docker-compose restart"
sudo su -c "/usr/local/bin/docker-compose restart"
