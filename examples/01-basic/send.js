import { establishConnection } from "../connection/connection.js";

const { HELLO_QUEUE_NAME = "hello" } = process.env;

const constructMessage = () =>
  Buffer.from(
    JSON.stringify({ message: `Hello World ${new Date().toISOString()}!` })
  );

const connection = await establishConnection();
const channel = await connection.createChannel();

await channel.assertQueue(HELLO_QUEUE_NAME, { durable: true });

const message = constructMessage();
channel.sendToQueue(HELLO_QUEUE_NAME, message);
console.log(` [x] Sent '${message}'`);
await channel.close();

await connection.close();
