import { establishConnection } from "../connection/connection.js";

const { HELLO_QUEUE_NAME = "hello" } = process.env;

const connection = await establishConnection();
const channel = await connection.createChannel();

await channel.assertQueue(HELLO_QUEUE_NAME, { durable: true });

process.once("SIGINT", async () => {
  await channel.close();
  await connection.close();
});

await channel.consume(HELLO_QUEUE_NAME, (message) => {
  if (Math.random() > 0.5) {
    console.log(
      ` [x] Fulfilling ${message.content.toString()}. Now ${new Date().toISOString()}. Delivery tag: ${
        message.fields.deliveryTag
      }`
    );
    channel.ack(message);
  } else {
    console.log(
      ` [x] Rejecting ${message.content.toString()}. Now ${new Date().toISOString()}. Delivery tag: ${
        message.fields.deliveryTag
      }`
    );
    channel.nack(message);
  }
});

console.log(" [*] Waiting for messages. To exit press CTRL+C");
