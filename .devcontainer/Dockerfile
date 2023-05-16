FROM debian:bullseye-slim

RUN apt update && apt upgrade -y && apt install -y zsh git vim curl httpie \
    # mongodb
    gnupg systemctl

# Install Node.js
ARG NODE_VERSION
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - && apt install -y nodejs

# Install mongodb client
ARG MONGODB_CLI_VERSION
RUN curl -fsSL https://pgp.mongodb.com/server-$MONGODB_CLI_VERSION.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-$MONGODB_CLI_VERSION.gpg \
    --dearmor
RUN touch /etc/apt/sources.list.d/mongodb-org-$MONGODB_CLI_VERSION.list
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-$MONGODB_CLI_VERSION.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/$MONGODB_CLI_VERSION main" | tee /etc/apt/sources.list.d/mongodb-org-$MONGODB_CLI_VERSION.list
RUN apt-get update && apt-get install -y mongodb-org
