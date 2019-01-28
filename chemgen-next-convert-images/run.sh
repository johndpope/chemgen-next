#!/usr/bin/env bash

sudo su -c "/usr/local/bin/docker-compose stop"
sudo su -c "/usr/local/bin/docker-compose up --build -d"