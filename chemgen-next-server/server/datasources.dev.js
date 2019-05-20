'use strict'

// The dev datasource uses the docker compose instance to
// bootstrap the mysql and mongodb data with librarydata
// Experimental data is periodically pulled from the onyx server

// These all map to the docker-compose service names,
// database names, users, and passwords in the root folder of this project

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  arrayscanDS: {
    //This is the actual arrayscan database, which is an mssql db
    //Except that in my docker-compose instance its also an mysql db
    name: 'arrayscanDS',
    connector: 'mysql',
    host: 'arrayscan_mysql_db',
    port: 3306,
    database: 'arrayscan',
    user: 'arrayscan',
    password: 'password',
  },
  arrayscanMySQLDS: {
    //This is the mirror we have setup in mysql
    name: 'arrayscanMySQLDS',
    connector: 'mysql',
    host: 'arrayscan_mysql_db',
    port: 3306,
    database: 'arrayscan',
    user: 'arrayscan',
    password: 'password',
  },
  chemgenDS: {
    name: 'chemgenDS',
    connector: 'mysql',
    host: 'chemgen_next_dev_mysql_db',
    port: 3306,
    database: 'chemgen-next-dev',
    user: 'chemgen',
    password: 'password',
  },
  wordpressDS: {
    name: 'wordpressDS',
    // connector: 'memory',
    connector: 'mysql',
    // host: 'localhost',
    host: 'wordpress_db',
    // port: 3309,
    port: 3306,
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
    url: 'mongodb://root:password@chemgen_next_mongodb:27017/chemgen?authSource=admin',
    // url: 'mongodb://root:password@localhost:27017/chemgen?authSource=admin',
    // database: 'chemgen',
    // user: 'root',
    // password: 'password',
  },
  reactomeDS: {
    name: 'reactomeDS',
    connector: 'memory',
    // connector: 'mongodb',
    // port: 27017,
    // // url: 'mongodb://root:password@localhost:27017/reactome?authSource=admin',
    // url: 'mongodb://root:password@chemgen_next_mongodb:27017/reactome?authSource=admin',
  }
}
