'use strict'

// The dev datasource uses the docker compose instance to bootstrap the mysql and mongodb data with librarydata
// There is NO experimental data in there unless you put it!


module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  arrayscanDS: {
    name: 'arrayscanDS',
    // connector: 'memory',
    connector: 'mysql',
    port: 3307,
    host: 'localhost',
    // host: 'arrayscan_mysql_db',
    database: 'arrayscan',
    user: 'arrayscan',
    password: 'password',
  },
  chemgenDS: {
    name: 'chemgenDS',
    // connector: 'memory',
    connector: 'mysql',
    host: 'localhost',
    // host: 'chemgen_next_dev_mysql_db',
    port: 3308,
    database: 'chemgen-next-dev',
    user: 'chemgen',
    password: 'password',
  },
  wordpressDS: {
    name: 'wordpressDS',
    // connector: 'memory',
    connector: 'mysql',
    host: 'localhost',
    // host: 'wordpress_db',
    port: 3309,
    database: 'wordpress',
    password: 'password',
    user: 'wordpress'
  },
  mongoDB: {
    name: 'mongoDB',
    // connector: 'memory',
    connector: 'mongodb',
    port: 27017,
    // host: 'localhost',
    // url: 'mongodb://root:password@localhost/chemgen',
    //mongodb on docker needs the authdb
    // url: 'mongodb://root:password@chemgen_next_mongodb:27017/chemgen?authSource=admin',
    url: 'mongodb://root:password@localhost:27017/chemgen?authSource=admin',
    // database: 'chemgen',
    // user: 'root',
    // password: 'password',
  },
  reactomeDS: {
    name: 'reactomeDS',
    connector: 'mongodb',
    port: 27017,
    url: 'mongodb://root:password@localhost:27017/reactome?authSource=admin',
  }
}
