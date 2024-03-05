import { connect } from "amqplib";

const {
  RABBITMQ_HOSTNAME: host = "localhost",
  RABBITMQ_USERNAME: username = "user",
  RABBITMQ_PASSWORD: password = "password",
  RABBITMQ_AMQP_PORT,
} = process.env;

const port = parseInt(RABBITMQ_AMQP_PORT ?? "5672", 10);

const establishConnection = () => {
  return connect({
    hostname: host,
    port,
    protocol: "amqp",
    password,
    username,
  });
};

export { establishConnection };
