# RabbitMQ playground

Prerequisites:
- Node.js version 20.x
- npm version 10.x
- Docker version 20.10+
- Docker compose version 1.29+

Note:
- AWS MQ does not support all plugins :smiling_face_with_tear:
[Click here to see a list of AWS RabbitMQ Plugins](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-basic-elements-plugins.html)

### Setup:
- Install packages 
  - `npm i`
- Make a copy of a `.env.example` file and name it `.env`. 
- Start RabbitMQ
  - `docker-compose up -d`
- Verify that it's running
  - open [RabbitMQ management panel](http://localhost:15672/)
  - default credentials are (can be changed in docker-compose.yml file, in the environment section):
    - Username: `user`
    - Password: `password`

To stop and remove docker containers run `docker-compose down`.

### Basic example:
- start consumer
  - `npm run 01:listen`
- open another shell/terminal and send message with
  - `npm run 01:send`
  - you can run this command several times to send new messages

The Consumer will log received messages and randomly Reject/Fulfill them. If the message is Rejected, the Consumer will try to process it again until it's Fulfilled.
Each message includes a timestamp - you can distinguish different messages by it. 

### Send messages with delay
- start consumer
  - `npm run 02:listen`
- open another shell/terminal and send message with
  - `npm run 02:send`
  - you can run this command several times to send new messages

The delay instructions are controlled with `x-delay` headers. In this example, it's set to 5 seconds; you can control it through the `MESSAGE_DELAY_MS` value in the `examples/02-messages-with-delay/send.js` file. 
The Consumer will log received messages and randomly Reject/Fulfill them. If the message is Rejected, the Consumer will try to process it again until it's Fulfilled.

More about [Scheduling Messages with RabbitMQ](https://www.rabbitmq.com/blog/2015/04/16/scheduling-messages-with-rabbitmq)


### The mix of delayed and instant messages
- start consumer
  - `npm run 03:listen`
- open another shell/terminal and send message with
  - `npm run 03:send`
  - you can run this command several times to send new messages

### Example of multiple workers 
- start consumer
  - `npm run 04:listen`
- open another shell/terminal and send message with
  - `npm run 04:send`
  - you can run this command several times to send new messages

This example sets several consumers and shows how messages are distributed between them. Some consumers simulate lengthy message processing.

### Topics subscription
- start consumer
  - `npm run 05:listen`
- open another shell/terminal and send message with
  - `npm run 05:send`
  - you can run this command several times to send new messages

This example sets two connections; each will consume messages from its topics. 
Additional things in example: 
- queue names are created by the RabbitMQ server. 
- queues are exclusive to its connection, uncomment [examples/05-topics/send.js](./examples/05-topics/send.js) file line 69 to see that one connection can't purge a queue declared in another connection.

### Queue level deduplication
- start consumer
  - `npm run 06:listen`
- open another shell/terminal and send message with
  - `npm run 06:send`
  - you can run this command several times to send new messages

Declares queue with the `"x-message-deduplication": true` parameter. Sends the same message to the queue two times, but the duplicate is filtered before it is published within a queue.
- [examples/06-messages-deduplication/send.js](./examples/06-messages-deduplication/send.js)
- [plugin page](https://github.com/noxdafox/rabbitmq-message-deduplication)


### TODO 
- add dead-letter queue example
- research how to track the number of the nack for a message.
