import { createServer } from 'http'
import { connect } from 'amqplib'

export const DEFAULT_QUEUE = 'default_queue'
export const DEFAULT_EXCHANGE = 'default_exchange'
export const DEFAULT_DEAD_QUEUE = 'default_dead_queue'
export const DEFAULT_DEAD_EXCHANGE = 'default_dead_exchange'

class RabbitManager {
  async init() {
    this.connection = await connect('amqp://user:pass@localhost:5672')
    this.channel = await this.connection.createChannel()

    await this.reset()

    await this.channel.assertExchange(DEFAULT_DEAD_EXCHANGE, 'direct', { durable: false })
    await this.channel.assertQueue(DEFAULT_DEAD_QUEUE, {
      durable: false,
      arguments: {
        'x-message-ttl': 10000,
        'x-dead-letter-exchange': DEFAULT_EXCHANGE,
        'x-dead-letter-routing-key': DEFAULT_QUEUE,
      }
    })
    await this.channel.bindQueue(DEFAULT_DEAD_QUEUE, DEFAULT_DEAD_EXCHANGE, DEFAULT_DEAD_QUEUE)

    await this.channel.assertExchange(DEFAULT_EXCHANGE, 'direct', { durable: false })
    await this.channel.assertQueue(DEFAULT_QUEUE, {
      durable: false,
      arguments: {
        'x-message-ttl': 10000,
        'x-dead-letter-exchange': DEFAULT_DEAD_EXCHANGE,
        'x-dead-letter-routing-key': DEFAULT_DEAD_QUEUE,
      }
    })
    await this.channel.bindQueue(DEFAULT_QUEUE, DEFAULT_EXCHANGE, DEFAULT_QUEUE)

    this.channel.consume(DEFAULT_DEAD_QUEUE, async msg => {
      console.log(msg);
    }, { noAck: false })
  }

  async reset() {
    await this.channel.deleteQueue(DEFAULT_DEAD_QUEUE)
    await this.channel.deleteExchange(DEFAULT_DEAD_EXCHANGE)
    await this.channel.deleteQueue(DEFAULT_QUEUE)
    await this.channel.deleteExchange(DEFAULT_EXCHANGE)
  }

  async defaultPublish() {
    this.channel.publish(DEFAULT_EXCHANGE, DEFAULT_QUEUE, Buffer.from("sin"))
  }

}

async function main() {
  const rabbitManager = new RabbitManager()
  await rabbitManager.init()

  createServer(async (req, res) => {
    if (req.url === '/pub') {
      await rabbitManager.defaultPublish()
      res.end('published')
      return;
    }

    res.end('')
  }).listen(3000, () => { console.log(`up on port ${3000}`); })
}

main().catch(e => { console.log('error starting main function: ', e) })