FROM mongo:latest

CMD mkdir -p /chemgen-next-dev-mongodb/
#COPY ExpScreenUploadWorkflow.json /chemgen-next-dev-mongodb/ExpScreenUploadWorkflow.json
#COPY PlatePlan96.json /chemgen-next-dev-mongodb/PlatePlan96.json
COPY populate_mongodb.sh /chemgen-next-dev-mongodb/populate_mongodb.sh
COPY chemgen-03-18-2019 /chemgen-next-dev-mongodb/

#CMD  /chemgen-next-dev-mongodb/clear_mongodb.js; \
CMD  /chemgen-next-dev-mongodb/populate_mongodb.sh
