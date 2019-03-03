#!/usr/bin/env bash

export NODE_ENV='dev'
export SITE='DEV'

export HOST="localhost"
export IMAGE_URL="http://10.230.9.227/microscope"

### ArrayScan MSSQL DB
#export ARRAYSCAN_CONNECTOR="mysql"
#export ARRAYSCAN_DB="arrayscan"
#export ARRAYSCAN_USER="root"
#export ARRAYSCAN_PASS="password"
#export ARRAYSCAN_HOST="${HOST}"
#export ARRAYSCAN_PORT="3307"

### ChemgenDB Mysql - Main Experimental DB
export CHEMGEN_CONNECTOR="mysql"
export CHEMGEN_DB="chemgen-next-dev"
export CHEMGEN_USER="root"
export CHEMGEN_PASS="password"
export CHEMGEN_HOST="${HOST}"
export CHEMGEN_PORT="3308"

## Wordpress DB Mysql
export WP_CONNECTOR="mysql"
export WP_HOST="${HOST}"
export WP_SITE="http://${HOST}"
export WP_DB="wordpress"
export WP_USER="wordpress"
export WP_PASS="password"
export WP_PORT="3309"

export MONGO_CONNECTOR="mongodb"
export MONGO_HOST="localhost"
export MONGO_URL="mongodb://root:password@localhost:27017/chemgen?authSource=admin"
export MONGO_DB="chemgen"
export MONGO_USER="root"
export MONGO_PASS="password"

## Redis Caching
export REDIS_HOST="${HOST}"
export REDIS_PORT=6380
export REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"
