import { establishConnection } from "../connection/connection.js";
import { createHash } from "node:crypto";

const { DEDUPLICATION_QUEUE_NAME = "deduplication_queue" } = process.env;

const constructMessage = (message) =>
  Buffer.from(
    JSON.stringify({
      message,
    })
  );

const connection = await establishConnection();

const channel = await connection.createChannel();

await channel.assertQueue(DEDUPLICATION_QUEUE_NAME, {
  durable: true,
  arguments: { "x-message-deduplication": true },
});

const message = constructMessage("This message will not be deduplicated!");
const hash = createHash("sha256").update(message).digest("hex");

channel.sendToQueue(DEDUPLICATION_QUEUE_NAME, message, {
  headers: { "x-deduplication-header": hash },
});
console.log(` [x] Sent '${message}'`);

channel.sendToQueue(DEDUPLICATION_QUEUE_NAME, message, {
  headers: { "x-deduplication-header": hash },
});
console.log(` [x] Sent '${message}'`);

const secondMessage = constructMessage("This is another message!");
const secondHash = createHash("sha256").update(secondMessage).digest("hex");

channel.sendToQueue(DEDUPLICATION_QUEUE_NAME, secondMessage, {
  headers: { "x-deduplication-header": secondHash },
});
console.log(` [x] Sent '${secondMessage}'`);

await channel.close();

await connection.close();
