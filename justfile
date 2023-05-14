set export

default:
  @just --list

run-radicale-server:
    . .venv/bin/activate
    radicale --storage-filesystem-folder=data/radicale/collections

setup-dev-container: set-up-zsh-environment install-node-modules

[private]
set-python-environment:
    python scripts/setup_virtual_env.py

[private]
set-up-zsh-environment:
    zsh scripts/setup_zsh_environment.zsh

[private]
install-node-modules:
    npm i