#!/usr/bin/env bash


sleep 60
mongorestore --authenticationDatabase admin --host chemgen_next_mongodb --db chemgen -u root -p password /chemgen-next-dev-mongodb/chemgen-03-18-2019/ExpScreenUploadWorkflow.bson
mongorestore --authenticationDatabase admin --host chemgen_next_mongodb --db chemgen -u root -p password /chemgen-next-dev-mongodb/chemgen-03-18-2019/PlatePlan96.bson

