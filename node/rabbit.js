import { connect } from 'amqplib'
import { wait } from './common.js'

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

    this.channel.consume(DEFAULT_QUEUE, async msg => {
      console.log('in dead');

      await wait(16000)

      console.log(msg.properties.headers['x-death']);

      if (msg.properties.headers['x-death'].length === 1) {
        console.log('11111111');

        this.channel.nack(msg, false, false)
      } else {
        console.log('2222222');

        this.channel.nack(msg, false, false)
      }
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

export async function initRabbit() {
  const rabbitManager = new RabbitManager()
  await rabbitManager.init()

  return rabbitManager
}
