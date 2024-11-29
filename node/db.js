// import { Pool } from 'pg';
import pg from 'pg'
const { Pool } = pg

export async function init() {
  const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'node_saga',
    password: 'postgres',
    user: 'postgres',
    max: 10,
    idleTimeoutMillis: 0
  })

  pool.on('error', (e) => { console.log(e); })
  pool.on('connect', () => { console.log('connected'); })

  await pool.query(
    `
    create table if not exists
    logs (id int generated always as identity, log text);
  `)
  return pool
}

