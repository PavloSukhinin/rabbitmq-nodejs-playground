import { establishConnection } from "../connection/connection.js";

const { HELLO_QUEUE_NAME = "hello" } = process.env;

const WORKERS_NUMBER = 3;

const connection = await establishConnection();

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// This is used to simulate processing time.
const processMessage = async (message, sleepMs) => {
  await sleep(sleepMs);

  return message;
};

const channel = await connection.createChannel();

await channel.assertQueue(HELLO_QUEUE_NAME, { durable: true });

process.once("SIGINT", async () => {
  await channel.close();
  await connection.close();
});

// This means that the channel won't receive more than one message at a time.
// Change the number to 2 and see how the messages are distributed among the consumers.
channel.prefetch(1);

const makeConsumer = (channelListener, queue, processMessage, sleepMs) => {
  channelListener.consume(queue, (message) => {
    console.log(` [${sleepMs}] Received message. ${new Date().toISOString()}`);
    processMessage(message, sleepMs)
      .then((m) => {
        console.log(
          ` [${sleepMs}] Fulfilling ${message.content.toString()}. Now ${new Date().toISOString()}. Delivery tag: ${
            message.fields.deliveryTag
          }`
        );
        channel.ack(m);
      })
      .catch((m) => {
        console.log(
          ` [${sleepMs}] Rejecting ${message.content.toString()}. Now ${new Date().toISOString()}. Delivery tag: ${
            message.fields.deliveryTag
          }`
        );
        channel.nack(m);
      });
  });
};

for (let i = 0; i < WORKERS_NUMBER; i++) {
  makeConsumer(channel, HELLO_QUEUE_NAME, processMessage, i * 1000);
}

console.log(" [*] Waiting for messages. To exit press CTRL+C");
