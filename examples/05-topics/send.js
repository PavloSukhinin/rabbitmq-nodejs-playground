import { establishConnection } from "../connection/connection.js";

const { TOPIC_EXCHANGE_NAME = "topic_log" } = process.env;

const constructMessage = (message) =>
  Buffer.from(
    JSON.stringify({
      message,
    })
  );

const connection = await establishConnection();
const channel = await connection.createChannel();

await channel.assertExchange(TOPIC_EXCHANGE_NAME, "topic", { durable: false });

channel.publish(
  TOPIC_EXCHANGE_NAME,
  "credentialing.status",
  constructMessage({ status: "Credentialing Status message!" })
);

channel.publish(
  TOPIC_EXCHANGE_NAME,
  "credentialing.queue",
  constructMessage({ credQ: "Credentialing Queue message!" })
);

channel.publish(
  TOPIC_EXCHANGE_NAME,
  "credentialing.queue.info",
  constructMessage({
    credQ:
      "This message will purge, there is no consumer subscribed to that routing key!",
  })
);

channel.publish(
  TOPIC_EXCHANGE_NAME,
  "booker.notes.info",
  constructMessage({ foo: "Booker Notes Info message!" })
);

channel.publish(
  TOPIC_EXCHANGE_NAME,
  "booker.applicant.warn",
  constructMessage("Booker Applicant Warn message!")
);

await channel.close();

await connection.close();
