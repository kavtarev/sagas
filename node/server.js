import { createServer } from 'http'
import { init } from './db.js'
import { initRabbit } from './rabbit.js'

async function main() {
  const PORT = process.env.PORT
  if (!PORT) {
    throw 'Port not found'
  }

  const rabbitManager = await initRabbit()
  const pool = await init()

  createServer(async (req, res) => {
    if (req.url === '/pub') {
      await rabbitManager.defaultPublish()
      res.end('published')
      return;
    }

    const client = await pool.connect()
    let error;
    let status = 201;

    try {
      await client.query('BEGIN')
      await client.query('insert into logs (log) values($1)', [JSON.stringify(req.headers)])

      if (Math.random() > 0.8) {
        throw new Error('sudden death')
      }

      await client.query('COMMIT')
    } catch (e) {
      console.log('error in transaction: ', e);
      error = e
      status = 500;
      await client.query('ROLLBACK')
    } finally {
      client.release()
    }
    res.statusCode = status
    res.end(JSON.stringify({ error: error?.message || null }))
  }).listen(PORT, () => { console.log(`up on port ${PORT}`); })
}

main().catch(e => { console.log('error starting main function: ', e) })