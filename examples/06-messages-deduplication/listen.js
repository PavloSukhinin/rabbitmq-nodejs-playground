import { establishConnection } from "../connection/connection.js";

const { DEDUPLICATION_QUEUE_NAME = "deduplication_queue" } = process.env;

const connection = await establishConnection();
const channel = await connection.createChannel();

await channel.assertQueue(DEDUPLICATION_QUEUE_NAME, {
  durable: true,
  arguments: { "x-message-deduplication": true },
});

channel.consume(DEDUPLICATION_QUEUE_NAME, (msg) => {
  console.log(`${msg.content.toString()}`);
  channel.ack(msg);
});

process.once("SIGINT", async () => {
  await channel.close();
  await connection.close();
});

console.log(" [*] Waiting for messages. To exit press CTRL+C");
