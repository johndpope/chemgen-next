import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import assert = require('assert');
import app = require('../../../../../server/server');
import Promise = require('bluebird');
import {isEqual, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../../types/sdk";

if(! isEqual(process.env.NODE_ENV, 'dev')){
  process.exit(0);
}
describe('ExpSetExtractByPlate', function () {
  it('Should run the function and get expGroups by same plate', function (done) {
    this.timeout(10000);
    app.models.ExpScreenUploadWorkflow.findOne({where: {name: 'CHEM Primary 140 2015-02-26'}})
      .then((workflowData: ExpScreenUploadWorkflowResultSet) => {
        return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
          .then(() => {
            let search = new ExpSetSearch({expWorkflowSearch: [String(workflowData.id)]});
            return app.models.ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search);
          })
      })
      .then((data: ExpSetSearchResults) => {
        let ctrlNullPlateIds = uniq(data.expGroupTypeAlbums.ctrlNull.map((ctrlNullAlbum: any) => {
          return ctrlNullAlbum.plateId;
        }));
        let ctrlStrainPlateIds = uniq(data.expGroupTypeAlbums.ctrlStrain.map((ctrlStrainAlbum: any) => {
          return ctrlStrainAlbum.plateId;
        }));
        let treatReagentPlateIds = uniq(data.expGroupTypeAlbums.treatReagent.map((treatReagentAlbum: any) => {
          return treatReagentAlbum.plateId;
        }));
        let ctrlReagentPlateIds = uniq(data.expGroupTypeAlbums.ctrlReagent.map((ctrlReagentAlbum: any) => {
          return ctrlReagentAlbum.plateId;
        }));
        assert.ok(data);
        assert.deepEqual(ctrlNullPlateIds, ctrlReagentPlateIds);
        assert.deepEqual(ctrlStrainPlateIds, treatReagentPlateIds);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
  it('Should run the function and not get expGroups by same plate', function (done) {
    //TODO This is ridiculous
    this.timeout(30000);
    app.models.ExpScreenUploadWorkflow.findOne({where: {and: [{name: 'AHR2 2016-04-19 mel-28 N2 Chr III Plate 3 Q Q4'}, {screenStage: 'primary'}]}})
      .then((workflowData: ExpScreenUploadWorkflowResultSet) => {
        return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(workflowData)
          .then(() => {
            let search = new ExpSetSearch({expWorkflowSearch: [String(workflowData.id)]});
            return app.models.ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search);
          })
      })
      .then((data: ExpSetSearchResults) => {
        let ctrlNullPlateIds = uniq(data.expGroupTypeAlbums.ctrlNull.map((ctrlNullAlbum: any) => {
          return ctrlNullAlbum.plateId;
        }));
        let ctrlStrainPlateIds = uniq(data.expGroupTypeAlbums.ctrlStrain.map((ctrlStrainAlbum: any) => {
          return ctrlStrainAlbum.plateId;
        }));
        let treatReagentPlateIds = uniq(data.expGroupTypeAlbums.treatReagent.map((treatReagentAlbum: any) => {
          return treatReagentAlbum.plateId;
        }));
        let ctrlReagentPlateIds = uniq(data.expGroupTypeAlbums.ctrlReagent.map((ctrlReagentAlbum: any) => {
          return ctrlReagentAlbum.plateId;
        }));
        assert.ok(data);
        assert.ok(has(data.expGroupTypeAlbums, 'ctrlStrain'));
        assert.ok(has(data.expGroupTypeAlbums, 'ctrlNull'));
        assert.notDeepEqual(ctrlNullPlateIds, ctrlReagentPlateIds);
        assert.notDeepEqual(ctrlStrainPlateIds, treatReagentPlateIds);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
});
