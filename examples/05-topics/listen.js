import { establishConnection } from "../connection/connection.js";

const { TOPIC_EXCHANGE_NAME = "topic_log" } = process.env;

const startConsumingCredentialing = async () => {
  const connection = await establishConnection();

  const channel = await connection.createChannel();

  await channel.assertExchange(TOPIC_EXCHANGE_NAME, "topic", {
    durable: false,
  });

  // Empty name means this queue will be created by the server with a random name.
  // An exclusive queue can only be used (consumed from, purged, deleted, etc) by its declaring connection.
  const queue = await channel.assertQueue("", { exclusive: true });

  await channel.bindQueue(queue.queue, TOPIC_EXCHANGE_NAME, "credentialing.*");

  const consumerTag = "Credentialing";
  channel.consume(queue.queue, (msg) => {
    console.log(
      ` [${consumerTag} consumer] ${
        msg.fields.routingKey
      }: '${msg.content.toString()}'`
    );
  });

  return { connection, channel, tag: consumerTag, queueName: queue.queue };
};

const startConsumingBooker = async () => {
  const connection = await establishConnection();

  const channel = await connection.createChannel();

  await channel.assertExchange(TOPIC_EXCHANGE_NAME, "topic", {
    durable: false,
  });

  const queue = await channel.assertQueue("", { exclusive: true });

  await channel.bindQueue(queue.queue, TOPIC_EXCHANGE_NAME, "booker.#");

  const consumerTag = "Booker";
  channel.consume(queue.queue, (msg) => {
    console.log(
      ` [${consumerTag} consumer] ${
        msg.fields.routingKey
      }: '${msg.content.toString()}'`
    );
  });

  return { connection, channel, tag: consumerTag, queueName: queue.queue };
};

const credentialingConsumer = await startConsumingCredentialing();
const bookerConsumer = await startConsumingBooker();

// To verify that queue cannot be purged from another connection, uncomment the following line.
// await bookerConsumer.channel.purgeQueue(credentialingConsumer.queueName);

process.once("SIGINT", async () => {
  for (const consumer of [credentialingConsumer, bookerConsumer]) {
    const { channel, connection, tag } = consumer;
    console.log(` [${tag}] Closing connection and channel.`);
    await channel.close();
    await connection.close();
  }
});

console.log(" [*] Waiting for messages. To exit press CTRL+C");
