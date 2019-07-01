## Server Side Code

Server side code is written in Node.js using Loopback.

## Client Side Code and Interfaces

Client Side code is written using Angular6, and is then ported over to a wordpress app for deployment.

If you are simply developing, you do not need to deal with the wordpress. 
As a part of the deploy process it bundles the javascript and puts it in the appropriate location.


## Bringing up the docker sev servers

If you have not already completed the one time startup instructions to install node and some global packages you will need to complete that first.

Included is a set of docker compose configurations to bring up all services using docker.
There is no data persistance and this is meant for DEV USE ONLY.

Running  `docker-compose up -d` will bring up the docker compose instance.

If you haven't run this in awhile, you probably will need to rebuild to ensure you have the newest data.

```docker-compose stop; docker-compose rm -f -v ; docker-compose build; docker-compose up -d```

#### Quick Start - Access the node server

The loopback REST API can be accessed through localhost:3000. If you are building this for the first time, it will take a few minutes.

Check on the status with:   `docker-compose logs --tail 10 chemgen_next_server`

If you see any stack traces having to do with mysql, it may be that your database is still populating.

Check on the mysql instance with `docker-compose logs --tail 50 chemgen_next_dev_mysql_db`

```
chemgen_next_dev_mysql_db_1             |
chemgen_next_dev_mysql_db_1             | /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/chemgen-next-exp-ad-03-18-2019.sql.gz
chemgen_next_dev_mysql_db_1             | mysql: [Warning] Using a password on the command line interface can be insecure.
```

You can access the angular dev server at `localhost:4200`, but the services WILL NOT load properly until the database is loaded.


If you want to ensure you have a clean startup 

```
docker-compose stop
docker-compose rm -f 
docker-compose build
docker-compose up -d
```

If for some reason you want to empty the wordpress database and startup info:
If you clobbered something and REALLY need to rebuild from scratch, run the same sequence as above, but remove volumes.

```
docker-compose stop
docker-compose rm -f -v
docker-compose build
docker-compose up -d
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


You only need to do this if for some reason you don't have an IDE that can debug in a docker container.

```
npm install -g pm2 @angular/cli nodemon karma mocha
source chemgen_docker_vars.sh
cd chemgen-next-server
npm install
cd ../chemgen-next-client
npm install
```


#### Wordpress

This is only used for dev/bundling purposes, and so that the team can have a wiki page. For the most part it is simply the Angular App bundled into a web page, and is used for authentication.

### Analysis Modules

#### Tensorflow Counts

The docker configuration in chemgen-next-analysis-docker requires some data files that are too big for github and will need to be hosted somewhere. You can get the most recent version on the cloud with `        docker pull quay.io/nyuad_cgsb/tf_14_faster_rcnn_inception_resnet_v2_atrous_coco_tf_counts:latest`

#### Devstar Counts

The configuration is all here, but since devstar is a private github repo you will need to go and download the repo as a zip and put it in the chemgen-next-analysis-docker/counts/devstar folder.

## CI Services

Tests are run using travis. Please open a PR to contribute code.

CI Builds are available at: https://travis-ci.org/chemgen-ny-ad/chemgen-next
