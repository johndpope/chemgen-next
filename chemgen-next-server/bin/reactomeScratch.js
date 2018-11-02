#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require("axios");
var lodash_1 = require("lodash");
// https://reactome.org/ContentService/search/query?query=wbgene00000527&cluster=true
//@ts-ignore
axios.get('https://reactome.org/ContentService/search/query', { params: { query: 'wbgene00000527', cluster: true } })
    .then(function (results) {
    console.log('got results');
    var proteins = lodash_1.filter(results.data.results, { typeName: 'Protein' });
    return proteins;
})
    .catch(function (error) {
    console.log(error);
});
//@ts-ignore
// axios.get('https://reactome.org/ContentService/search/query', {query: 'wbgene00000527', cluster: true})
//   .then((results) => {
//     console.log('got results');
//   })
//   .catch((error) => {
//     console.log(error);
//   });
//# sourceMappingURL=reactomeScratch.js.map