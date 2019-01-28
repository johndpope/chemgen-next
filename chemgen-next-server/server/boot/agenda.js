'use strict'

module.exports = function (app, cb) {
  // if (process.env.AGENDA) {
  //   startAgenda()
  // } else {
  // }
  //
  // function startAgenda () {
  //   app.agenda = require('../../agenda/agenda')
  //   app.agenda.on('ready', function () {
  //     console.log('Agenda cluster ready!')
  //     //TODO set this up as a separate worker script
  //     app.agenda.processEvery('2 seconds')
  //     app.agenda.maxConcurrency(10)
  //     app.agenda.defaultConcurrency(20)
  //     app.agenda.start()
  //     //This just ensures the agenda cluster started
  //     app.agenda.now('testJob', {'hello': 'world'})
  //   })
  // }
  app.jobQueues = require('../../jobs/defineQueues');

  process.nextTick(cb) // Remove if you pass `cb` to an async function yourself
}
