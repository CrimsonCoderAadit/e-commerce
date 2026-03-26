const amqp = require('amqplib');

const EXCHANGE     = 'order_events';
const EXCHANGE_TYPE = 'topic';
const RETRY_MS     = 5000;

let channel = null;

async function connect() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    conn.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      channel = null;
      setTimeout(connect, RETRY_MS);
    });
    conn.on('close', () => {
      console.warn('RabbitMQ connection closed — reconnecting in 5s');
      channel = null;
      setTimeout(connect, RETRY_MS);
    });

    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connect failed:', err.message, '— retrying in 5s');
    channel = null;
    setTimeout(connect, RETRY_MS);
  }
}

async function publishEvent(routingKey, payload) {
  if (!channel) {
    console.warn('RabbitMQ channel not ready — event dropped:', routingKey);
    return;
  }
  const msg = Buffer.from(JSON.stringify(payload));
  channel.publish(EXCHANGE, routingKey, msg, { persistent: true });
}

module.exports = { connect, publishEvent };
