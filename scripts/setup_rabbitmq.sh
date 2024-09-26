#!/bin/bash

# Update package list
sudo apt-get update

# Install Erlang (dependency for RabbitMQ)
sudo apt-get install -y erlang

# Add the official RabbitMQ repository and key
echo 'deb http://www.rabbitmq.com/debian/ testing main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list
wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add -

# Install RabbitMQ
sudo apt-get update
sudo apt-get install -y rabbitmq-server

# Enable and start RabbitMQ service
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server

# Enable the management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# Add a user (adjust 'myuser' and 'mypassword' as needed)
sudo rabbitmqctl add_user myuser mypassword
sudo rabbitmqctl set_user_tags myuser administrator
sudo rabbitmqctl set_permissions -p / myuser ".*" ".*" ".*"

# Delete default user
sudo rabbitmqctl delete_user guest

# Configure RabbitMQ logging
sudo tee /etc/rabbitmq/rabbitmq.conf <<EOF
log.dir = /var/log/rabbitmq
log.file = rabbit@localhost.log
log.file.level = debug
log.console.level = info
log.console = true
EOF

# Create log directory with proper permissions
sudo mkdir -p /var/log/rabbitmq
sudo chown -R rabbitmq:rabbitmq /var/log/rabbitmq

# Restart RabbitMQ to apply logging configuration
sudo systemctl restart rabbitmq-server

# Set up log rotation for RabbitMQ logs
sudo tee /etc/logrotate.d/rabbitmq <<EOF
/var/log/rabbitmq/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 rabbitmq rabbitmq
    sharedscripts
    postrotate
        /bin/systemctl reload rabbitmq-server > /dev/null
    endscript
}
EOF

echo "RabbitMQ setup and logging configuration complete."