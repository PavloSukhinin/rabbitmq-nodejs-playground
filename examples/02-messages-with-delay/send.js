import { establishConnection } from "../connection/connection.js";

const { HELLO_QUEUE_NAME = "hello" } = process.env;

const DELAYED_EXCHANGE_NAME = "delayed";
const MESSAGE_DELAY_MS = 5000;

const constructMessage = () =>
  Buffer.from(
    JSON.stringify({ message: `Hello World ${new Date().toISOString()}!` })
  );

const connection = await establishConnection();
const channel = await connection.createChannel();

await channel.assertQueue(HELLO_QUEUE_NAME, { durable: true });
await channel.assertExchange(DELAYED_EXCHANGE_NAME, "x-delayed-message", {
  autoDelete: false,
  durable: true,
  arguments: { "x-delayed-type": "direct" },
});
await channel.bindQueue(
  HELLO_QUEUE_NAME,
  DELAYED_EXCHANGE_NAME,
  HELLO_QUEUE_NAME
);

const message = constructMessage();
channel.publish(DELAYED_EXCHANGE_NAME, HELLO_QUEUE_NAME, message, {
  headers: { "x-delay": MESSAGE_DELAY_MS },
});
console.log(` [x] Sent '${message}'`);
await channel.close();

await connection.close();
