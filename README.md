## Server Side Code
Server side code is written in Node.js using Loopback.

## Client Side Code and Interfaces

Client Side code is written using Angular6, and is then ported over to a wordpress app for deployment.


## Bringing up the docker sev servers

If you have not already completed the one time startup instructions to install node and some global packages you will need to complete that first.

Included is a set of docker compose configurations to bring up all services using docker.
There is no data persistance and this is meant for DEV USE ONLY.

Running  `./run_chemgen_server.sh` will bring up the docker compose instance.

#### Quick Start - Bring up the node server

To start the loopback server

```
cd chemgen-next-server
## Run in the foreground
# if Error: Cannot find module 'loopback'
# `run npm install` in this directory
nodemon server/server.js
## Run in the background
## See the one time setup to install pm2
pm2 start server/server.js --name chemgen-next-server --watch -i 1
pm2 start jobs/defineQueues.js --name chemgen-next-define-queues --watch -i 1
node jobs/processScreens.js --limit 2 --site AD --search-pattern CHEM
#ctrl+c to kill or run with --exit
node jobs/processScreens.js --limit 2 --site AD --search-pattern AHR 
#ctrl+c to kill or run with --exit
```

To start the angular dev server

```
cd chemgen-next-client
npm install
# bind wasn't found
# ng serve --host=0.0.0.0 instead
ng serve --bind 0.0.0.0
```

And open `localhost:4200` in a browser. This will show you the angular interface.

### Detailed - Bring up the server side dev environment

The dev servers do not have any experimental data, only the configurations. In order to load experimental data you will need to process 1 or more screens. take a look at the jobs/processQueues.js script to see some options for searching for workflow configurations.

```
source chemgen_docker_vars.sh
cd chemgen-next-server
## See the one time setup to install pm2
pm2 start server/server.js --name chemgen-next-server --watch -i 1
pm2 start jobs/defineQueues.js --name chemgen-next-define-queues --watch -i 1
node jobs/processScreens.js --limit 2 --site AD --search-pattern CHEM
node jobs/processScreens.js --limit 2 --site AD --search-pattern AHR 
#ctrl+c to escape either of these
```

You should some info messages print to the screen: 

```
info: Starting workflowQueue Wed Oct 03 2018 09:28:49 GMT+0300 (+03)
info: ExpScreenUploadWorkflow.doWork CHEM Primary 6 2014-12-04
```

If you don't see these messages your queue is probably stuck, or something went wrong with the docker startup.

```
pm2 restart chemgen-next-define-queues
pm2 logs chemgen-next-define-queues
```

Check the server and the job queue logs with -  

```
pm2 logs chemgen-next-server
pm2 logs chemgen-next-define-queues
```


If you want to ensure you have a clean startup 

```
docker-compose stop
docker-compose rm -f -v
./run_chemgen_server.sh
```

If for some reason you want to empty the wordpress database and startup info:

```
docker volume rm chemgen-next-web-docker_wordpress_db_data
```

### Important Environmental Variables

Make sure to set the site as appropriate, NY, AD, or DEV. The default is dev.

### Deploy the angular app to the wordpress theme

The angular dev server is only used in development. For production it is deployed to a wordpress site.

In order to build the latest client side code and add it to the wordpress app

```
# May have to run:
# npm install --save-dev @angular-devkit/build-angular
# npm audit fix
source chemgen_docker_vars.sh
cd chemgen-next-client
ng build --prod  --output-hashing none --output-path ../chemgen-next-wptheme/js/ng
```

### Important API EndPoints

#### Get Exp Sets (Regardless of scored/not status)

(For now you can only search for RNAis. Chemicals are coming soon!)

```
http://localhost:3000/api/ExpSets/getExpSets?search={"pageSize": 20, "rnaisList": ["vab-10"]}
```

#### Unscored ExpSets

This is the most optimized query - if you are not searching across the entire database for a gene or chemical list use this
```
http://localhost:3000/api/ExpSets/getUnscoredExpSetsByPlate?search={"pageSize" : 1 }
```

This is another endpoint that is less optimized, but allows for search across the entire database for rnais/chemicals 

```
http://localhost:3000/api/ExpSets/getUnscoredExpSets?search={"pageSize" : 1 }
```

### Get Exp Sets that have a FIRST_PASS=1 Score
```
http://localhost:3000/api/ExpSets/getUnScoredExpSetsByFirstPass?search={"pageSize": 20, "scoresExist": true}
```

### One time startup instructions


I am having trouble getting these working as docker containers, so for now you have to do it the hard way. First ensure you have node.js>=9.

```
npm install -g pm2 @angular/cli nodemon karma mocha
source chemgen_docker_vars.sh
cd chemgen-next-server
npm install
cd ../chemgen-next-client
npm install
```


#### Wordpress

If it is your first time running this you will need to visit localhost:8000 in order to do the initial wordpress install (for now).

Once it is installed you will also need to create a page for the angular app to live on.

In the wordpress console go to 'Create New Page', and create a page called 'App' with the permalink 'app' and from the Template 'ChemGenAngularApp' 

### Analysis Modules

#### Tensorflow Counts

The docker configuration in chemgen-next-analysis-docker requires some data files that are too big for github and will need to be hosted somewhere. You can get the most recent version on the cloud with `        docker pull quay.io/nyuad_cgsb/tf_14_faster_rcnn_inception_resnet_v2_atrous_coco_tf_counts:latest`

#### Devstar Counts

The configuration is all here, but since devstar is a private github repo you will need to go and download the repo as a zip and put it in the chemgen-next-analysis-docker/counts/devstar folder.

## CI Services

Tests are run using travis. Please open a PR to contribute code.

CI Builds are available at: https://travis-ci.org/chemgen-ny-ad/chemgen-next
