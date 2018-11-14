'use strict';

module.exports = function(ReactomeGraph) {
  ReactomeGraph.extract = {}
  ReactomeGraph.extract.workflows = {}

  ReactomeGraph.on('attached', function () {
    require('../extract/ReactomeGraph')
  })

};
