set export

setup-dev-container:
    #!/bin/zsh

    zsh scripts/setup_zsh_environment.zsh
    python scripts/setup_virtual_env.py
