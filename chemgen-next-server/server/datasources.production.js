'use strict'

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  arrayscanDS: {
    name: 'arrayscanDS',
    // connector: 'mssql',
    connector: process.env.ARRAYSCAN_CONNECTOR || 'mssql',
    // port: 1433,
    port: process.env.ARRAYSCAN_PORT || 1433,
    host: process.env.ARRAYSCAN_HOST,
    database: process.env.ARRAYSCAN_DB,
    user: process.env.ARRAYSCAN_USER,
    password: process.env.ARRAYSCAN_PASS,
  },
  arrayscanMySQLDS: {
    name: 'arrayscanMySQLDS',
    connector: process.env.ARRAYSCAN_MYSQL_CONNECTOR,
    port: process.env.ARRAYSCAN_MYSQL_PORT,
    host: process.env.ARRAYSCAN_MYSQL_HOST,
    database: process.env.ARRAYSCAN_MYSQL_DB,
    user: process.env.ARRAYSCAN_MYSQL_USER,
    password: process.env.ARRAYSCAN_MYSQL_PASS,
  },
  chemgenDS: {
    name: 'chemgenDS',
    connector: 'mysql',
    port: 3306,
    host: process.env.CHEMGEN_HOST,
    database: process.env.CHEMGEN_DB,
    user: process.env.CHEMGEN_USER,
    password: process.env.CHEMGEN_PASS,
  },
  wordpressDS: {
    name: 'wordpressDS',
    connector: 'mysql',
    host: process.env.WP_HOST,
    port: 3306,
    database: process.env.WP_DB,
    user: process.env.WP_USER,
    password: process.env.WP_PASS,
  },
  mongoDB: {
    name: 'mongoDB',
    connector: 'mongodb',
    port: 27017,
    url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}?authSource=admin`,
    // url: process.env.MONGO_URL,
    // database: process.env.MONGO_DB,
    // password: process.env.MONGO_PASS,
    // user: process.env.MONGO_USER
  },
  reactomeDS: {
    name: 'reactomeDS',
    connector: 'mongodb',
    port: 27017,
    url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:27017/reactome?authSource=admin`,
    // url: process.env.MONGO_URL,
    // database: process.env.MONGO_DB,
    // password: process.env.MONGO_PASS,
    // user: process.env.MONGO_USER
  }
}
