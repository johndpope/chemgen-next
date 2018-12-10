#!/usr/bin/env node

'use strict';

import app = require('../server/server');
const Promise = require('bluebird');


//Search By WormStrain
app.models.ExpScreenUploadWorkflow
  .find({where: })


