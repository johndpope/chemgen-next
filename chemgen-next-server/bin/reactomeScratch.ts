#!/usr/bin/env node
import axios = require('axios');
import {filter} from 'lodash';

// https://reactome.org/ContentService/search/query?query=wbgene00000527&cluster=true

//@ts-ignore
axios.get('https://reactome.org/ContentService/search/query', {params: {query: 'wbgene00000527', cluster: true}})
  .then((results) => {
    console.log('got results');
    let proteins = filter(results.data.results, {typeName: 'Protein'});
    return proteins;
  })
  .catch((error) => {
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
