import { establishConnection } from "../connection/connection.js";

const { HELLO_QUEUE_NAME = "hello" } = process.env;

const DELAYED_EXCHANGE_NAME = "delayed";
const MESSAGE_DELAY_MS = 5000;
const INSTANT_MESSAGES_NUMBER = 5;

const constructMessage = (additionalText) =>
  Buffer.from(
    JSON.stringify({
      message: `Hello World ${new Date().toISOString()}!\n${additionalText}`,
    })
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

const delayedMessage = constructMessage("This message is delayed!");
channel.publish(DELAYED_EXCHANGE_NAME, HELLO_QUEUE_NAME, delayedMessage, {
  headers: { "x-delay": MESSAGE_DELAY_MS },
  persistent: true,
});
console.log(` [x] Sent '${delayedMessage}'`);

for (let i = 0; i < INSTANT_MESSAGES_NUMBER; i++) {
  const instantMessage = constructMessage(`[${i}] This message is instant!`);
  channel.sendToQueue(HELLO_QUEUE_NAME, instantMessage, { persistent: true });

  console.log(` [x] Sent '${instantMessage}'`);
}

await channel.close();

await connection.close();
