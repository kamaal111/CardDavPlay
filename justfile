set export

default:
  @just --list

run-dev-server: mongod-start
    #!/bin/zsh
    export MONGODB_URL="mongodb://127.0.0.1:27017/contacts"
    export SERVER_PORT="3001"

    mkdir -p data/contacts
    npx nodemon src/main.ts

setup-dev-container: copy-to-container set-up-zsh-environment install-node-modules

initialize-dev-container: copy-git-config-from-outside-container set-environment

mongo-shell:
    mongosh contacts

mongod-start:
    systemctl start mongod

mongod-status:
    systemctl status mongod || true # When it's dead it doesn't mean that it's error

mongod-stop:
    systemctl stop mongod

[private]
set-environment:
    zsh scripts/set_environment.zsh

[private]
copy-git-config-from-outside-container:
    #!/bin/zsh
    cp -f ~/.gitconfig .devcontainer/.gitconfig

[private]
copy-to-container:
    #!/bin/zsh
    cp -f .devcontainer/.gitconfig ~/.gitconfig

[private]
set-up-zsh-environment:
    zsh scripts/setup_zsh_environment.zsh

[private]
install-node-modules:
    npm i
