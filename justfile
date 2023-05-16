set export

default:
  @just --list

run-dev-server:
    #!/bin/zsh
    export MONGODB_ADMIN_USERNAME="admin"
    export MONGODB_ADMIN_PASSWORD="password"
    export MONGODB_URL="mongodb://$MONGODB_ADMIN_USERNAME:$MONGODB_ADMIN_PASSWORD@mongo:27017/"

    npx nodemon src/main.ts

setup-dev-container: set-up-zsh-environment install-node-modules

initialize-dev-container: set-environment

mongod-start:
    systemctl start mongod

mongod-status:
    systemctl status mongod

mongod-stop:
    systemctl stop mongod

[private]
set-environment:
    zsh scripts/set_environment.zsh

[private]
set-up-zsh-environment:
    zsh scripts/setup_zsh_environment.zsh

[private]
install-node-modules:
    npm i
