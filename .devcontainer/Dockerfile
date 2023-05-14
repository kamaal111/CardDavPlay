FROM python:3.11-slim

RUN apt update && apt upgrade -y && apt install -y zsh git vim curl httpie

# Install Node.js
ARG NODE_VERSION
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - && apt install -y nodejs
