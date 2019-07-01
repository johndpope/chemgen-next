#!/usr/bin/env bash

set -x -e

cd /home/jdr400/DEPLOY/chemgen-next-all
source chemgen-vars/run_chemgen_server_new_blade-AD.sh 
cd chemgen-next-server
node jobs/mirror-mssql-arrayscan-to-mysql.js
