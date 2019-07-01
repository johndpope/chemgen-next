#!/usr/bin/env node

let barcode = 'RnaiI.1Q1S';

// let match = new RegExp('Rnai(\w{1}).(\d{+})(\w{2}).*');
let match = /Rnai(\w+).(\d+)(\w{2})/;
let matches = match.exec(barcode);

console.log(matches);
