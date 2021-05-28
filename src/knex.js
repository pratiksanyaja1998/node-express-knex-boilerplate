var environment = process.env.NODE_ENV || 'development'
var config = require('../knexfile.js')[environment]

module.exports = require('knex')(config)

// module.exports = require('knex')({
//     client: 'pg',
//     version: '12.4',
//     connection: {
//       host : '',
//       user : '',
//       password : '',
//       database : 'dev'
//     }
//   });