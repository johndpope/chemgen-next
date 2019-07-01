#!/usr/bin/env node
var barcode = 'RnaiI.1Q1S';
// let match = new RegExp('Rnai(\w{1}).(\d{+})(\w{2}).*');
var match = /Rnai(\w+).(\d+)(\w{2})/;
var matches = match.exec(barcode);
console.log(matches);
//# sourceMappingURL=scratch.js.map