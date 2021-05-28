// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    // connection: {
    //   filename: './dev.sqlite3'
    // },
    connection: {
      database: '',
      user: 'root',
      password: ''
    },
    migrations: {
        tableName: 'knex_migrations'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'mysql',
    version: '12.4',
    connection: {
      // host : '',
      // user : '',
      // password : '',
      // database : 'dev'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
