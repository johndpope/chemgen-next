"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var IdResults = /** @class */ (function () {
    function IdResults(expWorkflowIds, expSetIds) {
        this.expSetIds = expSetIds;
        this.expWorkflowIds = expWorkflowIds;
    }
    /**
     * This is a poor mans join across tables that can't be joined
     * Instead of doing joins, just run the queries separately
     * Then see which are common between all, and return the results
     * @param results
     */
    IdResults.prototype.getCommonResults = function (results) {
        results = lodash_1.compact(results);
        return lodash_1.intersection.apply(null, results);
    };
    return IdResults;
}());
exports.IdResults = IdResults;
var ScreenMetaDataCriteria = /** @class */ (function () {
    function ScreenMetaDataCriteria(data) {
        Object.assign(this, data);
    }
    return ScreenMetaDataCriteria;
}());
exports.ScreenMetaDataCriteria = ScreenMetaDataCriteria;
var ScreenCriteria = /** @class */ (function () {
    function ScreenCriteria() {
    }
    return ScreenCriteria;
}());
exports.ScreenCriteria = ScreenCriteria;
var ReagentDataCriteria = /** @class */ (function () {
    function ReagentDataCriteria(data) {
        Object.assign(this, data);
    }
    return ReagentDataCriteria;
}());
exports.ReagentDataCriteria = ReagentDataCriteria;
//# sourceMappingURL=search.js.map