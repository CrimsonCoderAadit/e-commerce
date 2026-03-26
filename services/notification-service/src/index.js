require('dotenv').config();
const amqp = require('amqplib');
const { sendOrderEmail } = require('./mailer');

const RABBITMQ_URL  = process.env.RABBITMQ_URL;
const EXCHANGE      = 'order_events';
const EXCHANGE_TYPE = 'topic';
const QUEUE         = 'notification_queue';
const ROUTING_KEY   = 'order.placed';
const RETRY_MS      = 5000;

async function connect() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);

    conn.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      setTimeout(connect, RETRY_MS);
    });
    conn.on('close', () => {
      console.warn('RabbitMQ connection closed — reconnecting in 5s');
      setTimeout(connect, RETRY_MS);
    });

    const channel = await conn.createChannel();

    // Assert exchange + queue, then bind
    await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    channel.prefetch(1);

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
        console.log(`📧 Processing order notification for order: ${payload.orderId}`);

        await sendOrderEmail(payload);

        channel.ack(msg);
      } catch (err) {
        console.error('Failed to process notification message:', err.message);
        channel.nack(msg, false, false); // discard — do not requeue to avoid poison-pill loop
      }
    });

    console.log('Notification service started — listening for order events');
  } catch (err) {
    console.error('RabbitMQ connect failed:', err.message, `— retrying in ${RETRY_MS / 1000}s`);
    setTimeout(connect, RETRY_MS);
  }
}

connect();
