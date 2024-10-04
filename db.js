const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pdvDeliveryDb',
    password: '22781',
    port: 5432,
});

module.exports = pool;

