FROM rabbitmq:3.12.12-management

RUN apt-get update && apt-get install wget -y
RUN wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.12.0/rabbitmq_delayed_message_exchange-3.12.0.ez -P /opt/rabbitmq/plugins
RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange

RUN wget https://github.com/noxdafox/rabbitmq-message-deduplication/releases/download/0.6.2/rabbitmq_message_deduplication-0.6.2.ez -P /opt/rabbitmq/plugins
RUN wget https://github.com/noxdafox/rabbitmq-message-deduplication/releases/download/0.6.2/elixir-1.14.0.ez -P /opt/rabbitmq/plugins
RUN rabbitmq-plugins enable rabbitmq_message_deduplication
