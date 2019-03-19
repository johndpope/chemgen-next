#!/usr/bin/env bash

#mongoimport  \
#    --host=chemgen_next_mongodb \
#    --username root \
#    --password password \
#    --authenticationDatabase admin \
#    --db chemgen \
#    --file /chemgen-next-dev-mongodb/ExpScreenUploadWorkflow.json || echo "could not import"
#
#mongoimport  \
#    --host=chemgen_next_mongodb \
#    --username root \
#    --password password \
#    --authenticationDatabase admin \
#    --db chemgen \
#    --file  /chemgen-next-dev-mongodb/PlatePlan96.json || echo "could not import"

mongoimport  \
    --host=chemgen_next_mongodb \
    --username root \
    --password password \
    --authenticationDatabase admin \
    --db chemgen \
    --file /chemgen-next-dev-mongodb/ExpScreenUploadWorkflow.json || echo "could not import"

mongoimport  \
    --host=chemgen_next_mongodb \
    --username root \
    --password password \
    --authenticationDatabase admin \
    --db chemgen \
    --file  /chemgen-next-dev-mongodb/PlatePlan96.json || echo "could not import"
