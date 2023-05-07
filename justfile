set export

run-server:
    . .venv/bin/activate
    radicale --storage-filesystem-folder=data/radicale/collections

setup-dev-container:
    zsh scripts/setup_zsh_environment.zsh
    python scripts/setup_virtual_env.py
