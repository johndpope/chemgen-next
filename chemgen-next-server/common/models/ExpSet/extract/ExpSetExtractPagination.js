"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
//@ts-ignore
var ExpSet = app.models.ExpSet;
/**
 * This only builds the most basic pagination
 * Each page is returned ot the interface as a batch, which is a single ExpScreenUploadWOrkflow
 * To do eithe of these things see ExpSet.extract.workflows.scoring
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildBasicPaginationData = function (data, search) {
    return new Promise(function (resolve, reject) {
        var or = app.models.ExpSet.extract.buildQuery(data, search);
        var orSearch = {};
        if (or) {
            orSearch.or = or;
        }
        data.currentPage = search.currentPage;
        data.skip = search.skip;
        data.pageSize = search.pageSize;
        data.totalPages = 1;
        resolve(data);
        // app.paginateModel('ExpScreenUploadWorkflow', orSearch, expSetSearch.pageSize)
        //   .then((pagination) => {
        //     data.currentPage = expSetSearch.currentPage;
        //     data.skip = expSetSearch.skip;
        //     data.pageSize = expSetSearch.pageSize;
        //     data.totalPages = pagination.totalPages;
        //     resolve(data);
        //   })
        //   .catch((error) => {
        //     app.winston.error(error);
        //     reject(new Error(error));
        //   });
    });
};
//# sourceMappingURL=ExpSetExtractPagination.js.map